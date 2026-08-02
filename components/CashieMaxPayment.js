import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

function formatAud(value) {
  return `A$${Number(
    value || 0
  ).toLocaleString(
    'en-AU',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}

export default function CashieMaxPayment({
  maximumPaymentAud = 0,
}) {
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
        <MaterialCommunityIcons
          name="cash-fast"
          size={21}
          color="#94613C"
        />

        <Text
          style={
            styles.title
          }
        >
          MAX PAYMENT
        </Text>
      </View>

      <View
        style={
          styles.limitRow
        }
      >
        <Text
          style={
            styles.label
          }
        >
          Current Network Limit
        </Text>

        <Text
          style={
            styles.value
          }
        >
          {
            formatAud(
              maximumPaymentAud
            )
          }
        </Text>
      </View>

      <View
        style={
          styles.divider
        }
      />

      <Text
        style={
          styles.explanation
        }
      >
        Updates automatically as network capacity grows.
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      width:
        '100%',

      padding:
        17,

      backgroundColor:
        '#FBF4E5',

      borderWidth:
        1,

      borderColor:
        '#DCC59F',

      borderRadius:
        22,

      shadowColor:
        '#3A1C0C',

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      shadowOpacity:
        0.07,

      shadowRadius:
        7,

      elevation:
        2,
    },

    header: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    title: {
      marginLeft:
        8,

      color:
        '#2F1A10',

      fontSize:
        15,

      fontWeight:
        '800',

      letterSpacing:
        0.8,
    },

    limitRow: {
      minHeight:
        54,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginTop:
        12,

      gap:
        18,
    },

    label: {
      flex:
        1,

      color:
        '#5F493A',

      fontSize:
        14,

      lineHeight:
        19,
    },

    value: {
      color:
        '#27160D',

      fontSize:
        20,

      fontWeight:
        '900',

      textAlign:
        'right',
    },

    divider: {
      height:
        1,

      marginTop:
        2,

      backgroundColor:
        '#E8D9BE',
    },

    explanation: {
      marginTop:
        13,

      color:
        '#806754',

      fontSize:
        11,

      lineHeight:
        16,
    },
  });