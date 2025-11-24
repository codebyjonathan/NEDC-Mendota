# Complete Visual Studio Code Setup Guide

## Step-by-Step Installation

### Step 1: Download the Project

1. Look for the code block in v0 (above this guide)
2. Click the **three dots (⋯)** in the top right corner
3. Select **"Download ZIP"**
4. Save the file to your computer (e.g., Downloads folder)

### Step 2: Extract the Files

**Windows:**
1. Right-click the downloaded ZIP file
2. Select "Extract All..."
3. Choose a location (e.g., `C:\Projects\safe-space`)
4. Click "Extract"

**Mac:**
1. Double-click the ZIP file to extract
2. Move the extracted folder to your preferred location (e.g., Desktop or Documents)

### Step 3: Install Visual Studio Code

If you don't have VS Code installed:

1. Go to [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Download the installer for your operating system
3. Run the installer and follow the prompts
4. Launch Visual Studio Code

### Step 4: Open the Project

1. Launch Visual Studio Code
2. Click **File** → **Open Folder** (or press `Ctrl+K Ctrl+O` on Windows, `Cmd+K Cmd+O` on Mac)
3. Navigate to where you extracted the project
4. Select the project folder and click **"Select Folder"** (or **"Open"** on Mac)

### Step 5: Install Node.js (If Not Installed)

1. Check if Node.js is installed:
   - Open VS Code Terminal: **Terminal** → **New Terminal** (or press `` Ctrl+` ``)
   - Type: `node --version`
   - If you see a version number (e.g., v18.17.0), skip to Step 6

2. If not installed, download Node.js:
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS (Long Term Support) version
   - Run the installer and follow the prompts
   - Restart VS Code after installation

### Step 6: Install Project Dependencies

1. In VS Code, open the Terminal: **Terminal** → **New Terminal** (or press `` Ctrl+` ``)
2. Type the following command and press Enter:
   \`\`\`bash
   npm install
   \`\`\`
3. Wait for the installation to complete (this may take 2-5 minutes)
4. You should see a success message when done

### Step 7: Run the App

1. In the Terminal, type:
   \`\`\`bash
   npm run dev
   \`\`\`
2. Wait for the server to start (you'll see "Ready" message)
3. The app should automatically open in your browser
4. If not, open your browser and go to: `http://localhost:3000`

**Congratulations! Your app is now running! 🎉**

---

## Making Changes to Your App

### Changing Phone Numbers

1. In VS Code's left sidebar, click **Explorer** (folder icon)
2. Navigate to: `lib` → `config.ts`
3. Click to open the file
4. Modify the phone numbers:
   \`\`\`typescript
   export const CONFIG = {
     PHONE_NUMBERS: {
       CRISIS_LIFELINE: "YOUR-NUMBER-HERE",
       // ... more numbers
     }
   }
   \`\`\`
5. Save the file: **File** → **Save** (or press `Ctrl+S` / `Cmd+S`)
6. The app will automatically refresh in your browser

### Changing the Logo

1. Find your logo image file (PNG format recommended)
2. In VS Code, navigate to the `public` folder
3. Drag and drop your logo file into the `public` folder
4. Rename it to `logo.png` (or update the image references in the code)

### Changing Text and Translations

1. Navigate to: `lib` → `translations.ts`
2. Find the text you want to change
3. Edit the English (`en`), Spanish (`es`), or Arabic (`ar`) text
4. Save the file

### Changing Colors

1. Navigate to: `app` → `globals.css`
2. Look for the `@theme inline` section
3. Modify color values:
   \`\`\`css
   @theme inline {
     --color-primary: #your-color;
   }
   \`\`\`
4. Save the file

---

## Testing on Your Mobile Device

### Option 1: Same WiFi Network

1. Make sure your phone and computer are on the same WiFi network
2. Find your computer's IP address:

   **Windows:**
   - Open Command Prompt
   - Type: `ipconfig`
   - Look for "IPv4 Address" (e.g., 192.168.1.100)

   **Mac:**
   - Open Terminal
   - Type: `ifconfig | grep "inet "`
   - Look for your local IP (e.g., 192.168.1.100)

3. On your phone's browser, type: `http://YOUR-IP-ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

### Option 2: Deploy to Vercel (For Real Testing)

1. Push your code to GitHub (create account if needed)
2. Sign up at [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Connect your GitHub repository
5. Click "Deploy"
6. Access your app from the provided URL on any device!

---

## Troubleshooting

### "npm: command not found"
- **Solution**: Install Node.js (see Step 5 above)

### "Port 3000 is already in use"
- **Solution**: Stop other apps using port 3000, or modify the port:
  \`\`\`bash
  npm run dev -- --port 3001
  \`\`\`

### Changes not showing up
- **Solution**: Hard refresh your browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)

### App won't start
- **Solution**: 
  1. Delete the `node_modules` folder
  2. Delete `package-lock.json`
  3. Run `npm install` again

### Can't access on phone
- **Solution**: 
  - Check both devices are on same WiFi
  - Turn off firewall temporarily
  - Try using your computer's full IP address

---

## Useful VS Code Keyboard Shortcuts

- **Open Terminal**: `` Ctrl+` `` (Windows) or `` Cmd+` `` (Mac)
- **Save File**: `Ctrl+S` (Windows) or `Cmd+S` (Mac)
- **Find in File**: `Ctrl+F` (Windows) or `Cmd+F` (Mac)
- **Find in All Files**: `Ctrl+Shift+F` (Windows) or `Cmd+Shift+F` (Mac)
- **Command Palette**: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)

---

## Next Steps

1. **Customize the app** with your phone numbers and branding
2. **Test all features** on your phone
3. **Deploy to Vercel** for public access
4. **Share with your community**

**Questions?** Refer to the README.md file in the project for more details!

---

**You're doing great! This app will help so many people. 💙**
