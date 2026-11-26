# Rentora

**Rent gear. List gear. Earn money.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square)
![React](https://img.shields.io/badge/React-19-149eca?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635bff?style=flat-square)

Rentora is a website for renting equipment. A customer can find gear, pick
dates, and pay with Stripe. An owner can add gear and earn money. An admin
checks new gear before other people can see it.

I built it with Next.js 16, React 19, Tailwind CSS v4, TypeScript, MongoDB,
Better Auth, and Stripe.

---

## Who uses Rentora

| User     | What they can do                                                 |
| -------- | ---------------------------------------------------------------- |
| Customer | Book gear, pay, write a review, download a receipt               |
| Owner    | Add gear, see bookings, see earnings                             |
| Admin    | Check new gear, see all bookings and payments, change user roles |

---

## 5 best features

1. **Easy sign in**  
   You can use email and password, or Google. Google users start as customers.
   A short-lived access token is created at login, and private pages and APIs
   check your role. After registering, you are sent to the login page. If you
   came from a booking link, we bring you back to your payment after login. If
   you are already signed in, the login and register pages do not open.

2. **Safe booking with Stripe**  
   Only customers can book. We check the dates and the number of units. If you
   book 2 units, you use 2 units each day. You cannot book more than the owner
   has.

3. **Admin checks new gear**  
   A new listing stays hidden until an admin approves it. If the admin says no,
   the listing is rejected. Public pages show only approved gear.

4. **Clear status everywhere**  
   A paid booking is **Active**. A stopped hold is **Cancelled**. An old rental
   is **Completed**. A listing shows **Rented** only when all its units are in
   use today.

5. **Receipts and reviews**  
   After payment, you can download a PDF receipt. You can download it again in
   **My Rentals**. A customer can write a review only after a paid rental.

---

## Run it on your computer

You need Node.js, MongoDB, and the API server next to this folder
(`../rentora node server`).

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

Put your keys in a `.env` file. You can copy the names from `.env.example`.
The API server runs on port 5000 by default. Next.js sends every `/api/...`
call to it.

These commands check the app:

```bash
npm run lint
npm run typecheck
npm run build
```

---

## Problems I faced and how I solved them

### 1. Two people could book the same dates

This was a big problem. One unit could be sold twice. I fixed it by checking
free units for each day. A date is blocked only when all units are busy. One
old rental does not hide the whole listing now.

### 2. New gear showed before the admin checked it

Owners could add gear and it went live at once. I added a review step. Now new
gear waits as **Pending review**. Only approved gear shows on the home page and
the category page.

### 3. Rental status was often wrong

A paid booking looked like a request. Old rentals still looked active. I made
simple rules. Stripe payment makes the booking **Active**. A cancelled hold
becomes **Cancelled**. A finished rental becomes **Completed**. Now the tables
show the right words.

### 4. Earnings did not match Stripe

The old earnings came from a different place. The numbers did not match real
payments. I changed it. Earnings now come only from payments that succeeded.
Rentora takes 2% and the owner gets 98%.

### 5. The PDF did not show the taka sign

The receipt looked good, but the ৳ sign was missing. The PDF font does not have
that sign. I used the word **BDT** in the PDF. Now everyone can read the amount
in a normal way.

---

## Small notes

- All data calls go through `backend-api/`. Pages do not call `fetch` directly.
- Receipts are made in the browser. We do not save PDF files on the server.
- Old rows without a quantity are treated as 1 unit. This keeps old data safe.
- There are no tests yet. I check the app with lint, typecheck, build, and the
  browser.

Made with care for renters and owners.
