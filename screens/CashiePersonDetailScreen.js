import React from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COLORS = {
  paper: "#F8F4EA",
  paperDark: "#EFE8DA",
  leather: "#6E3215",
  leatherDark: "#4B210E",
  copperLight: "#D29A69",
  ink: "#1E1712",
  muted: "#6F675F",
  line: "#CFC5B6",
  green: "#167A43",
  red: "#B5231D",
  white: "#FFFDF8",
};

// Honest empty default: no fabricated history.
const DEFAULT_PERSON = {
  id: "",
  name: "",
  initials: "",
  walletAddress: "",
  paymentsSent: 0,
  paymentsReceived: 0,
  tileColor: "#4F5C5D",
  activity: [],
};

function PersonCard({ person }) {
  return (
    <View
      style={[
        styles.personCard,
        {
          backgroundColor: person.tileColor || "#4F5C5D",
        },
      ]}
    >
      <View style={styles.personCardStitching} />

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={styles.personCardText}
      >
        {person.initials ||
          String(person.name || "").toUpperCase()}
      </Text>
    </View>
  );
}

function PaymentTotals({ sent, received }) {
  return (
    <View style={styles.totalsContainer}>
      <View style={styles.totalColumn}>
        <Text style={styles.totalLabel}>PAYMENTS SENT</Text>
        <Text style={styles.totalNumber}>{sent}</Text>
      </View>

      <View style={styles.totalDivider} />

      <View style={styles.totalColumn}>
        <Text style={styles.totalLabel}>PAYMENTS RECEIVED</Text>
        <Text style={styles.totalNumber}>{received}</Text>
      </View>
    </View>
  );
}

function ActivityRow({ activity, onPress }) {
  const received = activity.type === "received";

  return (
    <Pressable
      onPress={() => onPress(activity)}
      style={({ pressed }) => [
        styles.activityRow,
        pressed && styles.activityRowPressed,
      ]}
    >
      <Text
        style={[
          styles.activityArrow,
          received ? styles.receivedArrow : styles.sentArrow,
        ]}
      >
        {received ? "↑" : "↓"}
      </Text>

      <Text style={styles.activityAmount}>{activity.amount}</Text>

      <Text style={styles.activityDate}>{activity.date}</Text>

      <Text style={styles.activityChevron}>›</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
  destructive = false,
  flex = 1,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        {
          flex,
        },
        destructive && styles.destructiveButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.secondaryButtonText,
          destructive && styles.destructiveButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function CashiePersonDetailScreen({
  person = DEFAULT_PERSON,
  onBack,
  onPay,
  onReturnToWallet,
  onEdit,
  onStatement,
  onDeleteHistory,
  onDeletePerson,
  onActivityPress,
}) {
  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }

    Alert.alert("Back", "This will return to Cashie People.");
  }

  function handleReturnToWallet() {
    const returnCallback = onReturnToWallet || onPay;

    if (returnCallback) {
      returnCallback(person);
      return;
    }

    Alert.alert("Return", "This will return to the wallet.");
  }

function handleEdit() {
  if (onEdit) {
    onEdit(person);
    return;
  }

  Alert.alert(
    'Edit Cashie Person',
    `This will open the details for ${person.name}.`
  );
}

function handleStatement() {
  if (onStatement) {
    onStatement(person);
    return;
  }

  Alert.alert(
    'Cashie Statement',
    `This will open your transaction statement with ${person.name}.`
  );
}

  function handleDeleteHistory() {
    if (onDeleteHistory) {
      onDeleteHistory(person);
      return;
    }

    Alert.alert(
      "Delete Transaction History?",
      "This removes the transaction history stored on this device. Blockchain transactions are unaffected.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("History deleted", "Local transaction history removed.");
          },
        },
      ]
    );
  }

  function handleDeletePerson() {
    if (onDeletePerson) {
      onDeletePerson(person);
      return;
    }

    Alert.alert(
      `Delete ${person.name}?`,
      "This removes the person and their local history from Cashie. Blockchain transactions are unaffected.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Person",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Person deleted",
              `${person.name} has been removed from Cashie People.`
            );
          },
        },
      ]
    );
  }

  function handleActivityPress(activity) {
    if (onActivityPress) {
      onActivityPress(activity, person);
      return;
    }

    const direction =
      activity.type === "received" ? "Received from" : "Sent to";

    Alert.alert(
      activity.amount,
      `${direction} ${person.name}\n${activity.date}`
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Cashie People"
            onPress={handleBack}
            style={styles.headerButton}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            {String(person.name || "").toUpperCase()}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="More options"
            onPress={() =>
              Alert.alert(
                person.name,
                "Edit, delete history or delete person using the buttons below."
              )
            }
            style={styles.headerButton}
          >
            <Text style={styles.moreIcon}>•••</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.personCardArea}>
            <PersonCard person={person} />
          </View>

          <PaymentTotals
            sent={person.paymentsSent}
            received={person.paymentsReceived}
          />

          <View style={styles.divider} />

          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>

            <View style={styles.activityCard}>
              {(person.activity || []).length === 0 && (
                <Text style={styles.emptyActivityText}>
                  No payments recorded yet.
                </Text>
              )}

              {(person.activity || []).map((activity, index) => (
                <View key={activity.id}>
                  <ActivityRow
                    activity={activity}
                    onPress={handleActivityPress}
                  />

                  {index < person.activity.length - 1 && (
                    <View style={styles.activityDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottomActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Return to wallet"
              onPress={handleReturnToWallet}
              style={({ pressed }) => [
                styles.payButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.payButtonText}>
                RETURN TO WALLET
              </Text>
            </Pressable>

            <View style={styles.secondaryActions}>
  <SecondaryButton
    label="EDIT"
    onPress={handleEdit}
  />

  <SecondaryButton
    label="STATEMENT"
    onPress={handleStatement}
  />
</View>

<View style={styles.secondaryActions}>
  <SecondaryButton
    label="DELETE HISTORY"
    onPress={handleDeleteHistory}
  />

  <SecondaryButton
    label="DELETE PERSON"
    onPress={handleDeletePerson}
    destructive
  />
</View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },

  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    backgroundColor: COLORS.paper,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },

  headerButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: COLORS.ink,
    fontSize: 50,
    fontWeight: "200",
    lineHeight: 49,
    marginTop: -3,
  },

  moreIcon: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },

  headerTitle: {
    color: "#4A281A",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  personCardArea: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 15,
  },

  personCard: {
    width: 142,
    height: 142,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: "#293031",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 5,
  },

  personCardStitching: {
    position: "absolute",
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    borderRadius: 15,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.copperLight,
  },

  personCardText: {
    color: COLORS.white,
    fontSize: 31,
    fontWeight: "700",
    letterSpacing: 1.2,
    paddingHorizontal: 14,
  },

  totalsContainer: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  totalColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  totalDivider: {
    width: 1,
    height: 51,
    backgroundColor: COLORS.line,
  },

  totalLabel: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 7,
    textAlign: "center",
  },

  totalNumber: {
    color: "#522A17",
    fontSize: 29,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.line,
  },

  activitySection: {
    paddingHorizontal: 19,
    paddingTop: 14,
  },

  sectionTitle: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 4,
  },

  activityCard: {
    overflow: "hidden",
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
  },

  activityRow: {
    height: 53,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    backgroundColor: COLORS.paper,
  },

  activityRowPressed: {
    backgroundColor: COLORS.paperDark,
  },

  activityArrow: {
    width: 30,
    fontSize: 31,
    fontWeight: "400",
    lineHeight: 33,
    textAlign: "center",
    marginRight: 9,
  },

  receivedArrow: {
    color: COLORS.green,
  },

  sentArrow: {
    color: COLORS.red,
  },

  activityAmount: {
    width: 102,
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "700",
  },

  activityDate: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 15,
    textAlign: "left",
  },

  activityChevron: {
    color: COLORS.muted,
    fontSize: 30,
    fontWeight: "300",
    marginBottom: 3,
  },

  activityDivider: {
    height: 1,
    marginLeft: 52,
    backgroundColor: COLORS.line,
  },

  emptyActivityText: {
    padding: 16,
    color: COLORS.muted,
    fontSize: 13,
  },

  bottomActions: {
    marginTop: "auto",
    paddingHorizontal: 19,
    paddingTop: 14,
  },

  payButton: {
    height: 48,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.leather,
    borderWidth: 1,
    borderColor: COLORS.leatherDark,
  },

  payButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  secondaryActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 10,
  },

  secondaryButton: {
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.paper,
    paddingHorizontal: 5,
  },

  secondaryButtonText: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  destructiveButton: {
    borderColor: "#D87670",
  },

  destructiveButtonText: {
    color: COLORS.red,
  },

  buttonPressed: {
    opacity: 0.75,
  },
});