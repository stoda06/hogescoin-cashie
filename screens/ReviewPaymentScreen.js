import React, {
  useState,
} from 'react';

import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const COLORS = {
  paper: '#F8F4EA',
  paperRaised: '#FFF9EE',
  paperDark: '#EFE8DA',

  leather: '#512B1A',
  leatherDark: '#382015',

  copper: '#B96E32',
  copperLight: '#D49156',
  copperDark: '#79401D',

  ink: '#21120B',
  muted: '#76695F',
  line: '#D5C8B7',

  cream: '#F8EBD2',
  white: '#FFFDF8',

  shadow: '#241107',
};

function formatAmount(
  amount
) {
  return Number(
    amount || 0
  ).toLocaleString(
    'en-AU',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

function shortenAddress(
  address = ''
) {
  const cleanAddress =
    String(address).trim();

  if (!cleanAddress) {
    return '';
  }

  if (
    cleanAddress.length <= 18
  ) {
    return cleanAddress;
  }

  return `${cleanAddress.slice(
    0,
    7
  )}...${cleanAddress.slice(
    -5
  )}`;
}

function PersonMedallion({
  name = '',
}) {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word =>
      word
        .charAt(0)
        .toUpperCase()
    )
    .join('');

  return (
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
        {initials || 'H'}
      </Text>
    </View>
  );
}

export default function ReviewPaymentScreen({
  recipient = 'Recipient',
  walletAddress = '',
  amount = 0,
  currencySymbol = '$',
  onPay,
  onBack,
}) {
  const [
    isPaying,
    setIsPaying,
  ] = useState(false);

  const displayAmount =
    formatAmount(amount);

  const displayAddress =
    shortenAddress(
      walletAddress
    );

  function handlePay() {
    if (isPaying) {
      return;
    }

    setIsPaying(true);

    onPay?.();
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

      <View
        style={styles.screen}
      >
        <View
          style={styles.header}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={({ pressed }) => [
              styles.headerBackButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.headerBackIcon
              }
            >
              ‹
            </Text>
          </Pressable>

          <View
            style={
              styles.headerCopy
            }
          >
            <Text
              style={
                styles.title
              }
            >
              REVIEW PAYMENT
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Check everything before you pay
            </Text>
          </View>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <View
          style={
            styles.headerDivider
          }
        />

        <View
          style={styles.content}
        >
          <View
            style={
              styles.reviewSlip
            }
          >
            <View
              pointerEvents="none"
              style={
                styles.reviewSlipInset
              }
            />

            <Text
              style={
                styles.sectionLabel
              }
            >
              YOU ARE PAYING
            </Text>

            <View
              style={
                styles.recipientRow
              }
            >
              <PersonMedallion
                name={recipient}
              />

              <View
                style={
                  styles.recipientCopy
                }
              >
                <Text
                  numberOfLines={2}
                  style={
                    styles.recipient
                  }
                >
                  {recipient}
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
                styles.slipDivider
              }
            />

            <Text
              style={
                styles.sectionLabel
              }
            >
              PAYMENT AMOUNT
            </Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.68}
              style={
                styles.amount
              }
            >
              {currencySymbol}
              {displayAmount}
            </Text>

            <View
              style={
                styles.amountUnderline
              }
            />

            <View
              style={
                styles.paymentSummary
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                Paid with
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                Cashie
              </Text>
            </View>
          </View>

          <View
            style={styles.notice}
          >
            <View
              style={
                styles.noticeMark
              }
            >
              <Text
                style={
                  styles.noticeMarkText
                }
              >
                !
              </Text>
            </View>

            <Text
              style={
                styles.noticeText
              }
            >
              Payments cannot be reversed once sent.
            </Text>
          </View>

          <View
            style={styles.footer}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back and change payment"
              onPress={onBack}
              style={({ pressed }) => [
                styles.backButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.backText
                }
              >
                BACK
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Pay ${currencySymbol}${displayAmount}`}
              accessibilityState={{
                disabled: isPaying,
              }}
              disabled={isPaying}
              onPress={handlePay}
              style={({ pressed }) => [
                styles.payButton,

                pressed &&
                  styles.payButtonPressed,

                isPaying &&
                  styles.payButtonDisabled,
              ]}
            >
              <Text
                style={
                  styles.payButtonLabel
                }
              >
                PAY WITH CASHIE
              </Text>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={
                  styles.payButtonAmount
                }
              >
                {currencySymbol}
                {displayAmount}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
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
      flex: 1,
      backgroundColor:
        COLORS.paper,
    },

    header: {
      minHeight: 76,

      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 14,
      paddingTop: 5,
    },

    headerBackButton: {
      width: 42,
      height: 42,

      alignItems: 'center',
      justifyContent:
        'center',

      borderRadius: 21,
    },

    headerBackIcon: {
      color:
        COLORS.leatherDark,

      fontSize: 38,
      fontWeight: '300',
      lineHeight: 40,
    },

    headerCopy: {
      flex: 1,
      alignItems: 'center',
    },

    title: {
      color:
        COLORS.leatherDark,

      fontSize: 17,
      fontWeight: '900',
      letterSpacing: 0.85,
      textAlign: 'center',
    },

    subtitle: {
      color:
        COLORS.muted,

      fontSize: 10,
      lineHeight: 14,
      textAlign: 'center',

      marginTop: 4,
    },

    headerSpacer: {
      width: 42,
      height: 42,
    },

    headerDivider: {
      height: 1,
      backgroundColor:
        COLORS.line,

      marginHorizontal: 18,
    },

    content: {
      flex: 1,

      justifyContent:
        'space-between',

      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 24,
    },

    reviewSlip: {
      position: 'relative',
      overflow: 'hidden',

      borderWidth: 1,
      borderColor:
        COLORS.line,

      borderRadius: 18,

      backgroundColor:
        COLORS.paperRaised,

      paddingHorizontal: 22,
      paddingTop: 25,
      paddingBottom: 21,

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

    reviewSlipInset: {
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
      opacity: 0.35,
    },

    sectionLabel: {
      color:
        COLORS.copperDark,

      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.45,
    },

    recipientRow: {
      flexDirection: 'row',
      alignItems: 'center',

      marginTop: 13,
    },

    personMedallion: {
      width: 48,
      height: 48,

      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 2,
      borderColor:
        COLORS.copper,

      borderRadius: 24,

      backgroundColor:
        COLORS.leatherDark,

      marginRight: 14,

      shadowColor:
        COLORS.shadow,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 3,
    },

    personInitials: {
      color:
        COLORS.copperLight,

      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.4,
    },

    recipientCopy: {
      flex: 1,
    },

    recipient: {
      color:
        COLORS.ink,

      fontSize: 22,
      lineHeight: 27,
      fontWeight: '800',
    },

    walletAddress: {
      color:
        COLORS.muted,

      fontSize: 11,
      letterSpacing: 0.2,

      marginTop: 4,
    },

    slipDivider: {
      height: 1,
      backgroundColor:
        COLORS.line,

      marginVertical: 23,
    },

    amount: {
      width: '100%',

      color:
        COLORS.leatherDark,

      fontSize: 46,
      fontWeight: '800',
      letterSpacing: -1.1,

      marginTop: 7,
    },

    amountUnderline: {
      width: 58,
      height: 3,

      borderRadius: 2,

      backgroundColor:
        COLORS.copper,

      marginTop: 11,
    },

    paymentSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      marginTop: 24,
    },

    summaryLabel: {
      color:
        COLORS.muted,

      fontSize: 11,
    },

    summaryValue: {
      color:
        COLORS.leatherDark,

      fontSize: 12,
      fontWeight: '800',
    },

    notice: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',

      paddingHorizontal: 16,
      paddingVertical: 18,
    },

    noticeMark: {
      width: 25,
      height: 25,

      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 1.5,
      borderColor:
        COLORS.copper,

      borderRadius: 13,

      marginRight: 9,
    },

    noticeMarkText: {
      color:
        COLORS.copperDark,

      fontSize: 13,
      fontWeight: '900',
    },

    noticeText: {
      flexShrink: 1,

      color:
        COLORS.muted,

      fontSize: 11,
      lineHeight: 16,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'stretch',

      gap: 11,
    },

    backButton: {
      minWidth: 84,
      minHeight: 62,

      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 1,
      borderColor:
        COLORS.line,

      borderRadius: 13,

      backgroundColor:
        COLORS.paperRaised,
    },

    backText: {
      color:
        COLORS.leatherDark,

      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },

    payButton: {
      flex: 1,
      minHeight: 62,

      alignItems: 'center',
      justifyContent:
        'center',

      borderWidth: 1,
      borderColor:
        COLORS.copperLight,

      borderRadius: 13,

      backgroundColor:
        COLORS.copper,

      paddingHorizontal: 16,

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

    payButtonPressed: {
      opacity: 0.76,

      transform: [
        {
          translateY: 1,
        },
      ],
    },

    payButtonDisabled: {
      opacity: 0.5,
    },

    payButtonLabel: {
      color:
        COLORS.leatherDark,

      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
    },

    payButtonAmount: {
      color:
        COLORS.leatherDark,

      fontSize: 20,
      fontWeight: '900',

      marginTop: 2,
    },

    pressed: {
      opacity: 0.65,
    },
  });