import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { detectColumnTypes } from "../../services/analysisService";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const CorrelationAnalysis: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);

  const correlationData = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return null;

    const columnTypes = detectColumnTypes(parsedData);
    const numericColumns = Object.entries(columnTypes)
      .filter(([_, type]) => type === "numeric")
      .map(([column, _]) => column);

    const correlationMatrix = numericColumns.map((col1) =>
      numericColumns.map((col2) => {
        const values1 = parsedData.map((row) => parseFloat(row[col1]));
        const values2 = parsedData.map((row) => parseFloat(row[col2]));
        const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
        const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
        const variance1 =
          values1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) /
          values1.length;
        const variance2 =
          values2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) /
          values2.length;
        const covariance =
          values1.reduce(
            (a, b, i) => a + (b - mean1) * (values2[i] - mean2),
            0
          ) / values1.length;
        return covariance / Math.sqrt(variance1 * variance2);
      })
    );

    return {
      z: correlationMatrix,
      x: numericColumns,
      y: numericColumns,
    };
  }, [parsedData]);

  if (!correlationData)
    return <div>No numeric data available for correlation analysis.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlation Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Plot
          data={[
            {
              type: "heatmap",
              z: correlationData.z,
              x: correlationData.x,
              y: correlationData.y,
              colorscale: "Viridis",
            },
          ]}
          layout={{
            width: 700,
            height: 700,
            title: "Correlation Heatmap",
            xaxis: { title: "Features" },
            yaxis: { title: "Features" },
          }}
          config={{ responsive: true }}
        />
      </CardContent>
    </Card>
  );
};

export default CorrelationAnalysis;
