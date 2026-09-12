import { Router } from 'express';
import { db } from '../db';
import { notifications, users } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { AuditService } from '../services/audit.service';

export const notificationsRouter = Router();

// GET /api/notifications - List notifications for logged-in user (fallback to demo alex user if not authed)
notificationsRouter.get('/', async (req, res) => {
  try {
    let userId = (req as any).user?.id;
    if (!userId) {
      const defaultUser = await db.query.users.findFirst({
        where: eq(users.email, 'alex@demo.local'),
      });
      userId = defaultUser?.id;
    }

    if (!userId) {
      return res.json({ notifications: [], unreadCount: 0 });
    }

    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });

    const unreadCount = userNotifications.filter((n) => !n.isRead).length;

    res.json({
      notifications: userNotifications,
      unreadCount,
    });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark one notification as read
notificationsRouter.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, notification: updated });
  } catch (err: any) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications for user as read
notificationsRouter.patch('/read-all', async (req, res) => {
  try {
    let userId = (req as any).user?.id;
    if (!userId) {
      const defaultUser = await db.query.users.findFirst({
        where: eq(users.email, 'alex@demo.local'),
      });
      userId = defaultUser?.id;
    }

    if (!userId) {
      return res.json({ success: true, updatedCount: 0 });
    }

    const updated = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .returning();

    res.json({ success: true, updatedCount: updated.length });
  } catch (err: any) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// POST /api/notifications - Dispatch a notification
notificationsRouter.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, actionUrl, metadata } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields: userId, title, message' });
    }

    const [notification] = await db.insert(notifications).values({
      userId,
      type: type || 'SYSTEM_ALERT',
      title,
      message,
      actionUrl: actionUrl || null,
      metadata: metadata || null,
      isRead: false,
    }).returning();

    await AuditService.record({
      actorId: (req as any).user?.id || null,
      action: 'NOTIFICATION_DISPATCHED',
      entityType: 'NOTIFICATION',
      entityId: notification.id,
      details: { recipientId: userId, title, type },
    });

    res.status(201).json({ success: true, notification });
  } catch (err: any) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});
