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
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const DataProfiling: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);

  const profile = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return null;

    const columnTypes = detectColumnTypes(parsedData);
    const profileData: Record<string, any> = {};

    Object.entries(columnTypes).forEach(([column, type]) => {
      const values = parsedData.map((row) => row[column]);
      const uniqueValues = new Set(values);
      const missingValues = values.filter((v) => v === null || v === "").length;

      profileData[column] = {
        type,
        uniqueCount: uniqueValues.size,
        uniquePercentage: (uniqueValues.size / values.length) * 100,
        missingCount: missingValues,
        missingPercentage: (missingValues / values.length) * 100,
        sampleValues: Array.from(uniqueValues).slice(0, 5),
      };

      if (type === "numeric") {
        const stats = calculateColumnStats(parsedData, column);
        profileData[column] = {
          ...profileData[column],
          ...stats,
          histogram: values.map((v) => parseFloat(v)),
        };
      } else if (type === "string") {
        const valueCounts = values.reduce(
          (acc: Record<string, number>, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          },
          {}
        );
        profileData[column].topValues = Object.entries(valueCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([value, count]) => ({
            value,
            count,
            percentage: (count / values.length) * 100,
          }));
      }
    });

    return profileData;
  }, [parsedData]);

  if (!profile) return <div>No data available for profiling.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Profiling</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(profile).map(([column, info]) => (
          <Card key={column} className="mb-4">
            <CardHeader>
              <CardTitle>{column}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Type</TableCell>
                    <TableCell>{info.type}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Unique Values</TableCell>
                    <TableCell>
                      {info.uniqueCount} ({info.uniquePercentage.toFixed(2)}%)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Missing Values
                    </TableCell>
                    <TableCell>
                      {info.missingCount} ({info.missingPercentage.toFixed(2)}%)
                    </TableCell>
                  </TableRow>
                  {info.type === "numeric" && (
                    <>
                      <TableRow>
                        <TableCell className="font-medium">Mean</TableCell>
                        <TableCell>{info.mean.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Median</TableCell>
                        <TableCell>{info.median.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Min</TableCell>
                        <TableCell>{info.min.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Max</TableCell>
                        <TableCell>{info.max.toFixed(2)}</TableCell>
                      </TableRow>
                    </>
                  )}
                  {info.type === "string" && (
                    <TableRow>
                      <TableCell className="font-medium">Top Values</TableCell>
                      <TableCell>
                        {info.topValues.map((v: any) => (
                          <div key={v.value}>
                            {v.value}: {v.count} ({v.percentage.toFixed(2)}%)
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-medium">Sample Values</TableCell>
                    <TableCell>{info.sampleValues.join(", ")}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {info.type === "numeric" && (
                <Plot
                  data={[
                    {
                      x: info.histogram,
                      type: "histogram",
                      name: column,
                    },
                  ]}
                  layout={{
                    title: `Distribution of ${column}`,
                    width: 400,
                    height: 300,
                    margin: { l: 40, r: 20, t: 40, b: 30 },
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default DataProfiling;
