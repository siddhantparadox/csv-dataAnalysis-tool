import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setParsedData } from "../../store/dataSlice";
import { tidy, mutate, summarize, arrange, desc } from "@tidyjs/tidy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const DataCleaning: React.FC = () => {
  const dispatch = useDispatch();
  const { parsedData } = useSelector((state: RootState) => state.data);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [parameter, setParameter] = useState<string>("");

  const applyOperation = () => {
    if (!parsedData || !selectedColumn || !operation) return;

    let newData;
    try {
      switch (operation) {
        case "removeNulls":
          newData = tidy(parsedData, (df) =>
            df.filter(
              (d) => d[selectedColumn] != null && d[selectedColumn] !== ""
            )
          );
          break;
        case "removeDuplicates":
          newData = tidy(parsedData, (df) =>
            df.filter(
              (d, i, arr) =>
                arr.findIndex(
                  (t) => t[selectedColumn] === d[selectedColumn]
                ) === i
            )
          );
          break;
        case "standardize":
          newData = tidy(
            parsedData,
            mutate({
              [selectedColumn]: (d) => {
                const values = d.map((row) => parseFloat(row[selectedColumn]));
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const std = Math.sqrt(
                  values.reduce((a, b) => a + (b - mean) ** 2, 0) /
                    values.length
                );
                return (parseFloat(d[selectedColumn]) - mean) / std;
              },
            })
          );
          break;
        case "binning":
          const bins = parseInt(parameter);
          if (isNaN(bins)) throw new Error("Invalid number of bins");
          newData = tidy(
            parsedData,
            mutate({
              [`${selectedColumn}_binned`]: (d) => {
                const values = d.map((row) => parseFloat(row[selectedColumn]));
                const min = Math.min(...values);
                const max = Math.max(...values);
                const binSize = (max - min) / bins;
                return Math.floor(
                  (parseFloat(d[selectedColumn]) - min) / binSize
                );
              },
            })
          );
          break;
        default:
          throw new Error("Unknown operation");
      }
      dispatch(setParsedData(newData));
      toast({
        title: "Operation Applied",
        description: `Successfully applied ${operation} to column ${selectedColumn}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to apply operation: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const columns = parsedData ? Object.keys(parsedData[0]) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Cleaning and Transformation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="column-select">Select Column</Label>
            <Select onValueChange={(value) => setSelectedColumn(value)}>
              <SelectTrigger id="column-select">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="operation-select">Select Operation</Label>
            <Select onValueChange={(value) => setOperation(value)}>
              <SelectTrigger id="operation-select">
                <SelectValue placeholder="Select an operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="removeNulls">Remove Null Values</SelectItem>
                <SelectItem value="removeDuplicates">
                  Remove Duplicates
                </SelectItem>
                <SelectItem value="standardize">Standardize</SelectItem>
                <SelectItem value="binning">Binning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {operation === "binning" && (
            <div>
              <Label htmlFor="parameter-input">Number of Bins</Label>
              <Input
                id="parameter-input"
                type="number"
                value={parameter}
                onChange={(e) => setParameter(e.target.value)}
                placeholder="Enter number of bins"
              />
            </div>
          )}
          <Button
            onClick={applyOperation}
            disabled={!selectedColumn || !operation}
          >
            Apply Operation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataCleaning;
