import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setParsedData } from "../../store/dataSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const DataPreprocessing: React.FC = () => {
  const dispatch = useDispatch();
  const { parsedData } = useSelector((state: RootState) => state.data);
  const [removeNulls, setRemoveNulls] = useState(false);
  const [removeOutliers, setRemoveOutliers] = useState(false);
  const [outlierThreshold, setOutlierThreshold] = useState(3);

  const handlePreprocessing = () => {
    if (!parsedData) return;

    let processedData = [...parsedData];

    if (removeNulls) {
      processedData = processedData.filter((row) =>
        Object.values(row).every((value) => value !== null && value !== "")
      );
    }

    if (removeOutliers) {
      const numericColumns = Object.keys(processedData[0]).filter((key) =>
        processedData.every((row) => !isNaN(parseFloat(row[key])))
      );

      numericColumns.forEach((column) => {
        const values = processedData.map((row) => parseFloat(row[column]));
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(
          values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) /
            (values.length - 1)
        );

        processedData = processedData.filter(
          (row) =>
            Math.abs((parseFloat(row[column]) - mean) / std) <= outlierThreshold
        );
      });
    }

    dispatch(setParsedData(processedData));
    toast({
      title: "Data Preprocessed",
      description: "Your data has been successfully preprocessed.",
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
              onCheckedChange={(checked) => setRemoveNulls(checked === true)}
            />
            <Label htmlFor="removeNulls">Remove rows with null values</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeOutliers"
              checked={removeOutliers}
              onCheckedChange={(checked) => setRemoveOutliers(checked === true)}
            />
            <Label htmlFor="removeOutliers">Remove outliers</Label>
          </div>
          {removeOutliers && (
            <div>
              <Label htmlFor="outlierThreshold">Outlier Threshold (Standard Deviations)</Label>
              <Input
                id="outlierThreshold"
                type="number"
                value={outlierThreshold}
                onChange={(e) => setOutlierThreshold(parseFloat(e.target.value))}
              />
            </div>
          )}
          <Button onClick={handlePreprocessing}>Apply Preprocessing</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataPreprocessing;
