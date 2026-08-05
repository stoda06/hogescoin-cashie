import {
  useMemo,
  useState,
} from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import CashieBottomNavigation from '../components/CashieBottomNavigation.js';

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

  white: '#FFFDF8',
};

function getInitials(
  name = ''
) {
  return String(
    name
  )
    .trim()
    .split(
      /\s+/
    )
    .filter(
      Boolean
    )
    .map(
      word =>
        word.charAt(
          0
        )
    )
    .join('')
    .slice(
      0,
      3
    )
    .toUpperCase();
}

function shortenAddress(
  address = ''
) {
  const value =
    String(
      address
    );

  if (
    value.length <=
    16
  ) {
    return value;
  }

  return `${value.slice(
    0,
    7
  )}...${value.slice(
    -6
  )}`;
}

function PaymentMethodCard({
  icon,
  title,
  description,
  accessibilityLabel,
  onPress,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.paymentMethodCard,

        pressed &&
          styles.paymentMethodCardPressed,
      ]}
    >
      <View
        style={
          styles.paymentMethodMedallion
        }
      >
        <Ionicons
          name={
            icon
          }
          size={
            29
          }
          color={
            COLORS.lightCream
          }
        />
      </View>

      <View
        style={
          styles.paymentMethodCopy
        }
      >
        <Text
          style={
            styles.paymentMethodTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.paymentMethodText
          }
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={
          25
        }
        color={
          COLORS.copperLight
        }
      />
    </Pressable>
  );
}

function PersonTile({
  person,
  onPress,
}) {
  const name =
    String(
      person?.name ||
        'Cashie person'
    );

  const initials =
    person?.initials ||
    getInitials(
      name
    ) ||
    '?';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        `Pay ${name}`
      }
      onPress={() =>
        onPress?.(
          person
        )
      }
      style={({
        pressed,
      }) => [
        styles.personButton,

        pressed &&
          styles.personButtonPressed,
      ]}
    >
      <View
        style={
          styles.personMonogram
        }
      >
        <View
          pointerEvents="none"
          style={
            styles.personMonogramStitching
          }
        />

        <Text
          numberOfLines={
            1
          }
          adjustsFontSizeToFit
          style={
            styles.personInitials
          }
        >
          {initials}
        </Text>
      </View>

      <View
        style={
          styles.personCopy
        }
      >
        <Text
          numberOfLines={
            1
          }
          style={
            styles.personName
          }
        >
          {name}
        </Text>

        <Text
          numberOfLines={
            1
          }
          style={
            styles.personAddress
          }
        >
          {shortenAddress(
            person?.walletAddress ||
              person?.address ||
              ''
          )}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={
          23
        }
        color={
          COLORS.copperDark
        }
      />
    </Pressable>
  );
}

export default function WhoToPayScreen({
  cashiePeople = [],

  onScan,
  onTap,
  onSelectPerson,
  onPasteAddress,

  onBack,
  onHome,
  onPeople,
  onDashboard,
  onSettings,
}) {
  const [
    walletAddress,
    setWalletAddress,
  ] = useState(
    ''
  );

  const [
    addressError,
    setAddressError,
  ] = useState(
    ''
  );

  const preparedPeople =
    useMemo(
      () =>
        Array.isArray(
          cashiePeople
        )
          ? cashiePeople
          : [],
      [
        cashiePeople,
      ]
    );

  function handleAddressChange(
    value
  ) {
    setWalletAddress(
      value
    );

    if (
      addressError
    ) {
      setAddressError(
        ''
      );
    }
  }

  function handleAddressContinue() {
    const cleanedAddress =
      walletAddress.trim();

    if (
      !cleanedAddress
    ) {
      setAddressError(
        'Enter a wallet address.'
      );

      return;
    }

    onPasteAddress?.(
      cleanedAddress
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
            accessibilityLabel="Back to wallet"
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
              CASHIE
            </Text>

            <Text
              style={
                styles.headerTitle
              }
            >
              WHO ARE YOU PAYING?
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
              styles.paymentMethods
            }
          >
            <PaymentMethodCard
              icon="scan-outline"
              title="SCAN QR CODE"
              description="Scan their Cashie QR"
              accessibilityLabel="Scan payment QR code"
              onPress={
                onScan
              }
            />

            <PaymentMethodCard
              icon="phone-portrait-outline"
              title="TAP"
              description="Hold your phones together"
              accessibilityLabel="Pay by tapping phones"
              onPress={
                onTap
              }
            />
          </View>

          {preparedPeople.length >
          0 ? (
            <View
              style={
                styles.section
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                CASHIE PEOPLE
              </Text>

              <View
                style={
                  styles.peopleCard
                }
              >
                {preparedPeople.map(
                  (
                    person,
                    index
                  ) => (
                    <View
                      key={
                        person.id ||
                        person.walletAddress ||
                        `${person.name}-${index}`
                      }
                    >
                      <PersonTile
                        person={
                          person
                        }
                        onPress={
                          onSelectPerson
                        }
                      />

                      {index <
                      preparedPeople.length -
                        1 ? (
                        <View
                          style={
                            styles.personDivider
                          }
                        />
                      ) : null}
                    </View>
                  )
                )}
              </View>
            </View>
          ) : null}

          <View
            style={
              styles.section
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              WALLET ADDRESS
            </Text>

            <View
              style={
                styles.addressCard
              }
            >
              <View
                style={
                  styles.addressInputRow
                }
              >
                <Ionicons
                  name="wallet-outline"
                  size={
                    22
                  }
                  color={
                    COLORS.copperDark
                  }
                />

                <TextInput
                  value={
                    walletAddress
                  }
                  onChangeText={
                    handleAddressChange
                  }
                  placeholder="Paste wallet address"
                  placeholderTextColor={
                    COLORS.muted
                  }
                  autoCorrect={
                    false
                  }
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={
                    handleAddressContinue
                  }
                  style={
                    styles.addressInput
                  }
                />
              </View>

              {addressError ? (
                <Text
                  style={
                    styles.addressError
                  }
                >
                  {addressError}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue with wallet address"
                onPress={
                  handleAddressContinue
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
            </View>
          </View>
                </ScrollView>

                <CashieBottomNavigation
          activeItem="home"
          onHome={onHome}
          onPeople={onPeople}
          onDashboard={onDashboard}
          onSettings={onSettings}
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
      paddingHorizontal:
        16,

      paddingTop:
        16,

      paddingBottom:
        96,
    },

    paymentMethods: {
      gap:
        10,
    },

    paymentMethodCard: {
      minHeight:
        82,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        16,

      borderRadius:
        15,

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
          4,
      },

      shadowOpacity:
        0.2,

      shadowRadius:
        7,

      elevation:
        5,
    },

    paymentMethodCardPressed: {
      opacity:
        0.72,

      transform: [
        {
          scale:
            0.99,
        },
      ],
    },

    paymentMethodMedallion: {
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

      borderWidth:
        2,

      borderColor:
        COLORS.copper,

      backgroundColor:
        COLORS.leather,

      marginRight:
        14,
    },

    paymentMethodCopy: {
      flex:
        1,
    },

    paymentMethodTitle: {
      color:
        COLORS.lightCream,

      fontSize:
        15,

      fontWeight:
        '800',

      letterSpacing:
        0.7,

      marginBottom:
        3,
    },

    paymentMethodText: {
      color:
        COLORS.cream,

      fontSize:
        13,

      lineHeight:
        18,

      opacity:
        0.82,
    },

    section: {
      marginTop:
        21,
    },

    sectionTitle: {
      color:
        COLORS.leatherDark,

      fontSize:
        12,

      fontWeight:
        '800',

      letterSpacing:
        1.25,

      marginBottom:
        9,

      paddingLeft:
        3,
    },

    peopleCard: {
      overflow:
        'hidden',

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      backgroundColor:
        COLORS.paper,
    },

    personButton: {
      minHeight:
        86,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        13,

      paddingVertical:
        9,

      backgroundColor:
        COLORS.paper,
    },

    personButtonPressed: {
      backgroundColor:
        COLORS.paperDark,
    },

    personMonogram: {
      width:
        64,

      height:
        64,

      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      borderRadius:
        14,

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
          3,
      },

      shadowOpacity:
        0.22,

      shadowRadius:
        5,

      elevation:
        4,
    },

    personMonogramStitching: {
      position:
        'absolute',

      top:
        6,

      right:
        6,

      bottom:
        6,

      left:
        6,

      borderRadius:
        9,

      borderWidth:
        1,

      borderStyle:
        'dashed',

      borderColor:
        COLORS.copper,

      opacity:
        0.68,
    },

    personInitials: {
      maxWidth:
        48,

      color:
        COLORS.lightCream,

      fontSize:
        19,

      fontWeight:
        '800',

      letterSpacing:
        1,

      textAlign:
        'center',
    },

    personCopy: {
      flex:
        1,

      paddingLeft:
        13,

      paddingRight:
        8,
    },

    personName: {
      color:
        COLORS.ink,

      fontSize:
        18,

      fontWeight:
        '700',

      marginBottom:
        4,
    },

    personAddress: {
      color:
        COLORS.muted,

      fontSize:
        13,
    },

    personDivider: {
      height:
        1,

      marginLeft:
        90,

      backgroundColor:
        COLORS.line,
    },

    addressCard: {
      padding:
        13,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      backgroundColor:
        COLORS.paperDark,
    },

    addressInputRow: {
      minHeight:
        51,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        13,

      borderRadius:
        9,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      backgroundColor:
        COLORS.white,
    },

    addressInput: {
      flex:
        1,

      color:
        COLORS.ink,

      fontSize:
        15,

      paddingLeft:
        10,

      paddingVertical:
        0,
    },

    addressError: {
      color:
        '#9B2E24',

      fontSize:
        13,

      fontWeight:
        '600',

      marginTop:
        8,

      paddingHorizontal:
        3,
    },

    continueButton: {
      minHeight:
        48,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        12,

      borderRadius:
        9,

      borderWidth:
        1,

      borderColor:
        COLORS.copperDark,

      backgroundColor:
        COLORS.leatherDark,
    },

    continueButtonText: {
      color:
        COLORS.white,

      fontSize:
        13,

      fontWeight:
        '800',

      letterSpacing:
        0.9,
    },

    controlPressed: {
      opacity:
        0.65,

      transform: [
        {
          scale:
            0.98,
        },
      ],
    },
  });