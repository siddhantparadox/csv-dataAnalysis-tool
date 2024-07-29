import * as mathjs from "mathjs";

export interface ColumnStats {
  mean: number;
  median: number;
  mode: number | number[];
  min: number;
  max: number;
  stddev: number;
  variance: number;
  skewness: number;
  kurtosis: number;
}

export const calculateColumnStats = (
  data: any[],
  column: string
): ColumnStats => {
  const values = data
    .map((row) => parseFloat(row[column]))
    .filter((val) => !isNaN(val));

  const mean = mathjs.mean(values);
  const median = mathjs.median(values);
  const mode = mathjs.mode(values);
  const min = mathjs.min(values);
  const max = mathjs.max(values);
  const stddev = mathjs.std(values);
  const variance = mathjs.variance(values);

  // Calculate skewness
  const skewness = mathjs.mean(
    values.map((v) => Math.pow((v - mean) / stddev, 3))
  );

  // Calculate kurtosis
  const kurtosis =
    mathjs.mean(values.map((v) => Math.pow((v - mean) / stddev, 4))) - 3;

  return {
    mean,
    median,
    mode,
    min,
    max,
    stddev,
    variance,
    skewness,
    kurtosis,
  };
};

export const detectColumnTypes = (data: any[]): Record<string, string> => {
  const columnTypes: Record<string, string> = {};

  if (data.length === 0) return columnTypes;

  const columns = Object.keys(data[0]);

  columns.forEach((column) => {
    const sampleValues = data.slice(0, 100).map((row) => row[column]);

    if (
      sampleValues.every(
        (val) =>
          typeof val === "number" ||
          (typeof val === "string" && !isNaN(parseFloat(val)))
      )
    ) {
      columnTypes[column] = "numeric";
    } else if (
      sampleValues.every(
        (val) => typeof val === "boolean" || val === "true" || val === "false"
      )
    ) {
      columnTypes[column] = "boolean";
    } else if (sampleValues.every((val) => !isNaN(Date.parse(val)))) {
      columnTypes[column] = "date";
    } else {
      columnTypes[column] = "string";
    }
  });

  return columnTypes;
};
