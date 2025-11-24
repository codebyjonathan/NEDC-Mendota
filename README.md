# Safe Space - Student Suicide Prevention App (S.S.P.)

A compassionate, multilingual mobile-first web app designed to provide mental health support and suicide prevention resources for students.

## Features

### 🌍 Multilingual Support
- English, Spanish (Español), and Arabic (العربية)
- Full RTL (Right-to-Left) support for Arabic
- Language selector available in the Tools page

### 🆘 Crisis Support
- **Get Support Now**: Central hub for all crisis resources
- **Call Lifeline**: Direct calling to 988 and crisis hotlines
- **Text Lifeline**: SMS support to Crisis Text Line (741741)
- **Chat Support**: Links to live chat crisis services
- **Emergency Location**: Share your location with emergency services

### 🧘 Coping Tools
- **Breathing Exercises**: Interactive 4-4-4-2 breathing timer with animations
- **Grounding Techniques**: 5-4-3-2-1 technique with progress tracking
- **Journal**: Mood tracking and private journaling with local storage
- **Music & Calm Sounds**: Calming nature sounds with AI voice guidance and beautiful scenery

### 🤖 AI Safety Plan
- Conversational AI chatbot powered by Vercel AI SDK
- Helps users create personalized safety plans
- Save and download safety plans as PDF

### 📚 Additional Resources
- **Tools**: Complete guide to all app features
- **Emergency**: Quick access to crisis resources
- **Wellness**: Daily wellness habits and quick activities
- **Resources**: Professional organizations including NAMI (our main partner)

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **AI**: Vercel AI SDK with OpenAI GPT-4
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A code editor (Visual Studio Code recommended)

### Installation

1. **Download the project**
   - Click the three dots (⋯) in the top right
   - Select "Download ZIP"
   - Extract to your desired location

2. **Open in VS Code**
   - Launch Visual Studio Code
   - Go to File → Open Folder
   - Select the extracted project folder

3. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The app should now be running!

## Customization

### Change Phone Numbers

Edit `/lib/config.ts` to customize crisis line phone numbers:

\`\`\`typescript
export const CONFIG = {
  PHONE_NUMBERS: {
    CRISIS_LIFELINE: "988",
    CRISIS_LIFELINE_FULL: "1-800-273-8255",
    VETERAN_CRISIS: "988",
    TREVOR_PROJECT: "1-866-488-7386",
    EMERGENCY: "911",
  },
  TEXT_NUMBERS: {
    CRISIS_TEXT: "741741",
    TREVOR_TEXT: "678678",
  },
}
\`\`\`

### Change Logo

Replace `/public/logo.png` with your own logo image (PNG format recommended).

### Modify Translations

Edit `/lib/translations.ts` to update text in English, Spanish, or Arabic.

### Customize Colors

Edit `/app/globals.css` to change the color scheme:

\`\`\`css
@theme inline {
  --color-primary: your-color;
  --color-secondary: your-color;
  /* ... more colors */
}
\`\`\`

## Testing on Mobile Devices

### Option 1: Local Network Testing
1. Run `npm run dev`
2. Find your computer's local IP address:
   - Windows: `ipconfig` in Command Prompt
   - Mac: `ifconfig` in Terminal
3. On your phone's browser, navigate to: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

### Option 2: Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Sign up at [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will automatically deploy your app
5. Access your app via the provided URL from any device

## Project Structure

\`\`\`
/app
  /page.tsx                 # Home page with language selection
  /main                     # Main dashboard
  /support                  # Crisis support hub
  /call-lifeline            # Call crisis hotlines
  /text-lifeline            # Text crisis services
  /chat-support             # Live chat support
  /emergency-location       # Location sharing
  /breathing                # Breathing exercises
  /grounding                # Grounding techniques
  /journal                  # Journaling tool
  /music                    # Calming sounds
  /safety-plan              # AI safety plan chatbot
  /tools                    # App guide
  /emergency                # Emergency resources
  /wellness                 # Wellness activities
  /resources                # Support organizations
/components
  /bottom-nav.tsx           # Bottom navigation bar
  /app-header.tsx           # Page header
  /ui                       # shadcn UI components
/lib
  /config.ts                # Phone numbers configuration
  /translations.ts          # Multilingual text
\`\`\`

## Important Notes

- All crisis resources link to real, professional organizations
- The AI chatbot requires an OpenAI API key (automatically configured on Vercel)
- Journal entries are stored locally in the browser
- The app is mobile-first and works on iOS, Android, and desktop browsers

## Support & Partners

This app features resources from:
- **988 Suicide & Crisis Lifeline**
- **Crisis Text Line**
- **NAMI (National Alliance on Mental Illness)** - Our main collaborator
- **The Trevor Project**
- **SAMHSA National Helpline**

## License

This project is designed for mental health support and suicide prevention. Use responsibly and ethically.

## Need Help?

If you or someone you know is in crisis:
- **Call 988** (24/7 Suicide & Crisis Lifeline)
- **Text HOME to 741741** (Crisis Text Line)
- **Call 911** (Emergency services)

---

**Remember: You're not alone. Help is available.**
