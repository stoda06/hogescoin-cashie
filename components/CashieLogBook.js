import React, {
  useMemo,
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

function iconForType(
  type
) {
  switch (type) {
    case 'received':
      return 'arrow-down-left';

    case 'battery':
      return 'battery-charging';

    case 'wallet':
      return 'wallet-outline';

    case 'conversion':
      return 'swap-horizontal';

    default:
      return 'arrow-up-right';
  }
}

export default function CashieLogBook({
  entries,
  onEntryPress,
  onViewStatement,
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(
    false
  );

  const safeEntries =
    useMemo(
      () =>
        Array.isArray(
          entries
        )
          ? entries
          : [],
      [
        entries,
      ]
    );

  const visibleEntries =
    expanded
      ? safeEntries
      : safeEntries.slice(
          0,
          3
        );

  return (
    <View
      style={
        styles.card
      }
    >
      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerLeft
          }
        >
          <MaterialCommunityIcons
            name="notebook-outline"
            size={21}
            color="#94613C"
          />

          <Text
            style={
              styles.title
            }
          >
            LOGBOOK
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel={
            expanded
              ? 'Show less history'
              : 'Show more history'
          }
          onPress={() =>
            setExpanded(
              current =>
                !current
            )
          }
        >
          <Text
            style={
              styles.expandText
            }
          >
            {expanded
              ? 'Show less'
              : 'View all'}
          </Text>
        </TouchableOpacity>
      </View>

      {safeEntries.length ===
        0 && (
        <Text
          style={
            styles.emptyText
          }
        >
          No wallet activity yet. Payments you make and
          receive will appear here.
        </Text>
      )}

      <View
        style={
          styles.entries
        }
      >
        {visibleEntries.map(
          entry => (
            <TouchableOpacity
              key={
                entry.id
              }
              activeOpacity={
                onEntryPress
                  ? 0.72
                  : 1
              }
              accessibilityRole={
                onEntryPress
                  ? 'button'
                  : undefined
              }
              onPress={() =>
                onEntryPress?.(
                  entry
                )
              }
              style={
                styles.entry
              }
            >
              <View
                style={
                  styles.iconCircle
                }
              >
                <MaterialCommunityIcons
                  name={iconForType(
                    entry.type
                  )}
                  size={18}
                  color="#815234"
                />
              </View>

              <View
                style={
                  styles.entryText
                }
              >
                <Text
                  style={
                    styles.entryTitle
                  }
                >
                  {entry.title}
                </Text>

                <Text
                  style={
                    styles.entrySubtitle
                  }
                >
                  {entry.subtitle}
                </Text>
              </View>

              {!!entry.amount && (
                <Text
                  style={
                    styles.entryAmount
                  }
                >
                  {entry.amount}
                </Text>
              )}
            </TouchableOpacity>
          )
        )}
      </View>

      {onViewStatement && (
        <TouchableOpacity
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel="View Cashie statement"
          onPress={
            onViewStatement
          }
          style={
            styles.statementButton
          }
        >
          <Text
            style={
              styles.statementButtonText
            }
          >
            VIEW STATEMENT
          </Text>

          <MaterialCommunityIcons
            name="chevron-right"
            size={19}
            color="#7A4A2B"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      width: '100%',
      padding: 17,
      backgroundColor:
        '#FBF4E5',
      borderWidth: 1,
      borderColor:
        '#DCC59F',
      borderRadius: 22,
      shadowColor:
        '#3A1C0C',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.07,
      shadowRadius: 7,
      elevation: 2,
    },

    header: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    headerLeft: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    title: {
      marginLeft: 8,
      color: '#2F1A10',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.8,
    },

    expandText: {
      color: '#865635',
      fontSize: 11,
      fontWeight: '800',
    },

    entries: {
      marginTop: 12,
    },

    entry: {
      minHeight: 58,
      flexDirection:
        'row',
      alignItems:
        'center',
      borderBottomWidth: 1,
      borderBottomColor:
        '#E8D9BE',
    },

    iconCircle: {
      width: 36,
      height: 36,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 11,
      backgroundColor:
        '#EFE0C5',
      borderRadius: 18,
    },

    entryText: {
      flex: 1,
      paddingRight: 10,
    },

    entryTitle: {
      color: '#342015',
      fontSize: 13,
      fontWeight: '700',
    },

    entrySubtitle: {
      marginTop: 2,
      color: '#8A715E',
      fontSize: 10,
    },

    emptyText: {
      marginTop: 12,
      color: '#8A715E',
      fontSize: 12,
      lineHeight: 18,
    },

    entryAmount: {
      color: '#3A2417',
      fontSize: 13,
      fontWeight: '900',
      textAlign: 'right',
    },

    statementButton: {
      minHeight: 42,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginTop: 14,
      backgroundColor:
        '#EFE0C5',
      borderRadius: 13,
    },

    statementButtonText: {
      marginRight: 4,
      color: '#6D4127',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
  });