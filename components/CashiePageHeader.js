import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

const COLORS = {
  paper: '#F8F4EA',

  leather: '#4B2819',
  leatherDark: '#3A1E12',

  copper: '#A9612B',
  copperLight: '#CB874D',

  line: '#D6CCBD',
};

function HeaderIcon({
  icon,
}) {
  switch (
    icon
  ) {
    case 'people':
      return (
        <Ionicons
          name="people-outline"
          size={
            22
          }
          color={
            COLORS.copperLight
          }
        />
      );

    case 'dashboard':
      return (
        <MaterialCommunityIcons
          name="speedometer"
          size={
            22
          }
          color={
            COLORS.copperLight
          }
        />
      );

    case 'settings':
      return (
        <Ionicons
          name="settings-outline"
          size={
            22
          }
          color={
            COLORS.copperLight
          }
        />
      );

    case 'back':
      return (
        <Ionicons
          name="arrow-back"
          size={24}
          color={COLORS.copperLight}
        />
      );

    case 'refresh':
      return (
        <Ionicons
          name="refresh"
          size={
            24
          }
          color={
            COLORS.copperLight
          }
        />
      );

    default:
      return null;
  }
}

export default function CashiePageHeader({
  title,
  subtitle,
  icon,
  onIconPress,
  iconAccessibilityLabel,
  reserveTitleSpace = false,
}) {
  const showTitleArea =
    Boolean(
      title ||
        subtitle ||
        reserveTitleSpace
    );

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.topRow
        }
      >
        <View
          style={
            styles.brand
          }
        >
          <Text
            style={
              styles.cashie
            }
          >
            CASHIE
          </Text>

          <Text
            style={
              styles.tagline
            }
          >
            Another way to pay
          </Text>
        </View>

        <Pressable
          accessibilityRole={
            onIconPress
              ? 'button'
              : undefined
          }
          accessibilityLabel={
            onIconPress
              ? (
                  iconAccessibilityLabel ||
                  'Cashie action'
                )
              : undefined
          }
          disabled={
            !onIconPress
          }
          onPress={
            onIconPress
          }
          style={({
            pressed,
          }) => [
            styles.iconOuter,

            pressed &&
              onIconPress &&
              styles.iconPressed,
          ]}
        >
          <View
            style={
              styles.iconInner
            }
          >
            <HeaderIcon
              icon={
                icon
              }
            />
          </View>
        </Pressable>
      </View>

      <View
        style={
          styles.divider
        }
      />

      {showTitleArea ? (
        <View
          style={[
            styles.titleArea,

            reserveTitleSpace &&
              !title &&
              !subtitle &&
              styles.reservedTitleArea,
          ]}
        >
          {title ? (
            <Text
              style={
                styles.title
              }
            >
              {title}
            </Text>
          ) : null}

          {subtitle ? (
            <Text
              style={
                styles.subtitle
              }
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      backgroundColor:
        COLORS.paper,

      paddingTop:
        14,
    },

    topRow: {
      minHeight:
        58,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        20,
    },

    brand: {
      flex:
        1,

      paddingRight:
        14,
    },

    cashie: {
      color:
        COLORS.leather,

      fontSize:
        30,

      fontWeight:
        '800',

      letterSpacing:
        4,
    },

    tagline: {
      color:
        COLORS.copper,

      marginTop:
        2,

      fontSize:
        12,

      fontWeight:
        '700',

      letterSpacing:
        1.6,
    },

    iconOuter: {
      width:
        52,

      height:
        52,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        26,

      backgroundColor:
        COLORS.copper,

      shadowColor:
        '#000',

      shadowOpacity:
        0.18,

      shadowRadius:
        6,

      shadowOffset: {
        width:
          0,

        height:
          3,
      },

      elevation:
        5,
    },

    iconPressed: {
      transform: [
        {
          scale:
            0.95,
        },
      ],
    },

    iconInner: {
      width:
        42,

      height:
        42,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        21,

      backgroundColor:
        COLORS.leatherDark,

      borderWidth:
        1,

      borderColor:
        COLORS.copperLight,
    },

    divider: {
      height:
        1,

      marginTop:
        12,

      marginHorizontal:
        20,

      backgroundColor:
        COLORS.line,
    },

    titleArea: {
      minHeight:
        76,

      justifyContent:
        'center',

      paddingHorizontal:
        20,

      paddingTop:
        16,

      paddingBottom:
        12,
    },

    reservedTitleArea: {
      minHeight:
        28,

      paddingTop:
        0,

      paddingBottom:
        0,
    },

    title: {
      color:
        COLORS.leather,

      fontSize:
        18,

      fontWeight:
        '800',

      letterSpacing:
        1,
    },

    subtitle: {
      color:
        COLORS.copper,

      marginTop:
        4,

      fontSize:
        14,
    },
  });