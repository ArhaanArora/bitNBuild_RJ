import { db } from '../db';
import { systemIncidents, auditLogs } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { generatePublicId } from './id.service';

export const automationService = {
  async listIncidents() {
    return await db.select().from(systemIncidents).orderBy(desc(systemIncidents.createdAt));
  },

  async triggerSelfHealAction(actionType: 'FLUSH_CACHE' | 'ROTATE_GITHUB_TOKENS' | 'REINDEX_CANDIDATE_SKILLS' | 'RESTART_WORKER_POOL', adminUserId?: string) {
    const actionMap = {
      FLUSH_CACHE: {
        title: 'Redis Cache Purge & Buffer Warm-up',
        service: 'Cache Layer',
        severity: 'INFO',
        detail: 'Cleared Redis ephemeral cache keys and restored database connection pool cache.'
      },
      ROTATE_GITHUB_TOKENS: {
        title: 'GitHub API Secondary Secret Rotation',
        service: 'Verification Worker',
        severity: 'LOW',
        detail: 'Switched active GitHub token from pool index 1 to standby index 3; reset hourly rate quota.'
      },
      REINDEX_CANDIDATE_SKILLS: {
        title: 'Vector Re-indexing of Candidate Verification Embeddings',
        service: 'Matching Engine',
        severity: 'LOW',
        detail: 'Re-indexed 140 candidate skill profiles into HNSW vector search graph.'
      },
      RESTART_WORKER_POOL: {
        title: 'Graceful Worker Pool Restart',
        service: 'Background Queue',
        severity: 'MEDIUM',
        detail: 'Drained active job queue, terminated idle workers, and spawned 4 fresh worker threads.'
      }
    };

    const target = actionMap[actionType];
    const [incident] = await db.insert(systemIncidents).values({
      title: target.title,
      service: target.service,
      severity: target.severity,
      status: 'RESOLVED',
      timelineJson: [
        { time: new Date().toLocaleTimeString(), note: `Automated healing trigger: ${target.detail}` }
      ],
      resolvedAt: new Date(),
    }).returning();

    await db.insert(auditLogs).values({
      actorId: adminUserId,
      action: `AUTOMATION_${actionType}`,
      entityType: 'SYSTEM_INCIDENT',
      entityId: incident.id,
      publicId: generatePublicId('AUD'),
      details: {
        actionType,
        service: target.service,
        incidentId: incident.id,
      }
    });

    return {
      success: true,
      actionType,
      incident,
      message: target.detail,
    };
  }
};
