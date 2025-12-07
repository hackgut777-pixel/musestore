# MUSE Telegram Mini App - Quick Start Guide

## 🚀 Local Development (5 minutes)

```bash
cd /workspaces/musestore/musestore

# Install dependencies
npm install

# Start dev server (runs on http://localhost:3000)
npm run dev

# Build for production (creates /dist)
npm run build

# Preview production build
npm run preview
```

## 🧪 Quick Testing Checklist

### In Browser (http://localhost:3000)
```
✅ Load homepage
✅ Click "Add to Bag" on any product
✅ Open cart and view items
✅ Search products by name
✅ Click product to see details
✅ Open menu and toggle "Admin Mode"
✅ (If Admin) Edit product images
✅ Click chat bubble to test AI assistant
```

### In Telegram Mini App
1. Find your bot: `@muse_shop_bot` (or your bot username)
2. Tap menu button to open mini app
3. Test all features listed above

## 📦 Project Structure

```
musestore/
├── App.tsx              # Main app component (1600+ lines)
├── components/          # Reusable components
├── services/            # Gemini API integration
├── index.tsx            # React entry point
├── vite.config.ts       # Build configuration
├── tailwind.config.js   # Styling (Tailwind CSS)
├── netlify.toml         # Netlify deployment config
└── package.json         # Dependencies
```

## 🔑 Key Files for Deployment

1. **netlify.toml** - Deployment configuration ✓
2. **package.json** - Dependencies & build scripts ✓
3. **vite.config.ts** - Build settings ✓
4. **.env.local** - Environment variables (don't commit!)

## 🌐 Deploy to Netlify (5 minutes)

### Method 1: Direct from GitHub
1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repo
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Add environment variables (see below)
8. Deploy!

### Method 2: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## 🔐 Environment Variables for Netlify

In Netlify dashboard: **Site settings → Build & deploy → Environment**

```
GEMINI_API_KEY=your_google_ai_key
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=your_chat_id
```

## 🤖 Telegram Bot Setup (5 minutes)

1. Chat with **@BotFather** on Telegram
2. Send `/newbot`
3. Follow prompts to create bot
4. Get your bot token
5. Send `/setmenubutton` to add menu button
6. Choose `mini_app`
7. Enter your deployed URL (e.g., `https://your-app.netlify.app`)

## ✨ Features Overview

### Shopping
- Browse luxury bags
- Add/remove from cart
- View product details
- Read & write reviews
- Search & filter

### Admin Panel
- Upload custom product images
- Edit hero section images
- Manage collections
- Use AI to generate images

### AI Features
- MUSE Lab (image generation with Gemini)
- Chat assistant powered by Gemini
- Admin image editing

### Telegram Integration
- Haptic feedback (vibrations)
- Native buttons (MainButton, BackButton)
- User data from Telegram
- Payment support (simulated, can be extended)

## 📊 Current Build Stats

- **Total Size**: 476KB (minified)
- **Gzipped Size**: 115KB (excellent!)
- **Modules**: 682
- **Build Time**: ~3 seconds
- **Browser Support**: Modern browsers (ES2020+)

## 🐛 Troubleshooting

### Dev server not starting
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Build fails
```bash
# Check for TypeScript errors
npm run build -- --verbose

# Clear cache and rebuild
rm -rf dist
npm run build
```

### Telegram features not working
- Ensure you're accessing via Telegram app, not browser
- Check console for errors (Telegram → DevTools)
- Verify bot token in .env.local

## 📱 Testing in Telegram

### Mobile App
1. Open Telegram
2. Find bot by username
3. Tap menu button to open mini app

### Desktop App
1. Open Telegram Desktop
2. Search for bot username
3. Open bot and tap app button

## 🎯 Next Steps

1. ✅ Test locally: `npm run dev`
2. ✅ Build production: `npm run build`
3. ✅ Deploy to Netlify (follow guide above)
4. ✅ Configure Telegram bot
5. ✅ Test in Telegram app
6. ✅ Share with users!

## 💡 Tips

- Netlify auto-deploys on every push to main branch
- Builds are cached, subsequent deploys are faster
- Check deployment logs if something fails
- Use Netlify's preview URLs to test before going live
- Monitor performance in Netlify analytics

## 📚 Documentation Links

- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [Netlify Docs](https://docs.netlify.com/)
- [React 19](https://react.dev)
- [Vite Build Tool](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Need help?** Check the logs or error messages - they usually tell you exactly what's wrong!
