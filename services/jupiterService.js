const JUPITER_BASE_URL =
  'https://api.jup.ag/swap/v2';

export const SOL_MINT_ADDRESS =
  'So11111111111111111111111111111111111111112';

const DEFAULT_SOL_DECIMALS =
  9;

const DEFAULT_HOGES_DECIMALS =
  6;

const DEFAULT_SLIPPAGE_BPS =
  null;

const DEFAULT_QUOTE_CACHE_MS =
  15 * 1000;

const DEFAULT_MAX_PAYMENT_ITERATIONS =
  8;

const DEFAULT_MAX_PAYMENT_AUD =
  1000;

const MINIMUM_QUOTE_AMOUNT =
  1;

let activeApiKey =
  '';

const quoteCache =
  new Map();

function getEnvironmentApiKey() {
  try {
    return (
      globalThis
        ?.process
        ?.env
        ?.EXPO_PUBLIC_JUPITER_API_KEY ||
      ''
    );
  } catch {
    return '';
  }
}

activeApiKey =
  getEnvironmentApiKey();

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

function toSafeInteger(
  value,
  fallback = 0
) {
  const numericValue =
    Math.floor(
      toSafeNumber(
        value,
        fallback
      )
    );

  return Number.isFinite(
    numericValue
  )
    ? numericValue
    : fallback;
}

function normaliseAddress(
  address = ''
) {
  return String(
    address || ''
  ).trim();
}

function requireAddress(
  address,
  label =
    'Token mint address'
) {
  const safeAddress =
    normaliseAddress(
      address
    );

  if (
    !safeAddress
  ) {
    throw new Error(
      `${label} is required.`
    );
  }

  return safeAddress;
}

function normaliseDecimals(
  decimals,
  fallback = 0
) {
  return Math.max(
    0,
    Math.min(
      18,
      toSafeInteger(
        decimals,
        fallback
      )
    )
  );
}

function createHeaders({
  includeJson = false,
} = {}) {
  const headers = {
    Accept:
      'application/json',
  };

  const apiKey =
    activeApiKey ||
    getEnvironmentApiKey();

  if (
    apiKey
  ) {
    headers[
      'x-api-key'
    ] =
      apiKey;
  }

  if (
    includeJson
  ) {
    headers[
      'Content-Type'
    ] =
      'application/json';
  }

  return headers;
}

function createJupiterError({
  message,
  status = null,
  endpoint = '',
  data = null,
} = {}) {
  const error =
    new Error(
      message ||
        'Jupiter request failed.'
    );

  error.name =
    'JupiterApiError';

  error.status =
    status;

  error.endpoint =
    endpoint;

  error.data =
    data;

  return error;
}

function buildQueryString(
  parameters = {}
) {
  const entries =
    Object.entries(
      parameters
    ).filter(
      ([
        ,
        value,
      ]) =>
        value !==
          undefined &&
        value !==
          null &&
        value !==
          ''
    );

  return entries
    .map(
      ([
        key,
        value,
      ]) =>
        `${encodeURIComponent(
          key
        )}=${encodeURIComponent(
          String(value)
        )}`
    )
    .join('&');
}

async function parseResponse(
  response,
  endpoint
) {
  let data =
    null;

  try {
    data =
      await response.json();
  } catch {
    data =
      null;
  }

  if (
    !response.ok
  ) {
    throw createJupiterError({
      status:
        response.status,

      endpoint,

      data,

      message:
        data?.error ||
        data?.errorMessage ||
        data?.message ||
        `Jupiter returned HTTP ${response.status}.`,
    });
  }

  return data;
}

function createCacheKey({
  inputMint,
  outputMint,
  amount,
  taker,
  receiver,
  slippageBps,
} = {}) {
  return [
    inputMint,
    outputMint,
    amount,
    taker || '',
    receiver || '',
    slippageBps ?? '',
  ].join(':');
}

function getCachedQuote(
  cacheKey
) {
  const cached =
    quoteCache.get(
      cacheKey
    );

  if (
    !cached
  ) {
    return null;
  }

  if (
    Date.now() -
      cached.cachedAt >
    DEFAULT_QUOTE_CACHE_MS
  ) {
    quoteCache.delete(
      cacheKey
    );

    return null;
  }

  return cached.value;
}

function setCachedQuote(
  cacheKey,
  value
) {
  quoteCache.set(
    cacheKey,
    {
      cachedAt:
        Date.now(),

      value,
    }
  );
}

function calculateRouteRate({
  inputAmount = 0,
  outputAmount = 0,
  inputDecimals = 0,
  outputDecimals = 0,
} = {}) {
  const inputUiAmount =
    nativeAmountToUiAmount({
      amount:
        inputAmount,

      decimals:
        inputDecimals,
    });

  const outputUiAmount =
    nativeAmountToUiAmount({
      amount:
        outputAmount,

      decimals:
        outputDecimals,
    });

  if (
    inputUiAmount <= 0
  ) {
    return 0;
  }

  return (
    outputUiAmount /
    inputUiAmount
  );
}

function normaliseOrderResponse({
  data,
  inputMint,
  outputMint,
  inputDecimals,
  outputDecimals,
  requestedAmount,
  taker = '',
} = {}) {
  const inputAmount =
    String(
      data?.inAmount ??
      requestedAmount ??
      '0'
    );

  const outputAmount =
    String(
      data?.outAmount ??
      '0'
    );

  const inputUiAmount =
    nativeAmountToUiAmount({
      amount:
        inputAmount,

      decimals:
        inputDecimals,
    });

  const outputUiAmount =
    nativeAmountToUiAmount({
      amount:
        outputAmount,

      decimals:
        outputDecimals,
    });

  const transaction =
    data?.transaction ??
    null;

  const executable =
    Boolean(
      taker &&
      transaction
    );

  const quoted =
    toSafeNumber(
      outputAmount,
      0
    ) > 0;

  return {
    inputMint,

    outputMint,

    inputDecimals,

    outputDecimals,

    inputAmount,

    outputAmount,

    inputUiAmount,

    outputUiAmount,

    rate:
      calculateRouteRate({
        inputAmount,
        outputAmount,
        inputDecimals,
        outputDecimals,
      }),

    inverseRate:
      outputUiAmount > 0
        ? inputUiAmount /
          outputUiAmount
        : 0,

    priceImpactPct:
      toSafeNumber(
        data
          ?.priceImpactPct,
        0
      ),

    slippageBps:
      data
        ?.slippageBps ??
      null,

    otherAmountThreshold:
      data
        ?.otherAmountThreshold ??
      null,

    router:
      data?.router ||
      '',

    mode:
      data?.mode ||
      '',

    requestId:
      data
        ?.requestId ||
      '',

    transaction,

    lastValidBlockHeight:
      data
        ?.lastValidBlockHeight ??
      null,

    expireAt:
      data
        ?.expireAt ||
      null,

    feeBps:
      toSafeNumber(
        data?.feeBps,
        0
      ),

    feeMint:
      data?.feeMint ||
      '',

    platformFee:
      data
        ?.platformFee ||
      null,

    routePlan:
      Array.isArray(
        data?.routePlan
      )
        ? data.routePlan
        : [],

    errorCode:
      data
        ?.errorCode ??
      null,

    errorMessage:
      data
        ?.errorMessage ||
      null,

    quoted,

    executable,

    canProceed:
      executable &&
      !data?.errorCode,

    fetchedAt:
      new Date()
        .toISOString(),

    raw:
      data,
  };
}

export function setJupiterApiKey(
  apiKey = ''
) {
  activeApiKey =
    String(
      apiKey || ''
    ).trim();

  return Boolean(
    activeApiKey
  );
}

export function getJupiterApiKeyStatus() {
  return {
    configured:
      Boolean(
        activeApiKey ||
        getEnvironmentApiKey()
      ),
  };
}

export function clearJupiterApiKey() {
  activeApiKey =
    '';
}

export function clearJupiterQuoteCache() {
  quoteCache.clear();
}

export function uiAmountToNativeAmount({
  amount = 0,
  decimals = 0,
} = {}) {
  const safeAmount =
    Math.max(
      0,
      toSafeNumber(
        amount,
        0
      )
    );

  const safeDecimals =
    normaliseDecimals(
      decimals
    );

  const multiplier =
    10 **
    safeDecimals;

  return Math.max(
    MINIMUM_QUOTE_AMOUNT,
    Math.floor(
      safeAmount *
      multiplier
    )
  ).toString();
}

export function nativeAmountToUiAmount({
  amount = '0',
  decimals = 0,
} = {}) {
  const safeAmount =
    Math.max(
      0,
      toSafeNumber(
        amount,
        0
      )
    );

  const safeDecimals =
    normaliseDecimals(
      decimals
    );

  return (
    safeAmount /
    10 **
      safeDecimals
  );
}

export async function getSwapOrder({
  inputMint,
  outputMint,
  amount,
  inputDecimals =
    DEFAULT_HOGES_DECIMALS,
  outputDecimals =
    DEFAULT_SOL_DECIMALS,
  amountIsNative =
    false,
  taker = '',
  receiver = '',
  payer = '',
  slippageBps =
    DEFAULT_SLIPPAGE_BPS,
  referralAccount = '',
  referralFee = null,
  excludeRouters = '',
  forceRefresh = false,
} = {}) {
  const safeInputMint =
    requireAddress(
      inputMint,
      'Input token mint'
    );

  const safeOutputMint =
    requireAddress(
      outputMint,
      'Output token mint'
    );

  const safeInputDecimals =
    normaliseDecimals(
      inputDecimals,
      DEFAULT_HOGES_DECIMALS
    );

  const safeOutputDecimals =
    normaliseDecimals(
      outputDecimals,
      DEFAULT_SOL_DECIMALS
    );

  const nativeAmount =
    amountIsNative
      ? Math.max(
          MINIMUM_QUOTE_AMOUNT,
          toSafeInteger(
            amount,
            MINIMUM_QUOTE_AMOUNT
          )
        ).toString()
      : uiAmountToNativeAmount({
          amount,
          decimals:
            safeInputDecimals,
        });

  const safeTaker =
    normaliseAddress(
      taker
    );

  const safeReceiver =
    normaliseAddress(
      receiver
    );

  const safePayer =
    normaliseAddress(
      payer
    );

  const safeSlippageBps =
    slippageBps ===
      null ||
    slippageBps ===
      undefined
      ? null
      : Math.max(
          0,
          toSafeInteger(
            slippageBps,
            0
          )
        );

  const cacheKey =
    createCacheKey({
      inputMint:
        safeInputMint,

      outputMint:
        safeOutputMint,

      amount:
        nativeAmount,

      taker:
        safeTaker,

      receiver:
        safeReceiver,

      slippageBps:
        safeSlippageBps,
    });

  if (
    !forceRefresh
  ) {
    const cached =
      getCachedQuote(
        cacheKey
      );

    if (
      cached
    ) {
      return {
        ...cached,

        source:
          'cache',
      };
    }
  }

  const query =
    buildQueryString({
      inputMint:
        safeInputMint,

      outputMint:
        safeOutputMint,

      amount:
        nativeAmount,

      taker:
        safeTaker ||
        undefined,

      receiver:
        safeReceiver ||
        undefined,

      payer:
        safePayer ||
        undefined,

      slippageBps:
        safeSlippageBps ??
        undefined,

      referralAccount:
        referralAccount ||
        undefined,

      referralFee:
        referralFee ??
        undefined,

      excludeRouters:
        excludeRouters ||
        undefined,
    });

  const endpoint =
    `${JUPITER_BASE_URL}/order?${query}`;

  let response;

  try {
    response =
      await fetch(
        endpoint,
        {
          method:
            'GET',

          headers:
            createHeaders(),
        }
      );
  } catch (
    error
  ) {
    throw createJupiterError({
      endpoint,

      message:
        `Could not connect to Jupiter: ${
          error?.message ||
          error
        }`,
    });
  }

  const data =
    await parseResponse(
      response,
      endpoint
    );

  const result =
    normaliseOrderResponse({
      data,
      inputMint:
        safeInputMint,
      outputMint:
        safeOutputMint,
      inputDecimals:
        safeInputDecimals,
      outputDecimals:
        safeOutputDecimals,
      requestedAmount:
        nativeAmount,
      taker:
        safeTaker,
    });

  const finalResult = {
    ...result,

    source:
      'live',
  };

  setCachedQuote(
    cacheKey,
    finalResult
  );

  return finalResult;
}

export async function getQuote({
  inputMint,
  outputMint,
  amount,
  inputDecimals =
    DEFAULT_HOGES_DECIMALS,
  outputDecimals =
    DEFAULT_SOL_DECIMALS,
  amountIsNative =
    false,
  forceRefresh = false,
} = {}) {
  return getSwapOrder({
    inputMint,
    outputMint,
    amount,
    inputDecimals,
    outputDecimals,
    amountIsNative,
    forceRefresh,

    // No taker means price information only.
    taker:
      '',
  });
}

export async function getHogesToSolQuote({
  hogesMintAddress,
  hogesAmount,
  hogesDecimals =
    DEFAULT_HOGES_DECIMALS,
  forceRefresh = false,
} = {}) {
  return getQuote({
    inputMint:
      hogesMintAddress,

    outputMint:
      SOL_MINT_ADDRESS,

    amount:
      hogesAmount,

    inputDecimals:
      hogesDecimals,

    outputDecimals:
      DEFAULT_SOL_DECIMALS,

    forceRefresh,
  });
}

export async function getSolToHogesQuote({
  hogesMintAddress,
  solAmount,
  hogesDecimals =
    DEFAULT_HOGES_DECIMALS,
  forceRefresh = false,
} = {}) {
  return getQuote({
    inputMint:
      SOL_MINT_ADDRESS,

    outputMint:
      hogesMintAddress,

    amount:
      solAmount,

    inputDecimals:
      DEFAULT_SOL_DECIMALS,

    outputDecimals:
      hogesDecimals,

    forceRefresh,
  });
}

export async function prepareHogesToSolSwap({
  walletAddress,
  hogesMintAddress,
  hogesAmount,
  hogesDecimals =
    DEFAULT_HOGES_DECIMALS,
  receiver = '',
  forceRefresh = true,
} = {}) {
  return getSwapOrder({
    inputMint:
      hogesMintAddress,

    outputMint:
      SOL_MINT_ADDRESS,

    amount:
      hogesAmount,

    inputDecimals:
      hogesDecimals,

    outputDecimals:
      DEFAULT_SOL_DECIMALS,

    taker:
      walletAddress,

    receiver,

    forceRefresh,
  });
}

export async function prepareSolToHogesSwap({
  walletAddress,
  hogesMintAddress,
  solAmount,
  hogesDecimals =
    DEFAULT_HOGES_DECIMALS,
  receiver = '',
  forceRefresh = true,
} = {}) {
  return getSwapOrder({
    inputMint:
      SOL_MINT_ADDRESS,

    outputMint:
      hogesMintAddress,

    amount:
      solAmount,

    inputDecimals:
      DEFAULT_SOL_DECIMALS,

    outputDecimals:
      hogesDecimals,

    taker:
      walletAddress,

    receiver,

    forceRefresh,
  });
}

export async function executeSignedSwap({
  signedTransactionBase64,
  requestId,
  lastValidBlockHeight = null,
} = {}) {
  const safeTransaction =
    String(
      signedTransactionBase64 ||
        ''
    ).trim();

  const safeRequestId =
    String(
      requestId || ''
    ).trim();

  if (
    !safeTransaction
  ) {
    throw new Error(
      'A signed Jupiter transaction is required.'
    );
  }

  if (
    !safeRequestId
  ) {
    throw new Error(
      'The Jupiter request ID is required.'
    );
  }

  const endpoint =
    `${JUPITER_BASE_URL}/execute`;

  const body = {
    signedTransaction:
      safeTransaction,

    requestId:
      safeRequestId,
  };

  if (
    lastValidBlockHeight !==
      null &&
    lastValidBlockHeight !==
      undefined
  ) {
    body.lastValidBlockHeight =
      toSafeInteger(
        lastValidBlockHeight,
        0
      );
  }

  let response;

  try {
    response =
      await fetch(
        endpoint,
        {
          method:
            'POST',

          headers:
            createHeaders({
              includeJson:
                true,
            }),

          body:
            JSON.stringify(
              body
            ),
        }
      );
  } catch (
    error
  ) {
    throw createJupiterError({
      endpoint,

      message:
        `Could not execute the Jupiter swap: ${
          error?.message ||
          error
        }`,
    });
  }

  const data =
    await parseResponse(
      response,
      endpoint
    );

  return {
    status:
      data?.status ||
      'Failed',

    successful:
      data?.status ===
        'Success' &&
      toSafeNumber(
        data?.code,
        -1
      ) === 0,

    signature:
      data?.signature ||
      '',

    code:
      toSafeNumber(
        data?.code,
        -1
      ),

    totalInputAmount:
      String(
        data
          ?.totalInputAmount ||
        '0'
      ),

    inputAmountResult:
      String(
        data
          ?.inputAmountResult ||
        '0'
      ),

    outputAmountResult:
      String(
        data
          ?.outputAmountResult ||
        '0'
      ),

    totalOutputAmount:
      String(
        data
          ?.totalOutputAmount ||
        '0'
      ),

    error:
      data?.error ||
      null,

    executedAt:
      new Date()
        .toISOString(),

    raw:
      data,
  };
}

export function calculateQuotePrice({
  quote,
  outputPriceAud = 0,
} = {}) {
  const safeOutputPriceAud =
    Math.max(
      0,
      toSafeNumber(
        outputPriceAud,
        0
      )
    );

  const inputAmount =
    Math.max(
      0,
      toSafeNumber(
        quote
          ?.inputUiAmount,
        0
      )
    );

  const outputAmount =
    Math.max(
      0,
      toSafeNumber(
        quote
          ?.outputUiAmount,
        0
      )
    );

  if (
    inputAmount === 0 ||
    outputAmount === 0 ||
    safeOutputPriceAud === 0
  ) {
    return {
      inputUnitPriceAud:
        0,

      totalOutputValueAud:
        0,

      available:
        false,
    };
  }

  const totalOutputValueAud =
    outputAmount *
    safeOutputPriceAud;

  return {
    inputUnitPriceAud:
      totalOutputValueAud /
      inputAmount,

    totalOutputValueAud,

    available:
      true,
  };
}

export async function estimateMaximumPayment({
  hogesMintAddress,
  hogesBalance,
  hogesDecimals =
    DEFAULT_HOGES_DECIMALS,
  solPriceAud,
  upperLimitAud =
    DEFAULT_MAX_PAYMENT_AUD,
  minimumPaymentAud = 1,
  iterations =
    DEFAULT_MAX_PAYMENT_ITERATIONS,
} = {}) {
  const safeHogesBalance =
    Math.max(
      0,
      toSafeNumber(
        hogesBalance,
        0
      )
    );

  const safeSolPriceAud =
    Math.max(
      0,
      toSafeNumber(
        solPriceAud,
        0
      )
    );

  const safeUpperLimitAud =
    Math.max(
      0,
      toSafeNumber(
        upperLimitAud,
        DEFAULT_MAX_PAYMENT_AUD
      )
    );

  const safeMinimumPaymentAud =
    Math.max(
      0.01,
      toSafeNumber(
        minimumPaymentAud,
        1
      )
    );

  const safeIterations =
    Math.max(
      1,
      Math.min(
        12,
        toSafeInteger(
          iterations,
          DEFAULT_MAX_PAYMENT_ITERATIONS
        )
      )
    );

  if (
    safeHogesBalance === 0 ||
    safeSolPriceAud === 0
  ) {
    return {
      amountAud:
        0,

      hogesAmount:
        0,

      available:
        false,

      reason:
        'missing-balance-or-price',

      quote:
        null,
    };
  }

  const referenceQuote =
    await getHogesToSolQuote({
      hogesMintAddress,
      hogesAmount:
        Math.min(
          safeHogesBalance,
          Math.max(
            1,
            safeHogesBalance *
              0.01
          )
        ),
      hogesDecimals,
      forceRefresh:
        true,
    });

  if (
    !referenceQuote.quoted ||
    referenceQuote
      .outputUiAmount <= 0
  ) {
    return {
      amountAud:
        0,

      hogesAmount:
        0,

      available:
        false,

      reason:
        'no-route',

      quote:
        referenceQuote,
    };
  }

  const estimatedHogesPriceAud =
    (
      referenceQuote
        .outputUiAmount *
      safeSolPriceAud
    ) /
    referenceQuote
      .inputUiAmount;

  if (
    estimatedHogesPriceAud <= 0
  ) {
    return {
      amountAud:
        0,

      hogesAmount:
        0,

      available:
        false,

      reason:
        'invalid-price',

      quote:
        referenceQuote,
    };
  }

  const walletValueAud =
    safeHogesBalance *
    estimatedHogesPriceAud;

  let low =
    safeMinimumPaymentAud;

  let high =
    Math.min(
      safeUpperLimitAud,
      walletValueAud
    );

  let bestAmountAud =
    0;

  let bestQuote =
    null;

  for (
    let index = 0;
    index <
    safeIterations;
    index += 1
  ) {
    const candidateAud =
      (
        low +
        high
      ) /
      2;

    const candidateHoges =
      Math.min(
        safeHogesBalance,
        candidateAud /
          estimatedHogesPriceAud
      );

    let quote =
      null;

    try {
      quote =
        await getHogesToSolQuote({
          hogesMintAddress,
          hogesAmount:
            candidateHoges,
          hogesDecimals,
          forceRefresh:
            true,
        });
    } catch {
      quote =
        null;
    }

    const outputValueAud =
      (
        quote
          ?.outputUiAmount ||
        0
      ) *
      safeSolPriceAud;

    const acceptable =
      Boolean(
        quote?.quoted &&
        outputValueAud >=
          candidateAud *
            0.97
      );

    if (
      acceptable
    ) {
      bestAmountAud =
        candidateAud;

      bestQuote =
        quote;

      low =
        candidateAud;
    } else {
      high =
        candidateAud;
    }
  }

  return {
    amountAud:
      Math.max(
        0,
        Math.floor(
          bestAmountAud
        )
      ),

    hogesAmount:
      bestQuote
        ?.inputUiAmount ||
      0,

    outputSol:
      bestQuote
        ?.outputUiAmount ||
      0,

    available:
      bestAmountAud > 0,

    reason:
      bestAmountAud > 0
        ? null
        : 'insufficient-liquidity',

    estimatedHogesPriceAud,

    walletValueAud,

    quote:
      bestQuote,
  };
}

export async function getJupiterHealth() {
  try {
    const response =
      await fetch(
        `${JUPITER_BASE_URL}/order?${buildQueryString({
          inputMint:
            SOL_MINT_ADDRESS,

          outputMint:
            SOL_MINT_ADDRESS,

          amount:
            '1',
        })}`,
        {
          method:
            'GET',

          headers:
            createHeaders(),
        }
      );

    return {
      connected:
        response.status !==
        0,

      status:
        response.ok
          ? 'ready'
          : 'reachable',

      httpStatus:
        response.status,

      checkedAt:
        new Date()
          .toISOString(),
    };
  } catch (
    error
  ) {
    return {
      connected:
        false,

      status:
        'unavailable',

      httpStatus:
        null,

      error:
        String(
          error?.message ||
            error
        ),

      checkedAt:
        new Date()
          .toISOString(),
    };
  }
}

export const JUPITER_DEFAULTS = {
  baseUrl:
    JUPITER_BASE_URL,

  solMintAddress:
    SOL_MINT_ADDRESS,

  solDecimals:
    DEFAULT_SOL_DECIMALS,

  hogesDecimals:
    DEFAULT_HOGES_DECIMALS,

  quoteCacheMs:
    DEFAULT_QUOTE_CACHE_MS,

  maximumPaymentAud:
    DEFAULT_MAX_PAYMENT_AUD,

  maximumPaymentIterations:
    DEFAULT_MAX_PAYMENT_ITERATIONS,
};