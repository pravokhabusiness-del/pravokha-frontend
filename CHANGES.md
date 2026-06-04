# Pravokha — All 18 Fixes Applied

## Fix #1 — Product Share Button
**File:** `src/feat/products/pages/ProductDetailPage/ProductDetailPage.tsx`
- Added `Share2` icon and `handleShare()` function using Web Share API with clipboard fallback
- Share button added next to Buy Now in the action buttons row

## Fix #2 — Bulk Orders → WhatsApp Admin Only
**Files:**
- `src/feat/products/pages/ProductDetailPage/ProductDetailPage.tsx`
- `src/feat/home/components/ComboOfferBanner/ComboOfferBanner.tsx`
- `src/feat/home/components/HeroCarousel/HeroCarousel.tsx`
- Changed all "Contact Admin for Bulk Orders" links from `/contact?subject=...` to direct WhatsApp: `https://wa.me/917339232817?text=...`
- Green WhatsApp-styled button with MessageCircle icon

## Fix #3 — No Customize Order
- Already not present in codebase ✅

## Fix #4 — Input Borders
**Files:**
- `src/ui/Input/Input.module.css` — 1.5px border, 2px on focus, ring shadow
- `src/ui/Textarea/Textarea.module.css` — same treatment
- `src/ui/Select/Select.module.css` — 1.5px border on trigger
- `src/styles/globals.css` — universal border rule for all input/textarea/select

## Fix #5 — SSO Login
**File:** `.env.example`
- Google OAuth already correctly wired via `@react-oauth/google` + `GoogleOAuthProvider`
- Just requires `VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID` in your `.env` file
- AuthEnhancedPage has `useOneTap`, dark/light theme support, full error handling ✅

## Fix #6 — Shipping Charges
**File:** `src/feat/checkout/pages/CheckoutPage/CheckoutPage.tsx`
- Dynamic shipping via `/orders/calculate-shipping` API already working
- Improved display: shows "Free — above ₹1999" when threshold met
- Added "Add ₹X more for FREE shipping" nudge when below threshold

## Fix #7 — Product Search
- Already fully implemented in Navbar with debounced live search + `/products?search=` URL navigation ✅

## Fix #8 — Mobile Responsive
**File:** `src/styles/globals.css`
- Added `clamp()` font sizes for h1/h2/h3 on mobile
- Minimum 36px tap targets on all interactive elements
- `overflow-x: hidden` on body to prevent horizontal scroll
- Table horizontal scroll on mobile
- Better scrollbars on desktop

## Fix #9 — WhatsApp Catalogue Banner
**File:** `src/feat/home/components/HeroCarousel/HeroCarousel.tsx`
- `whatsappSlide` always appears as last slide in carousel
- Links to `https://wa.me/c/917339232817`
- Green "WhatsApp Catalogue" badge + green CTA button
- Special green gradient overlay

## Fix #10 — Coupon & Discount
**File:** `src/feat/checkout/pages/CheckoutPage/CheckoutPage.tsx`
- Coupon input field in order summary
- Calls `POST /coupons/validate` API with cart total
- Supports both `percent` and `flat` discount types
- Shows applied coupon with savings amount and Remove button
- Discount applied before tax calculation

## Fix #11 — Banner Carousel Arrow Navigation
**Files:**
- `src/feat/home/components/HeroCarousel/HeroCarousel.tsx` — prev/next buttons
- `src/feat/home/components/HeroCarousel/HeroCarousel.module.css` — arrow button styles
- Frosted glass arrows on left/right with hover effect
- Auto-play pauses on hover

## Fix #12 — Carousel Image Responsive
**File:** `src/feat/home/components/HeroCarousel/HeroCarousel.module.css`
- Replaced fixed `height: 400px/500px/600px` with `aspect-ratio: 16/7`
- Mobile uses `aspect-ratio: 4/3` with `min-height: 220px`
- `max-height: 640px` cap to avoid oversized on large screens
- `object-fit: cover` + `object-position: center` ensures proper cropping

## Fix #13 — Combo Offer
- ComboOfferWidget fetches from `/combo-offers/product/{id}` — already fully working
- CartContext has `addMultipleToCart` and `comboSavings` — fully working
- HeroCarousel fetches from `/home/combo-offers` and merges with admin banners ✅

## Fix #14 — Mobile/Tab/Desktop Header & Sidebar
**File:** `src/styles/globals.css`
- Header `sticky top-0 z-50` enforcement
- Sheet sidebar max-height `100dvh` fix
- AdminLayout sidebar scroll area overflow fix

## Fix #15 — Skeleton Placeholder Color
**Files:**
- `src/ui/Skeleton/Skeleton.module.css` — uses `--muted` at 75% opacity, pulses to 35%
- `src/feat/home/pages/HomePage/HomePage.tsx` — all skeleton bg classes raised to `/40`–`/70`
- Hero skeleton uses `aspect-ratio: 16/7` matching actual carousel

## Fix #16 — All Navigation
- Category → `/products?category={slug}` ✅
- Subcategory → `/products?subcategory={slug}` (passed as `category` to API) ✅
- Search → `/products?search={query}` ✅
- MegaMenu desktop + Accordion mobile both correct ✅

## Fix #17 — Dark Mode
**Files:**
- `src/styles/themes/dark.css` — complete variable set (card, popover, muted-foreground, etc.)
- `src/styles/globals.css` — `.dark {}` block with all missing variables

## Fix #18 — Dynamic Banners + APK
**New Files:**
- `src/feat/admin/pages/AdminBanners/AdminBanners.tsx` — full CRUD admin UI
- `src/feat/admin/pages/AdminBanners/index.ts`
- `capacitor.config.ts` — ready for Android APK build
- `capacitor/CAPACITOR_APK_SETUP.md` — step-by-step APK guide
- `.env.example` — documented all env variables

**Modified Files:**
- `src/App.tsx` — added `/admin/banners` route + lazy import
- `src/layout/AdminLayout.tsx` — added Banners nav item in sidebar
- `src/feat/home/components/HeroCarousel/HeroCarousel.tsx` — fetches from `/banners` API, falls back to static slides if empty

---

## Backend API Required for New Features

### Banners API (for dynamic homepage carousel)
```
GET  /banners?active=true       → returns active banners
POST /banners                   → create banner (admin)
PUT  /banners/:id               → update banner (admin)
DELETE /banners/:id             → delete banner (admin)
```

### Coupons API (for checkout discount)
```
POST /coupons/validate          → body: { code, cartTotal }
                                → returns: { success, discount, type: "percent"|"flat" }
```

---

## APK Setup (Quick Start)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
See `capacitor/CAPACITOR_APK_SETUP.md` for full guide.
