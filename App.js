import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  SafeAreaView,
  View,
} from 'react-native';

import WalletCoverScreen from './screens/WalletCoverScreen.js';
import HomeScreen from './screens/HomeScreen.js';
import WhoToPayScreen from './screens/WhoToPayScreen.js';
import ReviewPaymentScreen from './screens/ReviewPaymentScreen.js';
import PaymentCompleteScreen from './screens/PaymentCompleteScreen.js';
import CashiePersonDetailScreen from './screens/CashiePersonDetailScreen.js';
import TapToPayScreen from './screens/TapToPayScreen.js';
import PaymentRequestIncompleteScreen from './screens/PaymentRequestIncompleteScreen.js';
import UpdateBatteryScreen from './screens/UpdateBatteryScreen.js';
import ChangeLocalCashScreen from './screens/ChangeLocalCashScreen.js';

import CashiePeopleList from './components/CashiePeopleList.js';
import CashiePersonForm from './components/CashiePersonForm.js';
import CashiePaymentReceipt from './components/CashiePaymentReceipt.js';
import CashieStatement from './components/CashieStatement.js';
import CashieDeleteHistoryModal from './components/CashieDeleteHistoryModal.js';
import CashieDashie from './components/CashieDashie.js';
import CashieSettings from './components/CashieSettings.js';
import {
  startNfcScan,
  cancelNfcScan,
} from './services/nfcService.js';

import {
  addCashiePerson,
  clearPersonHistory,
  countPeoplePaid,
  createSentActivity,
  getInitials,
  isKnownCashiePerson,
  normaliseWalletAddress,
  recordPaymentForWalletAddress,
  removeCashiePerson,
  updateCashiePerson,
} from './services/contactsService.js';

import {
  getBatterySnapshot,
} from './services/batteryService.js';

import {
  getPriceSnapshot,
  valueWallet,
} from './services/priceService.js';

import {
  clearPaymentHistory,
  factoryResetStorage,
  loadAppState,
  saveAppState,
} from './services/storageService.js';

import {
  TEST_ADDRESS,
} from './utils/constants.js';

import CURRENCIES from './components/currencies.json';

const HOGES_MINT_ADDRESS =
  '2GU6q72m9MnYRSsUszUwipLUBMpXm72gijL2VhQAHnyz';

const SCREEN_BACKGROUND =
  '#F8F3E8';

const INITIAL_WALLET = {
  solBalance: 0.003,
  hogesBalance: 12500,
};

const INITIAL_WALLET_NAME =
  '';

const INITIAL_PAYMENTS_MADE =
  486;

const INITIAL_MEMBER_SINCE =
  'July 2026';

const INITIAL_DISPLAY_CURRENCY =
  'AUD';

const DEFAULT_BATTERY_MODE =
  'auto';

const DEFAULT_BATTERY_LOW_PERCENT =
  20;

const DEFAULT_SOL_PRICE_AUD =
  200;

const DEFAULT_HOGES_PER_SOL =
  25000;

function formatAudAmount(
  amount
) {
  return `A$${Number(
    amount || 0
  ).toFixed(2)}`;
}

function formatLocalAmount(
  amount,
  currency
) {
  const numericAmount =
    Number(
      amount ||
      0
    );

  const decimalPlaces =
    Number.isInteger(
      Number(
        currency
          ?.decimalPlaces
      )
    )
      ? Number(
          currency
            .decimalPlaces
        )
      : 2;

  const formattedAmount =
    numericAmount.toLocaleString(
      'en-AU',
      {
        minimumFractionDigits:
          decimalPlaces,

        maximumFractionDigits:
          decimalPlaces,
      }
    );

  const symbol =
    String(
      currency?.symbol ||
      ''
    );

  return currency
    ?.symbolPosition ===
    'after'
      ? `${formattedAmount} ${symbol}`
      : `${symbol}${formattedAmount}`;
}

function formatActivityDate(
  date = new Date()
) {
  return date.toLocaleDateString(
    'en-AU',
    {
      day: 'numeric',
      month: 'short',
    }
  );
}

function parseActivityAmount(
  amount = ''
) {
  const numericValue =
    Number(
      String(
        amount
      ).replace(
        /[^0-9.-]/g,
        ''
      )
    );

  return Number.isFinite(
    numericValue
  )
    ? numericValue
    : 0;
}

function cleanWalletName(
  value = ''
) {
  return String(
    value || ''
  )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(
      0,
      60
    );
}

function parseScannedRecipient(
  rawValue
) {
  if (
    !rawValue
  ) {
    return null;
  }

  let payload =
    rawValue;

  if (
    typeof rawValue ===
    'string'
  ) {
    const trimmedValue =
      rawValue.trim();

    if (
      !trimmedValue
    ) {
      return null;
    }

    try {
      payload =
        JSON.parse(
          trimmedValue
        );
    } catch {
      payload = {
        walletAddress:
          trimmedValue,
      };
    }
  }

  if (
    typeof payload !==
      'object' ||
    Array.isArray(
      payload
    )
  ) {
    return null;
  }

  const walletAddress =
    normaliseWalletAddress(
      payload.walletAddress ||
      payload.address ||
      ''
    );

  if (
    !walletAddress
  ) {
    return null;
  }

  const walletName =
    cleanWalletName(
      payload.walletName ||
      payload.name ||
      ''
    );

  return {
    name:
      walletName,

    address:
      walletAddress,

    requiresName:
      !walletName,

    isSavedContact:
      false,

    isMerchant:
      payload.type ===
        'cashie-merchant' ||
      payload.isMerchant ===
        true,

    qrType:
      payload.type ||
      'wallet-address',

    qrVersion:
      Number(
        payload.version ||
        1
      ),
    amount:
      Number.isFinite(
        Number(
          payload.amount
        )
      ) &&
      Number(
        payload.amount
      ) >
        0
        ? Number(
            payload.amount
          )
        : null,

    currencyCode:
      String(
        payload.currencyCode ||
        INITIAL_DISPLAY_CURRENCY
      ).toUpperCase(),  };
}

function createInitialPriceSnapshot() {
  const hogesPriceAud =
    DEFAULT_SOL_PRICE_AUD /
    DEFAULT_HOGES_PER_SOL;

  return {
    baseCurrency:
      'AUD',

    displayCurrency:
      INITIAL_DISPLAY_CURRENCY,

    solPriceAud:
      DEFAULT_SOL_PRICE_AUD,

    hogesPerSol:
      DEFAULT_HOGES_PER_SOL,

    hogesPriceAud,

    hogesPerAud:
      1 /
      hogesPriceAud,

    fxSnapshot:
      null,

    sourceStatus: {
      fx:
        'fallback',

      sol:
        'demo',

      hoges:
        'demo',
    },

    stale:
      true,
  };
}

export default function App() {
  const [
    currentScreen,
    setCurrentScreen,
  ] = useState(
    'home'
  );

  const [
    walletCoverVisible,
    setWalletCoverVisible,
  ] = useState(
    true
  );

  const [
    walletActivated,
    setWalletActivated,
  ] = useState(
    true
  );

  const [
    wallet,
    setWallet,
  ] = useState(
    INITIAL_WALLET
  );

  const [
    walletName,
    setWalletName,
  ] = useState(
    INITIAL_WALLET_NAME
  );

  const [
    recipient,
    setRecipient,
  ] = useState(
    null
  );

  const [
    tapStatus,
    setTapStatus,
  ] = useState(
    'searching'
  );

  const [
    tappedRecipient,
    setTappedRecipient,
  ] = useState(
    null
  );

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState(
    0
  );

  const [
    requestedAmount,
    setRequestedAmount,
  ] = useState(
    0
  );

  const [
    cashiePeople,
    setCashiePeople,
  ] = useState(
    []
  );

  const [
    selectedPersonId,
    setSelectedPersonId,
  ] = useState(
    null
  );

  const [
    deleteHistoryVisible,
    setDeleteHistoryVisible,
  ] = useState(
    false
  );

  const [
    selectedReceipt,
    setSelectedReceipt,
  ] = useState(
    null
  );

  const [
    selectedStatement,
    setSelectedStatement,
  ] = useState(
    null
  );

  const [
    paymentsMade,
    setPaymentsMade,
  ] = useState(
    INITIAL_PAYMENTS_MADE
  );

  const [
    memberSince,
    setMemberSince,
  ] = useState(
    INITIAL_MEMBER_SINCE
  );

  const [
    displayCurrency,
    setDisplayCurrency,
  ] = useState(
    INITIAL_DISPLAY_CURRENCY
  );

  const [
    batteryMode,
    setBatteryMode,
  ] = useState(
    DEFAULT_BATTERY_MODE
  );

  const [
    batteryLowThresholdPercent,
    setBatteryLowThresholdPercent,
  ] = useState(
    DEFAULT_BATTERY_LOW_PERCENT
  );

  const [
    priceSnapshot,
    setPriceSnapshot,
  ] = useState(
    createInitialPriceSnapshot
  );

  const [
    storageReady,
    setStorageReady,
  ] = useState(
    false
  );

  const selectedCurrency =
    useMemo(
      () =>
        CURRENCIES[
          displayCurrency
        ] ||
        CURRENCIES[
          INITIAL_DISPLAY_CURRENCY
        ],
      [
        displayCurrency,
      ]
    );

  const selectedPerson =
    useMemo(
      () =>
        cashiePeople.find(
          person =>
            person.id ===
            selectedPersonId
        ) ||
        null,
      [
        cashiePeople,
        selectedPersonId,
      ]
    );

  const walletValue =
    useMemo(
      () =>
        valueWallet({
          solBalance:
            wallet.solBalance,

          hogesBalance:
            wallet.hogesBalance,

          priceSnapshot,
        }),
      [
        wallet,
        priceSnapshot,
      ]
    );

  const battery =
    useMemo(
      () =>
        getBatterySnapshot({
          solBalance:
            wallet.solBalance,

                    solPriceLocal:
            priceSnapshot
              .solPriceDisplay ??
            priceSnapshot
              .solPriceAud,

          currency:
            selectedCurrency,

          batteryMode,

          lowThresholdPercent:
            batteryLowThresholdPercent,
        }),
      [
        wallet.solBalance,
        priceSnapshot
          .solPriceDisplay,
        priceSnapshot
          .solPriceAud,
        selectedCurrency,
        batteryMode,
        batteryLowThresholdPercent,
      ]
    );

  const peoplePaid =
    useMemo(
      () =>
        countPeoplePaid(
          cashiePeople
        ),
      [
        cashiePeople,
      ]
    );

  useEffect(
    () => {
      let active =
        true;

      async function initialiseApp() {
        try {
          const [
            storedState,
            latestPrices,
          ] =
            await Promise.all([
              loadAppState(),

              getPriceSnapshot({
                displayCurrency:
                  INITIAL_DISPLAY_CURRENCY,

                solPriceAud:
                  DEFAULT_SOL_PRICE_AUD,

                hogesPerSol:
                  DEFAULT_HOGES_PER_SOL,
              }),
            ]);

          if (
            !active
          ) {
            return;
          }

          if (
            storedState?.wallet
          ) {
            setWallet(
              storedState.wallet
            );
          }

                    if (
            storedState?.wallet
          ) {
            setWallet({
              ...storedState.wallet,

              hogesBalance:
                12500,
            });
          }

          if (
            typeof storedState
              ?.walletActivated ===
            'boolean'
          ) {
            setWalletActivated(
              storedState
                .walletActivated
            );
          }

          if (
            Array.isArray(
              storedState
                ?.cashiePeople
            )
          ) {
            setCashiePeople(
              storedState
                .cashiePeople
            );
          }

          if (
            Number.isFinite(
              Number(
                storedState
                  ?.paymentsMade
              )
            )
          ) {
            setPaymentsMade(
              Number(
                storedState
                  .paymentsMade
              )
            );
          }

          if (
            storedState
              ?.memberSince
          ) {
            setMemberSince(
              storedState
                .memberSince
            );
          }

          if (
            storedState
              ?.selectedCurrency
          ) {
            setDisplayCurrency(
              storedState
                .selectedCurrency
            );
          }

          if (
  storedState?.batteryMode ===
    'auto' ||
  storedState?.batteryMode ===
    'remind'
) {
  setBatteryMode(
    storedState.batteryMode
  );
}

if (
  Number.isFinite(
    Number(
      storedState?.batteryLowThresholdPercent
    )
  )
) {
  setBatteryLowThresholdPercent(
    Math.max(
      0,
      Math.min(
        100,
        Number(
          storedState.batteryLowThresholdPercent
        )
      )
    )
  );
}

          setPriceSnapshot(
            latestPrices
          );
        } catch (
          error
        ) {
          console.warn(
            'Cashie startup failed:',
            error
          );
        } finally {
          if (
            active
          ) {
            setStorageReady(
              true
            );
          }
        }
      }

      initialiseApp();

      return () => {
        active =
          false;
      };
    },
    []
  );

  useEffect(
    () => {
      if (
        !storageReady
      ) {
        return;
      }

      saveAppState({
        wallet,
        walletName,
        walletActivated,
        cashiePeople,
        paymentsMade,
        memberSince,

        selectedCurrency:
          displayCurrency,

        batteryMode,
batteryLowThresholdPercent,
      }).catch(
        error => {
          console.warn(
            'Cashie save failed:',
            error
          );
        }
      );
    },
    [
      storageReady,
      wallet,
      walletName,
      walletActivated,
      cashiePeople,
      paymentsMade,
      memberSince,
      displayCurrency,
      batteryMode,
batteryLowThresholdPercent,
    ]
  );

  useEffect(
    () => {
      if (
        !storageReady
      ) {
        return;
      }

      let active =
        true;

      async function refreshPrices() {
        try {
          const latestPrices =
            await getPriceSnapshot({
              displayCurrency,

              solPriceAud:
                DEFAULT_SOL_PRICE_AUD,

              hogesPerSol:
                DEFAULT_HOGES_PER_SOL,
            });

          if (
            active
          ) {
            setPriceSnapshot(
              latestPrices
            );
          }
        } catch (
          error
        ) {
          console.warn(
            'Price refresh failed:',
            error
          );
        }
      }

      refreshPrices();

      return () => {
        active =
          false;
      };
    },
    [
      displayCurrency,
      storageReady,
    ]
  );

  function clearPayment() {
    cancelNfcScan();

    setRecipient(
      null
    );

    setTappedRecipient(
      null
    );

    setTapStatus(
      'searching'
    );

    setPaymentAmount(
      0
    );
  }

  function clearSelectedViews() {
    setSelectedPersonId(
      null
    );

    setSelectedReceipt(
      null
    );

    setSelectedStatement(
      null
    );

    setDeleteHistoryVisible(
      false
    );
  }

  function returnHome() {
    clearPayment();
    clearSelectedViews();

    setCurrentScreen(
      'home'
    );
  }

  function openWallet() {
    if (
      !walletActivated
    ) {
      return;
    }

    setWalletCoverVisible(
      false
    );

    setCurrentScreen(
      'home'
    );
  }

  function openCashiePeople() {
    clearPayment();
    clearSelectedViews();

    setCurrentScreen(
      'cashie-people'
    );
  }

  function openCashieDashie() {
    clearPayment();
    clearSelectedViews();

    setCurrentScreen(
      'cashie-dashie'
    );
  }

  function openUpdateBattery() {
    clearPayment();
    clearSelectedViews();

    setCurrentScreen(
      'update-battery'
    );
  }

  function openSettings() {
    clearPayment();
    clearSelectedViews();

    setCurrentScreen(
      'cashie-settings'
    );
  }

  function openChangeLocalCash() {
    clearPayment();
    clearSelectedViews();

    setCurrentScreen(
      'change-local-cash'
    );
  }

    function confirmBatteryUpdate() {
    topUpBattery();

    setCurrentScreen(
      'cashie-dashie'
    );
  }

  function openPersonDetail(
    person
  ) {
    setSelectedPersonId(
      person.id
    );

    setCurrentScreen(
      'person-detail'
    );
  }

  function openEditPerson(
    person
  ) {
    setSelectedPersonId(
      person.id
    );

    setCurrentScreen(
      'person-form'
    );
  }

  function beginPayment(
    amount
  ) {
    const numericAmount =
      Number(
        amount ||
        0
      );

    if (
      numericAmount <=
      0
    ) {
      return;
    }

    setPaymentAmount(
      numericAmount
    );

    setRecipient(
      null
    );

    setCurrentScreen(
      'who-to-pay'
    );
  }

  function openTapOrScan() {
    clearPayment();

    setCurrentScreen(
      'who-to-pay'
    );
  }

  function beginPeoplePayment() {
    clearPayment();

    setCurrentScreen(
      'home'
    );
  }

  function payCashiePerson() {
    clearPayment();

    setSelectedPersonId(
      null
    );

    setCurrentScreen(
      'home'
    );
  }

  function createReceiveRequest(
    amount
  ) {
    const numericAmount =
      Number(
        amount ||
        0
      );

    setRequestedAmount(
      numericAmount >
      0
        ? numericAmount
        : 0
    );
  }

  function chooseRecipient(
    selectedRecipient,
    suppliedAmount =
      null
  ) {
    const requestAmount =
      Number(
        suppliedAmount ??
        selectedRecipient
          ?.amount ??
        0
      );

    setRecipient(
      selectedRecipient
    );

    if (
      Number.isFinite(
        requestAmount
      ) &&
      requestAmount >
        0
    ) {
      setPaymentAmount(
        requestAmount
      );
    }

    setCurrentScreen(
      'review-payment'
    );
  }

  function showIncompleteRequest(
    incompleteRecipient
  ) {
    setRecipient(
      incompleteRecipient
    );

    setCurrentScreen(
      'payment-request-incomplete'
    );
  }

  function handlePaymentRequest(
    paymentRequest
  ) {
    if (
      !paymentRequest
    ) {
      return;
    }

    const requestAmount =
      Number(
        paymentRequest
          .amount ||
        0
      );

    if (
      !Number.isFinite(
        requestAmount
      ) ||
      requestAmount <=
        0
    ) {
      showIncompleteRequest(
        paymentRequest
      );

      return;
    }

    chooseRecipient(
      paymentRequest,
      requestAmount
    );
  }

  function handleScannedQrValue(
    rawValue
  ) {
    const scannedRecipient =
      parseScannedRecipient(
        rawValue
      );

    if (
      !scannedRecipient
    ) {
      Alert.alert(
        'QR Code Not Recognised',
        'This QR code does not contain a valid Cashie or Solana wallet address.'
      );

      return;
    }

    handlePaymentRequest(
      scannedRecipient
    );
  }

  function scanCashieQr() {
    /*
     * Demo scanner.
     *
     * This deliberately contains no amount so the
     * incomplete-request screen can be tested.
     */

    handleScannedQrValue(
      JSON.stringify({
        type:
          'cashie-payment',

        version:
          1,

        walletName:
          'Russ',

        walletAddress:
          TEST_ADDRESS,

        amount:
          null,

        currencyCode:
          displayCurrency,
      })
    );
  }

  async function beginTapToPay() {
    cancelNfcScan();

    setTappedRecipient(
      null
    );

    setTapStatus(
      'searching'
    );

    setCurrentScreen(
      'tap-to-pay'
    );

    try {
      const tappedRequest =
        await startNfcScan();

      const tappedPaymentRecipient = {
        name:
          cleanWalletName(
            tappedRequest
              ?.walletName ||
            ''
          ),

        address:
          normaliseWalletAddress(
            tappedRequest
              ?.walletAddress ||
            ''
          ),

        amount:
          tappedRequest
            ?.amount ??
          null,

        currencyCode:
          tappedRequest
            ?.currencyCode ||
          displayCurrency,

        requiresName:
          !cleanWalletName(
            tappedRequest
              ?.walletName ||
            ''
          ),

        isSavedContact:
          false,

        qrType:
          'cashie-payment',

        qrVersion:
          1,
      };

      if (
        !tappedPaymentRecipient
          .address
      ) {
        throw new Error(
          'The tapped Cashie request did not contain a valid wallet address.'
        );
      }

      setTappedRecipient(
        tappedPaymentRecipient
      );

      setTapStatus(
        'connected'
      );
    } catch (
      error
    ) {
      if (
        String(
          error?.message ||
          ''
        )
          .toLowerCase()
          .includes(
            'cancel'
          )
      ) {
        return;
      }

      console.warn(
        'Cashie Tap failed:',
        error
      );

      setTapStatus(
        'failed'
      );
    }
  }

  function continueTappedPayment() {
    if (
      !tappedRecipient
    ) {
      return;
    }

    handlePaymentRequest(
      tappedRecipient
    );
  }

  function cancelTapToPay() {
    cancelNfcScan();

    setTappedRecipient(
      null
    );

    setTapStatus(
      'searching'
    );

    setCurrentScreen(
      'who-to-pay'
    );
  }

  function recipientIsKnown() {
    return isKnownCashiePerson(
      cashiePeople,
      recipient?.address
    );
  }

  function completePayment() {
    if (
      recipientIsKnown()
    ) {
      setCashiePeople(
        currentPeople =>
          recordPaymentForWalletAddress({
            people:
              currentPeople,

            walletAddress:
              recipient?.address,

            amount:
              paymentAmount,
          }).people
      );
    }

    setPaymentsMade(
      currentCount =>
        currentCount +
        1
    );

    setCurrentScreen(
      'payment-complete'
    );
  }

  async function saveNewCashiePerson(
    personDetails
  ) {
    const walletAddress =
      normaliseWalletAddress(
        personDetails
          ?.walletAddress ||
        recipient
          ?.address
      );

    const name =
      cleanWalletName(
        personDetails
          ?.name ||
        recipient
          ?.name ||
        ''
      );

    if (
      !walletAddress ||
      !name
    ) {
      return;
    }

    const newActivity =
      createSentActivity({
        amount:
          paymentAmount,
      });

    setCashiePeople(
      currentPeople =>
        addCashiePerson(
          currentPeople,
          {
            name,
            walletAddress,

            initialActivity:
              newActivity,

            lastPaidAt:
              personDetails
                ?.lastPaidAt ||
              newActivity
                .createdAt,
          }
        ).people
    );
  }

  function saveEditedPerson(
    formPerson
  ) {
    if (
      !selectedPerson
    ) {
      return;
    }

    const walletAddress =
      normaliseWalletAddress(
        formPerson
          ?.walletAddress
      );

    const name =
      cleanWalletName(
        formPerson
          ?.name
      );

    if (
      !walletAddress ||
      !name
    ) {
      return;
    }

    setCashiePeople(
      currentPeople =>
        updateCashiePerson(
          currentPeople,
          selectedPerson.id,
          {
            ...formPerson,
            name,
            walletAddress,
          }
        ).people
    );

    setCurrentScreen(
      'person-detail'
    );
  }

  function requestDeleteHistory(
    person
  ) {
    setSelectedPersonId(
      person.id
    );

    setDeleteHistoryVisible(
      true
    );
  }

  function confirmDeleteHistory() {
    if (
      selectedPersonId
    ) {
      setCashiePeople(
        currentPeople =>
          clearPersonHistory(
            currentPeople,
            selectedPersonId
          ).people
      );
    }

    setDeleteHistoryVisible(
      false
    );
  }

  function deletePerson(
    person
  ) {
    Alert.alert(
      `Delete ${person.name}?`,
      'This removes the person and their local history from Cashie. Blockchain transactions are unaffected.',
      [
        {
          text:
            'Cancel',

          style:
            'cancel',
        },

        {
          text:
            'Delete Person',

          style:
            'destructive',

          onPress: () => {
            setCashiePeople(
              currentPeople =>
                removeCashiePerson(
                  currentPeople,
                  person.id
                ).people
            );

            setSelectedPersonId(
              null
            );

            setCurrentScreen(
              'cashie-people'
            );
          },
        },
      ]
    );
  }

  function openActivityReceipt(
    activity,
    person
  ) {
    const activityAmount =
      parseActivityAmount(
        activity.amount
      );

    const receipt = {
      recipient:
        activity.type ===
        'received'
          ? `From ${person.name}`
          : person.name,

      amount:
        formatAudAmount(
          activityAmount
        ),

      date:
        activity.date ||
        formatActivityDate(),

      time:
        activity.time ||
        '',

      transactionId:
        activity.transactionId ||
        activity.id,

      status:
        'Completed',
    };

    setSelectedReceipt(
      receipt
    );

    setCurrentScreen(
      'payment-receipt'
    );
  }

  function openPersonStatement(
    person
  ) {
    const transactions =
      (
        person.activity ||
        []
      ).map(
        activity => {
          const numericAmount =
            parseActivityAmount(
              activity.amount
            );

          return {
            id:
              activity.id,

            date:
              activity.date ||
              '',

            description:
              activity.type ===
              'received'
                ? 'Received'
                : 'Sent',

            amount:
              activity.type ===
              'received'
                ? numericAmount
                : -numericAmount,
          };
        }
      );

    setSelectedStatement({
      relationshipName:
        person.name,

      walletAddress:
        person.walletAddress,

      transactions,
    });

    setCurrentScreen(
      'statement'
    );
  }

  function copyWalletAddress() {
    Alert.alert(
      'Wallet Address',
      `${TEST_ADDRESS}\n\nCopy-to-clipboard will be connected when the wallet is live.`
    );
  }

  function topUpBattery() {
    const topUpRequiredLocal =
      Number(
        battery
          .batteryTopUpRequiredLocal ||
        0
      );

    if (
      !Number.isFinite(
        topUpRequiredLocal
      ) ||
      topUpRequiredLocal <=
        0
    ) {
      Alert.alert(
        'Battery Full',
        'Your Cashie Battery is already full.'
      );

      return;
    }

        const solPriceLocal =
      Number(
        priceSnapshot
          ?.solPriceDisplay ??
        priceSnapshot
          ?.solPriceAud ??
        0
      );

    if (
      !Number.isFinite(
        solPriceLocal
      ) ||
      solPriceLocal <=
        0
    ) {
      Alert.alert(
        'Battery Update Unavailable',
        'Cashie could not calculate the SOL amount required.'
      );

      return;
    }

    const solToAdd =
      topUpRequiredLocal /
      solPriceLocal;

    setWallet(
      currentWallet => ({
        ...currentWallet,

        solBalance:
          Number(
            currentWallet
              .solBalance ||
            0
          ) +
          solToAdd,
      })
    );

    Alert.alert(
      'Battery Updated',
      `${formatLocalAmount(
        topUpRequiredLocal,
        selectedCurrency
      )} of SOL has been added to your Cashie Battery.`
    );
  }

  function emptyWallet() {
    setWallet({
      solBalance:
        0,

      hogesBalance:
        0,
    });

    Alert.alert(
      'Wallet Emptied',
      'All available HOGES and unused Cashie Battery SOL have been removed from the demo wallet.'
    );

    returnHome();
  }

  async function clearAllLocalHistory() {
    const clearedPeople =
      cashiePeople.map(
        person => ({
          ...person,

          activity:
            [],

          paymentCount:
            0,

          paymentsSent:
            0,

          paymentsReceived:
            0,

          lastPaidAt:
            '',
        })
      );

    setCashiePeople(
      clearedPeople
    );

    setPaymentsMade(
      0
    );

    setSelectedReceipt(
      null
    );

    setSelectedStatement(
      null
    );

    try {
      await clearPaymentHistory();
    } catch (
      error
    ) {
      console.warn(
        'History storage clear failed:',
        error
      );
    }

    Alert.alert(
      'History Cleared',
      'Local payment history has been cleared. Your Cashie People and wallet remain in place.'
    );
  }

  async function factoryReset() {
    try {
      await factoryResetStorage();
    } catch (
      error
    ) {
      console.warn(
        'Factory reset storage failed:',
        error
      );
    }

    setWallet(
      INITIAL_WALLET
    );

    setWalletName(
      INITIAL_WALLET_NAME
    );

    setCashiePeople(
      []
    );

    setPaymentsMade(
      INITIAL_PAYMENTS_MADE
    );

    setMemberSince(
      INITIAL_MEMBER_SINCE
    );

    setDisplayCurrency(
      INITIAL_DISPLAY_CURRENCY
    );

        setBatteryMode(
      DEFAULT_BATTERY_MODE
    );

    setBatteryLowThresholdPercent(
      DEFAULT_BATTERY_LOW_PERCENT
    );

    setRecipient(
      null
    );

    setPaymentAmount(
      0
    );

    setRequestedAmount(
      0
    );

    setWalletActivated(
      false
    );

    setWalletCoverVisible(
      true
    );

    clearSelectedViews();

    setCurrentScreen(
      'home'
    );

    Alert.alert(
      'Cashie Reset',
      'Cashie has been returned to its original demo state.'
    );
  }

  if (
    walletCoverVisible
  ) {
    return (
      <WalletCoverScreen
        walletAddress={
          TEST_ADDRESS
        }
        activated={
          walletActivated
        }
        onOpen={
          openWallet
        }
      />
    );
  }

  if (
    currentScreen ===
    'update-battery'
  ) {
    return (
      <UpdateBatteryScreen
        batteryChargePercent={
          battery.chargePercent
        }
        batteryTopUpRequiredLocal={
          battery
            .batteryTopUpRequiredLocal
        }
        currencyCode={
          displayCurrency
        }
        currencySymbol={
          selectedCurrency
            .symbol
        }
        currencySymbolPosition={
          selectedCurrency
            .symbolPosition
        }
        currencyDecimalPlaces={
          selectedCurrency
            .decimalPlaces
        }
        onBack={
          openCashieDashie
        }
        onConfirm={
          confirmBatteryUpdate
        }
      />
    );
  }

    if (
    currentScreen ===
    'change-local-cash'
  ) {
    return (
      <ChangeLocalCashScreen
        currencies={
          Object.entries(
            CURRENCIES
          ).map(
            ([
              code,
              currency,
            ]) => ({
              ...currency,

              code:
                currency.code ||
                code,
            })
          )
        }
        selectedCurrencyCode={
          displayCurrency
        }
        onSelectCurrency={
          setDisplayCurrency
        }
        onBack={
          openSettings
        }
      />
    );
  }  

      if (
    currentScreen ===
    'cashie-settings'
  ) {
    return (
      <CashieSettings
        walletName={
          walletName
        }
        onWalletNameChange={
          value =>
            setWalletName(
              cleanWalletName(
                value
              )
            )
        }
        walletAddress={
          TEST_ADDRESS
        }
        hogesBalance={
          wallet.hogesBalance
        }
        solBalance={
          wallet.solBalance
        }
        batteryReserveAud={
          battery.reserveAud
        }
        batteryReminderAud={
          battery.lowThresholdLocal
        }
        localCurrencyName={
          selectedCurrency
            .name
        }
        localCurrencyCode={
          displayCurrency
        }
        localCurrencyFlag={
          selectedCurrency
            .flag
        }
        version="0.1.0"
        onChangeLocalCash={
          openChangeLocalCash
        }
        onCopyWalletAddress={
          copyWalletAddress
        }
        onTopUpBattery={
          openUpdateBattery
        }
        onEmptyWallet={
          emptyWallet
        }
        onStartFresh={
          factoryReset
        }
        onClearHistory={
          clearAllLocalHistory
        }
        onFactoryReset={
          factoryReset
        }
        onHome={
          returnHome
        }
        onPeople={
          openCashiePeople
        }
        onDashie={
          openCashieDashie
        }
        onSettings={
          openSettings
        }
      />
    );
  }

  if (
    currentScreen ===
    'cashie-dashie'
  ) {
    return (
      <CashieDashie
        batteryChargePercent={
          battery.chargePercent
        }
        batteryStatus={
          battery.status
        }
        estimatedPaymentsRemaining={
          battery
            .estimatedPaymentsRemaining
        }
                batteryReserveAud={
          battery.reserveLocal
        }
        batteryMode={
          batteryMode
        }
        batteryCapacityLocal={
          battery
            .batteryFullThresholdLocal
        }
        batteryLowThresholdLocal={
          battery
            .lowThresholdLocal
        }
        batteryTopUpRequiredLocal={
          battery
            .batteryTopUpRequiredLocal
        }
        activationAmountLocal={
          battery
            .activationAmountLocal
        }
        currencyCode={
          displayCurrency
        }
        currencySymbol={
          selectedCurrency
            .symbol
        }
        currencySymbolPosition={
          selectedCurrency
            .symbolPosition
        }
        currencyDecimalPlaces={
          selectedCurrency
            .decimalPlaces
        }

        paymentsMade={
          paymentsMade
        }
        moneySentAud={
          0
        }
        moneyReceivedAud={
          0
        }
        peoplePaid={
          peoplePaid
        }
        memberSince={
          memberSince
        }
        hogesBalance={
          wallet.hogesBalance
        }
        hogesBalanceAud={
          walletValue
            .hogesValueAud
        }
        solOperatingReserve={
          wallet.solBalance
        }
        solOperatingReserveAud={
          walletValue
            .solValueAud
        }
        hogesPerSol={
          priceSnapshot
            .hogesPerSol
        }
        hogesPerSolAud={
          priceSnapshot
            .hogesPriceAud
        }
        totalWalletValueAud={
          walletValue
            .totalValueAud
        }
        onHome={
          returnHome
        }
        onPeople={
          openCashiePeople
        }
        onDashboard={
          openCashieDashie
        }
        onSettings={
          openSettings
        }
        onBatteryModeChange={
          setBatteryMode
        }
        onTopUpBattery={
        openUpdateBattery
        }
      />
    );
  }

  if (
    currentScreen ===
    'cashie-people'
  ) {
    return (
      <CashiePeopleList
        people={
          cashiePeople
        }
        onSelectPerson={
          openPersonDetail
        }
        onHome={
          returnHome
        }
        onPay={
          beginPeoplePayment
        }
        onMakeFirstPayment={
          beginPeoplePayment
        }
        onDashie={
          openCashieDashie
        }
        onSettings={
          openSettings
        }
      />
    );
  }

  if (
    currentScreen ===
      'person-form' &&
    selectedPerson
  ) {
    return (
      <CashiePersonForm
        mode="edit"
        person={
          selectedPerson
        }
        onCancel={() =>
          setCurrentScreen(
            'person-detail'
          )
        }
        onSave={
          saveEditedPerson
        }
        onPasteAddress={
          async () =>
            TEST_ADDRESS
        }
        onScanAddress={
          async () =>
            TEST_ADDRESS
        }
      />
    );
  }

  if (
    currentScreen ===
      'person-detail' &&
    selectedPerson
  ) {
    return (
      <>
        <CashiePersonDetailScreen
          person={{
            ...selectedPerson,

            initials:
              selectedPerson
                .initials ||
              getInitials(
                selectedPerson
                  .name
              ),

            paymentsSent:
              Number(
                selectedPerson
                  .paymentsSent ||
                0
              ),

            paymentsReceived:
              Number(
                selectedPerson
                  .paymentsReceived ||
                0
              ),

            activity:
              selectedPerson
                .activity ||
              [],
          }}
          onBack={
            openCashiePeople
          }
          onPay={
            payCashiePerson
          }
          onEdit={
            openEditPerson
          }
          onDeleteHistory={
            requestDeleteHistory
          }
          onDeletePerson={
            deletePerson
          }
          onActivityPress={
            openActivityReceipt
          }
          onStatement={
            openPersonStatement
          }
        />

        <CashieDeleteHistoryModal
          visible={
            deleteHistoryVisible
          }
          personName={
            selectedPerson.name
          }
          onCancel={() =>
            setDeleteHistoryVisible(
              false
            )
          }
          onConfirm={
            confirmDeleteHistory
          }
        />
      </>
    );
  }

  if (
    currentScreen ===
      'payment-receipt' &&
    selectedReceipt
  ) {
    return (
      <SafeAreaView
        style={{
          flex:
            1,

          backgroundColor:
            SCREEN_BACKGROUND,
        }}
      >
        <View
          style={{
            flex:
              1,

            justifyContent:
              'center',

            paddingHorizontal:
              14,

            paddingVertical:
              24,
          }}
        >
          <CashiePaymentReceipt
            receipt={
              selectedReceipt
            }
            onDone={() =>
              setCurrentScreen(
                'person-detail'
              )
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  if (
    currentScreen ===
      'statement' &&
    selectedStatement
  ) {
    return (
      <SafeAreaView
        style={{
          flex:
            1,

          backgroundColor:
            SCREEN_BACKGROUND,
        }}
      >
        <View
          style={{
            flex:
              1,

            justifyContent:
              'center',

            paddingHorizontal:
              14,

            paddingVertical:
              24,
          }}
        >
          <CashieStatement
            statement={
              selectedStatement
            }
            onDone={() =>
              setCurrentScreen(
                'person-detail'
              )
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  if (
    currentScreen ===
    'tap-to-pay'
  ) {
    return (
      <TapToPayScreen
        status={
          tapStatus
        }
        recipientName={
          tappedRecipient
            ?.name ||
          ''
        }
        recipientAddress={
          tappedRecipient
            ?.address ||
          ''
        }
        onCancel={
          cancelTapToPay
        }
        onContinue={
          continueTappedPayment
        }
      />
    );
  }

  if (
    currentScreen ===
    'payment-request-incomplete'
  ) {
    return (
      <PaymentRequestIncompleteScreen
        walletName={
          recipient?.name ||
          'This person'
        }
        onScanOrTapAgain={() => {
          clearPayment();

          setCurrentScreen(
            'who-to-pay'
          );
        }}
        onCancel={
          returnHome
        }
      />
    );
  }

  if (
    currentScreen ===
    'who-to-pay'
  ) {
    return (
      <WhoToPayScreen
        cashiePeople={
          cashiePeople
        }
        onScan={
          scanCashieQr
        }
        onTap={
          beginTapToPay
        }
        onSelectPerson={
  openPersonDetail
        }
        onPasteAddress={
          address => {
            const walletAddress =
              normaliseWalletAddress(
                address
              );

            if (
              !walletAddress
            ) {
              return;
            }

            chooseRecipient({
              name:
                '',

              address:
                walletAddress,

              requiresName:
                true,

              isSavedContact:
                false,
            });
          }
        }
        onBack={
          returnHome
        }
      />
    );
  }

  if (
    currentScreen ===
    'review-payment'
  ) {
    return (
      <ReviewPaymentScreen
        recipient={
          recipient?.name ||
          'Wallet address'
        }
        walletAddress={
          recipient?.address ||
          ''
        }
        amount={
          paymentAmount
        }
        currencySymbol="A$"
        onBack={() =>
          setCurrentScreen(
            'who-to-pay'
          )
        }
        onPay={
          completePayment
        }
      />
    );
  }

  if (
    currentScreen ===
    'payment-complete'
  ) {
    const alreadyKnown =
      recipientIsKnown();

    return (
      <PaymentCompleteScreen
        recipient={
          recipient?.name ||
          ''
        }
        walletAddress={
          recipient?.address ||
          ''
        }
        amount={
          paymentAmount
        }
        currencySymbol="A$"
        txId=""
        isCashiePerson={
          alreadyKnown
        }
        requiresName={
          !alreadyKnown
        }
        suggestedName={
          recipient?.name ||
          ''
        }
        onRemember={
          saveNewCashiePerson
        }
        onDone={
          returnHome
        }
      />
    );
  }

  return (
    <HomeScreen
      wallet={
        wallet
      }
      walletName={
        walletName
      }
            hogesAudPrice={
        priceSnapshot
          .hogesPriceDisplay ??
        priceSnapshot
          .hogesPriceAud
      }
            currencyCode={
        displayCurrency
      }
      currencySymbol={
        selectedCurrency
          .symbol
      }
      currencyFlag={
        selectedCurrency
          .flag
      }
      selectedCurrency={
        selectedCurrency
      }
      requestedAmount={
        requestedAmount
      }
      batteryStatus={
        battery.status
      }
      batteryChargePercent={
        battery.chargePercent
      }
      estimatedPaymentsRemaining={
        battery
          .estimatedPaymentsRemaining
      }
      estimatedRechargeCostAud={
        battery.topUpAud
      }
      paymentsMade={
        paymentsMade
      }
      memberSince={
        memberSince
      }
      onPayAmount={
        beginPayment
      }
      onReceiveAmount={
        createReceiveRequest
      }
      onOpenMerchant={
        openTapOrScan
      }
      onMerchant={
        openTapOrScan
      }
      onOpenPeople={
        openCashiePeople
      }
      onPeople={
        openCashiePeople
      }
      onOpenDashie={
        openCashieDashie
      }
      onSettings={
        openSettings
      }
    />
  );
}

export {
  HOGES_MINT_ADDRESS,
};