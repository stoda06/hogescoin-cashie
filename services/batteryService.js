const LAMPORTS_PER_SOL =
  1_000_000_000;

const DEFAULT_SOL_LOCAL_PRICE =
  200;

/*
 * Temporary v0.2 universal Battery threshold.
 *
 * This is the amount of SOL at which the
 * Cashie Battery is considered full.
 *
 * Later this will be calculated from:
 *
 * lowest-value highest-denomination coin
 * across all supported currencies.
 */
const DEFAULT_BATTERY_FULL_THRESHOLD_SOL =
  0.005;

const DEFAULT_LOW_BATTERY_PERCENT =
  20;

const DEFAULT_BATTERY_MODE =
  'auto';

const DEFAULT_FEE_LAMPORTS =
  5_000;

const VALID_BATTERY_MODES = [
  'auto',
  'remind',
];

function toSafeNumber(
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
    ? numericValue
    : fallback;
}

function toPositiveNumber(
  value,
  fallback = 0
) {
  return Math.max(
    0,
    toSafeNumber(
      value,
      fallback
    )
  );
}

export function clamp(
  value,
  minimum,
  maximum
) {
  const safeMinimum =
    toSafeNumber(
      minimum,
      0
    );

  const safeMaximum =
    Math.max(
      safeMinimum,
      toSafeNumber(
        maximum,
        safeMinimum
      )
    );

  const safeValue =
    toSafeNumber(
      value,
      safeMinimum
    );

  return Math.min(
    Math.max(
      safeValue,
      safeMinimum
    ),
    safeMaximum
  );
}

export function normaliseBatteryMode(
  mode
) {
  const cleanedMode =
    String(
      mode ||
      ''
    )
      .trim()
      .toLowerCase();

  return VALID_BATTERY_MODES.includes(
    cleanedMode
  )
    ? cleanedMode
    : DEFAULT_BATTERY_MODE;
}

export function getHighestCoinValue(
  currency
) {
  const coins =
    Array.isArray(
      currency?.coins
    )
      ? currency.coins
      : [];

  const validValues =
    coins
      .map(
        coin =>
          toPositiveNumber(
            coin?.value,
            0
          )
      )
      .filter(
        value =>
          value >
          0
      );

  if (
    validValues.length ===
    0
  ) {
    return 0;
  }

  return Math.max(
    ...validValues
  );
}

/*
 * BATTERY ACTIVATION
 *
 * The Battery is activated with one
 * highest-value coin from the selected
 * local currency.
 *
 * This activation amount may be greater
 * than the universal full threshold.
 *
 * Any amount above the full threshold is
 * retained as real SOL, but the gauge
 * remains capped at 100%.
 */

export function calculateBatteryActivation({
  currency,

  highestLocalCoin,

  solPriceLocal,

  /*
   * Temporary compatibility.
   */
  solPriceAud,
} = {}) {
  const resolvedHighestLocalCoin =
    toPositiveNumber(
      highestLocalCoin ??
        getHighestCoinValue(
          currency
        ),
      0
    );

  const safeSolPriceLocal =
    toPositiveNumber(
      solPriceLocal ??
        solPriceAud,
      DEFAULT_SOL_LOCAL_PRICE
    );

  const activationAmountSol =
    safeSolPriceLocal >
      0
      ? resolvedHighestLocalCoin /
        safeSolPriceLocal
      : 0;

  return {
    highestLocalCoin:
      resolvedHighestLocalCoin,

    activationAmountLocal:
      resolvedHighestLocalCoin,

    activationAmountSol,
  };
}

/*
 * ACTUAL RESERVE
 */

export function calculateReserveLocal({
  solBalance = 0,

  solPriceLocal,

  /*
   * Temporary compatibility.
   */
  solPriceAud,
} = {}) {
  const safeSolBalance =
    toPositiveNumber(
      solBalance,
      0
    );

  const safeSolPriceLocal =
    toPositiveNumber(
      solPriceLocal ??
        solPriceAud,
      DEFAULT_SOL_LOCAL_PRICE
    );

  return (
    safeSolBalance *
    safeSolPriceLocal
  );
}

/*
 * UNIVERSAL FULL THRESHOLD
 *
 * This is not determined by the currently
 * selected currency.
 *
 * It represents the lowest-value
 * highest-denomination coin across the
 * supported currency set, converted to SOL.
 */

export function resolveBatteryFullThresholdSol({
  batteryFullThresholdSol,

  /*
   * Temporary compatibility names.
   */
  batteryCapacitySol,
  targetReserveSol,
} = {}) {
  return toPositiveNumber(
    batteryFullThresholdSol ??
      batteryCapacitySol ??
      targetReserveSol,
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL
  );
}

export function calculateBatteryFullThresholdLocal({
  batteryFullThresholdSol =
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  solPriceLocal,

  /*
   * Temporary compatibility.
   */
  solPriceAud,
} = {}) {
  const safeBatteryFullThresholdSol =
    toPositiveNumber(
      batteryFullThresholdSol,
      DEFAULT_BATTERY_FULL_THRESHOLD_SOL
    );

  const safeSolPriceLocal =
    toPositiveNumber(
      solPriceLocal ??
        solPriceAud,
      DEFAULT_SOL_LOCAL_PRICE
    );

  return (
    safeBatteryFullThresholdSol *
    safeSolPriceLocal
  );
}

/*
 * DISPLAYED CHARGE
 *
 * The gauge measures actual SOL reserve
 * against the universal full threshold.
 *
 * A Battery can contain more SOL than the
 * threshold, but the gauge never displays
 * more than 100%.
 */

export function calculateChargePercent({
  solBalance,

  batteryFullThresholdSol,

  /*
   * Temporary compatibility.
   */
  reserveSol,
  batteryCapacitySol,
  targetReserveSol,
} = {}) {
  const safeReserveSol =
    toPositiveNumber(
      solBalance ??
        reserveSol,
      0
    );

  const safeBatteryFullThresholdSol =
    resolveBatteryFullThresholdSol({
      batteryFullThresholdSol,

      batteryCapacitySol,

      targetReserveSol,
    });

  if (
    safeBatteryFullThresholdSol <=
      0
  ) {
    return 0;
  }

  return Math.round(
    clamp(
      (
        safeReserveSol /
        safeBatteryFullThresholdSol
      ) *
        100,
      0,
      100
    )
  );
}

/*
 * LOW BATTERY THRESHOLD
 */

export function calculateLowThresholdSol({
  batteryFullThresholdSol =
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  lowThresholdPercent =
    DEFAULT_LOW_BATTERY_PERCENT,
} = {}) {
  const safeBatteryFullThresholdSol =
    toPositiveNumber(
      batteryFullThresholdSol,
      DEFAULT_BATTERY_FULL_THRESHOLD_SOL
    );

  const safeLowThresholdPercent =
    clamp(
      lowThresholdPercent,
      0,
      100
    );

  return (
    safeBatteryFullThresholdSol *
    safeLowThresholdPercent /
    100
  );
}

export function calculateLowThresholdLocal({
  batteryFullThresholdSol =
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  lowThresholdPercent =
    DEFAULT_LOW_BATTERY_PERCENT,

  solPriceLocal,

  /*
   * Temporary compatibility.
   */
  solPriceAud,
  lowThresholdAud,
  reminderAud,
} = {}) {
  const explicitLegacyThreshold =
    lowThresholdAud ??
    reminderAud;

  if (
    explicitLegacyThreshold !==
      undefined &&
    explicitLegacyThreshold !==
      null
  ) {
    return toPositiveNumber(
      explicitLegacyThreshold,
      0
    );
  }

  const lowThresholdSol =
    calculateLowThresholdSol({
      batteryFullThresholdSol,

      lowThresholdPercent,
    });

  const safeSolPriceLocal =
    toPositiveNumber(
      solPriceLocal ??
        solPriceAud,
      DEFAULT_SOL_LOCAL_PRICE
    );

  return (
    lowThresholdSol *
    safeSolPriceLocal
  );
}

export function getBatteryStatus({
  solBalance = 0,

  lowThresholdSol = 0,

  /*
   * Temporary compatibility.
   */
  reserveSol,
  reserveLocal,
  lowThresholdLocal,
  reserveAud,
  lowThresholdAud,
} = {}) {
  const safeSolBalance =
    toPositiveNumber(
      solBalance ??
        reserveSol,
      0
    );

  if (
    safeSolBalance >
      0
  ) {
    const safeLowThresholdSol =
      toPositiveNumber(
        lowThresholdSol,
        0
      );

    if (
      safeSolBalance <=
        safeLowThresholdSol
    ) {
      return 'Low';
    }

    return 'Ready';
  }

  const safeReserveLocal =
    toPositiveNumber(
      reserveLocal ??
        reserveAud,
      0
    );

  if (
    safeReserveLocal <=
      0
  ) {
    return 'Empty';
  }

  const safeLowThresholdLocal =
    toPositiveNumber(
      lowThresholdLocal ??
        lowThresholdAud,
      0
    );

  if (
    safeReserveLocal <=
      safeLowThresholdLocal
  ) {
    return 'Low';
  }

  return 'Ready';
}

export function isBatteryLow({
  solBalance = 0,

  lowThresholdSol = 0,

  /*
   * Temporary compatibility.
   */
  reserveSol,
  reserveLocal,
  lowThresholdLocal,
  reserveAud,
  lowThresholdAud,
} = {}) {
  const status =
    getBatteryStatus({
      solBalance,

      lowThresholdSol,

      reserveSol,

      reserveLocal,

      lowThresholdLocal,

      reserveAud,

      lowThresholdAud,
    });

  return (
    status ===
      'Low' ||
    status ===
      'Empty'
  );
}

/*
 * NORMAL BATTERY UPDATE
 *
 * Auto, Remind Me and manual Update Battery
 * restore only to the universal full
 * threshold.
 *
 * They do not repeat the original local
 * activation amount.
 */

export function calculateBatteryTopUp({
  solBalance = 0,

  batteryFullThresholdSol =
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  solPriceLocal,

  /*
   * Temporary compatibility.
   */
  solPriceAud,
} = {}) {
  const safeSolBalance =
    toPositiveNumber(
      solBalance,
      0
    );

  const safeBatteryFullThresholdSol =
    resolveBatteryFullThresholdSol({
      batteryFullThresholdSol,
    });

  const safeSolPriceLocal =
    toPositiveNumber(
      solPriceLocal ??
        solPriceAud,
      DEFAULT_SOL_LOCAL_PRICE
    );

  const batteryTopUpRequiredSol =
    Math.max(
      0,
      safeBatteryFullThresholdSol -
        safeSolBalance
    );

  return {
    batteryTopUpRequiredSol,

    batteryTopUpRequiredLocal:
      batteryTopUpRequiredSol *
      safeSolPriceLocal,

    willOverfill:
      false,

    alreadyFull:
      batteryTopUpRequiredSol <=
      0,
  };
}

export function calculateBatteryTopUpRequiredSol({
  solBalance,

  batteryFullThresholdSol,

  /*
   * Temporary compatibility inputs.
   */
  currentReserveSol,
  batteryCapacitySol,
  targetReserveSol,
  batteryTopUpRequiredLocal,
  topUpRequiredLocal,
  amountLocal,
  amountAud,
  solPriceLocal,
  solPriceAud,
} = {}) {
  if (
    solBalance !==
      undefined ||
    currentReserveSol !==
      undefined
  ) {
    return calculateBatteryTopUp({
      solBalance:
        solBalance ??
        currentReserveSol,

      batteryFullThresholdSol:
        batteryFullThresholdSol ??
        batteryCapacitySol ??
        targetReserveSol,

      solPriceLocal:
        solPriceLocal ??
        solPriceAud,
    }).batteryTopUpRequiredSol;
  }

  const safeTopUpLocal =
    toPositiveNumber(
      batteryTopUpRequiredLocal ??
        topUpRequiredLocal ??
        amountLocal ??
        amountAud,
      0
    );

  const safeSolPriceLocal =
    toPositiveNumber(
      solPriceLocal ??
        solPriceAud,
      DEFAULT_SOL_LOCAL_PRICE
    );

  if (
    safeSolPriceLocal <=
      0
  ) {
    return 0;
  }

  return (
    safeTopUpLocal /
    safeSolPriceLocal
  );
}

export function calculateBatteryTopUpRequiredLocal({
  solBalance,

  batteryFullThresholdSol,

  solPriceLocal,

  /*
   * Temporary compatibility inputs.
   */
  currentReserveLocal,
  batteryCapacityLocal,
  targetReserveLocal,
  currentReserveAud,
  targetReserveAud,
  solPriceAud,
} = {}) {
  if (
    solBalance !==
      undefined
  ) {
    return calculateBatteryTopUp({
      solBalance,

      batteryFullThresholdSol,

      solPriceLocal:
        solPriceLocal ??
        solPriceAud,
    }).batteryTopUpRequiredLocal;
  }

  const safeCurrentReserveLocal =
    toPositiveNumber(
      currentReserveLocal ??
        currentReserveAud,
      0
    );

  const safeTargetReserveLocal =
    toPositiveNumber(
      batteryCapacityLocal ??
        targetReserveLocal ??
        targetReserveAud,
      0
    );

  return Math.max(
    0,
    safeTargetReserveLocal -
      safeCurrentReserveLocal
  );
}

/*
 * PAYMENT ESTIMATE
 */

export function estimatePaymentsRemaining({
  solBalance = 0,

  averageFeeLamports =
    DEFAULT_FEE_LAMPORTS,

  /*
   * Temporary compatibility inputs.
   */
  reserveLocal,
  paymentsPerLocal,
  reserveAud,
  paymentsPerAud,
} = {}) {
  const safeSolBalance =
    toPositiveNumber(
      solBalance,
      0
    );

  const safeAverageFeeLamports =
    toPositiveNumber(
      averageFeeLamports,
      DEFAULT_FEE_LAMPORTS
    );

  if (
    safeSolBalance >
      0 &&
    safeAverageFeeLamports >
      0
  ) {
    const availableLamports =
      safeSolBalance *
      LAMPORTS_PER_SOL;

    return Math.max(
      0,
      Math.floor(
        availableLamports /
        safeAverageFeeLamports
      )
    );
  }

  const safeReserveLocal =
    toPositiveNumber(
      reserveLocal ??
        reserveAud,
      0
    );

  const safePaymentsPerLocal =
    toPositiveNumber(
      paymentsPerLocal ??
        paymentsPerAud,
      0
    );

  return Math.max(
    0,
    Math.round(
      safeReserveLocal *
      safePaymentsPerLocal
    )
  );
}

/*
 * INCOMING PAYMENT DECISION
 */

export function getIncomingBatteryAction({
  batterySnapshot,

  incomingAmountLocal = 0,

  incomingAmountSol,

  batteryMode,
} = {}) {
  const snapshot =
    batterySnapshot ||
    {};

  const mode =
    normaliseBatteryMode(
      batteryMode ??
      snapshot.batteryMode
    );

  const safeIncomingAmountLocal =
    toPositiveNumber(
      incomingAmountLocal,
      0
    );

  const safeIncomingAmountSol =
    incomingAmountSol ===
      undefined
      ? null
      : toPositiveNumber(
          incomingAmountSol,
          0
        );

  const batteryTopUpRequiredSol =
    toPositiveNumber(
      snapshot
        .batteryTopUpRequiredSol ??
      snapshot
        .topUpRequiredSol,
      0
    );

  const batteryTopUpRequiredLocal =
    toPositiveNumber(
      snapshot
        .batteryTopUpRequiredLocal ??
      snapshot
        .topUpRequiredLocal ??
      snapshot
        .topUpRequiredAud,
      0
    );

  if (
    !snapshot.isLow ||
    batteryTopUpRequiredSol <=
      0
  ) {
    return {
      action:
        'none',

      batteryMode:
        mode,

      incomingAmountLocal:
        safeIncomingAmountLocal,

      incomingAmountSol:
        safeIncomingAmountSol,

      batteryUpdateLocal:
        0,

      batteryUpdateSol:
        0,

      remainingIncomingLocal:
        safeIncomingAmountLocal,

      remainingIncomingSol:
        safeIncomingAmountSol,

      willReachFull:
        batteryTopUpRequiredSol <=
        0,

      /*
       * Compatibility aliases.
       */
      willReachCapacity:
        batteryTopUpRequiredSol <=
        0,

      willReachTarget:
        batteryTopUpRequiredSol <=
        0,
    };
  }

  const batteryUpdateLocal =
    Math.min(
      safeIncomingAmountLocal,
      batteryTopUpRequiredLocal
    );

  const batteryUpdateSol =
    safeIncomingAmountSol ===
      null
      ? batteryTopUpRequiredSol
      : Math.min(
          safeIncomingAmountSol,
          batteryTopUpRequiredSol
        );

  const remainingIncomingLocal =
    Math.max(
      0,
      safeIncomingAmountLocal -
        batteryUpdateLocal
    );

  const remainingIncomingSol =
    safeIncomingAmountSol ===
      null
      ? null
      : Math.max(
          0,
          safeIncomingAmountSol -
            batteryUpdateSol
        );

  const willReachFull =
    safeIncomingAmountSol ===
      null
      ? batteryUpdateLocal >=
        batteryTopUpRequiredLocal
      : batteryUpdateSol >=
        batteryTopUpRequiredSol;

  return {
    action:
      mode ===
      'auto'
        ? 'auto-update'
        : 'remind',

    batteryMode:
      mode,

    incomingAmountLocal:
      safeIncomingAmountLocal,

    incomingAmountSol:
      safeIncomingAmountSol,

    batteryUpdateLocal,

    batteryUpdateSol,

    remainingIncomingLocal,

    remainingIncomingSol,

    batteryTopUpRequiredLocal,

    batteryTopUpRequiredSol,

    willReachFull,

    /*
     * Compatibility aliases.
     */
    topUpRequiredLocal:
      batteryTopUpRequiredLocal,

    topUpRequiredSol:
      batteryTopUpRequiredSol,

    willReachCapacity:
      willReachFull,

    willReachTarget:
      willReachFull,
  };
}

export function calculateIncomingBatteryAllocation({
  incomingSol = 0,

  currentReserveSol = 0,

  batteryFullThresholdSol =
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  batteryIsLow =
    true,

  /*
   * Temporary compatibility.
   */
  batteryCapacitySol,
  targetReserveSol,
} = {}) {
  const safeIncomingSol =
    toPositiveNumber(
      incomingSol,
      0
    );

  const safeCurrentReserveSol =
    toPositiveNumber(
      currentReserveSol,
      0
    );

  const safeBatteryFullThresholdSol =
    resolveBatteryFullThresholdSol({
      batteryFullThresholdSol,

      batteryCapacitySol,

      targetReserveSol,
    });

  const batteryTopUpRequiredSol =
    batteryIsLow
      ? Math.max(
          0,
          safeBatteryFullThresholdSol -
            safeCurrentReserveSol
        )
      : 0;

  const reserveSol =
    Math.min(
      safeIncomingSol,
      batteryTopUpRequiredSol
    );

  const excessSol =
    Math.max(
      0,
      safeIncomingSol -
        reserveSol
    );

  const resultingReserveSol =
    safeCurrentReserveSol +
    reserveSol;

  const willReachFull =
    reserveSol >=
    batteryTopUpRequiredSol;

  return {
    incomingSol:
      safeIncomingSol,

    currentReserveSol:
      safeCurrentReserveSol,

    batteryFullThresholdSol:
      safeBatteryFullThresholdSol,

    batteryTopUpRequiredSol,

    reserveSol,

    excessSol,

    resultingReserveSol,

    willReachFull,

    /*
     * Compatibility aliases.
     */
    batteryCapacitySol:
      safeBatteryFullThresholdSol,

    targetReserveSol:
      safeBatteryFullThresholdSol,

    topUpRequiredSol:
      batteryTopUpRequiredSol,

    willReachCapacity:
      willReachFull,

    willReachTarget:
      willReachFull,
  };
}

/*
 * BATTERY SNAPSHOT
 */

export function getBatterySnapshot({
  solBalance = 0,

  solPriceLocal,

  currency,

  highestLocalCoin,

  batteryFullThresholdSol =
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  lowThresholdPercent =
    DEFAULT_LOW_BATTERY_PERCENT,

  batteryMode =
    DEFAULT_BATTERY_MODE,

  averageFeeLamports =
    DEFAULT_FEE_LAMPORTS,

  /*
   * Temporary compatibility inputs.
   */
  solPriceAud,
  batteryCapacitySol,
  targetReserveSol,
  lowThresholdAud,
  paymentsPerAud,
} = {}) {
  const safeSolBalance =
    toPositiveNumber(
      solBalance,
      0
    );

  const safeSolPriceLocal =
    toPositiveNumber(
      solPriceLocal ??
        solPriceAud,
      DEFAULT_SOL_LOCAL_PRICE
    );

  const resolvedBatteryFullThresholdSol =
    resolveBatteryFullThresholdSol({
      batteryFullThresholdSol,

      batteryCapacitySol,

      targetReserveSol,
    });

  const activation =
    calculateBatteryActivation({
      currency,

      highestLocalCoin,

      solPriceLocal:
        safeSolPriceLocal,
    });

  const reserveLocal =
    calculateReserveLocal({
      solBalance:
        safeSolBalance,

      solPriceLocal:
        safeSolPriceLocal,
    });

  const batteryFullThresholdLocal =
    calculateBatteryFullThresholdLocal({
      batteryFullThresholdSol:
        resolvedBatteryFullThresholdSol,

      solPriceLocal:
        safeSolPriceLocal,
    });

  const lowThresholdSol =
    calculateLowThresholdSol({
      batteryFullThresholdSol:
        resolvedBatteryFullThresholdSol,

      lowThresholdPercent,
    });

  const lowThresholdLocal =
    lowThresholdAud !==
      undefined &&
    lowThresholdAud !==
      null
      ? toPositiveNumber(
          lowThresholdAud,
          0
        )
      : lowThresholdSol *
        safeSolPriceLocal;

  const chargePercent =
    calculateChargePercent({
      solBalance:
        safeSolBalance,

      batteryFullThresholdSol:
        resolvedBatteryFullThresholdSol,
    });

  const status =
    getBatteryStatus({
      solBalance:
        safeSolBalance,

      lowThresholdSol,
    });

  const isLow =
    isBatteryLow({
      solBalance:
        safeSolBalance,

      lowThresholdSol,
    });

  const topUp =
    calculateBatteryTopUp({
      solBalance:
        safeSolBalance,

      batteryFullThresholdSol:
        resolvedBatteryFullThresholdSol,

      solPriceLocal:
        safeSolPriceLocal,
    });

  const estimatedPaymentsRemaining =
    estimatePaymentsRemaining({
      solBalance:
        safeSolBalance,

      averageFeeLamports,

      paymentsPerAud,
    });

  const resolvedBatteryMode =
    normaliseBatteryMode(
      batteryMode
    );

  const isOverfilled =
    safeSolBalance >
    resolvedBatteryFullThresholdSol;

  const overfillSol =
    Math.max(
      0,
      safeSolBalance -
        resolvedBatteryFullThresholdSol
    );

  const overfillLocal =
    overfillSol *
    safeSolPriceLocal;

  return {
    /*
     * Actual reserve.
     */
    reserveSol:
      safeSolBalance,

    solBalance:
      safeSolBalance,

    reserveLocal,

    solPriceLocal:
      safeSolPriceLocal,

    /*
     * Universal definition of Full.
     */
    batteryFullThresholdSol:
      resolvedBatteryFullThresholdSol,

    batteryFullThresholdLocal,

    /*
     * First activation amount.
     */
    highestLocalCoin:
      activation
        .highestLocalCoin,

    activationAmountLocal:
      activation
        .activationAmountLocal,

    activationAmountSol:
      activation
        .activationAmountSol,

    /*
     * Gauge and status.
     */
    chargePercent,

    status,

    isLow,

    lowThresholdPercent:
      clamp(
        lowThresholdPercent,
        0,
        100
      ),

    lowThresholdSol,

    lowThresholdLocal,

    /*
     * Overfill is real SOL but never
     * displayed above 100%.
     */
    isOverfilled,

    overfillSol,

    overfillLocal,

    /*
     * Normal updates restore only to the
     * universal full threshold.
     */
    batteryTopUpRequiredSol:
      topUp
        .batteryTopUpRequiredSol,

    batteryTopUpRequiredLocal:
      topUp
        .batteryTopUpRequiredLocal,

    updateRecommended:
      isLow,

    batteryMode:
      resolvedBatteryMode,

    estimatedPaymentsRemaining,

    averageFeeLamports:
      toPositiveNumber(
        averageFeeLamports,
        DEFAULT_FEE_LAMPORTS
      ),

    /*
     * Compatibility aliases for existing
     * Cashie screens during migration.
     */
    batteryCapacitySol:
      resolvedBatteryFullThresholdSol,

    targetReserveSol:
      resolvedBatteryFullThresholdSol,

    batteryCapacityLocal:
      batteryFullThresholdLocal,

    targetReserveLocal:
      batteryFullThresholdLocal,

    topUpRequiredSol:
      topUp
        .batteryTopUpRequiredSol,

    topUpRequiredLocal:
      topUp
        .batteryTopUpRequiredLocal,

    solPriceAud:
      safeSolPriceLocal,

    reserveAud:
      reserveLocal,

    batteryCapacityAud:
      batteryFullThresholdLocal,

    lowThresholdAud:
      lowThresholdLocal,

    topUpAud:
      topUp
        .batteryTopUpRequiredLocal,

    estimatedRechargeCostAud:
      topUp
        .batteryTopUpRequiredLocal,
  };
}

/*
 * COMPATIBILITY FUNCTIONS
 *
 * These remain temporarily so existing
 * screens and older App.js code continue
 * compiling during the migration.
 */

export function calculateReserveAud(
  options = {}
) {
  return calculateReserveLocal({
    solBalance:
      options.solBalance,

    solPriceLocal:
      options.solPriceAud,
  });
}

export function calculateBatteryCapacityLocal({
  batteryFullThresholdSol =
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  solPriceLocal,

  highestLocalCoin,

  /*
   * Compatibility inputs.
   */
  batteryCapacityLocal,
  targetReserveLocal,
  batteryCapacityAud,
  topUpAud,
  solPriceAud,
} = {}) {
  const explicitLocalValue =
    batteryCapacityLocal ??
    targetReserveLocal ??
    batteryCapacityAud ??
    topUpAud;

  if (
    explicitLocalValue !==
      undefined &&
    explicitLocalValue !==
      null
  ) {
    return toPositiveNumber(
      explicitLocalValue,
      0
    );
  }

  if (
    highestLocalCoin !==
      undefined &&
    highestLocalCoin !==
      null
  ) {
    return toPositiveNumber(
      highestLocalCoin,
      0
    );
  }

  return calculateBatteryFullThresholdLocal({
    batteryFullThresholdSol,

    solPriceLocal:
      solPriceLocal ??
      solPriceAud,
  });
}

export function calculateBatteryCapacitySol({
  batteryCapacityLocal,

  solPriceLocal,

  /*
   * Compatibility.
   */
  targetReserveLocal,
  solPriceAud,
} = {}) {
  const safeLocalValue =
    toPositiveNumber(
      batteryCapacityLocal ??
        targetReserveLocal,
      0
    );

  const safeSolPriceLocal =
    toPositiveNumber(
      solPriceLocal ??
        solPriceAud,
      DEFAULT_SOL_LOCAL_PRICE
    );

  if (
    safeSolPriceLocal <=
      0
  ) {
    return 0;
  }

  return (
    safeLocalValue /
    safeSolPriceLocal
  );
}

export function calculateTargetReserveLocal(
  options = {}
) {
  return calculateBatteryCapacityLocal(
    options
  );
}

export function calculateTargetReserveSol(
  options = {}
) {
  return calculateBatteryCapacitySol(
    options
  );
}

export function calculateTopUpLocal({
  currentReserveLocal,

  targetReserveLocal,

  currentReserveAud,
  targetReserveAud,
} = {}) {
  const safeCurrentReserveLocal =
    toPositiveNumber(
      currentReserveLocal ??
        currentReserveAud,
      0
    );

  const safeTargetReserveLocal =
    toPositiveNumber(
      targetReserveLocal ??
        targetReserveAud,
      0
    );

  return Math.max(
    0,
    safeTargetReserveLocal -
      safeCurrentReserveLocal
  );
}

export function calculateTopUpSol({
  topUpRequiredLocal,

  amountLocal,

  solPriceLocal,

  amountAud,
  solPriceAud,
} = {}) {
  return calculateBatteryTopUpRequiredSol({
    batteryTopUpRequiredLocal:
      topUpRequiredLocal ??
      amountLocal ??
      amountAud,

    solPriceLocal:
      solPriceLocal ??
      solPriceAud,
  });
}

export function calculateTopUpAud({
  currentReserveAud = 0,

  targetReserveAud = 0,
} = {}) {
  return calculateTopUpLocal({
    currentReserveAud,

    targetReserveAud,
  });
}

export function clampReminderAmount({
  reminderAud = 0,

  minimumAud = 0,

  maximumAud = 0,
} = {}) {
  return clamp(
    reminderAud,
    minimumAud,
    maximumAud
  );
}

export function shouldRecommendUpdate({
  solBalance,

  lowThresholdSol,

  /*
   * Compatibility inputs.
   */
  reserveLocal,
  lowThresholdLocal,
  reserveAud,
  reminderAud,
} = {}) {
  if (
    solBalance !==
      undefined
  ) {
    return isBatteryLow({
      solBalance,

      lowThresholdSol,
    });
  }

  return isBatteryLow({
    reserveLocal:
      reserveLocal ??
      reserveAud,

    lowThresholdLocal:
      lowThresholdLocal ??
      reminderAud,
  });
}

export function calculateIncomingSolAllocation({
  incomingSol = 0,

  currentReserveAud = 0,

  targetReserveAud = 0,

  solPriceAud =
    DEFAULT_SOL_LOCAL_PRICE,
} = {}) {
  const safeSolPrice =
    toPositiveNumber(
      solPriceAud,
      DEFAULT_SOL_LOCAL_PRICE
    );

  const currentReserveSol =
    safeSolPrice >
      0
      ? toPositiveNumber(
          currentReserveAud,
          0
        ) /
        safeSolPrice
      : 0;

  const targetReserveSol =
    safeSolPrice >
      0
      ? toPositiveNumber(
          targetReserveAud,
          0
        ) /
        safeSolPrice
      : 0;

  const allocation =
    calculateIncomingBatteryAllocation({
      incomingSol,

      currentReserveSol,

      batteryFullThresholdSol:
        targetReserveSol,

      batteryIsLow:
        true,
    });

  return {
    incomingSol:
      allocation.incomingSol,

    reserveSol:
      allocation.reserveSol,

    excessSol:
      allocation.excessSol,

    reserveAud:
      allocation
        .resultingReserveSol *
      safeSolPrice,

    excessAud:
      allocation.excessSol *
      safeSolPrice,
  };
}

export const BATTERY_DEFAULTS = {
  solPriceLocal:
    DEFAULT_SOL_LOCAL_PRICE,

  batteryFullThresholdSol:
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  lowThresholdPercent:
    DEFAULT_LOW_BATTERY_PERCENT,

  batteryMode:
    DEFAULT_BATTERY_MODE,

  averageFeeLamports:
    DEFAULT_FEE_LAMPORTS,

  /*
   * Compatibility aliases.
   */
  solPriceAud:
    DEFAULT_SOL_LOCAL_PRICE,

  batteryCapacitySol:
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  targetReserveSol:
    DEFAULT_BATTERY_FULL_THRESHOLD_SOL,

  batteryCapacityAud:
    (
      DEFAULT_BATTERY_FULL_THRESHOLD_SOL *
      DEFAULT_SOL_LOCAL_PRICE
    ),

  lowThresholdAud:
    (
      DEFAULT_BATTERY_FULL_THRESHOLD_SOL *
      DEFAULT_SOL_LOCAL_PRICE *
      DEFAULT_LOW_BATTERY_PERCENT /
      100
    ),

  topUpAud:
    (
      DEFAULT_BATTERY_FULL_THRESHOLD_SOL *
      DEFAULT_SOL_LOCAL_PRICE
    ),

  paymentsPerAud:
    0,
};