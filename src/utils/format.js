export const formatCurrency = (value, simple = false) => {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    if (simple) return 'R$0k';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
  }
  if (simple && numValue >= 1000) {
    return `R$${(numValue / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};
