import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { CASHIE_COLOURS } from '../utils/constants';

export default function DenominationButton({
  label,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '31%',
    minHeight: 58,
    backgroundColor: CASHIE_COLOURS.darkLeather,
    borderWidth: 1,
    borderColor: CASHIE_COLOURS.copper,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  text: {
    color: CASHIE_COLOURS.cream,
    fontSize: 18,
    fontWeight: '800',
  },

  pressed: {
    backgroundColor: CASHIE_COLOURS.copper,
    transform: [{ scale: 0.96 }],
  },
});