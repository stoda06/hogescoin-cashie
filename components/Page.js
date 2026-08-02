import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import { CASHIE_COLOURS } from '../utils/constants';

export default function Page({ children }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.wallet}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CASHIE_COLOURS.background,
    padding: 10,
  },

  wallet: {
    flex: 1,
    backgroundColor: CASHIE_COLOURS.leather,
    borderWidth: 2,
    borderColor: CASHIE_COLOURS.copperBorder,
    borderRadius: 24,
    padding: 24,
  },
});