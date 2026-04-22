# PageCraft — Product & Marketing Guide

> A no-code landing page builder built for musicians, artists, and creators.
> Collect fans, track streams, run pre-save campaigns — all without writing a single line of code.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Page Builder — Sections](#2-page-builder--sections)
3. [Templates — One-Click Layouts](#3-templates--one-click-layouts)
4. [Page Settings & SEO](#4-page-settings--seo)
5. [Tracking Pixels & Ads Integration](#5-tracking-pixels--ads-integration)
6. [Publishing & QR Code](#6-publishing--qr-code)
7. [Analytics Dashboard](#7-analytics-dashboard)
8. [Fan Lead Management](#8-fan-lead-management)
9. [Smart Link & Streaming](#9-smart-link--streaming)
10. [Pre-Save Campaign](#10-pre-save-campaign)
11. [Email Marketing — Klaviyo Sync](#11-email-marketing--klaviyo-sync)
12. [Affiliate Revenue Tracking](#12-affiliate-revenue-tracking)
13. [Real Marketing Use Cases](#13-real-marketing-use-cases)
14. [Integrations Map](#14-integrations-map)

---

## 1. Product Overview

PageCraft is a **no-code landing page builder** designed specifically for music artists and creators. With a simple drag-and-drop editor, you can:

- Build **fan-facing landing pages** — album releases, tour announcements, pre-save campaigns, link-in-bio pages
- **Collect fan emails** that automatically sync to your Klaviyo mailing list
- Display **all streaming links in one place** — Spotify, Apple Music, YouTube, JioSaavn, and more
- Run **pre-save campaigns** to build anticipation for upcoming releases
- **View detailed analytics** — traffic, geography, device breakdown, link clicks
- Add **paid ad tracking pixels** — Meta, Google Ads, TikTok, Snapchat

**Tech Stack:**

- Frontend: Angular 21
- Backend: Node.js + Express + PostgreSQL (Supabase)
- Analytics: Google Analytics 4 Admin API
- Email Marketing: Klaviyo API

---

## 2. Page Builder — Sections

16 section types organized into categories:

---

### STRUCTURE

#### Header

Top navigation bar for your page.

| Setting    | Description                            |
| ---------- | -------------------------------------- |
| Logo       | Upload an image or use a text logo     |
| Nav Links  | Home, About, Tour Dates, etc.          |
| CTA Button | Optional — "Buy Tickets", "Listen Now" |
| Colors     | Background, link color, button color   |

**Marketing Use:** Display your artist brand name with a direct "Listen Now" button linking to Spotify.

---

#### Footer

Bottom section with social links and copyright.

| Setting        | Description                                      |
| -------------- | ------------------------------------------------ |
| Logo + Tagline | Brand identity                                   |
| Link Columns   | "Quick Links", "Resources" — fully customizable  |
| Social Icons   | Instagram, YouTube, Facebook, WhatsApp, Snapchat |
| Copyright      | Auto-fills with current year                     |
| Colors         | Dark background recommended                      |

**Marketing Use:** Keep fans connected — every page ends with your social media links.

---

### LAYOUT

#### Hero

The first section fans see — your most important "above the fold" impression.

| Setting          | Description                                      |
| ---------------- | ------------------------------------------------ |
| Headline         | "New Album Out Now"                              |
| Subtext          | Supporting description                           |
| Primary Button   | "Listen on Spotify" → Spotify URL                |
| Secondary Button | "Book a Show" → Contact section                  |
| Text Alignment   | Left / Center / Right                            |
| Colors           | Background, text, accent color, vertical padding |

**Marketing Use:** For album releases — a bold headline with two CTAs. What appears above the fold converts the most.

---

#### Image + Text

Side-by-side layout — photo on one side, copy on the other.

| Setting           | Description              |
| ----------------- | ------------------------ |
| Tag (small label) | "About the Artist"       |
| Heading + Body    | Main text                |
| Image             | Upload or paste URL      |
| Image Position    | Left or Right            |
| CTA Button        | Optional link below text |
| Background Color  | —                        |

**Marketing Use:** Artist bio, merch showcase, behind-the-scenes story. Image on the right with text on the left gives the best readability.

---

### CONTENT

#### Features Grid

3–4 column card grid to showcase services, offerings, or highlights.

| Setting          | Description                      |
| ---------------- | -------------------------------- |
| Title + Subtitle | Section heading                  |
| Cards            | Emoji icon + title + description |
| Columns          | 2, 3, or 4 columns               |
| Card Style       | Bordered, Shadow, or Filled      |

**Marketing Use:** "Why Join Our Fan Club" → Exclusive Merch (🛍️), Early Access (🎧), Behind-the-Scenes (🎬). Also great for showcasing tour package benefits.

---

#### Stats

Display impressive numbers — achievements and social proof at a glance.

| Setting | Description                                      |
| ------- | ------------------------------------------------ |
| Number  | "500K+", "100+", "20+"                           |
| Label   | "Monthly Streams", "Live Shows", "Cities Toured" |
| Colors  | Background, number color (accent), text color    |

**Marketing Use:** Build instant credibility — "10M+ Streams | 50+ Shows | 15 Countries Toured". Numbers are the fastest way to establish trust with new fans.

---

#### Testimonials / Reviews

Fan reviews displayed as cards — the most powerful social proof.

| Setting      | Description                                    |
| ------------ | ---------------------------------------------- |
| Review Cards | Quote text + Author + Role + Star Rating (1–5) |
| Card Style   | Bordered or Shadow                             |
| Title        | "What Fans Are Saying"                         |

**Marketing Use:** Copy quotes from Instagram comments or DMs. Visible star ratings significantly increase conversions, especially for booking inquiries.

---

#### Text Block

Free-form paragraph content — flexible and simple.

| Setting                | Description                    |
| ---------------------- | ------------------------------ |
| Content                | Any text / paragraphs          |
| Font Size              | In pixels                      |
| Max Width              | Controls readable column width |
| Text Color + Alignment | Left / Center / Right          |

**Marketing Use:** Detailed artist bio, press release copy, event details, contest terms and conditions.

---

#### FAQ

Accordion-style Q&A — questions expand on click.

| Setting             | Description                     |
| ------------------- | ------------------------------- |
| Questions + Answers | Add as many Q&A pairs as needed |
| Accent Color        | Highlight color for expand icon |
| Background          | —                               |

**Marketing Use:** Reduce repetitive DMs. On a fan club page — "When is the next tour?", "How do I get early access to merch?", "What's included in the fan package?".

---

### CONVERSION

#### CTA (Call-to-Action)

Full-width bold section that pushes a single action.

| Setting  | Description                            |
| -------- | -------------------------------------- |
| Headline | "Don't Miss Out"                       |
| Subtext  | Supporting line                        |
| Button   | Text + URL                             |
| Colors   | Background (use your brand color here) |

**Marketing Use:** Place at the end of a merch drop page — "Limited Stock. Get Yours Now." The entire section in one bold color makes it impossible to miss.

---

#### Contact Form

Collect booking inquiries, collaboration requests, press inquiries.

| Setting              | Description                                            |
| -------------------- | ------------------------------------------------------ |
| Fields Toggle        | Name, Phone, Email, Message — each toggleable          |
| WhatsApp Integration | If a WhatsApp number is set → form submits to WhatsApp |
| Title + Subtitle     | —                                                      |
| Submit Button        | Custom text and color                                  |

**Marketing Use:**

- **WhatsApp mode** — On submit, WhatsApp opens with a pre-filled message. Perfect for booking managers who work on WhatsApp.
- **Email mode** — For press, label, or collaboration inquiries.

---

#### Email Fan Gate

Email capture section — your most important tool for building a direct fan channel.

| Setting         | Description              |
| --------------- | ------------------------ |
| Headline        | "Join the Inner Circle"  |
| Subtext         | Why they should sign up  |
| Name Field      | Optional toggle          |
| Button          | "Join Now" / "Subscribe" |
| Success Message | "You're in! 🎉"          |
| Colors          | Full control             |

**Integration:** Every email automatically syncs to your **Klaviyo** list. Admin receives an email notification for every new lead.

**Marketing Use:** Build hype before a release — "Be the first to hear the new album". An email list is a direct marketing channel that doesn't depend on any algorithm.

---

### MUSIC-SPECIFIC

#### Smart Link

Your link-in-bio replacement — all streaming platforms in one clean page.

| Setting             | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| Cover Art           | Upload or paste URL                                                         |
| Track / Album Title | —                                                                           |
| Artist Name         | —                                                                           |
| Release Type        | Single, Album, EP, Mixtape                                                  |
| Platform Links      | Spotify, Apple, YouTube, Amazon, JioSaavn, Gaana, Deezer, SoundCloud, Tidal |
| Per-platform Toggle | Enable/disable + add URL per platform                                       |

**Affiliate Integration:** If affiliate codes are set in page settings, they are automatically appended to every streaming link.

**Marketing Use:** One link in your Instagram bio → this page → all platforms. Replace DistroKid or TuneCore's default smart link with your own page — you get full analytics, branding control, and email capture on the same page.

---

#### Pre-Save Campaign

Fan engagement section for upcoming releases — before they drop.

| Setting                   | Description                                      |
| ------------------------- | ------------------------------------------------ |
| Cover Art                 | Tease the artwork                                |
| Title + Artist            | —                                                |
| Release Date              | "Dropping April 25, 2025"                        |
| Headline                  | "Pre-Save Now"                                   |
| Subtext                   | Compelling reason to pre-save                    |
| Spotify Pre-Save URL      | DistroKid HyperFollow / Spotify for Artists link |
| Apple Music Pre-Add URL   | —                                                |
| Amazon Music Pre-Save URL | —                                                |
| Colors                    | Default: Spotify Green on Black                  |

**Marketing Use:** Launch 2–4 weeks before release. Share the page link on TikTok and Instagram Stories. Pre-saves send a strong algorithm signal to Spotify — more pre-saves = better placement on Release Radar and Discover Weekly on release day.

---

### MEDIA

#### Video Embed

Embed YouTube or Vimeo videos directly on your page.

| Setting              | Description                                  |
| -------------------- | -------------------------------------------- |
| Video URL            | YouTube, youtu.be, YouTube Shorts, Vimeo     |
| Section Title        | "Watch the Official Music Video"             |
| Aspect Ratio         | 16:9, 9:16 (Reels/Shorts), 4:3, 1:1 (Square) |
| Background + Padding | —                                            |
| Max Width            | —                                            |

**Marketing Use:** Embed your music video directly on the album page. Use 9:16 aspect ratio for vertical TikTok-style content. Drive video views through your page instead of sending fans directly to YouTube.

---

#### Custom HTML

Paste any HTML, CSS, or JavaScript — for advanced use cases.

| Setting             | Description                              |
| ------------------- | ---------------------------------------- |
| HTML/CSS/JavaScript | Full code editor                         |
| Preview Height      | Sets the iframe height                   |
| Image Upload        | Upload and get a URL to use in your code |

**Marketing Use:**

- Embed a Spotify playlist widget
- Add a Calendly booking widget for event inquiries
- Embed a Typeform survey or contest entry form
- Add a custom countdown timer for a release
- Embed a social proof widget (Trustpilot, etc.)

---

## 3. Templates — One-Click Layouts

Select a template and all recommended sections are instantly added.

| Template               | Sections Included                                                       | Best For                          |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------------- |
| 🎸 Musician / Artist   | Hero → Features → Stats → Image+Text → Contact                          | Artist homepage, general fan page |
| 🎵 Smart Link Page     | Smart Link                                                              | Link-in-bio replacement           |
| 💼 Business / Service  | Hero → Features → Testimonials → CTA → Contact                          | Manager, agency, recording studio |
| 🍽️ Restaurant / Cafe   | Hero → Features → Image+Text → Contact                                  | Venue, cafe, restaurant           |
| 🎉 Event / Promotion   | Hero → Stats → CTA → Contact                                            | Concert, festival, event page     |
| 💿 Album / EP Release  | Header → Hero → Smart Link → Image+Text → Fan Gate → Footer             | Full album landing page           |
| 🔔 Pre-Save Campaign   | Header → Pre-Save → Fan Gate → Footer                                   | Upcoming release hype             |
| 🫶 Fan Community       | Hero → Stats → Testimonials → Fan Gate → FAQ                            | Fan club, membership page         |
| 🎤 Tour / Concert      | Header → Hero → Features → Stats → CTA → Contact → Footer               | Tour announcement                 |
| ✨ Portfolio / Creator | Header → Hero → Image+Text → Features → Testimonials → Contact → Footer | Creator, influencer, photographer |

---

## 4. Page Settings & SEO

Found in the "Settings" tab on the right panel — page-level configurations.

### SEO

| Field                 | Purpose                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| Meta Title            | Browser tab title + Google search result headline                               |
| Meta Description      | The line shown below your title in Google — directly affects click-through rate |
| Page Background Color | Sets the full page background color                                             |
| Page Background Image | Wallpaper-style background image URL                                            |

**Marketing Use:** Include keywords in the meta title — "Artist Name New Album 2025" — to drive organic search traffic. Write compelling meta descriptions to improve click-through from Google.

### Legal

| Field                | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| Privacy Policy URL   | GDPR compliance — shown alongside the Fan Gate form |
| Terms of Service URL | Optional                                            |

---

## 5. Tracking Pixels & Ads Integration

Add advertising pixels to track and retarget your page visitors.

| Pixel                  | Field             | Use Case                                                                 |
| ---------------------- | ----------------- | ------------------------------------------------------------------------ |
| **Facebook / Meta**    | FB Pixel ID       | Retarget page visitors with Facebook Ads; track "Lead" conversion events |
| **Google Ads**         | Google Ads ID     | Track conversions from Google Search or YouTube ad campaigns             |
| **Google Tag Manager** | GTM Container ID  | Advanced custom event tracking and analytics setup                       |
| **TikTok**             | TikTok Pixel ID   | Retarget TikTok users who visited your page                              |
| **Snapchat**           | Snapchat Pixel ID | Retarget your Snapchat audience                                          |

**End-to-End Marketing Flow:**

```
Fan sees your TikTok ad
  → Clicks → Lands on your PageCraft page
  → TikTok Pixel fires (page visit recorded)
  → Fan submits email via Fan Gate
  → Meta Pixel fires "Lead" conversion event
  → Fan automatically added to Klaviyo list
  → Admin receives email notification
  → Fan enters your email nurture sequence
```

### GDPR Consent

- The Meta Pixel is gated behind a consent banner — the pixel does not fire until the user accepts
- Setting a Privacy Policy URL makes it appear in the consent banner automatically

---

## 6. Publishing & QR Code

### Publishing Flow

1. Click the **"Publish"** button in the builder
2. Your page goes live at: `https://yourdomain.com/p/your-slug`
3. **GA4 property auto-created** — a Google Analytics 4 property and data stream are created automatically
4. **QR Code generated** — a scannable QR code for the live page URL appears instantly
5. **Copy Link** or **WhatsApp Share** directly from the publish modal

### QR Code — Marketing Applications

- Print on **posters, flyers, backstage passes, and stage backdrops**
- Show in **Instagram Stories** as an alternative to the swipe-up link
- Display on stage during performances — "Scan to get the merch"
- Include in your **press kit or EPK**
- Add to your **email signature**

### Slug Customization

- `/p/new-album-2025` — readable, SEO-friendly URL
- `/p/artist-name-tour` — dedicated landing page for paid ads
- Every page has its own unique slug

---

## 7. Analytics Dashboard

Accessible at `/analytics/:pageId` — understand your traffic and performance.

### Summary Metrics

| Metric               | What It Means                                 |
| -------------------- | --------------------------------------------- |
| Sessions             | Total page visits                             |
| Users                | Unique visitors                               |
| New Users            | First-time visitors                           |
| Bounce Rate          | Percentage who left without taking any action |
| Avg Session Duration | How long visitors spend on your page          |

### Charts

| Chart                         | Insight                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| **Time Series** (Line chart)  | Traffic trend — identify which days spike after promotions |
| **Country Map** (Bar chart)   | Top 10 countries by visitor count                          |
| **Device Breakdown** (Pie)    | Desktop vs Mobile vs Tablet split                          |
| **Gender Demographics** (Pie) | Male / Female / Unknown audience composition               |
| **Traffic Source** (Pie)      | Direct / Organic Search / Social / Referral breakdown      |

### Link Click Tracking

| Column       | Description                     |
| ------------ | ------------------------------- |
| Label        | Link name (e.g., "Spotify")     |
| Slug         | Short tracking URL              |
| Target       | Destination URL                 |
| Total Clicks | All-time click count            |
| Today        | Clicks in the last 24 hours     |
| Top City     | City generating the most clicks |

**Marketing Use:** Every link on your Smart Link page is tracked individually. You can see — do more fans click Spotify or Apple Music? Where is your JioSaavn audience concentrated? If 60% of traffic is from India clicking JioSaavn — put your ad budget there next campaign.

### Time Period Filter

Today / 7 Days / 30 Days / 90 Days / All Time

### CSV Export

Download link click data for Excel, Google Sheets, or label reporting.

---

## 8. Fan Lead Management

Accessible at `/leads/:projectId` — manage all collected fan emails.

### Summary Cards

| Card           | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| Total Leads    | All emails collected across every page in the project                  |
| Klaviyo Synced | How many have been successfully pushed to Klaviyo                      |
| Top Platform   | Which source brought the most leads (Spotify, Instagram, direct, etc.) |
| Top Country    | Where most of your fans are located                                    |

### Lead Table

| Column   | Description                                          |
| -------- | ---------------------------------------------------- |
| Email    | Fan's email address                                  |
| Name     | Optional (if collected by the form)                  |
| Platform | Source — Spotify, Apple Music, YouTube, direct, etc. |
| Location | City, Country                                        |
| Segment  | Cold / Warm / Hot (automatically assigned)           |
| Klaviyo  | ✓ Synced / Pending                                   |
| Page     | Which page they subscribed from                      |
| Date     | When they subscribed                                 |

### Segments

| Segment  | Meaning                                 | Recommended Action                                |
| -------- | --------------------------------------- | ------------------------------------------------- |
| **Cold** | Just subscribed                         | Send a welcome email                              |
| **Warm** | Engaged multiple times                  | Offer exclusive content                           |
| **Hot**  | High engagement, clicked multiple links | VIP offers, early merch access, personal outreach |

### Filters

- **Platform filter** — type "spotify" to see only leads from Spotify-driven traffic
- **Segment filter** — filter to Hot fans for targeted high-value outreach

### CSV Export

Download your entire fan database — import into Mailchimp, Klaviyo, Google Sheets, or a CRM.

### Admin Email Notification

Every new lead triggers an email notification to the admin (if SMTP is configured) including: fan email, name, page title, country, and device type.

---

## 9. Smart Link & Streaming

### Supported Platforms

| Platform      | Button Color | Reach in India        |
| ------------- | ------------ | --------------------- |
| Spotify       | Green        | High (urban audience) |
| Apple Music   | Red          | Medium (iPhone users) |
| YouTube Music | Red          | Very High             |
| Amazon Music  | Orange       | Medium                |
| JioSaavn      | Teal         | Very High             |
| Gaana         | Red          | High                  |
| Deezer        | Purple       | Low                   |
| SoundCloud    | Orange       | Medium                |
| Tidal         | Black        | Low                   |

**India-Specific Note:** Always keep JioSaavn and Gaana active for Indian campaigns. They represent a significant share of Indian streaming traffic that Spotify alone misses.

### Affiliate Codes

Set codes in Page Settings → they are automatically appended to every streaming link:

- Spotify: `?si=XXXXXX`
- Apple Music: `at=XXXXX`
- Amazon Music: affiliate tracking parameter

**Use Case:** Track how many streams come from your affiliate links — useful for distributor and label reporting.

---

## 10. Pre-Save Campaign

### What Does Pre-Saving Do for an Artist?

When a fan pre-saves on Spotify:

1. The song is automatically added to their library on release day
2. **Spotify's algorithm receives a signal** — more pre-saves = better editorial placement (Release Radar, Discover Weekly)
3. The fan gets a push notification on release day

### Campaign Timeline

| Timing                 | Action                                                       |
| ---------------------- | ------------------------------------------------------------ |
| 4 weeks before release | Launch the Pre-Save page                                     |
| 3 weeks before         | Promote on TikTok + Instagram Stories                        |
| 2 weeks before         | Email blast to existing fan list                             |
| 1 week before          | Final push — Stories, Reels, WhatsApp broadcast              |
| Release Day            | Launch Smart Link page, update Pre-Save page with "It's Out" |

### Where to Get Pre-Save URLs

- **DistroKid** → "HyperFollow" feature
- **TuneCore** → Pre-save link in dashboard
- **Spotify for Artists** → Direct pre-save link (verified artists only)
- **Feature.fm** → Dedicated pre-save campaign tool
- **SubmitHub** → Promotional pre-save tool

---

## 11. Email Marketing — Klaviyo Sync

### Setup

In Project Settings:

- **Klaviyo Private API Key**: `pk_XXXXXXXX`
- **Klaviyo List ID**: `AbCdEf` (the specific list fans will be added to)

### How It Works

```
Fan submits email on Fan Gate
  → Lead saved in PageCraft database
  → Klaviyo API call → Fan added to your List
  → klaviyoSynced = true
  → Admin notification email sent
```

### Data Sent to Klaviyo

- Email address
- Name
- Source platform (Spotify, Apple, direct, etc.)
- Originating platform/campaign

### Recommended Email Sequence

| Email         | When to Send          | Content                                       |
| ------------- | --------------------- | --------------------------------------------- |
| Welcome       | Immediately           | "Thanks for joining!" + all social links      |
| Tease         | 3 days later          | Behind-the-scenes content, audio snippet      |
| Pre-Save Push | 1 week before release | Pre-save link + why it matters for the artist |
| Release Day   | Release day           | "It's OUT! Listen now" + all streaming links  |
| Follow-up     | 3 days after release  | "Thanks for your support" + merch link        |

---

## 12. Affiliate Revenue Tracking

### How It Works

Page Settings → Affiliate Codes section:

- Spotify Affiliate Code
- Apple Music Affiliate Code
- Amazon Music Affiliate Code

When a fan clicks any link on the Smart Link section → the affiliate tracking code is automatically appended to the URL.

### Revenue Potential

- **Apple Music Affiliate Program**: ~7% commission on referred subscriptions
- **Amazon Music Affiliate**: Commission on referred sign-ups
- **Spotify**: No direct affiliate program, but partner programs exist through third-party platforms

**Label / Distributor Reporting:** Affiliate-tracked streams appear separately in reports — this is useful for demonstrating organic vs paid stream acquisition to labels and distributors.

---

## 13. Real Marketing Use Cases

### Use Case 1: New Single Release — "Raat Ko Tere Paas"

**3 Weeks Before Release (Pre-Save Phase)**

```
Template: "Pre-Save Campaign"
Sections:
  - Pre-Save: Blurred cover art tease, "Dropping Feb 14"
  - Fan Gate: "Get notified the moment it drops"
  - Colors: Dark purple + gold accent

Published URL: yourpage.com/p/raat-ko-presave

Promotion:
  - Instagram Stories: Show QR code, "Scan to pre-save"
  - TikTok: BTS clip + "New song dropping soon, link in bio"
  - WhatsApp broadcast to existing contacts
```

**Release Day**

```
New page: "Smart Link Page"
Sections:
  - Smart Link: Final cover art, all platforms enabled
  - Fan Gate: "Stay updated for the next release"

Published URL: yourpage.com/p/raat-ko

Analytics after 7 days:
  - 15,000 sessions
  - JioSaavn: 4,200 clicks (28%)
  - Spotify: 3,800 clicks (25%)
  - India: 67% of all traffic
  → Decision: Increase JioSaavn promotion budget next release
```

---

### Use Case 2: Tour Announcement — "India Tour 2025"

```
Template: "Tour / Concert"
Sections:
  - Header: Artist logo
  - Hero: "India Tour 2025 — 10 Cities" + "Get Tickets" button
  - Features: 10 cards — each city with date, venue, ticket link
  - Stats: "10 Cities | 15,000+ Fans | 2 Months on the Road"
  - CTA: "Buy Tickets Now" → BookMyShow link
  - Contact: For venue bookings and corporate show inquiries
  - Footer: Social links

Analytics use:
  - See which cities had the most traffic → concentrate local radio/social ads
  - 78% mobile visitors → run mobile-first ad creatives
  - Segment Hot fans → Send early-bird ticket access email
```

---

### Use Case 3: Merch Drop — "Vintage Collection"

```
Custom build (no template):
  - Header: Logo
  - Hero: "Limited Drop: Vintage Collection" + "Shop Now" button
  - Image+Text (×3): One section per product (Tee, Hoodie, Cap)
    → Product photo + description + "Buy Now" link
  - Video Embed: Behind-the-scenes merch shoot
  - Fan Gate: "Join the waitlist for the next drop"
  - FAQ: "Shipping time?", "Return policy?", "How do I find my size?"
  - Footer

Marketing strategy:
  - Instagram: Product photography → link in bio → this page
  - Email: Klaviyo blast to existing fan list
  - Facebook Ads: Retarget past page visitors (Meta Pixel)
```

---

### Use Case 4: Fan Club Launch

```
Template: "Fan Community"
Sections:
  - Hero: "The Inner Circle — Join Today"
  - Stats: "15K+ Members | 200+ Hours of Exclusive Content | 50+ Drops"
  - Testimonials: 3 fan reviews pulled from comments
  - Fan Gate: "Join Free — Get Exclusive Access"
    → Name + Email fields, success message: "Welcome to the Inner Circle! 🎉"
  - FAQ: "What's included?", "Is it free?", "How often do you post?"

Backend:
  - Leads → Klaviyo "Fan Club" segment
  - Email flow: Welcome → Exclusive content → Merch early access
  - Hot segment → Personal voice note from artist via email
```

---

### Use Case 5: Press Kit / EPK Page

```
Custom build:
  - Header: Artist name and logo
  - Hero: "Booking & Press" headline
  - Stats: Career highlights (streams, shows, countries)
  - Image+Text: Professional bio photo + artist statement
  - Video Embed: Best live performance clip
  - Features: Press coverage — outlet name + quote + article link
  - Contact Form:
    → Name, Email, Message fields
    → WhatsApp number set → Booking managers receive WhatsApp DMs directly
  - Footer

Distribution: Share the page URL in emails to labels, venues, and press outlets.
```

---

## 14. Integrations Map

```
PageCraft
│
├── ANALYTICS
│   ├── Google Analytics 4 (auto-created on first publish)
│   ├── Google Ads (conversion pixel)
│   └── Google Tag Manager (custom events)
│
├── PAID ADS PIXELS
│   ├── Meta / Facebook Pixel (+ CAPI server-side event)
│   ├── TikTok Pixel
│   └── Snapchat Pixel
│
├── EMAIL MARKETING
│   └── Klaviyo (auto-sync every new fan lead)
│
├── MUSIC PLATFORMS
│   ├── Spotify (smart links + affiliate codes + pre-save)
│   ├── Apple Music (smart links + affiliate codes + pre-add)
│   ├── Amazon Music (smart links + affiliate codes + pre-save)
│   ├── YouTube Music (smart links)
│   ├── JioSaavn (smart links)
│   ├── Gaana (smart links)
│   ├── Deezer, SoundCloud, Tidal (smart links)
│   └── YouTube / Vimeo (video embed)
│
├── COMMUNICATION
│   ├── WhatsApp (contact form redirect with pre-filled message)
│   └── Email SMTP (admin notifications on every new lead)
│
└── CUSTOM / ADVANCED
    ├── Custom HTML (Calendly, Typeform, countdown timers, etc.)
    └── Image CDN (uploaded files served via /uploads/)
```

---

## Quick Reference — Feature to Marketing Goal

| Feature                      | Marketing Goal                                                         |
| ---------------------------- | ---------------------------------------------------------------------- |
| Smart Link                   | Drive streams to all platforms from a single link                      |
| Pre-Save Campaign            | Build Spotify algorithm signals and fan anticipation before release    |
| Email Fan Gate               | Grow an owned email list that doesn't depend on any algorithm          |
| Contact Form (WhatsApp mode) | Route booking inquiries directly to a manager's WhatsApp               |
| Stats Section                | Establish social proof and credibility with numbers                    |
| Testimonials                 | Let fans sell to other fans — the most trusted form of marketing       |
| Meta Pixel + CAPI            | Facebook and Instagram ad retargeting with server-side accuracy        |
| TikTok Pixel                 | Retarget TikTok viewers who clicked your link                          |
| Klaviyo Sync                 | Trigger email sequences automatically after a fan signs up             |
| Analytics Dashboard          | Identify which platform and country to focus your ad spend on          |
| Link Click Tracking          | See Spotify vs Apple Music split — make data-driven budget decisions   |
| QR Code                      | Bridge offline events and print materials to your online page          |
| CSV Export                   | Import fan data into any CRM, or use for Facebook Custom Audiences     |
| Affiliate Codes              | Earn commission on streams and track platform-level performance        |
| Custom HTML                  | Embed anything — Spotify players, Calendly, Typeform, countdown timers |

---

_PageCraft — Built for Music._
