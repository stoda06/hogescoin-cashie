import React, {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const COLORS = {
  paper: '#F8F4EA',
  paperRaised: '#FFF9EE',

  leather: '#512B1A',
  leatherDark: '#382015',

  copper: '#B96E32',
  copperLight: '#D49156',
  copperDark: '#79401D',

  ink: '#21120B',
  muted: '#76695F',
  line: '#D5C8B7',

  shadow: '#241107',
};

function formatMoney(amount) {
  return Number(
    amount || 0
  ).toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function shortenAddress(address = '') {
  const cleanAddress =
    String(address).trim();

  if (!cleanAddress) {
    return '';
  }

  if (cleanAddress.length <= 18) {
    return cleanAddress;
  }

  return `${cleanAddress.slice(
    0,
    7
  )}...${cleanAddress.slice(-5)}`;
}

function shortenTransactionId(
  txId = ''
) {
  const cleanTxId =
    String(txId).trim();

  if (!cleanTxId) {
    return '';
  }

  if (cleanTxId.length <= 22) {
    return cleanTxId;
  }

  return `${cleanTxId.slice(
    0,
    9
  )}...${cleanTxId.slice(-7)}`;
}

function getInitials(name = '') {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return 'H';
  }

  return words
    .slice(0, 2)
    .map(word =>
      word
        .charAt(0)
        .toUpperCase()
    )
    .join('');
}

function CostRow({
  label,
  value,
  total = false,
}) {
  return (
    <View style={styles.costRow}>
      <Text
        style={
          total
            ? styles.costTotalLabel
            : styles.costLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          total
            ? styles.costTotalValue
            : styles.costValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

export default function PaymentCompleteScreen({
  recipient = '',
  walletAddress = '',
  requiresName = false,

  amount = 0,
  currencySymbol = '$',
  txId = '',

  networkCostAud = 0,
  swapCostAud = 0,

  isCashiePerson = false,

  onRemember,
  onDone,
}) {
  const [
    remembered,
    setRemembered,
  ] = useState(
    isCashiePerson
  );

  const [
    cashieName,
    setCashieName,
  ] = useState(
    requiresName
      ? ''
      : recipient
  );

  const [
    savedName,
    setSavedName,
  ] = useState(
    isCashiePerson
      ? recipient
      : ''
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const displayAmount =
    formatMoney(amount);

  const cleanName =
    cashieName.trim();

  const displayAddress =
    shortenAddress(
      walletAddress
    );

  const displayTxId =
    shortenTransactionId(
      txId
    );

  const displayRecipient =
    recipient?.trim() ||
    displayAddress ||
    'Recipient';

  const totalCostAud =
    Number(
      networkCostAud || 0
    ) +
    Number(
      swapCostAud || 0
    );

  const shouldOfferSave =
    Boolean(walletAddress) &&
    !remembered;

  function displayCost(value) {
    const numericValue =
      Number(value || 0);

    if (numericValue === 0) {
      return `${currencySymbol}0.00`;
    }

    if (numericValue < 0.01) {
      return `${currencySymbol}${numericValue.toFixed(
        3
      )}`;
    }

    return `${currencySymbol}${numericValue.toFixed(
      2
    )}`;
  }

  useEffect(() => {
    setRemembered(
      isCashiePerson
    );

    setSavedName(
      isCashiePerson
        ? recipient
        : ''
    );
  }, [
    isCashiePerson,
    recipient,
    walletAddress,
  ]);

  useEffect(() => {
    setCashieName(
      requiresName
        ? ''
        : recipient
    );
  }, [
    recipient,
    requiresName,
    walletAddress,
  ]);

  async function handleRemember() {
    if (
      remembered ||
      isSaving ||
      !walletAddress ||
      !cleanName ||
      typeof onRemember !==
        'function'
    ) {
      return;
    }

    setIsSaving(true);

    try {
      await onRemember({
        name: cleanName,
        walletAddress,
        lastPaidAt:
          new Date().toISOString(),
      });

      setSavedName(
        cleanName
      );

      setRemembered(
        true
      );
    } catch (error) {
      console.error(
        'Unable to save Cashie Person:',
        error
      );

      Alert.alert(
        'Unable to save',
        error?.message ||
          'Cashie could not save this person. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.paper
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.successArea
          }
        >
          <View
            style={
              styles.successMedallion
            }
          >
            <View
              style={
                styles.successMedallionInner
              }
            >
              <Text
                style={
                  styles.successTick
                }
              >
                ✓
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            PAID
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Your payment has been sent.
          </Text>
        </View>

        <View style={styles.receipt}>
          <View
            pointerEvents="none"
            style={
              styles.receiptInset
            }
          />

          <Text
            style={
              styles.receiptHeading
            }
          >
            CASHIE RECEIPT
          </Text>

          <View
            style={
              styles.recipientRow
            }
          >
            <View
              style={
                styles.personMedallion
              }
            >
              <Text
                style={
                  styles.personInitials
                }
              >
                {getInitials(
                  displayRecipient
                )}
              </Text>
            </View>

            <View
              style={
                styles.recipientCopy
              }
            >
              <Text
                style={
                  styles.receiptLabel
                }
              >
                PAID TO
              </Text>

              <Text
                numberOfLines={2}
                style={
                  styles.recipient
                }
              >
                {displayRecipient}
              </Text>

              {displayAddress ? (
                <Text
                  numberOfLines={1}
                  style={
                    styles.walletAddress
                  }
                >
                  {displayAddress}
                </Text>
              ) : null}
            </View>
          </View>

          <View
            style={
              styles.divider
            }
          />

          <Text
            style={
              styles.receiptLabel
            }
          >
            AMOUNT
          </Text>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.68}
            style={styles.amount}
          >
            {currencySymbol}
            {displayAmount}
          </Text>

          {displayTxId ? (
            <>
              <View
                style={
                  styles.divider
                }
              />

              <View
                style={
                  styles.transactionRow
                }
              >
                <Text
                  style={
                    styles.transactionLabel
                  }
                >
                  TRANSACTION ID
                </Text>

                <Text
                  numberOfLines={1}
                  style={
                    styles.transactionValue
                  }
                >
                  {displayTxId}
                </Text>
              </View>
            </>
          ) : null}

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.costBreakdown
            }
          >
            <Text
              style={
                styles.costHeading
              }
            >
              ACTUAL COST
            </Text>

            <CostRow
              label="Network"
              value={displayCost(
                networkCostAud
              )}
            />

            {Number(
              swapCostAud || 0
            ) > 0 ? (
              <CostRow
                label="Swap"
                value={displayCost(
                  swapCostAud
                )}
              />
            ) : null}

            <View
              style={
                styles.costDivider
              }
            />

            <CostRow
              label="Total"
              value={displayCost(
                totalCostAud
              )}
              total
            />
          </View>

          <View
            style={
              styles.receiptFooter
            }
          >
            <Text
              style={
                styles.receiptFooterText
              }
            >
              Paid with Cashie
            </Text>

            <Text
              style={
                styles.receiptMark
              }
            >
              H
            </Text>
          </View>
        </View>

        {shouldOfferSave ? (
          <View
            style={
              styles.peoplePanel
            }
          >
            <Text
              style={
                styles.peopleEyebrow
              }
            >
              CASHIE PEOPLE
            </Text>

            <Text
              style={
                styles.peopleTitle
              }
            >
              Name this person
            </Text>

            <Text
              style={
                styles.peopleSubtitle
              }
            >
              Save them for next time.
            </Text>

            <TextInput
              value={cashieName}
              onChangeText={
                setCashieName
              }
              placeholder="Cashie Person"
              placeholderTextColor={
                COLORS.muted
              }
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={
                handleRemember
              }
              style={
                styles.nameInput
              }
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save to Cashie People"
              disabled={
                !cleanName ||
                isSaving
              }
              onPress={
                handleRemember
              }
              style={({ pressed }) => [
                styles.peopleButton,

                (!cleanName ||
                  isSaving) &&
                  styles.peopleButtonDisabled,

                pressed &&
                  cleanName &&
                  !isSaving &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.peopleButtonText
                }
              >
                {isSaving
                  ? 'SAVING...'
                  : 'SAVE TO CASHIE PEOPLE'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {walletAddress &&
        remembered ? (
          <View
            style={
              styles.rememberedPanel
            }
          >
            <View
              style={
                styles.rememberedTick
              }
            >
              <Text
                style={
                  styles.rememberedTickText
                }
              >
                ✓
              </Text>
            </View>

            <Text
              style={
                styles.rememberedText
              }
            >
              {savedName ||
                cleanName ||
                displayRecipient}{' '}
              added to Cashie People
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to wallet"
          onPress={onDone}
          style={({ pressed }) => [
            styles.doneButton,

            pressed &&
              styles.doneButtonPressed,
          ]}
        >
          <Text
            style={
              styles.doneText
            }
          >
            RETURN TO WALLET
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        COLORS.paper,
    },

    screen: {
      flexGrow: 1,

      backgroundColor:
        COLORS.paper,

      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 28,
    },

    successArea: {
      alignItems: 'center',
      marginBottom: 20,
    },

    successMedallion: {
      width: 86,
      height: 86,

      alignItems: 'center',
      justifyContent:
        'center',

      borderRadius: 43,

      borderWidth: 3,
      borderColor:
        COLORS.copperLight,

      backgroundColor:
        COLORS.copper,

      shadowColor:
        COLORS.shadow,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 5,
    },

    successMedallionInner: {
      width: 68,
      height: 68,

      alignItems: 'center',
      justifyContent:
        'center',

      borderRadius: 34,

      borderWidth: 2,
      borderColor:
        COLORS.copperDark,

      backgroundColor:
        COLORS.leatherDark,
    },

    successTick: {
      color:
        COLORS.copperLight,

      fontSize: 40,
      fontWeight: '900',
      lineHeight: 44,
    },

    title: {
      color:
        COLORS.leatherDark,

      fontSize: 28,
      fontWeight: '900',
      letterSpacing: 2,

      marginTop: 13,
    },

    subtitle: {
      color:
        COLORS.muted,

      fontSize: 12,
      marginTop: 4,
    },

    receipt: {
      position: 'relative',
      overflow: 'hidden',

      borderWidth: 1,
      borderColor:
        COLORS.line,

      borderRadius: 18,

      backgroundColor:
        COLORS.paperRaised,

      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: 17,

      shadowColor:
        COLORS.shadow,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.1,
      shadowRadius: 9,
      elevation: 4,
    },

    receiptInset: {
      position: 'absolute',
      top: 8,
      right: 8,
      bottom: 8,
      left: 8,

      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor:
        COLORS.copperLight,

      borderRadius: 12,
      opacity: 0.34,
    },

    receiptHeading: {
      color:
        COLORS.copperDark,

      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.6,

      marginBottom: 17,
    },

    recipientRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    personMedallion: {
      width: 46,
      height: 46,

      alignItems: 'center',
      justifyContent:
        'center',

      borderRadius: 23,

      borderWidth: 2,
      borderColor:
        COLORS.copper,

      backgroundColor:
        COLORS.leatherDark,

      marginRight: 13,
    },

    personInitials: {
      color:
        COLORS.copperLight,

      fontSize: 13,
      fontWeight: '800',
    },

    recipientCopy: {
      flex: 1,
    },

    receiptLabel: {
      color:
        COLORS.copperDark,

      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.25,
    },

    recipient: {
      color:
        COLORS.ink,

      fontSize: 19,
      lineHeight: 23,
      fontWeight: '800',

      marginTop: 3,
    },

    walletAddress: {
      color:
        COLORS.muted,

      fontSize: 10,
      marginTop: 3,
    },

    divider: {
      height: 1,
      backgroundColor:
        COLORS.line,

      marginVertical: 18,
    },

    amount: {
      color:
        COLORS.leatherDark,

      fontSize: 39,
      fontWeight: '900',
      letterSpacing: -0.8,

      marginTop: 5,
    },

    transactionRow: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',

      gap: 14,
    },

    transactionLabel: {
      color:
        COLORS.muted,

      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.8,
    },

    transactionValue: {
      flex: 1,

      color:
        COLORS.ink,

      fontSize: 10,
      fontWeight: '700',
      textAlign: 'right',
    },

    costBreakdown: {
      gap: 10,
    },

    costHeading: {
      color:
        COLORS.copperDark,

      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.2,

      marginBottom: 2,
    },

    costRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    costLabel: {
      color:
        COLORS.muted,

      fontSize: 10,
    },

    costValue: {
      color:
        COLORS.ink,

      fontSize: 11,
      fontWeight: '700',
    },

    costDivider: {
      height: 1,
      backgroundColor:
        COLORS.line,

      marginVertical: 2,
    },

    costTotalLabel: {
      color:
        COLORS.leatherDark,

      fontSize: 11,
      fontWeight: '900',
    },

    costTotalValue: {
      color:
        COLORS.copperDark,

      fontSize: 13,
      fontWeight: '900',
    },

    receiptFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      marginTop: 19,
    },

    receiptFooterText: {
      color:
        COLORS.muted,

      fontSize: 9,
      fontWeight: '600',
    },

    receiptMark: {
      color:
        COLORS.copperDark,

      fontSize: 17,
      fontWeight: '900',
    },

    peoplePanel: {
      borderWidth: 1,
      borderColor:
        COLORS.line,

      borderRadius: 15,

      backgroundColor:
        COLORS.paperRaised,

      padding: 16,
      marginTop: 14,
    },

    peopleEyebrow: {
      color:
        COLORS.copperDark,

      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.2,

      marginBottom: 6,
    },

    peopleTitle: {
      color:
        COLORS.leatherDark,

      fontSize: 18,
      fontWeight: '800',
    },

    peopleSubtitle: {
      color:
        COLORS.muted,

      fontSize: 10,
      marginTop: 3,
      marginBottom: 12,
    },

    nameInput: {
      minHeight: 48,

      borderWidth: 1,
      borderColor:
        COLORS.line,

      borderRadius: 10,

      backgroundColor:
        COLORS.paper,

      color:
        COLORS.ink,

      fontSize: 14,
      paddingHorizontal: 13,
    },

    peopleButton: {
      minHeight: 44,

      alignItems: 'center',
      justifyContent:
        'center',

      borderRadius: 10,

      backgroundColor:
        COLORS.copper,

      marginTop: 9,
    },

    peopleButtonDisabled: {
      opacity: 0.3,
    },

    peopleButtonText: {
      color:
        COLORS.leatherDark,

      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.65,
    },

    rememberedPanel: {
      minHeight: 52,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 1,
      borderColor:
        COLORS.line,

      borderRadius: 13,

      backgroundColor:
        COLORS.paperRaised,

      marginTop: 14,
      paddingHorizontal: 14,
    },

    rememberedTick: {
      width: 24,
      height: 24,

      alignItems: 'center',
      justifyContent:
        'center',

      borderRadius: 12,

      backgroundColor:
        COLORS.copper,

      marginRight: 8,
    },

    rememberedTickText: {
      color:
        COLORS.leatherDark,

      fontSize: 13,
      fontWeight: '900',
    },

    rememberedText: {
      flex: 1,

      color:
        COLORS.leatherDark,

      fontSize: 12,
      fontWeight: '800',
      lineHeight: 17,
    },

    doneButton: {
      minHeight: 56,

      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 1,
      borderColor:
        COLORS.copperLight,

      borderRadius: 13,

      backgroundColor:
        COLORS.copper,

      marginTop: 16,

      shadowColor:
        COLORS.shadow,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 4,
    },

    doneButtonPressed: {
      opacity: 0.76,

      transform: [
        {
          translateY: 1,
        },
      ],
    },

    doneText: {
      color:
        COLORS.leatherDark,

      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.8,
    },

    pressed: {
      opacity: 0.65,
    },
  });