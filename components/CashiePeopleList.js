import React, {
  useMemo,
  useRef,
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

import {
  CASHIE_COLOURS,
} from '../utils/constants.js';

import CashiePageHeader from './CashiePageHeader.js';
import CashiePeopleEmptyState from './CashiePeopleEmptyState.js';
import CashieBottomNavigation from './CashieBottomNavigation.js';

const FALLBACK_CASHIE_COLOURS = {
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

const CARD_COLOURS = {
  ...FALLBACK_CASHIE_COLOURS,
  ...(CASHIE_COLOURS || {}),
};

const COLORS = {
  paper: '#F8F4EA',
  paperDark: '#EFE8DA',

  leather: '#6E3215',
  leatherDark: '#4B210E',

  copper: '#A75B2A',

  ink: '#1E1712',
  muted: '#6F675F',

  line: '#CFC5B6',

  white: '#FFFDF8',
};

const ALPHABET = [
  '#',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

function getInitials(
  name = ''
) {
  return String(
    name
  )
    .replace(
      '’',
      ''
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
        word[0]
    )
    .join('')
    .slice(
      0,
      3
    )
    .toUpperCase();
}

function getSection(
  name = ''
) {
  const firstCharacter =
    String(
      name
    )
      .trim()
      .charAt(
        0
      )
      .toUpperCase();

  if (
    /^[A-Z]$/.test(
      firstCharacter
    )
  ) {
    return firstCharacter;
  }

  return '#';
}

function formatLastPaid(
  lastPaidAt
) {
  if (
    !lastPaidAt
  ) {
    return 'Not yet';
  }

  const paymentDate =
    new Date(
      lastPaidAt
    );

  if (
    Number.isNaN(
      paymentDate.getTime()
    )
  ) {
    return String(
      lastPaidAt
    );
  }

  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const paymentDay =
    new Date(
      paymentDate.getFullYear(),
      paymentDate.getMonth(),
      paymentDate.getDate()
    );

  const differenceInDays =
    Math.round(
      (
        today.getTime() -
        paymentDay.getTime()
      ) /
        86400000
    );

  if (
    differenceInDays ===
    0
  ) {
    return 'Today';
  }

  if (
    differenceInDays ===
    1
  ) {
    return 'Yesterday';
  }

  if (
    differenceInDays >
      1 &&
    differenceInDays <
      7
  ) {
    return `${differenceInDays} days ago`;
  }

  return paymentDate.toLocaleDateString(
    'en-AU',
    {
      day:
        'numeric',

      month:
        'short',
    }
  );
}

function LeatherTile({
  person,
}) {
  const label =
    person.initials ||
    getInitials(
      person.name
    ) ||
    '?';

  return (
    <View
      style={
        styles.personTile
      }
    >
      <View
        pointerEvents="none"
        style={
          styles.personTileStitching
        }
      />

      <Text
        numberOfLines={
          1
        }
        adjustsFontSizeToFit
        minimumFontScale={
          0.68
        }
        style={
          styles.personTileText
        }
      >
        {label}
      </Text>

      <Text
        pointerEvents="none"
        style={
          styles.personTileMark
        }
      >
        ᴴ
      </Text>
    </View>
  );
}

function PersonRow({
  person,
  onPress,
}) {
  const paymentCount =
    Number(
      person.paymentCount ||
        0
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        `View ${person.name}`
      }
      onPress={() =>
        onPress?.(
          person
        )
      }
      style={({
        pressed,
      }) => [
        styles.personRow,

        pressed &&
          styles.personRowPressed,
      ]}
    >
      <LeatherTile
        person={
          person
        }
      />

      <View
        style={
          styles.personDetails
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
          {person.name}
        </Text>

        <Text
          style={
            styles.personMeta
          }
        >
          {paymentCount}{' '}

          {paymentCount ===
          1
            ? 'payment'
            : 'payments'}
        </Text>

        <Text
          style={
            styles.personMeta
          }
        >
          Last paid{' '}

          <Text
            style={
              styles.personMetaStrong
            }
          >
            {formatLastPaid(
              person.lastPaidAt
            )}
          </Text>
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={
          24
        }
        color={
          COLORS.leatherDark
        }
      />
    </Pressable>
  );
}

function SectionHeader({
  title,
}) {
  return (
    <View
      style={
        styles.sectionHeader
      }
    >
      <Text
        style={
          styles.sectionHeaderText
        }
      >
        {title}
      </Text>
    </View>
  );
}

export default function CashiePeopleList({
  people = [],

  onSelectPerson,

  onHome,
  onPeople,
  onDashie,
  onSettings,

  onMakeFirstPayment,
}) {
  const [
    searchText,
    setSearchText,
  ] = useState(
    ''
  );

  const scrollViewRef =
    useRef(
      null
    );

  const sectionPositions =
    useRef(
      {}
    );

  const preparedPeople =
    useMemo(
      () =>
        people
          .map(
            (
              person,
              index
            ) => ({
              ...person,

              id:
                person.id ||
                person.walletAddress ||
                `${person.name}-${index}`,

              name:
                String(
                  person.name ||
                    'Unnamed person'
                ),

              initials:
                person.initials ||
                getInitials(
                  person.name
                ),

              section:
                getSection(
                  person.name
                ),
            })
          )
          .sort(
            (
              firstPerson,
              secondPerson
            ) =>
              firstPerson.name.localeCompare(
                secondPerson.name
              )
          ),
      [
        people,
      ]
    );

  const filteredPeople =
    useMemo(
      () => {
        const query =
          searchText
            .trim()
            .toLowerCase();

        if (
          !query
        ) {
          return preparedPeople;
        }

        return preparedPeople.filter(
          person =>
            person.name
              .toLowerCase()
              .includes(
                query
              )
        );
      },
      [
        preparedPeople,
        searchText,
      ]
    );

  const recentPeople =
    useMemo(
      () =>
        [
          ...filteredPeople,
        ]
          .filter(
            person =>
              person.lastPaidAt
          )
          .sort(
            (
              firstPerson,
              secondPerson
            ) =>
              new Date(
                secondPerson.lastPaidAt
              ).getTime() -
              new Date(
                firstPerson.lastPaidAt
              ).getTime()
          )
          .slice(
            0,
            2
          ),
      [
        filteredPeople,
      ]
    );

  const alphabeticalGroups =
    useMemo(
      () => {
        const groups =
          {};

        filteredPeople.forEach(
          person => {
            if (
              !groups[
                person.section
              ]
            ) {
              groups[
                person.section
              ] = [];
            }

            groups[
              person.section
            ].push(
              person
            );
          }
        );

        return groups;
      },
      [
        filteredPeople,
      ]
    );

  const visibleSections =
    ALPHABET.filter(
      section =>
        alphabeticalGroups[
          section
        ]?.length
    );

  const peopleSubtitle =
    preparedPeople.length ===
    1
      ? '1 person'
      : `${preparedPeople.length} people`;

  function handleIndexPress(
    letter
  ) {
    const position =
      sectionPositions.current[
        letter
      ];

    if (
      typeof position !==
      'number'
    ) {
      return;
    }

    scrollViewRef.current?.scrollTo(
      {
        y:
          position,

        animated:
          true,
      }
    );
  }

  function recordSectionPosition(
    section,
    event
  ) {
    sectionPositions.current[
      section
    ] =
      event.nativeEvent.layout.y;
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
            styles.pageContent
          }
        >
          <CashiePageHeader
            title="CASHIE PEOPLE"
            subtitle={
              peopleSubtitle
            }
            icon="people"
          />

          {people.length >
          0 ? (
            <View
              style={
                styles.searchArea
              }
            >
              <View
                style={
                  styles.searchBox
                }
              >
                <Ionicons
                  name="search-outline"
                  size={
                    22
                  }
                  color={
                    COLORS.leatherDark
                  }
                />

                <TextInput
                  value={
                    searchText
                  }
                  onChangeText={
                    setSearchText
                  }
                  placeholder="Search"
                  placeholderTextColor={
                    COLORS.muted
                  }
                  autoCorrect={
                    false
                  }
                  autoCapitalize="none"
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                  style={
                    styles.searchInput
                  }
                />
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.contentArea,

              people.length ===
                0 &&
                styles.emptyContentArea,
            ]}
          >
            {people.length ===
            0 ? (
              <CashiePeopleEmptyState
                onMakeFirstPayment={
                  onMakeFirstPayment ||
                  onHome
                }
              />
            ) : (
              <>
                <ScrollView
                  ref={
                    scrollViewRef
                  }
                  style={
                    styles.peopleScroll
                  }
                  contentContainerStyle={
                    styles.peopleScrollContent
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                  keyboardShouldPersistTaps="handled"
                >
                  {recentPeople.length >
                  0 ? (
                    <View>
                      <SectionHeader
                        title="RECENT"
                      />

                      {recentPeople.map(
                        person => (
                          <PersonRow
                            key={
                              `recent-${person.id}`
                            }
                            person={
                              person
                            }
                            onPress={
                              onSelectPerson
                            }
                          />
                        )
                      )}
                    </View>
                  ) : null}

                  {visibleSections.map(
                    section => (
                      <View
                        key={
                          section
                        }
                        onLayout={
                          event =>
                            recordSectionPosition(
                              section,
                              event
                            )
                        }
                      >
                        <SectionHeader
                          title={
                            section
                          }
                        />

                        {alphabeticalGroups[
                          section
                        ].map(
                          person => (
                            <PersonRow
                              key={
                                person.id
                              }
                              person={
                                person
                              }
                              onPress={
                                onSelectPerson
                              }
                            />
                          )
                        )}
                      </View>
                    )
                  )}

                  {filteredPeople.length ===
                  0 ? (
                    <View
                      style={
                        styles.noSearchResults
                      }
                    >
                      <Text
                        style={
                          styles.noSearchTitle
                        }
                      >
                        No people found
                      </Text>

                      <Text
                        style={
                          styles.noSearchText
                        }
                      >
                        Try another name
                      </Text>
                    </View>
                  ) : null}
                </ScrollView>

                <View
                  style={
                    styles.alphabetRail
                  }
                >
                  {ALPHABET.map(
                    letter => {
                      const available =
                        Boolean(
                          alphabeticalGroups[
                            letter
                          ]?.length
                        );

                      return (
                        <Pressable
                          key={
                            letter
                          }
                          accessibilityRole="button"
                          accessibilityLabel={
                            `Jump to ${letter}`
                          }
                          disabled={
                            !available
                          }
                          onPress={() =>
                            handleIndexPress(
                              letter
                            )
                          }
                          hitSlop={
                            3
                          }
                          style={
                            styles.alphabetButton
                          }
                        >
                          <Text
                            style={[
                              styles.alphabetText,

                              !available &&
                                styles.alphabetTextDisabled,
                            ]}
                          >
                            {letter}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        <CashieBottomNavigation
          activeScreen="people"
          onHome={
            onHome
          }
          onPeople={
            onPeople
          }
          onDashie={
            onDashie
          }
          onSettings={
            onSettings
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

    pageContent: {
      flex:
        1,
    },

    searchArea: {
      paddingHorizontal:
        20,

      paddingTop:
        2,

      paddingBottom:
        14,
    },

    searchBox: {
      height:
        47,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        14,

      backgroundColor:
        '#F5F1E8',

      borderRadius:
        10,

      borderWidth:
        1,

      borderColor:
        COLORS.line,
    },

    searchInput: {
      flex:
        1,

      color:
        COLORS.ink,

      fontSize:
        17,

      paddingVertical:
        0,

      paddingLeft:
        10,
    },

    contentArea: {
      flex:
        1,

      flexDirection:
        'row',

      marginHorizontal:
        16,

      marginBottom:
        10,

      overflow:
        'hidden',

      backgroundColor:
        COLORS.paper,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        12,
    },

    emptyContentArea: {
      borderWidth:
        0,

      marginHorizontal:
        20,
    },

    peopleScroll: {
      flex:
        1,
    },

    peopleScrollContent: {
      paddingBottom:
        24,
    },

    sectionHeader: {
      height:
        38,

      justifyContent:
        'center',

      paddingHorizontal:
        17,

      backgroundColor:
        COLORS.paperDark,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.line,
    },

    sectionHeaderText: {
      color:
        COLORS.leatherDark,

      fontSize:
        14,

      fontWeight:
        '700',

      letterSpacing:
        0.5,
    },

    personRow: {
      minHeight:
        102,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingLeft:
        13,

      paddingRight:
        12,

      paddingVertical:
        10,

      backgroundColor:
        COLORS.paper,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.line,
    },

    personRowPressed: {
      backgroundColor:
        '#EEE5D6',
    },

    personTile: {
      width:
        76,

      height:
        76,

      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      borderRadius:
        16,

      borderWidth:
        2,

      borderColor:
        CARD_COLOURS.copperDark,

      backgroundColor:
        CARD_COLOURS.darkLeather,

      shadowColor:
        CARD_COLOURS.shadow,

      shadowOpacity:
        0.27,

      shadowRadius:
        7,

      shadowOffset: {
        width:
          0,

        height:
          4,
      },

      elevation:
        5,
    },

    personTileStitching: {
      position:
        'absolute',

      top:
        7,

      right:
        7,

      bottom:
        7,

      left:
        7,

      borderRadius:
        10,

      borderWidth:
        1,

      borderStyle:
        'dashed',

      borderColor:
        CARD_COLOURS.copper,

      opacity:
        0.68,
    },

    personTileText: {
      maxWidth:
        58,

      color:
        CARD_COLOURS.lightCream,

      fontSize:
        22,

      fontWeight:
        '800',

      letterSpacing:
        1.3,

      textAlign:
        'center',

      paddingHorizontal:
        5,
    },

    personTileMark: {
      position:
        'absolute',

      right:
        11,

      bottom:
        9,

      color:
        CARD_COLOURS.copperLight,

      fontSize:
        10,

      lineHeight:
        11,

      fontWeight:
        '800',

      opacity:
        0.82,
    },

    personDetails: {
      flex:
        1,

      paddingLeft:
        14,
    },

    personName: {
      color:
        COLORS.ink,

      fontSize:
        20,

      fontWeight:
        '700',

      marginBottom:
        3,
    },

    personMeta: {
      color:
        COLORS.ink,

      fontSize:
        15,

      lineHeight:
        21,
    },

    personMetaStrong: {
      fontWeight:
        '700',
    },

    alphabetRail: {
      width:
        38,

      alignItems:
        'center',

      paddingVertical:
        4,

      backgroundColor:
        '#F2EDE3',

      borderLeftWidth:
        1,

      borderLeftColor:
        COLORS.line,
    },

    alphabetButton: {
      width:
        27,

      flex:
        1,

      minHeight:
        18,

      maxHeight:
        24,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        4,
    },

    alphabetText: {
      color:
        COLORS.leatherDark,

      fontSize:
        13,

      fontWeight:
        '700',
    },

    alphabetTextDisabled: {
      color:
        '#B8AEA2',

      fontWeight:
        '500',
    },

    noSearchResults: {
      alignItems:
        'center',

      paddingHorizontal:
        30,

      paddingVertical:
        60,
    },

    noSearchTitle: {
      color:
        COLORS.ink,

      fontSize:
        20,

      fontWeight:
        '700',

      marginBottom:
        8,
    },

    noSearchText: {
      color:
        COLORS.muted,

      fontSize:
        15,

      lineHeight:
        22,

      textAlign:
        'center',
    },
  });