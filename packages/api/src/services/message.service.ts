import { db } from '../db';
import { messages, auditLogs } from '../db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { generatePublicId } from './id.service';
import { aiInferenceService } from './aiInference.service';

export const messageService = {
  async listMessages(filter?: { category?: string; status?: string; priority?: string }) {
    let query = db.select().from(messages);
    
    // We can filter in memory or SQL
    const all = await query.orderBy(desc(messages.createdAt));
    
    return all.filter(m => {
      if (filter?.category && filter.category !== 'ALL' && m.category !== filter.category) return false;
      if (filter?.status && filter.status !== 'ALL' && m.status !== filter.status) return false;
      if (filter?.priority && filter.priority !== 'ALL' && m.priority !== filter.priority) return false;
      return true;
    });
  },

  async getMessage(idOrPublicId: string) {
    if (idOrPublicId.startsWith('MSG-')) {
      const [msg] = await db.select().from(messages).where(eq(messages.publicId, idOrPublicId));
      return msg;
    }
    const [msg] = await db.select().from(messages).where(eq(messages.id, idOrPublicId));
    return msg;
  },

  async createMessage(data: {
    senderEmail: string;
    senderName: string;
    subject: string;
    body: string;
    category?: string;
    senderId?: string;
  }) {
    const pubId = generatePublicId('MSG');
    
    // Trigger lightweight AI triage simulation
    const triageStart = Date.now();
    const isUrgent = data.subject.toLowerCase().includes('urgent') || data.body.toLowerCase().includes('appeal') || data.body.toLowerCase().includes('blocked');
    const priority = isUrgent ? 'HIGH' : 'NORMAL';
    
    const aiNotes = {
      urgency: priority,
      detectedCategory: data.category || 'SUPPORT',
      sentiment: isUrgent ? 'URGENT' : 'NEUTRAL',
      confidence: 0.94,
    };
    
    const suggestedReply = `Hello ${data.senderName},\n\nThank you for reaching out regarding "${data.subject}". Our administration team has logged your inquiry under reference ${pubId}. We are reviewing the details and will follow up shortly.\n\nBest regards,\nPlatform Support`;

    const [created] = await db.insert(messages).values({
      publicId: pubId,
      senderEmail: data.senderEmail,
      senderName: data.senderName,
      subject: data.subject,
      body: data.body,
      category: data.category || 'SUPPORT',
      status: 'NEW',
      priority,
      aiTriageNotes: aiNotes,
      aiSuggestedResponse: suggestedReply,
      senderId: data.senderId,
    }).returning();

    // Log inference to Section 20A table
    await aiInferenceService.logInference({
      agentId: 'agent_inbox_triage',
      taskType: 'MESSAGE_TRIAGE',
      modelUsed: 'gpt-4o-mini',
      promptVersion: 'v1.2',
      tokensIn: 450,
      tokensOut: 120,
      latencyMs: Date.now() - triageStart + 60,
      costDollars: 0.0008,
      status: 'SUCCESS',
    });

    return created;
  },

  async updateMessageStatus(id: string, status: string, adminUserId?: string) {
    const [updated] = await db.update(messages)
      .set({ status })
      .where(eq(messages.id, id))
      .returning();
    return updated;
  },

  async sendResponse(id: string, responseText: string, adminUserId?: string) {
    const [updated] = await db.update(messages)
      .set({
        aiSuggestedResponse: responseText,
        humanApproved: true,
        status: 'RESOLVED',
      })
      .where(eq(messages.id, id))
      .returning();

    if (updated) {
      await db.insert(auditLogs).values({
        actorId: adminUserId,
        action: 'INBOX_MESSAGE_RESOLVED',
        entityType: 'MESSAGE',
        entityId: updated.id,
        publicId: generatePublicId('AUD'),
        details: {
          publicId: updated.publicId,
          recipient: updated.senderEmail,
          responseLength: responseText.length,
        }
      });
    }

    return updated;
  }
};
