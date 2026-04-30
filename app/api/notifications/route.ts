import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await getPrisma().notification.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, markAllRead } = await request.json()

    if (markAllRead) {
      // Mark all notifications as read
      await getPrisma().notification.updateMany({
        where: { userId: payload.userId, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    if (notificationId) {
      // Mark specific notification as read
      const notification = await getPrisma().notification.findFirst({
        where: { id: notificationId, userId: payload.userId },
      })

      if (!notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }

      await getPrisma().notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      })
      return NextResponse.json({ message: 'Notification marked as read' })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}