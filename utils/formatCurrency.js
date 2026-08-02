export default function formatCurrency(
  cents,
  currency = 'AUD',
  locale = 'en-AU'
) {
  const safeCents = Number.isFinite(cents) ? cents : 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(safeCents / 100);
}