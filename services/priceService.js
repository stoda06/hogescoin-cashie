import {
  fetchFxRates,
  getRate,
} from './fxService';

const DEFAULT_BASE_CURRENCY =
  'AUD';

const DEFAULT_DISPLAY_CURRENCY =
  'AUD';

const DEFAULT_SOL_PRICE_AUD =
  200;

const DEFAULT_HOGES_PER_SOL =
  25000;

const PRICE_CACHE_DURATION_MS =
  60 * 1000;

let cachedPriceSnapshot =
  null;

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

function normaliseCurrency(
  currency = DEFAULT_DISPLAY_CURRENCY
) {
  return String(
    currency ||
      DEFAULT_DISPLAY_CURRENCY
  )
    .trim()
    .toUpperCase();
}

function createTimestamp() {
  return new Date()
    .toISOString();
}

function isSnapshotFresh(
  snapshot =
    cachedPriceSnapshot
) {
  if (
    !snapshot?.updatedAt
  ) {
    return false;
  }

  const updatedAt =
    new Date(
      snapshot.updatedAt
    ).getTime();

  if (
    Number.isNaN(
      updatedAt
    )
  ) {
    return false;
  }

  return (
    Date.now() -
      updatedAt <
    PRICE_CACHE_DURATION_MS
  );
}

export function calculateHogesPriceAud({
  solPriceAud =
    DEFAULT_SOL_PRICE_AUD,
  hogesPerSol =
    DEFAULT_HOGES_PER_SOL,
} = {}) {
  const safeSolPriceAud =
    Math.max(
      0,
      toSafeNumber(
        solPriceAud,
        DEFAULT_SOL_PRICE_AUD
      )
    );

  const safeHogesPerSol =
    Math.max(
      0,
      toSafeNumber(
        hogesPerSol,
        DEFAULT_HOGES_PER_SOL
      )
    );

  if (
    safeHogesPerSol === 0
  ) {
    return 0;
  }

  return (
    safeSolPriceAud /
    safeHogesPerSol
  );
}

export function calculateHogesPerAud({
  hogesPriceAud = 0,
} = {}) {
  const safeHogesPriceAud =
    Math.max(
      0,
      toSafeNumber(
        hogesPriceAud
      )
    );

  if (
    safeHogesPriceAud === 0
  ) {
    return 0;
  }

  return (
    1 /
    safeHogesPriceAud
  );
}

export function calculateSolPerAud({
  solPriceAud =
    DEFAULT_SOL_PRICE_AUD,
} = {}) {
  const safeSolPriceAud =
    Math.max(
      0,
      toSafeNumber(
        solPriceAud,
        DEFAULT_SOL_PRICE_AUD
      )
    );

  if (
    safeSolPriceAud === 0
  ) {
    return 0;
  }

  return (
    1 /
    safeSolPriceAud
  );
}

export function convertAudToHoges({
  amountAud = 0,
  hogesPriceAud = 0,
} = {}) {
  const safeAmountAud =
    Math.max(
      0,
      toSafeNumber(
        amountAud
      )
    );

  const safeHogesPriceAud =
    Math.max(
      0,
      toSafeNumber(
        hogesPriceAud
      )
    );

  if (
    safeHogesPriceAud === 0
  ) {
    return 0;
  }

  return (
    safeAmountAud /
    safeHogesPriceAud
  );
}

export function convertHogesToAud({
  hogesAmount = 0,
  hogesPriceAud = 0,
} = {}) {
  const safeHogesAmount =
    Math.max(
      0,
      toSafeNumber(
        hogesAmount
      )
    );

  const safeHogesPriceAud =
    Math.max(
      0,
      toSafeNumber(
        hogesPriceAud
      )
    );

  return (
    safeHogesAmount *
    safeHogesPriceAud
  );
}

export function convertAudToSol({
  amountAud = 0,
  solPriceAud =
    DEFAULT_SOL_PRICE_AUD,
} = {}) {
  const safeAmountAud =
    Math.max(
      0,
      toSafeNumber(
        amountAud
      )
    );

  const safeSolPriceAud =
    Math.max(
      0,
      toSafeNumber(
        solPriceAud,
        DEFAULT_SOL_PRICE_AUD
      )
    );

  if (
    safeSolPriceAud === 0
  ) {
    return 0;
  }

  return (
    safeAmountAud /
    safeSolPriceAud
  );
}

export function convertSolToAud({
  solAmount = 0,
  solPriceAud =
    DEFAULT_SOL_PRICE_AUD,
} = {}) {
  const safeSolAmount =
    Math.max(
      0,
      toSafeNumber(
        solAmount
      )
    );

  const safeSolPriceAud =
    Math.max(
      0,
      toSafeNumber(
        solPriceAud,
        DEFAULT_SOL_PRICE_AUD
      )
    );

  return (
    safeSolAmount *
    safeSolPriceAud
  );
}

export function convertHogesToSol({
  hogesAmount = 0,
  hogesPerSol =
    DEFAULT_HOGES_PER_SOL,
} = {}) {
  const safeHogesAmount =
    Math.max(
      0,
      toSafeNumber(
        hogesAmount
      )
    );

  const safeHogesPerSol =
    Math.max(
      0,
      toSafeNumber(
        hogesPerSol,
        DEFAULT_HOGES_PER_SOL
      )
    );

  if (
    safeHogesPerSol === 0
  ) {
    return 0;
  }

  return (
    safeHogesAmount /
    safeHogesPerSol
  );
}

export function convertSolToHoges({
  solAmount = 0,
  hogesPerSol =
    DEFAULT_HOGES_PER_SOL,
} = {}) {
  const safeSolAmount =
    Math.max(
      0,
      toSafeNumber(
        solAmount
      )
    );

  const safeHogesPerSol =
    Math.max(
      0,
      toSafeNumber(
        hogesPerSol,
        DEFAULT_HOGES_PER_SOL
      )
    );

  return (
    safeSolAmount *
    safeHogesPerSol
  );
}

export function convertAudToDisplayCurrency({
  amountAud = 0,
  displayCurrency =
    DEFAULT_DISPLAY_CURRENCY,
  fxSnapshot = null,
} = {}) {
  const safeAmountAud =
    toSafeNumber(
      amountAud,
      0
    );

  const safeDisplayCurrency =
    normaliseCurrency(
      displayCurrency
    );

  if (
    safeDisplayCurrency ===
    DEFAULT_BASE_CURRENCY
  ) {
    return {
      amountAud:
        safeAmountAud,

      displayAmount:
        safeAmountAud,

      displayCurrency:
        safeDisplayCurrency,

      rate:
        1,

      available:
        true,
    };
  }

  const rate =
    getRate({
      snapshot:
        fxSnapshot,

      fromCurrency:
        DEFAULT_BASE_CURRENCY,

      toCurrency:
        safeDisplayCurrency,
    });

  if (
    rate === null
  ) {
    return {
      amountAud:
        safeAmountAud,

      displayAmount:
        null,

      displayCurrency:
        safeDisplayCurrency,

      rate:
        null,

      available:
        false,
    };
  }

  return {
    amountAud:
      safeAmountAud,

    displayAmount:
      safeAmountAud *
      rate,

    displayCurrency:
      safeDisplayCurrency,

    rate,

    available:
      true,
  };
}

export function convertDisplayCurrencyToAud({
  amount = 0,
  displayCurrency =
    DEFAULT_DISPLAY_CURRENCY,
  fxSnapshot = null,
} = {}) {
  const safeAmount =
    toSafeNumber(
      amount,
      0
    );

  const safeDisplayCurrency =
    normaliseCurrency(
      displayCurrency
    );

  if (
    safeDisplayCurrency ===
    DEFAULT_BASE_CURRENCY
  ) {
    return {
      amount:
        safeAmount,

      amountAud:
        safeAmount,

      displayCurrency:
        safeDisplayCurrency,

      rate:
        1,

      available:
        true,
    };
  }

  const rate =
    getRate({
      snapshot:
        fxSnapshot,

      fromCurrency:
        safeDisplayCurrency,

      toCurrency:
        DEFAULT_BASE_CURRENCY,
    });

  if (
    rate === null
  ) {
    return {
      amount:
        safeAmount,

      amountAud:
        null,

      displayCurrency:
        safeDisplayCurrency,

      rate:
        null,

      available:
        false,
    };
  }

  return {
    amount:
      safeAmount,

    amountAud:
      safeAmount *
      rate,

    displayCurrency:
      safeDisplayCurrency,

    rate,

    available:
      true,
  };
}

export function createPriceSnapshot({
  solPriceAud =
    DEFAULT_SOL_PRICE_AUD,
  hogesPerSol =
    DEFAULT_HOGES_PER_SOL,
  displayCurrency =
    DEFAULT_DISPLAY_CURRENCY,
  fxSnapshot = null,
  sourceStatus = {},
} = {}) {
  const safeSolPriceAud =
    Math.max(
      0,
      toSafeNumber(
        solPriceAud,
        DEFAULT_SOL_PRICE_AUD
      )
    );

  const safeHogesPerSol =
    Math.max(
      0,
      toSafeNumber(
        hogesPerSol,
        DEFAULT_HOGES_PER_SOL
      )
    );

  const safeDisplayCurrency =
    normaliseCurrency(
      displayCurrency
    );

  const hogesPriceAud =
    calculateHogesPriceAud({
      solPriceAud:
        safeSolPriceAud,

      hogesPerSol:
        safeHogesPerSol,
    });

  const solDisplayResult =
    convertAudToDisplayCurrency({
      amountAud:
        safeSolPriceAud,

      displayCurrency:
        safeDisplayCurrency,

      fxSnapshot,
    });

  const hogesDisplayResult =
    convertAudToDisplayCurrency({
      amountAud:
        hogesPriceAud,

      displayCurrency:
        safeDisplayCurrency,

      fxSnapshot,
    });

  return {
    baseCurrency:
      DEFAULT_BASE_CURRENCY,

    displayCurrency:
      safeDisplayCurrency,

    solPriceAud:
      safeSolPriceAud,

    solPriceDisplay:
      solDisplayResult
        .displayAmount,

    hogesPerSol:
      safeHogesPerSol,

    hogesPriceAud,

    hogesPriceDisplay:
      hogesDisplayResult
        .displayAmount,

    hogesPerAud:
      calculateHogesPerAud({
        hogesPriceAud,
      }),

    solPerAud:
      calculateSolPerAud({
        solPriceAud:
          safeSolPriceAud,
      }),

    displayRate:
      solDisplayResult.rate,

    fxSnapshot,

    updatedAt:
      createTimestamp(),

    sourceStatus: {
      fx:
        sourceStatus.fx ||
        fxSnapshot?.source ||
        'fallback',

      sol:
        sourceStatus.sol ||
        'demo',

      hoges:
        sourceStatus.hoges ||
        'demo',
    },

    stale: Boolean(
      fxSnapshot?.stale
    ),
  };
}

export async function getPriceSnapshot({
  displayCurrency =
    DEFAULT_DISPLAY_CURRENCY,
  solPriceAud =
    DEFAULT_SOL_PRICE_AUD,
  hogesPerSol =
    DEFAULT_HOGES_PER_SOL,
  forceRefresh = false,
} = {}) {
  const safeDisplayCurrency =
    normaliseCurrency(
      displayCurrency
    );

  if (
    !forceRefresh &&
    cachedPriceSnapshot &&
    cachedPriceSnapshot
      .displayCurrency ===
      safeDisplayCurrency &&
    isSnapshotFresh()
  ) {
    return {
      ...cachedPriceSnapshot,

      sourceStatus: {
        ...cachedPriceSnapshot
          .sourceStatus,

        priceSnapshot:
          'cache',
      },
    };
  }

  const fxSnapshot =
    await fetchFxRates({
      baseCurrency:
        DEFAULT_BASE_CURRENCY,

      currencies: [
        safeDisplayCurrency,
      ],

      forceRefresh,
    });

  cachedPriceSnapshot =
    createPriceSnapshot({
      solPriceAud,
      hogesPerSol,
      displayCurrency:
        safeDisplayCurrency,
      fxSnapshot,
      sourceStatus: {
        fx:
          fxSnapshot.source,

        sol:
          'demo',

        hoges:
          'demo',
      },
    });

  return {
    ...cachedPriceSnapshot,

    sourceStatus: {
      ...cachedPriceSnapshot
        .sourceStatus,

      priceSnapshot:
        'fresh',
    },
  };
}

export function getCachedPriceSnapshot() {
  if (
    !cachedPriceSnapshot
  ) {
    return null;
  }

  return {
    ...cachedPriceSnapshot,

    sourceStatus: {
      ...cachedPriceSnapshot
        .sourceStatus,
    },

    fxSnapshot:
      cachedPriceSnapshot
        .fxSnapshot
        ? {
            ...cachedPriceSnapshot
              .fxSnapshot,

            rates: {
              ...cachedPriceSnapshot
                .fxSnapshot
                .rates,
            },
          }
        : null,
  };
}

export function clearPriceCache() {
  cachedPriceSnapshot =
    null;
}

export function valueWallet({
  solBalance = 0,
  hogesBalance = 0,
  priceSnapshot,
} = {}) {
  const safeSolBalance =
    Math.max(
      0,
      toSafeNumber(
        solBalance
      )
    );

  const safeHogesBalance =
    Math.max(
      0,
      toSafeNumber(
        hogesBalance
      )
    );

  const solPriceAud =
    Math.max(
      0,
      toSafeNumber(
        priceSnapshot
          ?.solPriceAud,
        DEFAULT_SOL_PRICE_AUD
      )
    );

  const hogesPriceAud =
    Math.max(
      0,
      toSafeNumber(
        priceSnapshot
          ?.hogesPriceAud,
        calculateHogesPriceAud()
      )
    );

  const solValueAud =
    safeSolBalance *
    solPriceAud;

  const hogesValueAud =
    safeHogesBalance *
    hogesPriceAud;

  const totalValueAud =
    solValueAud +
    hogesValueAud;

  const displayCurrency =
    normaliseCurrency(
      priceSnapshot
        ?.displayCurrency ||
        DEFAULT_DISPLAY_CURRENCY
    );

  const solDisplayResult =
    convertAudToDisplayCurrency({
      amountAud:
        solValueAud,

      displayCurrency,

      fxSnapshot:
        priceSnapshot
          ?.fxSnapshot,
    });

  const hogesDisplayResult =
    convertAudToDisplayCurrency({
      amountAud:
        hogesValueAud,

      displayCurrency,

      fxSnapshot:
        priceSnapshot
          ?.fxSnapshot,
    });

  const totalDisplayResult =
    convertAudToDisplayCurrency({
      amountAud:
        totalValueAud,

      displayCurrency,

      fxSnapshot:
        priceSnapshot
          ?.fxSnapshot,
    });

  return {
    solBalance:
      safeSolBalance,

    hogesBalance:
      safeHogesBalance,

    solValueAud,

    hogesValueAud,

    totalValueAud,

    displayCurrency,

    solValueDisplay:
      solDisplayResult
        .displayAmount,

    hogesValueDisplay:
      hogesDisplayResult
        .displayAmount,

    totalValueDisplay:
      totalDisplayResult
        .displayAmount,
  };
}

export const PRICE_DEFAULTS = {
  baseCurrency:
    DEFAULT_BASE_CURRENCY,

  displayCurrency:
    DEFAULT_DISPLAY_CURRENCY,

  solPriceAud:
    DEFAULT_SOL_PRICE_AUD,

  hogesPerSol:
    DEFAULT_HOGES_PER_SOL,

  hogesPriceAud:
    DEFAULT_SOL_PRICE_AUD /
    DEFAULT_HOGES_PER_SOL,

  cacheDurationMs:
    PRICE_CACHE_DURATION_MS,
};