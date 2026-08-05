import React from 'react';

import {
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CashiePageHeader from '../components/CashiePageHeader';

const COLORS = {
  paper: '#F8F4EA',
  paperDark: '#EFE8DA',

  leather: '#6E3215',
  leatherDark: '#4B210E',

  copper: '#A75B2A',
  copperLight: '#C98047',

  ink: '#1E1712',

  line: '#D8CCBA',

  white: '#FFFFFF',

  success: '#2E8B57',
};

export default function ChangeLocalCashScreen({
  currencies,
  selectedCurrencyCode,
  onSelectCurrency,
  onBack,
}) {
  function renderItem({
    item,
  }) {
    const selected =
      item.code ===
      selectedCurrencyCode;

    return (
      <Pressable
        onPress={() =>
          onSelectCurrency(
            item.code
          )
        }
        style={({ pressed }) => [
          styles.row,
          pressed &&
            styles.rowPressed,
        ]}
      >
        <View
          style={
            styles.left
          }
        >
          <Text
            style={
              styles.flag
            }
          >
            {item.flag}
          </Text>

          <View>
            <Text
              style={
                styles.name
              }
            >
              {item.name}
            </Text>

            <Text
              style={
                styles.code
              }
            >
              {item.code}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.right
          }
        >
          {selected && (
            <Text
              style={
                styles.tick
              }
            >
              ✓
            </Text>
          )}
        </View>
      </Pressable>
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
      />

            <CashiePageHeader
        title="LOCAL CASH"
        subtitle="Choose the local money Cashie displays"
        icon="back"
        onIconPress={onBack}
        iconAccessibilityLabel="Back to Settings"
      />

      <FlatList
        data={currencies}
        keyExtractor={item =>
          item.code
        }
        renderItem={
          renderItem
        }
        ItemSeparatorComponent={() => (
          <View
            style={
              styles.separator
            }
          />
        )}
      />
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

    row: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal: 24,

      paddingVertical: 18,
    },

    rowPressed: {
      opacity: 0.55,
    },

    separator: {
      height: 1,

      backgroundColor:
        COLORS.line,

      marginLeft: 72,
    },

    left: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    flag: {
      fontSize: 28,

      marginRight: 18,
    },

    name: {
      fontSize: 17,

      fontWeight:
        '600',

      color:
        COLORS.ink,
    },

    code: {
      marginTop: 3,

      fontSize: 13,

      color:
        COLORS.copper,
    },

    right: {
      width: 28,

      alignItems:
        'center',
    },

    tick: {
      fontSize: 24,

      color:
        COLORS.success,

      fontWeight:
        '700',
    },
  });