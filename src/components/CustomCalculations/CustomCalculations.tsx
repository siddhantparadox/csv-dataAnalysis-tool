import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { addCalculatedColumn } from "../../store/dataSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const CustomCalculations: React.FC = () => {
  const [newColumnName, setNewColumnName] = useState("");
  const [formula, setFormula] = useState("");
  const { parsedData } = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleAddColumn = () => {
    if (!newColumnName || !formula) {
      toast({
        title: "Error",
        description: "Please provide both a column name and a formula.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!parsedData || parsedData.length === 0) {
        throw new Error("No data available for calculation");
      }

      // Test the formula on the first row
      const testResult = safeEval(formula, parsedData[0]);
      if (typeof testResult !== "number") {
        throw new Error("Formula must return a numeric result");
      }

      const newData = parsedData.map((row) => ({
        ...row,
        [newColumnName]: safeEval(formula, row),
      }));

      dispatch(addCalculatedColumn({ newColumnName, newData }));
      toast({
        title: "Success",
        description: `New column "${newColumnName}" added successfully.`,
      });
      setNewColumnName("");
      setFormula("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add column: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const safeEval = (formula: string, row: any): number => {
    // Implementation of safeEval function (as before)
    // ...
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Calculations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="newColumnName">New Column Name</Label>
            <Input
              id="newColumnName"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="e.g., Total_Value"
            />
          </div>
          <div>
            <Label htmlFor="formula">Formula</Label>
            <Input
              id="formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g., Quantity * Price"
            />
          </div>
          <Button onClick={handleAddColumn}>Add Calculated Column</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCalculations;
