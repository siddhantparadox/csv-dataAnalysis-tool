import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DataState {
  fileInfo: {
    name: string;
    type: string;
    size: number;
  } | null;
  parsedData: any[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  fileInfo: null,
  parsedData: null,
  loading: false,
  error: null,
};

interface CalculatedColumnPayload {
  newColumnName: string;
  newData: any[];
}

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setFileInfo: (state, action: PayloadAction<DataState['fileInfo']>) => {
      state.fileInfo = action.payload;
    },
    setParsedData: (state, action: PayloadAction<any[]>) => {
      state.parsedData = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addCalculatedColumn: (state, action: PayloadAction<CalculatedColumnPayload>) => {
      if (state.parsedData) {
        state.parsedData = action.payload.newData;
      }
    },
  },
});

export const {
  setFileInfo,
  setParsedData,
  setLoading,
  setError,
  addCalculatedColumn,
} = dataSlice.actions;
export default dataSlice.reducer;
