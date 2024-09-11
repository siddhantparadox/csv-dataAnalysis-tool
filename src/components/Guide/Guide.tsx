import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Guide: React.FC = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the CSV Analysis Tool!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Discover the power of data analysis with our intuitive and
            feature-rich tool. Whether you&apos;re a data scientist, analyst, or just
            curious about your data, we&apos;ve got you covered!
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="getting-started">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
          <TabsTrigger value="tips">Pro Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <ol>
                <li>Upload Your Data: Click the &quot;Upload&quot; button at the top of the page.</li>
                <li>Preview Your Data: Once uploaded, you&apos;ll see a preview of your data in the &quot;Preview&quot; tab.</li>
                <li>Explore Features: Navigate through different tabs to access various analysis and visualization features.</li>
                <li>More Options: Click the &apos;More&apos; dropdown for additional features like data preprocessing, filtering, and exporting.</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                <li>Data Upload: Easily upload your CSV files to start your analysis journey.</li>
                <li>Data Preview: Get a quick look at your data before diving into analysis.</li>
                <li>Data Preprocessing: Clean and prepare your data for analysis.</li>
                <li>Data Filtering: Focus on specific subsets of your data.</li>
                <li>Basic Analysis: Get key statistics about your numeric data.</li>
                <li>Data Visualization: Create stunning charts and graphs to visualize your data patterns.</li>
                <li>AI Insights: Leverage AI to get intelligent insights about your data.</li>
                <li>Custom Calculations: Create custom calculated columns to derive new insights.</li>
                <li>Data Export: Export your analyzed and processed data.</li>
                <li>Session Management: Save and load your analysis sessions.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips">
          <Card>
            <CardHeader>
              <CardTitle>Pro Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                <li>Clean your data before uploading for best results.</li>
                <li>Use preprocessing options wisely to handle missing values and outliers.</li>
                <li>Experiment with different chart types to find the best way to represent your data.</li>
                <li>Leverage AI Insights for interesting findings and suggestions.</li>
                <li>Use custom calculations to create new variables and reveal interesting relationships.</li>
                <li>Regularly save your sessions to avoid losing progress.</li>
                <li>Iterate your analysis process to refine your insights.</li>
                <li>Combine different features for deeper insights.</li>
                <li>Always consider potential biases in your data and analysis process.</li>
                <li>Start with basic analysis and progressively use more advanced features.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Ready to Dive In?</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Now that you&apos;re equipped with these powerful tips and tricks, it&apos;s
            time to start your data analysis journey! Remember, the key to great
            insights is curiosity and persistence. Don&apos;t hesitate to explore all
            the features of our CSV Analysis Tool. Happy analyzing!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Guide;
