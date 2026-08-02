const DEFAULT_SOL_AUD_PRICE = 200;

const DEFAULT_BATTERY_CAPACITY_AUD = 250;

const DEFAULT_LOW_THRESHOLD_AUD = 2;

const DEFAULT_TOP_UP_AUD = 2;

const DEFAULT_PAYMENTS_PER_AUD = 255;

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

export function clamp(
  value,
  minimum,
  maximum
) {
  const safeValue =
    toSafeNumber(
      value,
      minimum
    );

  return Math.min(
    Math.max(
      safeValue,
      minimum
    ),
    maximum
  );
}

export function calculateReserveAud({
  solBalance = 0,
  solPriceAud =
    DEFAULT_SOL_AUD_PRICE,
} = {}) {
  const safeSolBalance =
    Math.max(
      0,
      toSafeNumber(
        solBalance
      )
    );

  const safeSolPriceAud =
    Math.max(
      0,
      toSafeNumber(
        solPriceAud,
        DEFAULT_SOL_AUD_PRICE
      )
    );

  return (
    safeSolBalance *
    safeSolPriceAud
  );
}

export function calculateChargePercent({
  reserveAud = 0,
  batteryCapacityAud =
    DEFAULT_BATTERY_CAPACITY_AUD,
} = {}) {
  const safeReserveAud =
    Math.max(
      0,
      toSafeNumber(
        reserveAud
      )
    );

  const safeCapacityAud =
    Math.max(
      0,
      toSafeNumber(
        batteryCapacityAud,
        DEFAULT_BATTERY_CAPACITY_AUD
      )
    );

  if (
    safeCapacityAud === 0
  ) {
    return 0;
  }

  return Math.round(
    clamp(
      (
        safeReserveAud /
        safeCapacityAud
      ) *
        100,
      0,
      100
    )
  );
}

export function getBatteryStatus({
  reserveAud = 0,
  lowThresholdAud =
    DEFAULT_LOW_THRESHOLD_AUD,
} = {}) {
  const safeReserveAud =
    Math.max(
      0,
      toSafeNumber(
        reserveAud
      )
    );

  const safeLowThresholdAud =
    Math.max(
      0,
      toSafeNumber(
        lowThresholdAud,
        DEFAULT_LOW_THRESHOLD_AUD
      )
    );

  if (
    safeReserveAud <= 0
  ) {
    return 'Empty';
  }

  if (
    safeReserveAud <=
    safeLowThresholdAud
  ) {
    return 'Update recommended';
  }

  return 'Ready';
}

export function isBatteryLow({
  reserveAud = 0,
  lowThresholdAud =
    DEFAULT_LOW_THRESHOLD_AUD,
} = {}) {
  const status =
    getBatteryStatus({
      reserveAud,
      lowThresholdAud,
    });

  return (
    status ===
      'Empty' ||
    status ===
      'Update recommended'
  );
}

export function estimatePaymentsRemaining({
  reserveAud = 0,
  paymentsPerAud =
    DEFAULT_PAYMENTS_PER_AUD,
} = {}) {
  const safeReserveAud =
    Math.max(
      0,
      toSafeNumber(
        reserveAud
      )
    );

  const safePaymentsPerAud =
    Math.max(
      0,
      toSafeNumber(
        paymentsPerAud,
        DEFAULT_PAYMENTS_PER_AUD
      )
    );

  return Math.max(
    0,
    Math.round(
      safeReserveAud *
        safePaymentsPerAud
    )
  );
}

export function calculateTopUpSol({
  amountAud =
    DEFAULT_TOP_UP_AUD,
  solPriceAud =
    DEFAULT_SOL_AUD_PRICE,
} = {}) {
  const safeAmountAud =
    Math.max(
      0,
      toSafeNumber(
        amountAud,
        DEFAULT_TOP_UP_AUD
      )
    );

  const safeSolPriceAud =
    Math.max(
      0,
      toSafeNumber(
        solPriceAud,
        DEFAULT_SOL_AUD_PRICE
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

export function calculateTopUpAud({
  currentReserveAud = 0,
  targetReserveAud =
    DEFAULT_TOP_UP_AUD,
} = {}) {
  const safeCurrentReserveAud =
    Math.max(
      0,
      toSafeNumber(
        currentReserveAud
      )
    );

  const safeTargetReserveAud =
    Math.max(
      0,
      toSafeNumber(
        targetReserveAud,
        DEFAULT_TOP_UP_AUD
      )
    );

  return Math.max(
    0,
    safeTargetReserveAud -
      safeCurrentReserveAud
  );
}

export function clampReminderAmount({
  reminderAud =
    DEFAULT_LOW_THRESHOLD_AUD,
  minimumAud = 0,
  maximumAud =
    DEFAULT_BATTERY_CAPACITY_AUD,
} = {}) {
  const safeMinimumAud =
    Math.max(
      0,
      toSafeNumber(
        minimumAud
      )
    );

  const safeMaximumAud =
    Math.max(
      safeMinimumAud,
      toSafeNumber(
        maximumAud,
        DEFAULT_BATTERY_CAPACITY_AUD
      )
    );

  return clamp(
    reminderAud,
    safeMinimumAud,
    safeMaximumAud
  );
}

export function shouldRecommendUpdate({
  reserveAud = 0,
  reminderAud =
    DEFAULT_LOW_THRESHOLD_AUD,
} = {}) {
  const safeReserveAud =
    Math.max(
      0,
      toSafeNumber(
        reserveAud
      )
    );

  const safeReminderAud =
    Math.max(
      0,
      toSafeNumber(
        reminderAud,
        DEFAULT_LOW_THRESHOLD_AUD
      )
    );

  return (
    safeReserveAud <=
    safeReminderAud
  );
}

export function calculateIncomingSolAllocation({
  incomingSol = 0,
  currentReserveAud = 0,
  targetReserveAud =
    DEFAULT_TOP_UP_AUD,
  solPriceAud =
    DEFAULT_SOL_AUD_PRICE,
} = {}) {
  const safeIncomingSol =
    Math.max(
      0,
      toSafeNumber(
        incomingSol
      )
    );

  const safeSolPriceAud =
    Math.max(
      0,
      toSafeNumber(
        solPriceAud,
        DEFAULT_SOL_AUD_PRICE
      )
    );

  if (
    safeSolPriceAud === 0
  ) {
    return {
      incomingSol:
        safeIncomingSol,

      reserveSol:
        0,

      excessSol:
        safeIncomingSol,

      reserveAud:
        Math.max(
          0,
          toSafeNumber(
            currentReserveAud
          )
        ),

      excessAud:
        0,
    };
  }

  const topUpRequiredAud =
    calculateTopUpAud({
      currentReserveAud,
      targetReserveAud,
    });

  const topUpRequiredSol =
    topUpRequiredAud /
    safeSolPriceAud;

  const reserveSol =
    Math.min(
      safeIncomingSol,
      topUpRequiredSol
    );

  const excessSol =
    Math.max(
      0,
      safeIncomingSol -
        reserveSol
    );

  return {
    incomingSol:
      safeIncomingSol,

    reserveSol,

    excessSol,

    reserveAud:
      Math.max(
        0,
        toSafeNumber(
          currentReserveAud
        )
      ) +
      reserveSol *
        safeSolPriceAud,

    excessAud:
      excessSol *
      safeSolPriceAud,
  };
}

export function getBatterySnapshot({
  solBalance = 0,
  solPriceAud =
    DEFAULT_SOL_AUD_PRICE,
  batteryCapacityAud =
    DEFAULT_BATTERY_CAPACITY_AUD,
  lowThresholdAud =
    DEFAULT_LOW_THRESHOLD_AUD,
  topUpAud =
    DEFAULT_TOP_UP_AUD,
  paymentsPerAud =
    DEFAULT_PAYMENTS_PER_AUD,
} = {}) {
  const reserveAud =
    calculateReserveAud({
      solBalance,
      solPriceAud,
    });

  const chargePercent =
    calculateChargePercent({
      reserveAud,
      batteryCapacityAud,
    });

  const status =
    getBatteryStatus({
      reserveAud,
      lowThresholdAud,
    });

  const estimatedPaymentsRemaining =
    estimatePaymentsRemaining({
      reserveAud,
      paymentsPerAud,
    });

  return {
    solBalance:
      Math.max(
        0,
        toSafeNumber(
          solBalance
        )
      ),

    solPriceAud:
      Math.max(
        0,
        toSafeNumber(
          solPriceAud,
          DEFAULT_SOL_AUD_PRICE
        )
      ),

    reserveAud,

    batteryCapacityAud:
      Math.max(
        0,
        toSafeNumber(
          batteryCapacityAud,
          DEFAULT_BATTERY_CAPACITY_AUD
        )
      ),

    lowThresholdAud:
      Math.max(
        0,
        toSafeNumber(
          lowThresholdAud,
          DEFAULT_LOW_THRESHOLD_AUD
        )
      ),

    topUpAud:
      Math.max(
        0,
        toSafeNumber(
          topUpAud,
          DEFAULT_TOP_UP_AUD
        )
      ),

    chargePercent,

    status,

    isLow:
      isBatteryLow({
        reserveAud,
        lowThresholdAud,
      }),

    updateRecommended:
      shouldRecommendUpdate({
        reserveAud,
        reminderAud:
          lowThresholdAud,
      }),

    estimatedPaymentsRemaining,

    estimatedRechargeCostAud:
      Math.max(
        0,
        toSafeNumber(
          topUpAud,
          DEFAULT_TOP_UP_AUD
        )
      ),
  };
}

export const BATTERY_DEFAULTS = {
  solPriceAud:
    DEFAULT_SOL_AUD_PRICE,

  batteryCapacityAud:
    DEFAULT_BATTERY_CAPACITY_AUD,

  lowThresholdAud:
    DEFAULT_LOW_THRESHOLD_AUD,

  topUpAud:
    DEFAULT_TOP_UP_AUD,

  paymentsPerAud:
    DEFAULT_PAYMENTS_PER_AUD,
};