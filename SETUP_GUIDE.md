# Safe Space App - Setup Guide for Visual Studio Code

## Quick Start (3 Steps)

### Option 1: Download & Install (Recommended)

1. **Download the ZIP file**
   - Click the three dots (⋯) in the top right corner of the code block in v0
   - Select "Download ZIP"
   - Extract the ZIP file to your desired location

2. **Open in Visual Studio Code**
   - Open VS Code
   - Go to `File → Open Folder`
   - Select the extracted "safe-space-app" folder

3. **Install & Run**
   - Open the integrated terminal in VS Code (`View → Terminal` or `` Ctrl+` ``)
   - Run these commands:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`
   - Open your browser to `http://localhost:3000`

### Option 2: Use shadcn CLI (Alternative)

\`\`\`bash
npx create-next-app@latest my-safe-space-app --example https://github.com/shadcn/ui/tree/main/examples/next-app
\`\`\`

---

## Customization Guide

### 1. Changing Phone Numbers & Text Numbers

All phone numbers and text numbers are centralized in one file for easy customization:

**File:** `lib/config.ts`

\`\`\`typescript
export const CONFIG = {
  // ✏️ CHANGE THESE TO YOUR TEST NUMBERS
  CRISIS_HOTLINE: '988',              // Main crisis hotline
  CRISIS_HOTLINE_ALT: '1-800-273-8255', // Alternative hotline
  TREVOR_PROJECT: '1-866-488-7386',   // Trevor Project
  TRANS_LIFELINE: '1-877-565-8860',   // Trans Lifeline
  VETERANS_CRISIS: '988',             // Veterans crisis line
  
  // Text/SMS Numbers - Replace with your mobile number for testing
  CRISIS_TEXT_LINE: '741741',         // SMS number
  CRISIS_TEXT_KEYWORD: 'HELLO',       // SMS keyword
  
  // External Links
  TREVOR_CHAT: 'https://www.thetrevorproject.org/get-help/',
  CRISIS_CHAT: 'https://988lifeline.org/chat/',
  NAMI_WEBSITE: 'https://www.nami.org',
  SAMHSA_WEBSITE: 'https://www.samhsa.gov',
}
\`\`\`

**To test with your own phone:**
1. Open `lib/config.ts` in VS Code
2. Change `CRISIS_TEXT_LINE: '741741'` to your mobile number (e.g., `'5551234567'`)
3. Save the file
4. The app will automatically use your number for testing

### 2. Changing the Logo

The logo is located at `public/logo.png`. To replace it:

1. **Prepare your logo image:**
   - PNG format recommended (supports transparency)
   - Recommended size: 512x512 pixels or larger
   - Square aspect ratio works best

2. **Replace the file:**
   - Navigate to the `public` folder in VS Code
   - Delete or rename the existing `logo.png`
   - Add your new logo file and name it `logo.png`

3. **Save and refresh** - Your new logo will appear on the home page and header

### 3. Editing Colors & Styles

All colors and design tokens are in `app/globals.css`. To customize:

\`\`\`css
/* Open app/globals.css and modify these values */
@theme inline {
  /* Change primary colors */
  --color-primary: #your-color;
  --color-secondary: #your-color;
  
  /* Change background colors */
  --color-background: #your-color;
  
  /* Adjust corner rounding */
  --radius: 0.5rem; /* Make buttons more/less rounded */
}
\`\`\`

### 4. Editing Text & Translations

All text content is in `lib/translations.ts`. To modify:

1. Open `lib/translations.ts` in VS Code
2. Find the language you want to edit (en, es, or ar)
3. Update the text:

\`\`\`typescript
export const translations = {
  en: {
    appTitle: "Your Custom Title",
    appSubtitle: "Your Custom Subtitle",
    // ... edit any text here
  },
  // ... same for es (Spanish) and ar (Arabic)
}
\`\`\`

### 5. Adding or Removing Features

**To hide a feature:**
- Go to `app/main/page.tsx` or the specific page
- Comment out or delete the section you don't want

**To add a new page:**
1. Create a new folder in `app/` (e.g., `app/new-feature/`)
2. Add a `page.tsx` file inside
3. Copy the structure from an existing page (like `app/breathing/page.tsx`)
4. Add a link to it from `app/main/page.tsx` or navigation

---

## Testing on Mobile Devices

###On Your Phone:

1. **Find your computer's local IP:**
   - Windows: Open Command Prompt → type `ipconfig` → look for IPv4 Address
   - Mac/Linux: Open Terminal → type `ifconfig` → look for inet address

2. **Make sure your phone and computer are on the same WiFi**

3. **On your phone's browser, go to:**
   \`\`\`
   http://YOUR-IP-ADDRESS:3000
   \`\`\`
   Example: `http://192.168.1.5:3000`

### Test SMS functionality:
- Change `CRISIS_TEXT_LINE` in `lib/config.ts` to your mobile number
- Click "Send Text" in the app
- Your phone should open the messaging app with a pre-filled message

---

## Common Issues & Fixes

### Port 3000 is already in use
\`\`\`bash
# Kill the process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
\`\`\`

### Dependencies not installing
\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Changes not showing up
- Hard refresh the browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear the cache in your browser settings

### Images/logo not showing
- Make sure the file is in the `public` folder
- Check the file name matches exactly (case-sensitive)
- Try a hard refresh

---

## Project Structure

\`\`\`
safe-space-app/
├── app/                    # All pages and routes
│   ├── page.tsx           # Home page (language selection)
│   ├── main/              # Main dashboard
│   ├── breathing/         # Breathing exercises
│   ├── grounding/         # Grounding techniques
│   ├── journal/           # Journaling feature
│   ├── music/             # Music & calm sounds
│   ├── safety-plan/       # AI safety plan chatbot
│   ├── support/           # Get support hub
│   ├── call-lifeline/     # Call crisis lines
│   ├── text-lifeline/     # Text crisis lines
│   ├── chat-support/      # Online chat support
│   ├── emergency/         # Emergency resources
│   ├── emergency-location/# Location sharing
│   ├── tools/             # App tools & settings
│   ├── wellness/          # Wellness activities
│   └── resources/         # External resources
├── components/            # Reusable components
│   ├── app-header.tsx    # App header with logo
│   └── bottom-nav.tsx    # Bottom navigation bar
├── lib/                   # Utilities & config
│   ├── config.ts         # ✏️ PHONE NUMBERS HERE
│   └── translations.ts   # ✏️ TEXT CONTENT HERE
├── public/                # Static files
│   └── logo.png          # ✏️ REPLACE LOGO HERE
└── app/globals.css       # ✏️ COLORS & STYLES HERE
\`\`\`

---

## Need Help?

- Check the browser console for errors: `F12` → Console tab
- Check the terminal for server errors
- Make sure you're running `npm run dev` in the terminal
- Verify you're in the correct folder (should contain `package.json`)

---

## Ready to Deploy?

When you're ready to publish your app online:

1. **From v0:** Click the "Publish" button → Deploys to Vercel
2. **From VS Code:** 
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel`
   - Follow the prompts

Your app will be live with a public URL you can share!
