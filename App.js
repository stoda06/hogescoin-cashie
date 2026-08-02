import {
  useEffect,
  useMemo,
  useRef,
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

import CashiePeopleList from './components/CashiePeopleList.js';
import CashiePersonForm from './components/CashiePersonForm.js';
import CashiePaymentReceipt from './components/CashiePaymentReceipt.js';
import CashieStatement from './components/CashieStatement.js';
import CashieDeleteHistoryModal from './components/CashieDeleteHistoryModal.js';
import CashieDashie from './components/CashieDashie.js';
import CashieSettings from './components/CashieSettings.js';

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

import validateAddress from './utils/validateAddress.js';

const HOGES_MINT_ADDRESS =
  '2GU6q72m9MnYRSsUszUwipLUBMpXm72gijL2VhQAHnyz';

const SCREEN_BACKGROUND =
  '#F8F3E8';

const INITIAL_WALLET = {
  solBalance: 1.25,
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

const BATTERY_LOW_THRESHOLD_AUD =
  2;

const BATTERY_TOP_UP_AUD =
  2;

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
  };
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
    batteryReminderAud,
    setBatteryReminderAud,
  ] = useState(
    BATTERY_LOW_THRESHOLD_AUD
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

  const paymentInFlightRef =
    useRef(
      false
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

          solPriceAud:
            priceSnapshot
              .solPriceAud,

          lowThresholdAud:
            batteryReminderAud,

          topUpAud:
            BATTERY_TOP_UP_AUD,
        }),
      [
        wallet.solBalance,
        priceSnapshot
          .solPriceAud,
        batteryReminderAud,
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

      /*
       * Load stored state and prices independently:
       * a price failure must never cost us the stored
       * state, and a failed load must never let the
       * save effect overwrite it with defaults.
       */
      async function initialiseApp() {
        let storedState =
          null;

        let stateLoaded =
          false;

        try {
          storedState =
            await loadAppState();

          stateLoaded =
            true;

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
            typeof storedState
              ?.walletName ===
            'string'
          ) {
            setWalletName(
              cleanWalletName(
                storedState
                  .walletName
              )
            );
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
            Number.isFinite(
              Number(
                storedState
                  ?.batteryReminderAud
              )
            )
          ) {
            setBatteryReminderAud(
              Number(
                storedState
                  .batteryReminderAud
              )
            );
          }

        } catch (
          error
        ) {
          console.warn(
            'Cashie state load failed:',
            error
          );
        }

        if (
          active &&
          stateLoaded
        ) {
          setStorageReady(
            true
          );
        }

        try {
          const latestPrices =
            await getPriceSnapshot({
              displayCurrency:
                INITIAL_DISPLAY_CURRENCY,

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
            'Cashie price refresh failed:',
            error
          );
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

        batteryReminderAud,
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
      batteryReminderAud,
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
    paymentInFlightRef.current =
      false;

    setRecipient(
      null
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

  function openSettings() {
    clearPayment();
    clearSelectedViews();

    setCurrentScreen(
      'cashie-settings'
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

    paymentInFlightRef.current =
      false;

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
    selectedRecipient
  ) {
    setRecipient(
      selectedRecipient
    );

    setCurrentScreen(
      'review-payment'
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

    chooseRecipient(
      scannedRecipient
    );
  }

  function scanCashieQr() {
    /*
     * Snack demo scanner.
     *
     * Replace the payload below with the value returned
     * by the device camera scanner when that is connected.
     */

    handleScannedQrValue(
      JSON.stringify({
        type:
          'cashie-wallet',

        version:
          1,

        walletName:
          'Scanned Merchant',

        walletAddress:
          TEST_ADDRESS,
      })
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
      paymentInFlightRef
        .current
    ) {
      return;
    }

    paymentInFlightRef.current =
      true;

    const hogesPriceAud =
      Number(
        priceSnapshot
          ?.hogesPriceAud ||
        0
      );

    const hogesSpent =
      hogesPriceAud >
      0
        ? paymentAmount /
          hogesPriceAud
        : 0;

    setWallet(
      currentWallet => ({
        ...currentWallet,

        hogesBalance:
          Math.max(
            Number(
              currentWallet
                ?.hogesBalance ||
              0
            ) -
              hogesSpent,
            0
          ),
      })
    );

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

    // Validate here, before the state updater runs:
    // addCashiePerson throws on a bad address, and a
    // throw inside setCashiePeople crashes the app.
    if (
      !validateAddress(
        walletAddress
      )
    ) {
      throw new Error(
        'That does not look like a Solana wallet address.'
      );
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

    if (
      !validateAddress(
        walletAddress
      )
    ) {
      Alert.alert(
        'Invalid wallet address',
        'That does not look like a Solana wallet address.'
      );

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

  function topUpBattery(
    amountAud =
      BATTERY_TOP_UP_AUD
  ) {
    const numericAmountAud =
      Number(
        amountAud ||
        BATTERY_TOP_UP_AUD
      );

    if (
      !Number.isFinite(
        numericAmountAud
      ) ||
      numericAmountAud <=
        0
    ) {
      return;
    }

    const solPriceAud =
      Number(
        priceSnapshot
          ?.solPriceAud ||
        DEFAULT_SOL_PRICE_AUD
      );

    if (
      !Number.isFinite(
        solPriceAud
      ) ||
      solPriceAud <=
        0
    ) {
      Alert.alert(
        'Battery Update Unavailable',
        'Cashie could not calculate the SOL amount required.'
      );

      return;
    }

    const solToAdd =
      numericAmountAud /
      solPriceAud;

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
      `${formatAudAmount(
        numericAmountAud
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

    setBatteryReminderAud(
      BATTERY_LOW_THRESHOLD_AUD
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
        batteryReserveAud={
          battery.reserveAud
        }
        batteryReminderAud={
          batteryReminderAud
        }
        displayCurrency="Australian Dollar"
        currencyCode={
          displayCurrency
        }
        appVersion="0.1.0"
        onCopyWalletAddress={
          copyWalletAddress
        }
        onTopUpBattery={() =>
          topUpBattery(
            BATTERY_TOP_UP_AUD
          )
        }
        onEmptyWallet={
          emptyWallet
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
        estimatedPaymentsRemaining={
          battery
            .estimatedPaymentsRemaining
        }
        estimatedRechargeCostAud={
          battery.topUpAud
        }
        batteryReserveAud={
          battery.reserveAud
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
        solPriceAud={
          priceSnapshot
            .solPriceAud
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
        onTopUpBattery={
          topUpBattery
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
        onSelectPerson={
          person => {
            chooseRecipient({
              name:
                person.name,

              address:
                person.walletAddress,

              requiresName:
                false,

              isSavedContact:
                true,

              personId:
                person.id,
            });
          }
        }
        onPasteAddress={
          address => {
            const walletAddress =
              normaliseWalletAddress(
                address
              );

            if (
              !validateAddress(
                walletAddress
              )
            ) {
              Alert.alert(
                'Invalid wallet address',
                'That does not look like a Solana wallet address.'
              );

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
          .hogesPriceAud
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