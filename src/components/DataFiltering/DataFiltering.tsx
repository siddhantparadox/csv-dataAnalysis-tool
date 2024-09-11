import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { updateParsedData } from "../../store/dataSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DataFiltering: React.FC = () => {
  const dispatch = useDispatch();
  const { parsedData, originalData } = useSelector(
    (state: RootState) => state.data
  );
  const [selectedColumn, setSelectedColumn] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const applyFilter = () => {
    if (!originalData || !selectedColumn || !filterValue) return;

    const filteredData = originalData.filter((row) =>
      String(row[selectedColumn]).toLowerCase().includes(filterValue.toLowerCase())
    );

    dispatch(updateParsedData(filteredData));
  };

  const resetFilter = () => {
    if (originalData) {
      dispatch(updateParsedData(originalData));
    }
    setSelectedColumn("");
    setFilterValue("");
  };

  const columns = originalData ? Object.keys(originalData[0]) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Filtering</CardTitle>
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
            <Label htmlFor="filter-value">Filter Value</Label>
            <Input
              id="filter-value"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Enter filter value"
            />
          </div>
          <Button onClick={applyFilter} disabled={!selectedColumn || !filterValue}>
            Apply Filter
          </Button>
          <Button onClick={resetFilter} variant="outline">
            Reset Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataFiltering;
