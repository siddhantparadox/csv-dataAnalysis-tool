import * as mathjs from "mathjs";
import { ColumnStats } from '../types';

// Export ColumnStats interface
export { ColumnStats };

export const calculateColumnStats = (
  data: any[],
  column: string
): ColumnStats => {
  const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
  values.sort((a, b) => a - b);

  const validCount = values.length;
  const invalidCount = data.length - validCount;
  const missingCount = data.filter(row => row[column] === null || row[column] === undefined || row[column] === '').length;
  const missingPercentage = (missingCount / data.length) * 100;
  const uniqueCount = new Set(values).size;

  const mean = mathjs.mean(values);
  const median = mathjs.median(values);
  const min = mathjs.min(values);
  const max = mathjs.max(values);
  const stddev = mathjs.std(values);
  const variance = mathjs.variance(values);
  
  // Implement skewness and kurtosis manually
  const skewness = calculateSkewness(values, mean, stddev);
  const kurtosis = calculateKurtosis(values, mean, stddev);

  const q1Index = Math.floor(values.length / 4);
  const q3Index = Math.floor(3 * values.length / 4);
  const q1 = values[q1Index];
  const q3 = values[q3Index];
  const iqr = q3 - q1;

  const mode = calculateMode(values);

  const outliers = values.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length;

  return {
    mean,
    median,
    mode,
    min,
    max,
    stddev,
    q1,
    q3,
    iqr,
    missingCount,
    missingPercentage,
    uniqueCount,
    type: "numeric",
    outliers,
    variance,
    skewness,
    kurtosis,
    validCount,
    invalidCount
  };
};

function calculateSkewness(values: number[], mean: number, stddev: number): number {
  const n = values.length;
  const m3 = values.reduce((sum, value) => sum + Math.pow(value - mean, 3), 0) / n;
  return m3 / Math.pow(stddev, 3);
}

function calculateKurtosis(values: number[], mean: number, stddev: number): number {
  const n = values.length;
  const m4 = values.reduce((sum, value) => sum + Math.pow(value - mean, 4), 0) / n;
  return m4 / Math.pow(stddev, 4) - 3;
}

function calculateMode(values: number[]): number | number[] {
  const counts = new Map<number, number>();
  let maxCount = 0;
  
  for (const value of values) {
    const count = (counts.get(value) || 0) + 1;
    counts.set(value, count);
    if (count > maxCount) {
      maxCount = count;
    }
  }
  
  const modes = Array.from(counts.entries())
    .filter(([_, count]) => count === maxCount)
    .map(([value, _]) => value);
  
  return modes.length === 1 ? modes[0] : modes;
}

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
