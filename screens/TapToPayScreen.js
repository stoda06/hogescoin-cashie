import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
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
  paper: '#F8F4EA',
  paperDark: '#EFE8DA',

  darkLeather: '#382015',
  leather: '#512B1A',
  leatherDark: '#4B210E',

  copper: '#B96E32',
  copperLight: '#D49156',
  copperDark: '#79401D',

  cream: '#F8EBD2',
  lightCream: '#FFF7E7',

  ink: '#21120B',
  muted: '#6F675F',
  line: '#CFC5B6',

  success: '#4E7D47',
  white: '#FFFDF8',
};

export default function TapToPayScreen({
  status = 'searching',

  recipientName = '',
  recipientAddress = '',

  onCancel,
  onContinue,
}) {
  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] = useState(
    0
  );

  const pulseValue =
    useRef(
      new Animated.Value(
        0
      )
    ).current;

  const isConnected =
    status ===
    'connected';

  const hasFailed =
    status ===
    'failed';

  useEffect(
    () => {
      if (
        isConnected ||
        hasFailed
      ) {
        return undefined;
      }

      const pulseLoop =
        Animated.loop(
          Animated.sequence([
            Animated.timing(
              pulseValue,
              {
                toValue:
                  1,

                duration:
                  900,

                useNativeDriver:
                  true,
              }
            ),

            Animated.timing(
              pulseValue,
              {
                toValue:
                  0,

                duration:
                  900,

                useNativeDriver:
                  true,
              }
            ),
          ])
        );

      pulseLoop.start();

      return () => {
        pulseLoop.stop();
      };
    },
    [
      hasFailed,
      isConnected,
      pulseValue,
    ]
  );

  useEffect(
    () => {
      if (
        isConnected ||
        hasFailed
      ) {
        return undefined;
      }

      const timer =
        setInterval(
          () => {
            setElapsedSeconds(
              current =>
                current +
                1
            );
          },
          1000
        );

      return () =>
        clearInterval(
          timer
        );
    },
    [
      hasFailed,
      isConnected,
    ]
  );

  const pulseScale =
    pulseValue.interpolate({
      inputRange: [
        0,
        1,
      ],

      outputRange: [
        1,
        1.12,
      ],
    });

  const pulseOpacity =
    pulseValue.interpolate({
      inputRange: [
        0,
        1,
      ],

      outputRange: [
        0.34,
        0.08,
      ],
    });

  function renderSearchingState() {
    return (
      <>
        <View
          style={
            styles.tapVisual
          }
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,

              {
                opacity:
                  pulseOpacity,

                transform: [
                  {
                    scale:
                      pulseScale,
                  },
                ],
              },
            ]}
          />

          <View
            style={
              styles.phoneMedallion
            }
          >
            <Ionicons
              name="phone-portrait-outline"
              size={
                46
              }
              color={
                COLORS.lightCream
              }
            />
          </View>

          <View
            style={
              styles.tapBadge
            }
          >
            <Ionicons
              name="radio-outline"
              size={
                21
              }
              color={
                COLORS.copperLight
              }
            />
          </View>
        </View>

        <Text
          style={
            styles.mainTitle
          }
        >
          HOLD PHONES TOGETHER
        </Text>

        <Text
          style={
            styles.mainText
          }
        >
          Keep both phones close while Cashie finds the other wallet.
        </Text>

        <View
          style={
            styles.statusPill
          }
        >
          <View
            style={
              styles.searchingDot
            }
          />

          <Text
            style={
              styles.statusText
            }
          >
            SEARCHING
          </Text>
        </View>

        <Text
          style={
            styles.timerText
          }
        >
          {elapsedSeconds}
          s
        </Text>
      </>
    );
  }

  function renderConnectedState() {
    return (
      <>
        <View
          style={[
            styles.phoneMedallion,
            styles.connectedMedallion,
          ]}
        >
          <Ionicons
            name="checkmark"
            size={
              49
            }
            color={
              COLORS.lightCream
            }
          />
        </View>

        <Text
          style={
            styles.mainTitle
          }
        >
          WALLET FOUND
        </Text>

        <Text
          numberOfLines={
            1
          }
          style={
            styles.recipientName
          }
        >
          {recipientName ||
            'Cashie wallet'}
        </Text>

        {recipientAddress ? (
          <Text
            numberOfLines={
              1
            }
            style={
              styles.recipientAddress
            }
          >
            {recipientAddress}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to review payment"
          onPress={
            onContinue
          }
          style={({
            pressed,
          }) => [
            styles.continueButton,

            pressed &&
              styles.controlPressed,
          ]}
        >
          <Text
            style={
              styles.continueButtonText
            }
          >
            CONTINUE
          </Text>
        </Pressable>
      </>
    );
  }

  function renderFailedState() {
    return (
      <>
        <View
          style={[
            styles.phoneMedallion,
            styles.failedMedallion,
          ]}
        >
          <Ionicons
            name="close"
            size={
              49
            }
            color={
              COLORS.lightCream
            }
          />
        </View>

        <Text
          style={
            styles.mainTitle
          }
        >
          NO PHONE FOUND
        </Text>

        <Text
          style={
            styles.mainText
          }
        >
          Bring the phones closer together and try again.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to payment options"
          onPress={
            onCancel
          }
          style={({
            pressed,
          }) => [
            styles.continueButton,

            pressed &&
              styles.controlPressed,
          ]}
        >
          <Text
            style={
              styles.continueButtonText
            }
          >
            TRY AGAIN
          </Text>
        </Pressable>
      </>
    );
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
        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel tap payment"
            onPress={
              onCancel
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
              CASHIE
            </Text>

            <Text
              style={
                styles.headerTitle
              }
            >
              TAP TO PAY
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
              styles.mainCard
            }
          >
            {isConnected
              ? renderConnectedState()
              : hasFailed
                ? renderFailedState()
                : renderSearchingState()}

            {!isConnected &&
            !hasFailed ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel tap payment"
                onPress={
                  onCancel
                }
                style={({
                  pressed,
                }) => [
                  styles.cancelButton,

                  pressed &&
                    styles.controlPressed,
                ]}
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  CANCEL
                </Text>
              </Pressable>
            ) : null}
          </View>

          <Text
            style={
              styles.footerNote
            }
          >
            Tap only shares payment details. You will still review and approve the payment before anything is sent.
          </Text>
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
        'center',

      paddingHorizontal:
        18,

      paddingBottom:
        34,
    },

    mainCard: {
      minHeight:
        430,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        24,

      paddingVertical:
        30,

      borderRadius:
        20,

      borderWidth:
        2,

      borderColor:
        COLORS.copperDark,

      backgroundColor:
        COLORS.darkLeather,

      shadowColor:
        COLORS.darkLeather,

      shadowOffset: {
        width:
          0,

        height:
          7,
      },

      shadowOpacity:
        0.24,

      shadowRadius:
        12,

      elevation:
        8,
    },

    tapVisual: {
      width:
        156,

      height:
        156,

      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        24,
    },

    pulseRing: {
      width:
        146,

      height:
        146,

      position:
        'absolute',

      borderRadius:
        73,

      borderWidth:
        3,

      borderColor:
        COLORS.copperLight,
    },

    phoneMedallion: {
      width:
        104,

      height:
        104,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        52,

      borderWidth:
        3,

      borderColor:
        COLORS.copper,

      backgroundColor:
        COLORS.leather,
    },

    connectedMedallion: {
      marginBottom:
        25,

      backgroundColor:
        COLORS.success,
    },

    failedMedallion: {
      marginBottom:
        25,

      backgroundColor:
        '#8D342A',
    },

    tapBadge: {
      width:
        42,

      height:
        42,

      position:
        'absolute',

      right:
        3,

      bottom:
        8,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        21,

      borderWidth:
        2,

      borderColor:
        COLORS.copper,

      backgroundColor:
        COLORS.darkLeather,
    },

    mainTitle: {
      color:
        COLORS.lightCream,

      fontSize:
        21,

      fontWeight:
        '800',

      letterSpacing:
        0.9,

      textAlign:
        'center',

      marginBottom:
        10,
    },

    mainText: {
      maxWidth:
        290,

      color:
        COLORS.cream,

      fontSize:
        15,

      lineHeight:
        22,

      textAlign:
        'center',

      opacity:
        0.84,
    },

    statusPill: {
      minHeight:
        38,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        25,

      paddingHorizontal:
        17,

      borderRadius:
        19,

      borderWidth:
        1,

      borderColor:
        COLORS.copper,

      backgroundColor:
        COLORS.leather,
    },

    searchingDot: {
      width:
        8,

      height:
        8,

      borderRadius:
        4,

      backgroundColor:
        COLORS.copperLight,

      marginRight:
        9,
    },

    statusText: {
      color:
        COLORS.lightCream,

      fontSize:
        12,

      fontWeight:
        '800',

      letterSpacing:
        1.1,
    },

    timerText: {
      color:
        COLORS.cream,

      fontSize:
        13,

      marginTop:
        9,

      opacity:
        0.62,
    },

    recipientName: {
      maxWidth:
        '100%',

      color:
        COLORS.lightCream,

      fontSize:
        27,

      fontWeight:
        '800',

      textAlign:
        'center',

      marginBottom:
        8,
    },

    recipientAddress: {
      maxWidth:
        '100%',

      color:
        COLORS.cream,

      fontSize:
        14,

      textAlign:
        'center',

      opacity:
        0.72,
    },

    continueButton: {
      width:
        '100%',

      minHeight:
        52,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        30,

      borderRadius:
        10,

      borderWidth:
        1,

      borderColor:
        COLORS.copperLight,

      backgroundColor:
        COLORS.copperDark,
    },

    continueButtonText: {
      color:
        COLORS.white,

      fontSize:
        14,

      fontWeight:
        '800',

      letterSpacing:
        1,
    },

    cancelButton: {
      minHeight:
        44,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        25,

      paddingHorizontal:
        24,

      borderRadius:
        8,

      borderWidth:
        1,

      borderColor:
        COLORS.copper,

      backgroundColor:
        'transparent',
    },

    cancelButtonText: {
      color:
        COLORS.lightCream,

      fontSize:
        12,

      fontWeight:
        '800',

      letterSpacing:
        1,
    },

    footerNote: {
      color:
        COLORS.muted,

      fontSize:
        12,

      lineHeight:
        18,

      textAlign:
        'center',

      marginTop:
        20,

      paddingHorizontal:
        13,
    },

    controlPressed: {
      opacity:
        0.66,

      transform: [
        {
          scale:
            0.98,
        },
      ],
    },
  });