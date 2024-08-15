import * as mathjs from "mathjs";

export interface ColumnStats {
  mean: number | null;
  median: number | null;
  mode: number | number[] | null;
  min: number | null;
  max: number | null;
  stddev: number | null;
  variance: number | null;
  skewness: number | null;
  kurtosis: number | null;
  validCount: number;
  invalidCount: number;
}

export interface CorrelationResult {
  pearson: number | null;
  spearman: number | null;
  kendall: number | null;
}

export const calculateColumnStats = (
  data: any[],
  column: string
): ColumnStats => {
  const allValues = data.map((row) => row[column]);
  const values = allValues
    .map((val) => (typeof val === "string" ? val.trim() : val))
    .map((val) => parseFloat(val))
    .filter((val) => !isNaN(val) && isFinite(val));

  const validCount = values.length;
  const invalidCount = allValues.length - validCount;

  if (validCount === 0) {
    return {
      mean: null,
      median: null,
      mode: null,
      min: null,
      max: null,
      stddev: null,
      variance: null,
      skewness: null,
      kurtosis: null,
      validCount,
      invalidCount,
    };
  }

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
    validCount,
    invalidCount,
  };
};

export const detectColumnTypes = (data: any[]): Record<string, string> => {
  const columnTypes: Record<string, string> = {};

  if (data.length === 0) return columnTypes;

  const columns = Object.keys(data[0]);

  columns.forEach((column) => {
    const allValues = data.map((row) => row[column]);
    const nonNullValues = allValues.filter(
      (val) => val !== null && val !== "" && val !== undefined
    );

    if (nonNullValues.length === 0) {
      columnTypes[column] = "unknown";
      return;
    }

    const numericCount = nonNullValues.filter((val) => {
      const parsed = parseFloat(val);
      return !isNaN(parsed) && isFinite(parsed);
    }).length;
    const booleanCount = nonNullValues.filter(
      (val) =>
        typeof val === "boolean" ||
        val === "true" ||
        val === "false" ||
        val === "0" ||
        val === "1"
    ).length;
    const dateCount = nonNullValues.filter(
      (val) => !isNaN(Date.parse(val))
    ).length;

    const typeThreshold = nonNullValues.length * 0.9; // 90% threshold

    if (numericCount >= typeThreshold) {
      columnTypes[column] = "numeric";
    } else if (booleanCount >= typeThreshold) {
      columnTypes[column] = "boolean";
    } else if (dateCount >= typeThreshold) {
      columnTypes[column] = "date";
    } else {
      columnTypes[column] = "string";
    }
  });

  return columnTypes;
};

export const calculateCorrelation = (
  data: any[],
  column1: string,
  column2: string
): CorrelationResult => {
  const values1 = data
    .map((row) => parseFloat(row[column1]))
    .filter((val) => !isNaN(val) && isFinite(val));
  const values2 = data
    .map((row) => parseFloat(row[column2]))
    .filter((val) => !isNaN(val) && isFinite(val));

  if (values1.length !== values2.length || values1.length === 0) {
    return { pearson: null, spearman: null, kendall: null };
  }

  const pearson = calculatePearsonCorrelation(values1, values2);
  const spearman = calculateSpearmanCorrelation(values1, values2);
  const kendall = calculateKendallCorrelation(values1, values2);

  return { pearson, spearman, kendall };
};

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = mathjs.sum(x);
  const sumY = mathjs.sum(y);
  const sumXY = mathjs.sum(x.map((xi, i) => xi * y[i]));
  const sumX2 = mathjs.sum(x.map((xi) => xi * xi));
  const sumY2 = mathjs.sum(y.map((yi) => yi * yi));

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return numerator / denominator;
}

function calculateSpearmanCorrelation(x: number[], y: number[]): number {
  const rankX = calculateRanks(x);
  const rankY = calculateRanks(y);
  return calculatePearsonCorrelation(rankX, rankY);
}

function calculateKendallCorrelation(x: number[], y: number[]): number {
  let concordantPairs = 0;
  let discordantPairs = 0;

  for (let i = 0; i < x.length; i++) {
    for (let j = i + 1; j < x.length; j++) {
      const signX = Math.sign(x[i] - x[j]);
      const signY = Math.sign(y[i] - y[j]);
      if (signX === signY) {
        concordantPairs++;
      } else if (signX !== 0 && signY !== 0) {
        discordantPairs++;
      }
    }
  }

  return (
    (concordantPairs - discordantPairs) / (0.5 * x.length * (x.length - 1))
  );
}

function calculateRanks(values: number[]): number[] {
  const sorted = values.slice().sort((a, b) => a - b);
  const ranks = values.map((v) => sorted.indexOf(v) + 1);
  return ranks;
}
