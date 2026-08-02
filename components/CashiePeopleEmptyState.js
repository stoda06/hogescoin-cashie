import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COLORS = {
  paper: "#F8F3E8",
  paperDark: "#EEE5D8",
  ink: "#1B1713",
  muted: "#6D655D",
  line: "#CEC3B4",
  leather: "#6E3215",
  leatherDark: "#4B210E",
  copper: "#A75B2A",
  copperLight: "#D7A277",
  white: "#FFFDF8",
};

export default function CashiePeopleEmptyState({
  onMakeFirstPayment,
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.teledex}>
          <View style={styles.teledexStitching} />

          <View style={styles.teledexPaper}>
            <View style={styles.paperLine} />
            <View style={styles.paperLine} />
            <View
              style={[
                styles.paperLine,
                styles.shortPaperLine,
              ]}
            />
          </View>

          <View style={styles.teledexTab}>
            <Text style={styles.teledexTabText}>
              A
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          YOUR CASHIE PEOPLE
        </Text>

        <Text style={styles.message}>
          People you choose to save after a
          payment will appear here.
        </Text>

        <Text style={styles.message}>
          Your Cashie People list is built
          naturally through real payments.
        </Text>

        <Pressable
          onPress={onMakeFirstPayment}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            MAKE / RECEIVE FIRST PAYMENT
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
    backgroundColor: COLORS.paper,
  },

  card: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.paperDark,
    paddingHorizontal: 24,
    paddingTop: 31,
    paddingBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  teledex: {
    width: 122,
    height: 96,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: COLORS.leatherDark,
    backgroundColor: COLORS.leather,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  teledexStitching: {
    position: "absolute",
    top: 7,
    right: 7,
    bottom: 7,
    left: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.copperLight,
  },

  teledexPaper: {
    width: 67,
    height: 48,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#A99178",
    backgroundColor: "#F5EBDD",
    paddingHorizontal: 10,
    paddingTop: 11,
  },

  paperLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: "#A9957E",
    marginBottom: 7,
  },

  shortPaperLine: {
    width: "65%",
  },

  teledexTab: {
    position: "absolute",
    right: 16,
    top: 22,
    width: 22,
    height: 22,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.leatherDark,
    backgroundColor: COLORS.copper,
    alignItems: "center",
    justifyContent: "center",
  },

  teledexTabText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },

  title: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
    marginBottom: 13,
  },

  message: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 8,
  },

  primaryButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.leatherDark,
    backgroundColor: COLORS.leather,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginTop: 20,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    textAlign: "center",
  },

  buttonPressed: {
    opacity: 0.76,
  },
});