import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { CASHIE_COLOURS } from '../utils/constants';

export default function OptionButton({
  title,
  description,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1,
    borderColor: CASHIE_COLOURS.copper,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },

  title: {
    color: CASHIE_COLOURS.cream,
    fontSize: 19,
    fontWeight: '700',
  },

  description: {
    color: CASHIE_COLOURS.mutedText,
    fontSize: 14,
    marginTop: 6,
  },

  pressed: {
    opacity: 0.65,
  },
});