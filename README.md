# CrickForm - Multi-Tournament SaaS Platform

A full-stack, Next.js 14 based SaaS application for managing multiple sports (e.g., cricket) tournament registrations. Features role-based access control, Razorpay payment gateway integration, Supabase Auth/DB, and a fully functional Super Admin Panel to oversee all creators, tournaments, and platform revenue.

---

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, ShadCN UI, React Hook Form, Zod
- **Backend:** Next.js Serverless API Routes
- **Database / Auth:** Supabase (PostgreSQL), Supabase Auth
- **Storage:** Supabase Storage (for Player Photos and Tournament Banners)
- **Payments:** Razorpay (UPI + Cards)

---

## 🛠️ Local Setup Guide

Follow these steps exactly to run the platform on your machine.

### 1. Supabase Database & Auth Setup

1. Create a free project at [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** in the Supabase dashboard.
3. Open `supabase/schema.sql` from this codebase, copy all its contents, and run it in the SQL Editor. 
   *(This creates all tables, triggers, and Row Level Security policies).*
4. **Storage Setup**:
   - Go to **Storage** → Create two new buckets:
     1. `player-images` (Set "Public bucket" switch to ON)
     2. `tournament-banners` (Set "Public bucket" switch to ON)
5. **Super Admin Setup**:
   - Go to **Authentication** → **Users** → Add user manually.
   - Enter email: `hashimoffl1@gmail.com` and set a password.
   - The database trigger automatically assigns the `SUPER_ADMIN` role to this specific email.

### 2. Razorpay Setup

1. Create an account at [Razorpay](https://razorpay.com/).
2. Go to **Dashboard** → **Settings** → **API Keys**.
3. Generate a Test API Key. Keep the Key ID and Key Secret handy.

### 3. Environment Variables config

1. Rename `.env.local.example` to `.env.local`.
2. Fill in the required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPER_ADMIN_EMAIL=hashimoffl1@gmail.com
PLATFORM_COMMISSION_PERCENT=0 # Adjust if you want the platform to take a cut (e.g., 5 = 5%)
```

### 4. Run the code locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🌐 Webhook Setup (Crucial for Payments)

To process Razorpay payments correctly, you need to configure Webhooks.

### Local Webhook Testing
Since Razorpay needs a public URL, use a tool like [ngrok](https://ngrok.com/) to expose your local port:
```bash
ngrok http 3000
```
1. Copy the `https://...` link provided by ngrok.
2. Go to Razorpay Dashboard → Settings → Webhooks → Add New Webhook.
3. Paste the URL: `https://<YOUR-NGROK-URL>/api/payment/webhook`
4. Use your `RAZORPAY_KEY_SECRET` as the "Secret".
5. Subscribe to events: `payment.captured` and `payment.authorized`.

### Production Webhooks
If deployed (e.g., on Vercel), repeat the above steps but use your live domain (e.g., `https://my-crickform.vercel.app/api/payment/webhook`).

---

## 🏗️ Production Deployment (Vercel)

1. Push this codebase to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and create a new project from your GitHub repo.
3. Add all the Environment Variables from your `.env.local` to Vercel's Environment Variables section before hitting Deploy.
4. Deploy the application.

---

## 👑 Super Admin & Creator Features

**Creator Role**
- Sign up normally → Profile defaults to `CREATOR`.
- Can access `/dashboard` to create tournaments, set fees, and view their registered players.
- Payments are restricted to their tournaments via Database Row Level Security.

**Super Admin Role**
- Assigned automatically to `hashimoffl1@gmail.com`.
- Access `/admin` to see all Creators, all Tournaments, and all Payments.

---
Enjoy building your tournaments! 🏏
