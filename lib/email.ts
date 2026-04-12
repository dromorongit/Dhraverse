// Email notification service using Brevo API
// Refined professional templates for Dhraverse Phase 8

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

// Base email template wrapper for consistent styling
function getEmailTemplate(content: string, footerText = '') {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dhraverse</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a2e;">Dhraverse</h1>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">The Smart Commerce Ecosystem</p>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                ${content}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 24px; border-top: 1px solid #e5e7eb; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                  ${footerText || 'This is an automated message from Dhraverse. Please do not reply to this email.'}
                </p>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                  &copy; 2026 Dhraverse. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `
}

// Order confirmation email - refined
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  total: number,
  currency: string
) {
  const subject = `Order Confirmed - #${orderId.slice(0, 8)}`
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a1a2e;">Thank you for your order!</h2>
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">Dear ${customerName},</p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">Your order has been confirmed and is being processed. Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; color: #374151;">Order ID</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1a1a2e;">#${orderId.slice(0, 8)}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; color: #374151;">Total Amount</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1a1a2e; font-weight: 600;">${currency} ${total.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; color: #374151;">Status</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;"><span style="background-color: #dbeafe; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Processing</span></td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">We'll notify you when your order is shipped. You can track your order status in your account.</p>
  `
  const htmlContent = getEmailTemplate(content, 'Questions? Contact us at support@dhraverse.com')
  
  return sendEmail({
    to: customerEmail,
    subject,
    htmlContent,
    textContent: `Dear ${customerName}, your order #${orderId.slice(0, 8)} has been confirmed. Total: ${currency} ${total.toFixed(2)}. Thank you for shopping with Dhraverse!`
  })
}

// Payment confirmation email - refined
export async function sendPaymentConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  amount: number,
  currency: string
) {
  const subject = `Payment Successful - #${orderId.slice(0, 8)}`
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a1a2e;">Payment Confirmed!</h2>
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">Dear ${customerName},</p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">Your payment has been processed successfully. Your order is now being prepared.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; color: #374151;">Order ID</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1a1a2e;">#${orderId.slice(0, 8)}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; color: #374151;">Amount Paid</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1a1a2e; font-weight: 600;">${currency} ${amount.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; color: #374151;">Payment Status</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;"><span style="background-color: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Paid</span></td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">Thank you for shopping with Dhraverse!</p>
  `
  const htmlContent = getEmailTemplate(content, 'Questions? Contact us at support@dhraverse.com')
  
  return sendEmail({
    to: customerEmail,
    subject,
    htmlContent,
    textContent: `Payment of ${currency} ${amount.toFixed(2)} for order #${orderId.slice(0, 8)} has been confirmed. Thank you!`
  })
}

// Order status update email - refined
export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  newStatus: string
) {
  const statusMessages: Record<string, string> = {
    PROCESSING: 'Your order is being prepared by the vendor.',
    SHIPPED: 'Your order has been shipped and is on its way.',
    DELIVERED: 'Your order has been delivered.',
    COMPLETED: 'Your order is complete. Thank you for shopping with us!',
    CANCELLED: 'Your order has been cancelled. A refund will be processed if applicable.'
  }
  
  const statusColors: Record<string, string> = {
    PROCESSING: '#1d4ed8',
    SHIPPED: '#7c3aed',
    DELIVERED: '#0891b2',
    COMPLETED: '#16a34a',
    CANCELLED: '#dc2626'
  }
  
  const statusBg: Record<string, string> = {
    PROCESSING: '#dbeafe',
    SHIPPED: '#ede9fe',
    DELIVERED: '#cffafe',
    COMPLETED: '#dcfce7',
    CANCELLED: '#fee2e2'
  }

  const subject = `Order Update - #${orderId.slice(0, 8)}`
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a1a2e;">Order Status Update</h2>
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">Dear ${customerName},</p>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; color: #374151;">Order ID</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1a1a2e;">#${orderId.slice(0, 8)}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; color: #374151;">New Status</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">
          <span style="background-color: ${statusBg[newStatus] || '#f3f4f6'}; color: ${statusColors[newStatus] || '#374151'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${newStatus}</span>
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">Thank you for shopping with Dhraverse!</p>
  `
  const htmlContent = getEmailTemplate(content, 'Questions? Contact us at support@dhraverse.com')
  
  return sendEmail({
    to: customerEmail,
    subject,
    htmlContent,
    textContent: `Your order #${orderId.slice(0, 8)} status is now: ${newStatus}. ${statusMessages[newStatus] || ''}`
  })
}

// Review submitted confirmation email - refined
export async function sendReviewConfirmationEmail(
  customerEmail: string,
  customerName: string,
  productName: string,
  rating: number
) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const subject = 'Thank you for your review!'
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a1a2e;">Thank You for Your Review!</h2>
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">Dear ${customerName},</p>
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">Thank you for reviewing <strong style="color: #1a1a2e;">${productName}</strong>!</p>
    <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 32px; color: #f59e0b;">${stars}</p>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">${rating} out of 5 stars</p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">Your feedback helps other customers make informed decisions and helps vendors improve their products.</p>
  `
  const htmlContent = getEmailTemplate(content)
  
  return sendEmail({
    to: customerEmail,
    subject,
    htmlContent,
    textContent: `Thank you for reviewing ${productName}! Your rating: ${rating} stars. Your feedback helps other customers!`
  })
}