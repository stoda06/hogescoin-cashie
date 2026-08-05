import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Svg, {
  Polygon,
} from 'react-native-svg';

import {
  CASHIE_COLOURS,
} from '../utils/constants.js';

const MAXIMUM_MINOR_UNITS =
  999999999999;

const FALLBACK_COLOURS = {
  darkLeather: '#382015',
  leather: '#512B1A',

  copper: '#B96E32',
  copperLight: '#D49156',
  copperDark: '#79401D',

  paper: '#F8F4EA',
  paperDark: '#EFE8DA',

  cream: '#F8EBD2',
  lightCream: '#FFF7E7',
  mutedText: '#8A7564',

  ink: '#21120B',
  line: '#D5C8B7',
};

const COLOURS = {
  ...FALLBACK_COLOURS,
  ...(CASHIE_COLOURS || {}),
};

const KEYPAD_KEYS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'C',
  '0',
  '⌫',
];

function getDecimalPlaces(
  currency
) {
  const suppliedDecimalPlaces =
    Number(
      currency?.decimalPlaces
    );

  if (
    Number.isInteger(
      suppliedDecimalPlaces
    ) &&
    suppliedDecimalPlaces >=
      0 &&
    suppliedDecimalPlaces <=
      4
  ) {
    return suppliedDecimalPlaces;
  }

  return 2;
}

function getMinorUnitScale(
  currency
) {
  return Math.pow(
    10,
    getDecimalPlaces(
      currency
    )
  );
}

function normaliseMinorUnits(
  amount,
  currency
) {
  const numericAmount =
    Number(
      amount ||
        0
    );

  if (
    !Number.isFinite(
      numericAmount
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(
      numericAmount *
        getMinorUnitScale(
          currency
        )
    )
  );
}

function minorUnitsToAmount(
  minorUnits,
  currency
) {
  return (
    Number(
      minorUnits ||
        0
    ) /
    getMinorUnitScale(
      currency
    )
  );
}

function formatNumber(
  amount,
  currency
) {
  const decimalPlaces =
    getDecimalPlaces(
      currency
    );

  return Number(
    amount ||
      0
  ).toLocaleString(
    'en-AU',
    {
      minimumFractionDigits:
        decimalPlaces,

      maximumFractionDigits:
        decimalPlaces,
    }
  );
}

function formatLocalAmount(
  minorUnits,
  currency,
  fallbackSymbol = '$'
) {
  const amount =
    minorUnitsToAmount(
      minorUnits,
      currency
    );

  const formattedNumber =
    formatNumber(
      amount,
      currency
    );

  const symbol =
    String(
      currency?.symbol ||
        fallbackSymbol ||
        ''
    );

  if (
    currency?.symbolPosition ===
    'after'
  ) {
    return `${formattedNumber} ${symbol}`;
  }

  return `${symbol}${formattedNumber}`;
}

function denominationToMinorUnits(
  value,
  currency
) {
  return Math.max(
    0,
    Math.round(
      Number(
        value ||
          0
      ) *
        getMinorUnitScale(
          currency
        )
    )
  );
}

function MethodButton({
  label,
  selected,
  onPress,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.methodButton,

        selected &&
          styles.methodButtonSelected,

        pressed &&
          styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.methodText,

          selected &&
            styles.methodTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Keypad({
  decimalPlaces,
  onKeyPress,
}) {
  const keys =
    decimalPlaces ===
    0
      ? KEYPAD_KEYS.map(
          key =>
            key ===
            'C'
              ? '000'
              : key
        )
      : KEYPAD_KEYS;

  return (
    <View
      style={
        styles.keypad
      }
    >
      {keys.map(
        key => (
          <Pressable
            key={
              key
            }
            accessibilityRole="button"
            accessibilityLabel={
              key ===
              'C'
                ? 'Clear amount'
                : key ===
                    '⌫'
                  ? 'Delete last digit'
                  : key ===
                      '000'
                    ? 'Add three zeroes'
                    : key
            }
            onPress={() =>
              onKeyPress(
                key
              )
            }
            style={({
              pressed,
            }) => [
              styles.key,

              pressed &&
                styles.keyPressed,
            ]}
          >
            <Text
              style={[
                styles.keyText,

                (
                  key ===
                    'C' ||
                  key ===
                    '⌫'
                ) &&
                  styles.keyUtilityText,
              ]}
            >
              {key}
            </Text>
          </Pressable>
        )
      )}
    </View>
  );
}

function NoteButton({
  note,
  onPress,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        `Add ${note.label}`
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.note,

        {
          backgroundColor:
            note.colour,
        },

        pressed &&
          styles.notePressed,
      ]}
    >
      <View
        style={
          styles.noteMark
        }
      >
        <Text
          style={
            styles.noteMarkText
          }
        >
          H
        </Text>
      </View>

      <Text
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.68
        }
        style={
          styles.noteValue
        }
      >
        {note.label}
      </Text>

      <Text
        style={
          styles.noteBrand
        }
      >
        HOGESCOIN
      </Text>
    </Pressable>
  );
}

function createPolygonPoints({
  sides,
  size,
  innerRatio = 1,
  rotationOffset = 0,
}) {
  const centre =
    size /
    2;

  const outerRadius =
    size /
      2 -
    2;

  return Array.from(
    {
      length:
        sides,
    },
    (
      unused,
      index
    ) => {
      const angle =
        (
          Math.PI *
          2 *
          index
        ) /
          sides -
        Math.PI /
          2 +
        rotationOffset;

      const radius =
        index %
          2 ===
        0
          ? outerRadius
          : outerRadius *
            innerRatio;

      const x =
        centre +
        Math.cos(
          angle
        ) *
          radius;

      const y =
        centre +
        Math.sin(
          angle
        ) *
          radius;

      return `${x},${y}`;
    }
  ).join(
    ' '
  );
}

function getCoinShapeDetails(
  shape
) {
  switch (
    String(
      shape ||
        'round'
    ).toLowerCase()
  ) {
    case 'curved-heptagon':
      return {
        sides:
          14,

        innerRatio:
          0.95,

        rotationOffset:
          Math.PI /
          14,
      };

    case 'hendecagon':
      return {
        sides:
          11,

        innerRatio:
          1,

        rotationOffset:
          Math.PI /
          11,
      };

    case 'nonagon':
      return {
        sides:
          9,

        innerRatio:
          1,

        rotationOffset:
          Math.PI /
          9,
      };

    case 'scalloped':
      return {
        sides:
          24,

        innerRatio:
          0.85,

        rotationOffset:
          0,
      };

    case 'notched-dodecagon':
      return {
        sides:
          24,

        innerRatio:
          0.87,

        rotationOffset:
          Math.PI /
          24,
      };

    case 'dodecagon':
      return {
        sides:
          12,

        innerRatio:
          1,

        rotationOffset:
          Math.PI /
          12,
      };

    case 'round':
    default:
      return {
        sides:
          48,

        innerRatio:
          1,

        rotationOffset:
          0,
      };
  }
}

function getCoinColours(
  type
) {
  if (
    type ===
    'gold'
  ) {
    return {
      fill:
        '#C99A35',

      border:
        '#F0D27A',
    };
  }

  if (
    type ===
    'copper'
  ) {
    return {
      fill:
        '#A85D38',

      border:
        '#D99068',
    };
  }

  return {
    fill:
      '#A8ADB1',

    border:
      '#E0E3E5',
  };
}

function CoinButton({
  coin,
  onPress,
}) {
  const shapeDetails =
    getCoinShapeDetails(
      coin.shape
    );

  const colours =
    getCoinColours(
      coin.type
    );

  const points =
    createPolygonPoints({
      sides:
        shapeDetails.sides,

      size:
        coin.size,

      innerRatio:
        shapeDetails.innerRatio,

      rotationOffset:
        shapeDetails.rotationOffset,
    });

  return (
    <View
      style={
        styles.coinSlot
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          `Add ${coin.label}`
        }
        onPress={
          onPress
        }
        style={({
          pressed,
        }) => [
          styles.coin,

          {
            width:
              coin.size,

            height:
              coin.size,
          },

          pressed &&
            styles.coinPressed,
        ]}
      >
        <Svg
          pointerEvents="none"
          width={
            coin.size
          }
          height={
            coin.size
          }
          style={
            styles.coinShape
          }
        >
          <Polygon
            points={
              points
            }
            fill={
              colours.fill
            }
            stroke={
              colours.border
            }
            strokeWidth={
              3
            }
            strokeLinejoin="round"
          />
        </Svg>

        <View
          pointerEvents="none"
          style={
            styles.coinContent
          }
        >
          <Text
            numberOfLines={
              1
            }
            adjustsFontSizeToFit
            minimumFontScale={
              0.58
            }
            style={
              styles.coinValue
            }
          >
            {coin.label}
          </Text>

          <Text
            style={
              styles.coinMark
            }
          >
            H
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export default function CashComposer({
  mode = 'pay',
  amount = 0,
  maximumAmount = 0,

  currencySymbol = '$',
  currency,

  onAmountChange,
  onCancel,
}) {
  const isReceive =
    mode ===
    'receive';

  const decimalPlaces =
    getDecimalPlaces(
      currency
    );

  const [
    activeMethod,
    setActiveMethod,
  ] = useState(
    isReceive
      ? 'keypad'
      : 'notes'
  );

  const [
    keypadDigits,
    setKeypadDigits,
  ] = useState(
    ''
  );

  const [
    denominationHistory,
    setDenominationHistory,
  ] = useState(
    []
  );

  const [
    maximumHintVisible,
    setMaximumHintVisible,
  ] = useState(
    false
  );

  const maximumHintTimeoutRef =
    useRef(
      null
    );

  const previousCurrencyRef =
    useRef(
      currency
    );

  const amountMinorUnits =
    normaliseMinorUnits(
      amount,
      currency
    );

  const maximumMinorUnits =
    Math.min(
      normaliseMinorUnits(
        maximumAmount,
        currency
      ),
      MAXIMUM_MINOR_UNITS
    );

  const remainingMinorUnits =
    Math.max(
      maximumMinorUnits -
        amountMinorUnits,
      0
    );

  useEffect(
    () => {
      if (
        isReceive
      ) {
        setActiveMethod(
          'keypad'
        );
      }
    },
    [
      isReceive,
    ]
  );

  useEffect(
    () => {
      const externalDigits =
        amountMinorUnits >
        0
          ? String(
              amountMinorUnits
            )
          : '';

      setKeypadDigits(
        externalDigits
      );
    },
    [
      amountMinorUnits,
    ]
  );

  useEffect(
    () => {
      if (
        previousCurrencyRef.current ===
        currency
      ) {
        return;
      }

      previousCurrencyRef.current =
        currency;

      setDenominationHistory(
        []
      );

      setKeypadDigits(
        ''
      );

      onAmountChange?.(
        0
      );
    },
    [
      currency,
    ]
  );

  useEffect(
    () =>
      () => {
        if (
          maximumHintTimeoutRef.current
        ) {
          clearTimeout(
            maximumHintTimeoutRef.current
          );
        }
      },
    []
  );

  function showMaximumHint() {
    setMaximumHintVisible(
      true
    );

    if (
      maximumHintTimeoutRef.current
    ) {
      clearTimeout(
        maximumHintTimeoutRef.current
      );
    }

    maximumHintTimeoutRef.current =
      setTimeout(
        () => {
          setMaximumHintVisible(
            false
          );

          maximumHintTimeoutRef.current =
            null;
        },
        1600
      );
  }

  const notes =
    useMemo(
      () => {
        const sourceNotes =
          Array.isArray(
            currency?.notes
          )
            ? currency.notes
            : [];

        const noteColours = {
          blue:
            '#548FA8',

          green:
            '#73845A',

          red:
            '#C96558',

          'red-orange':
            '#C96558',

          orange:
            '#C98247',

          purple:
            '#9B7598',

          yellow:
            '#D5A83E',

          brown:
            '#89634E',

          grey:
            '#8A8782',

          gray:
            '#8A8782',

          'grey-purple':
            '#8D8093',

          'blue-green':
            '#598A87',

          'green-blue':
            '#598A87',

          'pink-red':
            '#B96875',

          'yellow-brown':
            '#B89A56',

          'orange-brown':
            '#A86F45',

          'green-yellow':
            '#A0A55C',

          'yellow-green':
            '#A4964C',

          'grey-green':
            '#7E856E',

          'gold-orange':
            '#C98E3E',

          'green-red':
            '#9E7459',

          'brown-red':
            '#A96453',

          'brown-purple':
            '#926C73',

          'grey-brown':
            '#8A7568',

          pink:
            '#B96888',

          violet:
            '#8A6F9E',

          turquoise:
            '#4E9694',
        };

        return sourceNotes
          .map(
            (
              note,
              index
            ) => ({
              ...note,

              value:
                denominationToMinorUnits(
                  note.value,
                  currency
                ),

              colour:
                noteColours[
                  String(
                    note.colour ||
                      ''
                  ).toLowerCase()
                ] ||
                (
                  typeof note.colour ===
                    'string' &&
                  note.colour.startsWith(
                    '#'
                  )
                    ? note.colour
                    : [
                        '#73845A',
                        '#D5A83E',
                        '#C96558',
                        '#548FA8',
                        '#9B7598',
                      ][
                        index %
                          5
                      ]
                ),
            })
          )
          .filter(
            note =>
              note.value >
              0
          )
          .sort(
            (
              first,
              second
            ) =>
              second.value -
              first.value
          );
      },
      [
        currency,
      ]
    );

  const coins =
    useMemo(
      () => {
        const sourceCoins =
          Array.isArray(
            currency?.coins
          )
            ? currency.coins
            : [];

        return sourceCoins
          .map(
            coin => {
              const coinColour =
                String(
                  coin.colour ||
                    ''
                ).toLowerCase();

              let type =
                'silver';

              if (
                coinColour.includes(
                  'gold'
                ) ||
                coinColour.includes(
                  'bi-metal'
                ) ||
                coinColour.includes(
                  'bimetal'
                ) ||
                coinColour.includes(
                  'brass'
                )
              ) {
                type =
                  'gold';
              } else if (
                coinColour.includes(
                  'copper'
                ) ||
                coinColour.includes(
                  'bronze'
                )
              ) {
                type =
                  'copper';
              }

              return {
                ...coin,

                shape:
                  coin.shape ||
                  'round',

                value:
                  denominationToMinorUnits(
                    coin.value,
                    currency
                  ),

                type,

                size:
                  Math.max(
                    32,
                    Math.min(
                      64,
                      Math.round(
                        60 *
                          Number(
                            coin.relativeSize ||
                              0.7
                          )
                      )
                    )
                  ),
              };
            }
          )
          .filter(
            coin =>
              coin.value >
              0
          )
          .sort(
            (
              first,
              second
            ) =>
              second.value -
              first.value
          );
      },
      [
        currency,
      ]
    );

  const visibleNotes =
    notes.filter(
      note =>
        Number(
          note.value
        ) <=
        remainingMinorUnits
    );

  const visibleCoins =
    coins.filter(
      coin =>
        Number(
          coin.value
        ) <=
        remainingMinorUnits
    );

  function publishMinorUnits(
    nextMinorUnits
  ) {
    const safeMinorUnits =
      Math.max(
        0,
        Math.min(
          Number(
            nextMinorUnits
          ) ||
            0,
          maximumMinorUnits,
          MAXIMUM_MINOR_UNITS
        )
      );

    onAmountChange?.(
      minorUnitsToAmount(
        safeMinorUnits,
        currency
      )
    );
  }

  function selectMethod(
    method
  ) {
    setActiveMethod(
      method
    );

    setKeypadDigits(
      amountMinorUnits >
      0
        ? String(
            amountMinorUnits
          )
        : ''
    );
  }

  function addDenomination(
    value
  ) {
    const denomination =
      Number(
        value
      ) ||
      0;

    if (
      denomination <=
      0
    ) {
      return;
    }

    if (
      denomination >
      remainingMinorUnits
    ) {
      showMaximumHint();

      return;
    }

    const nextMinorUnits =
      amountMinorUnits +
      denomination;

    setDenominationHistory(
      current => [
        ...current,
        denomination,
      ]
    );

    setKeypadDigits(
      String(
        nextMinorUnits
      )
    );

    publishMinorUnits(
      nextMinorUnits
    );
  }

  function clearAmount() {
    setDenominationHistory(
      []
    );

    setKeypadDigits(
      ''
    );

    publishMinorUnits(
      0
    );
  }

  function deleteLastDigit() {
    const currentDigits =
      keypadDigits ||
      (
        amountMinorUnits >
        0
          ? String(
              amountMinorUnits
            )
          : ''
      );

    const nextDigits =
      currentDigits.slice(
        0,
        -1
      );

    setDenominationHistory(
      []
    );

    setKeypadDigits(
      nextDigits
    );

    publishMinorUnits(
      nextDigits
        ? Number(
            nextDigits
          )
        : 0
    );
  }

  function enterDigit(
    digit
  ) {
    const currentDigits =
      keypadDigits;

    const nextDigits =
      currentDigits ===
      '0'
        ? digit
        : `${currentDigits}${digit}`;

    const nextMinorUnits =
      Number(
        nextDigits
      );

    if (
      !Number.isFinite(
        nextMinorUnits
      )
    ) {
      return;
    }

    if (
      nextMinorUnits >
        maximumMinorUnits ||
      nextMinorUnits >
        MAXIMUM_MINOR_UNITS
    ) {
      showMaximumHint();

      return;
    }

    setDenominationHistory(
      []
    );

    setKeypadDigits(
      nextDigits
    );

    publishMinorUnits(
      nextMinorUnits
    );
  }

  function handleKeyPress(
    key
  ) {
    if (
      key ===
      'C'
    ) {
      clearAmount();

      return;
    }

    if (
      key ===
      '⌫'
    ) {
      deleteLastDigit();

      return;
    }

    if (
      key ===
      '000'
    ) {
      if (
        !keypadDigits ||
        Number(
          keypadDigits
        ) ===
          0
      ) {
        return;
      }

      enterDigit(
        '000'
      );

      return;
    }

    enterDigit(
      key
    );
  }

  function undoLastCashItem() {
    if (
      denominationHistory.length ===
      0
    ) {
      return;
    }

    const lastValue =
      denominationHistory[
        denominationHistory.length -
          1
      ];

    const nextMinorUnits =
      Math.max(
        amountMinorUnits -
          lastValue,
        0
      );

    setDenominationHistory(
      current =>
        current.slice(
          0,
          -1
        )
    );

    setKeypadDigits(
      nextMinorUnits >
      0
        ? String(
            nextMinorUnits
          )
        : ''
    );

    publishMinorUnits(
      nextMinorUnits
    );
  }

  function handleCancel() {
    clearAmount();

    onCancel?.();
  }

  if (
    isReceive
  ) {
    return (
      <View
        style={
          styles.receiveComposer
        }
      >
        {maximumMinorUnits ===
          0 && (
          <Text
            style={
              styles.noBalanceText
            }
          >
            No balance available to
            pay from.
          </Text>
        )}

        <Keypad
          decimalPlaces={
            decimalPlaces
          }
          onKeyPress={
            handleKeyPress
          }
        />

        {maximumHintVisible && (
          <Text
            style={
              styles.maximumHintText
            }
          >
            Maximum reached
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel adding amount"
          onPress={
            handleCancel
          }
          style={({
            pressed,
          }) => [
            styles.receiveCancelButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.receiveCancelText
            }
          >
            CANCEL
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={
        styles.composer
      }
    >
      <View
        style={
          styles.paymentHeading
        }
      >
        <Text
          style={
            styles.paymentLabel
          }
        >
          MAKE YOUR PAYMENT
        </Text>

        <Text
          numberOfLines={
            1
          }
          adjustsFontSizeToFit
          minimumFontScale={
            0.64
          }
          style={
            styles.paymentAmount
          }
        >
          {formatLocalAmount(
            amountMinorUnits,
            currency,
            currencySymbol
          )}
        </Text>
      </View>

      {maximumMinorUnits ===
        0 && (
        <Text
          style={
            styles.noBalanceText
          }
        >
          No balance available to
          pay from.
        </Text>
      )}

      <View
        style={
          styles.methodSelector
        }
      >
        <MethodButton
          label="NOTES"
          selected={
            activeMethod ===
            'notes'
          }
          onPress={() =>
            selectMethod(
              'notes'
            )
          }
        />

        <MethodButton
          label="COINS"
          selected={
            activeMethod ===
            'coins'
          }
          onPress={() =>
            selectMethod(
              'coins'
            )
          }
        />

        <MethodButton
          label="KEYPAD"
          selected={
            activeMethod ===
            'keypad'
          }
          onPress={() =>
            selectMethod(
              'keypad'
            )
          }
        />
      </View>

      <View
        style={
          styles.methodContent
        }
      >
        {activeMethod ===
          'notes' && (
          <View
            style={
              styles.notesGrid
            }
          >
            {visibleNotes.length >
            0 ? (
              visibleNotes.map(
                note => (
                  <NoteButton
                    key={
                      note.value
                    }
                    note={
                      note
                    }
                    onPress={() =>
                      addDenomination(
                        note.value
                      )
                    }
                  />
                )
              )
            ) : (
              <Text
                style={
                  styles.emptyMethodText
                }
              >
                Use coins or the
                keypad for the
                remaining amount.
              </Text>
            )}
          </View>
        )}

        {activeMethod ===
          'coins' && (
          <View
            style={
              styles.coinGrid
            }
          >
            {visibleCoins.length >
            0 ? (
              visibleCoins.map(
                coin => (
                  <CoinButton
                    key={
                      coin.value
                    }
                    coin={
                      coin
                    }
                    onPress={() =>
                      addDenomination(
                        coin.value
                      )
                    }
                  />
                )
              )
            ) : (
              <Text
                style={
                  styles.emptyMethodText
                }
              >
                Use the keypad for
                the remaining
                amount.
              </Text>
            )}
          </View>
        )}

        {activeMethod ===
          'keypad' && (
          <Keypad
            decimalPlaces={
              decimalPlaces
            }
            onKeyPress={
              handleKeyPress
            }
          />
        )}
      </View>

      <View
        style={
          styles.utilityRow
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Undo last note or coin"
          disabled={
            denominationHistory.length ===
            0
          }
          onPress={
            undoLastCashItem
          }
          style={({
            pressed,
          }) => [
            styles.utilityButton,

            denominationHistory.length ===
              0 &&
              styles.utilityButtonDisabled,

            pressed &&
              denominationHistory.length >
                0 &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.utilityText
            }
          >
            UNDO
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear payment amount"
          disabled={
            amountMinorUnits ===
            0
          }
          onPress={
            clearAmount
          }
          style={({
            pressed,
          }) => [
            styles.utilityButton,

            amountMinorUnits ===
              0 &&
              styles.utilityButtonDisabled,

            pressed &&
              amountMinorUnits >
                0 &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.utilityText
            }
          >
            CLEAR
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel payment"
          onPress={
            handleCancel
          }
          style={({
            pressed,
          }) => [
            styles.utilityButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.utilityText
            }
          >
            CANCEL
          </Text>
        </Pressable>
      </View>

      {maximumHintVisible && (
        <Text
          style={
            styles.maximumHintText
          }
        >
          Maximum reached
        </Text>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    composer: {
      width:
        '100%',
    },

    paymentHeading: {
      alignItems:
        'center',

      paddingHorizontal:
        10,

      marginBottom:
        11,
    },

    paymentLabel: {
      color:
        COLOURS.leather,

      fontSize:
        11,

      fontWeight:
        '800',

      letterSpacing:
        1.25,
    },

    paymentAmount: {
      width:
        '100%',

      color:
        COLOURS.ink,

      fontSize:
        34,

      fontWeight:
        '700',

      letterSpacing:
        -0.5,

      textAlign:
        'center',

      marginTop:
        2,
    },

    methodSelector: {
      minHeight:
        44,

      flexDirection:
        'row',

      overflow:
        'hidden',

      borderWidth:
        1,

      borderColor:
        COLOURS.line,

      borderRadius:
        12,

      backgroundColor:
        COLOURS.paperDark,
    },

    methodButton: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        5,
    },

    methodButtonSelected: {
      backgroundColor:
        COLOURS.darkLeather,
    },

    methodText: {
      color:
        COLOURS.leather,

      fontSize:
        11,

      fontWeight:
        '800',

      letterSpacing:
        0.8,
    },

    methodTextSelected: {
      color:
        COLOURS.lightCream,
    },

    methodContent: {
      minHeight:
        174,

      justifyContent:
        'center',

      marginTop:
        11,
    },

    notesGrid: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      justifyContent:
        'center',

      gap:
        8,
    },

    note: {
      width:
        '48%',

      minHeight:
        64,

      flexDirection:
        'row',

      alignItems:
        'center',

      overflow:
        'hidden',

      borderRadius:
        9,

      borderWidth:
        1,

      borderColor:
        'rgba(255,255,255,0.68)',

      paddingHorizontal:
        10,

      shadowColor:
        '#1C1009',

      shadowOffset: {
        width:
          0,

        height:
          2,
      },

      shadowOpacity:
        0.14,

      shadowRadius:
        3,

      elevation:
        2,
    },

    notePressed: {
      opacity:
        0.72,

      transform: [
        {
          translateY:
            1,
        },
      ],
    },

    noteMark: {
      width:
        24,

      height:
        24,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1.5,

      borderColor:
        '#FFFFFF',

      borderRadius:
        12,
    },

    noteMarkText: {
      color:
        '#FFFFFF',

      fontSize:
        11,

      fontWeight:
        '900',
    },

    noteValue: {
      flex:
        1,

      minWidth:
        0,

      color:
        '#FFFFFF',

      fontSize:
        18,

      fontWeight:
        '900',

      marginLeft:
        8,
    },

    noteBrand: {
      color:
        'rgba(255,255,255,0.9)',

      fontSize:
        6.5,

      fontWeight:
        '800',

      letterSpacing:
        0.6,
    },

    coinGrid: {
      minHeight:
        174,

      flexDirection:
        'row',

      flexWrap:
        'wrap',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        7,
    },

    coinSlot: {
      width:
        '23%',

      height:
        78,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    coin: {
      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',

      shadowColor:
        '#211209',

      shadowOffset: {
        width:
          0,

        height:
          2,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        3,

      elevation:
        2,
    },

    coinShape: {
      position:
        'absolute',

      top:
        0,

      left:
        0,
    },

    coinContent: {
      position:
        'absolute',

      top:
        0,

      right:
        0,

      bottom:
        0,

      left:
        0,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        3,
    },

    coinPressed: {
      opacity:
        0.72,

      transform: [
        {
          scale:
            0.96,
        },
      ],
    },

    coinValue: {
      width:
        '100%',

      color:
        COLOURS.ink,

      fontSize:
        12,

      fontWeight:
        '900',

      textAlign:
        'center',
    },

    coinMark: {
      color:
        COLOURS.ink,

      fontSize:
        8,

      fontWeight:
        '900',

      marginTop:
        1,
    },

    keypad: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap:
        7,
    },

    key: {
      width:
        '31%',

      minHeight:
        47,

      flexGrow:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderColor:
        COLOURS.line,

      borderRadius:
        10,

      backgroundColor:
        COLOURS.paperDark,
    },

    keyPressed: {
      backgroundColor:
        '#E1D4C2',

      transform: [
        {
          scale:
            0.98,
        },
      ],
    },

    keyText: {
      color:
        COLOURS.ink,

      fontSize:
        19,

      fontWeight:
        '700',
    },

    keyUtilityText: {
      color:
        COLOURS.leather,

      fontSize:
        15,

      fontWeight:
        '800',
    },

    emptyMethodText: {
      color:
        FALLBACK_COLOURS.mutedText,

      fontSize:
        12,

      lineHeight:
        18,

      textAlign:
        'center',

      paddingHorizontal:
        30,
    },

    noBalanceText: {
      color:
        FALLBACK_COLOURS.mutedText,

      fontSize:
        12,

      lineHeight:
        18,

      textAlign:
        'center',

      paddingHorizontal:
        30,

      marginBottom:
        11,
    },

    maximumHintText: {
      color:
        COLOURS.copperDark,

      fontSize:
        11,

      fontWeight:
        '800',

      letterSpacing:
        0.4,

      textAlign:
        'center',

      marginTop:
        9,
    },

    utilityRow: {
      flexDirection:
        'row',

      gap:
        8,

      marginTop:
        11,
    },

    utilityButton: {
      flex:
        1,

      minHeight:
        38,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderColor:
        COLOURS.copper,

      borderRadius:
        9,

      backgroundColor:
        COLOURS.paper,
    },

    utilityButtonDisabled: {
      opacity:
        0.25,
    },

    utilityText: {
      color:
        COLOURS.leather,

      fontSize:
        9,

      fontWeight:
        '900',

      letterSpacing:
        0.65,
    },

    receiveComposer: {
      width:
        '100%',
    },

    receiveCancelButton: {
      minHeight:
        38,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderColor:
        COLOURS.line,

      borderRadius:
        9,

      marginTop:
        10,

      backgroundColor:
        COLOURS.paper,
    },

    receiveCancelText: {
      color:
        COLOURS.leather,

      fontSize:
        9,

      fontWeight:
        '900',

      letterSpacing:
        0.7,
    },

    pressed: {
      opacity:
        0.65,
    },
  });