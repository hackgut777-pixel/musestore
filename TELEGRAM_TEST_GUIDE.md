# Telegram Mini App Test Guide for MUSE Luxury Bags

## Current Status ✅
- **Dev Server**: Running on `http://localhost:3000/`
- **Telegram SDK**: Loaded in `index.html`
- **Features**: Shopping, AI Studio, Chat, Admin Mode

## How to Test the Telegram Mini App

### Option 1: Local Testing with Telegram Desktop
1. Open Telegram Desktop
2. In the search box, find: `@BotFather`
3. Create a new bot or use existing `@musestore_test_bot` (if created)
4. Get your bot token from BotFather
5. Use this URL format to test locally:
   ```
   tg://resolve?domain=musestore_test_bot&appname=muse
   ```

### Option 2: Using Ngrok (Recommended for Local Testing)
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Share the HTTPS URL with your Telegram bot webhook
```

### Option 3: Direct Web Link Testing
Open in browser to test web UI:
```
http://localhost:3000/
```

**Note**: Telegram features (MainButton, HapticFeedback, etc.) will show alerts when outside Telegram.

## Features to Test

### 1. **Shopping Experience**
- ✅ Browse products
- ✅ Add to cart
- ✅ View cart
- ✅ Search products
- ✅ View product details & reviews

### 2. **Telegram Integration**
- 🔔 HapticFeedback (vibration on add to cart)
- 📱 MainButton for checkout
- ⬅️ BackButton navigation
- 👤 User data from Telegram

### 3. **AI Features (MUSE Lab)**
- 🤖 Image generation via Gemini
- 💬 Chatbot with AI responses
- ✏️ Admin mode for image editing

### 4. **Admin Features**
- 🔧 Toggle Admin Mode in menu
- 📸 Upload custom product images
- 🎨 Generate images with AI
- ✏️ Edit collections

## Payment Testing
Currently simulated. To enable real payments:
1. Set up Telegram Bot payment provider
2. Add backend server for invoice generation
3. Update `handleTelegramPayment()` in App.tsx

## Environment Variables
```
GEMINI_API_KEY=<your_api_key>
TELEGRAM_BOT_TOKEN=8331653799:AAHwXUHdwNEPRs-rPO9crhRfPP31DCUvVZ4
TELEGRAM_CHAT_ID=-1001944860133
```

## Deployment on Netlify

### Prerequisites
1. GitHub repository connected to Netlify
2. Environment variables set in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `dist`

### Steps
1. Connect your repo to Netlify
2. Add env vars to Netlify dashboard
3. Deploy automatically on push
4. Update Telegram bot webhook to deployed URL

### Webhook Configuration
```bash
# Set webhook URL for your Telegram bot
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhookInfo \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://your-netlify-app.netlify.app",
    "allowed_updates": ["message", "callback_query"]
  }'
```

## Current Known Issues
- AI features require valid GEMINI_API_KEY
- Payment is simulated (no real transactions)
- Some Telegram features only work inside Telegram app

## Next Steps
1. ✅ Test shopping features locally
2. ✅ Configure Telegram bot webhook
3. ✅ Test Telegram integration
4. ✅ Deploy to Netlify
5. ✅ Submit mini app to Telegram
