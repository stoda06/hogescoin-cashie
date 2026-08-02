import { Pressable, StyleSheet, Text } from 'react-native';
import { CASHIE_COLOURS } from '../utils/constants';

export default function MainButton({
  label,
  onPress,
  primary = false,
  disabled = false,
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        primary ? styles.primaryButton : styles.button,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={
          primary
            ? styles.primaryButtonText
            : styles.buttonText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: CASHIE_COLOURS.copper,
    borderRadius: 14,
    paddingVertical: 17,
    marginBottom: 14,
  },

  button: {
    borderWidth: 1,
    borderColor: CASHIE_COLOURS.copper,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 14,
  },

  primaryButtonText: {
    color: CASHIE_COLOURS.darkText,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  buttonText: {
    color: CASHIE_COLOURS.lightCream,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  disabledButton: {
    opacity: 0.35,
  },

  pressed: {
    opacity: 0.65,
  },
});