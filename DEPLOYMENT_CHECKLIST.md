# MUSE Telegram Mini App - Deployment Checklist

## ✅ Pre-Deployment Testing (Local)

### 1. Server & Build Tests
- [x] Dev server starts successfully (`npm run dev`)
- [x] Build completes without errors (`npm run build`)
- [x] Build output is optimized (476KB -> 115KB gzipped)
- [x] All dependencies installed correctly

### 2. Core Features Testing
- [x] Hero section displays correctly
- [x] Product grid loads
- [x] Search functionality works
- [x] Add to cart functionality
- [x] Cart view displays items
- [x] Product detail page loads

### 3. Telegram Integration
- [x] Telegram SDK loaded (`telegram-web-app.js`)
- [x] Window.Telegram types defined
- [x] MainButton integration setup
- [x] BackButton navigation setup
- [x] HapticFeedback triggers available
- [x] User data extraction from initDataUnsafe

### 4. Admin Features
- [x] Admin mode toggle in menu
- [x] Image upload functionality
- [x] Product image editing
- [x] Collection image editing
- [x] Hero section editing

### 5. AI & Chat Features
- [x] MUSE Lab (AI Studio) accessible
- [x] Chat widget available
- [x] Gemini API integration present
- [x] Image editing service available

## 🚀 Deployment to Netlify

### Step 1: Repository Setup
1. [ ] Push code to GitHub (if not already done)
2. [ ] Ensure `.gitignore` excludes sensitive files
3. [ ] Commit `netlify.toml` configuration

### Step 2: Netlify Configuration
1. [ ] Connect GitHub repo to Netlify
2. [ ] Set build command: `npm run build`
3. [ ] Set publish directory: `dist`
4. [ ] Add environment variables:
   - `GEMINI_API_KEY` - Get from Google AI Studio
   - `TELEGRAM_BOT_TOKEN` - From @BotFather
   - `TELEGRAM_CHAT_ID` - Your Telegram chat ID

### Step 3: Environment Variables in Netlify
Go to: **Site settings → Build & deploy → Environment**
```
GEMINI_API_KEY=your_api_key_here
TELEGRAM_BOT_TOKEN=8331653799:AAHwXUHdwNEPRs-rPO9crhRfPP31DCUvVZ4
TELEGRAM_CHAT_ID=-1001944860133
```

### Step 4: Deploy
1. [ ] Trigger deployment (automatic on push or manual)
2. [ ] Wait for build to complete
3. [ ] Check deployment logs for errors
4. [ ] Note your Netlify URL (e.g., `https://your-app.netlify.app`)

## 📱 Telegram Bot Configuration

### Step 1: Create/Update Bot
1. [ ] Chat with @BotFather on Telegram
2. [ ] Create new bot: `/newbot`
3. [ ] Name: `MUSE Luxury Bags` (or your preference)
4. [ ] Username: `muse_shop_bot` (or your preference)
5. [ ] Save bot token

### Step 2: Set Bot Menu
```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setMyCommands \
  -H 'Content-Type: application/json' \
  -d '{
    "commands": [
      {"command": "start", "description": "Start shopping"},
      {"command": "help", "description": "Get help"},
      {"command": "cart", "description": "View your cart"}
    ]
  }'
```

### Step 3: Configure Mini App
1. [ ] In @BotFather, select your bot
2. [ ] Send: `/setmenubutton`
3. [ ] Choose: `mini_app`
4. [ ] Enter app URL: `https://your-app.netlify.app`
5. [ ] Enter app label: `MUSE Shop`

### Step 4: Set Webhook (Optional - for backend)
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://your-app.netlify.app/api/webhook"
  }'
```

## 🔒 Security Checklist

- [ ] API keys not hardcoded (use env vars)
- [ ] No sensitive data in git history
- [ ] HTTPS enforced (Netlify handles this)
- [ ] CORS headers configured appropriately
- [ ] Input validation implemented
- [ ] XSS protection headers added (netlify.toml)

## 📊 Performance Checklist

- [ ] Gzip compression enabled (Netlify default)
- [ ] Images optimized
- [ ] CSS/JS minified (Vite handles this)
- [ ] Bundle size under 500KB (currently 476KB ✓)
- [ ] Lazy loading implemented where needed

## 🧪 Post-Deployment Testing

1. [ ] Access app via deployed URL in browser
2. [ ] Test in Telegram mobile app
3. [ ] Test shopping flow end-to-end
4. [ ] Test Telegram buttons (Main, Back)
5. [ ] Test admin features
6. [ ] Test chat/AI features
7. [ ] Check console for errors
8. [ ] Monitor Netlify analytics

## 📝 Final Steps

1. [ ] Document bot token securely (1Password, etc.)
2. [ ] Create README with setup instructions
3. [ ] Set up monitoring/error tracking
4. [ ] Create backup of bot configuration
5. [ ] Share bot link with testers

## 🎯 Telegram Mini App Submission (Optional)

Once stable in production:
1. [ ] Meet Telegram mini app guidelines
2. [ ] Test on iOS and Android
3. [ ] Get app approved by Telegram (if needed)
4. [ ] Publish to Telegram App Store

## Useful Links

- **Netlify Dashboard**: https://app.netlify.com
- **Telegram BotFather**: https://t.me/botfather
- **Telegram Mini Apps Docs**: https://core.telegram.org/bots/webapps
- **Vite Build Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

---

**Current Status**: Ready for Netlify deployment ✅

Server is running on http://localhost:3000/
Build output: dist/
Configuration: netlify.toml ✓
