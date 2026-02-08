# Member Portal — Club Staff Guide

**Audience**: Club operations staff (General Manager, Golf Pro, F&B Manager, Membership Director)
**Purpose**: How to configure and manage your club's member portal

---

## Getting Started

### Accessing the Admin Panel

1. Log in to your ClubVantage Application (staff admin) at your admin URL
   - Example: `admin.royalclub.clubvantage.app`
2. Navigate to **Settings** → **Member Portal**
3. You'll see the portal configuration dashboard

### What You Can Configure

| Area | Self-Service | Requires ClubVantage Support |
|------|-------------|------------------------------|
| Club logo | ✅ | — |
| Brand colors | ✅ | — |
| Welcome message | ✅ | — |
| Feature toggles | ✅ | — |
| Golf booking rules | ✅ | — |
| Facility settings | ✅ | — |
| Notification templates | ✅ | — |
| Member management | ✅ | — |
| Announcements | ✅ | — |
| Custom domain | — | ✅ |
| Advanced theming (fonts, layout) | — | ✅ |
| Payment gateway setup | — | ✅ |
| SMS notifications | — | ✅ |
| Bulk data import | — | ✅ |

---

## Section 1: Branding

### Upload Your Club Logo

1. Go to **Settings** → **Member Portal** → **Branding**
2. Click the logo area to upload
3. Accepted formats: SVG (recommended), PNG (minimum 512×512 pixels)
4. Transparent background works best
5. Preview shows how the logo appears in:
   - Login screen (large, centered)
   - Navigation bar (small, top-left)
   - PWA home screen icon (square crop)

### Set Brand Colors

1. **Primary Color**: Your main brand color
   - Click the color picker or enter a hex code (e.g., `#1a5f3d`)
   - Used for buttons, active navigation, highlights
2. **Secondary Color**: Your accent color
   - Used for success indicators, secondary buttons
3. **Live Preview**: The right panel shows how your portal looks with the new colors
4. Click **Save** when satisfied
5. **Reset to Defaults**: Returns to ClubVantage default colors (amber/emerald)

Changes take effect within 5 minutes for all members.

### Edit Welcome Message

1. **Settings** → **Member Portal** → **Branding** → **Welcome Message**
2. This text appears on the dashboard greeting
3. Use `{{memberName}}` to insert the member's name
4. Example: "Welcome to Royal Club, {{memberName}}"
5. Maximum 100 characters

---

## Section 2: Feature Toggles

### Managing Module Visibility

Go to **Settings** → **Member Portal** → **Features**

Each toggle controls what members see in their portal:

| Toggle | What It Controls | Notes |
|--------|-----------------|-------|
| **Golf** | Golf tab in navigation | Shows tee time browsing and booking |
| **Bookings** | Bookings tab in navigation | Shows facility browsing and booking |
| **Statements** | Statements section | Shows balance, transactions, PDFs |
| **Online Payments** | "Pay Now" button on statements | Requires payment gateway — contact ClubVantage |
| **Balance on Dashboard** | Balance card on home screen | Some clubs prefer to hide this |
| **Member ID QR** | QR code tab in navigation | Used for check-in and POS charges |
| **Push Notifications** | Notification subscription | Members can opt-in to receive alerts |
| **Dark Mode** | Dark mode toggle in member profile | Optional UI preference |
| **Language Switcher** | EN/TH toggle in member profile | Disable if single-language club |

Changes take effect **immediately** — no deploy or restart needed.

### Golf Settings

If Golf is enabled:

1. **Advance Booking Window** — How many days ahead members can book
   - Set per membership tier (e.g., Premium: 14 days, Standard: 7 days)
2. **Guest Limits**
   - Max guests per booking (typically 3)
   - Max guest rounds per member per month
3. **Cart & Caddy Requests**
   - Allow members to request carts via portal: on/off
   - Allow members to request caddies via portal: on/off
   - If off, only staff can assign carts/caddies

### Facility Settings

If Bookings is enabled:

1. **Visible Facilities** — Check which facilities appear in the portal
2. **Auto-Approve** — Per facility toggle
   - On: Member bookings are instantly confirmed
   - Off: Bookings go to "Pending" — staff must approve in the admin panel
3. **Duration Limits** — Min and max booking hours per facility
4. **Advance Booking** — How far ahead members can book (days)

### Billing Settings

If Statements is enabled:

1. **Show Balance** — Display current balance on dashboard
2. **Online Payments** — Enable "Pay Now" button (requires payment gateway — contact ClubVantage to set up)
3. **Statement PDF Download** — Allow members to download monthly statement PDFs

---

## Section 3: Notifications

### Configure Notification Templates

Go to **Settings** → **Member Portal** → **Notifications**

| Notification | When It Sends | Customizable |
|-------------|---------------|-------------|
| Booking Confirmed | Immediately after booking | Message text |
| Booking Reminder | Configurable: 24h or 2h before | Timing + message |
| Booking Cancelled | When staff or member cancels | Message text |
| Payment Received | After successful payment | Message text |
| Statement Available | When monthly statement generates | Message text |
| Club Announcement | When you publish an announcement | Title + body |

### Channel Settings

| Channel | Status | Notes |
|---------|--------|-------|
| Push Notifications | Toggle on/off | Works when member has portal installed as PWA |
| Email | Toggle on/off | Sends to member's registered email |
| SMS | Contact ClubVantage | Requires SMS provider setup (additional cost) |

### Booking Reminder Timing

Choose when booking reminders are sent:
- **24 hours before** (recommended)
- **2 hours before**
- **Both** (24h + 2h)
- **None** (disable reminders)

---

## Section 4: Member Management

### Viewing Member Accounts

Go to **Members** → **Portal Accounts**

| Status | Meaning |
|--------|---------|
| **Invited** | Invitation email sent, not yet activated |
| **Active** | Member has set up their account and can log in |
| **Suspended** | Account temporarily disabled (mirrors membership status) |
| **Deactivated** | Account permanently disabled |

### Common Actions

**Resend Invitation**:
1. Find the member in the list
2. Click the three-dot menu → **Resend Invitation**
3. A new invitation email is sent

**Reset Password**:
1. Find the member → three-dot menu → **Reset Password**
2. Member receives a password reset email
3. Previous password is immediately invalidated

**Suspend Account**:
1. Happens automatically when membership status changes to SUSPENDED
2. Can also be done manually: three-dot menu → **Suspend Portal Access**
3. Member sees "Account Suspended — Contact your club" on login

### Dependent Access

If dependent access is enabled:
- Dependents can have their own portal login
- Dependent accounts are linked to the primary member
- Dependents can: view their own bookings, use their own QR code
- Dependents cannot: view billing/statements, make payments
- Manage dependents: **Members** → Select member → **Dependents** tab

### Member QR Codes

- QR codes are **auto-generated** for each member
- QR contains: encrypted member ID, name, tier, expiry timestamp
- **Regenerate**: If a QR is compromised, go to Member → three-dot menu → **Regenerate QR**
  - Old QR immediately stops working
  - New QR available on member's next portal load

---

## Section 5: Content & Announcements

### Creating Announcements

1. Go to **Content** → **Announcements** → **New Announcement**
2. Fill in:
   - **Title**: Headline text (e.g., "Valentine's Dinner — February 14")
   - **Body**: Details (supports basic formatting)
   - **Image**: Optional photo or banner
   - **Start Date**: When the announcement appears
   - **End Date**: When it automatically hides
3. **Publish Options**:
   - Save as Draft (visible only to staff)
   - Publish Now (immediately visible to all members)
   - Schedule (publish at a future date/time)
4. **Send Push Notification**: Check this box to also send a push notification to all members when published

### Where Announcements Appear

- **Dashboard**: "Club News" section (horizontal scroll cards)
- **Notifications**: Listed under "Club News" filter

### Event Promotions

For events with bookings:
1. Create the event as a facility booking slot
2. Create an announcement linking to the facility
3. Members can RSVP directly from the announcement card

---

## Section 6: Troubleshooting

| Issue | What to Check | Resolution |
|-------|--------------|------------|
| Member can't log in | Verify email matches exactly | Reset password; check account isn't suspended |
| QR code won't scan | Check scanner app is updated | Regenerate QR; ensure reception device camera works |
| Bookings not showing | Check feature flag is enabled | Verify courses/facilities exist in staff admin |
| Push notifications not arriving | Member must allow in browser | Check HTTPS; member may have denied permission |
| Wrong logo or colors | Browser cache | Ask member to clear cache; wait 5 min for CDN update |
| "Club Not Found" error | Hostname not configured | Contact ClubVantage — DNS or tenant config issue |
| Balance shows wrong amount | Billing sync delay | Verify in staff admin; sync runs every 15 minutes |
| Portal loads slowly | Network or device issue | Test on different device; check member's connection |
| Member can't install PWA | iOS Safari or Android Chrome required | Other browsers have limited PWA support |
| Dependent can't log in | Dependent access flag | Ensure `portal.dependentAccess` is enabled |

---

## Section 7: Getting Support

### Self-Service (Immediate)
- Toggle features on/off
- Update branding
- Manage member accounts
- Create announcements

### Contact ClubVantage Support

For changes requiring our team:

**Email**: support@clubvantage.app
**Response Time**: Within 4 business hours

**Include in your request**:
- Club name and tenant ID
- Description of what you need
- Screenshots if applicable

**Common support requests**:
- Custom domain setup
- Advanced theme customization (fonts, custom CSS)
- Payment gateway integration
- SMS notification setup
- Bulk member data import/export
- Feature requests or bug reports
