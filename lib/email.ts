// Email notification service using Brevo API
// Uses direct fetch to avoid dependency issues with the Brevo SDK

const BREVO_API_KEY = process.env.BREVO_API_KEY
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@dhraverse.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Dhraverse'

interface EmailParams {
  to: string
  subject: string
  htmlContent: string
  textContent?: string
}

async function sendEmail({ to, subject, htmlContent, textContent }: EmailParams) {
  if (!BREVO_API_KEY) {
    console.log(`[Email Mock] Would send to ${to}: ${subject}`)
    return { success: false, reason: 'Brevo API key not configured' }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
      }),
    })

    if (response.ok) {
      console.log(`Email sent successfully to ${to}`)
      return { success: true }
    } else {
      const errorText = await response.text()
      console.error('Brevo API error:', errorText)
      return { success: false, error: errorText }
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Order confirmation email
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  total: number,
  currency: string
) {
  const subject = `Order Confirmed - #${orderId.slice(0, 8)}`
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Thank you for your order!</h2>
      <p>Dear ${customerName},</p>
      <p>Your order has been confirmed. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Order ID</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${orderId.slice(0, 8)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Total</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${currency} ${total.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Status</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Processing</td>
        </tr>
      </table>
      <p>We'll notify you when your order is shipped.</p>
      <p>Thank you for shopping with Dhraverse!</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `
  
  return sendEmail({
    to: customerEmail,
    subject,
    htmlContent,
    textContent: `Dear ${customerName}, your order #${orderId.slice(0, 8)} has been confirmed. Total: ${currency} ${total.toFixed(2)}. Thank you for shopping with Dhraverse!`
  })
}

// Payment confirmation email
export async function sendPaymentConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  amount: number,
  currency: string
) {
  const subject = `Payment Successful - #${orderId.slice(0, 8)}`
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Payment Confirmed!</h2>
      <p>Dear ${customerName},</p>
      <p>Your payment has been processed successfully.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Order ID</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${orderId.slice(0, 8)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Amount Paid</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${currency} ${amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Payment Status</td>
          <td style="padding: 10px; border: 1px solid #ddd; color: green;">Paid</td>
        </tr>
      </table>
      <p>Your order is now being processed.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `
  
  return sendEmail({
    to: customerEmail,
    subject,
    htmlContent,
    textContent: `Payment of ${currency} ${amount.toFixed(2)} for order #${orderId.slice(0, 8)} has been confirmed. Thank you!`
  })
}

// Order status update email
export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  newStatus: string
) {
  const statusMessages: Record<string, string> = {
    PROCESSING: 'Your order is being prepared',
    SHIPPED: 'Your order has been shipped',
    DELIVERED: 'Your order has been delivered',
    COMPLETED: 'Your order is complete',
    CANCELLED: 'Your order has been cancelled'
  }
  
  const subject = `Order Update - #${orderId.slice(0, 8)}`
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Order Status Update</h2>
      <p>Dear ${customerName},</p>
      <p>${statusMessages[newStatus] || 'Your order status has been updated'}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Order ID</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${orderId.slice(0, 8)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">New Status</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${newStatus}</td>
        </tr>
      </table>
      <p>Thank you for shopping with Dhraverse!</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `
  
  return sendEmail({
    to: customerEmail,
    subject,
    htmlContent,
    textContent: `Your order #${orderId.slice(0, 8)} status is now: ${newStatus}. ${statusMessages[newStatus] || ''}`
  })
}

// Review submitted confirmation email
export async function sendReviewConfirmationEmail(
  customerEmail: string,
  customerName: string,
  productName: string,
  rating: number
) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const subject = 'Thank you for your review!'
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Review Submitted</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for reviewing <strong>${productName}</strong>!</p>
      <p style="font-size: 24px; color: #f59e0b;">${stars}</p>
      <p>Your feedback helps other customers make informed decisions.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `
  
  return sendEmail({
    to: customerEmail,
    subject,
    htmlContent,
    textContent: `Thank you for reviewing ${productName}! Your rating: ${rating} stars. Your feedback helps other customers!`
  })
}