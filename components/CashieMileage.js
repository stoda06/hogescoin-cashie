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
  ).toLocaleString('en-AU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function MileageRow({
  label,
  value,
}) {
  return (
    <View
      style={
        styles.row
      }
    >
      <Text
        style={
          styles.label
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.value
        }
      >
        {value}
      </Text>
    </View>
  );
}

export default function CashieMileage({
  paymentsMade = 486,
  totalVolumeAud = 0,
  peoplePaid = 0,
  memberSince = 'July 2026',
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
          name="map-marker-distance"
          size={21}
          color="#94613C"
        />

        <Text
          style={
            styles.title
          }
        >
          YOUR MILEAGE
        </Text>
      </View>

      <View
        style={
          styles.rows
        }
      >
        <MileageRow
          label="Payments made"
          value={Number(
            paymentsMade || 0
          ).toLocaleString(
            'en-AU'
          )}
        />

        <MileageRow
          label="Value moved"
          value={formatAud(
            totalVolumeAud
          )}
        />

        <MileageRow
          label="People paid"
          value={Number(
            peoplePaid || 0
          ).toLocaleString(
            'en-AU'
          )}
        />

        <MileageRow
          label="Member since"
          value={
            memberSince
          }
        />
      </View>
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
    },

    title: {
      marginLeft: 8,
      color: '#2F1A10',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.8,
    },

    rows: {
      marginTop: 14,
    },

    row: {
      minHeight: 38,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      borderBottomWidth: 1,
      borderBottomColor:
        '#E8D9BE',
    },

    label: {
      flex: 1,
      paddingRight: 14,
      color: '#675143',
      fontSize: 13,
    },

    value: {
      color: '#2C1A10',
      fontSize: 14,
      fontWeight: '800',
      textAlign: 'right',
    },
  });