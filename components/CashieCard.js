import React, {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

import {
  CASHIE_COLOURS,
} from '../utils/constants.js';

const FALLBACK_COLOURS = {
  darkLeather: '#382015',
  leather: '#512B1A',
  leatherLight: '#6E3A22',

  copper: '#B96E32',
  copperLight: '#D49156',
  copperDark: '#79401D',

  cream: '#F8EBD2',
  lightCream: '#FFF7E7',
  mutedText: '#D7B98E',

  ink: '#21120B',
  shadow: '#180A04',
};

const COLOURS = {
  ...FALLBACK_COLOURS,
  ...(CASHIE_COLOURS || {}),
};

function formatMoney(
  amount,
  currencySymbol
) {
  return `${currencySymbol}${Number(
    amount || 0
  ).toLocaleString(
    'en-AU',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function shortenAddress(
  address
) {
  const cleanAddress =
    String(
      address || ''
    ).trim();

  if (
    !cleanAddress
  ) {
    return '';
  }

  if (
    cleanAddress.length <=
    13
  ) {
    return cleanAddress;
  }

  return `${cleanAddress.slice(
    0,
    5
  )}...${cleanAddress.slice(
    -4
  )}`;
}

function cleanWalletName(
  walletName
) {
  return String(
    walletName || ''
  )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(
      0,
      60
    );
}

function createCashieQrPayload({
  walletName,
  walletAddress,
}) {
  return JSON.stringify({
    type: 'cashie-wallet',
    version: 1,

    walletName:
      cleanWalletName(
        walletName
      ),

    walletAddress:
      String(
        walletAddress || ''
      ).trim(),
  });
}

function CurrencyPin({
  currencyCode,
  onPress,
}) {
  const isAud =
    currencyCode ===
    'AUD';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        `Change currency. Current currency ${currencyCode}`
      }
      disabled={
        !onPress
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.currencyPin,

        pressed &&
          styles.currencyPinPressed,
      ]}
    >
      <View
        style={
          styles.currencyPinInner
        }
      >
        {isAud ? (
          <Text
            style={
              styles.currencyFlag
            }
          >
            🇦🇺
          </Text>
        ) : (
          <Text
            style={
              styles.currencyCode
            }
          >
            {currencyCode}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function PersonIcon() {
  return (
    <View
      style={
        styles.personIcon
      }
    >
      <View
        style={
          styles.personHead
        }
      />

      <View
        style={
          styles.personBody
        }
      />
    </View>
  );
}

function ScannerIcon() {
  return (
    <View
      style={
        styles.scannerIcon
      }
    >
      <View
        style={[
          styles.scannerCorner,
          styles.scannerTopLeft,
        ]}
      />

      <View
        style={[
          styles.scannerCorner,
          styles.scannerTopRight,
        ]}
      />

      <View
        style={[
          styles.scannerCorner,
          styles.scannerBottomLeft,
        ]}
      />

      <View
        style={[
          styles.scannerCorner,
          styles.scannerBottomRight,
        ]}
      />

      <View
        style={
          styles.scannerCentre
        }
      />
    </View>
  );
}

function CardAction({
  type,
  title,
  onPress,
  showDivider = true,
}) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          title
        }
        disabled={
          !onPress
        }
        onPress={
          onPress
        }
        style={({
          pressed,
        }) => [
          styles.actionRow,

          pressed &&
            styles.actionRowPressed,

          !onPress &&
            styles.actionRowDisabled,
        ]}
      >
        <View
          style={
            styles.actionMedallion
          }
        >
          {type ===
          'person' ? (
            <PersonIcon />
          ) : (
            <ScannerIcon />
          )}
        </View>

        <Text
          numberOfLines={
            1
          }
          adjustsFontSizeToFit
          minimumFontScale={
            0.78
          }
          style={
            styles.actionTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.actionChevron
          }
        >
          ›
        </Text>
      </Pressable>

      {showDivider ? (
        <View
          style={
            styles.actionDivider
          }
        />
      ) : null}
    </View>
  );
}

function CashieQrCode({
  walletName,
  walletAddress,
}) {
  const qrValue =
    useMemo(
      () =>
        createCashieQrPayload({
          walletName,
          walletAddress,
        }),
      [
        walletName,
        walletAddress,
      ]
    );

  return (
    <View
      style={
        styles.qrFrame
      }
    >
      <QRCode
        value={
          qrValue
        }
        size={
          126
        }
        color={
          COLOURS.ink
        }
        backgroundColor={
          COLOURS.lightCream
        }
        quietZone={
          3
        }
        ecl="M"
      />

      <View
        pointerEvents="none"
        style={
          styles.qrCoin
        }
      >
        <Text
          style={
            styles.qrCoinText
          }
        >
          H
        </Text>
      </View>
    </View>
  );
}

function CardStitching() {
  return (
    <View
      pointerEvents="none"
      style={
        styles.stitching
      }
    />
  );
}

function PaySide({
  walletName,
  cashieBalance,
  currencyCode,
  currencySymbol,
  onCurrencyPress,
  onPay,
  onMerchant,
}) {
  const displayedWalletName =
    cleanWalletName(
      walletName
    );

  return (
    <View
      style={
        styles.sideContent
      }
    >
      <View
        style={
          styles.balanceRow
        }
      >
        <CurrencyPin
          currencyCode={
            currencyCode
          }
          onPress={
            onCurrencyPress
          }
        />

        <View
          style={
            styles.balanceDetails
          }
        >
          {displayedWalletName ? (
            <Text
              numberOfLines={
                1
              }
              adjustsFontSizeToFit
              minimumFontScale={
                0.72
              }
              style={
                styles.walletName
              }
            >
              {displayedWalletName}
            </Text>
          ) : null}

          <Text
            numberOfLines={
              1
            }
            adjustsFontSizeToFit
            minimumFontScale={
              0.68
            }
            style={
              styles.balanceAmount
            }
          >
            {formatMoney(
              cashieBalance,
              currencySymbol
            )}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.balanceDivider
        }
      />

      <View
        style={
          styles.actions
        }
      >
        <CardAction
          type="person"
          title="PAY WITH CASHIE"
          onPress={
            onPay
          }
        />

        <CardAction
          type="scanner"
          title="SCAN MERCHANT QR"
          onPress={
            onMerchant
          }
          showDivider={
            false
          }
        />
      </View>
    </View>
  );
}

function ReceiveSide({
  walletName,
  walletAddress,
  requestedAmount,
  currencySymbol,
  onAddAmount,
  onCopyAddress,
}) {
  const amountSet =
    Number(
      requestedAmount ||
        0
    ) > 0;

  const displayedWalletName =
    cleanWalletName(
      walletName
    );

  return (
    <View
      style={
        styles.sideContent
      }
    >
      <View
        style={
          styles.receiveHeader
        }
      >
        <Text
          style={
            styles.receiveTitle
          }
        >
          RECEIVE PAYMENT
        </Text>

        {displayedWalletName ? (
          <Text
            numberOfLines={
              1
            }
            adjustsFontSizeToFit
            minimumFontScale={
              0.72
            }
            style={
              styles.receiveWalletName
            }
          >
            {displayedWalletName}
          </Text>
        ) : null}
      </View>

      <View
        style={
          styles.receiveBody
        }
      >
        <CashieQrCode
          walletName={
            displayedWalletName
          }
          walletAddress={
            walletAddress
          }
        />

        <View
          style={
            styles.receiveDetails
          }
        >
          <Text
            style={
              styles.receiveLabel
            }
          >
            AMOUNT
          </Text>

          <Text
            numberOfLines={
              1
            }
            adjustsFontSizeToFit
            minimumFontScale={
              0.66
            }
            style={
              styles.requestAmount
            }
          >
            {formatMoney(
              requestedAmount,
              currencySymbol
            )}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              amountSet
                ? 'Change amount'
                : 'Add amount'
            }
            onPress={
              onAddAmount
            }
            style={({
              pressed,
            }) => [
              styles.addAmountButton,

              pressed &&
                styles.controlPressed,
            ]}
          >
            <Text
              style={
                styles.addAmountButtonText
              }
            >
              {amountSet
                ? 'CHANGE AMOUNT'
                : '+ ADD AMOUNT'}
            </Text>
          </Pressable>

          <Text
            style={[
              styles.receiveLabel,
              styles.addressLabel,
            ]}
          >
            YOUR ADDRESS
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy Cashie wallet address"
            disabled={
              !onCopyAddress
            }
            onPress={
              onCopyAddress
            }
            style={({
              pressed,
            }) => [
              styles.addressButton,

              pressed &&
                styles.controlPressed,

              !onCopyAddress &&
                styles.addressButtonStatic,
            ]}
          >
            <Text
              numberOfLines={
                1
              }
              style={
                styles.addressText
              }
            >
              {shortenAddress(
                walletAddress
              )}
            </Text>

            <View
              style={
                styles.copySymbol
              }
            >
              <View
                style={
                  styles.copySheetBack
                }
              />

              <View
                style={
                  styles.copySheetFront
                }
              />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function CashieCard({
  side = 'pay',

  walletName = '',
  walletAddress = '',

  cashieBalance = 0,
  currencyCode = 'AUD',
  currencySymbol = '$',

  requestedAmount = 0,

  onCurrencyPress,
  onPay,
  onMerchant,
  onAddAmount,
  onCopyAddress,
}) {
  const flipProgress =
    useRef(
      new Animated.Value(
        side ===
          'receive'
          ? 1
          : 0
      )
    ).current;

  const showingReceive =
    side ===
    'receive';

  useEffect(
    () => {
      const flipAnimation =
        Animated.timing(
          flipProgress,
          {
            toValue:
              showingReceive
                ? 1
                : 0,

            duration:
              520,

            useNativeDriver:
              true,
          }
        );

      flipAnimation.start();

      return () => {
        flipAnimation.stop();
      };
    },
    [
      flipProgress,
      showingReceive,
    ]
  );

  const frontRotation =
    flipProgress.interpolate({
      inputRange: [
        0,
        1,
      ],

      outputRange: [
        '0deg',
        '180deg',
      ],
    });

  const backRotation =
    flipProgress.interpolate({
      inputRange: [
        0,
        1,
      ],

      outputRange: [
        '180deg',
        '360deg',
      ],
    });

  return (
    <View
      style={
        styles.wrapper
      }
    >
      <View
        style={
          styles.cardStage
        }
      >
        <Animated.View
          pointerEvents={
            showingReceive
              ? 'none'
              : 'auto'
          }
          style={[
            styles.cardFace,

            {
              transform: [
                {
                  perspective:
                    1200,
                },

                {
                  rotateY:
                    frontRotation,
                },
              ],
            },
          ]}
        >
          <CardStitching />

          <PaySide
            walletName={
              walletName
            }
            cashieBalance={
              cashieBalance
            }
            currencyCode={
              currencyCode
            }
            currencySymbol={
              currencySymbol
            }
            onCurrencyPress={
              onCurrencyPress
            }
            onPay={
              onPay
            }
            onMerchant={
              onMerchant
            }
          />
        </Animated.View>

        <Animated.View
          pointerEvents={
            showingReceive
              ? 'auto'
              : 'none'
          }
          style={[
            styles.cardFace,

            {
              transform: [
                {
                  perspective:
                    1200,
                },

                {
                  rotateY:
                    backRotation,
                },
              ],
            },
          ]}
        >
          <CardStitching />

          <ReceiveSide
            walletName={
              walletName
            }
            walletAddress={
              walletAddress
            }
            requestedAmount={
              requestedAmount
            }
            currencySymbol={
              currencySymbol
            }
            onAddAmount={
              onAddAmount
            }
            onCopyAddress={
              onCopyAddress
            }
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },

    cardStage: {
      width: '100%',
      aspectRatio: 1.586,
      position: 'relative',
    },

    cardFace: {
      ...StyleSheet.absoluteFillObject,

      overflow: 'hidden',

      backgroundColor:
        COLOURS.darkLeather,

      borderWidth: 2,
      borderColor:
        COLOURS.copperDark,

      borderRadius: 22,

      paddingHorizontal: 21,
      paddingTop: 17,
      paddingBottom: 17,

      shadowColor:
        COLOURS.shadow,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      shadowOpacity: 0.27,
      shadowRadius: 13,
      elevation: 10,

      backfaceVisibility:
        'hidden',
    },

    stitching: {
      position: 'absolute',

      top: 9,
      right: 9,
      bottom: 9,
      left: 9,

      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor:
        COLOURS.copper,

      borderRadius: 15,
      opacity: 0.68,
    },

    sideContent: {
      flex: 1,
    },

    balanceRow: {
      height: 61,

      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 5,
    },

    balanceDetails: {
      flex: 1,
      justifyContent: 'center',
      minWidth: 0,
    },

    walletName: {
      color:
        COLOURS.copperLight,

      fontSize: 11,
      lineHeight: 14,
      fontWeight: '800',
      letterSpacing: 0.7,

      marginBottom: 1,
    },

    currencyPin: {
      width: 44,
      height: 44,

      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: 22,

      borderWidth: 3,
      borderColor:
        COLOURS.copper,

      backgroundColor:
        COLOURS.copperDark,

      marginRight: 12,

      shadowColor: '#120804',

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.34,
      shadowRadius: 4,
      elevation: 5,
    },

    currencyPinPressed: {
      transform: [
        {
          scale: 0.95,
        },
      ],
    },

    currencyPinInner: {
      width: 34,
      height: 34,

      alignItems: 'center',
      justifyContent: 'center',

      overflow: 'hidden',

      borderRadius: 17,

      backgroundColor:
        '#171A41',
    },

    currencyFlag: {
      fontSize: 25,
      lineHeight: 30,
    },

    currencyCode: {
      color:
        COLOURS.lightCream,

      fontSize: 9,
      fontWeight: '900',
    },

    balanceAmount: {
      color:
        COLOURS.lightCream,

      fontSize: 33,
      lineHeight: 37,
      fontWeight: '800',
      letterSpacing: -0.8,
    },

    balanceDivider: {
      height: 1,

      backgroundColor:
        COLOURS.copper,

      opacity: 0.5,

      marginHorizontal: 5,
    },

    actions: {
      flex: 1,

      justifyContent:
        'space-evenly',

      paddingHorizontal: 5,
    },

    actionRow: {
      height: 52,

      flexDirection: 'row',
      alignItems: 'center',
    },

    actionRowPressed: {
      opacity: 0.6,

      transform: [
        {
          translateX: 1,
        },
      ],
    },

    actionRowDisabled: {
      opacity: 0.34,
    },

    actionMedallion: {
      width: 36,
      height: 36,

      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: 18,

      borderWidth: 1.5,
      borderColor:
        COLOURS.copper,

      backgroundColor:
        COLOURS.leather,

      marginRight: 13,
    },

    actionTitle: {
      flex: 1,

      color:
        COLOURS.lightCream,

      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.3,
    },

    actionChevron: {
      color:
        COLOURS.copperLight,

      fontSize: 29,
      fontWeight: '300',
      lineHeight: 31,

      paddingLeft: 8,
    },

    actionDivider: {
      height: 1,

      backgroundColor:
        COLOURS.copper,

      opacity: 0.4,

      marginLeft: 49,
    },

    personIcon: {
      width: 19,
      height: 21,

      alignItems: 'center',
    },

    personHead: {
      width: 8,
      height: 8,

      borderRadius: 4,

      backgroundColor:
        COLOURS.lightCream,
    },

    personBody: {
      width: 17,
      height: 10,

      marginTop: 2,

      borderTopLeftRadius: 9,
      borderTopRightRadius: 9,
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,

      backgroundColor:
        COLOURS.lightCream,
    },

    scannerIcon: {
      width: 20,
      height: 20,

      position: 'relative',
    },

    scannerCorner: {
      position: 'absolute',

      width: 7,
      height: 7,

      borderColor:
        COLOURS.lightCream,
    },

    scannerTopLeft: {
      top: 0,
      left: 0,

      borderTopWidth: 2,
      borderLeftWidth: 2,
    },

    scannerTopRight: {
      top: 0,
      right: 0,

      borderTopWidth: 2,
      borderRightWidth: 2,
    },

    scannerBottomLeft: {
      bottom: 0,
      left: 0,

      borderBottomWidth: 2,
      borderLeftWidth: 2,
    },

    scannerBottomRight: {
      right: 0,
      bottom: 0,

      borderRightWidth: 2,
      borderBottomWidth: 2,
    },

    scannerCentre: {
      position: 'absolute',

      top: 7,
      left: 7,

      width: 6,
      height: 6,

      backgroundColor:
        COLOURS.lightCream,
    },

    receiveHeader: {
      minHeight: 35,

      paddingHorizontal: 5,
      marginBottom: 2,
    },

    receiveTitle: {
      color:
        COLOURS.lightCream,

      fontSize: 16,
      lineHeight: 19,
      fontWeight: '800',
      letterSpacing: 0.6,
    },

    receiveWalletName: {
      color:
        COLOURS.copperLight,

      fontSize: 10,
      lineHeight: 13,
      fontWeight: '800',
      letterSpacing: 0.6,
    },

    receiveBody: {
      flex: 1,

      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 5,
      paddingBottom: 2,
    },

    qrFrame: {
      width: '46%',
      aspectRatio: 1,

      position: 'relative',

      alignItems: 'center',
      justifyContent: 'center',

      overflow: 'hidden',

      backgroundColor:
        COLOURS.lightCream,

      borderWidth: 3,
      borderColor:
        COLOURS.copperDark,

      borderRadius: 10,

      padding: 7,
      marginRight: 12,
    },

    qrCoin: {
      position: 'absolute',

      width: 41,
      height: 41,

      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: 21,

      borderWidth: 3,
      borderColor:
        COLOURS.copper,

      backgroundColor:
        COLOURS.darkLeather,
    },

    qrCoinText: {
      color:
        COLOURS.copperLight,

      fontSize: 21,
      fontWeight: '800',
    },

    receiveDetails: {
      flex: 1,
      justifyContent: 'center',
    },

    receiveLabel: {
      color:
        COLOURS.copperLight,

      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 1,

      marginBottom: 3,
    },

    requestAmount: {
      color:
        COLOURS.lightCream,

      fontSize: 24,
      fontWeight: '800',

      marginBottom: 6,
    },

    addAmountButton: {
      minHeight: 33,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        COLOURS.copper,

      borderWidth: 1,
      borderColor:
        COLOURS.copperLight,

      borderRadius: 7,

      paddingHorizontal: 6,
    },

    addAmountButtonText: {
      color:
        COLOURS.lightCream,

      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.4,
    },

    addressLabel: {
      marginTop: 8,
    },

    addressButton: {
      minHeight: 32,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      borderWidth: 1,
      borderColor:
        COLOURS.copperDark,

      borderRadius: 7,

      backgroundColor:
        COLOURS.leather,

      paddingHorizontal: 8,
    },

    addressButtonStatic: {
      opacity: 1,
    },

    addressText: {
      flex: 1,

      color:
        COLOURS.lightCream,

      fontSize: 10,
      fontWeight: '600',
    },

    copySymbol: {
      width: 17,
      height: 18,

      position: 'relative',

      marginLeft: 6,
    },

    copySheetBack: {
      position: 'absolute',

      top: 0,
      right: 0,

      width: 11,
      height: 13,

      borderWidth: 1.5,
      borderColor:
        COLOURS.lightCream,

      borderRadius: 2,
    },

    copySheetFront: {
      position: 'absolute',

      left: 0,
      bottom: 0,

      width: 11,
      height: 13,

      borderWidth: 1.5,
      borderColor:
        COLOURS.lightCream,

      borderRadius: 2,

      backgroundColor:
        COLOURS.leather,
    },

    controlPressed: {
      opacity: 0.58,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });