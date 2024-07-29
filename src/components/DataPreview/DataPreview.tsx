import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DataPreview: React.FC = () => {
  const { parsedData, isLoading, error } = useSelector(
    (state: RootState) => state.data
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!parsedData || parsedData.length === 0) {
    return <div>No data available. Please upload a file.</div>;
  }

  const headers = Object.keys(parsedData[0]);
  const previewRows = parsedData.slice(0, 5);

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">Data Preview</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewRows.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={`${index}-${header}`}>
                    {row[header]}
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

export default DataPreview;
