import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX =
  'cashie';

const STORAGE_VERSION =
  1;

/*
 * Session cache in front of AsyncStorage. Every write
 * lands here first, so reads stay correct for the rest
 * of the session even if the device write fails.
 */
const memoryStorage =
  new Map();

export const STORAGE_KEYS = {
  appState:
    'app-state',

  wallet:
    'wallet',

  walletName:
    'wallet-name',

  walletActivated:
    'wallet-activated',

  cashiePeople:
    'cashie-people',

  activities:
    'activities',

  paymentsMade:
    'payments-made',

  memberSince:
    'member-since',

  selectedCurrency:
    'selected-currency',

  batteryReminderAud:
    'battery-reminder-aud',

  settings:
    'settings',
};

export const DEFAULT_SETTINGS = {
  selectedCurrency:
    'AUD',

  batteryReminderAud:
    2,

  walletActivated:
    false,

  memberSince:
    null,

  walletName:
    '',
};

function getFullKey(
  key
) {
  return `${STORAGE_PREFIX}:v${STORAGE_VERSION}:${key}`;
}

/*
 * Number(garbage) is NaN and Math.max(0, NaN) is NaN,
 * which JSON.stringify turns into null. Guard every
 * numeric field with Number.isFinite instead.
 */
function toNonNegativeNumber(
  value,
  fallback = 0
) {
  const numericValue =
    Number(
      value
    );

  return Number.isFinite(
    numericValue
  )
    ? Math.max(
        0,
        numericValue
      )
    : fallback;
}

function serialise(
  value
) {
  return JSON.stringify(
    value
  );
}

function deserialise(
  value,
  fallback = null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  try {
    return JSON.parse(
      value
    );
  } catch {
    return fallback;
  }
}

async function readRawValue(
  key
) {
  const fullKey =
    getFullKey(
      key
    );

  if (
    memoryStorage.has(
      fullKey
    )
  ) {
    return memoryStorage.get(
      fullKey
    );
  }

  try {
    return await AsyncStorage.getItem(
      fullKey
    );
  } catch {
    return null;
  }
}

async function writeRawValue(
  key,
  value
) {
  const fullKey =
    getFullKey(
      key
    );

  memoryStorage.set(
    fullKey,
    value
  );

  try {
    await AsyncStorage.setItem(
      fullKey,
      value
    );
  } catch {
    // The session cache above still serves reads.
  }

  return true;
}

async function removeRawValue(
  key
) {
  const fullKey =
    getFullKey(
      key
    );

  memoryStorage.delete(
    fullKey
  );

  try {
    await AsyncStorage.removeItem(
      fullKey
    );
  } catch {
    // Nothing more we can do here.
  }

  return true;
}

export async function getStoredValue(
  key,
  fallback = null
) {
  if (
    !key
  ) {
    return fallback;
  }

  const rawValue =
    await readRawValue(
      key
    );

  return deserialise(
    rawValue,
    fallback
  );
}

export async function setStoredValue(
  key,
  value
) {
  if (
    !key
  ) {
    throw new Error(
      'A storage key is required.'
    );
  }

  const serialisedValue =
    serialise(
      value
    );

  await writeRawValue(
    key,
    serialisedValue
  );

  return value;
}

export async function removeStoredValue(
  key
) {
  if (
    !key
  ) {
    return false;
  }

  return removeRawValue(
    key
  );
}

export async function saveWallet(
  wallet = {}
) {
  const safeWallet = {
    solBalance:
      toNonNegativeNumber(
        wallet.solBalance,
        0
      ),

    hogesBalance:
      toNonNegativeNumber(
        wallet.hogesBalance,
        0
      ),

    publicAddress:
      String(
        wallet.publicAddress ||
          wallet.walletAddress ||
          ''
      ),
  };

  return setStoredValue(
    STORAGE_KEYS.wallet,
    safeWallet
  );
}

export async function loadWallet(
  fallback = {
    solBalance:
      0,

    hogesBalance:
      0,

    publicAddress:
      '',
  }
) {
  const storedWallet =
    await getStoredValue(
      STORAGE_KEYS.wallet,
      fallback
    );

  return {
    ...fallback,
    ...storedWallet,

    solBalance:
      toNonNegativeNumber(
        storedWallet
          ?.solBalance,
        0
      ),

    hogesBalance:
      toNonNegativeNumber(
        storedWallet
          ?.hogesBalance,
        0
      ),

    publicAddress:
      String(
        storedWallet
          ?.publicAddress ||
          storedWallet
            ?.walletAddress ||
          ''
      ),
  };
}

export async function saveWalletName(
  walletName = ''
) {
  const safeWalletName =
    String(
      walletName ||
        ''
    )
      .trim()
      .slice(
        0,
        60
      );

  return setStoredValue(
    STORAGE_KEYS.walletName,
    safeWalletName
  );
}

export async function loadWalletName(
  fallback = ''
) {
  const storedWalletName =
    await getStoredValue(
      STORAGE_KEYS.walletName,
      fallback
    );

  return String(
    storedWalletName ||
      fallback ||
      ''
  )
    .trim()
    .slice(
      0,
      60
    );
}

export async function saveWalletActivated(
  walletActivated = false
) {
  return setStoredValue(
    STORAGE_KEYS.walletActivated,
    Boolean(
      walletActivated
    )
  );
}

export async function loadWalletActivated(
  fallback = false
) {
  const storedValue =
    await getStoredValue(
      STORAGE_KEYS.walletActivated,
      fallback
    );

  return Boolean(
    storedValue
  );
}

export async function saveCashiePeople(
  people = []
) {
  const safePeople =
    Array.isArray(
      people
    )
      ? people
      : [];

  return setStoredValue(
    STORAGE_KEYS.cashiePeople,
    safePeople
  );
}

export async function loadCashiePeople(
  fallback = []
) {
  const storedPeople =
    await getStoredValue(
      STORAGE_KEYS.cashiePeople,
      fallback
    );

  return Array.isArray(
    storedPeople
  )
    ? storedPeople
    : fallback;
}

export async function saveActivities(
  activities = []
) {
  const safeActivities =
    Array.isArray(
      activities
    )
      ? activities
      : [];

  return setStoredValue(
    STORAGE_KEYS.activities,
    safeActivities
  );
}

export async function loadActivities(
  fallback = []
) {
  const storedActivities =
    await getStoredValue(
      STORAGE_KEYS.activities,
      fallback
    );

  return Array.isArray(
    storedActivities
  )
    ? storedActivities
    : fallback;
}

export async function savePaymentsMade(
  paymentsMade = 0
) {
  const safePaymentsMade =
    toNonNegativeNumber(
      paymentsMade,
      0
    );

  return setStoredValue(
    STORAGE_KEYS.paymentsMade,
    safePaymentsMade
  );
}

export async function loadPaymentsMade(
  fallback = 0
) {
  const storedValue =
    await getStoredValue(
      STORAGE_KEYS.paymentsMade,
      fallback
    );

  const numericValue =
    Number(
      storedValue
    );

  return Number.isFinite(
    numericValue
  )
    ? Math.max(
        0,
        numericValue
      )
    : fallback;
}

export async function saveMemberSince(
  memberSince
) {
  const safeValue =
    memberSince
      ? String(
          memberSince
        )
      : null;

  return setStoredValue(
    STORAGE_KEYS.memberSince,
    safeValue
  );
}

export async function loadMemberSince(
  fallback = null
) {
  const storedValue =
    await getStoredValue(
      STORAGE_KEYS.memberSince,
      fallback
    );

  return storedValue
    ? String(
        storedValue
      )
    : fallback;
}

export async function saveSelectedCurrency(
  currency = 'AUD'
) {
  const safeCurrency =
    String(
      currency || 'AUD'
    )
      .trim()
      .toUpperCase();

  return setStoredValue(
    STORAGE_KEYS.selectedCurrency,
    safeCurrency
  );
}

export async function loadSelectedCurrency(
  fallback = 'AUD'
) {
  const storedValue =
    await getStoredValue(
      STORAGE_KEYS.selectedCurrency,
      fallback
    );

  return String(
    storedValue ||
      fallback
  )
    .trim()
    .toUpperCase();
}

export async function saveBatteryReminderAud(
  reminderAud = 2
) {
  const numericValue =
    Number(
      reminderAud
    );

  const safeValue =
    Number.isFinite(
      numericValue
    )
      ? Math.max(
          0,
          numericValue
        )
      : 2;

  return setStoredValue(
    STORAGE_KEYS.batteryReminderAud,
    safeValue
  );
}

export async function loadBatteryReminderAud(
  fallback = 2
) {
  const storedValue =
    await getStoredValue(
      STORAGE_KEYS.batteryReminderAud,
      fallback
    );

  const numericValue =
    Number(
      storedValue
    );

  return Number.isFinite(
    numericValue
  )
    ? Math.max(
        0,
        numericValue
      )
    : fallback;
}

export async function saveSettings(
  settings = {}
) {
  const existingSettings =
    await loadSettings();

  const updatedSettings = {
    ...existingSettings,
    ...settings,
  };

  await setStoredValue(
    STORAGE_KEYS.settings,
    updatedSettings
  );

  return updatedSettings;
}

export async function loadSettings(
  fallback =
    DEFAULT_SETTINGS
) {
  const storedSettings =
    await getStoredValue(
      STORAGE_KEYS.settings,
      fallback
    );

  return {
    ...DEFAULT_SETTINGS,
    ...fallback,
    ...(
      storedSettings ||
      {}
    ),
  };
}

export async function saveAppState(
  appState = {}
) {
  const safeAppState = {
    wallet:
      appState.wallet ||
      null,

    walletName:
      String(
        appState.walletName ||
          ''
      )
        .trim()
        .slice(
          0,
          60
        ),

    walletActivated:
      Boolean(
        appState.walletActivated
      ),

    cashiePeople:
      Array.isArray(
        appState.cashiePeople
      )
        ? appState.cashiePeople
        : [],

    activities:
      Array.isArray(
        appState.activities
      )
        ? appState.activities
        : [],

    paymentsMade:
      toNonNegativeNumber(
        appState.paymentsMade,
        0
      ),

    memberSince:
      appState.memberSince ||
      null,

    selectedCurrency:
      String(
        appState.selectedCurrency ||
          'AUD'
      )
        .trim()
        .toUpperCase(),

    batteryReminderAud:
      toNonNegativeNumber(
        appState.batteryReminderAud,
        0
      ),

    savedAt:
      new Date()
        .toISOString(),
  };

  await setStoredValue(
    STORAGE_KEYS.appState,
    safeAppState
  );

  return safeAppState;
}

export async function loadAppState(
  fallback = {}
) {
  const storedState =
    await getStoredValue(
      STORAGE_KEYS.appState,
      null
    );

  if (
    !storedState
  ) {
    return {
      ...fallback,
    };
  }

  /*
   * Sanitise every field the app consumes the same
   * way saveAppState validates on the way in, so a
   * corrupted stored blob can never leak malformed
   * values into the app state.
   */
  return {
    ...fallback,
    ...storedState,

    wallet:
      storedState?.wallet &&
      typeof storedState.wallet ===
        'object'
        ? storedState.wallet
        : fallback?.wallet ||
          null,

    walletName:
      String(
        storedState
          ?.walletName ||
          fallback
            ?.walletName ||
          ''
      )
        .trim()
        .slice(
          0,
          60
        ),

    walletActivated:
      Boolean(
        storedState
          ?.walletActivated ??
          fallback
            ?.walletActivated
      ),

    cashiePeople:
      Array.isArray(
        storedState
          ?.cashiePeople
      )
        ? storedState.cashiePeople
        : Array.isArray(
            fallback
              ?.cashiePeople
          )
          ? fallback.cashiePeople
          : [],

    activities:
      Array.isArray(
        storedState
          ?.activities
      )
        ? storedState.activities
        : Array.isArray(
            fallback
              ?.activities
          )
          ? fallback.activities
          : [],

    paymentsMade:
      toNonNegativeNumber(
        storedState
          ?.paymentsMade,
        toNonNegativeNumber(
          fallback
            ?.paymentsMade,
          0
        )
      ),

    memberSince:
      storedState
        ?.memberSince
        ? String(
            storedState.memberSince
          )
        : fallback
            ?.memberSince ||
          null,

    selectedCurrency:
      String(
        storedState
          ?.selectedCurrency ||
          fallback
            ?.selectedCurrency ||
          'AUD'
      )
        .trim()
        .toUpperCase(),

    batteryReminderAud:
      toNonNegativeNumber(
        storedState
          ?.batteryReminderAud,
        toNonNegativeNumber(
          fallback
            ?.batteryReminderAud,
          0
        )
      ),
  };
}

export async function clearPaymentHistory() {
  await Promise.all([
    removeStoredValue(
      STORAGE_KEYS.activities
    ),

    savePaymentsMade(
      0
    ),
  ]);

  return true;
}

export async function clearCashiePeople() {
  await saveCashiePeople(
    []
  );

  return true;
}

export async function clearWalletData() {
  await Promise.all([
    removeStoredValue(
      STORAGE_KEYS.wallet
    ),

    removeStoredValue(
      STORAGE_KEYS.walletName
    ),

    saveWalletActivated(
      false
    ),
  ]);

  return true;
}

export async function factoryResetStorage() {
  const keys =
    Object.values(
      STORAGE_KEYS
    );

  await Promise.all(
    keys.map(
      key =>
        removeStoredValue(
          key
        )
    )
  );

  return true;
}

export async function getStorageSnapshot() {
  const [
    wallet,
    walletName,
    walletActivated,
    cashiePeople,
    activities,
    paymentsMade,
    memberSince,
    selectedCurrency,
    batteryReminderAud,
    settings,
  ] =
    await Promise.all([
      loadWallet(),
      loadWalletName(),
      loadWalletActivated(),
      loadCashiePeople(),
      loadActivities(),
      loadPaymentsMade(),
      loadMemberSince(),
      loadSelectedCurrency(),
      loadBatteryReminderAud(),
      loadSettings(),
    ]);

  return {
    wallet,
    walletName,
    walletActivated,
    cashiePeople,
    activities,
    paymentsMade,
    memberSince,
    selectedCurrency,
    batteryReminderAud,
    settings,
  };
}