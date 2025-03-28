import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendReminderEmail = async (
  to: string,
  subject: string,
  reminderTitle: string,
  reminderDescription?: string,
  riskId?: string
) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const response = await resend.emails.send({
      from: "Procog Risk Management <risks@procog.dev>",
      to,
      subject,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4F46E5;">${reminderTitle}</h1>
                    ${reminderDescription ? `<p style="color: #374151;">${reminderDescription}</p>` : ""}
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
            `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Failed to send reminder email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};
