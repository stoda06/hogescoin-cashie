import React, { useMemo } from "react";
import {
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COLORS = {
  paper: "#F8F3E8",
  paperEdge: "#D8CEC0",
  ink: "#1B1713",
  muted: "#6B635B",
  leather: "#6E3215",
  leatherDark: "#4B210E",
  white: "#FFFDF8",
};

function formatMoney(amount) {
  const sign = amount >= 0 ? "+" : "-";
  const absoluteAmount = Math.abs(amount).toFixed(2);

  return `${sign}A$${absoluteAmount}`;
}

function formatCents(cents) {
  const sign = cents >= 0 ? "+" : "-";
  const absoluteAmount = (Math.abs(cents) / 100).toFixed(2);

  return `${sign}A$${absoluteAmount}`;
}

function StatementRule() {
  return (
    <Text style={styles.rule}>
      ----------------------------------------
    </Text>
  );
}

function StatementRow({ transaction }) {
  return (
    <View style={styles.transactionRow}>
      <Text style={[styles.transactionText, styles.dateColumn]}>
        {transaction.date}
      </Text>

      <Text style={[styles.transactionText, styles.descriptionColumn]}>
        {transaction.description}
      </Text>

      <Text style={[styles.transactionText, styles.amountColumn]}>
        {formatMoney(transaction.amount)}
      </Text>
    </View>
  );
}

export default function CashieStatement({
  statement = null,
  onDone,
}) {
  const transactions = Array.isArray(statement?.transactions)
    ? statement.transactions
    : [];

  const relationshipName = String(statement?.relationshipName || "");
  const walletAddress = String(statement?.walletAddress || "");

  const totals = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        const cents = Math.round(Number(transaction.amount || 0) * 100);

        if (cents < 0) {
          result.sentCents += Math.abs(cents);
        } else {
          result.receivedCents += cents;
        }

        return result;
      },
      {
        sentCents: 0,
        receivedCents: 0,
      }
    );
  }, [transactions]);

  const netCents = totals.receivedCents - totals.sentCents;

  async function handleShare() {
    const transactionLines = transactions.map((transaction) => {
      return [
        transaction.date,
        transaction.description,
        formatMoney(transaction.amount),
      ].join(" | ");
    });

    const message = [
      "CASHIE STATEMENT",
      "",
      `RELATIONSHIP: ${relationshipName.toUpperCase()}`,
      `WALLET: ${walletAddress}`,
      "",
      ...transactionLines,
      "",
      `TOTAL SENT: -A$${(totals.sentCents / 100).toFixed(2)}`,
      `TOTAL RECEIVED: +A$${(totals.receivedCents / 100).toFixed(2)}`,
      `NET: ${formatCents(netCents)}`,
    ].join("\n");

    try {
      await Share.share({
        title: "Cashie Statement",
        message,
      });
    } catch (error) {
      console.warn("Unable to share statement:", error);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.statementShadow}>
        <View style={styles.statement}>
          <View style={styles.topPaperEdge} />

          <Text style={styles.heading}>CASHIE STATEMENT</Text>

          <StatementRule />

          <View style={styles.relationshipSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>RELATIONSHIP:</Text>

              <Text style={styles.detailValue}>
                {relationshipName.toUpperCase()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>WALLET:</Text>

              <Text style={styles.detailValue}>
                {walletAddress}
              </Text>
            </View>
          </View>

          <StatementRule />

          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.dateColumn]}>DATE</Text>

            <Text style={[styles.headerText, styles.descriptionColumn]}>
              DESCRIPTION
            </Text>

            <Text style={[styles.headerText, styles.amountColumn]}>
              AMOUNT
            </Text>
          </View>

          <StatementRule />

          <View style={styles.transactions}>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <StatementRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                No transactions in this period.
              </Text>
            )}
          </View>

          <StatementRule />

          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL SENT:</Text>

              <Text style={styles.totalValue}>
                -A${(totals.sentCents / 100).toFixed(2)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL RECEIVED:</Text>

              <Text style={styles.totalValue}>
                +A${(totals.receivedCents / 100).toFixed(2)}
              </Text>
            </View>
          </View>

          <StatementRule />

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>NET:</Text>

            <Text style={styles.netValue}>{formatCents(netCents)}</Text>
          </View>

          <View style={styles.bottomPaperEdge} />
        </View>
      </View>

      <View style={styles.actions}>
        {transactions.length > 0 ? (
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>SHARE STATEMENT</Text>
          </Pressable>
        ) : null}

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

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
  },

  statementShadow: {
    width: "94%",
    maxWidth: 460,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  statement: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.paperEdge,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 26,
  },

  topPaperEdge: {
    position: "absolute",
    top: -4,
    left: -8,
    right: -8,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#EEE6D8",
    transform: [{ rotate: "-0.3deg" }],
  },

  bottomPaperEdge: {
    position: "absolute",
    bottom: -4,
    left: -8,
    right: -8,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#EEE6D8",
    transform: [{ rotate: "0.3deg" }],
  },

  heading: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
    marginBottom: 3,
  },

  rule: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 11,
    textAlign: "center",
    marginVertical: 4,
  },

  relationshipSection: {
    paddingVertical: 7,
  },

  detailRow: {
    flexDirection: "row",
    minHeight: 28,
    alignItems: "flex-start",
  },

  detailLabel: {
    width: 118,
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 19,
  },

  detailValue: {
    flex: 1,
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 19,
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 4,
  },

  headerText: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "800",
  },

  transactions: {
    paddingVertical: 5,
  },

  transactionRow: {
    flexDirection: "row",
    minHeight: 27,
    alignItems: "center",
  },

  transactionText: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "500",
  },

  emptyText: {
    color: COLORS.muted,
    fontFamily: "monospace",
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 14,
  },

  dateColumn: {
    width: "33%",
    textAlign: "left",
  },

  descriptionColumn: {
    width: "34%",
    textAlign: "left",
  },

  amountColumn: {
    width: "33%",
    textAlign: "right",
  },

  totalSection: {
    paddingVertical: 7,
  },

  totalRow: {
    flexDirection: "row",
    minHeight: 28,
    alignItems: "center",
  },

  totalLabel: {
    flex: 1,
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
  },

  totalValue: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },

  netRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
  },

  netLabel: {
    flex: 1,
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "800",
  },

  netValue: {
    color: COLORS.ink,
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },

  actions: {
    width: "94%",
    maxWidth: 460,
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
    letterSpacing: 0.3,
  },

  doneButton: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.leatherDark,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.leather,
  },

  doneButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  buttonPressed: {
    opacity: 0.76,
  },
});