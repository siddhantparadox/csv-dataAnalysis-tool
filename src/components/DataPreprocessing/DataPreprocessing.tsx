import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setParsedData } from "../../store/dataSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const DataPreprocessing: React.FC = () => {
  const dispatch = useDispatch();
  const { parsedData } = useSelector((state: RootState) => state.data);
  const [removeNulls, setRemoveNulls] = useState(false);
  const [removeOutliers, setRemoveOutliers] = useState(false);
  const [normalizeData, setNormalizeData] = useState(false);

  const preprocessData = () => {
    if (!parsedData) return;

    let processedData = [...parsedData];
    let rowsAffected = 0;
    const originalRowCount = processedData.length;

    if (removeNulls) {
      processedData = processedData.filter((row) =>
        Object.values(row).every((value) => value !== null && value !== "")
      );
      rowsAffected += originalRowCount - processedData.length;
    }

    if (removeOutliers) {
      Object.keys(processedData[0]).forEach((column) => {
        if (typeof processedData[0][column] === "number") {
          const values = processedData
            .map((row) => row[column])
            .sort((a, b) => a - b);
          const q1 = values[Math.floor(values.length / 4)];
          const q3 = values[Math.floor((3 * values.length) / 4)];
          const iqr = q3 - q1;
          const lowerBound = q1 - 1.5 * iqr;
          const upperBound = q3 + 1.5 * iqr;
          const filteredData = processedData.filter(
            (row) => row[column] >= lowerBound && row[column] <= upperBound
          );
          rowsAffected += processedData.length - filteredData.length;
          processedData = filteredData;
        }
      });
    }

    if (normalizeData) {
      Object.keys(processedData[0]).forEach((column) => {
        if (typeof processedData[0][column] === "number") {
          const values = processedData.map((row) => row[column]);
          const min = Math.min(...values);
          const max = Math.max(...values);
          processedData = processedData.map((row) => ({
            ...row,
            [column]: (row[column] - min) / (max - min),
          }));
        }
      });
      rowsAffected += processedData.length; // All rows are affected by normalization
    }

    dispatch(setParsedData(processedData));
    toast({
      title: "Preprocessing Applied",
      description: `${rowsAffected} rows were affected by the preprocessing operations.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Preprocessing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeNulls"
              checked={removeNulls}
              onCheckedChange={setRemoveNulls}
            />
            <Label htmlFor="removeNulls">Remove rows with null values</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeOutliers"
              checked={removeOutliers}
              onCheckedChange={setRemoveOutliers}
            />
            <Label htmlFor="removeOutliers">Remove outliers (IQR method)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="normalizeData"
              checked={normalizeData}
              onCheckedChange={setNormalizeData}
            />
            <Label htmlFor="normalizeData">
              Normalize numeric data (Min-Max)
            </Label>
          </div>
          <Button onClick={preprocessData}>Apply Preprocessing</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataPreprocessing;
