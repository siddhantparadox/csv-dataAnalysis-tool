import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";
import {
  setFileInfo,
  setLoading,
  setError,
  setParsedData,
} from "../../store/dataSlice";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const FileUpload: React.FC = () => {
  const dispatch = useDispatch();

  const parseFile = useCallback((file: File) => {
    dispatch(setLoading(true));
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      Papa.parse(file, {
        complete: (results) => {
          dispatch(setParsedData(results.data));
        },
        header: true,
        error: (error) => {
          dispatch(setError(`Error parsing CSV: ${error.message}`));
        },
      });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet);
          dispatch(setParsedData(parsedData));
        } catch (error) {
          dispatch(
            setError(`Error parsing Excel file: ${(error as Error).message}`)
          );
        }
      };
      reader.onerror = (error) => {
        dispatch(setError(`Error reading file: ${error}`));
      };
      reader.readAsBinaryString(file);
    } else {
      dispatch(setError("Unsupported file type"));
    }
  }, [dispatch]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        dispatch(
          setFileInfo({
            name: file.name,
            type: file.type,
            size: file.size,
          })
        );
        parseFile(file);
      }
    },
    [dispatch, parseFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
    >
      <input {...getInputProps()} />
      <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
      {isDragActive ? (
        <p className="text-lg text-blue-600">Drop the file here ...</p>
      ) : (
        <div>
          <p className="text-lg mb-2">
            Drag &apos;n&apos; drop some files here, or click to select files
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: CSV, Excel (XLSX, XLS)
          </p>
          <Button className="mt-4">Select File</Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
