export interface SeedCategory {
  name: string
  slug: string
}

export interface SeedFaq {
  categorySlug: string
  question: string
  answer: string
  popularityWeight: number
}

export const seedCategories: SeedCategory[] = [
  { name: 'Account', slug: 'account' },
  { name: 'Access', slug: 'access' },
  { name: 'Password', slug: 'password' },
  { name: 'Payments', slug: 'payments' },
  { name: 'Orders', slug: 'orders' },
  { name: 'Delivery', slug: 'delivery' },
  { name: 'Cancellation', slug: 'cancellation' },
  { name: 'Security', slug: 'security' },
  { name: 'Support', slug: 'support' },
]

export const seedFaqs: SeedFaq[] = [
  {
    categorySlug: 'account',
    question: 'How do I create an account?',
    answer:
      'Open the sign-up page, fill in your name, work email and a password with at least 10 characters, then confirm the verification link we send by email. The link is valid for 24 hours.',
    popularityWeight: 6,
  },
  {
    categorySlug: 'account',
    question: 'How can I update my personal information?',
    answer:
      'Go to Settings › Profile, edit the fields you need and select Save changes. Name and phone number update immediately; changing your email requires confirming the new address.',
    popularityWeight: 5,
  },
  {
    categorySlug: 'account',
    question: 'How do I change the email address linked to my account?',
    answer:
      'In Settings › Profile choose Change email, enter the new address and confirm the message sent to it. Until you confirm, notifications keep going to the previous address.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'account',
    question: 'How do I delete my account permanently?',
    answer:
      'Settings › Privacy › Delete account starts the removal request. We keep the data for 30 days in case you change your mind, then delete it permanently. Invoices are retained for legal reasons.',
    popularityWeight: 3,
  },
  {
    categorySlug: 'account',
    question: 'Can I have more than one user in the same account?',
    answer:
      'Yes. Team plans support unlimited members. Invite people in Settings › Team and assign the Admin, Agent or Viewer role to each invitation.',
    popularityWeight: 3,
  },
  {
    categorySlug: 'access',
    question: 'Why can I not log in to my account?',
    answer:
      'The most common causes are an unconfirmed email, caps lock changing your password, or a temporary block after five failed attempts. Wait 15 minutes, confirm your email and try again with a fresh password reset.',
    popularityWeight: 7,
  },
  {
    categorySlug: 'access',
    question: 'My account is blocked, how do I unlock it?',
    answer:
      'Accounts are blocked automatically after repeated failed sign-ins. The block clears after 15 minutes; if it persists, request a password reset or contact support with your account email.',
    popularityWeight: 5,
  },
  {
    categorySlug: 'access',
    question: 'How do I sign in with Google or Microsoft?',
    answer:
      'On the sign-in screen choose Continue with Google or Continue with Microsoft. The first time you do it we link the provider to the account that uses the same email address.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'access',
    question: 'How do I log out from all devices?',
    answer:
      'Settings › Security › Active sessions lists every signed-in device. Select Revoke all sessions to end them; you will need to sign in again on each device.',
    popularityWeight: 3,
  },
  {
    categorySlug: 'password',
    question: 'How do I reset my password?',
    answer:
      'Select Forgot password on the sign-in screen, enter your email and follow the link we send. The link expires after 60 minutes and can only be used once.',
    popularityWeight: 9,
  },
  {
    categorySlug: 'password',
    question: 'I forgot my password, what should I do?',
    answer:
      'Use the Forgot password link on the sign-in screen. If the reset email does not arrive within a few minutes, check your spam folder and confirm you typed the address used at sign-up.',
    popularityWeight: 8,
  },
  {
    categorySlug: 'password',
    question: 'How do I change my password while logged in?',
    answer:
      'Go to Settings › Security › Password, type your current password and the new one. Changing the password keeps your current session active and signs out the other devices.',
    popularityWeight: 5,
  },
  {
    categorySlug: 'password',
    question: 'What are the password requirements?',
    answer:
      'Passwords need at least 10 characters, one uppercase letter, one number and one symbol. We also reject passwords found in public breach lists.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'password',
    question: 'The password reset email never arrives, what can I do?',
    answer:
      'Check the spam and promotions folders, add no-reply@atlashelpdesk.example to your safe senders and request the link again after two minutes. Corporate filters sometimes delay the message.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'payments',
    question: 'Which payment methods do you accept?',
    answer:
      'We accept Visa, Mastercard, American Express, bank transfer for annual plans, and boleto for accounts billed in Brazilian real. Debit cards are accepted when they support online payments.',
    popularityWeight: 7,
  },
  {
    categorySlug: 'payments',
    question: 'How do I update my credit card?',
    answer:
      'Open Billing › Payment methods, add the new card and set it as the default. The next invoice uses the new card; the old one can be removed right after.',
    popularityWeight: 6,
  },
  {
    categorySlug: 'payments',
    question: 'Why was my payment declined?',
    answer:
      'The most frequent reasons are insufficient limit, cards without an international purchase permission, or an expired card. Your bank usually sends the exact reason; after fixing it use Retry payment on the invoice.',
    popularityWeight: 6,
  },
  {
    categorySlug: 'payments',
    question: 'Where do I find my invoices and receipts?',
    answer:
      'Billing › Invoices lists every charge with a PDF receipt. Admins can also enable monthly invoice emails for the finance contact.',
    popularityWeight: 5,
  },
  {
    categorySlug: 'payments',
    question: 'When is my subscription charged?',
    answer:
      'Monthly plans are charged on the same day you subscribed; annual plans renew on the anniversary date. We send a reminder three days before each renewal.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'payments',
    question: 'Do you issue refunds?',
    answer:
      'Yes. Cancellations within 7 days of a charge are refunded in full. After that we refund the unused portion of annual plans; monthly plans stay active until the end of the paid period.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'orders',
    question: 'How do I track my order?',
    answer:
      'Open Orders, select the order and use Track shipment. The carrier code appears as soon as the parcel leaves our warehouse, usually within one business day.',
    popularityWeight: 8,
  },
  {
    categorySlug: 'orders',
    question: 'Where can I see my order history?',
    answer:
      'The Orders page lists every purchase with status, items and invoice. Use the date and status filters to narrow the list.',
    popularityWeight: 5,
  },
  {
    categorySlug: 'orders',
    question: 'Can I change the items in an order I already placed?',
    answer:
      'Items can be changed while the order is in the Preparing status. After it moves to Shipped you need to request a return and place a new order.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'orders',
    question: 'My order arrived damaged, what should I do?',
    answer:
      'Report it within 7 days through Orders › Report a problem and attach photos of the package and product. We arrange a replacement or full refund after review, normally in two business days.',
    popularityWeight: 3,
  },
  {
    categorySlug: 'delivery',
    question: 'How long does delivery take?',
    answer:
      'Standard delivery takes 3 to 7 business days, express delivery 1 to 2 business days. The exact estimate for your postcode is shown at checkout.',
    popularityWeight: 7,
  },
  {
    categorySlug: 'delivery',
    question: 'How much does shipping cost?',
    answer:
      'Shipping is calculated from weight and destination at checkout. Orders above 250 currency units ship free with the standard method.',
    popularityWeight: 5,
  },
  {
    categorySlug: 'delivery',
    question: 'Can I change the delivery address after ordering?',
    answer:
      'Yes, while the order has not shipped. Open the order and choose Edit address; once the carrier collects the parcel the address can no longer be changed.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'delivery',
    question: 'Do you deliver internationally?',
    answer:
      'We ship to 23 countries. International orders take 7 to 15 business days and any import duties are the responsibility of the recipient.',
    popularityWeight: 3,
  },
  {
    categorySlug: 'cancellation',
    question: 'How do I cancel my subscription?',
    answer:
      'Billing › Subscription › Cancel plan ends the renewal. You keep access until the end of the period already paid, and your data stays available for 30 days after that.',
    popularityWeight: 7,
  },
  {
    categorySlug: 'cancellation',
    question: 'How do I cancel an order?',
    answer:
      'Orders in the Preparing status can be cancelled directly from the order page. Shipped orders must be refused at delivery or returned within 7 days.',
    popularityWeight: 5,
  },
  {
    categorySlug: 'cancellation',
    question: 'Is there a cancellation fee?',
    answer:
      'No. Monthly and annual plans can be cancelled at any time with no penalty. Annual plans paid upfront are refunded proportionally to the unused months.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'cancellation',
    question: 'Can I reactivate a cancelled subscription?',
    answer:
      'Yes. Within 30 days of cancellation Billing › Subscription shows Reactivate plan and everything comes back exactly as it was, including integrations and history.',
    popularityWeight: 3,
  },
  {
    categorySlug: 'security',
    question: 'How do I enable two-factor authentication?',
    answer:
      'Settings › Security › Two-factor authentication guides you through scanning the QR code with an authenticator app. Save the recovery codes shown at the end in a safe place.',
    popularityWeight: 5,
  },
  {
    categorySlug: 'security',
    question: 'How do you protect my personal data?',
    answer:
      'Data is encrypted in transit with TLS 1.3 and at rest with AES-256. Access is restricted by role, audited, and we run third-party penetration tests every year.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'security',
    question: 'I received a suspicious email pretending to be you, what should I do?',
    answer:
      'Do not click the links. Forward the message to security@atlashelpdesk.example and delete it. We never ask for passwords or card numbers by email.',
    popularityWeight: 3,
  },
  {
    categorySlug: 'security',
    question: 'How do I review the devices connected to my account?',
    answer:
      'Settings › Security › Active sessions shows device, location and last activity for each session, and lets you revoke any of them individually.',
    popularityWeight: 3,
  },
  {
    categorySlug: 'support',
    question: 'How do I contact support?',
    answer:
      'Use the chat in the bottom-right corner of the app, or email support@atlashelpdesk.example. Include your account email and, when relevant, the order or invoice number.',
    popularityWeight: 6,
  },
  {
    categorySlug: 'support',
    question: 'What are your support hours?',
    answer:
      'Human support runs Monday to Friday, 8am to 8pm (UTC-3). Outside those hours this assistant answers registered questions and urgent tickets are queued for the next business day.',
    popularityWeight: 5,
  },
  {
    categorySlug: 'support',
    question: 'How long does it take to get a reply from support?',
    answer:
      'First reply happens within 4 business hours on average. Plans with priority support have a one business hour target for critical incidents.',
    popularityWeight: 4,
  },
  {
    categorySlug: 'support',
    question: 'How do I report a bug or ask for a new feature?',
    answer:
      'Send the details through support chat or email with steps to reproduce and screenshots. Feature requests go to the product board and we notify you when the status changes.',
    popularityWeight: 3,
  },
]

export const seedUnansweredQuestions: string[] = [
  'Do you offer a student discount?',
  'Can I integrate the platform with SAP?',
  'What is the uptime SLA of the API?',
  'How do I export all my data to Excel?',
  'Is there an Android tablet app?',
  'Can I pay with cryptocurrency?',
  'Do you have a partner or reseller program?',
  'Can I white label the assistant for my company?',
  'Do you support single sign-on with Okta?',
  'Is there a sandbox environment for testing?',
]
