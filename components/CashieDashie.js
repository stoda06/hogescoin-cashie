import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CashiePageHeader from './CashiePageHeader.js';
import CashieBottomNavigation from './CashieBottomNavigation.js';
import CashieBattery from './CashieBattery.js';
import CashieMaxPayment from './CashieMaxPayment.js';
import CashieMileage from './CashieMileage.js';
import CashieUnderTheHood from './CashieUnderTheHood.js';
import CashieLogBook from './CashieLogBook.js';

const COLORS = {
  paper: '#F8F4EA',
  paperDark: '#EADBC0',

  leather: '#4B2819',
  leatherDark: '#2B170E',

  copper: '#A9612B',

  muted: '#6D513D',

  line: '#D8BF96',
};

export default function CashieDashie({
  batteryChargePercent,
  batteryStatus = 'Ready',
  batteryMode = 'auto',
  estimatedPaymentsRemaining = 0,

  batteryReserveAud = 0,
  batteryMaximumAud = 2,

  currentMaxPaymentAud = 0,

  paymentsMade = 0,
  moneySentAud = 0,
  moneyReceivedAud = 0,
  peoplePaid = 0,
  memberSince = '',

  hogesBalance = 0,
  hogesBalanceAud = 0,

  solOperatingReserve = 0,
  solOperatingReserveAud = 0,

  hogesPerSol = 0,
  hogesPerSolAud = 0,
  solPriceAud = 0,

  networkName = 'Solana',
  networkConnected = false,

  priceFeedConnected = false,
  networkFeedConnected = false,
  swapFeedConnected = false,

  walletAddress = '',

  depositWalletAddress = '',

  logbookEntries,

  onTopUpBattery,
  onBatteryModeChange,

  onLogbookEntryPress,
  onViewStatement,

  onHome,
  onPeople,
  onDashboard,
  onSettings,
}) {
  const safeBatteryMaximumAud =
    Math.max(
      0.01,
      Number(
        batteryMaximumAud ||
          0
      )
    );

  const calculatedBatteryPercent =
    Math.round(
      (
        Math.min(
          Math.max(
            Number(
              batteryReserveAud ||
                0
            ),
            0
          ),
          safeBatteryMaximumAud
        ) /
        safeBatteryMaximumAud
      ) *
        100
    );

  const suppliedBatteryPercent =
    Number(
      batteryChargePercent
    );

  const effectiveBatteryPercent =
    Number.isFinite(
      suppliedBatteryPercent
    )
      ? Math.max(
          0,
          Math.min(
            100,
            suppliedBatteryPercent
          )
        )
      : calculatedBatteryPercent;

  const totalVolumeAud =
    Math.max(
      0,
      Number(
        moneySentAud ||
          0
      )
    ) +
    Math.max(
      0,
      Number(
        moneyReceivedAud ||
          0
      )
    );

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
        <CashiePageHeader
          title="DASHBOARD"
          subtitle="Your wallet at a glance."
          icon="back"
          onIconPress={
            onHome
          }
          iconAccessibilityLabel="Return to Wallet"
        />

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={
              styles.component
            }
          >
            <CashieBattery
              variant="dashboard"
              batteryChargePercent={
                effectiveBatteryPercent
              }
              batteryStatus={
                batteryStatus
              }
              batteryMode={
                batteryMode
              }
              estimatedPaymentsRemaining={
                estimatedPaymentsRemaining
              }
              onBatteryModeChange={
                onBatteryModeChange
              }
              onTopUpBattery={
                onTopUpBattery
              }
              onPress={
                onTopUpBattery
              }
            />
          </View>

          <View
            style={
              styles.component
            }
          >
            <CashieMaxPayment
              maximumPaymentAud={
                currentMaxPaymentAud
              }
            />
          </View>

          <View
            style={
              styles.component
            }
          >
            <CashieMileage
              paymentsMade={
                paymentsMade
              }
              totalVolumeAud={
                totalVolumeAud
              }
              peoplePaid={
                peoplePaid
              }
              memberSince={
                memberSince
              }
            />
          </View>

          <View
            style={
              styles.component
            }
          >
            <CashieUnderTheHood
              networkName={
                networkName
              }
              networkConnected={
                networkConnected
              }
              hogesBalance={
                hogesBalance
              }
              hogesValueAud={
                hogesBalanceAud
              }
              batterySol={
                solOperatingReserve
              }
              batteryValueAud={
                solOperatingReserveAud
              }
              hogesPerSol={
                hogesPerSol
              }
              hogesPerSolAud={
                hogesPerSolAud
              }
              solPriceAud={
                solPriceAud
              }
              walletAddress={
                walletAddress
              }
              depositWalletAddress={
                depositWalletAddress
              }
              priceFeedConnected={
                priceFeedConnected
              }
              networkFeedConnected={
                networkFeedConnected
              }
              swapFeedConnected={
                swapFeedConnected
              }
            />
          </View>

          <View
            style={
              styles.component
            }
          >
            <CashieLogBook
              entries={
                logbookEntries
              }
              onEntryPress={
                onLogbookEntryPress
              }
              onViewStatement={
                onViewStatement
              }
            />
          </View>

          
        </ScrollView>

        <CashieBottomNavigation
          activeScreen="dashie"
          onHome={
            onHome
          }
          onPeople={
            onPeople
          }
          onDashie={
            onDashboard
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
      flex: 1,

      backgroundColor:
        COLORS.paper,
    },

    screen: {
      flex: 1,

      backgroundColor:
        COLORS.paper,
    },

    scrollContent: {
      paddingHorizontal: 18,

      paddingTop: 2,

      paddingBottom: 96,
    },

    component: {
      width: '100%',

      marginBottom: 16,
    },

    dashboardNote: {
      padding: 17,

      backgroundColor:
        COLORS.paperDark,

      borderWidth: 1,

      borderColor:
        COLORS.line,

      borderRadius: 18,
    },

    dashboardNoteTitle: {
      color:
        COLORS.leather,

      fontSize: 14,

      fontWeight: '800',
    },

    dashboardNoteText: {
      marginTop: 5,

      color:
        COLORS.muted,

      fontSize: 12,

      lineHeight: 18,
    },
  });