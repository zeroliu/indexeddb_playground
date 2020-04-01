// Z value for 95% confidence interval.
const Z = 1.96;

export function ci(data: number[]): [number, number] {
  const m = mean(data);
  const variation = (Z * std(data)) / Math.sqrt(data.length);
  return [m - variation, m + variation];
}

export function mean(data: number[]): number {
  return data.reduce((sum, num) => sum + num, 0) / data.length;
}

function std(data: number[]): number {
  const m = mean(data);
  return Math.sqrt(
    data.reduce((sum, num) => sum + (num - m) * (num - m), 0) / data.length
  );
}

export function median(data: number[]): number {
  const length = data.length;
  if (length % 2 === 0) {
    return (data[length / 2] + data[length / 2 - 1]) / 2;
  }
  return data[Math.floor(length / 2)];
}
