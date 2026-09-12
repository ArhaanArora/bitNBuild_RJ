import { db } from '../db';
import { organizations, auditLogs } from '../db/schema';
import { desc, eq, ilike, or } from 'drizzle-orm';
import { generatePublicId } from './id.service';

export const organizationService = {
  async listOrganizations(search?: string, status?: string) {
    let query = db.select().from(organizations);
    
    if (status && status !== 'ALL') {
      // @ts-ignore
      query = query.where(eq(organizations.verificationStatus, status));
    }
    
    const results = await query.orderBy(desc(organizations.createdAt));
    
    if (search && search.trim()) {
      const s = search.toLowerCase();
      return results.filter(org => 
        org.name.toLowerCase().includes(s) || 
        org.publicId.toLowerCase().includes(s) ||
        (org.contactEmail && org.contactEmail.toLowerCase().includes(s))
      );
    }
    
    return results;
  },

  async getOrganization(idOrPublicId: string) {
    const isPublicId = idOrPublicId.startsWith('ORG-');
    if (isPublicId) {
      const [org] = await db.select().from(organizations).where(eq(organizations.publicId, idOrPublicId));
      return org;
    } else {
      const [org] = await db.select().from(organizations).where(eq(organizations.id, idOrPublicId));
      return org;
    }
  },

  async createOrganization(data: {
    name: string;
    type?: string;
    website?: string;
    contactEmail?: string;
    location?: string;
  }) {
    const pubId = generatePublicId('ORG');
    const [created] = await db.insert(organizations).values({
      publicId: pubId,
      name: data.name,
      type: data.type || 'Enterprise',
      website: data.website,
      contactEmail: data.contactEmail,
      location: data.location,
      verificationStatus: 'PENDING',
      riskScore: 15,
      aiVerificationNotes: {
        analyzedAt: new Date().toISOString(),
        automatedVerdict: 'PENDING_HUMAN_CONFIRMATION',
        domainSafety: 'CLEAN',
        note: 'New organization onboarded. Awaiting automated registry match & admin decision.'
      },
      humanDecision: 'PENDING',
    }).returning();

    return created;
  },

  async updateVerificationDecision(id: string, decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED', reviewerId?: string, reason?: string) {
    const newStatus = decision === 'APPROVED' ? 'VERIFIED' : (decision === 'REJECTED' ? 'REVOKED' : 'SUSPICIOUS');
    
    const [updated] = await db.update(organizations)
      .set({
        humanDecision: decision,
        verificationStatus: newStatus,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();

    if (updated) {
      await db.insert(auditLogs).values({
        actorId: reviewerId,
        action: `ORGANIZATION_${decision}`,
        entityType: 'ORGANIZATION',
        entityId: updated.id,
        publicId: generatePublicId('AUD'),
        details: {
          publicId: updated.publicId,
          name: updated.name,
          decision,
          reason: reason || 'Super Admin human decision applied',
        }
      });
    }

    return updated;
  }
};
