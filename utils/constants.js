// Demo addresses only. They are well-formed base58 so they
// pass validateAddress, but they are not funded wallets.
export const TEST_ADDRESS =
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

export const TEST_CONTACTS = [
  {
    name: 'Russ',
    address: TEST_ADDRESS,
  },
  {
    name: 'James',
    address: '4mP2rQvNJx8kTgWyBudZcXwHi5nEDLaVFo6C9RmKs9QK',
  },
  {
    name: 'Alex',
    address: '9tVRuWmEjP3xKgDnYhqZbLcF7UwSaHiN4dTfXe2Bk7LM',
  },
];

export const AUD_COINS = [
  { label: '1c', value: 1 },
  { label: '2c', value: 2 },
  { label: '5c', value: 5 },
  { label: '10c', value: 10 },
  { label: '20c', value: 20 },
  { label: '50c', value: 50 },
  { label: '$1', value: 100 },
  { label: '$2', value: 200 },
];

export const AUD_NOTES = [
  { label: '$5', value: 500 },
  { label: '$10', value: 1000 },
  { label: '$20', value: 2000 },
  { label: '$50', value: 5000 },
  { label: '$100', value: 10000 },
];

export const CASHIE_COLOURS = {
  background: '#24150f',
  leather: '#633b22',
  darkLeather: '#4a2c1b',
  copper: '#c57a31',
  copperBorder: '#bd762e',
  cream: '#fff7e8',
  lightCream: '#fff0d2',
  mutedText: '#dcb98d',
  darkText: '#28150c',
  divider: '#8f572b',
  success: '#91d176',
  error: '#ffb08a',
};