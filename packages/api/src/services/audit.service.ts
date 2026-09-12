import { db } from '../db';
import { auditLogs } from '../db/schema';

export interface CreateAuditLogParams {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
}

export class AuditService {
  /**
   * Append an immutable record to the audit log.
   */
  static async record(params: CreateAuditLogParams) {
    try {
      const [entry] = await db.insert(auditLogs).values({
        actorId: params.actorId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details || null,
        ipAddress: params.ipAddress || null,
      }).returning();
      return entry;
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err);
      // Non-blocking: audit failure should not crash user operation, but must be logged
      return null;
    }
  }
}
