import React from "react";
import {
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COLORS = {
  paper: "#F8F3E8",
  paperEdge: "#DDD3C4",
  ink: "#1B1713",
  muted: "#6D655D",
  line: "#2B2723",
  green: "#1E6F43",
  leather: "#6E3215",
  white: "#FFFDF8",
};

export default function CashiePaymentReceipt({
  receipt = null,
  onDone,
}) {
  const transactionId = receipt?.transactionId
    ? String(receipt.transactionId)
    : "";

  async function handleShare() {
    const message = [
      "CASHIE",
      "PAYMENT SUCCESSFUL",
      "",
      `TO: ${receipt.recipientName}`,
      `AMOUNT: ${receipt.amount}`,
      `DATE: ${receipt.date} ${receipt.time}`,
      ...(transactionId ? [`TXN ID: ${transactionId}`] : []),
      "",
      receipt.status,
    ].join("\n");

    try {
      await Share.share({
        title: "Cashie Payment Receipt",
        message,
      });
    } catch (error) {
      console.warn("Unable to share receipt:", error);
    }
  }

  if (!receipt) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.receiptShadow}>
          <View style={styles.receipt}>
            <View style={styles.topTear} />

            <Text style={styles.brand}>C A S H I E</Text>

            <Text style={styles.rule}>
              --------------------------------
            </Text>

            <Text style={styles.successTitle}>RECEIPT UNAVAILABLE</Text>

            <Text style={styles.rule}>
              --------------------------------
            </Text>

            <Text style={styles.emptyText}>
              No payment details are available for this receipt.
            </Text>

            <View style={styles.bottomTear} />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onDone}
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.doneButtonText}>DONE</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.receiptShadow}>
        <View style={styles.receipt}>
          <View style={styles.topTear} />

          <Text style={styles.brand}>C A S H I E</Text>

          <Text style={styles.rule}>
            --------------------------------
          </Text>

          <Text style={styles.successTitle}>PAYMENT SUCCESSFUL</Text>

          <Text style={styles.rule}>
            --------------------------------
          </Text>

          <View style={styles.details}>
            <ReceiptRow
              label="TO:"
              value={String(receipt.recipientName || "").toUpperCase()}
            />
            <ReceiptRow label="AMOUNT:" value={receipt.amount} />
            <ReceiptRow
              label="DATE:"
              value={`${receipt.date}  ${receipt.time}`}
            />
            {transactionId ? (
              <ReceiptRow label="TXN ID:" value={transactionId} />
            ) : null}
          </View>

          <Text style={styles.rule}>
            --------------------------------
          </Text>

          <View style={styles.completedRow}>
            <Text style={styles.tick}>✓</Text>
            <Text style={styles.completedText}>{receipt.status}</Text>
          </View>

          <Text style={styles.thankYou}>THANK YOU</Text>

          <View style={styles.bottomTear} />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>SHARE RECEIPT</Text>
        </Pressable>

        <Pressable
          onPress={onDone}
          style={({ pressed }) => [
            styles.doneButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.doneButtonText}>DONE</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ReceiptRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
  },

  receiptShadow: {
    width: "86%",
    maxWidth: 390,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  receipt: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.paperEdge,
    paddingHorizontal: 25,
    paddingTop: 28,
    paddingBottom: 30,
  },

  topTear: {
    position: "absolute",
    top: -5,
    left: -8,
    right: -8,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EFE7D9",
    transform: [{ rotate: "-0.4deg" }],
  },

  bottomTear: {
    position: "absolute",
    bottom: -5,
    left: -8,
    right: -8,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EFE7D9",
    transform: [{ rotate: "0.4deg" }],
  },

  brand: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 5,
  },

  successTitle: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 3,
  },

  rule: {
    color: COLORS.line,
    fontFamily: "monospace",
    fontSize: 13,
    textAlign: "center",
    marginVertical: 5,
  },

  details: {
    paddingVertical: 8,
  },

  row: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  label: {
    width: 88,
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
  },

  value: {
    flex: 1,
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "right",
  },

  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  tick: {
    color: COLORS.green,
    fontSize: 27,
    fontWeight: "700",
    marginRight: 7,
  },

  completedText: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "800",
  },

  emptyText: {
    color: COLORS.muted,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 6,
  },

  thankYou: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 32,
  },

  actions: {
    width: "86%",
    maxWidth: 390,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.leather,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  secondaryButtonText: {
    color: COLORS.leather,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  doneButton: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4C200D",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.leather,
  },

  doneButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  buttonPressed: {
    opacity: 0.76,
  },
});