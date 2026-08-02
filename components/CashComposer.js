import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  AUD_COINS,
  AUD_NOTES,
  CASHIE_COLOURS,
} from '../utils/constants.js';

const MAX_AMOUNT_CENTS = 99999999;

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

  // CASHIE_COLOURS.mutedText is a light tan designed for
  // dark leather backgrounds; this composer renders its
  // muted text on pale paper, so keep the dark fallback.
  mutedText:
    FALLBACK_COLOURS.mutedText,
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

function normaliseCents(
  amount
) {
  return Math.max(
    0,
    Math.round(
      Number(amount || 0) *
        100
    )
  );
}

function formatAmount(
  cents
) {
  return (
    Number(cents || 0) /
    100
  ).toLocaleString(
    'en-AU',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
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
      onPress={onPress}
      style={({ pressed }) => [
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
  onKeyPress,
}) {
  return (
    <View
      style={styles.keypad}
    >
      {KEYPAD_KEYS.map(key => (
        <Pressable
          key={key}
          accessibilityRole="button"
          accessibilityLabel={
            key === 'C'
              ? 'Clear amount'
              : key === '⌫'
                ? 'Delete last digit'
                : key
          }
          onPress={() =>
            onKeyPress(key)
          }
          style={({ pressed }) => [
            styles.key,

            pressed &&
              styles.keyPressed,
          ]}
        >
          <Text
            style={[
              styles.keyText,

              (key === 'C' ||
                key === '⌫') &&
                styles.keyUtilityText,
            ]}
          >
            {key}
          </Text>
        </Pressable>
      ))}
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
      accessibilityLabel={`Add ${note.label}`}
      onPress={onPress}
      style={({ pressed }) => [
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
        style={styles.noteMark}
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

function CoinButton({
  coin,
  onPress,
}) {
  return (
    <View
      style={styles.coinSlot}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add ${coin.label}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.coin,

          {
            width: coin.size,
            height: coin.size,
            borderRadius:
              coin.size / 2,
          },

          coin.type ===
            'gold' &&
            styles.goldCoin,

          coin.type ===
            'silver' &&
            styles.silverCoin,

          coin.type ===
            'copper' &&
            styles.copperCoin,

          pressed &&
            styles.coinPressed,
        ]}
      >
        <Text
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
      </Pressable>
    </View>
  );
}

export default function CashComposer({
  mode = 'pay',
  amount = 0,
  maximumAmount = 0,
  currencySymbol = '$',
  onAmountChange,
  onCancel,
}) {
  const isReceive =
    mode === 'receive';

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
  ] = useState('');

  const [
    denominationHistory,
    setDenominationHistory,
  ] = useState([]);

  const [
    showMaximumHint,
    setShowMaximumHint,
  ] = useState(false);

  const amountCents =
    normaliseCents(amount);

  const maximumCents =
    Math.min(
      normaliseCents(
        maximumAmount
      ),
      MAX_AMOUNT_CENTS
    );

  const remainingCents =
    Math.max(
      maximumCents -
        amountCents,
      0
    );

  const noBalance =
    maximumCents === 0;

  useEffect(() => {
    if (!showMaximumHint) {
      return undefined;
    }

    const timer =
      setTimeout(
        () =>
          setShowMaximumHint(
            false
          ),
        1600
      );

    return () =>
      clearTimeout(timer);
  }, [showMaximumHint]);

  useEffect(() => {
    if (isReceive) {
      setActiveMethod(
        'keypad'
      );
    }
  }, [isReceive]);

  useEffect(() => {
    const externalDigits =
      amountCents > 0
        ? String(
            amountCents
          )
        : '';

    setKeypadDigits(
      externalDigits
    );
  }, [amountCents]);

  const notes = useMemo(() => {
    const suppliedNotes =
      Array.isArray(
        AUD_NOTES
      )
        ? AUD_NOTES
        : [];

    const defaults = [
      {
        label: '$100',
        value: 10000,
        colour: '#73845A',
      },
      {
        label: '$50',
        value: 5000,
        colour: '#D5A83E',
      },
      {
        label: '$20',
        value: 2000,
        colour: '#C96558',
      },
      {
        label: '$10',
        value: 1000,
        colour: '#548FA8',
      },
      {
        label: '$5',
        value: 500,
        colour: '#9B7598',
      },
    ];

    return defaults.map(
      defaultNote => {
        const supplied =
          suppliedNotes.find(
            note =>
              Number(
                note.value
              ) ===
              defaultNote.value
          );

        return {
          ...defaultNote,
          ...supplied,

          colour:
            supplied?.colour ||
            defaultNote.colour,
        };
      }
    );
  }, []);

  const coins = useMemo(() => {
    const suppliedCoins =
      Array.isArray(
        AUD_COINS
      )
        ? AUD_COINS
        : [];

    const defaults = [
      {
        label: '$2',
        value: 200,
        type: 'gold',
        size: 58,
      },
      {
        label: '$1',
        value: 100,
        type: 'gold',
        size: 52,
      },
      {
        label: '50c',
        value: 50,
        type: 'silver',
        size: 60,
      },
      {
        label: '20c',
        value: 20,
        type: 'silver',
        size: 52,
      },
      {
        label: '10c',
        value: 10,
        type: 'silver',
        size: 44,
      },
      {
        label: '5c',
        value: 5,
        type: 'silver',
        size: 40,
      },
      {
        label: '2c',
        value: 2,
        type: 'copper',
        size: 36,
      },
      {
        label: '1c',
        value: 1,
        type: 'copper',
        size: 32,
      },
    ];

    return defaults.map(
      defaultCoin => {
        const supplied =
          suppliedCoins.find(
            coin =>
              Number(
                coin.value
              ) ===
              defaultCoin.value
          );

        return {
          ...defaultCoin,
          ...supplied,

          type:
            supplied?.type ||
            defaultCoin.type,

          size:
            supplied?.size ||
            defaultCoin.size,
        };
      }
    );
  }, []);

  const visibleNotes =
    notes.filter(
      note =>
        Number(
          note.value
        ) <=
        remainingCents
    );

  const visibleCoins =
    coins.filter(
      coin =>
        Number(
          coin.value
        ) <=
        remainingCents
    );

  function publishCents(
    nextCents
  ) {
    const safeCents =
      Math.max(
        0,
        Math.min(
          Number(
            nextCents
          ) || 0,
          maximumCents,
          MAX_AMOUNT_CENTS
        )
      );

    onAmountChange?.(
      safeCents / 100
    );
  }

  function selectMethod(
    method
  ) {
    setActiveMethod(
      method
    );

    setKeypadDigits(
      amountCents > 0
        ? String(
            amountCents
          )
        : ''
    );
  }

  function addDenomination(
    value
  ) {
    const denomination =
      Number(value) || 0;

    if (denomination <= 0) {
      return;
    }

    if (
      denomination >
      remainingCents
    ) {
      setShowMaximumHint(
        true
      );

      return;
    }

    const nextCents =
      amountCents +
      denomination;

    setDenominationHistory(
      current => [
        ...current,
        denomination,
      ]
    );

    setKeypadDigits(
      String(nextCents)
    );

    publishCents(
      nextCents
    );
  }

  function clearAmount() {
    setDenominationHistory(
      []
    );

    setKeypadDigits('');

    publishCents(0);
  }

  function deleteLastDigit() {
    const currentDigits =
      keypadDigits ||
      (
        amountCents > 0
          ? String(
              amountCents
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

    publishCents(
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
      currentDigits === '0'
        ? digit
        : `${currentDigits}${digit}`;

    const nextCents =
      Number(nextDigits);

    if (
      !Number.isFinite(
        nextCents
      )
    ) {
      return;
    }

    if (
      nextCents >
        maximumCents ||
      nextCents >
        MAX_AMOUNT_CENTS
    ) {
      setShowMaximumHint(
        true
      );

      return;
    }

    setDenominationHistory(
      []
    );

    setKeypadDigits(
      nextDigits
    );

    publishCents(
      nextCents
    );
  }

  function handleKeyPress(
    key
  ) {
    if (key === 'C') {
      clearAmount();
      return;
    }

    if (key === '⌫') {
      deleteLastDigit();
      return;
    }

    enterDigit(key);
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

    const nextCents =
      Math.max(
        amountCents -
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
      nextCents > 0
        ? String(nextCents)
        : ''
    );

    publishCents(
      nextCents
    );
  }

  function handleCancel() {
    clearAmount();
    onCancel?.();
  }

  if (isReceive) {
    return (
      <View
        style={
          styles.receiveComposer
        }
      >
        <Keypad
          onKeyPress={
            handleKeyPress
          }
        />

        {showMaximumHint && (
          <Text
            style={
              styles.limitHintText
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
          style={({ pressed }) => [
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
      style={styles.composer}
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
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={
            styles.paymentAmount
          }
        >
          {currencySymbol}
          {formatAmount(
            amountCents
          )}
        </Text>
      </View>

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
                    note={note}
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
                {noBalance
                  ? 'No balance available to pay from.'
                  : 'Use coins or the keypad for the remaining amount.'}
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
                    coin={coin}
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
                {noBalance
                  ? 'No balance available to pay from.'
                  : 'Use the keypad for the remaining amount.'}
              </Text>
            )}
          </View>
        )}

        {activeMethod ===
          'keypad' && (
          <Keypad
            onKeyPress={
              handleKeyPress
            }
          />
        )}
      </View>

      {noBalance &&
      activeMethod ===
        'keypad' ? (
        <Text
          style={
            styles.noBalanceText
          }
        >
          No balance available to
          pay from.
        </Text>
      ) : showMaximumHint ? (
        <Text
          style={
            styles.limitHintText
          }
        >
          Maximum reached
        </Text>
      ) : null}

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
          style={({ pressed }) => [
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
            amountCents === 0
          }
          onPress={
            clearAmount
          }
          style={({ pressed }) => [
            styles.utilityButton,

            amountCents ===
              0 &&
              styles.utilityButtonDisabled,

            pressed &&
              amountCents >
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
          style={({ pressed }) => [
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
    </View>
  );
}

const styles =
  StyleSheet.create({
    composer: {
      width: '100%',
    },

    paymentHeading: {
      alignItems: 'center',
      paddingHorizontal: 10,
      marginBottom: 11,
    },

    paymentLabel: {
      color:
        COLOURS.leather,

      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.25,
    },

    paymentAmount: {
      width: '100%',

      color:
        COLOURS.ink,

      fontSize: 34,
      fontWeight: '700',
      letterSpacing: -0.5,
      textAlign: 'center',

      marginTop: 2,
    },

    methodSelector: {
      minHeight: 44,

      flexDirection: 'row',

      overflow: 'hidden',

      borderWidth: 1,
      borderColor:
        COLOURS.line,

      borderRadius: 12,

      backgroundColor:
        COLOURS.paperDark,
    },

    methodButton: {
      flex: 1,

      alignItems: 'center',
      justifyContent:
        'center',

      paddingHorizontal: 5,
    },

    methodButtonSelected: {
      backgroundColor:
        COLOURS.darkLeather,
    },

    methodText: {
      color:
        COLOURS.leather,

      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
    },

    methodTextSelected: {
      color:
        COLOURS.lightCream,
    },

    methodContent: {
      minHeight: 174,

      justifyContent:
        'center',

      marginTop: 11,
    },

    notesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',

      justifyContent:
        'center',

      gap: 8,
    },

    note: {
      width: '48%',
      minHeight: 64,

      flexDirection: 'row',
      alignItems: 'center',

      overflow: 'hidden',

      borderRadius: 9,

      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.68)',

      paddingHorizontal: 10,

      shadowColor:
        '#1C1009',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.14,
      shadowRadius: 3,
      elevation: 2,
    },

    notePressed: {
      opacity: 0.72,

      transform: [
        {
          translateY: 1,
        },
      ],
    },

    noteMark: {
      width: 24,
      height: 24,

      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 1.5,
      borderColor:
        '#FFFFFF',

      borderRadius: 12,
    },

    noteMarkText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
    },

    noteValue: {
      flex: 1,

      color: '#FFFFFF',

      fontSize: 18,
      fontWeight: '900',

      marginLeft: 8,
    },

    noteBrand: {
      color:
        'rgba(255,255,255,0.9)',

      fontSize: 6.5,
      fontWeight: '800',
      letterSpacing: 0.6,
    },

    coinGrid: {
      minHeight: 174,

      flexDirection: 'row',
      flexWrap: 'wrap',

      alignItems: 'center',
      justifyContent:
        'center',

      gap: 7,
    },

    coinSlot: {
      width: '23%',
      height: 78,

      alignItems: 'center',
      justifyContent:
        'center',
    },

    coin: {
      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 3,

      shadowColor:
        '#211209',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.18,
      shadowRadius: 3,
      elevation: 2,
    },

    coinPressed: {
      opacity: 0.72,

      transform: [
        {
          scale: 0.96,
        },
      ],
    },

    goldCoin: {
      backgroundColor:
        '#C99A35',

      borderColor:
        '#F0D27A',
    },

    silverCoin: {
      backgroundColor:
        '#A8ADB1',

      borderColor:
        '#E0E3E5',
    },

    copperCoin: {
      backgroundColor:
        '#A85D38',

      borderColor:
        '#D99068',
    },

    coinValue: {
      color:
        COLOURS.ink,

      fontSize: 12,
      fontWeight: '900',
    },

    coinMark: {
      color:
        COLOURS.ink,

      fontSize: 8,
      fontWeight: '900',

      marginTop: 1,
    },

    keypad: {
      flexDirection: 'row',
      flexWrap: 'wrap',

      gap: 7,
    },

    key: {
      width: '31%',
      minHeight: 47,

      flexGrow: 1,

      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 1,
      borderColor:
        COLOURS.line,

      borderRadius: 10,

      backgroundColor:
        COLOURS.paperDark,
    },

    keyPressed: {
      backgroundColor:
        '#E1D4C2',

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    keyText: {
      color:
        COLOURS.ink,

      fontSize: 19,
      fontWeight: '700',
    },

    keyUtilityText: {
      color:
        COLOURS.leather,

      fontSize: 15,
      fontWeight: '800',
    },

    emptyMethodText: {
      color:
        COLOURS.mutedText,

      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',

      paddingHorizontal: 30,
    },

    noBalanceText: {
      color:
        COLOURS.mutedText,

      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',

      marginTop: 9,

      paddingHorizontal: 30,
    },

    limitHintText: {
      color:
        COLOURS.leather,

      fontSize: 12,
      lineHeight: 18,
      fontWeight: '700',
      textAlign: 'center',

      marginTop: 9,
    },

    utilityRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 11,
    },

    utilityButton: {
      flex: 1,
      minHeight: 38,

      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 1,
      borderColor:
        COLOURS.copper,

      borderRadius: 9,

      backgroundColor:
        COLOURS.paper,
    },

    utilityButtonDisabled: {
      opacity: 0.25,
    },

    utilityText: {
      color:
        COLOURS.leather,

      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.65,
    },

    receiveComposer: {
      width: '100%',
    },

    receiveCancelButton: {
      minHeight: 38,

      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 1,
      borderColor:
        COLOURS.line,

      borderRadius: 9,

      marginTop: 10,

      backgroundColor:
        COLOURS.paper,
    },

    receiveCancelText: {
      color:
        COLOURS.leather,

      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.7,
    },

    pressed: {
      opacity: 0.65,
    },
  });