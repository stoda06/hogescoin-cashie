import React from 'react';

import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

const COLORS = {
  paper:
    '#F8F4EA',

  paperDark:
    '#EFE8DA',

  leather:
    '#512B1A',

  leatherDark:
    '#382015',

  copper:
    '#B96E32',

  copperLight:
    '#D49156',

  copperDark:
    '#79401D',

  cream:
    '#F8EBD2',

  lightCream:
    '#FFF7E7',

  ink:
    '#21120B',

  muted:
    '#6F675F',

  line:
    '#CFC5B6',

  green:
    '#42743A',

  greenBackground:
    '#E8F0E4',

  white:
    '#FFFDF8',
};

function clamp(
  value,
  minimum,
  maximum
) {
  const numericValue =
    Number(
      value
    );

  const safeValue =
    Number.isFinite(
      numericValue
    )
      ? numericValue
      : minimum;

  return Math.min(
    Math.max(
      safeValue,
      minimum
    ),
    maximum
  );
}

function formatLocalAmount({
  value,
  symbol = '$',
  symbolPosition = 'before',
  decimalPlaces = 2,
}) {
  const numericValue =
    Math.max(
      0,
      Number(
        value
      ) ||
        0
    );

  const safeDecimalPlaces =
    Math.max(
      0,
      Math.min(
        4,
        Number(
          decimalPlaces
        ) ||
          0
      )
    );

  const formattedValue =
    numericValue.toLocaleString(
      'en-AU',
      {
        minimumFractionDigits:
          safeDecimalPlaces,

        maximumFractionDigits:
          safeDecimalPlaces,
      }
    );

  if (
    symbolPosition ===
    'after'
  ) {
    return `${formattedValue} ${symbol}`;
  }

  return `${symbol}${formattedValue}`;
}

function BatteryCells({
  percentage,
}) {
  const cellCount =
    10;

  const filledCells =
    percentage <=
      0
      ? 0
      : Math.max(
          1,
          Math.ceil(
            (
              percentage /
              100
            ) *
              cellCount
          )
        );

  return (
    <View
      style={
        styles.batteryShell
      }
    >
      <View
        style={
          styles.batteryBody
        }
      >
        {Array.from({
          length:
            cellCount,
        }).map(
          (
            _,
            index
          ) => {
            const isFilled =
              index <
              filledCells;

            return (
              <View
                key={
                  index
                }
                style={[
                  styles.batteryCell,

                  isFilled &&
                    styles.batteryCellFilled,
                ]}
              />
            );
          }
        )}
      </View>

      <View
        style={
          styles.batteryTerminal
        }
      />
    </View>
  );
}

export default function UpdateBatteryScreen({
  batteryChargePercent = 0,

  batteryTopUpRequiredLocal = 0,

  currencyCode = 'AUD',

  currencySymbol = '$',

  currencySymbolPosition = 'before',

  currencyDecimalPlaces = 2,

  onBack,

  onConfirm,
}) {
  const percentage =
    clamp(
      batteryChargePercent,
      0,
      100
    );

  const topUpRequired =
    Math.max(
      0,
      Number(
        batteryTopUpRequiredLocal
      ) ||
        0
    );

  const batteryIsFull =
    topUpRequired <=
    0;

  const formattedTopUp =
    formatLocalAmount({
      value:
        topUpRequired,

      symbol:
        currencySymbol,

      symbolPosition:
        currencySymbolPosition,

      decimalPlaces:
        currencyDecimalPlaces,
    });

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
        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Dashboard"
            onPress={
              onBack
            }
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed &&
                styles.controlPressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={
                25
              }
              color={
                COLORS.copperLight
              }
            />
          </Pressable>

          <View
            style={
              styles.headerCopy
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              CASHIE BATTERY
            </Text>

            <Text
              style={
                styles.headerTitle
              }
            >
              UPDATE BATTERY
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
          style={
            styles.content
          }
        >
          <View
            style={
              styles.card
            }
          >
            <View
              style={
                styles.batteryPanel
              }
            >
              <BatteryCells
                percentage={
                  percentage
                }
              />

              <Text
                style={
                  styles.percentage
                }
              >
                {Math.round(
                  percentage
                )}

                <Text
                  style={
                    styles.percentageSymbol
                  }
                >
                  %
                </Text>
              </Text>
            </View>

            {batteryIsFull ? (
              <View
                style={
                  styles.fullPanel
                }
              >
                <View
                  style={
                    styles.fullIcon
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={
                      24
                    }
                    color={
                      COLORS.white
                    }
                  />
                </View>

                <Text
                  style={
                    styles.fullTitle
                  }
                >
                  Battery already full
                </Text>

                <Text
                  style={
                    styles.fullText
                  }
                >
                  No update is required.
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={
                    styles.amountPanel
                  }
                >
                  <Text
                    style={
                      styles.amountLabel
                    }
                  >
                    UPDATE AMOUNT
                  </Text>

                  <Text
                    numberOfLines={
                      1
                    }
                    adjustsFontSizeToFit
                    style={
                      styles.amountValue
                    }
                  >
                    {formattedTopUp}
                  </Text>

                  <Text
                    style={
                      styles.currencyLabel
                    }
                  >
                    {currencyCode}
                  </Text>
                </View>

                <Text
                  style={
                    styles.explanation
                  }
                >
                  Cashie will convert this amount into SOL and restore your Battery to its maximum.
                </Text>

                <Text
                  style={
                    styles.ownershipNote
                  }
                >
                  Any unused Battery balance remains yours.
                </Text>
              </>
            )}
          </View>

          <View
            style={
              styles.actions
            }
          >
            {batteryIsFull ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Return to Dashboard"
                onPress={
                  onBack
                }
                style={({
                  pressed,
                }) => [
                  styles.primaryButton,

                  pressed &&
                    styles.controlPressed,
                ]}
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  DONE
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel Battery update"
                  onPress={
                    onBack
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.secondaryButton,

                    pressed &&
                      styles.controlPressed,
                  ]}
                >
                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    CANCEL
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Confirm Battery update"
                  onPress={
                    onConfirm
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.primaryButton,

                    pressed &&
                      styles.controlPressed,
                  ]}
                >
                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    UPDATE BATTERY
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
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

    header: {
      minHeight:
        78,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        17,

      paddingTop:
        8,
    },

    backButton: {
      width:
        46,

      height:
        46,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        23,

      borderWidth:
        2,

      borderColor:
        COLORS.copper,

      backgroundColor:
        COLORS.darkLeather,

      shadowColor:
        COLORS.darkLeather,

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        5,

      elevation:
        4,
    },

    headerCopy: {
      flex:
        1,

      alignItems:
        'center',

      paddingHorizontal:
        8,
    },

    eyebrow: {
      color:
        COLORS.copper,

      fontSize:
        11,

      fontWeight:
        '800',

      letterSpacing:
        2.3,

      marginBottom:
        3,
    },

    headerTitle: {
      color:
        COLORS.leatherDark,

      fontSize:
        18,

      fontWeight:
        '800',

      letterSpacing:
        0.7,

      textAlign:
        'center',
    },

    headerSpacer: {
      width:
        46,

      height:
        46,
    },

    headerDivider: {
      height:
        1,

      marginHorizontal:
        19,

      backgroundColor:
        COLORS.line,
    },

    content: {
      flex:
        1,

      justifyContent:
        'space-between',

      paddingHorizontal:
        18,

      paddingTop:
        24,

      paddingBottom:
        24,
    },

    card: {
      padding:
        20,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        22,

      backgroundColor:
        COLORS.paperDark,

      shadowColor:
        COLORS.darkLeather,

      shadowOffset: {
        width:
          0,

        height:
          5,
      },

      shadowOpacity:
        0.12,

      shadowRadius:
        10,

      elevation:
        4,
    },

    batteryPanel: {
      padding:
        16,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        16,

      backgroundColor:
        COLORS.white,
    },

    batteryShell: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    batteryBody: {
      flex:
        1,

      minHeight:
        50,

      flexDirection:
        'row',

      padding:
        5,

      borderWidth:
        2,

      borderColor:
        COLORS.leather,

      borderRadius:
        10,

      backgroundColor:
        '#E8D9BC',
    },

    batteryCell: {
      flex:
        1,

      minHeight:
        36,

      marginHorizontal:
        1.5,

      borderWidth:
        1,

      borderColor:
        '#D8C5A4',

      borderRadius:
        4,

      backgroundColor:
        '#F1E6D1',
    },

    batteryCellFilled: {
      borderColor:
        COLORS.green,

      backgroundColor:
        COLORS.green,
    },

    batteryTerminal: {
      width:
        7,

      height:
        24,

      backgroundColor:
        COLORS.leather,

      borderTopRightRadius:
        4,

      borderBottomRightRadius:
        4,
    },

    percentage: {
      marginTop:
        10,

      color:
        COLORS.green,

      fontSize:
        38,

      fontWeight:
        '900',

      letterSpacing:
        -1,

      textAlign:
        'center',
    },

    percentageSymbol: {
      fontSize:
        21,

      fontWeight:
        '800',
    },

    amountPanel: {
      alignItems:
        'center',

      marginTop:
        18,

      paddingVertical:
        20,

      paddingHorizontal:
        16,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        16,

      backgroundColor:
        COLORS.lightCream,
    },

    amountLabel: {
      color:
        COLORS.copperDark,

      fontSize:
        11,

      fontWeight:
        '900',

      letterSpacing:
        1.3,
    },

    amountValue: {
      maxWidth:
        '100%',

      marginTop:
        7,

      color:
        COLORS.leatherDark,

      fontSize:
        38,

      fontWeight:
        '900',

      letterSpacing:
        -1,

      textAlign:
        'center',
    },

    currencyLabel: {
      marginTop:
        3,

      color:
        COLORS.muted,

      fontSize:
        11,

      fontWeight:
        '800',

      letterSpacing:
        1,
    },

    explanation: {
      marginTop:
        18,

      color:
        COLORS.ink,

      fontSize:
        15,

      lineHeight:
        22,

      textAlign:
        'center',
    },

    ownershipNote: {
      marginTop:
        8,

      color:
        COLORS.muted,

      fontSize:
        13,

      lineHeight:
        19,

      textAlign:
        'center',
    },

    fullPanel: {
      alignItems:
        'center',

      marginTop:
        20,

      padding:
        22,

      borderWidth:
        1,

      borderColor:
        COLORS.green,

      borderRadius:
        16,

      backgroundColor:
        COLORS.greenBackground,
    },

    fullIcon: {
      width:
        44,

      height:
        44,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        22,

      backgroundColor:
        COLORS.green,
    },

    fullTitle: {
      marginTop:
        12,

      color:
        COLORS.leatherDark,

      fontSize:
        19,

      fontWeight:
        '800',
    },

    fullText: {
      marginTop:
        5,

      color:
        COLORS.muted,

      fontSize:
        14,
    },

    actions: {
      marginTop:
        22,
    },

    secondaryButton: {
      minHeight:
        51,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        11,

      borderWidth:
        1,

      borderColor:
        COLORS.copperDark,

      borderRadius:
        12,

      backgroundColor:
        COLORS.paper,
    },

    secondaryButtonText: {
      color:
        COLORS.copperDark,

      fontSize:
        13,

      fontWeight:
        '900',

      letterSpacing:
        0.9,
    },

    primaryButton: {
      minHeight:
        53,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderColor:
        COLORS.copperDark,

      borderRadius:
        12,

      backgroundColor:
        COLORS.leather,
    },

    primaryButtonText: {
      color:
        COLORS.white,

      fontSize:
        13,

      fontWeight:
        '900',

      letterSpacing:
        0.9,
    },

    controlPressed: {
      opacity:
        0.68,

      transform: [
        {
          scale:
            0.98,
        },
      ],
    },
  });