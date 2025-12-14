export function formatCompactNumber(num: number): string {
  if (num === null || num === undefined) return '0';

  const formatter = new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 2,
  });

  return formatter.format(num);
}