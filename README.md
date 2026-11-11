This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Razorpay application payments

The application fee is fixed on the server at ₹50 (5,000 paise). The browser cannot choose the amount, and an admit card is issued only after the server verifies the Razorpay signature and confirms the captured payment with Razorpay.

1. Create a Razorpay account and get **Test Mode** API keys from the Razorpay Dashboard.
2. Copy `.env.example` to `.env.local`. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to the test keys, and set `ADMIT_CARD_SIGNING_SECRET` to a random secret with at least 32 characters. Keep all secrets private; do not use `NEXT_PUBLIC_` variables for them.
3. Restart the Next.js server, complete an application, then use the ₹50 Razorpay Checkout button. Use Razorpay's documented test payment details; test mode does not charge real money.
4. After the server confirms the captured payment, it signs the card data and the admit card QR opens `/verify` for exam-center verification. The QR signature is not encryption: it contains the candidate name, application/roll numbers, and exam assignment, but no Aadhaar, phone, email, or address.
5. Before accepting real payments, configure live keys in the production deployment environment, enable automatic capture or confirm capture is enabled, and deploy over HTTPS.

The project currently keeps the completed application in the applicant's browser. The signed QR proves that the server issued the displayed exam assignment after confirming a captured payment, but without a persistent database it cannot support card revocation, seat reservations, or cross-device application recovery. Those require a separately configured storage and authentication service.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

1. Import this repository from the [Vercel dashboard](https://vercel.com/new) and keep the project root as the **Root Directory**. Vercel detects Next.js and the existing `npm run build` script automatically; no `vercel.json` is required.
2. In **Project Settings → Environment Variables**, add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `ADMIT_CARD_SIGNING_SECRET`. Do not prefix these server-only values with `NEXT_PUBLIC_`.
3. Use Razorpay **test-mode** keys for Preview deployments and live keys only for Production. Set a separate random signing secret of at least 32 characters for each environment; generate one locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never add secret values to Git.
4. Save the variables and redeploy so they take effect. Verify the app and payment flow with Razorpay test credentials before switching Production to live credentials.

Vercel builds and runs the Next.js server routes used by Razorpay checkout and admit-card verification. A static export is not supported because these features require server-side routes.


Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
