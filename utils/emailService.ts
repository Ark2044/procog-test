"use server";
import sgMail from "@sendgrid/mail";
import { users } from "@/models/server/config";
import { Query } from "appwrite";
import { Risk } from "@/types/Risk";
import { Comment } from "@/types/Comment";
import { Reminder } from "@/types/Reminder";

const MAX_USERS_PER_PAGE = 100;

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Optimized: Fetch all users and filter based on prefs.department
export const getUsersByDepartment = async (
  department: string
): Promise<{ email: string; name: string }[]> => {
  if (!department) {
    console.log("No department specified, skipping email notifications");
    return [];
  }

  const allUsers: { $id: string; email: string; name?: string }[] = [];
  let page = 0;

  try {
    // Step 1: Fetch all users with pagination
    while (true) {
      const response = await users.list([
        Query.limit(MAX_USERS_PER_PAGE),
        Query.offset(page * MAX_USERS_PER_PAGE),
      ]);

      allUsers.push(...response.users);
      if (response.users.length < MAX_USERS_PER_PAGE) break;
      page++;
    }

    // Step 2: Fetch each user's prefs and filter
    const filtered: { email: string; name: string }[] = [];

    for (const user of allUsers) {
      try {
        const prefs = await users.getPrefs(user.$id);

        if (
          user.email &&
          prefs.department === department &&
          prefs.receiveNotifications !== false
        ) {
          filtered.push({ email: user.email, name: user.name || "" });
        }
      } catch (err) {
        console.warn(`Could not fetch prefs for user ${user.$id}:`, err);
      }
    }

    return filtered;
  } catch (error) {
    console.error("Failed to fetch users by department:", error);
    return [];
  }
};

// Send risk email notification
export const sendRiskNotification = async (
  risk: Risk,
  action: "created" | "updated" | "closed"
): Promise<void> => {
  const recipients = await getUsersByDepartment(risk.department);

  if (!process.env.SENDGRID_FROM_EMAIL || recipients.length === 0) {
    console.log("No recipients or sender email configured");
    return;
  }

  try {
    let subject = "";
    let textContent = "";
    let htmlContent = "";

    switch (action) {
      case "created":
        subject = `New Risk Alert: ${risk.title}`;
        textContent = `
A new risk has been identified in your department (${risk.department}).

Title: ${risk.title}
Impact: ${risk.impact}
Probability: ${risk.probability}
Action: ${risk.action}
Description: ${risk.content}

Please review this risk in the risk management system.
        `;
        htmlContent = `
<h2>New Risk Alert</h2>
<p>A new risk has been identified in your department (${risk.department}).</p>
<p><strong>Title:</strong> ${risk.title}</p>
<p><strong>Impact:</strong> ${risk.impact}</p>
<p><strong>Probability:</strong> ${risk.probability}</p>
<p><strong>Action:</strong> ${risk.action}</p>
<p><strong>Description:</strong> ${risk.content}</p>
<p>Please <a href="${process.env.NEXT_PUBLIC_APP_URL}/risks/${risk.$id}">review this risk</a> in the risk management system.</p>
        `;
        break;

      case "updated":
        subject = `Risk Update: ${risk.title}`;
        textContent = `
A risk in your department (${risk.department}) has been updated.

Title: ${risk.title}
Impact: ${risk.impact}
Probability: ${risk.probability}
Action: ${risk.action}
Description: ${risk.content}

Please review the updated risk in the risk management system.
        `;
        htmlContent = `
<h2>Risk Update</h2>
<p>A risk in your department (${risk.department}) has been updated.</p>
<p><strong>Title:</strong> ${risk.title}</p>
<p><strong>Impact:</strong> ${risk.impact}</p>
<p><strong>Probability:</strong> ${risk.probability}</p>
<p><strong>Action:</strong> ${risk.action}</p>
<p><strong>Description:</strong> ${risk.content}</p>
<p>Please <a href="${process.env.NEXT_PUBLIC_APP_URL}/risks/${risk.$id}">review the updated risk</a> in the risk management system.</p>
        `;
        break;

      case "closed":
        subject = `Risk Closed: ${risk.title}`;
        textContent = `
A risk in your department (${risk.department}) has been closed.

Title: ${risk.title}
Resolution: ${risk.resolution}

The risk has been successfully addressed and closed in the risk management system.
        `;
        htmlContent = `
<h2>Risk Closed</h2>
<p>A risk in your department (${risk.department}) has been closed.</p>
<p><strong>Title:</strong> ${risk.title}</p>
<p><strong>Resolution:</strong> ${risk.resolution}</p>
<p>The risk has been successfully addressed and closed in the risk management system.</p>
<p>You can <a href="${process.env.NEXT_PUBLIC_APP_URL}/risks/${risk.$id}">view the details here</a>.</p>
        `;
        break;
    }

    for (const recipient of recipients) {
      const msg = {
        to: recipient.email,
        from: process.env.SENDGRID_FROM_EMAIL || "default@example.com",
        subject,
        text: textContent,
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`Risk ${action} email sent to ${recipient.email}`);
    }
  } catch (error) {
    console.error(`Failed to send risk ${action} email:`, error);
    if (
      error instanceof Error &&
      typeof (error as { response?: unknown }).response === "object"
    ) {
      if ((error as { response?: { body?: unknown } }).response?.body) {
        console.error(
          (error as { response?: { body?: unknown } }).response?.body ??
            "No response body available"
        );
      }
    }
  }
};

// Send comment notification
export const sendCommentNotification = async (
  comment: Comment,
  action: "reply" | "mention",
  parentComment?: Comment
): Promise<void> => {
  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.log("No sender email configured");
    return;
  }

  try {
    let subject = "";
    let textContent = "";
    let htmlContent = "";
    let recipientEmail = "";

    switch (action) {
      case "reply":
        if (!parentComment?.authorId) return;
        
        // Get parent comment author's email
        const parentAuthor = await users.get(parentComment.authorId);
        recipientEmail = parentAuthor.email;
        
        subject = `New reply to your comment`;
        textContent = `
${comment.authorName} replied to your comment:

Original comment:
${parentComment.content}

Reply:
${comment.content}

View the discussion here: ${process.env.NEXT_PUBLIC_APP_URL}/risks/${comment.riskId}
        `;
        htmlContent = `
<h2>New Reply to Your Comment</h2>
<p><strong>${comment.authorName}</strong> replied to your comment:</p>
<div style="background-color: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #ddd;">
  <p><em>Your comment:</em></p>
  <p>${parentComment.content}</p>
</div>
<div style="background-color: #f0f7ff; padding: 15px; margin: 10px 0; border-left: 4px solid #0066cc;">
  <p><em>Their reply:</em></p>
  <p>${comment.content}</p>
</div>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/risks/${comment.riskId}">View the discussion</a></p>
        `;
        break;

      case "mention":
        // Handle mentions (implementation depends on how mentions are stored)
        // This is a basic example
        const mentions = comment.mentions || [];
        for (const username of mentions) {
          try {
            const mentionedUser = await users.list([Query.equal("name", username)]);
            if (mentionedUser.users[0]?.email) {
              const msg = {
                to: mentionedUser.users[0].email,
                from: process.env.SENDGRID_FROM_EMAIL,
                subject: `You were mentioned in a comment`,
                text: `${comment.authorName} mentioned you in a comment:\n\n${comment.content}`,
                html: `
<h2>You Were Mentioned in a Comment</h2>
<p><strong>${comment.authorName}</strong> mentioned you:</p>
<div style="background-color: #f0f7ff; padding: 15px; margin: 10px 0; border-left: 4px solid #0066cc;">
  <p>${comment.content}</p>
</div>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/risks/${comment.riskId}">View the discussion</a></p>
                `,
              };
              await sgMail.send(msg);
            }
          } catch (err) {
            console.error(`Failed to send mention notification to ${username}:`, err);
          }
        }
        return;
    }

    if (recipientEmail) {
      const msg = {
        to: recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        text: textContent,
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`Comment ${action} email sent to ${recipientEmail}`);
    }
  } catch (error) {
    console.error(`Failed to send comment ${action} email:`, error);
  }
};

// Send reminder notification
export const sendReminderNotification = async (
  reminder: Reminder,
  action: "due" | "created" | "updated"
): Promise<void> => {
  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.log("No sender email configured");
    return;
  }

  try {
    const user = await users.get(reminder.userId);
    if (!user.email) {
      console.log("No recipient email found");
      return;
    }

    let subject = "";
    let textContent = "";
    let htmlContent = "";

    switch (action) {
      case "due":
        subject = `Reminder: ${reminder.title}`;
        textContent = `
Your reminder "${reminder.title}" is due soon.

Description: ${reminder.description || "No description provided"}
Due: ${new Date(reminder.datetime).toLocaleString()}
${reminder.recurrence !== "none" ? `\nRecurrence: ${reminder.recurrence}` : ""}

View your reminder: ${process.env.NEXT_PUBLIC_APP_URL}/reminders/${reminder.$id}
        `;
        htmlContent = `
<h2>Reminder Due Soon</h2>
<p>Your reminder "<strong>${reminder.title}</strong>" is due soon.</p>
<div style="background-color: #f0f7ff; padding: 15px; margin: 10px 0; border-left: 4px solid #0066cc;">
  <p><strong>Description:</strong> ${reminder.description || "No description provided"}</p>
  <p><strong>Due:</strong> ${new Date(reminder.datetime).toLocaleString()}</p>
  ${reminder.recurrence !== "none" ? `<p><strong>Recurrence:</strong> ${reminder.recurrence}</p>` : ""}
</div>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/reminders/${reminder.$id}">View your reminder</a></p>
        `;
        break;

      case "created":
      case "updated":
        const action_text = action === "created" ? "created" : "updated";
        subject = `Reminder ${action_text}: ${reminder.title}`;
        textContent = `
Your reminder has been ${action_text}:

Title: ${reminder.title}
Description: ${reminder.description || "No description provided"}
Due: ${new Date(reminder.datetime).toLocaleString()}
${reminder.recurrence !== "none" ? `Recurrence: ${reminder.recurrence}` : "One-time reminder"}

View your reminder: ${process.env.NEXT_PUBLIC_APP_URL}/reminders/${reminder.$id}
        `;
        htmlContent = `
<h2>Reminder ${action_text.charAt(0).toUpperCase() + action_text.slice(1)}</h2>
<p>Your reminder has been ${action_text}:</p>
<div style="background-color: #f0f7ff; padding: 15px; margin: 10px 0; border-left: 4px solid #0066cc;">
  <p><strong>Title:</strong> ${reminder.title}</p>
  <p><strong>Description:</strong> ${reminder.description || "No description provided"}</p>
  <p><strong>Due:</strong> ${new Date(reminder.datetime).toLocaleString()}</p>
  ${reminder.recurrence !== "none" ? `<p><strong>Recurrence:</strong> ${reminder.recurrence}</p>` : "<p><em>One-time reminder</em></p>"}
</div>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/reminders/${reminder.$id}">View your reminder</a></p>
        `;
        break;
    }

    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text: textContent,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`Reminder ${action} email sent to ${user.email}`);
  } catch (error) {
    console.error(`Failed to send reminder ${action} email:`, error);
  }
};
