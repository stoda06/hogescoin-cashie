import React, {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import * as Clipboard from 'expo-clipboard';

import CashieBottomNavigation from './CashieBottomNavigation';
import CashiePageHeader from './CashiePageHeader.js';

const COLORS = {
  paper: '#F8F4EA',
  paperDark: '#EFE7D8',
  leather: '#4B2819',
  leatherSoft: '#68402B',
  copper: '#A9612B',
  copperLight: '#CB874D',
  ink: '#271A13',
  inkSoft: '#68574A',
  line: '#D6CCBD',
  danger: '#9F352F',
  white: '#FFFFFF',
};

function shortenAddress(
  address
) {
  if (
    !address
  ) {
    return '';
  }

  if (
    address.length <=
    18
  ) {
    return address;
  }

  return `${address.slice(
    0,
    8
  )}...${address.slice(
    -8
  )}`;
}

function looksLikeSolanaAddress(
  address
) {
  const trimmedAddress =
    String(
      address || ''
    ).trim();

  const base58Pattern =
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  return base58Pattern.test(
    trimmedAddress
  );
}

function cleanWalletName(
  value
) {
  return String(
    value || ''
  )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(
      0,
      60
    );
}

function Section({
  title,
  children,
}) {
  return (
    <View
      style={
        styles.section
      }
    >
      <Text
        style={
          styles.sectionTitle
        }
      >
        {title}
      </Text>

      <View
        style={
          styles.sectionCard
        }
      >
        {children}
      </View>
    </View>
  );
}

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}) {
  return (
    <View
      style={
        styles.section
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          `${title} section`
        }
        accessibilityState={{
          expanded,
        }}
        onPress={
          onToggle
        }
        style={({
          pressed,
        }) => [
          styles.collapsibleHeader,

          pressed &&
            styles.collapsibleHeaderPressed,
        ]}
      >
        <Text
          style={
            styles.sectionTitleCollapsible
          }
        >
          {title}
        </Text>

        <Ionicons
          name={
            expanded
              ? 'chevron-down'
              : 'chevron-forward'
          }
          size={
            19
          }
          color={
            COLORS.copper
          }
        />
      </Pressable>

      {expanded ? (
        <View
          style={
            styles.sectionCard
          }
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}

function Divider() {
  return (
    <View
      style={
        styles.divider
      }
    />
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  destructive = false,
  disabled = false,
  showChevron = false,
  children,
}) {
  const content = (
    <View
      style={[
        styles.settingsRow,

        disabled &&
          styles.settingsRowDisabled,
      ]}
    >
      <View
        style={[
          styles.rowIconContainer,

          destructive &&
            styles.rowIconContainerDanger,
        ]}
      >
        <Ionicons
          name={
            icon
          }
          size={
            19
          }
          color={
            destructive
              ? COLORS.danger
              : COLORS.copper
          }
        />
      </View>

      <View
        style={
          styles.rowTextContainer
        }
      >
        <Text
          style={[
            styles.rowTitle,

            destructive &&
              styles.rowTitleDanger,
          ]}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={
              styles.rowSubtitle
            }
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {children ? (
        children
      ) : (
        <View
          style={
            styles.rowValueContainer
          }
        >
          {value ? (
            <Text
              numberOfLines={
                1
              }
              style={
                styles.rowValue
              }
            >
              {value}
            </Text>
          ) : null}

          {showChevron ? (
            <Ionicons
              name="chevron-forward"
              size={
                19
              }
              color={
                COLORS.inkSoft
              }
            />
          ) : null}
        </View>
      )}
    </View>
  );

  if (
    !onPress
  ) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        title
      }
      disabled={
        disabled
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        pressed &&
          !disabled &&
          styles.rowPressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

function WalletNameManager({
  walletName,
  onWalletNameChange,
}) {
  const [
    modalVisible,
    setModalVisible,
  ] = useState(
    false
  );

  const [
    draftName,
    setDraftName,
  ] = useState(
    walletName
  );

  const [
    validationMessage,
    setValidationMessage,
  ] = useState(
    ''
  );

  useEffect(
    () => {
      setDraftName(
        walletName
      );
    },
    [
      walletName,
    ]
  );

  function openModal() {
    setDraftName(
      walletName
    );

    setValidationMessage(
      ''
    );

    setModalVisible(
      true
    );
  }

  function closeModal() {
    setDraftName(
      walletName
    );

    setValidationMessage(
      ''
    );

    setModalVisible(
      false
    );
  }

  function saveName() {
    const cleanedName =
      cleanWalletName(
        draftName
      );

    if (
      !cleanedName
    ) {
      setValidationMessage(
        'Enter a name for this wallet.'
      );

      return;
    }

    onWalletNameChange?.(
      cleanedName
    );

    setDraftName(
      cleanedName
    );

    setValidationMessage(
      ''
    );

    setModalVisible(
      false
    );
  }

  const displayedName =
    cleanWalletName(
      walletName
    ) ||
    'Name this wallet';

  return (
    <>
      <SettingsRow
        icon="person-outline"
        title="Wallet Name"
        subtitle="Shown when someone scans your Cashie QR"
        value={
          displayedName
        }
        showChevron
        onPress={
          openModal
        }
      />

      <Modal
        visible={
          modalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closeModal
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <View
            style={
              styles.modalCard
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Wallet Name
            </Text>

            <Text
              style={
                styles.modalDescription
              }
            >
              This is the name people will see when they scan your Cashie QR.
            </Text>

            <View
              style={[
                styles.nameInputContainer,

                validationMessage
                  ? styles.addressInputContainerError
                  : null,
              ]}
            >
              <TextInput
                accessibilityLabel="Wallet name"
                autoCapitalize="words"
                autoCorrect
                maxLength={
                  60
                }
                value={
                  draftName
                }
                onChangeText={
                  value => {
                    setDraftName(
                      value
                    );

                    setValidationMessage(
                      ''
                    );
                  }
                }
                placeholder="For example, Russ or Karen's Honey"
                placeholderTextColor={
                  COLORS.inkSoft
                }
                returnKeyType="done"
                onSubmitEditing={
                  saveName
                }
                style={
                  styles.nameInput
                }
              />
            </View>

            <Text
              style={
                styles.characterCount
              }
            >
              {String(
                draftName || ''
              ).length}/60
            </Text>

            {validationMessage ? (
              <Text
                style={
                  styles.validationMessage
                }
              >
                {validationMessage}
              </Text>
            ) : null}

            <View
              style={
                styles.modalActions
              }
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel changing wallet name"
                onPress={
                  closeModal
                }
                style={({
                  pressed,
                }) => [
                  styles.cancelButton,

                  pressed &&
                    styles.modalButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  CANCEL
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save wallet name"
                onPress={
                  saveName
                }
                style={({
                  pressed,
                }) => [
                  styles.saveButton,

                  pressed &&
                    styles.modalButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  SAVE
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function MyWalletAddress({
  walletAddress,
  onCopyWalletAddress,
}) {
  return (
    <View
      style={
        styles.walletAddressBlock
      }
    >
      <View
        style={
          styles.walletAddressHeader
        }
      >
        <View
          style={
            styles.rowIconContainer
          }
        >
          <Ionicons
            name="wallet-outline"
            size={
              19
            }
            color={
              COLORS.copper
            }
          />
        </View>

        <View
          style={
            styles.rowTextContainer
          }
        >
          <Text
            style={
              styles.rowTitle
            }
          >
            Wallet Address
          </Text>

          <Text
            selectable
            numberOfLines={
              1
            }
            style={
              styles.walletAddress
            }
          >
            {shortenAddress(
              walletAddress
            )}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Copy wallet address"
        disabled={
          !walletAddress
        }
        onPress={
          onCopyWalletAddress
        }
        style={({
          pressed,
        }) => [
          styles.copyButton,

          !walletAddress &&
            styles.copyButtonDisabled,

          pressed &&
            walletAddress &&
            styles.copyButtonPressed,
        ]}
      >
        <Ionicons
          name="copy-outline"
          size={
            17
          }
          color={
            COLORS.leather
          }
        />

        <Text
          style={
            styles.copyButtonText
          }
        >
          COPY ADDRESS
        </Text>
      </Pressable>
    </View>
  );
}

function DepositWalletManager({
  depositWalletAddress,
  onDepositWalletChange,
}) {
  const [
    savedAddress,
    setSavedAddress,
  ] = useState(
    depositWalletAddress
  );

  const [
    draftAddress,
    setDraftAddress,
  ] = useState(
    depositWalletAddress
  );

  const [
    modalVisible,
    setModalVisible,
  ] = useState(
    false
  );

  const [
    validationMessage,
    setValidationMessage,
  ] = useState(
    ''
  );

  useEffect(
    () => {
      setSavedAddress(
        depositWalletAddress
      );

      setDraftAddress(
        depositWalletAddress
      );
    },
    [
      depositWalletAddress,
    ]
  );

  function openChangeModal() {
    setDraftAddress(
      savedAddress
    );

    setValidationMessage(
      ''
    );

    setModalVisible(
      true
    );
  }

  function closeChangeModal() {
    setDraftAddress(
      savedAddress
    );

    setValidationMessage(
      ''
    );

    setModalVisible(
      false
    );
  }

  async function pasteAddress() {
    try {
      const clipboardText =
        await Clipboard.getStringAsync();

      const pastedAddress =
        clipboardText.trim();

      setDraftAddress(
        pastedAddress
      );

      setValidationMessage(
        ''
      );
    } catch (
      error
    ) {
      Alert.alert(
        'Unable to paste',
        'Cashie could not read the clipboard.'
      );
    }
  }

  function requestSave() {
    const trimmedAddress =
      draftAddress.trim();

    if (
      !trimmedAddress
    ) {
      setValidationMessage(
        'Paste or enter a deposit wallet address.'
      );

      return;
    }

    if (
      !looksLikeSolanaAddress(
        trimmedAddress
      )
    ) {
      setValidationMessage(
        'Enter a valid Solana wallet address.'
      );

      return;
    }

    if (
      trimmedAddress ===
      savedAddress
    ) {
      setModalVisible(
        false
      );

      return;
    }

    Alert.alert(
      'Change deposit wallet?',
      'Future Empty Wallet transfers will be returned to this address.',
      [
        {
          text:
            'Cancel',

          style:
            'cancel',
        },

        {
          text:
            'Change',

          onPress: () => {
            setSavedAddress(
              trimmedAddress
            );

            setDraftAddress(
              trimmedAddress
            );

            setValidationMessage(
              ''
            );

            setModalVisible(
              false
            );

            onDepositWalletChange?.(
              trimmedAddress
            );
          },
        },
      ]
    );
  }

  return (
    <>
      <View
        style={
          styles.depositWalletRow
        }
      >
        <View
          style={
            styles.depositWalletDetails
          }
        >
          <View
            style={
              styles.rowIconContainer
            }
          >
            <Ionicons
              name="wallet-outline"
              size={
                19
              }
              color={
                COLORS.copper
              }
            />
          </View>

          <View
            style={
              styles.depositWalletText
            }
          >
            <Text
              style={
                styles.rowTitle
              }
            >
              Current Deposit Wallet
            </Text>

            <Text
              selectable
              numberOfLines={
                1
              }
              style={
                styles.walletAddress
              }
            >
              {shortenAddress(
                savedAddress
              )}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change deposit wallet"
          onPress={
            openChangeModal
          }
          style={({
            pressed,
          }) => [
            styles.changeButton,

            pressed &&
              styles.changeButtonPressed,
          ]}
        >
          <Text
            style={
              styles.changeButtonText
            }
          >
            Change
          </Text>

          <Ionicons
            name="chevron-forward"
            size={
              18
            }
            color={
              COLORS.copper
            }
          />
        </Pressable>
      </View>

      <Modal
        visible={
          modalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closeChangeModal
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <View
            style={
              styles.modalCard
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Change Deposit Wallet
            </Text>

            <Text
              style={
                styles.modalDescription
              }
            >
              Enter the wallet that funds Cashie and receives funds when you empty your wallet.
            </Text>

            <View
              style={[
                styles.addressInputContainer,

                validationMessage
                  ? styles.addressInputContainerError
                  : null,
              ]}
            >
              <TextInput
                accessibilityLabel="New deposit wallet address"
                autoCapitalize="none"
                autoCorrect={
                  false
                }
                multiline
                value={
                  draftAddress
                }
                onChangeText={
                  value => {
                    setDraftAddress(
                      value
                    );

                    setValidationMessage(
                      ''
                    );
                  }
                }
                placeholder="Paste Solana wallet address"
                placeholderTextColor={
                  COLORS.inkSoft
                }
                style={
                  styles.addressInput
                }
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Paste wallet address"
                onPress={
                  pasteAddress
                }
                style={({
                  pressed,
                }) => [
                  styles.pasteButton,

                  pressed &&
                    styles.pasteButtonPressed,
                ]}
              >
                <Ionicons
                  name="clipboard-outline"
                  size={
                    17
                  }
                  color={
                    COLORS.leather
                  }
                />

                <Text
                  style={
                    styles.pasteButtonText
                  }
                >
                  PASTE
                </Text>
              </Pressable>
            </View>

            {validationMessage ? (
              <Text
                style={
                  styles.validationMessage
                }
              >
                {validationMessage}
              </Text>
            ) : null}

            <View
              style={
                styles.modalActions
              }
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel changing deposit wallet"
                onPress={
                  closeChangeModal
                }
                style={({
                  pressed,
                }) => [
                  styles.cancelButton,

                  pressed &&
                    styles.modalButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  CANCEL
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save deposit wallet"
                onPress={
                  requestSave
                }
                style={({
                  pressed,
                }) => [
                  styles.saveButton,

                  pressed &&
                    styles.modalButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  SAVE
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function CashieSettings({
  walletName = '',
  onWalletNameChange,

  walletAddress = '',
  depositWalletAddress = '',

  hogesBalance = 0,
  solBalance = 0,

  localCurrencyName,
  localCurrencyCode,
  localCurrencyFlag = '🇦🇺',

  displayCurrency = 'Australian Dollar',
  currencyCode = 'AUD',

  paymentApprovalEnabled = true,

  onCopyWalletAddress,
  onEmptyWallet,
  onStartFresh,
  onFactoryReset,
  onDepositWalletChange,
  onChangeLocalCash,
  onPaymentApprovalChange,

  version,
  appVersion = '0.1.0',

  onHome,
  onPeople,
  onDashie,
  onSettings,
}) {
  const [
    myWalletExpanded,
    setMyWalletExpanded,
  ] = useState(
    true
  );

  const [
    depositWalletExpanded,
    setDepositWalletExpanded,
  ] = useState(
    false
  );

  const hogesAmount =
    Number(
      hogesBalance
    ) || 0;

  const solAmount =
    Number(
      solBalance
    ) || 0;

  const isWalletEmpty =
    hogesAmount <= 0 &&
    solAmount <= 0;

  const resolvedCurrencyName =
    localCurrencyName ||
    displayCurrency ||
    'Australian Dollar';

  const resolvedCurrencyCode =
    localCurrencyCode ||
    currencyCode ||
    'AUD';

  const resolvedVersion =
    version ||
    appVersion ||
    '0.1.0';

  function confirmWalletAction() {
    if (
      isWalletEmpty
    ) {
      Alert.alert(
        'Start fresh?',
        [
          'This will create a new Cashie wallet and start again.',
          '',
          'Your previous wallet will be removed from Cashie.',
          'Cashie People, receipts, statements and Dashie history will be cleared.',
          '',
          'Transactions from the previous wallet will remain on the blockchain.',
        ].join(
          '\n'
        ),
        [
          {
            text:
              'Cancel',

            style:
              'cancel',
          },

          {
            text:
              'Start Fresh',

            style:
              'destructive',

            onPress:
              onStartFresh ||
              onFactoryReset,
          },
        ]
      );

      return;
    }

    Alert.alert(
      'Empty wallet?',
      [
        'This will return all available HOGES and recoverable battery SOL to your deposit wallet.',
        '',
        'Your Cashie wallet address, Cashie People and local history will remain.',
      ].join(
        '\n'
      ),
      [
        {
          text:
            'Cancel',

          style:
            'cancel',
        },

        {
          text:
            'Empty Wallet',

          style:
            'destructive',

          onPress:
            onEmptyWallet,
        },
      ]
    );
  }

  return (
    <View
      style={
        styles.screen
      }
    >
      <CashiePageHeader
        title="SETTINGS"
        icon="back"
        onIconPress={
          onHome
        }
        iconAccessibilityLabel="Return to Wallet"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >

        <CollapsibleSection
          title="MY WALLET"
          expanded={
            myWalletExpanded
          }
          onToggle={() => {
            setMyWalletExpanded(
              currentValue =>
                !currentValue
            );
          }}
        >
          <WalletNameManager
            walletName={
              walletName
            }
            onWalletNameChange={
              onWalletNameChange
            }
          />

          <Divider />

          <MyWalletAddress
            walletAddress={
              walletAddress
            }
            onCopyWalletAddress={
              onCopyWalletAddress
            }
          />

          <Divider />

          <SettingsRow
            icon={
              isWalletEmpty
                ? 'sparkles-outline'
                : 'exit-outline'
            }
            title={
              isWalletEmpty
                ? 'Start Fresh'
                : 'Empty Wallet'
            }
            subtitle={
              isWalletEmpty
                ? 'Create a new wallet and start again'
                : 'Return everything to your deposit wallet'
            }
            destructive
            showChevron
            onPress={
              confirmWalletAction
            }
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="DEPOSIT WALLET"
          expanded={
            depositWalletExpanded
          }
          onToggle={() => {
            setDepositWalletExpanded(
              currentValue =>
                !currentValue
            );
          }}
        >
          <DepositWalletManager
            depositWalletAddress={
              depositWalletAddress
            }
            onDepositWalletChange={
              onDepositWalletChange
            }
          />
        </CollapsibleSection>

        <Section
          title="LOCAL CASH"
        >
          <SettingsRow
            icon="cash-outline"
            title={
              `${localCurrencyFlag} ${resolvedCurrencyName}`
            }
            subtitle="The local money Cashie displays"
            value={
              resolvedCurrencyCode
            }
            showChevron
            onPress={
              onChangeLocalCash
            }
          />
        </Section>

        <Section
          title="SECURITY"
        >
          <SettingsRow
            icon="shield-checkmark-outline"
            title="Payment approval"
            subtitle="Use device authentication before paying"
          >
            <Switch
              accessibilityLabel="Payment approval"
              value={
                paymentApprovalEnabled
              }
              onValueChange={
                onPaymentApprovalChange
              }
              trackColor={{
                false:
                  COLORS.line,

                true:
                  COLORS.copperLight,
              }}
              thumbColor={
                paymentApprovalEnabled
                  ? COLORS.leather
                  : COLORS.paper
              }
            />
          </SettingsRow>
        </Section>

        <Section
          title="ABOUT"
        >
          <SettingsRow
            icon="information-circle-outline"
            title="Version"
            value={
              resolvedVersion
            }
          />

          <Divider />

          <SettingsRow
            icon="flash-outline"
            title="Powered by Hogescoin"
          />

          <Divider />

          <SettingsRow
            icon="people-outline"
            title="People are the Network"
          />
        </Section>

        <View
          style={
            styles.madeInAustralia
          }
        >
          <Text
            style={
              styles.madeInAustraliaText
            }
          >
            Made in Australia 🇦🇺
          </Text>
        </View>
      </ScrollView>

      <CashieBottomNavigation
        activeScreen="settings"
        onHome={
          onHome
        }
        onPeople={
          onPeople
        }
        onDashie={
          onDashie
        }
        onSettings={
          onSettings
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      backgroundColor:
        COLORS.paper,
    },

    scrollContent: {
      paddingTop:
        8,

      paddingHorizontal:
        18,

      paddingBottom:
        130,
    },

    section: {
      marginBottom:
        22,
    },

    sectionTitle: {
      marginBottom:
        8,

      marginLeft:
        4,

      color:
        COLORS.copper,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        1.7,
    },

    collapsibleHeader: {
      minHeight:
        36,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        4,

      marginBottom:
        8,

      borderRadius:
        8,
    },

    collapsibleHeaderPressed: {
      opacity:
        0.65,
    },

    sectionTitleCollapsible: {
      color:
        COLORS.copper,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        1.7,
    },

    sectionCard: {
      overflow:
        'hidden',

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        14,

      backgroundColor:
        COLORS.white,
    },

    divider: {
      height:
        1,

      marginLeft:
        64,

      backgroundColor:
        COLORS.line,
    },

    settingsRow: {
      minHeight:
        72,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        15,

      paddingVertical:
        13,
    },

    settingsRowDisabled: {
      opacity:
        0.45,
    },

    rowPressed: {
      backgroundColor:
        COLORS.paperDark,
    },

    rowIconContainer: {
      width:
        36,

      height:
        36,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        13,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        18,

      backgroundColor:
        COLORS.paper,
    },

    rowIconContainerDanger: {
      borderColor:
        '#DEC3BF',

      backgroundColor:
        '#F9EEEC',
    },

    rowTextContainer: {
      flex:
        1,

      paddingRight:
        12,
    },

    rowTitle: {
      color:
        COLORS.ink,

      fontSize:
        15,

      fontWeight:
        '800',
    },

    rowTitleDanger: {
      color:
        COLORS.danger,
    },

    rowSubtitle: {
      marginTop:
        4,

      color:
        COLORS.inkSoft,

      fontSize:
        12,

      lineHeight:
        17,
    },

    rowValueContainer: {
      maxWidth:
        '44%',

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        6,
    },

    rowValue: {
      flexShrink:
        1,

      color:
        COLORS.inkSoft,

      fontSize:
        13,

      fontWeight:
        '700',

      textAlign:
        'right',
    },

    walletAddressBlock: {
      paddingHorizontal:
        15,

      paddingVertical:
        15,
    },

    walletAddressHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    walletAddress: {
      marginTop:
        4,

      color:
        COLORS.inkSoft,

      fontSize:
        13,

      fontWeight:
        '600',
    },

    copyButton: {
      minHeight:
        42,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        8,

      marginTop:
        14,

      borderWidth:
        1,

      borderColor:
        COLORS.copper,

      borderRadius:
        9,

      backgroundColor:
        COLORS.paper,
    },

    copyButtonPressed: {
      backgroundColor:
        COLORS.paperDark,
    },

    copyButtonDisabled: {
      opacity:
        0.4,
    },

    copyButtonText: {
      color:
        COLORS.leather,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        1,
    },

    depositWalletRow: {
      minHeight:
        88,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        15,

      paddingVertical:
        15,
    },

    depositWalletDetails: {
      flex:
        1,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    depositWalletText: {
      flex:
        1,

      paddingRight:
        8,
    },

    changeButton: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        3,

      paddingHorizontal:
        6,

      paddingVertical:
        10,

      borderRadius:
        8,
    },

    changeButtonPressed: {
      backgroundColor:
        COLORS.paperDark,
    },

    changeButtonText: {
      color:
        COLORS.copper,

      fontSize:
        13,

      fontWeight:
        '900',
    },

    modalBackdrop: {
      flex:
        1,

      justifyContent:
        'center',

      paddingHorizontal:
        20,

      backgroundColor:
        'rgba(39, 26, 19, 0.48)',
    },

    modalCard: {
      padding:
        20,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        18,

      backgroundColor:
        COLORS.paper,
    },

    modalTitle: {
      color:
        COLORS.leather,

      fontSize:
        21,

      fontWeight:
        '900',
    },

    modalDescription: {
      marginTop:
        8,

      color:
        COLORS.inkSoft,

      fontSize:
        13,

      lineHeight:
        19,
    },

    nameInputContainer: {
      marginTop:
        18,

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        12,

      backgroundColor:
        COLORS.white,
    },

    nameInput: {
      minHeight:
        52,

      paddingHorizontal:
        14,

      color:
        COLORS.ink,

      fontSize:
        16,

      fontWeight:
        '700',
    },

    characterCount: {
      marginTop:
        7,

      color:
        COLORS.inkSoft,

      fontSize:
        11,

      textAlign:
        'right',
    },

    addressInputContainer: {
      marginTop:
        18,

      overflow:
        'hidden',

      borderWidth:
        1,

      borderColor:
        COLORS.line,

      borderRadius:
        12,

      backgroundColor:
        COLORS.white,
    },

    addressInputContainerError: {
      borderColor:
        COLORS.danger,
    },

    addressInput: {
      minHeight:
        92,

      paddingHorizontal:
        14,

      paddingTop:
        14,

      paddingBottom:
        10,

      color:
        COLORS.ink,

      fontSize:
        14,

      lineHeight:
        20,

      textAlignVertical:
        'top',
    },

    pasteButton: {
      minHeight:
        42,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        7,

      borderTopWidth:
        1,

      borderTopColor:
        COLORS.line,

      backgroundColor:
        COLORS.paper,
    },

    pasteButtonPressed: {
      backgroundColor:
        COLORS.paperDark,
    },

    pasteButtonText: {
      color:
        COLORS.leather,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        0.8,
    },

    validationMessage: {
      marginTop:
        8,

      color:
        COLORS.danger,

      fontSize:
        12,

      fontWeight:
        '700',
    },

    modalActions: {
      flexDirection:
        'row',

      gap:
        10,

      marginTop:
        20,
    },

    cancelButton: {
      minHeight:
        46,

      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderColor:
        COLORS.copper,

      borderRadius:
        10,

      backgroundColor:
        COLORS.paper,
    },

    saveButton: {
      minHeight:
        46,

      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        10,

      backgroundColor:
        COLORS.leather,
    },

    modalButtonPressed: {
      opacity:
        0.78,
    },

    cancelButtonText: {
      color:
        COLORS.leather,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        0.8,
    },

    saveButtonText: {
      color:
        COLORS.white,

      fontSize:
        12,

      fontWeight:
        '900',

      letterSpacing:
        0.8,
    },

    madeInAustralia: {
      alignItems:
        'center',

      paddingTop:
        4,
    },

    madeInAustraliaText: {
      color:
        COLORS.inkSoft,

      fontSize:
        12,

      fontWeight:
        '700',

      letterSpacing:
        0.4,
    },
  });