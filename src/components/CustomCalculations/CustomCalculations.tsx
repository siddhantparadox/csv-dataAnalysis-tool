import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { addCalculatedColumn } from "../../store/dataSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const CustomCalculations: React.FC = () => {
  const dispatch = useDispatch();
  const { parsedData } = useSelector((state: RootState) => state.data);
  const [newColumnName, setNewColumnName] = useState("");
  const [formula, setFormula] = useState("");

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
      // Create a safe evaluation function
      const safeEval = (exp: string, row: any) => {
        const func = new Function(...Object.keys(row), `return ${exp}`);
        return func(...Object.values(row));
      };

      // Test the formula on the first row
      const testResult = safeEval(formula, parsedData[0]);
      if (typeof testResult !== "number") {
        throw new Error("Formula must return a numeric result");
      }

      // Apply the calculation to all rows
      const newData = parsedData.map((row) => ({
        ...row,
        [newColumnName]: safeEval(formula, row),
      }));

      dispatch(addCalculatedColumn(newData));
      toast({
        title: "Success",
        description: `New column "${newColumnName}" has been added.`,
      });
      setNewColumnName("");
      setFormula("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add column: ${error.message}`,
        variant: "destructive",
      });
    }
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
