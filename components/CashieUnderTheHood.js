import React, {
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

function formatNumber(
  value,
  maximumFractionDigits = 4
) {
  return Number(
    value || 0
  ).toLocaleString(
    'en-AU',
    {
      maximumFractionDigits,
    }
  );
}

function formatAud(value) {
  return `A$${Number(
    value || 0
  ).toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function shortenAddress(
  value
) {
  const address =
    String(
      value || ''
    );

  if (
    address.length <=
    18
  ) {
    return address;
  }

  return `${address.slice(
    0,
    8
  )}...${address.slice(
    -6
  )}`;
}

function DetailRow({
  label,
  value,
}) {
  return (
    <View
      style={
        styles.detailRow
      }
    >
      <Text
        style={
          styles.detailLabel
        }
      >
        {label}
      </Text>

      <Text
        selectable
        style={
          styles.detailValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

function ConnectionRow({
  label,
  connected,
}) {
  return (
    <View
      style={
        styles.connectionRow
      }
    >
      <View
        style={[
          styles.connectionDot,
          !connected &&
            styles.connectionDotOffline,
        ]}
      />

      <Text
        style={
          styles.connectionLabel
        }
      >
        {label}
      </Text>

      <Text
        style={[
          styles.connectionValue,
          !connected &&
            styles.connectionValueOffline,
        ]}
      >
        {connected
          ? 'Connected'
          : 'Offline'}
      </Text>
    </View>
  );
}

export default function CashieUnderTheHood({
  networkName = 'Solana',
  networkConnected = false,

  hogesBalance = 0,
  hogesValueAud = 0,

  batterySol = 0,
  batteryValueAud = 0,

  hogesPerSol = 0,
  hogesPerSolAud = 0,
  solPriceAud = 0,

  walletAddress = '',

  depositWalletAddress = '',

  priceFeedConnected = false,
  networkFeedConnected = false,
  swapFeedConnected = false,
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(
    false
  );

  return (
    <View
      style={
        styles.card
      }
    >
      <TouchableOpacity
        activeOpacity={0.72}
        accessibilityRole="button"
        accessibilityLabel="Under the Hood"
        accessibilityState={{
          expanded,
        }}
        onPress={() =>
          setExpanded(
            current =>
              !current
          )
        }
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
            name="wrench-outline"
            size={21}
            color="#94613C"
          />

          <Text
            style={
              styles.title
            }
          >
            UNDER THE HOOD
          </Text>
        </View>

        <MaterialCommunityIcons
          name={
            expanded
              ? 'chevron-up'
              : 'chevron-down'
          }
          size={24}
          color="#725039"
        />
      </TouchableOpacity>

      <View
        style={
          styles.summaryRow
        }
      >
        <View
          style={[
            styles.systemDot,
            !networkConnected &&
              styles.systemDotOffline,
          ]}
        />

        <Text
          style={
            styles.systemText
          }
        >
          {networkConnected
            ? 'All systems ready'
            : 'Connection unavailable'}
        </Text>

        <Text
          style={
            styles.networkName
          }
        >
          {networkName}
        </Text>
      </View>

      {expanded && (
        <View
          style={
            styles.expandedContent
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            BALANCES
          </Text>

          <DetailRow
            label="HOGES balance"
            value={`${formatNumber(
              hogesBalance,
              2
            )} HOGES`}
          />

          <DetailRow
            label="HOGES value"
            value={formatAud(
              hogesValueAud
            )}
          />

          <DetailRow
            label="Battery SOL"
            value={`${formatNumber(
              batterySol,
              6
            )} SOL`}
          />

          <DetailRow
            label="Battery value"
            value={formatAud(
              batteryValueAud
            )}
          />

          <Text
            style={
              styles.sectionTitle
            }
          >
            CURRENT RATES
          </Text>

          <DetailRow
            label="HOGES per SOL"
            value={formatNumber(
              hogesPerSol,
              2
            )}
          />

          <DetailRow
            label="HOGES value"
            value={formatAud(
              hogesPerSolAud
            )}
          />

          <DetailRow
            label="SOL value"
            value={formatAud(
              solPriceAud
            )}
          />

          <Text
            style={
              styles.sectionTitle
            }
          >
            WALLET
          </Text>

          <DetailRow
            label="Cashie wallet"
            value={
              shortenAddress(
                walletAddress
              ) ||
              'Not available'
            }
          />

          <DetailRow
            label="Deposit wallet"
            value={
              shortenAddress(
                depositWalletAddress
              ) ||
              'Not available'
            }
          />

          <Text
            style={
              styles.sectionTitle
            }
          >
            CONNECTIONS
          </Text>

          <ConnectionRow
            label="Price feed"
            connected={
              priceFeedConnected
            }
          />

          <ConnectionRow
            label="Network feed"
            connected={
              networkFeedConnected
            }
          />

          <ConnectionRow
            label="Swap feed"
            connected={
              swapFeedConnected
            }
          />

          <Text
            style={
              styles.note
            }
          >
            Cashie handles these systems automatically. You do not need to
            manage them to make or receive payments.
          </Text>
        </View>
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

    summaryRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginTop: 15,
    },

    systemDot: {
      width: 8,
      height: 8,
      marginRight: 8,
      backgroundColor:
        '#5E8B47',
      borderRadius: 4,
    },

    systemDotOffline: {
      backgroundColor:
        '#A34F3D',
    },

    systemText: {
      flex: 1,
      color: '#4C633D',
      fontSize: 13,
      fontWeight: '700',
    },

    networkName: {
      color: '#7D624E',
      fontSize: 12,
      fontWeight: '700',
    },

    expandedContent: {
      marginTop: 16,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor:
        '#E8D9BE',
    },

    sectionTitle: {
      marginTop: 14,
      marginBottom: 5,
      color: '#98643D',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },

    detailRow: {
      minHeight: 34,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    detailLabel: {
      flex: 1,
      paddingRight: 12,
      color: '#6D5544',
      fontSize: 12,
    },

    detailValue: {
      maxWidth: '58%',
      color: '#2D1B11',
      fontSize: 12,
      fontWeight: '800',
      textAlign: 'right',
    },

    connectionRow: {
      minHeight: 32,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    connectionDot: {
      width: 7,
      height: 7,
      marginRight: 8,
      backgroundColor:
        '#5E8B47',
      borderRadius: 4,
    },

    connectionDotOffline: {
      backgroundColor:
        '#A34F3D',
    },

    connectionLabel: {
      flex: 1,
      color: '#6D5544',
      fontSize: 12,
    },

    connectionValue: {
      color: '#4C633D',
      fontSize: 11,
      fontWeight: '800',
    },

    connectionValueOffline: {
      color: '#9A4736',
    },

    note: {
      marginTop: 14,
      color: '#846D5A',
      fontSize: 10,
      lineHeight: 15,
    },
  });