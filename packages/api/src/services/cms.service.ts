import { db } from '../db';
import { cmsPages, cmsVersions, auditLogs } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { generatePublicId } from './id.service';

export const cmsService = {
  async listPages() {
    return await db.select().from(cmsPages).orderBy(cmsPages.slug);
  },

  async getPageBySlug(slug: string) {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    return page || null;
  },

  async getPageVersions(pageId: string) {
    return await db.select()
      .from(cmsVersions)
      .where(eq(cmsVersions.pageId, pageId))
      .orderBy(desc(cmsVersions.versionNumber));
  },

  async publishPageUpdate(slug: string, newContent: any, summary?: string, adminUserId?: string) {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    if (!page) {
      throw new Error(`CMS Page ${slug} not found`);
    }

    const nextVersion = (page.publishedVersion || 1) + 1;

    // 1. Update page
    const [updatedPage] = await db.update(cmsPages)
      .set({
        content: newContent,
        publishedVersion: nextVersion,
        status: 'PUBLISHED',
        updatedBy: adminUserId,
        updatedAt: new Date(),
      })
      .where(eq(cmsPages.id, page.id))
      .returning();

    // 2. Insert version snapshot
    await db.insert(cmsVersions).values({
      pageId: page.id,
      versionNumber: nextVersion,
      content: newContent,
      changeSummary: summary || `Published version v${nextVersion}`,
      publishedBy: adminUserId,
      publishedAt: new Date(),
    });

    // 3. Audit log
    await db.insert(auditLogs).values({
      actorId: adminUserId,
      action: 'CMS_PAGE_PUBLISH',
      entityType: 'CMS_PAGE',
      entityId: page.id,
      publicId: generatePublicId('AUD'),
      details: {
        slug,
        version: nextVersion,
        changeSummary: summary,
      }
    });

    return updatedPage;
  },

  async rollbackToVersion(slug: string, targetVersion: number, adminUserId?: string) {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    if (!page) throw new Error(`CMS Page ${slug} not found`);

    const versions = await db.select()
      .from(cmsVersions)
      .where(eq(cmsVersions.pageId, page.id));

    const target = versions.find(v => v.versionNumber === targetVersion);
    if (!target) throw new Error(`Version ${targetVersion} not found for page ${slug}`);

    const nextVersion = (page.publishedVersion || 1) + 1;

    const [updatedPage] = await db.update(cmsPages)
      .set({
        content: target.content,
        publishedVersion: nextVersion,
        updatedBy: adminUserId,
        updatedAt: new Date(),
      })
      .where(eq(cmsPages.id, page.id))
      .returning();

    await db.insert(cmsVersions).values({
      pageId: page.id,
      versionNumber: nextVersion,
      content: target.content,
      changeSummary: `Rollback to v${targetVersion}`,
      publishedBy: adminUserId,
      publishedAt: new Date(),
    });

    await db.insert(auditLogs).values({
      actorId: adminUserId,
      action: 'CMS_PAGE_ROLLBACK',
      entityType: 'CMS_PAGE',
      entityId: page.id,
      publicId: generatePublicId('AUD'),
      details: {
        slug,
        rolledBackTo: targetVersion,
        newVersion: nextVersion,
      }
    });

    return updatedPage;
  },

  // Public read endpoint for client pages
  async getPublicPageData(slug: string) {
    const [page] = await db.select({
      slug: cmsPages.slug,
      title: cmsPages.title,
      content: cmsPages.content,
      publishedVersion: cmsPages.publishedVersion,
      updatedAt: cmsPages.updatedAt,
    }).from(cmsPages).where(eq(cmsPages.slug, slug));
    return page || null;
  }
};
