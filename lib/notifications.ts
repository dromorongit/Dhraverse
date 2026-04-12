import { getPrisma } from '@/lib/prisma'

// Helper function to create notifications (used by other parts of the app)
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string
) {
  try {
    await getPrisma().notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
      },
    })
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}