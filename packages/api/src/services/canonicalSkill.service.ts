import { db } from '../db';
import { skills, Skill } from '../db/schema';
import { ilike, or, eq, sql } from 'drizzle-orm';
import { AuditService } from './audit.service';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class CanonicalSkillService {
  /**
   * Resolve an input string (e.g. 'py', 'React.js', 'django-rest-framework')
   * to a Canonical Skill in the registry.
   */
  static async resolveSkill(rawInput: string): Promise<Skill | null> {
    const trimmed = rawInput.trim();
    if (!trimmed) return null;

    const slug = slugify(trimmed);

    // 1. Direct slug or name match (case-insensitive)
    const directMatch = await db.query.skills.findFirst({
      where: or(
        eq(skills.slug, slug),
        ilike(skills.name, trimmed)
      ),
    });

    if (directMatch) return directMatch;

    // 2. Alias match inside jsonb aliases array
    const allSkills = await db.query.skills.findMany({
      where: eq(skills.status, 'active'),
    });

    const normalizedQuery = trimmed.toLowerCase();
    const aliasMatch = allSkills.find((s) => {
      const aliases = (s.aliases as string[]) || [];
      return aliases.some(
        (a) => a.toLowerCase() === normalizedQuery || slugify(a) === slug
      );
    });

    return aliasMatch || null;
  }

  /**
   * Resolve multiple skill query strings at once.
   */
  static async resolveSkills(rawInputs: string[]): Promise<Skill[]> {
    const resolved: Skill[] = [];
    for (const input of rawInputs) {
      const skill = await this.resolveSkill(input);
      if (skill && !resolved.some((s) => s.id === skill.id)) {
        resolved.push(skill);
      }
    }
    return resolved;
  }

  /**
   * Find or create canonical skill (if admin or automated ingest)
   */
  static async findOrCreate(name: string, category: string = 'General', actorId?: string): Promise<Skill> {
    const existing = await this.resolveSkill(name);
    if (existing) return existing;

    const slug = slugify(name);
    const [created] = await db.insert(skills).values({
      name: name.trim(),
      slug,
      category,
      aliases: [slug],
      status: 'active',
    }).returning();

    await AuditService.record({
      actorId: actorId || null,
      action: 'CANONICAL_SKILL_CREATED',
      entityType: 'SKILL',
      entityId: created.id,
      details: { name: created.name, slug: created.slug, category: created.category },
    });

    return created;
  }

  /**
   * Get all canonical skills with usage count or categorization
   */
  static async listCanonical(): Promise<Skill[]> {
    return db.query.skills.findMany({
      where: eq(skills.status, 'active'),
      orderBy: (skills, { asc }) => [asc(skills.category), asc(skills.name)],
    });
  }
}
