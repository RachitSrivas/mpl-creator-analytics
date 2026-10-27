export const formatCurrency = (val) => {
  if (val === null || val === undefined) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 1,
  }).format(val);
};

export const formatNumber = (val) => {
  if (val === null || val === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
};

export const formatCompact = (val) => {
  if (val === null || val === undefined) return '0';
  if (val >= 10000000) return (val / 10000000).toFixed(1) + ' Cr';
  if (val >= 100000) return (val / 100000).toFixed(1) + ' L';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return val.toString();
};

export const formatPercent = (val) => {
  if (val === null || val === undefined) return 'N/A';
  return `${Number(val).toFixed(2)}%`;
};
