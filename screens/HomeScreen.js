import {
  useState,
} from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CashieBottomNavigation from '../components/CashieBottomNavigation.js';
import CashieCard from '../components/CashieCard.js';
import CashComposer from '../components/CashComposer.js';

import {
  TEST_ADDRESS,
} from '../utils/constants.js';

const MAXIMUM_RECEIVE_AMOUNT =
  999999.99;

const COLORS = {
  paper: '#F8F4EA',
  paperDark: '#EFE8DA',

  leather: '#6E3215',
  leatherDark: '#4B210E',
  leatherDeep: '#2D170E',

  copper: '#A75B2A',
  copperLight: '#C98047',
  copperDark: '#78401E',

  ink: '#1E1712',
  muted: '#6F675F',
  line: '#CFC5B6',
  white: '#FFFDF8',
};

export default function HomeScreen({
  wallet,
  walletName = '',
  hogesAudPrice,
  requestedAmount = 0,

  currencyCode = 'AUD',
  currencySymbol = '$',

  onPayAmount,
  onReceiveAmount,

  onOpenPeople,
  onPeople,

  onOpenMerchant,
  onMerchant,

  onOpenDashie,
  onDashboard,

  onOpenSettings,
  onSettings,

  onOpenCurrency,
  onCurrencyPress,

  onHome,
}) {
  const [
    amountMode,
    setAmountMode,
  ] = useState(
    null
  );

  const [
    composedAmount,
    setComposedAmount,
  ] = useState(
    0
  );

  const [
    cardSide,
    setCardSide,
  ] = useState(
    'pay'
  );

  const cashieBalance =
    Number(
      wallet?.hogesBalance ||
        0
    ) *
    Number(
      hogesAudPrice ||
        0
    );

  const displayedCashieBalance =
    amountMode ===
    'pay'
      ? Math.max(
          cashieBalance -
            composedAmount,
          0
        )
      : cashieBalance;

  const amountPanelOpen =
    amountMode !==
    null;

  const peopleCallback =
    onOpenPeople ||
    onPeople;

  const merchantCallback =
    onOpenMerchant ||
    onMerchant;

  const dashieCallback =
    onOpenDashie ||
    onDashboard;

  const settingsCallback =
    onOpenSettings ||
    onSettings;

  const currencyCallback =
    onOpenCurrency ||
    onCurrencyPress;

  function openAmountPanel(
    mode
  ) {
    const startingAmount =
      mode ===
      'receive'
        ? Number(
            requestedAmount ||
              0
          )
        : 0;

    setComposedAmount(
      startingAmount
    );

    setAmountMode(
      mode
    );
  }

  function closeAmountPanel() {
    setComposedAmount(
      0
    );

    setAmountMode(
      null
    );
  }

  function flipCard() {
    closeAmountPanel();

    setCardSide(
      currentSide =>
        currentSide ===
        'pay'
          ? 'receive'
          : 'pay'
    );
  }

  function handleAmountContinue() {
    if (
      composedAmount <=
      0
    ) {
      return;
    }

    if (
      amountMode ===
      'pay'
    ) {
      onPayAmount?.(
        composedAmount
      );
    }

    if (
      amountMode ===
      'receive'
    ) {
      onReceiveAmount?.(
        composedAmount
      );
    }

    closeAmountPanel();
  }

  function maximumForMode() {
    if (
      amountMode ===
      'pay'
    ) {
      return cashieBalance;
    }

    if (
      amountMode ===
      'receive'
    ) {
      return MAXIMUM_RECEIVE_AMOUNT;
    }

    return 0;
  }

  function continueButtonText() {
    if (
      amountMode ===
      'pay'
    ) {
      return 'CONTINUE TO PAY';
    }

    if (
      amountMode ===
      'receive'
    ) {
      return 'UPDATE AMOUNT';
    }

    return 'CONTINUE';
  }

  function handleCashiePress() {
    closeAmountPanel();

    setCardSide(
      'pay'
    );

    onHome?.();
  }

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.paper
        }
      />

      <View
        style={
          styles.screen
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          <View
            style={
              styles.brandHeader
            }
          >
            <View
              style={
                styles.brandCopy
              }
            >
              <Text
                style={
                  styles.brandTitle
                }
              >
                CASHIE
              </Text>

              <Text
                style={
                  styles.brandTagline
                }
              >
                Another way to pay
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                cardSide ===
                'pay'
                  ? 'Flip to receive side'
                  : 'Flip back to pay side'
              }
              onPress={
                flipCard
              }
              style={({
                pressed,
              }) => [
                styles.flipButton,

                pressed &&
                  styles.flipButtonPressed,
              ]}
            >
              <View
                style={
                  styles.flipButtonInner
                }
              >
                <Text
                  style={
                    styles.flipIcon
                  }
                >
                  ↻
                </Text>
              </View>
            </Pressable>
          </View>

          <View
            style={
              styles.brandDivider
            }
          />

          <View
            style={
              styles.walletCardArea
            }
          >
            <CashieCard
              side={
                cardSide
              }
              walletName={
                walletName
              }
              walletAddress={
                TEST_ADDRESS
              }
              cashieBalance={
                displayedCashieBalance
              }
              currencyCode={
                currencyCode
              }
              currencySymbol={
                currencySymbol
              }
              onCurrencyPress={
                currencyCallback
              }
              requestedAmount={
                amountMode ===
                'receive'
                  ? composedAmount
                  : requestedAmount
              }
              onPay={() =>
                openAmountPanel(
                  'pay'
                )
              }
              onMerchant={
                merchantCallback
              }
              onAddAmount={() =>
                openAmountPanel(
                  'receive'
                )
              }
            />
          </View>

          {amountPanelOpen ? (
            <View
              style={
                styles.amountArea
              }
            >
              <CashComposer
                mode={
                  amountMode
                }
                amount={
                  composedAmount
                }
                maximumAmount={
                  maximumForMode()
                }
                currencySymbol={
                  currencySymbol
                }
                onAmountChange={
                  setComposedAmount
                }
                onCancel={
                  closeAmountPanel
                }
              />

              <Pressable
                disabled={
                  composedAmount <=
                  0
                }
                onPress={
                  handleAmountContinue
                }
                style={({
                  pressed,
                }) => [
                  styles.continueButton,

                  composedAmount <=
                    0 &&
                    styles.continueButtonDisabled,

                  pressed &&
                    composedAmount >
                      0 &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.continueButtonText
                  }
                >
                  {continueButtonText()}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View
              style={
                styles.restingSpace
              }
            />
          )}
        </ScrollView>

        <CashieBottomNavigation
          activeScreen="home"
          onHome={
            handleCashiePress
          }
          onPeople={
            peopleCallback
          }
          onCashie={
            handleCashiePress
          }
          onDashie={
            dashieCallback
          }
          onSettings={
            settingsCallback
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex:
        1,

      backgroundColor:
        COLORS.paper,
    },

    screen: {
      flex:
        1,

      backgroundColor:
        COLORS.paper,
    },

    content: {
      flexGrow:
        1,

      paddingHorizontal:
        16,

      paddingTop:
        15,

      paddingBottom:
        28,
    },

    brandHeader: {
      minHeight:
        62,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        5,
    },

    brandCopy: {
      flex:
        1,

      paddingRight:
        14,
    },

    brandTitle: {
      color:
        COLORS.leatherDark,

      fontSize:
        29,

      fontWeight:
        '800',

      letterSpacing:
        4.5,

      textShadowColor:
        '#FFFFFF',

      textShadowOffset: {
        width:
          0,

        height:
          1,
      },

      textShadowRadius:
        1,
    },

    brandTagline: {
      color:
        COLORS.copper,

      fontSize:
        12,

      fontWeight:
        '700',

      letterSpacing:
        1.65,

      marginTop:
        2,
    },

    flipButton: {
      width:
        50,

      height:
        50,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        25,

      backgroundColor:
        COLORS.copperDark,

      borderWidth:
        2,

      borderColor:
        COLORS.copperLight,

      shadowColor:
        '#241107',

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      shadowOpacity:
        0.24,

      shadowRadius:
        5,

      elevation:
        5,
    },

    flipButtonPressed: {
      transform: [
        {
          scale:
            0.95,
        },
      ],
    },

    flipButtonInner: {
      width:
        39,

      height:
        39,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        20,

      borderWidth:
        1,

      borderColor:
        COLORS.copper,

      backgroundColor:
        COLORS.leatherDeep,
    },

    flipIcon: {
      color:
        COLORS.copperLight,

      fontSize:
        27,

      lineHeight:
        29,

      fontWeight:
        '500',
    },

    brandDivider: {
      height:
        1,

      backgroundColor:
        COLORS.line,

      marginTop:
        5,

      marginBottom:
        14,

      marginHorizontal:
        3,
    },

    walletCardArea: {
      width:
        '100%',
    },

    amountArea: {
      width:
        '100%',

      marginTop:
        14,
    },

    continueButton: {
      minHeight:
        48,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        9,

      backgroundColor:
        COLORS.leatherDark,

      marginTop:
        12,

      paddingHorizontal:
        16,

      shadowColor:
        '#251208',

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      shadowOpacity:
        0.14,

      shadowRadius:
        5,

      elevation:
        3,
    },

    continueButtonDisabled: {
      opacity:
        0.3,
    },

    continueButtonText: {
      color:
        COLORS.white,

      fontSize:
        13,

      fontWeight:
        '800',

      letterSpacing:
        0.8,

      textAlign:
        'center',
    },

    restingSpace: {
      flex:
        1,

      minHeight:
        28,
    },

    pressed: {
      opacity:
        0.68,
    },
  });