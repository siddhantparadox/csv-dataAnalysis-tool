import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  FileUp,
  BarChart2,
  Brain,
  Filter,
  Calculator,
  Download,
  Table,
  Zap,
  Sparkles,
  Save,
} from "lucide-react";

const Emoji: React.FC<{ symbol: string; label: string }> = ({
  symbol,
  label,
}) => (
  <span role="img" aria-label={label} className="mr-2 text-2xl">
    {symbol}
  </span>
);

const FeatureGuide: React.FC<{
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  emoji: string;
}> = ({ title, description, icon, emoji }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          {icon}
          <Emoji symbol={emoji} label={title} />
          <span className="ml-2">{title}</span>
        </span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Button>
      {isOpen && (
        <Card className="mt-2">
          <CardContent className="pt-4">{description}</CardContent>
        </Card>
      )}
    </div>
  );
};

const Guide: React.FC = () => {
  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-white">
            <Emoji symbol="🚀" label="rocket" />
            Welcome to the CSV Analysis Tool!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white text-lg">
            Discover the power of data analysis with our intuitive and
            feature-rich tool. Whether you're a data scientist, analyst, or just
            curious about your data, we've got you covered! Let's embark on a
            data adventure together!
            <Emoji symbol="📊" label="chart" />
            <Emoji symbol="🔍" label="magnifying glass" />
            <Emoji symbol="💡" label="light bulb" />
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="getting-started">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="getting-started">
            <Emoji symbol="🏁" label="checkered flag" /> Getting Started
          </TabsTrigger>
          <TabsTrigger value="features">
            <Emoji symbol="🛠️" label="tools" /> Key Features
          </TabsTrigger>
          <TabsTrigger value="tips">
            <Emoji symbol="💯" label="hundred points" /> Pro Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Emoji symbol="🏁" label="checkered flag" /> Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Upload Your Data:</strong> Click the "Upload" button
                  at the top of the page. You can drag and drop your CSV file or
                  click to select it from your computer.
                  <Emoji symbol="📁" label="folder" />
                </li>
                <li>
                  <strong>Preview Your Data:</strong> Once uploaded, you'll see
                  a preview of your data in the "Preview" tab. This helps you
                  confirm that your file was uploaded correctly.
                  <Emoji symbol="👀" label="eyes" />
                </li>
                <li>
                  <strong>Explore Features:</strong> Navigate through different
                  tabs to access various analysis and visualization features.
                  <Emoji symbol="🧭" label="compass" />
                </li>
                <li>
                  <strong>More Options:</strong> Click the 'More' dropdown for
                  additional features like data preprocessing, filtering, and
                  exporting.
                  <Emoji symbol="⚙️" label="gear" />
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Emoji symbol="🛠️" label="tools" /> Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FeatureGuide
                title="Data Upload"
                description={
                  <div>
                    <p>
                      Easily upload your CSV files to start your analysis
                      journey:
                    </p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Supports large datasets</li>
                      <li>Drag-and-drop functionality</li>
                      <li>Automatic data type detection</li>
                      <li>Preview your data instantly after upload</li>
                    </ul>
                    <p className="mt-2">
                      <strong>How to use:</strong> Click the "Upload" button or
                      drag your file to the designated area.
                    </p>
                  </div>
                }
                icon={<FileUp size={20} className="text-blue-500" />}
                emoji="📤"
              />
              <FeatureGuide
                title="Data Preview"
                description={
                  <div>
                    <p>
                      Get a quick look at your data before diving into analysis:
                    </p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>View the first few rows of your dataset</li>
                      <li>Check column names and data types</li>
                      <li>Confirm successful data upload</li>
                    </ul>
                    <p className="mt-2">
                      <strong>How to use:</strong> After uploading, click on the
                      "Preview" tab to see your data.
                    </p>
                  </div>
                }
                icon={<Table size={20} className="text-indigo-500" />}
                emoji="👁️"
              />
              <FeatureGuide
                title="Data Preprocessing"
                description={
                  <div>
                    <p>Clean and prepare your data for analysis:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Remove rows with null values</li>
                      <li>Handle outliers using the IQR method</li>
                      <li>Normalize numeric data (Min-Max scaling)</li>
                    </ul>
                    <p className="mt-2">
                      <strong>How to use:</strong> Go to the "Preprocessing"
                      tab, select the operations you want to apply, and click
                      "Apply Preprocessing".
                    </p>
                  </div>
                }
                icon={<Zap size={20} className="text-yellow-500" />}
                emoji="🧹"
              />
              <FeatureGuide
                title="Data Filtering"
                description={
                  <div>
                    <p>Focus on specific subsets of your data:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Filter by column values</li>
                      <li>Apply multiple filters</li>
                      <li>Reset filters to view full dataset</li>
                    </ul>
                    <p className="mt-2">
                      <strong>How to use:</strong> In the "Filtering" tab,
                      select a column, enter a filter value, and click "Apply
                      Filter". Use "Reset Filter" to clear all filters.
                    </p>
                  </div>
                }
                icon={<Filter size={20} className="text-green-500" />}
                emoji="🔍"
              />
              <FeatureGuide
                title="Basic Analysis"
                description={
                  <div>
                    <p>Get key statistics about your numeric data:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Calculate mean, median, mode</li>
                      <li>Find minimum and maximum values</li>
                      <li>Compute standard deviation and variance</li>
                      <li>Analyze skewness and kurtosis</li>
                    </ul>
                    <p className="mt-2">
                      <strong>How to use:</strong> Navigate to the "Basic
                      Analysis" tab to view these statistics for each numeric
                      column.
                    </p>
                  </div>
                }
                icon={<Calculator size={20} className="text-red-500" />}
                emoji="🧮"
              />
              <FeatureGuide
                title="Data Visualization"
                description={
                  <div>
                    <p>
                      Create stunning charts and graphs to visualize your data
                      patterns:
                    </p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Histograms for distribution analysis</li>
                      <li>Scatter plots to identify relationships</li>
                      <li>Box plots for outlier detection</li>
                      <li>Interactive and customizable charts</li>
                    </ul>
                    <p className="mt-2">
                      <strong>How to use:</strong> Go to the "Visualize" tab,
                      select a chart type and the columns you want to visualize,
                      then click "Generate Chart".
                    </p>
                  </div>
                }
                icon={<BarChart2 size={20} className="text-purple-500" />}
                emoji="📊"
              />
              <FeatureGuide
                title="AI Insights"
                description={
                  <div>
                    <p>
                      Leverage AI to get intelligent insights about your data:
                    </p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Automatic pattern recognition</li>
                      <li>Anomaly detection</li>
                      <li>Trend identification</li>
                      <li>Suggestions for further analysis</li>
                    </ul>
                    <p className="mt-2">
                      <strong>How to use:</strong> Click on the "AI Insights"
                      tab and press "Generate Insights". Our AI will analyze
                      your data and provide valuable observations.
                    </p>
                  </div>
                }
                icon={<Brain size={20} className="text-blue-500" />}
                emoji="🤖"
              />
              <FeatureGuide 
              title="Custom Calculations" 
              description={
                <div>
                  <p>Create custom calculated columns to derive new insights from your existing data:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Define new columns using mathematical operations on existing columns</li>
                    <li>Use a wide range of functions and operators</li>
                    <li>Apply conditional logic in your calculations</li>
                    <li>Instantly see results and use new columns in further analysis</li>
                  </ul>
                  <p className="mt-2"><strong>How to use:</strong></p>
                  <ol className="list-decimal pl-5 mt-2">
                    <li>Go to the "Custom Calc" tab</li>
                    <li>Enter a name for your new column</li>
                    <li>Write a formula using existing column names and supported operations</li>
                    <li>Click "Add Calculated Column" to create it</li>
                  </ol>
                  <p className="mt-2"><strong>Examples:</strong></p>
                  <ul className="list-disc pl-5 mt-2">
                    <li><code>Total = Price * Quantity</code> (Simple multiplication)</li>
                    <li><code>BMI = Weight / (Height * Height)</code> (Body Mass Index calculation)</li>
                    <li><code>IsExpensive = Price > 1000 ? 1 : 0</code> (Conditional calculation)</li>
                    <li><code>GrowthRate = (CurrentValue - PreviousValue) / PreviousValue * 100</code> (Percentage change)</li>
                  </ul>
                  <p className="mt-2"><strong>Supported Formulas and Operations:</strong></p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Basic arithmetic: <code>+</code> (addition), <code>-</code> (subtraction), <code>*</code> (multiplication), <code>/</code> (division), <code>%</code> (modulo)</li>
                    <li>Comparison: <code>{'>'}</code>, <code>&lt;</code>, <code>{'>='}</code>, <code>&lt;=</code>, <code>==</code>, <code>!=</code></li>
                    <li>Logical operators: <code>&&</code> (AND), <code>||</code> (OR), <code>!</code> (NOT)</li>
                    <li>Math functions: <code>abs()</code>, <code>sqrt()</code>, <code>pow()</code>, <code>exp()</code>, <code>log()</code>, <code>round()</code>, <code>floor()</code>, <code>ceil()</code></li>
                    <li>Trigonometric functions: <code>sin()</code>, <code>cos()</code>, <code>tan()</code></li>
                    <li>Statistical functions: <code>min()</code>, <code>max()</code>, <code>mean()</code>, <code>median()</code>, <code>sum()</code></li>
                    <li>Conditional operator: <code>condition ? value_if_true : value_if_false</code></li>
                  </ul>
                  <p className="mt-2"><strong>Tips for Custom Calculations:</strong></p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Use column names exactly as they appear in your dataset</li>
                    <li>Wrap column names with spaces in square brackets, e.g., <code>[Total Sales]</code></li>
                    <li>Test your formulas on a small subset of data first</li>
                    <li>Use parentheses to ensure operations are performed in the desired order</li>
                    <li>Take advantage of conditional calculations to create binary or categorical variables</li>
                  </ul>
                </div>
              }
              icon={<Sparkles size={20} className="text-yellow-500" />}
              emoji="✨"
            />
              <FeatureGuide
                title="Data Export"
                description={
                  <div>
                    <p>Export your analyzed and processed data:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Download data as CSV or Excel file</li>
                      <li>Export specific columns or entire dataset</li>
                      <li>Include calculated columns in export</li>
                    </ul>
                    <p className="mt-2">
                      <strong>How to use:</strong> Navigate to the "Export" tab,
                      select your export options, and click "Export Data" to
                      download your file.
                    </p>
                  </div>
                }
                icon={<Download size={20} className="text-green-500" />}
                emoji="💾"
              />
              <FeatureGuide
                title="Session Management"
                description={
                  <div>
                    <p>Save and load your analysis sessions:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Save current analysis state</li>
                      <li>Load previous sessions</li>
                      <li>Manage multiple projects</li>
                    </ul>
                    <p className="mt-2">
                      <strong>How to use:</strong> Use the "Save Session" button
                      to store your current work. Load saved sessions from the
                      "Manage Sessions" dropdown.
                    </p>
                  </div>
                }
                icon={<Save size={20} className="text-indigo-500" />}
                emoji="📁"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Emoji symbol="💯" label="hundred points" /> Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <Emoji symbol="🧼" label="soap" />{" "}
                  <strong>Clean your data:</strong> Before uploading, ensure
                  your CSV file is clean and well-formatted for best results.
                </li>
                <li>
                  <Emoji symbol="🔧" label="wrench" />{" "}
                  <strong>Preprocess wisely:</strong> Use the preprocessing
                  options to handle missing values and outliers, but be mindful
                  of how these changes might affect your analysis.
                </li>
                <li>
                  <Emoji symbol="🎨" label="artist palette" />{" "}
                  <strong>Experiment with visualizations:</strong> Try different
                  chart types to find the best way to represent your data.
                  Sometimes, unexpected visualizations can reveal hidden
                  patterns.
                </li>
                <li>
                  <Emoji symbol="🧠" label="brain" />{" "}
                  <strong>Leverage AI Insights:</strong> Don't forget to check
                  the AI Insights for interesting findings and suggestions for
                  further analysis.
                </li>
                <li>
                  <Emoji symbol="🔢" label="numbers" />{" "}
                  <strong>Custom calculations:</strong> Use custom calculations
                  to create new variables that might reveal interesting
                  relationships in your data.
                </li>
                <li>
                  <Emoji symbol="💾" label="floppy disk" />{" "}
                  <strong>Save your work:</strong> Regularly save your sessions
                  to avoid losing progress and to easily continue your analysis
                  later.
                </li>
                <li>
                  <Emoji symbol="🔄" label="arrows clockwise" />{" "}
                  <strong>Iterate your analysis:</strong> Data analysis is often
                  an iterative process. Don't be afraid to go back, try
                  different approaches, and refine your insights.
                </li>
                <li>
                  <Emoji symbol="📊" label="bar chart" />{" "}
                  <strong>Combine features:</strong> For deeper insights, try
                  combining different features. For example, use filtering
                  before visualization to focus on specific data subsets.
                </li>
                <li>
                  <Emoji symbol="🔍" label="magnifying glass" />{" "}
                  <strong>Explore correlations:</strong> Use the correlation
                  analysis feature to understand relationships between different
                  variables in your dataset.
                </li>
                <li>
                  <Emoji symbol="📏" label="ruler" />{" "}
                  <strong>Scale appropriately:</strong> When working with
                  variables of different scales, consider normalization or
                  standardization to make comparisons more meaningful.
                </li>
                <li>
                  <Emoji symbol="🎭" label="theater masks" />{" "}
                  <strong>Be aware of bias:</strong> Always consider potential
                  biases in your data collection or analysis process. AI
                  insights can help, but human oversight is crucial.
                </li>
                <li>
                  <Emoji symbol="🧪" label="test tube" />{" "}
                  <strong>Test hypotheses:</strong> Use the tool to test your
                  hypotheses about the data. Formulate questions and use various
                  features to find answers.
                </li>
                <li>
                  <Emoji symbol="📈" label="chart increasing" />{" "}
                  <strong>Track changes:</strong> Keep note of the preprocessing
                  steps and filters you apply. This helps in reproducing your
                  analysis and understanding how you arrived at your insights.
                </li>
                <li>
                  <Emoji symbol="🧩" label="puzzle piece" />{" "}
                  <strong>Combine with domain knowledge:</strong> While our tool
                  provides powerful analysis capabilities, combining the results
                  with your domain expertise will yield the most valuable
                  insights.
                </li>
                <li>
                  <Emoji symbol="📚" label="books" />{" "}
                  <strong>Learn from each analysis:</strong> Each dataset is an
                  opportunity to learn. Take note of interesting patterns or
                  unexpected results for future reference.
                </li>
                <li>
                  <Emoji symbol="🗣️" label="speaking head" />{" "}
                  <strong>Communicate effectively:</strong> Use the
                  visualization tools to create clear, informative charts that
                  effectively communicate your findings to others.
                </li>
                <li>
                  <Emoji symbol="🔒" label="locked" />{" "}
                  <strong>Data privacy:</strong> Always be mindful of data
                  privacy. Use the data anonymization features if you're working
                  with sensitive information.
                </li>
                <li>
                  <Emoji symbol="🚀" label="rocket" />{" "}
                  <strong>Start simple, go deep:</strong> Begin with basic
                  analysis and visualizations, then progressively use more
                  advanced features as you become familiar with your data.
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-green-400 to-blue-500">
        <CardHeader>
          <CardTitle className="text-white">
            <Emoji symbol="🎉" label="party popper" /> Ready to Dive In?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white text-lg">
            Now that you're equipped with these powerful tips and tricks, it's
            time to start your data analysis journey! Remember, the key to great
            insights is curiosity and persistence. Don't hesitate to explore all
            the features of our CSV Analysis Tool. Happy analyzing!
            <Emoji symbol="🚀" label="rocket" />
            <Emoji symbol="📊" label="bar chart" />
            <Emoji symbol="💡" label="light bulb" />
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Guide;
