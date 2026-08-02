import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(Number(value) || 0, minimum), maximum);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-AU").format(Math.max(0, Number(value) || 0));

const formatAud = (value) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.max(0, Number(value) || 0));

const getBatteryState = (percentage) => {
  if (percentage <= 0) {
    return {
      key: "empty",
      label: "Empty",
      message: "Recharge your Cashie Battery to make payments.",
      accent: "#A74232",
      background: "#F5E6E1",
    };
  }

  if (percentage <= 20) {
    return {
      key: "low",
      label: "Low",
      message: "Recharge when you next fill your wallet.",
      accent: "#A66B24",
      background: "#F6EAD7",
    };
  }

  return {
    key: "ready",
    label: "Ready",
    message: "Your wallet is good to go.",
    accent: "#42743A",
    background: "#E8F0E4",
  };
};

function BatteryCells({ percentage, accent }) {
  const cellCount = 10;
  const filledCells = Math.ceil((percentage / 100) * cellCount);

  return (
    <View style={styles.batteryShell}>
      <View style={styles.batteryBody}>
        {Array.from({ length: cellCount }).map((_, index) => {
          const isFilled = index < filledCells;

          return (
            <View
              key={index}
              style={[
                styles.batteryCell,
                isFilled && {
                  backgroundColor: accent,
                  borderColor: accent,
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.batteryTerminal} />
    </View>
  );
}

function DetailRow({ label, value, showDivider = true }) {
  return (
    <View
      style={[
        styles.detailRow,
        showDivider && styles.detailRowDivider,
      ]}
    >
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function CashieBattery({
  chargePercent = 96,
  estimatedPaymentsRemaining = 2143,
  estimatedRechargeCostAud = 2,
  variant = "compact",
  onPress,
  onLearnMore,
}) {
  const percentage = clamp(chargePercent, 0, 100);
  const batteryState = getBatteryState(percentage);
  const isDashboard = variant === "dashboard";

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.container,
        isDashboard && styles.dashboardContainer,
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>CASHIE BATTERY</Text>
          <Text style={styles.heading}>
            {batteryState.label}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: batteryState.background,
              borderColor: batteryState.accent,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: batteryState.accent },
            ]}
          />

          <Text
            style={[
              styles.statusBadgeText,
              { color: batteryState.accent },
            ]}
          >
            {batteryState.label}
          </Text>
        </View>
      </View>

      <Text style={styles.statusMessage}>
        {batteryState.message}
      </Text>

      <View
        style={[
          styles.chargePanel,
          isDashboard && styles.dashboardChargePanel,
        ]}
      >
        <View style={styles.percentageBlock}>
          <Text
            style={[
              styles.percentage,
              isDashboard && styles.dashboardPercentage,
            ]}
          >
            {Math.round(percentage)}
            <Text style={styles.percentageSymbol}>%</Text>
          </Text>

          <Text style={styles.chargedLabel}>CHARGED</Text>
        </View>

        <View style={styles.gaugeBlock}>
          <BatteryCells
            percentage={percentage}
            accent={batteryState.accent}
          />

          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeLabel}>Empty</Text>
            <Text style={styles.gaugeLabel}>Full</Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <DetailRow
          label="Estimated payments remaining"
          value={formatNumber(estimatedPaymentsRemaining)}
        />

        <DetailRow
          label="Estimated recharge cost"
          value={formatAud(estimatedRechargeCostAud)}
          showDivider={false}
        />
      </View>

      {isDashboard && (
        <View style={styles.explainer}>
          <View style={styles.explainerIcon}>
            <Text style={styles.explainerIconText}>⚡</Text>
          </View>

          <View style={styles.explainerTextBlock}>
            <Text style={styles.explainerTitle}>
              What powers Cashie?
            </Text>

            <Text style={styles.explainerText}>
              Your Cashie Battery pays network costs. Any unused
              balance is still yours and returns when you Empty Wallet.
            </Text>
          </View>

          {onLearnMore && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onLearnMore}
              style={styles.learnMoreButton}
            >
              <Text style={styles.learnMoreText}>Learn more</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!isDashboard && onPress && (
        <View style={styles.compactFooter}>
          <Text style={styles.compactFooterText}>
            View battery
          </Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F8F0DE",
    borderWidth: 1,
    borderColor: "#D8BE91",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#321B0E",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  dashboardContainer: {
    padding: 22,
    borderRadius: 26,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  eyebrow: {
    color: "#7B5434",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  heading: {
    marginTop: 3,
    color: "#2B190F",
    fontSize: 25,
    fontWeight: "700",
  },

  statusBadge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  statusBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },

  statusMessage: {
    marginTop: 7,
    color: "#665043",
    fontSize: 14,
    lineHeight: 20,
  },

  chargePanel: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9ED",
    borderWidth: 1,
    borderColor: "#E2CEAA",
    borderRadius: 18,
    padding: 15,
  },

  dashboardChargePanel: {
    marginTop: 22,
    padding: 20,
  },

  percentageBlock: {
    width: 95,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: "#E2CEAA",
  },

  percentage: {
    color: "#2B190F",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1.5,
  },

  dashboardPercentage: {
    fontSize: 46,
  },

  percentageSymbol: {
    fontSize: 21,
    fontWeight: "700",
  },

  chargedLabel: {
    marginTop: -2,
    color: "#8A694D",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  gaugeBlock: {
    flex: 1,
    paddingLeft: 17,
  },

  batteryShell: {
    flexDirection: "row",
    alignItems: "center",
  },

  batteryBody: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    gap: 3,
    backgroundColor: "#E8D9BC",
    borderWidth: 2,
    borderColor: "#7A573B",
    borderRadius: 8,
    padding: 4,
  },

  batteryCell: {
    flex: 1,
    minHeight: 30,
    backgroundColor: "#F6EDD9",
    borderWidth: 1,
    borderColor: "#D8C5A4",
    borderRadius: 3,
  },

  batteryTerminal: {
    width: 6,
    height: 20,
    backgroundColor: "#7A573B",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },

  gaugeLabels: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  gaugeLabel: {
    color: "#94765A",
    fontSize: 10,
    fontWeight: "700",
  },

  details: {
    marginTop: 15,
    backgroundColor: "#FFF9ED",
    borderWidth: 1,
    borderColor: "#E2CEAA",
    borderRadius: 16,
    paddingHorizontal: 15,
  },

  detailRow: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },

  detailRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E9DCC4",
  },

  detailLabel: {
    flex: 1,
    color: "#665043",
    fontSize: 14,
    lineHeight: 19,
  },

  detailValue: {
    color: "#2B190F",
    fontSize: 17,
    fontWeight: "800",
  },

  explainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFE2C8",
    borderRadius: 16,
    padding: 14,
  },

  explainerIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E9",
    borderRadius: 18,
    marginRight: 11,
  },

  explainerIconText: {
    fontSize: 17,
  },

  explainerTextBlock: {
    flex: 1,
  },

  explainerTitle: {
    color: "#3A2416",
    fontSize: 13,
    fontWeight: "800",
  },

  explainerText: {
    marginTop: 2,
    color: "#6F5540",
    fontSize: 12,
    lineHeight: 17,
  },

  learnMoreButton: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 10,
  },

  learnMoreText: {
    color: "#7C4F2C",
    fontSize: 12,
    fontWeight: "800",
  },

  chevron: {
    color: "#9B6C43",
    fontSize: 25,
    lineHeight: 25,
  },

  compactFooter: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  compactFooterText: {
    marginRight: 6,
    color: "#7C4F2C",
    fontSize: 13,
    fontWeight: "800",
  },
});