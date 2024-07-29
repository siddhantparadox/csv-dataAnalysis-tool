import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const DataSummary: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);

  const summary = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return null;

    const columnTypes = detectColumnTypes(parsedData);
    const summaryData: Record<string, any> = {};

    Object.entries(columnTypes).forEach(([column, type]) => {
      const values = parsedData.map((row) => row[column]);
      const uniqueValues = new Set(values);

      summaryData[column] = {
        type,
        uniqueCount: uniqueValues.size,
        nullCount: values.filter((v) => v === null || v === "").length,
      };

      if (type === "numeric") {
        const stats = calculateColumnStats(parsedData, column);
        summaryData[column] = {
          ...summaryData[column],
          min: stats.min,
          max: stats.max,
          mean: stats.mean,
          median: stats.median,
        };
      } else if (type === "string") {
        summaryData[column].mostCommon = Object.entries(
          values.reduce((acc: Record<string, number>, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0][0];
      }
    });

    return summaryData;
  }, [parsedData]);

  if (!summary) return <div>No data available for summary.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Unique Values</TableHead>
              <TableHead>Null Count</TableHead>
              <TableHead>Additional Info</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(summary).map(([column, info]) => (
              <TableRow key={column}>
                <TableCell>{column}</TableCell>
                <TableCell>{info.type}</TableCell>
                <TableCell>{info.uniqueCount}</TableCell>
                <TableCell>{info.nullCount}</TableCell>
                <TableCell>
                  {info.type === "numeric" ? (
                    <>
                      Min: {info.min.toFixed(2)}, Max: {info.max.toFixed(2)},
                      <br />
                      Mean: {info.mean.toFixed(2)}, Median:{" "}
                      {info.median.toFixed(2)}
                    </>
                  ) : info.type === "string" ? (
                    <>Most common: {info.mostCommon}</>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DataSummary;
