import React from 'react';

import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  paper:
    '#F8F0DE',

  paperLight:
    '#FFF9ED',

  leather:
    '#4B2819',

  leatherDark:
    '#2B190F',

  copper:
    '#A9612B',

  copperDark:
    '#7C4F2C',

  muted:
    '#665043',

  line:
    '#D8BE91',

  lineLight:
    '#E2CEAA',

  green:
    '#42743A',

  amber:
    '#A66B24',

  red:
    '#A74232',

  emptyCell:
    '#F1E6D1',

  switchTrackOff:
    '#C9B89D',

  switchThumb:
    '#FFF9ED',
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

function formatNumber(
  value
) {
  const numericValue =
    Math.max(
      0,
      Number(
        value
      ) ||
        0
    );

  return new Intl.NumberFormat(
    'en-AU'
  ).format(
    Math.round(
      numericValue
    )
  );
}

function getBatteryAccent({
  percentage,
  status,
}) {
  const normalisedStatus =
    String(
      status ||
        ''
    )
      .trim()
      .toLowerCase();

  if (
    normalisedStatus ===
      'empty' ||
    percentage <=
      0
  ) {
    return COLORS.red;
  }

  if (
    normalisedStatus ===
      'low' ||
    percentage <=
      20
  ) {
    return COLORS.amber;
  }

  return COLORS.green;
}

function BatteryCells({
  percentage,
  accent,
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
      accessibilityLabel={
        `Cashie Battery ${Math.round(
          percentage
        )} percent`
      }
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

                  isFilled && {
                    backgroundColor:
                      accent,

                    borderColor:
                      accent,
                  },
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

export default function CashieBattery({
  batteryChargePercent,

  /*
   * Compatibility with the older
   * compact Battery prop name.
   */
  chargePercent,

  batteryStatus =
    'Ready',

  batteryMode =
    'auto',

  estimatedPaymentsRemaining =
    0,

  variant =
    'dashboard',

  onBatteryModeChange,

  onTopUpBattery,

  onPress,
}) {
  const percentage =
    clamp(
      batteryChargePercent ??
        chargePercent ??
        0,
      0,
      100
    );

  const accent =
    getBatteryAccent({
      percentage,

      status:
        batteryStatus,
    });

  const autoUpdatesOn =
    batteryMode !==
    'remind';

  const isDashboard =
    variant ===
    'dashboard';

  const Container =
    onPress
      ? TouchableOpacity
      : View;

  function handleAutoUpdatesChange(
    nextValue
  ) {
    onBatteryModeChange?.(
      nextValue
        ? 'auto'
        : 'remind'
    );
  }

  return (
    <Container
      activeOpacity={
        0.88
      }
      onPress={
        onPress
      }
      style={[
        styles.container,

        isDashboard &&
          styles.dashboardContainer,
      ]}
    >
      <Text
        style={
          styles.eyebrow
        }
      >
        CASHIE BATTERY
      </Text>

      <View
        style={
          styles.batteryPanel
        }
      >
        <BatteryCells
          percentage={
            percentage
          }
          accent={
            accent
          }
        />

        <Text
          style={[
            styles.percentage,

            {
              color:
                accent,
            },
          ]}
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

      <View
        style={
          styles.paymentsPanel
        }
      >
        <Text
          numberOfLines={
            1
          }
          adjustsFontSizeToFit
          style={
            styles.paymentsNumber
          }
        >
          ≈
          {formatNumber(
            estimatedPaymentsRemaining
          )}
        </Text>

        <Text
          style={
            styles.paymentsLabel
          }
        >
          ESTIMATED PAYMENTS REMAINING
        </Text>
      </View>

      {isDashboard ? (
        <>
          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.toggleRow
            }
          >
            <View
              style={
                styles.toggleCopy
              }
            >
              <Text
                style={
                  styles.toggleLabel
                }
              >
                Auto Battery Updates
              </Text>

              <Text
                style={
                  styles.toggleValue
                }
              >
                {autoUpdatesOn
                  ? 'ON'
                  : 'REMIND ME'}
              </Text>
            </View>

            <Switch
              accessibilityLabel="Auto Battery Updates"
              value={
                autoUpdatesOn
              }
              onValueChange={
                handleAutoUpdatesChange
              }
              trackColor={{
                false:
                  COLORS.switchTrackOff,

                true:
                  COLORS.green,
              }}
              thumbColor={
                COLORS.switchThumb
              }
              ios_backgroundColor={
                COLORS.switchTrackOff
              }
            />
          </View>

          <View
            style={
              styles.divider
            }
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Update Cashie Battery"
            disabled={
              !onTopUpBattery
            }
            onPress={
              onTopUpBattery
            }
            style={({
              pressed,
            }) => [
              styles.updateButton,

              !onTopUpBattery &&
                styles.updateButtonDisabled,

              pressed &&
                onTopUpBattery &&
                styles.controlPressed,
            ]}
          >
            <Text
              style={
                styles.updateButtonText
              }
            >
              UPDATE BATTERY
            </Text>
          </Pressable>
        </>
      ) : null}

      {!isDashboard &&
      onPress ? (
        <View
          style={
            styles.compactFooter
          }
        >
          <Text
            style={
              styles.compactFooterText
            }
          >
            View Battery
          </Text>

          <Text
            style={
              styles.chevron
            }
          >
            ›
          </Text>
        </View>
      ) : null}
    </Container>
  );
}

const styles =
  StyleSheet.create({
    container: {
      width:
        '100%',

      padding:
        18,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        22,

      backgroundColor:
        COLORS.paper,

      shadowColor:
        '#321B0E',

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

    dashboardContainer: {
      padding:
        21,

      borderRadius:
        25,
    },

    eyebrow: {
      color:
        COLORS.copperDark,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        1.4,

      textAlign:
        'center',
    },

    batteryPanel: {
      marginTop:
        18,

      paddingHorizontal:
        8,
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
        COLORS.emptyCell,
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
        9,

      fontSize:
        35,

      fontWeight:
        '900',

      letterSpacing:
        -1,

      textAlign:
        'center',
    },

    percentageSymbol: {
      fontSize:
        20,

      fontWeight:
        '800',
    },

    paymentsPanel: {
      alignItems:
        'center',

      marginTop:
        15,

      paddingVertical:
        16,

      paddingHorizontal:
        12,

      borderWidth:
        1,

      borderColor:
        COLORS.lineLight,

      borderRadius:
        16,

      backgroundColor:
        COLORS.paperLight,
    },

    paymentsNumber: {
      maxWidth:
        '100%',

      color:
        COLORS.leatherDark,

      fontSize:
        31,

      fontWeight:
        '900',

      letterSpacing:
        -0.6,

      textAlign:
        'center',
    },

    paymentsLabel: {
      marginTop:
        4,

      color:
        COLORS.muted,

      fontSize:
        10,

      fontWeight:
        '900',

      letterSpacing:
        1.05,

      textAlign:
        'center',
    },

    divider: {
      height:
        1,

      marginVertical:
        16,

      backgroundColor:
        COLORS.lineLight,
    },

    toggleRow: {
      minHeight:
        48,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    toggleCopy: {
      flex:
        1,

      paddingRight:
        16,
    },

    toggleLabel: {
      color:
        COLORS.leatherDark,

      fontSize:
        15,

      fontWeight:
        '800',
    },

    toggleValue: {
      marginTop:
        3,

      color:
        COLORS.muted,

      fontSize:
        10,

      fontWeight:
        '900',

      letterSpacing:
        0.9,
    },

    updateButton: {
      minHeight:
        51,

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

    updateButtonDisabled: {
      opacity:
        0.45,
    },

    updateButtonText: {
      color:
        '#FFF8E9',

      fontSize:
        13,

      fontWeight:
        '900',

      letterSpacing:
        0.9,
    },

    compactFooter: {
      marginTop:
        13,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'flex-end',
    },

    compactFooterText: {
      marginRight:
        6,

      color:
        COLORS.copperDark,

      fontSize:
        13,

      fontWeight:
        '800',
    },

    chevron: {
      color:
        COLORS.copper,

      fontSize:
        25,

      lineHeight:
        25,
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