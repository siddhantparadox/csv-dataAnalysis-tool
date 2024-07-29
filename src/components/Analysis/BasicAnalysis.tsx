import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  calculateColumnStats,
  detectColumnTypes,
  ColumnStats,
} from "../../services/analysisService";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BasicAnalysis: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);

  const analysis = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return null;

    const columnTypes = detectColumnTypes(parsedData);
    const numericColumns = Object.entries(columnTypes)
      .filter(([_, type]) => type === "numeric")
      .map(([column, _]) => column);

    const stats: Record<string, ColumnStats> = {};
    numericColumns.forEach((column) => {
      stats[column] = calculateColumnStats(parsedData, column);
    });

    return stats;
  }, [parsedData]);

  if (!analysis)
    return <div>No data available for analysis. Please upload a file.</div>;

  const formatValue = (value: any, measure: string) => {
    if (measure === "Mode") {
      if (Array.isArray(value)) {
        const displayValues = value
          .slice(0, 3)
          .map((v) => v.toFixed(2))
          .join(", ");
        return value.length > 3 ? `${displayValues}...` : displayValues;
      }
      return typeof value === "number" ? value.toFixed(2) : String(value);
    }
    return typeof value === "number" ? value.toFixed(2) : String(value);
  };

  const measures = [
    "Mean",
    "Median",
    "Mode",
    "Min",
    "Max",
    "StdDev",
    "Variance",
    "Skewness",
    "Kurtosis",
  ];

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">Basic Statistical Analysis</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Measure</TableHead>
              {Object.keys(analysis).map((column) => (
                <TableHead key={column} className="px-2">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {measures.map((measure) => (
              <TableRow key={measure}>
                <TableCell>{measure}</TableCell>
                {Object.values(analysis).map((stats, index) => (
                  <TableCell key={index} className="px-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatValue(
                            stats[measure.toLowerCase() as keyof ColumnStats],
                            measure
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {measure === "Mode" && Array.isArray(stats.mode)
                            ? stats.mode.map((v) => v.toFixed(2)).join(", ")
                            : formatValue(
                                stats[
                                  measure.toLowerCase() as keyof ColumnStats
                                ],
                                measure
                              )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BasicAnalysis;
