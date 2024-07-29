import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FileInfo {
  name: string;
  type: string;
  size: number;
}

interface DataState {
  fileInfo: FileInfo | null;
  parsedData: any[] | null;
  originalData: any[] | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DataState = {
  fileInfo: null,
  parsedData: null,
  originalData: null,
  isLoading: false,
  error: null,
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setFileInfo: (state, action: PayloadAction<FileInfo>) => {
      state.fileInfo = action.payload;
      state.parsedData = null;
      state.originalData = null;
      state.error = null;
    },
    setParsedData: (state, action: PayloadAction<any[]>) => {
      state.parsedData = action.payload;
      if (!state.originalData) {
        state.originalData = action.payload;
      }
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    addCalculatedColumn: (state, action: PayloadAction<any[]>) => {
      state.parsedData = action.payload;
    },
  },
});

export const {
  setFileInfo,
  setParsedData,
  setLoading,
  setError,
  clearError,
  addCalculatedColumn,
} = dataSlice.actions;
export default dataSlice.reducer;
