# Stripe Integration Setup Guide

This document provides complete instructions for setting up and configuring Stripe payments and subscriptions in MonAmiChef.

## Table of Contents
1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Stripe Edge Functions](#stripe-edge-functions)
4. [Environment Configuration](#environment-configuration)
5. [Stripe Dashboard Configuration](#stripe-dashboard-configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Stripe integration includes:
- ✅ **Database Tables**: `stripe_customers`, `stripe_subscriptions`, `stripe_orders`
- ✅ **Database Views**: `stripe_user_subscriptions`, `stripe_user_orders`
- ✅ **Prisma Models**: StripeCustomer, StripeSubscription, StripeOrder
- ⚠️ **Edge Functions**: stripe-checkout, stripe-webhook (need deployment)
- ✅ **Frontend Components**: PricingModal, Settings page, useSubscription hook

### Status Summary
- **Database**: ✅ Tables and views created successfully
- **Prisma Schema**: ✅ Models added and client generated
- **Edge Functions**: ⚠️ Extracted but need deployment (permission issue)
- **Configuration**: ⚠️ Needs Stripe API keys and product IDs

---

## Database Setup

### ✅ Completed Steps

The following database objects have been created:

#### Tables
1. **stripe_customers** - Links Supabase auth users to Stripe customers
   - `id` (bigint, primary key)
   - `user_id` (uuid, references auth.users, unique)
   - `customer_id` (text, Stripe customer ID, unique)
   - `created_at`, `updated_at`, `deleted_at`

2. **stripe_subscriptions** - Manages subscription data
   - `id` (bigint, primary key)
   - `customer_id` (text, unique)
   - `subscription_id` (text, Stripe subscription ID)
   - `price_id` (text, Stripe price ID)
   - `current_period_start`, `current_period_end` (bigint, Unix timestamps)
   - `cancel_at_period_end` (boolean)
   - `payment_method_brand`, `payment_method_last4`
   - `status` (stripe_subscription_status enum)
   - `created_at`, `updated_at`, `deleted_at`

3. **stripe_orders** - Stores one-time payment information
   - `id` (bigint, primary key)
   - `checkout_session_id`, `payment_intent_id` (text)
   - `customer_id` (text)
   - `amount_subtotal`, `amount_total` (bigint, in cents)
   - `currency`, `payment_status` (text)
   - `status` (stripe_order_status enum)
   - `created_at`, `updated_at`, `deleted_at`

#### Views
- **stripe_user_subscriptions** - User-specific subscription data
- **stripe_user_orders** - User-specific order history

#### Security
- Row Level Security (RLS) enabled on all tables
- Policies ensure users can only view their own data

---

## Stripe Edge Functions

### Location
Edge Functions are extracted to: `/tmp/supabase-functions/`
- `stripe-checkout/index.ts` (288 lines)
- `stripe-webhook/index.ts` (222 lines)

### ⚠️ Deployment Required

Due to permissions on `supabase/functions/` directory, you need to manually deploy these:

#### Option 1: Manual Copy (if you have sudo access)
```bash
# From the backend directory
sudo cp -r /tmp/supabase-functions/* supabase/functions/
sudo chown -R $USER:$USER supabase/functions/
```

#### Option 2: Deploy Directly to Supabase
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Link to your project (one-time setup)
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
npx supabase functions deploy stripe-checkout --source /tmp/supabase-functions/stripe-checkout
npx supabase functions deploy stripe-webhook --source /tmp/supabase-functions/stripe-webhook
```

### Function Descriptions

#### stripe-checkout
- **Purpose**: Creates Stripe Checkout sessions for payments and subscriptions
- **Method**: POST
- **Authentication**: Requires Bearer token (Supabase Auth)
- **Parameters**:
  - `price_id`: Stripe price ID
  - `mode`: "payment" or "subscription"
  - `success_url`: Redirect URL after successful payment
  - `cancel_url`: Redirect URL if user cancels
- **Response**: `{ sessionId, url }`

#### stripe-webhook
- **Purpose**: Handles Stripe webhook events (subscription updates, payments)
- **Method**: POST
- **Authentication**: Stripe signature verification
- **Events Handled**:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - Subscription lifecycle events

---

## Environment Configuration

### Frontend Environment Variables

Update `frontend/.env`:

```bash
# Existing Supabase config
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Customer Portal URL (optional, falls back to test URL)
# Get from: https://dashboard.stripe.com/settings/billing/portal
VITE_STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/p/login/YOUR_PORTAL_LINK
```

### Supabase Edge Functions Environment Variables

Set these in your Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/functions
2. Add the following secrets:

```bash
# Stripe Secret Key (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... in production

# Stripe Webhook Secret (from webhook endpoint settings)
STRIPE_WEBHOOK_SECRET=whsec_...

# These should already be set by Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Stripe Dashboard Configuration

### 1. Create Products and Prices

**Premium Plan** (Already Configured):
- Product ID: `prod_Si53HWH2IT2A4M`
- Price ID: `price_1RmetOIjlR3LvH1zBaQ1xU4O`
- Price: €2.99/month
- ✅ No changes needed

**Family Plan** (Needs Configuration):
1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Fill in:
   - Name: Family Plan
   - Description: Perfect for families! Share recipes and meal plans.
   - Pricing: Recurring, Monthly, €5.99
4. Click "Save product"
5. Copy the Product ID (`prod_...`) and Price ID (`price_...`)
6. Update `frontend/src/stripe-config.ts` with these IDs

### 2. Configure Customer Portal

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Enable the customer portal
3. Configure allowed actions:
   - ✅ Cancel subscription
   - ✅ Update payment method
   - ✅ View billing history
4. Copy the portal URL
5. Add to `frontend/.env` as `VITE_STRIPE_CUSTOMER_PORTAL_URL`

### 3. Set Up Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
4. Listen to events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add to Supabase Edge Functions secrets as `STRIPE_WEBHOOK_SECRET`

### 4. Configure Checkout Settings

1. Go to https://dashboard.stripe.com/settings/checkout
2. Under "Checkout branding":
   - Add your logo
   - Set brand color
3. Under "After payment":
   - Set default success/cancel URLs (optional)

---

## Testing

### Test Mode

Stripe provides test mode for development:

#### Test Cards
```
# Successful payment
4242 4242 4242 4242

# Requires authentication
4000 0025 0000 3155

# Declined card
4000 0000 0000 9995

# Use any future date for expiry, any 3 digits for CVC
```

### Testing Checklist

1. **Database Verification**:
   ```bash
   # Check tables exist
   PGPASSWORD=postgres psql -h 127.0.0.1 -p 5434 -U postgres -d postgres \
     -c "SELECT tablename FROM pg_tables WHERE tablename LIKE 'stripe%';"

   # Should show:
   # stripe_customers
   # stripe_orders
   # stripe_subscriptions
   ```

2. **Prisma Client**:
   ```bash
   npx prisma generate
   # Should complete without errors
   ```

3. **Frontend Integration**:
   - Open PricingModal component
   - Click "Subscribe Now" on Premium plan
   - Should redirect to Stripe Checkout
   - Complete payment with test card
   - Verify redirection to success page
   - Check Settings page shows active subscription

4. **Webhook Testing**:
   ```bash
   # Use Stripe CLI to forward webhooks to local
   stripe listen --forward-to https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook

   # Trigger test events
   stripe trigger checkout.session.completed
   ```

---

## Troubleshooting

### Issue: "Failed to fetch customer information"

**Cause**: Database tables don't exist or RLS policies blocking access

**Solution**:
```bash
# Verify tables exist
PGPASSWORD=postgres psql -h 127.0.0.1 -p 5434 -U postgres -d postgres \
  -c "\d stripe_customers"

# If missing, run migration again
PGPASSWORD=postgres psql -h 127.0.0.1 -p 5434 -U postgres -d postgres \
  -f /tmp/stripe_migration.sql
```

### Issue: "Webhook signature verification failed"

**Cause**: STRIPE_WEBHOOK_SECRET not set or incorrect

**Solution**:
1. Go to Stripe Dashboard > Webhooks
2. Click on your webhook endpoint
3. Click "Reveal" under "Signing secret"
4. Update Supabase Edge Functions secret

### Issue: "Stripe Edge Functions not found"

**Cause**: Functions not deployed to Supabase

**Solution**:
```bash
# Deploy from extracted location
npx supabase functions deploy stripe-checkout \
  --source /tmp/supabase-functions/stripe-checkout

npx supabase functions deploy stripe-webhook \
  --source /tmp/supabase-functions/stripe-webhook
```

### Issue: "Invalid price ID"

**Cause**: Product/Price IDs in stripe-config.ts don't match Stripe Dashboard

**Solution**:
1. Go to https://dashboard.stripe.com/products
2. Click on your product
3. Copy the Price ID from the pricing section
4. Update `frontend/src/stripe-config.ts`

### Issue: useSubscription hook returns null

**Cause**: View `stripe_user_subscriptions` not returning data

**Solution**:
```sql
-- Check view exists
SELECT viewname FROM pg_views WHERE viewname = 'stripe_user_subscriptions';

-- Test view directly (replace with your user ID)
SELECT * FROM stripe_user_subscriptions WHERE customer_id IN (
  SELECT customer_id FROM stripe_customers WHERE user_id = 'YOUR_USER_ID'
);
```

---

## Production Deployment

### Before Going Live:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Update API Keys**:
   - Replace `sk_test_...` with `sk_live_...`
   - Replace `price_test_...` with `price_live_...`
   - Update product IDs to live versions
3. **Configure Webhooks** for production URL
4. **Test thoroughly** with real (small amount) transactions
5. **Monitor**:
   - Stripe Dashboard > Events log
   - Supabase Edge Functions logs
   - Database subscription records

---

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

---

## Support

For issues specific to this integration:
1. Check this document's [Troubleshooting](#troubleshooting) section
2. Review Stripe Dashboard > Events for API errors
3. Check Supabase Dashboard > Edge Functions logs
4. Verify database tables and RLS policies

For Stripe-specific issues:
- [Stripe Support](https://support.stripe.com/)

For Supabase-specific issues:
- [Supabase Support](https://supabase.com/support)
