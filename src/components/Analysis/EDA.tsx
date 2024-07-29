import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  detectColumnTypes,
  calculateColumnStats,
} from "../../services/analysisService";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const EDA: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);
  const [activeTab, setActiveTab] = useState("missing-values");

  const analysis = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return null;

    const columnTypes = detectColumnTypes(parsedData);
    const analysisData: Record<string, any> = {};

    Object.entries(columnTypes).forEach(([column, type]) => {
      const values = parsedData.map((row) => row[column]);
      const uniqueValues = new Set(values);
      const missingValues = values.filter((v) => v === null || v === "").length;

      analysisData[column] = {
        type,
        uniqueCount: uniqueValues.size,
        missingCount: missingValues,
        missingPercentage: (missingValues / values.length) * 100,
      };

      if (type === "numeric") {
        const stats = calculateColumnStats(parsedData, column);
        analysisData[column] = {
          ...analysisData[column],
          ...stats,
          outliers: values.filter((v) => {
            const value = parseFloat(v);
            return (
              value < stats.q1 - 1.5 * stats.iqr ||
              value > stats.q3 + 1.5 * stats.iqr
            );
          }).length,
        };
      }
    });

    return analysisData;
  }, [parsedData]);

  const renderMissingValues = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column</TableHead>
          <TableHead>Missing Count</TableHead>
          <TableHead>Missing Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(analysis!).map(([column, info]) => (
          <TableRow key={column}>
            <TableCell>{column}</TableCell>
            <TableCell>{info.missingCount}</TableCell>
            <TableCell>{info.missingPercentage.toFixed(2)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderOutliers = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column</TableHead>
          <TableHead>Outlier Count</TableHead>
          <TableHead>Outlier Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(analysis!)
          .filter(([_, info]) => info.type === "numeric")
          .map(([column, info]) => (
            <TableRow key={column}>
              <TableCell>{column}</TableCell>
              <TableCell>{info.outliers}</TableCell>
              <TableCell>
                {((info.outliers / parsedData!.length) * 100).toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );

  const renderDescriptiveStats = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column</TableHead>
          <TableHead>Mean</TableHead>
          <TableHead>Median</TableHead>
          <TableHead>Min</TableHead>
          <TableHead>Max</TableHead>
          <TableHead>Std Dev</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(analysis!)
          .filter(([_, info]) => info.type === "numeric")
          .map(([column, info]) => (
            <TableRow key={column}>
              <TableCell>{column}</TableCell>
              <TableCell>{info.mean.toFixed(2)}</TableCell>
              <TableCell>{info.median.toFixed(2)}</TableCell>
              <TableCell>{info.min.toFixed(2)}</TableCell>
              <TableCell>{info.max.toFixed(2)}</TableCell>
              <TableCell>{info.stddev.toFixed(2)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );

  const renderCorrelation = () => {
    const numericColumns = Object.entries(analysis!)
      .filter(([_, info]) => info.type === "numeric")
      .map(([column, _]) => column);
    const correlationMatrix = numericColumns.map((col1) =>
      numericColumns.map((col2) => {
        const values1 = parsedData!.map((row) => parseFloat(row[col1]));
        const values2 = parsedData!.map((row) => parseFloat(row[col2]));
        return calculateCorrelation(values1, values2);
      })
    );

    return (
      <Plot
        data={[
          {
            z: correlationMatrix,
            x: numericColumns,
            y: numericColumns,
            type: "heatmap",
            colorscale: "Viridis",
          },
        ]}
        layout={{
          width: 600,
          height: 500,
          title: "Correlation Heatmap",
        }}
      />
    );
  };

  const renderVisualization = () => {
    const numericColumns = Object.entries(analysis!)
      .filter(([_, info]) => info.type === "numeric")
      .map(([column, _]) => column);

    return (
      <div>
        {numericColumns.map((column) => (
          <Plot
            key={column}
            data={[
              {
                x: parsedData!.map((row) => row[column]),
                type: "histogram",
                name: column,
              },
            ]}
            layout={{
              width: 400,
              height: 300,
              title: `Distribution of ${column}`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderUniqueValues = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column</TableHead>
          <TableHead>Unique Value Count</TableHead>
          <TableHead>Unique Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(analysis!).map(([column, info]) => (
          <TableRow key={column}>
            <TableCell>{column}</TableCell>
            <TableCell>{info.uniqueCount}</TableCell>
            <TableCell>
              {((info.uniqueCount / parsedData!.length) * 100).toFixed(2)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (!analysis) return <div>No data available for EDA.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exploratory Data Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="missing-values">Missing Values</TabsTrigger>
            <TabsTrigger value="outliers">Outliers</TabsTrigger>
            <TabsTrigger value="descriptive-stats">
              Descriptive Stats
            </TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="unique-values">Unique Values</TabsTrigger>
          </TabsList>
          <TabsContent value="missing-values">
            {renderMissingValues()}
          </TabsContent>
          <TabsContent value="outliers">{renderOutliers()}</TabsContent>
          <TabsContent value="descriptive-stats">
            {renderDescriptiveStats()}
          </TabsContent>
          <TabsContent value="correlation">{renderCorrelation()}</TabsContent>
          <TabsContent value="visualization">
            {renderVisualization()}
          </TabsContent>
          <TabsContent value="unique-values">
            {renderUniqueValues()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const calculateCorrelation = (x: number[], y: number[]) => {
  const n = x.length;
  const sum_x = x.reduce((a, b) => a + b, 0);
  const sum_y = y.reduce((a, b) => a + b, 0);
  const sum_xy = x.reduce((a, b, i) => a + b * y[i], 0);
  const sum_x2 = x.reduce((a, b) => a + b * b, 0);
  const sum_y2 = y.reduce((a, b) => a + b * b, 0);

  const numerator = n * sum_xy - sum_x * sum_y;
  const denominator = Math.sqrt(
    (n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y)
  );

  return numerator / denominator;
};

export default EDA;
