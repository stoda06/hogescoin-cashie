const API_BASE_URL =
  'https://api.frankfurter.dev/v1';

const DEFAULT_BASE_CURRENCY =
  'AUD';

const DEFAULT_DISPLAY_CURRENCIES = [
  'AUD',
  'USD',
  'GBP',
  'EUR',
  'NZD',
  'CAD',
  'JPY',
  'SGD',
  'INR',
];

const CACHE_DURATION_MS =
  60 * 60 * 1000;

const DEFAULT_FETCH_TIMEOUT_MS =
  15 * 1000;

let cachedSnapshot =
  null;

async function fetchWithTimeout(
  url,
  options = {},
  timeoutMs =
    DEFAULT_FETCH_TIMEOUT_MS
) {
  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () => {
        controller.abort();
      },
      timeoutMs
    );

  try {
    return await fetch(
      url,
      {
        ...options,

        signal:
          controller.signal,
      }
    );
  } finally {
    clearTimeout(
      timer
    );
  }
}

function normaliseCurrency(
  currency = DEFAULT_BASE_CURRENCY
) {
  return String(
    currency ||
      DEFAULT_BASE_CURRENCY
  )
    .trim()
    .toUpperCase();
}

function toSafeNumber(
  value,
  fallback = 0
) {
  const numericValue =
    Number(value);

  return Number.isFinite(
    numericValue
  )
    ? numericValue
    : fallback;
}

function uniqueCurrencies(
  currencies = []
) {
  return [
    ...new Set(
      currencies
        .map(
          normaliseCurrency
        )
        .filter(Boolean)
    ),
  ];
}

function isCacheFresh(
  snapshot = cachedSnapshot
) {
  if (
    !snapshot?.fetchedAt
  ) {
    return false;
  }

  const fetchedAtMs =
    new Date(
      snapshot.fetchedAt
    ).getTime();

  if (
    Number.isNaN(
      fetchedAtMs
    )
  ) {
    return false;
  }

  return (
    Date.now() -
      fetchedAtMs <
    CACHE_DURATION_MS
  );
}

/*
 * A cached snapshot may only be served when it holds
 * a rate entry for every requested currency, so a
 * snapshot fetched for one currency set is never
 * returned for a request needing other currencies.
 */
function snapshotHasCurrencies(
  snapshot,
  currencies = []
) {
  if (
    !snapshot?.rates
  ) {
    return false;
  }

  return currencies.every(
    currency =>
      Object.prototype.hasOwnProperty.call(
        snapshot.rates,
        currency
      )
  );
}

function createFallbackRates({
  baseCurrency =
    DEFAULT_BASE_CURRENCY,
  currencies =
    DEFAULT_DISPLAY_CURRENCIES,
} = {}) {
  const safeBaseCurrency =
    normaliseCurrency(
      baseCurrency
    );

  const requestedCurrencies =
    uniqueCurrencies([
      safeBaseCurrency,
      ...currencies,
    ]);

  return requestedCurrencies.reduce(
    (
      rates,
      currency
    ) => {
      rates[currency] =
        currency ===
        safeBaseCurrency
          ? 1
          : null;

      return rates;
    },
    {}
  );
}

function createSnapshot({
  baseCurrency,
  rates,
  sourceDate = null,
  source = 'fallback',
  stale = true,
  error = null,
} = {}) {
  const safeBaseCurrency =
    normaliseCurrency(
      baseCurrency
    );

  return {
    baseCurrency:
      safeBaseCurrency,

    rates: {
      ...rates,
      [safeBaseCurrency]:
        1,
    },

    sourceDate,

    fetchedAt:
      new Date()
        .toISOString(),

    source,

    stale,

    error:
      error
        ? String(
            error.message ||
              error
          )
        : null,
  };
}

export function getCachedFxSnapshot() {
  return cachedSnapshot
    ? {
        ...cachedSnapshot,

        rates: {
          ...cachedSnapshot
            .rates,
        },
      }
    : null;
}

export function clearFxCache() {
  cachedSnapshot =
    null;
}

export async function fetchFxRates({
  baseCurrency =
    DEFAULT_BASE_CURRENCY,
  currencies =
    DEFAULT_DISPLAY_CURRENCIES,
  forceRefresh = false,
} = {}) {
  const safeBaseCurrency =
    normaliseCurrency(
      baseCurrency
    );

  const requestedCurrencies =
    uniqueCurrencies([
      safeBaseCurrency,
      ...currencies,
    ]);

  if (
    !forceRefresh &&
    cachedSnapshot &&
    cachedSnapshot
      .baseCurrency ===
      safeBaseCurrency &&
    snapshotHasCurrencies(
      cachedSnapshot,
      requestedCurrencies
    ) &&
    isCacheFresh()
  ) {
    return {
      ...cachedSnapshot,

      rates: {
        ...cachedSnapshot
          .rates,
      },

      source:
        'cache',

      stale:
        false,
    };
  }

  const targetCurrencies =
    requestedCurrencies.filter(
      currency =>
        currency !==
        safeBaseCurrency
    );

  const query =
    targetCurrencies.length > 0
      ? `?base=${encodeURIComponent(
          safeBaseCurrency
        )}&symbols=${encodeURIComponent(
          targetCurrencies.join(
            ','
          )
        )}`
      : `?base=${encodeURIComponent(
          safeBaseCurrency
        )}`;

  const url =
    `${API_BASE_URL}/latest${query}`;

  try {
    const response =
      await fetchWithTimeout(
        url,
        {
          method:
            'GET',

          headers: {
            Accept:
              'application/json',
          },
        }
      );

    if (
      !response.ok
    ) {
      throw new Error(
        `FX request failed with status ${response.status}.`
      );
    }

    const data =
      await response.json();

    const returnedRates =
      data?.rates &&
      typeof data.rates ===
        'object'
        ? data.rates
        : {};

    const rates =
      requestedCurrencies.reduce(
        (
          result,
          currency
        ) => {
          if (
            currency ===
            safeBaseCurrency
          ) {
            result[currency] =
              1;

            return result;
          }

          const rate =
            toSafeNumber(
              returnedRates[
                currency
              ],
              NaN
            );

          result[currency] =
            Number.isFinite(
              rate
            )
              ? rate
              : null;

          return result;
        },
        {}
      );

    /*
     * Merge still-fresh rates for the same base into
     * the new snapshot so previously fetched
     * currencies stay available alongside the ones
     * just requested.
     */
    const mergedRates =
      cachedSnapshot
        ?.baseCurrency ===
        safeBaseCurrency &&
      isCacheFresh()
        ? {
            ...cachedSnapshot
              .rates,

            ...rates,
          }
        : rates;

    cachedSnapshot =
      createSnapshot({
        baseCurrency:
          safeBaseCurrency,

        rates:
          mergedRates,

        sourceDate:
          data?.date ||
          null,

        source:
          'live',

        stale:
          false,
      });

    return {
      ...cachedSnapshot,

      rates: {
        ...cachedSnapshot
          .rates,
      },
    };
  } catch (
    error
  ) {
    if (
      cachedSnapshot &&
      cachedSnapshot
        .baseCurrency ===
        safeBaseCurrency
    ) {
      /*
       * Backfill any requested currency the cached
       * snapshot is missing with a null rate so the
       * returned shape always covers the request.
       */
      return {
        ...cachedSnapshot,

        rates: {
          ...createFallbackRates({
            baseCurrency:
              safeBaseCurrency,

            currencies:
              requestedCurrencies,
          }),

          ...cachedSnapshot
            .rates,
        },

        source:
          'stale-cache',

        stale:
          true,

        error:
          String(
            error.message ||
              error
          ),
      };
    }

    const fallbackRates =
      createFallbackRates({
        baseCurrency:
          safeBaseCurrency,

        currencies:
          requestedCurrencies,
      });

    return createSnapshot({
      baseCurrency:
        safeBaseCurrency,

      rates:
        fallbackRates,

      source:
        'fallback',

      stale:
        true,

      error,
    });
  }
}

export function getRate({
  snapshot,
  fromCurrency =
    DEFAULT_BASE_CURRENCY,
  toCurrency =
    DEFAULT_BASE_CURRENCY,
} = {}) {
  const safeFromCurrency =
    normaliseCurrency(
      fromCurrency
    );

  const safeToCurrency =
    normaliseCurrency(
      toCurrency
    );

  if (
    safeFromCurrency ===
    safeToCurrency
  ) {
    return 1;
  }

  if (
    !snapshot?.rates ||
    !snapshot
      .baseCurrency
  ) {
    return null;
  }

  const baseCurrency =
    normaliseCurrency(
      snapshot
        .baseCurrency
    );

  const fromRate =
    safeFromCurrency ===
    baseCurrency
      ? 1
      : toSafeNumber(
          snapshot.rates[
            safeFromCurrency
          ],
          NaN
        );

  const toRate =
    safeToCurrency ===
    baseCurrency
      ? 1
      : toSafeNumber(
          snapshot.rates[
            safeToCurrency
          ],
          NaN
        );

  if (
    !Number.isFinite(
      fromRate
    ) ||
    !Number.isFinite(
      toRate
    ) ||
    fromRate <= 0 ||
    toRate <= 0
  ) {
    return null;
  }

  return (
    toRate /
    fromRate
  );
}

export function convertCurrency({
  amount = 0,
  fromCurrency =
    DEFAULT_BASE_CURRENCY,
  toCurrency =
    DEFAULT_BASE_CURRENCY,
  snapshot,
} = {}) {
  const safeAmount =
    toSafeNumber(
      amount,
      0
    );

  const rate =
    getRate({
      snapshot,
      fromCurrency,
      toCurrency,
    });

  if (
    rate === null
  ) {
    return {
      amount:
        safeAmount,

      convertedAmount:
        null,

      rate:
        null,

      fromCurrency:
        normaliseCurrency(
          fromCurrency
        ),

      toCurrency:
        normaliseCurrency(
          toCurrency
        ),

      available:
        false,
    };
  }

  return {
    amount:
      safeAmount,

    convertedAmount:
      safeAmount *
      rate,

    rate,

    fromCurrency:
      normaliseCurrency(
        fromCurrency
      ),

    toCurrency:
      normaliseCurrency(
        toCurrency
      ),

    available:
      true,
  };
}

export async function convertWithLatestRates({
  amount = 0,
  fromCurrency =
    DEFAULT_BASE_CURRENCY,
  toCurrency =
    DEFAULT_BASE_CURRENCY,
  forceRefresh = false,
} = {}) {
  const safeFromCurrency =
    normaliseCurrency(
      fromCurrency
    );

  const safeToCurrency =
    normaliseCurrency(
      toCurrency
    );

  const snapshot =
    await fetchFxRates({
      baseCurrency:
        DEFAULT_BASE_CURRENCY,

      currencies: [
        safeFromCurrency,
        safeToCurrency,
      ],

      forceRefresh,
    });

  return {
    ...convertCurrency({
      amount,
      fromCurrency:
        safeFromCurrency,
      toCurrency:
        safeToCurrency,
      snapshot,
    }),

    snapshot,
  };
}

export function formatCurrencyAmount({
  amount = 0,
  currency =
    DEFAULT_BASE_CURRENCY,
  locale = 'en-AU',
  maximumFractionDigits = 2,
} = {}) {
  const safeAmount =
    toSafeNumber(
      amount,
      0
    );

  const safeCurrency =
    normaliseCurrency(
      currency
    );

  try {
    return new Intl
      .NumberFormat(
        locale,
        {
          style:
            'currency',

          currency:
            safeCurrency,

          minimumFractionDigits:
            2,

          maximumFractionDigits:
            maximumFractionDigits,
        }
      )
      .format(
        safeAmount
      );
  } catch {
    return `${safeCurrency} ${safeAmount.toFixed(
      maximumFractionDigits
    )}`;
  }
}

export function getSupportedDisplayCurrencies() {
  return [
    ...DEFAULT_DISPLAY_CURRENCIES,
  ];
}

export const FX_DEFAULTS = {
  apiBaseUrl:
    API_BASE_URL,

  baseCurrency:
    DEFAULT_BASE_CURRENCY,

  displayCurrencies:
    [
      ...DEFAULT_DISPLAY_CURRENCIES,
    ],

  cacheDurationMs:
    CACHE_DURATION_MS,
};