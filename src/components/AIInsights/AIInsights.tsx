import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { getAIInsights } from "../../services/aiService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InsightResponse {
  executiveSummary: string;
  keyMetrics: { [key: string]: { value: string | number, description: string } };
  mainInsights: string[];
  actionItems: string[];
  limitations: string[];
}

const AIInsights: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);
  const [question, setQuestion] = useState("");
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const extractJSONFromMarkdown = (markdown: string): string => {
    const jsonMatch = markdown.match(/```json\n([\s\S]*?)\n```/);
    return jsonMatch ? jsonMatch[1] : markdown;
  };

  const parseInsights = (rawInsights: string): InsightResponse => {
    try {
      // First, try to parse as JSON
      return JSON.parse(rawInsights);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      
      // If JSON parsing fails, return a default structure with the raw insights as the answer
      return {
        executiveSummary: "Unable to parse response",
        keyMetrics: {},
        mainInsights: [rawInsights],
        actionItems: [],
        limitations: []
      };
    }
  };

  const generateInsights = async () => {
    if (!parsedData || !question.trim()) {
      setError("Please enter a question before generating insights.");
      return;
    }
    setLoading(true);
    setError(null);
    setProgress(0);
    setInsights(null);

    try {
      const insightsGenerator = getAIInsights(parsedData, question);
      let fullResponse = "";
      for await (const chunk of insightsGenerator) {
        console.log("Received chunk:", chunk);
        if (chunk.includes("PROGRESS:")) {
          const [insightsPart, progressPart] = chunk.split("PROGRESS:");
          const progressValue = parseInt(progressPart);
          setProgress(progressValue);
          fullResponse += insightsPart;
        } else {
          fullResponse += chunk;
        }
      }
      console.log("Full response:", fullResponse);
      const extractedJSON = extractJSONFromMarkdown(fullResponse);
      console.log("Extracted JSON string:", extractedJSON);
      const parsedInsights = parseInsights(extractedJSON);
      setInsights(parsedInsights);
    } catch (error) {
      console.error("Error generating or parsing insights:", error);
      setError("Error generating or parsing insights. Please try again.");
      setInsights({
        executiveSummary: "Error generating insights",
        keyMetrics: {},
        mainInsights: [error instanceof Error ? error.message : String(error)],
        actionItems: [],
        limitations: []
      });
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter your question about the data"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mb-4"
        />
        <Button onClick={generateInsights} disabled={loading || !parsedData || !question.trim()}>
          {loading ? 'Generating Insights...' : 'Generate AI Insights'}
        </Button>
        {loading && <Progress value={progress} className="mt-4" />}
        {error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {insights && (
          <ScrollArea className="h-[600px] mt-4">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Executive Summary:</h3>
              <p className="text-sm leading-relaxed">{insights.executiveSummary}</p>

              <Separator />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="keyMetrics">
                  <AccordionTrigger>Key Metrics</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-none pl-0 space-y-4">
                      {Object.entries(insights.keyMetrics).map(([key, { value, description }], index) => (
                        <li key={index} className="border-b pb-2">
                          <strong className="text-lg">{key}:</strong> {value}
                          <p className="text-sm text-gray-600 mt-1">{description}</p>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mainInsights">
                  <AccordionTrigger>Main Insights</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-decimal pl-5 space-y-2">
                      {insights.mainInsights.map((insight, index) => (
                        <li key={index} className="text-sm">{insight}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="actionItems">
                  <AccordionTrigger>Action Items</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {insights.actionItems.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="limitations">
                  <AccordionTrigger>Limitations</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {insights.limitations.map((limitation, index) => (
                        <li key={index} className="text-sm">{limitation}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
