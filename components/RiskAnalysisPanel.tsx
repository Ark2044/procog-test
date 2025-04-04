import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  AlertTriangle,
  Shield,
  Activity,
  Sparkles,
} from "lucide-react";
import { useRiskAnalysisStore } from "@/store/RiskAnalysis";
import { format } from "date-fns";

interface RiskAnalysisPanelProps {
  riskId: string;
  userId: string;
}

const AnalysisSkeleton = () => (
  <Card className="bg-white border border-gray-200">
    <CardHeader className="pb-2 p-4 sm:p-6">
      <Skeleton className="h-5 sm:h-6 w-1/2 mb-1" />
      <Skeleton className="h-3 sm:h-4 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
      <Skeleton className="h-12 sm:h-16 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 sm:h-4 w-full" />
        <Skeleton className="h-3 sm:h-4 w-full" />
        <Skeleton className="h-3 sm:h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 sm:h-4 w-full" />
        <Skeleton className="h-3 sm:h-4 w-full" />
        <Skeleton className="h-3 sm:h-4 w-3/4" />
      </div>
    </CardContent>
  </Card>
);

const RiskAnalysisPanel: React.FC<RiskAnalysisPanelProps> = ({
  riskId,
  userId,
}) => {
  const {
    currentAnalysis,
    loading,
    error,
    generateAnalysis,
    getAnalysisForRisk,
  } = useRiskAnalysisStore();
  const [isAnalysisLoaded, setIsAnalysisLoaded] = React.useState(false);

  React.useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const analysis = await getAnalysisForRisk(riskId, userId);
        setIsAnalysisLoaded(!!analysis);
      } catch (err) {
        console.error("Failed to load analysis:", err);
      }
    };

    loadAnalysis();
  }, [riskId, userId, getAnalysisForRisk]);

  const handleGenerateAnalysis = async () => {
    try {
      await generateAnalysis(riskId, userId);
      setIsAnalysisLoaded(true);
    } catch (err) {
      console.error("Failed to generate analysis:", err);
    }
  };

  if (loading) {
    return <AnalysisSkeleton />;
  }

  if (!isAnalysisLoaded) {
    return (
      <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-1 sm:gap-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
            AI Risk Analysis
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Generate an AI-powered analysis of this risk to gain deeper insights
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Use Gemini AI to analyze this risk and get personalized insights
            about:
          </p>
          <ul className="space-y-1 sm:space-y-2 mb-4 text-xs sm:text-sm">
            <li className="flex items-start gap-1 sm:gap-2">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>Key concerns hidden in the risk description</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Potential impact assessment and recommendations</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Custom mitigation strategies for your situation</span>
            </li>
          </ul>
          <Button
            onClick={handleGenerateAnalysis}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-xs sm:text-sm py-2 sm:py-4"
          >
            <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Generate Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-1 sm:gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <p className="text-red-700 text-sm sm:text-base">{error}</p>
          <Button
            variant="outline"
            onClick={handleGenerateAnalysis}
            className="mt-4 text-xs sm:text-sm"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentAnalysis) {
    return null;
  }

  return (
    <Card className="bg-white border border-indigo-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 p-4 sm:p-6 border-b border-gray-100">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-1 sm:gap-2">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
          AI Risk Analysis
        </CardTitle>
        <CardDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm">
          <span>Generated by Gemini AI</span>
          <span className="text-xs text-gray-500 mt-1 sm:mt-0">
            {currentAnalysis.created
              ? format(new Date(currentAnalysis.created), "MMM d, yyyy")
              : ""}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
            Summary
          </h3>
          <p className="text-xs sm:text-sm text-gray-700">
            {currentAnalysis.summary}
          </p>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2 flex items-center">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 mr-1" />
            Key Concerns
          </h3>
          <ul className="space-y-1 text-xs sm:text-sm">
            {currentAnalysis.keyConcerns.map((concern, index) => (
              <li
                key={index}
                className="text-gray-700 flex items-start gap-1 sm:gap-2"
              >
                <span className="text-amber-500 font-bold">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2 flex items-center">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-1" />
            Recommendations
          </h3>
          <ul className="space-y-1 text-xs sm:text-sm">
            {currentAnalysis.recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="text-gray-700 flex items-start gap-1 sm:gap-2"
              >
                <span className="text-blue-500 font-bold">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 text-right">
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] sm:text-xs px-2 py-1 h-auto sm:h-8"
            onClick={handleGenerateAnalysis}
          >
            <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
            Refresh Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAnalysisPanel;
