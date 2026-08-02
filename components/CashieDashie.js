import React, {
  useEffect,
  useState,
} from 'react';

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

const MINIMUM_BATTERY_REMINDER_AUD =
  0.01;

function clampMoney(
  value,
  minimum,
  maximum
) {
  const numericValue =
    Number(
      value || 0
    );

  const roundedValue =
    Math.round(
      numericValue *
        100
    ) /
    100;

  return Math.min(
    maximum,
    Math.max(
      minimum,
      roundedValue
    )
  );
}

export default function CashieDashie({
  batteryChargePercent = 100,
  batteryStatus = 'Ready',
  estimatedPaymentsRemaining = 510,

  batteryReserveAud = 2,
  batteryMaximumAud = 2,
  batteryReminderAud = 0.5,

  currentMaxPaymentAud = 500,

  paymentsMade = 486,
  moneySentAud = 0,
  moneyReceivedAud = 0,
  peoplePaid = 0,
  memberSince = 'July 2026',

  hogesBalance = 12500,
  hogesBalanceAud = 100,

  solOperatingReserve = 0.01,
  solOperatingReserveAud = 2,

  hogesPerSol = 25000,
  hogesPerSolAud = 0.008,
  solPriceAud = 200,

  networkName = 'Solana',
  networkConnected = true,

  priceFeedConnected = true,
  networkFeedConnected = true,
  swapFeedConnected = true,

  walletAddress =
    'CashieWalletAddress123456789',

  depositWalletAddress =
    'DepositWalletAddress123456789',

  logbookEntries,

  onBatteryReminderChange,
  onTopUpBattery,

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

  const [
    localBatteryReminderAud,
    setLocalBatteryReminderAud,
  ] = useState(
    clampMoney(
      batteryReminderAud,
      MINIMUM_BATTERY_REMINDER_AUD,
      safeBatteryMaximumAud
    )
  );

  useEffect(
    () => {
      setLocalBatteryReminderAud(
        clampMoney(
          batteryReminderAud,
          MINIMUM_BATTERY_REMINDER_AUD,
          safeBatteryMaximumAud
        )
      );
    },
    [
      batteryReminderAud,
      safeBatteryMaximumAud,
    ]
  );

  const effectiveBatteryReminderAud =
    clampMoney(
      localBatteryReminderAud,
      MINIMUM_BATTERY_REMINDER_AUD,
      safeBatteryMaximumAud
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

  function handleBatteryReminderChange(
    nextValue
  ) {
    const safeValue =
      clampMoney(
        nextValue,
        MINIMUM_BATTERY_REMINDER_AUD,
        safeBatteryMaximumAud
      );

    setLocalBatteryReminderAud(
      safeValue
    );

    onBatteryReminderChange?.(
      safeValue
    );
  }

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
          icon="dashboard"
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
              batteryReserveAud={
                batteryReserveAud
              }
              batteryLimitAud={
                safeBatteryMaximumAud
              }
              batteryReminderAud={
                effectiveBatteryReminderAud
              }
              batteryChargePercent={
                effectiveBatteryPercent
              }
              batteryStatus={
                batteryStatus
              }
              estimatedPaymentsRemaining={
                estimatedPaymentsRemaining
              }
              onBatteryReminderChange={
                handleBatteryReminderChange
              }
              onTopUpBattery={
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
          activeItem="dashie"
          onHome={
            onHome
          }
          onPeople={
            onPeople
          }
          onDashboard={
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