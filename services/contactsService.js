import validateAddress from '../utils/validateAddress';

function createUniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function normaliseWalletAddress(
  address = ''
) {
  return String(
    address || ''
  ).trim();
}

export function getInitials(
  name = ''
) {
  return String(
    name || ''
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      word =>
        word[0]
    )
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function createPersonId() {
  return createUniqueId(
    'person'
  );
}

export function createActivityId() {
  return createUniqueId(
    'activity'
  );
}

export function formatActivityDate(
  date = new Date()
) {
  const safeDate =
    date instanceof Date
      ? date
      : new Date(
          date
        );

  if (
    Number.isNaN(
      safeDate.getTime()
    )
  ) {
    return '';
  }

  return safeDate.toLocaleDateString(
    'en-AU',
    {
      day:
        'numeric',

      month:
        'short',
    }
  );
}

export function formatAudAmount(
  amount = 0
) {
  const numericAmount =
    Number(
      amount || 0
    );

  const safeAmount =
    Number.isFinite(
      numericAmount
    )
      ? numericAmount
      : 0;

  return `A$${safeAmount.toFixed(
    2
  )}`;
}

export function parseActivityAmount(
  amount = ''
) {
  const numericValue =
    Number(
      String(
        amount || ''
      ).replace(
        /[^0-9.-]/g,
        ''
      )
    );

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return 0;
  }

  return numericValue;
}

export function createSentActivity({
  amount = 0,
  transactionId = '',
  date = new Date(),
} = {}) {
  const numericAmount =
    Number(
      amount || 0
    );

  const safeAmount =
    Number.isFinite(
      numericAmount
    )
      ? numericAmount
      : 0;

  const createdAt =
    date instanceof Date
      ? date
      : new Date(
          date
        );

  const safeDate =
    Number.isNaN(
      createdAt.getTime()
    )
      ? new Date()
      : createdAt;

  return {
    id:
      createActivityId(),

    type:
      'sent',

    amount:
      formatAudAmount(
        safeAmount
      ),

    numericAmount:
      safeAmount,

    date:
      formatActivityDate(
        safeDate
      ),

    createdAt:
      safeDate.toISOString(),

    transactionId:
      String(
        transactionId || ''
      ),
  };
}

export function createReceivedActivity({
  amount = 0,
  transactionId = '',
  date = new Date(),
} = {}) {
  const numericAmount =
    Number(
      amount || 0
    );

  const safeAmount =
    Number.isFinite(
      numericAmount
    )
      ? numericAmount
      : 0;

  const createdAt =
    date instanceof Date
      ? date
      : new Date(
          date
        );

  const safeDate =
    Number.isNaN(
      createdAt.getTime()
    )
      ? new Date()
      : createdAt;

  return {
    id:
      createActivityId(),

    type:
      'received',

    amount:
      formatAudAmount(
        safeAmount
      ),

    numericAmount:
      safeAmount,

    date:
      formatActivityDate(
        safeDate
      ),

    createdAt:
      safeDate.toISOString(),

    transactionId:
      String(
        transactionId || ''
      ),
  };
}

export function findPersonById(
  people = [],
  personId = ''
) {
  if (
    !Array.isArray(
      people
    ) ||
    !personId
  ) {
    return null;
  }

  return (
    people.find(
      person =>
        person?.id ===
        personId
    ) ||
    null
  );
}

export function findPersonByWalletAddress(
  people = [],
  walletAddress = ''
) {
  if (
    !Array.isArray(
      people
    )
  ) {
    return null;
  }

  const normalisedAddress =
    normaliseWalletAddress(
      walletAddress
    );

  if (
    !normalisedAddress
  ) {
    return null;
  }

  return (
    people.find(
      person =>
        normaliseWalletAddress(
          person?.walletAddress
        ) ===
        normalisedAddress
    ) ||
    null
  );
}

export function isKnownCashiePerson(
  people = [],
  walletAddress = ''
) {
  return Boolean(
    findPersonByWalletAddress(
      people,
      walletAddress
    )
  );
}

export function createCashiePerson({
  name = '',
  walletAddress = '',
  initialActivity = null,
  lastPaidAt = '',
} = {}) {
  const cleanName =
    String(
      name || ''
    ).trim();

  const cleanWalletAddress =
    normaliseWalletAddress(
      walletAddress
    );

  if (
    !cleanName
  ) {
    throw new Error(
      'A Cashie Person must have a name.'
    );
  }

  if (
    !validateAddress(
      cleanWalletAddress
    )
  ) {
    throw new Error(
      'A valid wallet address is required.'
    );
  }

  const activity =
    initialActivity
      ? [
          initialActivity,
        ]
      : [];

  const sentCount =
    activity.filter(
      item =>
        item?.type ===
        'sent'
    ).length;

  const receivedCount =
    activity.filter(
      item =>
        item?.type ===
        'received'
    ).length;

  return {
    id:
      createPersonId(),

    name:
      cleanName,

    initials:
      getInitials(
        cleanName
      ),

    walletAddress:
      cleanWalletAddress,

    paymentCount:
      activity.length,

    paymentsSent:
      sentCount,

    paymentsReceived:
      receivedCount,

    lastPaidAt:
      lastPaidAt ||
      initialActivity?.createdAt ||
      '',

    activity,
  };
}

export function addCashiePerson(
  people = [],
  personDetails = {}
) {
  const safePeople =
    Array.isArray(
      people
    )
      ? people
      : [];

  const walletAddress =
    normaliseWalletAddress(
      personDetails.walletAddress
    );

  if (
    isKnownCashiePerson(
      safePeople,
      walletAddress
    )
  ) {
    return {
      people:
        safePeople,

      person:
        findPersonByWalletAddress(
          safePeople,
          walletAddress
        ),

      added:
        false,

      reason:
        'already-exists',
    };
  }

  const newPerson =
    createCashiePerson(
      personDetails
    );

  return {
    people: [
      ...safePeople,
      newPerson,
    ],

    person:
      newPerson,

    added:
      true,

    reason:
      null,
  };
}

export function updateCashiePerson(
  people = [],
  personId = '',
  changes = {}
) {
  const safePeople =
    Array.isArray(
      people
    )
      ? people
      : [];

  const existingPerson =
    findPersonById(
      safePeople,
      personId
    );

  if (
    !existingPerson
  ) {
    return {
      people:
        safePeople,

      person:
        null,

      updated:
        false,

      reason:
        'not-found',
    };
  }

  const cleanName =
    String(
      changes.name ??
        existingPerson.name ??
        ''
    ).trim();

  const cleanWalletAddress =
    normaliseWalletAddress(
      changes.walletAddress ??
        existingPerson.walletAddress
    );

  if (
    !cleanName
  ) {
    throw new Error(
      'A Cashie Person must have a name.'
    );
  }

  if (
    !validateAddress(
      cleanWalletAddress
    )
  ) {
    throw new Error(
      'A valid wallet address is required.'
    );
  }

  const duplicatePerson =
    safePeople.find(
      person =>
        person?.id !==
          personId &&
        normaliseWalletAddress(
          person?.walletAddress
        ) ===
          cleanWalletAddress
    );

  if (
    duplicatePerson
  ) {
    return {
      people:
        safePeople,

      person:
        existingPerson,

      updated:
        false,

      reason:
        'wallet-address-already-used',
    };
  }

  const updatedPerson = {
    ...existingPerson,
    ...changes,

    id:
      existingPerson.id,

    name:
      cleanName,

    initials:
      getInitials(
        cleanName
      ),

    walletAddress:
      cleanWalletAddress,

    activity:
      Array.isArray(
        changes.activity
      )
        ? changes.activity
        : existingPerson.activity ||
          [],
  };

  return {
    people:
      safePeople.map(
        person =>
          person?.id ===
          personId
            ? updatedPerson
            : person
      ),

    person:
      updatedPerson,

    updated:
      true,

    reason:
      null,
  };
}

export function removeCashiePerson(
  people = [],
  personId = ''
) {
  const safePeople =
    Array.isArray(
      people
    )
      ? people
      : [];

  const person =
    findPersonById(
      safePeople,
      personId
    );

  if (
    !person
  ) {
    return {
      people:
        safePeople,

      removedPerson:
        null,

      removed:
        false,
    };
  }

  return {
    people:
      safePeople.filter(
        savedPerson =>
          savedPerson?.id !==
          personId
      ),

    removedPerson:
      person,

    removed:
      true,
  };
}

export function addActivityToPerson(
  people = [],
  personId = '',
  activity
) {
  if (
    !activity
  ) {
    return {
      people:
        Array.isArray(
          people
        )
          ? people
          : [],

      person:
        null,

      updated:
        false,
    };
  }

  const safePeople =
    Array.isArray(
      people
    )
      ? people
      : [];

  const existingPerson =
    findPersonById(
      safePeople,
      personId
    );

  if (
    !existingPerson
  ) {
    return {
      people:
        safePeople,

      person:
        null,

      updated:
        false,
    };
  }

  const isSent =
    activity.type ===
    'sent';

  const isReceived =
    activity.type ===
    'received';

  const updatedPerson = {
    ...existingPerson,

    paymentCount:
      Number(
        existingPerson.paymentCount ||
          0
      ) + 1,

    paymentsSent:
      Number(
        existingPerson.paymentsSent ||
          0
      ) +
      (
        isSent
          ? 1
          : 0
      ),

    paymentsReceived:
      Number(
        existingPerson.paymentsReceived ||
          0
      ) +
      (
        isReceived
          ? 1
          : 0
      ),

    lastPaidAt:
      activity.createdAt ||
      new Date()
        .toISOString(),

    activity: [
      activity,
      ...(
        existingPerson.activity ||
        []
      ),
    ],
  };

  return {
    people:
      safePeople.map(
        person =>
          person?.id ===
          personId
            ? updatedPerson
            : person
      ),

    person:
      updatedPerson,

    updated:
      true,
  };
}

export function recordPaymentForWalletAddress({
  people = [],
  walletAddress = '',
  amount = 0,
  transactionId = '',
  direction = 'sent',
} = {}) {
  const person =
    findPersonByWalletAddress(
      people,
      walletAddress
    );

  if (
    !person
  ) {
    return {
      people:
        Array.isArray(
          people
        )
          ? people
          : [],

      person:
        null,

      activity:
        null,

      updated:
        false,

      reason:
        'not-found',
    };
  }

  const activity =
    direction ===
    'received'
      ? createReceivedActivity({
          amount,
          transactionId,
        })
      : createSentActivity({
          amount,
          transactionId,
        });

  const result =
    addActivityToPerson(
      people,
      person.id,
      activity
    );

  return {
    ...result,
    activity,
    reason:
      null,
  };
}

export function clearPersonHistory(
  people = [],
  personId = ''
) {
  const safePeople =
    Array.isArray(
      people
    )
      ? people
      : [];

  const person =
    findPersonById(
      safePeople,
      personId
    );

  if (
    !person
  ) {
    return {
      people:
        safePeople,

      person:
        null,

      cleared:
        false,
    };
  }

  const clearedPerson = {
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
  };

  return {
    people:
      safePeople.map(
        savedPerson =>
          savedPerson?.id ===
          personId
            ? clearedPerson
            : savedPerson
      ),

    person:
      clearedPerson,

    cleared:
      true,
  };
}

export function countPeoplePaid(
  people = []
) {
  if (
    !Array.isArray(
      people
    )
  ) {
    return 0;
  }

  return people.filter(
    person =>
      Number(
        person?.paymentsSent ||
          0
      ) > 0
  ).length;
}