import { sendConfirmationEmail, sendMerchantNotificationEmail } from './api/_emails.js';

const testOrder = {
  id: 'TEST-123',
  orderNum: 'GHZ-999',
  total: 65.00,
  customer: {
    name: 'Jan Rojas',
    email: 'rojasporrasjan@gmail.com'
  },
  shipping: {
    name: 'Jan Rojas',
    address: { line1: '123 Fake St', city: 'Miami', state: 'FL', postal_code: '33101' }
  },
  items: [
    { name: 'JDM Classic Tee', size: 'L', qty: 1, price: 35.00 },
    { name: 'Drift King Hat', size: 'OS', qty: 1, price: 30.00 }
  ]
};

async function run() {
  console.log('Sending confirmation email...');
  await sendConfirmationEmail(testOrder);
  console.log('Sending merchant notification email...');
  await sendMerchantNotificationEmail(testOrder);
  console.log('Done!');
}
run();
