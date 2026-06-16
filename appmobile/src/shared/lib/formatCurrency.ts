export function formatCurrency(amount: number, symbol: string, locale: string): string {
    if (amount <= 0) return 'Cotización';
    return `${symbol}${amount.toLocaleString(locale)}`;
}
