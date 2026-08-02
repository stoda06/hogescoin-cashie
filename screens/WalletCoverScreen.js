import {
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

const COLORS = {
  background: '#3F2418',
  panel: '#4B2A1B',
  panelDark: '#2D180F',
  brass: '#A86A2E',
  brassLight: '#D39A55',
  brassDark: '#67401E',
  paper: '#F8F4EA',
  ink: '#271A13',
  muted: '#D4C2AC',
};

export default function WalletCoverScreen({
  walletAddress = '',
  activated = false,
  onOpen,
}) {
  const flipAnimation =
    useRef(
      new Animated.Value(0)
    ).current;

  const [
    showingQr,
    setShowingQr,
  ] = useState(false);

  function flipToQr() {
    if (
      activated
    ) {
      onOpen?.();
      return;
    }

    const nextShowingQr =
      !showingQr;

    Animated.spring(
      flipAnimation,
      {
        toValue:
          nextShowingQr
            ? 1
            : 0,

        friction:
          8,

        tension:
          60,

        useNativeDriver:
          true,
      }
    ).start();

    setShowingQr(
      nextShowingQr
    );
  }

  const frontRotation =
    flipAnimation.interpolate({
      inputRange:
        [0, 1],

      outputRange:
        ['0deg', '180deg'],
    });

  const backRotation =
    flipAnimation.interpolate({
      inputRange:
        [0, 1],

      outputRange:
        ['180deg', '360deg'],
    });

  const frontOpacity =
    flipAnimation.interpolate({
      inputRange:
        [0, 0.49, 0.5, 1],

      outputRange:
        [1, 1, 0, 0],
    });

  const backOpacity =
    flipAnimation.interpolate({
      inputRange:
        [0, 0.49, 0.5, 1],

      outputRange:
        [0, 0, 1, 1],
    });

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <View
        style={
          styles.screen
        }
      >
        <View
          style={
            styles.walletCover
          }
        >
          <View
            style={
              styles.heading
            }
          >
            <Text
              style={
                styles.title
              }
            >
              CASHIE
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Another Way to Pay
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              activated
                ? 'Open Cashie'
                : showingQr
                  ? 'Show Cashie seal'
                  : 'Show wallet QR code'
            }
            onPress={
              flipToQr
            }
            style={({ pressed }) => [
              styles.medallionPressable,

              pressed &&
                styles.medallionPressed,
            ]}
          >
            <View
              style={
                styles.medallionStage
              }
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.medallionFace,
                  styles.medallionFront,

                  {
                    opacity:
                      frontOpacity,

                    transform: [
                      {
                        rotateY:
                          frontRotation,
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={
                    styles.innerBrassRing
                  }
                >
                  <Text
                    style={
                      styles.hMark
                    }
                  >
                    H
                  </Text>
                </View>
              </Animated.View>

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.medallionFace,
                  styles.medallionBack,

                  {
                    opacity:
                      backOpacity,

                    transform: [
                      {
                        rotateY:
                          backRotation,
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={
                    styles.qrContainer
                  }
                >
                  <QRCode
                    value={
                      walletAddress ||
                      'cashie-wallet-not-ready'
                    }
                    size={
                      142
                    }
                    backgroundColor={
                      COLORS.paper
                    }
                    color={
                      COLORS.ink
                    }
                  />
                </View>
              </Animated.View>
            </View>
          </Pressable>

          <View
            style={
              styles.statusArea
            }
          >
            <Text
              style={
                styles.actionLabel
              }
            >
              {activated
                ? 'Tap to open Cashie'
                : showingQr
                  ? 'Tap to turn over'
                  : 'Tap to receive'}
            </Text>

            {!activated && (
              <Text
                style={
                  styles.statusText
                }
              >
                Waiting for first deposit
              </Text>
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
        COLORS.background,
    },

    screen: {
      flex:
        1,

      paddingHorizontal:
        18,

      paddingVertical:
        18,

      backgroundColor:
        COLORS.background,
    },

    walletCover: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        24,

      paddingTop:
        54,

      paddingBottom:
        48,

      borderRadius:
        30,

      borderWidth:
        2,

      borderColor:
        COLORS.brassDark,

      backgroundColor:
        COLORS.panel,

      shadowColor:
        '#000',

      shadowOpacity:
        0.3,

      shadowRadius:
        12,

      shadowOffset: {
        width:
          0,

        height:
          7,
      },

      elevation:
        8,
    },

    heading: {
      alignItems:
        'center',
    },

    title: {
      color:
        COLORS.brassLight,

      fontSize:
        34,

      fontWeight:
        '900',

      letterSpacing:
        5,
    },

    subtitle: {
      marginTop:
        8,

      color:
        COLORS.muted,

      fontSize:
        14,

      fontWeight:
        '600',

      letterSpacing:
        1.2,
    },

    medallionPressable: {
      alignItems:
        'center',

      justifyContent:
        'center',
    },

    medallionPressed: {
      opacity:
        0.88,

      transform: [
        {
          scale:
            0.98,
        },
      ],
    },

    medallionStage: {
      width:
        210,

      height:
        210,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    medallionFace: {
      position:
        'absolute',

      width:
        210,

      height:
        210,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        105,

      backfaceVisibility:
        'hidden',
    },

    medallionFront: {
      borderWidth:
        6,

      borderColor:
        COLORS.brassDark,

      backgroundColor:
        COLORS.brass,

      shadowColor:
        '#000',

      shadowOpacity:
        0.35,

      shadowRadius:
        10,

      shadowOffset: {
        width:
          0,

        height:
          6,
      },

      elevation:
        10,
    },

    innerBrassRing: {
      width:
        166,

      height:
        166,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        83,

      borderWidth:
        3,

      borderColor:
        COLORS.brassLight,

      backgroundColor:
        COLORS.brass,
    },

    hMark: {
      color:
        COLORS.panelDark,

      fontSize:
        102,

      fontWeight:
        '900',

      lineHeight:
        112,

      textShadowColor:
        COLORS.brassLight,

      textShadowOffset: {
        width:
          1,

        height:
          1,
      },

      textShadowRadius:
        1,
    },

    medallionBack: {
      borderWidth:
        6,

      borderColor:
        COLORS.brassDark,

      backgroundColor:
        COLORS.brass,
    },

    qrContainer: {
      padding:
        14,

      borderRadius:
        18,

      backgroundColor:
        COLORS.paper,
    },

    statusArea: {
      minHeight:
        76,

      alignItems:
        'center',

      justifyContent:
        'flex-end',
    },

    actionLabel: {
      color:
        COLORS.brassLight,

      fontSize:
        16,

      fontWeight:
        '800',

      letterSpacing:
        0.5,
    },

    statusText: {
      marginTop:
        12,

      color:
        COLORS.muted,

      fontSize:
        14,

      fontWeight:
        '600',
    },
  });