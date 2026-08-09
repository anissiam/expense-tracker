import { CurrencyConfig, CurrencyCode } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel (₪)', flag: '₪' },
  SAR: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  EGP: { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
  JOD: { code: 'JOD', symbol: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' },
  QAR: { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
  KWD: { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
};

export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'USD'): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  if (['USD', 'EUR', 'GBP'].includes(currencyCode)) {
    return `${config.symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${config.symbol}`;
}
