export interface ColumnStats {
  mean: number;
  median: number;
  mode: number | string;
  min: number;
  max: number;
  stddev: number;
  q1: number;
  q3: number;
  iqr: number;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  type: string; // Add this line
  outliers: number; // Add this line if not already present
  // Add these new properties
  variance: number;
  skewness: number;
  kurtosis: number;
  validCount: number;
  invalidCount: number;
}
