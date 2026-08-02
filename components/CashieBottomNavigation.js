import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

const COLORS = {
  paper: '#F8F4EA',
  copper: '#A9612B',
  copperLight: '#CB874D',
  ink: '#271A13',
  line: '#D6CCBD',
};

function NavigationButton({
  icon,
  library = 'ion',
  label,
  active = false,
  onPress,
}) {
  const IconComponent =
    library === 'material'
      ? MaterialCommunityIcons
      : Ionicons;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        selected: active,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navigationButton,
        pressed && styles.navigationButtonPressed,
      ]}
    >
      <View style={styles.navigationIconArea}>
        <IconComponent
          name={icon}
          size={28}
          color={
            active
              ? COLORS.copper
              : COLORS.ink
          }
        />
      </View>

      <View
        style={[
          styles.activeIndicator,
          active &&
            styles.activeIndicatorVisible,
        ]}
      />
    </Pressable>
  );
}

export default function CashieBottomNavigation({
  activeScreen = 'home',
  onHome,
  onPeople,
  onDashie,
  onSettings,
}) {
  return (
    <View style={styles.navigationShell}>
      <View style={styles.topSeam} />

      <View style={styles.navigationRow}>
        <NavigationButton
          icon="home-outline"
          label="Home"
          active={activeScreen === 'home'}
          onPress={onHome}
        />

        <NavigationButton
          icon="people-outline"
          label="Cashie People"
          active={activeScreen === 'people'}
          onPress={onPeople}
        />

        <NavigationButton
          library="material"
          icon="speedometer"
          label="Cashie Dashie"
          active={activeScreen === 'dashie'}
          onPress={onDashie}
        />

        <NavigationButton
          icon="settings-outline"
          label="Settings"
          active={activeScreen === 'settings'}
          onPress={onSettings}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationShell: {
    position: 'relative',
    height: 68,
    backgroundColor: COLORS.paper,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    shadowColor: '#2A160C',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },

  topSeam: {
    position: 'absolute',
    top: 6,
    left: 16,
    right: 16,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.copperLight,
    opacity: 0.55,
  },

  navigationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: 10,
  },

  navigationButton: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingHorizontal: 4,
  },

  navigationButtonPressed: {
    opacity: 0.55,
  },

  navigationIconArea: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIndicator: {
    width: 34,
    height: 3,
    marginTop: 5,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },

  activeIndicatorVisible: {
    backgroundColor: COLORS.copper,
  },
});