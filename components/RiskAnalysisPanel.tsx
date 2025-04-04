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
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-1/2 mb-1" />
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
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
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Risk Analysis
          </CardTitle>
          <CardDescription>
            Generate an AI-powered analysis of this risk to gain deeper insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Use Gemini AI to analyze this risk and get personalized insights
            about:
          </p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
              <span>Key concerns hidden in the risk description</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <span>Potential impact assessment and recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <span>Custom mitigation strategies for your situation</span>
            </li>
          </ul>
          <Button
            onClick={handleGenerateAnalysis}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{error}</p>
          <Button
            variant="outline"
            onClick={handleGenerateAnalysis}
            className="mt-4"
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
      <CardHeader className="pb-2 border-b border-gray-100">
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Risk Analysis
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Generated by Gemini AI</span>
          <span className="text-xs text-gray-500">
            {currentAnalysis.created
              ? format(new Date(currentAnalysis.created), "MMM d, yyyy")
              : ""}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Summary</h3>
          <p className="text-gray-700">{currentAnalysis.summary}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
            Key Concerns
          </h3>
          <ul className="space-y-1">
            {currentAnalysis.keyConcerns.map((concern, index) => (
              <li key={index} className="text-gray-700 flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <Shield className="h-4 w-4 text-blue-500 mr-1" />
            Recommendations
          </h3>
          <ul className="space-y-1">
            {currentAnalysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700 flex items-start gap-2">
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
            className="text-xs"
            onClick={handleGenerateAnalysis}
          >
            <Activity className="h-3 w-3 mr-1" />
            Refresh Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAnalysisPanel;
