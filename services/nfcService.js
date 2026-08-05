import validateAddress from '../utils/validateAddress.js';

/*
 * Demo data only: a well-formed base58 address so it
 * passes the same validation a real tapped payload
 * must pass. Not a funded wallet.
 */
const DEMO_RECIPIENT = {
  walletName:
    'Tapped Cashie',

  walletAddress:
    'TapDemo1CashieWa11etAddre55Ba5e58Va1idAbcd',

  amount:
    null,

  currencyCode:
    'AUD',
};

const MAXIMUM_WALLET_NAME_LENGTH =
  60;

const MAXIMUM_REQUEST_AMOUNT =
  1000000000;

const DEFAULT_SEARCH_DELAY_MS =
  2200;

let activeSession =
  null;

export function isNfcSupported() {
  /*
   * Demo version:
   * return true so the Tap flow can be completed
   * inside Snack.
   *
   * Later, this function will check the actual
   * NFC capability of the physical device.
   */

  return true;
}

export function createNfcPaymentRequest({
  walletName = '',
  walletAddress = '',
  amount = null,
  currencyCode = 'AUD',
} = {}) {
  return {
    type:
      'cashie-payment',

    version:
      1,

    walletName:
      String(
        walletName
      ).trim(),

    walletAddress:
      String(
        walletAddress
      ).trim(),

    amount:
      amount ===
      null
        ? null
        : Number(
            amount
          ),

    currencyCode:
      String(
        currencyCode ||
          'AUD'
      ).toUpperCase(),
  };
}

export function validateNfcPaymentRequest(
  paymentRequest
) {
  if (
    !paymentRequest ||
    typeof paymentRequest !==
      'object'
  ) {
    return false;
  }

  if (
    paymentRequest.type !==
    'cashie-payment'
  ) {
    return false;
  }

  if (
    Number(
      paymentRequest.version
    ) !==
    1
  ) {
    return false;
  }

  /*
   * A tapped payload is attacker-controlled input:
   * the address must be well-formed base58 and any
   * amount must be a sane positive number.
   */
  if (
    !validateAddress(
      String(
        paymentRequest.walletAddress ||
          ''
      )
    )
  ) {
    return false;
  }

  if (
    paymentRequest.amount !==
      null &&
    paymentRequest.amount !==
      undefined
  ) {
    const numericAmount =
      Number(
        paymentRequest.amount
      );

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <=
        0 ||
      numericAmount >
        MAXIMUM_REQUEST_AMOUNT
    ) {
      return false;
    }
  }

  return true;
}

export function normaliseNfcPaymentRequest(
  paymentRequest
) {
  if (
    !validateNfcPaymentRequest(
      paymentRequest
    )
  ) {
    throw new Error(
      'Invalid Cashie Tap payment request.'
    );
  }

  const numericAmount =
    paymentRequest.amount ===
      null ||
    paymentRequest.amount ===
      undefined
      ? null
      : Number(
          paymentRequest.amount
        );

  return {
    walletName:
      String(
        paymentRequest.walletName ||
          'Cashie wallet'
      )
        .trim()
        .slice(
          0,
          MAXIMUM_WALLET_NAME_LENGTH
        ),

    walletAddress:
      String(
        paymentRequest.walletAddress
      ).trim(),

    amount:
      Number.isFinite(
        numericAmount
      ) &&
      numericAmount >
        0
        ? numericAmount
        : null,

    currencyCode:
      String(
        paymentRequest.currencyCode ||
          'AUD'
      ).toUpperCase(),
  };
}

export async function startNfcScan({
  searchDelayMs =
    DEFAULT_SEARCH_DELAY_MS,

  demoRecipient =
    DEMO_RECIPIENT,

  shouldFail =
    false,
} = {}) {
  cancelNfcScan();

  if (
    !isNfcSupported()
  ) {
    throw new Error(
      'Tap payments are not supported on this device.'
    );
  }

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const sessionId =
        Date.now();

      const timeout =
        setTimeout(
          () => {
            if (
              !activeSession ||
              activeSession.id !==
                sessionId
            ) {
              return;
            }

            activeSession =
              null;

            if (
              shouldFail
            ) {
              reject(
                new Error(
                  'No nearby Cashie phone was found.'
                )
              );

              return;
            }

            try {
              const paymentRequest =
                createNfcPaymentRequest({
                  walletName:
                    demoRecipient.walletName,

                  walletAddress:
                    demoRecipient.walletAddress,

                  amount:
                    demoRecipient.amount,

                  currencyCode:
                    demoRecipient.currencyCode,
                });

              resolve(
                normaliseNfcPaymentRequest(
                  paymentRequest
                )
              );
            } catch (
              error
            ) {
              reject(
                error
              );
            }
          },
          Math.max(
            Number(
              searchDelayMs
            ) ||
              DEFAULT_SEARCH_DELAY_MS,
            250
          )
        );

      activeSession = {
        id:
          sessionId,

        timeout,

        reject,
      };
    }
  );
}

export function cancelNfcScan() {
  if (
    !activeSession
  ) {
    return;
  }

  clearTimeout(
    activeSession.timeout
  );

  const cancellationError =
    new Error(
      'Tap payment cancelled.'
    );

  /*
   * Machine-readable marker so callers can tell a
   * deliberate cancel from a genuine failure without
   * matching on message text.
   */
  cancellationError.code =
    'cancelled';

  activeSession.reject?.(
    cancellationError
  );

  activeSession =
    null;
}

export function isNfcScanActive() {
  return Boolean(
    activeSession
  );
}

export default {
  isNfcSupported,
  createNfcPaymentRequest,
  validateNfcPaymentRequest,
  normaliseNfcPaymentRequest,
  startNfcScan,
  cancelNfcScan,
  isNfcScanActive,
};