import React, { useState } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Import Button component

const DataPreview: React.FC = () => {
  const { parsedData, loading, error } = useSelector(
    (state: RootState) => state.data
  );
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!parsedData || parsedData.length === 0) return <div>No data available</div>;

  const totalPages = Math.ceil(parsedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = parsedData.slice(startIndex, endIndex);

  const headers = Object.keys(parsedData[0]);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(<PaginationEllipsis key="ellipsis-start" />);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => setCurrentPage(page)}
            isActive={currentPage === page}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationEllipsis key="ellipsis-end" />);
      }
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Data Preview</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="rows-per-page">Rows per page:</Label>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]" id="rows-per-page">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
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
            {currentData.map((row, index) => (
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
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <PaginationPrevious />
            </Button>
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              <PaginationNext />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default DataPreview;
