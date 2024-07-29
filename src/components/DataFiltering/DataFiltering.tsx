import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setParsedData } from "../../store/dataSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const DataFiltering: React.FC = () => {
  const dispatch = useDispatch();
  const { parsedData, originalData } = useSelector(
    (state: RootState) => state.data
  );
  const [selectedColumn, setSelectedColumn] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [filteredRowCount, setFilteredRowCount] = useState<number | null>(null);

  const applyFilter = () => {
    if (!parsedData || !selectedColumn || !filterValue) return;

    const filteredData = parsedData.filter((row) => {
      const cellValue = row[selectedColumn];
      if (typeof cellValue === "number") {
        return cellValue === parseFloat(filterValue);
      }
      return String(cellValue)
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    });

    dispatch(setParsedData(filteredData));
    setFilteredRowCount(filteredData.length);
    toast({
      title: "Filter Applied",
      description: `Dataset filtered to ${filteredData.length} rows.`,
    });
  };

  const resetFilter = () => {
    if (!originalData) return;
    dispatch(setParsedData(originalData));
    setFilteredRowCount(null);
    toast({
      title: "Filter Reset",
      description: "Dataset restored to original state.",
    });
  };

  if (!parsedData || parsedData.length === 0) return null;

  const columns = Object.keys(parsedData[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Filtering</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select onValueChange={setSelectedColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Select column to filter" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Enter filter value"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          <div className="space-x-2">
            <Button onClick={applyFilter}>Apply Filter</Button>
            <Button variant="outline" onClick={resetFilter}>
              Reset Filter
            </Button>
          </div>
          {filteredRowCount !== null && (
            <p>Filtered dataset contains {filteredRowCount} rows.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataFiltering;
