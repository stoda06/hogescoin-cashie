import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COLORS = {
  overlay: "rgba(22, 15, 10, 0.58)",
  paper: "#F8F3E8",
  paperDark: "#EEE5D8",
  ink: "#1B1713",
  muted: "#6D655D",
  line: "#CEC3B4",
  leather: "#6E3215",
  leatherDark: "#4B210E",
  red: "#B5231D",
  white: "#FFFDF8",
};

export default function CashieDeleteHistoryModal({
  visible,
  personName = "this person",
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close delete history dialog"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.modalCard}>
          <View style={styles.paperInset}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>!</Text>
            </View>

            <Text style={styles.title}>DELETE HISTORY?</Text>

            <Text style={styles.message}>
              This will remove the local payment history between you and{" "}
              <Text style={styles.personName}>{personName}</Text>.
            </Text>

            <Text style={styles.note}>
              The payments themselves remain recorded on the blockchain.
            </Text>

            <View style={styles.divider} />

            <View style={styles.actions}>
              <Pressable
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>

              <Pressable
                onPress={onConfirm}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.deleteButtonText}>DELETE HISTORY</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    backgroundColor: COLORS.overlay,
  },

  modalCard: {
    width: "100%",
    maxWidth: 430,
    padding: 8,
    borderRadius: 16,
    backgroundColor: COLORS.leather,
    borderWidth: 2,
    borderColor: COLORS.leatherDark,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  paperInset: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.paper,
    paddingHorizontal: 23,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: COLORS.red,
    backgroundColor: COLORS.paperDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  iconText: {
    color: COLORS.red,
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 33,
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
    color: COLORS.ink,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },

  personName: {
    fontWeight: "800",
  },

  note: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 12,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.line,
    marginTop: 21,
    marginBottom: 16,
  },

  actions: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.leather,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: COLORS.leather,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  deleteButton: {
    flex: 1.45,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.red,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  buttonPressed: {
    opacity: 0.75,
  },
});