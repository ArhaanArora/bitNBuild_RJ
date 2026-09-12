import { db } from '../db';
import { featureFlags, auditLogs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generatePublicId } from './id.service';

export const featureFlagsService = {
  async listFlags() {
    return await db.select().from(featureFlags).orderBy(featureFlags.key);
  },

  async toggleFlag(key: string, enabled: boolean, adminUserId?: string) {
    const [updated] = await db.update(featureFlags)
      .set({ enabled, updatedAt: new Date() })
      .where(eq(featureFlags.key, key))
      .returning();

    if (updated) {
      await db.insert(auditLogs).values({
        actorId: adminUserId,
        action: `FEATURE_FLAG_${enabled ? 'ENABLED' : 'DISABLED'}`,
        entityType: 'FEATURE_FLAG',
        entityId: updated.id,
        publicId: generatePublicId('AUD'),
        details: {
          flagKey: key,
          enabled,
        }
      });
    }

    return updated;
  },

  async updateRollout(key: string, percentage: number, adminUserId?: string) {
    const [updated] = await db.update(featureFlags)
      .set({ rolloutPercentage: percentage, updatedAt: new Date() })
      .where(eq(featureFlags.key, key))
      .returning();

    if (updated) {
      await db.insert(auditLogs).values({
        actorId: adminUserId,
        action: 'FEATURE_FLAG_ROLLOUT_UPDATED',
        entityType: 'FEATURE_FLAG',
        entityId: updated.id,
        publicId: generatePublicId('AUD'),
        details: {
          flagKey: key,
          rolloutPercentage: percentage,
        }
      });
    }

    return updated;
  }
};
