# Chat Past — Talk to the past.

Interactive digital history museum for students aged 8–16, built with Next.js (App Router), React, TypeScript, Tailwind CSS, and the official Anthropic TypeScript SDK (`@anthropic-ai/sdk`).

## Windows 11 Beginner Setup Guide (PowerShell)

### 1. Check Installed Prerequisites
Open **PowerShell** on Windows 11 and run:
```powershell
node --version
npm --version
git --version
```
- If **Node.js** is missing or older than `v18.18.0`, download and install the **LTS** installer from [https://nodejs.org](https://nodejs.org).
- If **Git** is missing, download it from [https://git-scm.com/download/win](https://git-scm.com/download/win).

### 2. Create or Extract the Project Folder
Extract `chat-past-scaffold.zip` to `C:\Users\%USERNAME%\Desktop\ChatPast` and navigate to it:
```powershell
cd "$env:USERPROFILE\Desktop\ChatPast"
```

### 3. Open in Visual Studio Code
```powershell
code .
```

### 4. Install Dependencies
```powershell
npm install
```

### 5. Configure Your Private `.env.local` File
Copy the template file and open it in Notepad or VS Code:
```powershell
Copy-Item .env.example .env.local
notepad .env.local
```
Replace `replace_with_your_key` with your real Anthropic API key:
```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-5-5
```
*Security Rule: Never commit `.env.local` to Git, never prefix `ANTHROPIC_API_KEY` with `NEXT_PUBLIC_`, and never share your secret key in chat.*

### 6. Run the Development Server
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
To stop the server at any time, press `Ctrl + C` in PowerShell.

### 7. Run Type Checks, Linting, and Production Build
```powershell
npm run typecheck
npm run lint
npm run build
```
