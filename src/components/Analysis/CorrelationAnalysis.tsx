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
  calculateCorrelation,
  CorrelationResult,
} from "../../services/analysisService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CorrelationAnalysis: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);

  console.log("Parsed Data:", parsedData); // Debug log

  const correlationData = useMemo(() => {
    if (!parsedData || parsedData.length === 0) {
      console.log("No parsed data available"); // Debug log
      return null;
    }

    const columnTypes = detectColumnTypes(parsedData);
    console.log("Column Types:", columnTypes); // Debug log

    const numericColumns = Object.entries(columnTypes)
      .filter(([_, type]) => type === "numeric")
      .map(([column, _]) => column);

    console.log("Numeric Columns:", numericColumns); // Debug log

    if (numericColumns.length === 0) {
      console.log("No numeric columns detected"); // Debug log
      return null;
    }

    const correlationMatrix: Record<
      string,
      Record<string, CorrelationResult>
    > = {};

    numericColumns.forEach((col1) => {
      correlationMatrix[col1] = {};
      numericColumns.forEach((col2) => {
        if (col1 !== col2) {
          correlationMatrix[col1][col2] = calculateCorrelation(
            parsedData,
            col1,
            col2
          );
        }
      });
    });

    console.log("Correlation Matrix:", correlationMatrix); // Debug log

    return {
      columns: numericColumns,
      matrix: correlationMatrix,
    };
  }, [parsedData]);

  if (!correlationData) {
    return <div>No numeric data available for correlation analysis.</div>;
  }

  const { columns, matrix } = correlationData;

  const getColorIntensity = (value: number | null) => {
    if (value === null) return "bg-gray-200";
    const absValue = Math.abs(value);
    const intensity = Math.round(absValue * 100);
    return value > 0 ? `bg-blue-${intensity}` : `bg-red-${intensity}`;
  };

  const formatCorrelation = (value: number | null) => {
    return value !== null ? value.toFixed(2) : "N/A";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlation Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
                {columns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((row) => (
                <TableRow key={row}>
                  <TableCell className="font-medium">{row}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={`${row}-${col}`}>
                      {row !== col ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className={`p-2 rounded ${getColorIntensity(
                                  matrix[row][col].pearson
                                )}`}
                              >
                                {formatCorrelation(matrix[row][col].pearson)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Pearson:{" "}
                                {formatCorrelation(matrix[row][col].pearson)}
                              </p>
                              <p>
                                Spearman:{" "}
                                {formatCorrelation(matrix[row][col].spearman)}
                              </p>
                              <p>
                                Kendall:{" "}
                                {formatCorrelation(matrix[row][col].kendall)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        "1.00"
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationAnalysis;
