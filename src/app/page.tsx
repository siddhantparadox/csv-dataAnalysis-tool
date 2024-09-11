"use client";

import dynamic from "next/dynamic";
import { Provider } from "react-redux";
import { store } from "../store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FileUpload from "../components/FileUpload/FileUpload";
import DataPreview from "../components/DataPreview/DataPreview";
import BasicAnalysis from "../components/Analysis/BasicAnalysis";
import CorrelationAnalysis from "../components/Analysis/CorrelationAnalysis";
import DataExport from "../components/DataExport/DataExport";
import LoadingSpinner from "../components/LoadingSpinner";
import DataPreprocessing from "../components/DataPreprocessing/DataPreprocessing";
import Guide from "../components/Guide/Guide";
import SessionManager from "../components/SessionManager/SessionManager";
import DataSummary from "../components/Analysis/DataSummary";
import EDA from "../components/Analysis/EDA";
import DataProfiling from "../components/Analysis/DataProfiling";
import CustomCalculations from "../components/CustomCalculations/CustomCalculations";
import DataCleaning from "../components/DataCleaning/DataCleaning";
import DataFiltering from "../components/DataFiltering/DataFiltering";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useState } from "react";
import {
  Eye,
  BarChart2,
  Sparkles,
  Brain,
  Download,
  MoreHorizontal,
  Filter,
} from "lucide-react";

// New import for enhanced AIInsights
import AIInsights from "@/components/AIInsights/AIInsights";

const DataVisualization = dynamic(
  () => import("../components/Visualization/DataVisualization"),
  { ssr: false }
);

const DataPreparation = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Data Preparation</h2>
    <div className="space-y-8">
      <DataCleaning />
      <DataFiltering />
    </div>
  </div>
);

const MainContent = () => {
  const { isLoading, error, parsedData } = useSelector(
    (state: RootState) => state.data
  );
  const [activeTab, setActiveTab] = useState("guide");

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const renderContent = () => {
    if (!parsedData && activeTab !== "guide") {
      return <div>Please upload a CSV file to begin analysis.</div>;
    }

    switch (activeTab) {
      case "guide":
        return <Guide />;
      case "preview":
        return <DataPreview />;
      case "prepare":
        return <DataPreparation />;
      case "eda":
        return <EDA />;
      case "visualization":
        return <DataVisualization />;
      case "insights":
        return <AIInsights />;
      case "export":
        return <DataExport />;
      case "summary":
        return <DataSummary />;
      case "profiling":
        return <DataProfiling />;
      case "preprocessing":
        return <DataPreprocessing />;
      case "basic-analysis":
        return <BasicAnalysis />;
      case "correlation":
        return <CorrelationAnalysis />;
      case "custom-calculations":
        return <CustomCalculations />;
      case "session":
        return <SessionManager />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-8">
      <FileUpload />
      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-4">
            <TabsTrigger
              value="guide"
              className="flex items-center justify-center"
            >
              Guide
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex items-center justify-center"
            >
              <Eye className="mr-2" size={18} />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="prepare"
              className="flex items-center justify-center"
            >
              <Filter className="mr-2" size={18} />
              Prepare Data
            </TabsTrigger>
            <TabsTrigger
              value="eda"
              className="flex items-center justify-center"
            >
              <BarChart2 className="mr-2" size={18} />
              Analyze
            </TabsTrigger>
            <TabsTrigger
              value="visualization"
              className="flex items-center justify-center"
            >
              <Sparkles className="mr-2" size={18} />
              Visualize
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="flex items-center justify-center"
            >
              <Brain className="mr-2" size={18} />
              AI Insights
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="flex items-center justify-center"
            >
              <Download className="mr-2" size={18} />
              Export
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <MoreHorizontal className="mr-2" size={18} />
                More Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setActiveTab("summary")}>
                Data Summary
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab("profiling")}>
                Data Profiling
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab("preprocessing")}>
                Preprocessing
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab("basic-analysis")}>
                Basic Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab("correlation")}>
                Correlation Analysis
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setActiveTab("custom-calculations")}
              >
                Custom Calculations
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab("session")}>
                Manage Sessions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default function Home() {
  return (
    <Provider store={store}>
      <main className="flex min-h-screen flex-col items-center p-24">
        <div className="w-full max-w-5xl">
          <h1 className="text-4xl font-bold mb-8 text-center">
            CSV Analysis Tool
          </h1>
          <MainContent />
        </div>
      </main>
    </Provider>
  );
}
