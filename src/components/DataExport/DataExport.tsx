import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

const DataExport: React.FC = () => {
  const { parsedData } = useSelector((state: RootState) => state.data);

  const exportToExcel = () => {
    if (!parsedData) return;

    const worksheet = XLSX.utils.json_to_sheet(parsedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "exported_data.xlsx");
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">Export Data</h2>
      <Button onClick={exportToExcel} disabled={!parsedData}>
        Export to Excel
      </Button>
    </div>
  );
};

export default DataExport;
