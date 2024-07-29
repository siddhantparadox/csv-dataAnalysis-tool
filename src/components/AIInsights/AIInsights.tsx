import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { getDataInsights, getCustomAnalysis } from "../../services/aiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  detectColumnTypes,
  calculateColumnStats,
} from "../../services/analysisService";
import {
  AlertCircle,
  Lightbulb,
  TrendingUp,
  LineChart,
  FileQuestion,
  Building,
  Database,
  BarChart,
  PlusSquare,
  FlaskConical,
} from "lucide-react";

interface InsightSection {
  title: string;
  content: string[];
  icon: React.ReactNode;
  color: string;
}

const AIInsights: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);
  const [insights, setInsights] = useState<InsightSection[] | null>(null);
  const [customAnalysis, setCustomAnalysis] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setLoading(true);
    const columnTypes = detectColumnTypes(parsedData);
    const numericColumns = Object.entries(columnTypes)
      .filter(([_, type]) => type === "numeric")
      .map(([column, _]) => column);

    const stats = numericColumns.reduce((acc, column) => {
      acc[column] = calculateColumnStats(parsedData, column);
      return acc;
    }, {} as Record<string, any>);

    const analysisResults = JSON.stringify({
      columnTypes,
      stats,
      rowCount: parsedData.length,
      columnCount: Object.keys(parsedData[0]).length,
    });

    const aiInsightsText = await getDataInsights(parsedData, analysisResults);
    const parsedInsights = parseInsights(aiInsightsText);
    setInsights(parsedInsights);
    setLoading(false);
  };

  const cleanText = (text: string): string => {
    return text
      .replace(/\*\*/g, "") // Remove double asterisks
      .replace(/\*/g, "") // Remove single asterisks
      .replace(/^-\s*/gm, "") // Remove leading dashes for bullet points
      .trim();
  };

  const parseInsights = (text: string): InsightSection[] => {
    const sections = text.split("##").filter((s) => s.trim());
    return sections.map((section) => {
      const [title, ...content] = section.split("\n").filter((s) => s.trim());
      return {
        title: cleanText(title),
        content: content.map((c) => {
          const cleanedText = cleanText(c);
          return cleanedText.replace(/^\d+\.\s*/, "").trim();
        }),
        icon: getIconForSection(title),
        color: getColorForSection(title),
      };
    });
  };

  const getIconForSection = (title: string) => {
    switch (true) {
      case /Key Insights/.test(title):
        return <Lightbulb />;
      case /Correlations/.test(title):
        return <TrendingUp />;
      case /Anomalies/.test(title):
        return <AlertCircle />;
      case /Patterns/.test(title):
        return <LineChart />;
      case /Additional Analyses/.test(title):
        return <FileQuestion />;
      case /Business Implications/.test(title):
        return <Building />;
      case /Data Quality/.test(title):
        return <Database />;
      case /Visualization/.test(title):
        return <BarChart />;
      case /Feature Engineering/.test(title):
        return <PlusSquare />;
      case /Hypotheses/.test(title):
        return <FlaskConical />;
      default:
        return <Lightbulb />;
    }
  };

  const getColorForSection = (title: string) => {
    const colors = [
      "bg-blue-100",
      "bg-green-100",
      "bg-yellow-100",
      "bg-red-100",
      "bg-purple-100",
      "bg-indigo-100",
      "bg-pink-100",
      "bg-teal-100",
      "bg-orange-100",
      "bg-cyan-100",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const fetchCustomAnalysis = async () => {
    if (!parsedData || parsedData.length === 0 || !customQuestion) return;

    setLoading(true);
    const analysis = await getCustomAnalysis(parsedData, customQuestion);
    setCustomAnalysis(cleanText(analysis));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">AI Insights 🧠✨</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={fetchInsights}
            disabled={loading || !parsedData}
            className="mb-4"
          >
            {loading ? "Generating Insights..." : "Get AI Insights"}
          </Button>
          {insights && (
            <Accordion type="single" collapsible className="w-full">
              {insights.map((section, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger
                    className={`${section.color} p-2 rounded-md`}
                  >
                    <span className="flex items-center">
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {section.content.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Custom AI Analysis 🔍
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ask a question about your data..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={fetchCustomAnalysis}
            disabled={loading || !parsedData || !customQuestion}
          >
            {loading ? "Analyzing..." : "Get Custom Analysis"}
          </Button>
          {customAnalysis && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold mb-2">
                Custom Analysis Result:
              </h3>
              <div className="prose max-w-none">{customAnalysis}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
