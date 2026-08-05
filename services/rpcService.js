const DEFAULT_RPC_URL =
  'https://api.mainnet-beta.solana.com';

const DEFAULT_COMMITMENT =
  'confirmed';

const LAMPORTS_PER_SOL =
  1_000_000_000;

const DEFAULT_HISTORY_LIMIT =
  20;

const DEFAULT_CONFIRMATION_TIMEOUT_MS =
  30_000;

const MAX_CONFIRMATION_TIMEOUT_MS =
  90_000;

const DEFAULT_CONFIRMATION_INTERVAL_MS =
  1_000;

const DEFAULT_FETCH_TIMEOUT_MS =
  15_000;

const TRANSACTION_FETCH_BATCH_SIZE =
  5;

let rpcRequestId =
  1;

function getEnvironmentRpcUrl() {
  try {
    return (
      globalThis
        ?.process
        ?.env
        ?.EXPO_PUBLIC_SOLANA_RPC_URL ||
      ''
    );
  } catch {
    return '';
  }
}

let activeRpcUrl =
  getEnvironmentRpcUrl() ||
  DEFAULT_RPC_URL;

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

function normaliseAddress(
  address = ''
) {
  return String(
    address || ''
  ).trim();
}

function normaliseCommitment(
  commitment =
    DEFAULT_COMMITMENT
) {
  const safeCommitment =
    String(
      commitment ||
        DEFAULT_COMMITMENT
    )
      .trim()
      .toLowerCase();

  if (
    [
      'processed',
      'confirmed',
      'finalized',
    ].includes(
      safeCommitment
    )
  ) {
    return safeCommitment;
  }

  return DEFAULT_COMMITMENT;
}

function requireAddress(
  address,
  label =
    'Wallet address'
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

function createRpcError({
  method,
  message,
  code = null,
  data = null,
} = {}) {
  const error =
    new Error(
      message ||
        `Solana RPC request failed: ${method}.`
    );

  error.name =
    'SolanaRpcError';

  error.rpcMethod =
    method;

  error.rpcCode =
    code;

  error.rpcData =
    data;

  return error;
}

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

/*
 * Converts a raw integer token amount string into a
 * UI amount by inserting the decimal point textually,
 * so large balances do not lose precision to float
 * division.
 */
function rawAmountToUiAmount(
  rawAmount,
  decimals = 0
) {
  const amountText =
    String(
      rawAmount ?? '0'
    ).trim();

  if (
    !/^\d+$/.test(
      amountText
    )
  ) {
    return 0;
  }

  const safeDecimals =
    Math.max(
      0,
      Math.floor(
        toSafeNumber(
          decimals,
          0
        )
      )
    );

  const digits =
    amountText.replace(
      /^0+(?=\d)/,
      ''
    );

  const padded =
    digits.padStart(
      safeDecimals + 1,
      '0'
    );

  const wholePart =
    padded.slice(
      0,
      padded.length -
        safeDecimals
    );

  const fractionPart =
    safeDecimals > 0
      ? padded.slice(
          padded.length -
            safeDecimals
        )
      : '';

  return toSafeNumber(
    fractionPart
      ? `${wholePart}.${fractionPart}`
      : wholePart,
    0
  );
}

function delay(
  milliseconds
) {
  return new Promise(
    resolve => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

export function getRpcUrl() {
  return activeRpcUrl;
}

export function setRpcUrl(
  rpcUrl
) {
  const safeRpcUrl =
    String(
      rpcUrl || ''
    ).trim();

  if (
    !safeRpcUrl
  ) {
    throw new Error(
      'A Solana RPC URL is required.'
    );
  }

  activeRpcUrl =
    safeRpcUrl;

  return activeRpcUrl;
}

export function resetRpcUrl() {
  activeRpcUrl =
    getEnvironmentRpcUrl() ||
    DEFAULT_RPC_URL;

  return activeRpcUrl;
}

export async function rpcRequest({
  method,
  params = [],
  rpcUrl =
    activeRpcUrl,
} = {}) {
  if (
    !method
  ) {
    throw new Error(
      'An RPC method is required.'
    );
  }

  const safeRpcUrl =
    String(
      rpcUrl ||
        activeRpcUrl
    ).trim();

  if (
    !safeRpcUrl
  ) {
    throw new Error(
      'A Solana RPC URL is required.'
    );
  }

  const requestId =
    rpcRequestId++;

  let response;

  try {
    response =
      await fetchWithTimeout(
        safeRpcUrl,
        {
          method:
            'POST',

          headers: {
            Accept:
              'application/json',

            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify({
              jsonrpc:
                '2.0',

              id:
                requestId,

              method,

              params:
                Array.isArray(
                  params
                )
                  ? params
                  : [],
            }),
        }
      );
  } catch (
    error
  ) {
    throw createRpcError({
      method,

      message:
        `Could not connect to the Solana network: ${
          error?.message ||
          error
        }`,
    });
  }

  if (
    !response.ok
  ) {
    throw createRpcError({
      method,

      code:
        response.status,

      message:
        `Solana RPC request returned HTTP ${response.status}.`,
    });
  }

  let payload;

  try {
    payload =
      await response.json();
  } catch {
    throw createRpcError({
      method,

      message:
        'The Solana RPC returned an invalid response.',
    });
  }

  if (
    payload?.error
  ) {
    throw createRpcError({
      method,

      code:
        payload.error.code,

      message:
        payload.error.message,

      data:
        payload.error.data,
    });
  }

  return payload?.result;
}

export async function getNetworkHealth() {
  try {
    const result =
      await rpcRequest({
        method:
          'getHealth',
      });

    return {
      connected:
        result === 'ok',

      status:
        result === 'ok'
          ? 'ready'
          : 'unavailable',

      network:
        'Solana',

      rpcUrl:
        activeRpcUrl,

      checkedAt:
        new Date()
          .toISOString(),

      error:
        null,
    };
  } catch (
    error
  ) {
    return {
      connected:
        false,

      status:
        'unavailable',

      network:
        'Solana',

      rpcUrl:
        activeRpcUrl,

      checkedAt:
        new Date()
          .toISOString(),

      error:
        String(
          error?.message ||
            error
        ),
    };
  }
}

export async function getLatestBlockhash({
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const result =
    await rpcRequest({
      method:
        'getLatestBlockhash',

      params: [
        {
          commitment:
            normaliseCommitment(
              commitment
            ),
        },
      ],
    });

  return {
    blockhash:
      result?.value
        ?.blockhash ||
      '',

    lastValidBlockHeight:
      toSafeNumber(
        result?.value
          ?.lastValidBlockHeight,
        0
      ),

    contextSlot:
      toSafeNumber(
        result?.context
          ?.slot,
        0
      ),
  };
}

export async function getBlockHeight({
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const result =
    await rpcRequest({
      method:
        'getBlockHeight',

      params: [
        {
          commitment:
            normaliseCommitment(
              commitment
            ),
        },
      ],
    });

  return Math.max(
    0,
    toSafeNumber(
      result,
      0
    )
  );
}

export async function getSolBalance({
  walletAddress,
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const safeWalletAddress =
    requireAddress(
      walletAddress
    );

  const result =
    await rpcRequest({
      method:
        'getBalance',

      params: [
        safeWalletAddress,

        {
          commitment:
            normaliseCommitment(
              commitment
            ),
        },
      ],
    });

  const lamports =
    Math.max(
      0,
      toSafeNumber(
        result?.value,
        0
      )
    );

  return {
    walletAddress:
      safeWalletAddress,

    lamports,

    sol:
      lamports /
      LAMPORTS_PER_SOL,

    contextSlot:
      toSafeNumber(
        result?.context
          ?.slot,
        0
      ),

    fetchedAt:
      new Date()
        .toISOString(),
  };
}

export async function getTokenAccountsByOwner({
  walletAddress,
  mintAddress,
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const safeWalletAddress =
    requireAddress(
      walletAddress
    );

  const safeMintAddress =
    requireAddress(
      mintAddress,
      'Token mint address'
    );

  const result =
    await rpcRequest({
      method:
        'getTokenAccountsByOwner',

      params: [
        safeWalletAddress,

        {
          mint:
            safeMintAddress,
        },

        {
          encoding:
            'jsonParsed',

          commitment:
            normaliseCommitment(
              commitment
            ),
        },
      ],
    });

  const accounts =
    Array.isArray(
      result?.value
    )
      ? result.value
      : [];

  return accounts.map(
    account => {
      const tokenAmount =
        account
          ?.account
          ?.data
          ?.parsed
          ?.info
          ?.tokenAmount ||
        {};

      return {
        tokenAccountAddress:
          account?.pubkey ||
          '',

        mintAddress:
          safeMintAddress,

        ownerAddress:
          safeWalletAddress,

        rawAmount:
          String(
            tokenAmount.amount ||
              '0'
          ),

        decimals:
          Math.max(
            0,
            toSafeNumber(
              tokenAmount.decimals,
              0
            )
          ),

        uiAmount:
          toSafeNumber(
            tokenAmount.uiAmount,
            0
          ),

        uiAmountString:
          String(
            tokenAmount.uiAmountString ||
              '0'
          ),
      };
    }
  );
}

export async function getTokenBalance({
  walletAddress,
  mintAddress,
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const accounts =
    await getTokenAccountsByOwner({
      walletAddress,
      mintAddress,
      commitment,
    });

  /*
   * Sum the raw integer amounts as BigInt so large
   * balances never lose precision to rounded floats.
   */
  const totalRawAmount =
    accounts.reduce(
      (
        total,
        account
      ) => {
        const rawText =
          String(
            account.rawAmount ||
              '0'
          );

        if (
          !/^\d+$/.test(
            rawText
          )
        ) {
          return total;
        }

        return (
          total +
          BigInt(
            rawText
          )
        );
      },
      BigInt(0)
    );

  /*
   * Decimals are identical for every account of the
   * same mint, so take them from any account that
   * reports one.
   */
  const decimals =
    accounts.reduce(
      (
        found,
        account
      ) =>
        found !== null
          ? found
          : Number.isFinite(
              account.decimals
            ) &&
            account.decimals > 0
            ? account.decimals
            : found,
      null
    ) ??
    (
      accounts.length > 0
        ? accounts[0]
            .decimals
        : 0
    );

  const rawAmount =
    totalRawAmount.toString();

  const totalUiAmount =
    rawAmountToUiAmount(
      rawAmount,
      decimals
    );

  return {
    walletAddress:
      normaliseAddress(
        walletAddress
      ),

    mintAddress:
      normaliseAddress(
        mintAddress
      ),

    balance:
      totalUiAmount,

    uiAmount:
      totalUiAmount,

    rawAmount,

    decimals,

    accountCount:
      accounts.length,

    accounts,

    fetchedAt:
      new Date()
        .toISOString(),
  };
}

export async function getHogesBalance({
  walletAddress,
  hogesMintAddress,
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const result =
    await getTokenBalance({
      walletAddress,

      mintAddress:
        hogesMintAddress,

      commitment,
    });

  return {
    ...result,

    hogesBalance:
      result.balance,
  };
}

export async function getWalletBalances({
  walletAddress,
  hogesMintAddress,
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const safeWalletAddress =
    requireAddress(
      walletAddress
    );

  const [
    solResult,
    hogesResult,
  ] =
    await Promise.all([
      getSolBalance({
        walletAddress:
          safeWalletAddress,

        commitment,
      }),

      getHogesBalance({
        walletAddress:
          safeWalletAddress,

        hogesMintAddress,

        commitment,
      }),
    ]);

  return {
    walletAddress:
      safeWalletAddress,

    solBalance:
      solResult.sol,

    solLamports:
      solResult.lamports,

    hogesBalance:
      hogesResult
        .hogesBalance,

    hogesDecimals:
      hogesResult.decimals,

    hogesTokenAccounts:
      hogesResult.accounts,

    fetchedAt:
      new Date()
        .toISOString(),
  };
}

export async function getSignaturesForAddress({
  walletAddress,
  limit =
    DEFAULT_HISTORY_LIMIT,
  before = null,
  until = null,
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const safeWalletAddress =
    requireAddress(
      walletAddress
    );

  const safeLimit =
    Math.min(
      1000,
      Math.max(
        1,
        Math.floor(
          toSafeNumber(
            limit,
            DEFAULT_HISTORY_LIMIT
          )
        )
      )
    );

  const config = {
    limit:
      safeLimit,

    commitment:
      normaliseCommitment(
        commitment
      ),
  };

  if (
    before
  ) {
    config.before =
      String(before);
  }

  if (
    until
  ) {
    config.until =
      String(until);
  }

  const result =
    await rpcRequest({
      method:
        'getSignaturesForAddress',

      params: [
        safeWalletAddress,
        config,
      ],
    });

  const signatures =
    Array.isArray(
      result
    )
      ? result
      : [];

  return signatures.map(
    item => ({
      signature:
        item?.signature ||
        '',

      slot:
        toSafeNumber(
          item?.slot,
          0
        ),

      blockTime:
        item?.blockTime ??
        null,

      confirmationStatus:
        item
          ?.confirmationStatus ||
        null,

      error:
        item?.err ||
        null,

      memo:
        item?.memo ||
        null,

      successful:
        !item?.err,
    })
  );
}

export async function getTransaction({
  signature,
  commitment =
    DEFAULT_COMMITMENT,
  maxSupportedTransactionVersion =
    0,
} = {}) {
  const safeSignature =
    String(
      signature || ''
    ).trim();

  if (
    !safeSignature
  ) {
    throw new Error(
      'A transaction signature is required.'
    );
  }

  return rpcRequest({
    method:
      'getTransaction',

    params: [
      safeSignature,

      {
        commitment:
          normaliseCommitment(
            commitment
          ),

        encoding:
          'jsonParsed',

        maxSupportedTransactionVersion:
          Math.max(
            0,
            toSafeNumber(
              maxSupportedTransactionVersion,
              0
            )
          ),
      },
    ],
  });
}

export async function getRecentTransactions({
  walletAddress,
  limit =
    DEFAULT_HISTORY_LIMIT,
  includeTransactionDetails =
    false,
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const signatures =
    await getSignaturesForAddress({
      walletAddress,
      limit,
      commitment,
    });

  if (
    !includeTransactionDetails
  ) {
    return signatures;
  }

  /*
   * Fetch transaction details in small sequential
   * batches so public RPC endpoints do not respond
   * with HTTP 429 rate limits.
   */
  const transactions =
    [];

  for (
    let start = 0;
    start <
    signatures.length;
    start +=
      TRANSACTION_FETCH_BATCH_SIZE
  ) {
    const batch =
      signatures.slice(
        start,
        start +
          TRANSACTION_FETCH_BATCH_SIZE
      );

    const batchResults =
      await Promise.all(
        batch.map(
          async item => {
            try {
              const transaction =
                await getTransaction({
                  signature:
                    item.signature,

                  commitment,
                });

              return {
                ...item,
                transaction,
              };
            } catch (
              error
            ) {
              return {
                ...item,

                transaction:
                  null,

                fetchError:
                  String(
                    error?.message ||
                      error
                  ),
              };
            }
          }
        )
      );

    transactions.push(
      ...batchResults
    );
  }

  return transactions;
}

export async function getSignatureStatuses({
  signatures = [],
  searchTransactionHistory =
    true,
} = {}) {
  const safeSignatures =
    Array.isArray(
      signatures
    )
      ? signatures
          .map(
            signature =>
              String(
                signature ||
                  ''
              ).trim()
          )
          .filter(
            Boolean
          )
      : [];

  if (
    safeSignatures.length ===
    0
  ) {
    return [];
  }

  const result =
    await rpcRequest({
      method:
        'getSignatureStatuses',

      params: [
        safeSignatures,

        {
          searchTransactionHistory:
            Boolean(
              searchTransactionHistory
            ),
        },
      ],
    });

  const statuses =
    Array.isArray(
      result?.value
    )
      ? result.value
      : [];

  return safeSignatures.map(
    (
      signature,
      index
    ) => {
      const status =
        statuses[index] ||
        null;

      return {
        signature,

        found:
          Boolean(
            status
          ),

        slot:
          toSafeNumber(
            status?.slot,
            0
          ),

        confirmations:
          status?.confirmations ??
          null,

        confirmationStatus:
          status
            ?.confirmationStatus ||
          null,

        error:
          status?.err ||
          null,

        successful:
          Boolean(
            status &&
            !status.err
          ),
      };
    }
  );
}

/*
 * Waits for a transaction signature to reach the
 * requested commitment.
 *
 * Pass the blockhash's lastValidBlockHeight so the
 * result can distinguish three outcomes:
 *
 * - confirmed: the transaction reached commitment.
 * - expired: the chain moved past
 *   lastValidBlockHeight without the transaction
 *   landing, so it can never land and is safe to
 *   retry with a fresh blockhash.
 * - stillPending: the overall time cap was reached
 *   but the transaction may STILL land on chain.
 *   Callers must NOT automatically resubmit on
 *   stillPending — doing so risks a double send.
 */
export async function waitForSignatureConfirmation({
  signature,
  commitment =
    DEFAULT_COMMITMENT,
  timeoutMs =
    DEFAULT_CONFIRMATION_TIMEOUT_MS,
  intervalMs =
    DEFAULT_CONFIRMATION_INTERVAL_MS,
  lastValidBlockHeight = null,
} = {}) {
  const safeSignature =
    String(
      signature || ''
    ).trim();

  if (
    !safeSignature
  ) {
    throw new Error(
      'A transaction signature is required.'
    );
  }

  const safeCommitment =
    normaliseCommitment(
      commitment
    );

  const safeLastValidBlockHeight =
    lastValidBlockHeight ===
      null ||
    lastValidBlockHeight ===
      undefined
      ? null
      : Math.max(
          0,
          toSafeNumber(
            lastValidBlockHeight,
            0
          )
        );

  const safeTimeoutMs =
    Math.min(
      MAX_CONFIRMATION_TIMEOUT_MS,
      Math.max(
        1000,
        toSafeNumber(
          timeoutMs,
          DEFAULT_CONFIRMATION_TIMEOUT_MS
        )
      )
    );

  /*
   * With a lastValidBlockHeight the block height is
   * authoritative, so keep polling up to the hard cap
   * rather than the shorter default timeout.
   */
  const overallCapMs =
    safeLastValidBlockHeight !==
    null
      ? MAX_CONFIRMATION_TIMEOUT_MS
      : safeTimeoutMs;

  const safeIntervalMs =
    Math.max(
      250,
      toSafeNumber(
        intervalMs,
        DEFAULT_CONFIRMATION_INTERVAL_MS
      )
    );

  const startedAt =
    Date.now();

  while (
    Date.now() -
      startedAt <
    overallCapMs
  ) {
    const [
      status,
    ] =
      await getSignatureStatuses({
        signatures: [
          safeSignature,
        ],
      });

    if (
      status?.error
    ) {
      return {
        ...status,

        confirmed:
          false,

        expired:
          false,

        stillPending:
          false,

        timedOut:
          false,
      };
    }

    const reachedCommitment =
      safeCommitment ===
        'processed'
        ? Boolean(
            status?.found
          )
        : safeCommitment ===
            'confirmed'
          ? [
              'confirmed',
              'finalized',
            ].includes(
              status
                ?.confirmationStatus
            )
          : status
              ?.confirmationStatus ===
            'finalized';

    if (
      reachedCommitment
    ) {
      return {
        ...status,

        confirmed:
          true,

        expired:
          false,

        stillPending:
          false,

        timedOut:
          false,
      };
    }

    if (
      safeLastValidBlockHeight !==
      null
    ) {
      let currentBlockHeight =
        null;

      try {
        currentBlockHeight =
          await getBlockHeight({
            commitment:
              safeCommitment,
          });
      } catch {
        currentBlockHeight =
          null;
      }

      if (
        currentBlockHeight !==
          null &&
        currentBlockHeight >
          safeLastValidBlockHeight
      ) {
        /*
         * The blockhash has expired, so the
         * transaction can never land. It is safe to
         * retry with a fresh blockhash.
         */
        return {
          signature:
            safeSignature,

          confirmed:
            false,

          expired:
            true,

          stillPending:
            false,

          timedOut:
            false,

          currentBlockHeight,

          lastValidBlockHeight:
            safeLastValidBlockHeight,

          error:
            null,

          confirmationStatus:
            status
              ?.confirmationStatus ||
            null,
        };
      }
    }

    await delay(
      safeIntervalMs
    );
  }

  /*
   * The time cap was reached without proof of expiry:
   * the transaction may STILL land. Callers must not
   * blindly resubmit on stillPending.
   */
  return {
    signature:
      safeSignature,

    confirmed:
      false,

    expired:
      false,

    stillPending:
      true,

    timedOut:
      true,

    error:
      null,

    confirmationStatus:
      null,
  };
}

export async function sendSignedTransaction({
  signedTransactionBase64,
  skipPreflight = false,
  preflightCommitment =
    DEFAULT_COMMITMENT,
  maxRetries = 3,
} = {}) {
  const safeTransaction =
    String(
      signedTransactionBase64 ||
        ''
    ).trim();

  if (
    !safeTransaction
  ) {
    throw new Error(
      'A signed base64 transaction is required.'
    );
  }

  const signature =
    await rpcRequest({
      method:
        'sendTransaction',

      params: [
        safeTransaction,

        {
          encoding:
            'base64',

          skipPreflight:
            Boolean(
              skipPreflight
            ),

          preflightCommitment:
            normaliseCommitment(
              preflightCommitment
            ),

          maxRetries:
            Math.max(
              0,
              Math.floor(
                toSafeNumber(
                  maxRetries,
                  3
                )
              )
            ),
        },
      ],
    });

  return {
    signature:
      String(
        signature || ''
      ),

    submittedAt:
      new Date()
        .toISOString(),
  };
}

export async function sendAndConfirmSignedTransaction({
  signedTransactionBase64,
  skipPreflight = false,
  commitment =
    DEFAULT_COMMITMENT,
  maxRetries = 3,
  timeoutMs =
    DEFAULT_CONFIRMATION_TIMEOUT_MS,
  lastValidBlockHeight = null,
} = {}) {
  const submission =
    await sendSignedTransaction({
      signedTransactionBase64,
      skipPreflight,
      preflightCommitment:
        commitment,
      maxRetries,
    });

  const confirmation =
    await waitForSignatureConfirmation({
      signature:
        submission.signature,

      commitment,

      timeoutMs,

      lastValidBlockHeight,
    });

  return {
    ...submission,
    confirmation,

    confirmed:
      confirmation.confirmed,

    successful:
      confirmation.confirmed &&
      !confirmation.error,
  };
}

export async function getWalletSnapshot({
  walletAddress,
  hogesMintAddress,
  historyLimit =
    DEFAULT_HISTORY_LIMIT,
  includeHistory =
    true,
  commitment =
    DEFAULT_COMMITMENT,
} = {}) {
  const safeWalletAddress =
    requireAddress(
      walletAddress
    );

  const [
    network,
    balances,
    history,
  ] =
    await Promise.all([
      getNetworkHealth(),

      getWalletBalances({
        walletAddress:
          safeWalletAddress,

        hogesMintAddress,

        commitment,
      }),

      includeHistory
        ? getSignaturesForAddress({
            walletAddress:
              safeWalletAddress,

            limit:
              historyLimit,

            commitment,
          })
        : Promise.resolve(
            []
          ),
    ]);

  return {
    network,

    balances,

    history,

    fetchedAt:
      new Date()
        .toISOString(),
  };
}

export const RPC_DEFAULTS = {
  rpcUrl:
    DEFAULT_RPC_URL,

  commitment:
    DEFAULT_COMMITMENT,

  lamportsPerSol:
    LAMPORTS_PER_SOL,

  historyLimit:
    DEFAULT_HISTORY_LIMIT,

  confirmationTimeoutMs:
    DEFAULT_CONFIRMATION_TIMEOUT_MS,

  confirmationIntervalMs:
    DEFAULT_CONFIRMATION_INTERVAL_MS,
};