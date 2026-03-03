# PayPal Payment Setup - Simple Guide

## Where Does the Money Go?

All payments go directly to **YOUR PayPal Business Account**.

## Quick Setup (5 Minutes)

### Step 1: Get Your PayPal Business Account

1. Go to https://www.paypal.com/business
2. Click "Sign Up" for a Business Account
3. Complete the registration
4. Verify your email and link your bank account

### Step 2: Get Your Client ID

1. Log in to your PayPal Business Account
2. Go to https://www.paypal.com/businessmanage/credentials/apiAccess
3. Scroll down to "REST API apps"
4. Click "Create App"
5. Enter app name: "EasyPortrait" (or any name)
6. Click "Create App"
7. **Copy your "Client ID"** - this is what you need!

### Step 3: Add to Vercel

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `REACT_APP_PAYPAL_CLIENT_ID`
   - **Value**: Paste your Client ID from Step 2
    - **Environment**: Production
    4. Click "Save"
5. Redeploy your app

### Step 4: Done! 🎉

Your app is now accepting real payments that go directly to your PayPal account!

## How It Works

```
Customer clicks "Download"
        ↓
Payment modal appears (€5 or €8)
        ↓
Customer pays via PayPal or card
        ↓
Money instantly appears in YOUR PayPal account
        ↓
You can withdraw to your bank (1-3 days)
```

## PayPal Fees

PayPal charges per transaction:
- **Fee**: 2.9% + €0.35 per transaction
- **For €5.00**: You receive ~€4.50
- **For €8.00**: You receive ~€7.42

## Monitoring Your Payments

1. Log in to https://www.paypal.com
2. Click "Activity" to see all transactions
3. Each payment shows:
   - Customer email
   - Amount paid
   - Fees deducted
   - Net amount you received
   - Transaction ID

## Withdrawing Money

1. In PayPal dashboard, click "Transfer Money"
2. Select "Transfer to Bank"
3. Enter amount
4. Money arrives in 1-3 business days

## Customer Payment Options

Customers can pay with:
- ✅ PayPal balance
- ✅ Credit/Debit cards (Visa, Mastercard, Amex)
- ✅ Bank accounts
- ✅ No PayPal account required!

## Important Notes

### Security
- ✅ PayPal handles all payment processing
- ✅ You never see customer card details
- ✅ PCI compliant automatically
- ✅ Fraud protection included

### Taxes
- You're responsible for reporting income
- PayPal provides transaction history for your accountant
- Export reports from PayPal dashboard

### Refunds
If you need to refund a customer:
1. Go to transaction in PayPal
2. Click "Refund"
3. Confirm
4. Money returns to customer (fees not refunded)

## Troubleshooting

### "PayPal Not Configured" Error
- Make sure you added `REACT_APP_PAYPAL_CLIENT_ID` in Vercel
- Redeploy after adding the variable
- Check that you copied the full Client ID

### Payment Fails
- Check your PayPal account is verified
- Ensure bank account is linked
- Check PayPal dashboard for any account issues

### Money Not Appearing
- Payments appear instantly in PayPal balance
- Check "Activity" in PayPal dashboard
- Look for the transaction ID

## Support

- PayPal Help: https://www.paypal.com/help
- Phone support available in most countries
- Live chat in PayPal dashboard

## Summary

✅ Create PayPal Business Account
✅ Get Client ID from PayPal dashboard
✅ Add to Vercel environment variables
✅ Redeploy
✅ Start receiving payments!

Money goes directly to your PayPal account. You can withdraw to your bank anytime.
