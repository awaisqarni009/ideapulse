'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PKR' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // Multiplier relative to 1 USD
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, flag: '🇬🇧' },
  PKR: { code: 'PKR', symbol: 'Rs ', name: 'Pakistani Rupee', rate: 278.0, flag: '🇵🇰' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rate: 1.52, flag: '🇦🇺' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 155.0, flag: '🇯🇵' },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number, forceDecimals?: boolean) => string;
  currencyConfig: CurrencyConfig;
  currenciesList: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  formatPrice: (amount) => `$${amount}`,
  currencyConfig: CURRENCIES.USD,
  currenciesList: Object.values(CURRENCIES),
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pulsewear_currency') as CurrencyCode;
      if (saved && CURRENCIES[saved]) {
        setCurrencyState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (!CURRENCIES[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem('pulsewear_currency', code);
    } catch {
      // ignore
    }
  };

  const formatPrice = (amountInUSD: number, forceDecimals: boolean = false): string => {
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = amountInUSD * config.rate;

    // Zero-decimal currencies like PKR and JPY
    if (config.code === 'PKR' || config.code === 'JPY') {
      return `${config.symbol}${Math.round(converted).toLocaleString()}`;
    }

    if (forceDecimals || converted % 1 !== 0) {
      return `${config.symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        currencyConfig: CURRENCIES[currency] || CURRENCIES.USD,
        currenciesList: Object.values(CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
