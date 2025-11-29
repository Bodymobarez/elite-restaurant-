export function formatEGP(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0 EGP';
  return `${numAmount.toLocaleString('en-EG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} EGP`;
}

export function formatPriceRange(range: string): string {
  const ranges: Record<string, string> = {
    '$': '100-300 EGP',
    '$$': '300-600 EGP', 
    '$$$': '600-1000 EGP',
    '$$$$': '1000+ EGP',
  };
  return ranges[range] || range;
}
