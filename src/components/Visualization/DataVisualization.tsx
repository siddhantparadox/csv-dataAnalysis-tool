import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { detectColumnTypes } from "../../services/analysisService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Data, Layout } from "plotly.js";

// Dynamically import Plotly with ssr: false
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ChartData {
  data: Data[];
  layout: Partial<Layout>;
}

const DataVisualization: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);
  const [chartType, setChartType] = useState<string>("histogram");
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");

  const columnTypes = useMemo(
    () => (parsedData ? detectColumnTypes(parsedData) : {}),
    [parsedData]
  );
  const numericColumns = useMemo(
    () =>
      Object.entries(columnTypes)
        .filter(([_, type]) => type === "numeric")
        .map(([column, _]) => column),
    [columnTypes]
  );

  const generateChart = (): ChartData | null => {
    if (!parsedData || parsedData.length === 0 || !xAxis) return null;

    switch (chartType) {
      case "histogram":
        return {
          data: [
            {
              x: parsedData.map((row) => row[xAxis]),
              type: "histogram",
            } as Data,
          ],
          layout: { title: `Histogram of ${xAxis}` },
        };
      case "scatter":
        if (!yAxis) return null;
        return {
          data: [
            {
              x: parsedData.map((row) => row[xAxis]),
              y: parsedData.map((row) => row[yAxis]),
              mode: "markers",
              type: "scatter",
            } as Data,
          ],
          layout: {
            title: `${xAxis} vs ${yAxis}`,
            xaxis: { title: xAxis },
            yaxis: { title: yAxis },
          },
        };
      case "box":
        return {
          data: [
            {
              y: parsedData.map((row) => row[xAxis]),
              type: "box",
              name: xAxis,
            } as Data,
          ],
          layout: { title: `Box Plot of ${xAxis}` },
        };
      default:
        return null;
    }
  };

  const chart = generateChart();

  if (!parsedData || parsedData.length === 0)
    return (
      <div>No data available for visualization. Please upload a file.</div>
    );

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">Data Visualization</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Select onValueChange={(value) => setChartType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="histogram">Histogram</SelectItem>
            <SelectItem value="scatter">Scatter Plot</SelectItem>
            <SelectItem value="box">Box Plot</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setXAxis(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select X-axis" />
          </SelectTrigger>
          <SelectContent>
            {numericColumns.map((column) => (
              <SelectItem key={column} value={column}>
                {column}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {chartType === "scatter" && (
          <Select onValueChange={(value) => setYAxis(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Y-axis" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {chart && (
        <Card>
          <CardHeader>
            <CardTitle>{chart.layout.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Plot
              data={chart.data}
              layout={{ ...chart.layout, width: 700, height: 500 }}
              config={{ responsive: true }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataVisualization;
