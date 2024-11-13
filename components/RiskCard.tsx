import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paperclip, Clock, User } from "lucide-react";

interface RiskCardProps {
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  attachmentId?: string;
  impact: "low" | "medium" | "high";
  probability: number; // Now treated as a number from 0-5
  action: "mitigate" | "accept" | "transfer" | "avoid";
  mitigation?: string; // Add mitigation strategy prop
  created: string;
  updated: string;
}

const getImpactColor = (impact: "low" | "medium" | "high") => {
  switch (impact) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getActionColor = (
  action: "mitigate" | "accept" | "transfer" | "avoid"
) => {
  switch (action) {
    case "mitigate":
      return "bg-blue-100 text-blue-800";
    case "accept":
      return "bg-green-100 text-green-800";
    case "transfer":
      return "bg-purple-100 text-purple-800";
    case "avoid":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Function to get color for probability based on a numerical range (0-5)
const getProbabilityColor = (probability: number) => {
  if (probability >= 4) {
    return "bg-red-100 text-red-800"; // High probability
  } else if (probability >= 2) {
    return "bg-yellow-100 text-yellow-800"; // Medium probability
  }
  return "bg-green-100 text-green-800"; // Low probability
};

const RiskCard: React.FC<RiskCardProps> = ({
  title,
  content,
  authorId,
  tags,
  attachmentId,
  impact,
  probability,
  action,
  mitigation, // Include mitigation in props
  created,
  updated,
}) => {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={getImpactColor(impact)}>
              {impact} impact
            </Badge>
            <Badge variant="outline" className={getActionColor(action)}>
              {action}
            </Badge>
            <Badge
              variant="outline"
              className={getProbabilityColor(probability)}
            >
              Probability: {probability * 20}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{content}</p>

        {action === "mitigate" &&
          mitigation && ( // Display mitigation if action is mitigate
            <div className="mb-4">
              <strong>Mitigation Strategy:</strong>
              <p className="text-gray-600">{mitigation}</p>
            </div>
          )}

        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{authorId}</span>
          </div>

          <div className="flex items-center gap-1">
            {attachmentId && (
              <>
                <Paperclip className="w-4 h-4" />
                <span>Attachment</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Created: {new Date(created).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Updated: {new Date(updated).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskCard;
