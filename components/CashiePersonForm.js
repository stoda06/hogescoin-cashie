import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  white: "#FFFDF8",
  red: "#B5231D",
};

const DEFAULT_PERSON = {
  id: "",
  name: "",
  walletAddress: "",
  initials: "",
};

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export default function CashiePersonForm({
  mode = "add",
  person = DEFAULT_PERSON,
  onCancel,
  onSave,
  onScanAddress,
  onPasteAddress,
}) {
  const [name, setName] = useState(person.name || "");
  const [walletAddress, setWalletAddress] = useState(
    person.walletAddress || ""
  );
  const [initials, setInitials] = useState(
    person.initials || getInitials(person.name || "")
  );
  const [error, setError] = useState("");

  const isEditing = mode === "edit";

  useEffect(() => {
    setName(person.name || "");
    setWalletAddress(person.walletAddress || "");
    setInitials(person.initials || getInitials(person.name || ""));
    setError("");
  }, [person]);

  const title = isEditing ? "EDIT CASHIE PERSON" : "ADD CASHIE PERSON";
  const saveLabel = isEditing ? "SAVE CHANGES" : "ADD PERSON";

  const previewInitials = useMemo(() => {
    return initials.trim() || getInitials(name) || "?";
  }, [initials, name]);

  function handleNameChange(value) {
    setName(value);

    if (!initials.trim()) {
      setInitials(getInitials(value));
    }

    if (error) {
      setError("");
    }
  }

  function handleInitialsChange(value) {
    setInitials(value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase());
  }

  async function handlePaste() {
    if (onPasteAddress) {
      const pastedAddress = await onPasteAddress();

      if (typeof pastedAddress === "string") {
        setWalletAddress(pastedAddress);
      }
    }
  }

  async function handleScan() {
    if (onScanAddress) {
      const scannedAddress = await onScanAddress();

      if (typeof scannedAddress === "string") {
        setWalletAddress(scannedAddress);
      }
    }
  }

  function handleSave() {
    const cleanName = name.trim();
    const cleanWalletAddress = walletAddress.trim();
    const cleanInitials =
      initials.trim() || getInitials(cleanName);

    if (!cleanName) {
      setError("Enter the person’s name.");
      return;
    }

    if (!cleanWalletAddress) {
      setError("Enter or scan their wallet address.");
      return;
    }

    setError("");

    if (onSave) {
      onSave({
        ...person,
        name: cleanName,
        walletAddress: cleanWalletAddress,
        initials: cleanInitials,
      });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </Pressable>

          <Text style={styles.headerTitle}>{title}</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewSection}>
            <View style={styles.personTile}>
              <View style={styles.tileStitching} />

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.personTileText}
              >
                {previewInitials}
              </Text>
            </View>

            <Text style={styles.previewCaption}>
              This is how they will appear in Cashie People.
            </Text>
          </View>

          <View style={styles.formCard}>
            <FieldLabel label="NAME" />

            <TextInput
              value={name}
              onChangeText={handleNameChange}
              placeholder="Mum"
              placeholderTextColor="#8A8178"
              style={styles.textInput}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />

            <FieldLabel label="CARD LABEL" optional />

            <TextInput
              value={initials}
              onChangeText={handleInitialsChange}
              placeholder="MUM"
              placeholderTextColor="#8A8178"
              style={styles.textInput}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={3}
              returnKeyType="next"
            />

            <Text style={styles.helperText}>
              Up to three letters or numbers.
            </Text>

            <FieldLabel label="WALLET ADDRESS" />

            <TextInput
              value={walletAddress}
              onChangeText={(value) => {
                setWalletAddress(value);

                if (error) {
                  setError("");
                }
              }}
              placeholder="Paste or scan address"
              placeholderTextColor="#8A8178"
              style={[styles.textInput, styles.walletInput]}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.addressActions}>
              <Pressable
                onPress={handlePaste}
                style={({ pressed }) => [
                  styles.addressButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.addressButtonIcon}>▣</Text>
                <Text style={styles.addressButtonText}>PASTE</Text>
              </Pressable>

              <Pressable
                onPress={handleScan}
                style={({ pressed }) => [
                  styles.addressButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.addressButtonIcon}>⌗</Text>
                <Text style={styles.addressButtonText}>SCAN QR</Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>CASHIE PEOPLE ARE LOCAL</Text>

            <Text style={styles.noteText}>
              The name and card label are stored on this device. Payments remain
              recorded on the blockchain.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.saveButtonText}>{saveLabel}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ label, optional = false }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.fieldLabel}>{label}</Text>

      {optional ? (
        <Text style={styles.optionalLabel}>OPTIONAL</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },

  header: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingHorizontal: 16,
    backgroundColor: COLORS.paper,
  },

  headerButton: {
    width: 78,
    minHeight: 44,
    justifyContent: "center",
  },

  cancelText: {
    color: COLORS.leather,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  headerTitle: {
    flex: 1,
    color: COLORS.leatherDark,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
  },

  headerSpacer: {
    width: 78,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 19,
    paddingTop: 20,
    paddingBottom: 28,
  },

  previewSection: {
    alignItems: "center",
    marginBottom: 22,
  },

  personTile: {
    width: 118,
    height: 106,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: COLORS.leatherDark,
    backgroundColor: COLORS.copper,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  tileStitching: {
    position: "absolute",
    top: 7,
    right: 7,
    bottom: 7,
    left: 7,
    borderRadius: 11,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E6B181",
  },

  personTileText: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: 1.5,
    paddingHorizontal: 12,
  },

  previewCaption: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 10,
  },

  formCard: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 11,
    backgroundColor: COLORS.paperDark,
    padding: 17,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  fieldLabel: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  optionalLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  textInput: {
    minHeight: 47,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 7,
    backgroundColor: COLORS.white,
    color: COLORS.ink,
    fontSize: 16,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 17,
  },

  walletInput: {
    minHeight: 86,
    lineHeight: 21,
    marginBottom: 10,
  },

  helperText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -10,
    marginBottom: 17,
  },

  addressActions: {
    flexDirection: "row",
    gap: 10,
  },

  addressButton: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.leather,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addressButtonIcon: {
    color: COLORS.leather,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 7,
  },

  addressButtonText: {
    color: COLORS.leather,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  errorText: {
    color: COLORS.red,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 13,
  },

  noteCard: {
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.copper,
    backgroundColor: "#F1E9DC",
    paddingHorizontal: 15,
    paddingVertical: 13,
  },

  noteTitle: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 5,
  },

  noteText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    backgroundColor: COLORS.paper,
    paddingHorizontal: 19,
    paddingTop: 12,
    paddingBottom: 17,
  },

  saveButton: {
    height: 49,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.leatherDark,
    backgroundColor: COLORS.leather,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  buttonPressed: {
    opacity: 0.75,
  },
});