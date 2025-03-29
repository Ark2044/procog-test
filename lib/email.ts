import { messages } from '@/models/server/config'; // Replace 'messages' with the correct export

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Input validation
const validateEmailParams = (
  to: string,
  subject: string,
  reminderTitle: string
): { isValid: boolean; error?: string } => {
  if (!to || !subject || !reminderTitle) {
    return { isValid: false, error: "Missing required parameters" };
  }
  if (!EMAIL_REGEX.test(to)) {
    return { isValid: false, error: "Invalid email format" };
  }
  if (subject.length > 100) {
    return { isValid: false, error: "Subject too long (max 100 chars)" };
  }
  if (reminderTitle.length > 100) {
    return { isValid: false, error: "Title too long (max 100 chars)" };
  }
  return { isValid: true };
};

export const sendReminderEmail = async (
  to: string,
  subject: string,
  reminderTitle: string,
  reminderDescription?: string,
  riskId?: string
) => {
  try {
    if (!APP_URL) {
      console.error("NEXT_PUBLIC_APP_URL is not configured");
      throw new Error("NEXT_PUBLIC_APP_URL is not configured");
    }

    // Validate input parameters
    const validation = validateEmailParams(to, subject, reminderTitle);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    console.log('Attempting to send email to:', to);
    
    // Sanitize inputs for HTML
    const sanitizedTitle = reminderTitle.replace(/[<>]/g, '');
    const sanitizedDesc = reminderDescription?.replace(/[<>]/g, '');
    
    // Create HTML content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">${sanitizedTitle}</h1>
          ${sanitizedDesc ? `<p style="color: #374151;">${sanitizedDesc}</p>` : ""}
          <p style="color: #6B7280;">This is a reminder to review the risk.</p>
          ${
            riskId
              ? `
              <div style="margin: 20px 0;">
                  <a href="${APP_URL}/risk/${riskId}" 
                     style="background-color: #4F46E5; color: white; padding: 10px 20px; 
                            text-decoration: none; border-radius: 5px; display: inline-block;">
                      View Risk
                  </a>
              </div>
          `
              : ""
          }
          <hr style="border: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="color: #9CA3AF; font-size: 12px;">Sent by Procog Risk Management System</p>
      </div>
    `;

    // Create plain text version
    const text = `${reminderTitle}\n\n${reminderDescription || ''}\n\nThis is a reminder to review the risk.\n\n${riskId ? `View Risk: ${APP_URL}/risk/${riskId}` : ''}\n\nSent by Procog Risk Management System`;

    // Create email message using Appwrite Messages API
    const response = await messages.createEmail(
      'unique()',  // Message ID
      to,          // Recipient email
      subject,     // Email subject
      [html],      // HTML content (wrapped in an array)
      [text],      // Plain text content (wrapped in an array)
      ['wasnikaarush@gmail.com'], // From email (must be verified in Appwrite console)
      ['Procog Risk Management']   // From name
    );

    console.log('Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error("Failed to send reminder email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};
