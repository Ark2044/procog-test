import { format } from "date-fns";

interface Comment {
  id: string;
  author: string;
  content: string;
  created: string;
  votes?: number;
}

interface WebReference {
  url: string;
  description: string;
  score: number;
}

interface AnalysisResult {
  summary: string;
  keyConcerns: string[];
  recommendations: string[];
}

interface RiskReportData {
  riskId: string;
  title: string;
  content: string;
  authorName: string;
  impact: "low" | "medium" | "high";
  probability: number;
  action: "mitigate" | "accept" | "transfer" | "avoid";
  actionDetails?: string; // mitigation, acceptance, transfer, or avoidance details
  tags: string[];
  created: string;
  closed: string; // When the risk was closed
  resolution: string;
  department?: string;
  attachmentId?: string;
  // New comprehensive fields
  comments?: Comment[];
  webReferences?: WebReference[];
  analysis?: AnalysisResult;
}

/**
 * Generates HTML content for the risk report
 */
export const generateRiskReportHTML = (data: RiskReportData): string => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getImpactLabel = (impact: "low" | "medium" | "high") => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };
    return labels[impact] || "Unknown";
  };

  const getPriorityLabel = (
    impact: "low" | "medium" | "high",
    probability: number
  ) => {
    const impactValue = { low: 1, medium: 2, high: 3 }[impact] || 0;
    const riskPriority = impactValue * probability;

    if (riskPriority >= 10) return "Critical";
    if (riskPriority >= 6) return "High";
    if (riskPriority >= 3) return "Medium";
    return "Low";
  };

  const getActionLabel = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  const actionStrategy = data.actionDetails || "No strategy details provided";
  const actionTitle =
    {
      mitigate: "Mitigation Strategy",
      accept: "Acceptance Rationale",
      transfer: "Transfer Mechanism",
      avoid: "Avoidance Approach",
    }[data.action] || "Strategy";

  // Generate HTML for the report
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Risk Report: ${data.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .report-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 22px;
          margin-bottom: 5px;
        }
        .timestamp {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #4f46e5;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
        }
        .info-value {
          padding: 8px;
          background-color: #f9f9f9;
          border-radius: 4px;
          font-size: 14px;
        }
        .tag {
          display: inline-block;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-right: 5px;
          margin-bottom: 5px;
        }
        .resolution {
          background-color: #ecfdf5;
          border: 1px solid #d1fae5;
          border-radius: 4px;
          padding: 15px;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
          margin-right: 5px;
        }
        .impact-high {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        .impact-medium {
          background-color: #fef3c7;
          color: #92400e;
        }
        .impact-low {
          background-color: #d1fae5;
          color: #065f46;
        }
        .priority-critical {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        .priority-high {
          background-color: #feedca;
          color: #c2410c;
        }
        .priority-medium {
          background-color: #fef3c7;
          color: #92400e;
        }
        .priority-low {
          background-color: #d1fae5;
          color: #065f46;
        }
        .comment {
          margin-bottom: 15px;
          padding: 12px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .comment-author {
          font-weight: bold;
          color: #4f46e5;
        }
        .comment-date {
          color: #64748b;
        }
        .comment-content {
          font-size: 14px;
        }
        .comment-votes {
          color: #64748b;
          font-size: 12px;
          margin-top: 6px;
          text-align: right;
        }
        .reference {
          margin-bottom: 10px;
          padding: 10px;
          background-color: #fafafa;
          border: 1px solid #eaeaea;
          border-radius: 6px;
        }
        .reference-url {
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 4px;
        }
        .reference-desc {
          font-size: 13px;
          margin-bottom: 4px;
        }
        .reference-score {
          font-size: 12px;
          color: #64748b;
        }
        .analysis-item {
          margin-bottom: 4px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <div class="logo">PROCOG</div>
        <h1 class="report-title">Risk Report: ${data.title}</h1>
        <div class="timestamp">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Risk Overview</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Risk ID</span>
            <div class="info-value">${data.riskId}</div>
          </div>
          <div class="info-item">
            <span class="info-label">Author</span>
            <div class="info-value">${data.authorName}</div>
          </div>
          <div class="info-item">
            <span class="info-label">Created</span>
            <div class="info-value">${formatDate(data.created)}</div>
          </div>
          <div class="info-item">
            <span class="info-label">Closed</span>
            <div class="info-value">${formatDate(data.closed)}</div>
          </div>
          ${
            data.department
              ? `
          <div class="info-item">
            <span class="info-label">Department</span>
            <div class="info-value">${data.department}</div>
          </div>
          `
              : ""
          }
          <div class="info-item">
            <span class="info-label">Status</span>
            <div class="info-value">Closed</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Risk Assessment</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Impact</span>
            <div class="info-value">
              <span class="badge impact-${data.impact}">${getImpactLabel(
    data.impact
  )}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">Probability</span>
            <div class="info-value">${data.probability * 20}%</div>
          </div>
          <div class="info-item">
            <span class="info-label">Priority</span>
            <div class="info-value">
              <span class="badge priority-${getPriorityLabel(
                data.impact,
                data.probability
              ).toLowerCase()}">${getPriorityLabel(
    data.impact,
    data.probability
  )}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">Action</span>
            <div class="info-value">${getActionLabel(data.action)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Description</div>
        <div class="info-value" style="margin-bottom: 15px;">${
          data.content
        }</div>
      </div>

      <div class="section">
        <div class="section-title">${actionTitle}</div>
        <div class="info-value" style="margin-bottom: 15px;">${actionStrategy}</div>
      </div>

      ${
        data.tags && data.tags.length > 0
          ? `
      <div class="section">
        <div class="section-title">Tags</div>
        <div>
          ${data.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </div>
      `
          : ""
      }

      <div class="section">
        <div class="section-title">Resolution</div>
        <div class="resolution">
          ${data.resolution || "No resolution provided"}
        </div>
      </div>

      ${
        data.analysis
          ? `
      <div class="section page-break">
        <div class="section-title">Risk Analysis</div>
        <div class="info-value" style="margin-bottom: 15px;">
          <strong>Summary:</strong> ${data.analysis.summary}
        </div>
        
        <div style="margin-top: 15px;">
          <div style="font-weight: bold; margin-bottom: 8px;">Key Concerns:</div>
          <ul>
            ${data.analysis.keyConcerns
              .map((concern) => `<li class="analysis-item">${concern}</li>`)
              .join("")}
          </ul>
        </div>
        
        <div style="margin-top: 15px;">
          <div style="font-weight: bold; margin-bottom: 8px;">Recommendations:</div>
          <ul>
            ${data.analysis.recommendations
              .map(
                (recommendation) =>
                  `<li class="analysis-item">${recommendation}</li>`
              )
              .join("")}
          </ul>
        </div>
      </div>
      `
          : ""
      }

      ${
        data.webReferences && data.webReferences.length > 0
          ? `
      <div class="section ${!data.analysis ? "page-break" : ""}">
        <div class="section-title">References & Resources</div>
        <div>
          ${data.webReferences
            .map(
              (ref) => `
            <div class="reference">
              <div class="reference-url">${new URL(ref.url).hostname.replace(
                "www.",
                ""
              )}</div>
              <div class="reference-desc">${ref.description}</div>
              <div class="reference-score">Relevance: ${Math.round(
                ref.score * 100
              )}%</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      `
          : ""
      }

      ${
        data.comments && data.comments.length > 0
          ? `
      <div class="section ${
        !data.analysis && !data.webReferences ? "page-break" : ""
      }">
        <div class="section-title">Discussion Comments</div>
        <div>
          ${data.comments
            .map(
              (comment) => `
            <div class="comment">
              <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${formatDate(comment.created)}</span>
              </div>
              <div class="comment-content">${comment.content}</div>
              ${
                comment.votes !== undefined
                  ? `<div class="comment-votes">${comment.votes} ${
                      comment.votes === 1 ? "vote" : "votes"
                    }</div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      `
          : ""
      }

      <div class="footer">
        <p>This document is confidential and intended for authorized users only.</p>
        <p>© ${new Date().getFullYear()} PROCOG Risk Management System</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Helper function to download HTML content as a PDF
 * Note: This uses the browser's print functionality as a simple solution
 * For a production app, you might want to use a library like jsPDF or server-side PDF generation
 */
export const downloadRiskReportAsPDF = (
  html: string,
  filename: string
): void => {
  // Create a new window to print from
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download the report");
    return;
  }

  // Write the HTML to the new window
  printWindow.document.write(html);
  printWindow.document.close();

  // Set the document title to the filename for better print naming
  printWindow.document.title = filename;

  // Wait for content to be loaded
  printWindow.onload = () => {
    try {
      // Trigger print
      printWindow.print();

      // Close the window after print dialog closes
      // Note: This might not work in all browsers due to security restrictions
      setTimeout(() => {
        printWindow.close();
      }, 500);
    } catch (error) {
      console.error("Error printing document:", error);
      printWindow.close();
    }
  };
};
