import React from 'react';

import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const COLOURS = {
  paper: '#F8F4EA',
  leather: '#4B2819',
  leatherDark: '#3B1F13',
  copper: '#B96E32',
  copperLight: '#D49156',
  cream: '#FFF4DD',
  ink: '#271A13',
  muted: '#6B6258',
  line: '#D7CDBE',
};

export default function PaymentRequestIncompleteScreen({
  walletName = 'This person',
  onScanOrTapAgain,
  onCancel,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLOURS.paper}
      />

      <View style={styles.container}>

        <View style={styles.iconCircle}>
          <Ionicons
            name="information-outline"
            size={54}
            color={COLOURS.copper}
          />
        </View>

        <Text style={styles.title}>
          PAYMENT REQUEST INCOMPLETE
        </Text>

        <Text style={styles.body}>
          <Text style={styles.bold}>
            {walletName}
          </Text>{' '}
          hasn't added an amount yet.
        </Text>

        <Text style={styles.subText}>
          Please ask{' '}
          <Text style={styles.bold}>
            {walletName}
          </Text>{' '}
          to add the amount,
          then try again.
        </Text>

        <Pressable
          onPress={onScanOrTapAgain}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            SCAN OR TAP AGAIN
          </Text>
        </Pressable>

        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>
            CANCEL
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLOURS.paper,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: COLOURS.copper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    backgroundColor: COLOURS.cream,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLOURS.leatherDark,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 24,
  },

  body: {
    fontSize: 19,
    color: COLOURS.ink,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 14,
  },

  subText: {
    fontSize: 16,
    color: COLOURS.muted,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 42,
  },

  bold: {
    fontWeight: '800',
    color: COLOURS.leatherDark,
  },

  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: COLOURS.leather,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  primaryButtonText: {
    color: COLOURS.cream,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
  },

  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLOURS.copper,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  secondaryButtonText: {
    color: COLOURS.copper,
    fontSize: 17,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

});