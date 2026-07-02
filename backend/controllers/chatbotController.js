const AppError = require('../utils/AppError');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const KNOWLEDGE_BASE = [
  {
    keywords: ['book', 'reserve', 'how to', 'find parking', 'search parking'],
    priority: 10,
    response: `To book a parking spot:
1. Go to **Find Parking** from the navbar.
2. Enter your location (e.g., SG Highway, CG Road).
3. Choose your vehicle type, date, entry & exit time.
4. Browse available lots and pick one.
5. Tap **Book Now** and complete payment via Razorpay.
6. Show the QR code at entry.`,
  },
  {
    keywords: ['cancel', 'refund', 'cancellation', 'cancel booking'],
    priority: 9,
    response: `**Cancellation Policy:**
• Free cancellation up to 2 hours before entry.
• 50% refund within 1 hour of entry.
• No refund after the booking starts.
To cancel, go to **My Bookings** → select booking → tap **Cancel**.`,
  },
  {
    keywords: ['price', 'cost', 'rate', 'fee', 'charges', 'payment', 'pay'],
    priority: 8,
    response: `**Parking Rates** (Ahmedabad):
• Standard lots: ₹20–40/hr
• Premium lots (CG Road, AlphaOne): ₹50–80/hr
• Monthly passes available at select locations
• Pay via **Razorpay** (UPI, Card, NetBanking, Wallet)
• 20% peak surcharge (6–9 PM) at busy locations`,
  },
  {
    keywords: ['location', 'where', 'near', 'nearby', 'place', 'area', 'sg highway', 'cg road', 'kankaria', 'riverfront', 'alphaone', 'vastrapur', 'navrangpura', 'maninagar', 'bodakdev'],
    priority: 7,
    response: `**Popular Parking Locations in Ahmedabad:**
• 🏢 **SG Highway** — Palladium Mall, 120 slots, ₹40/hr
• 🏙️ **CG Road** — Law Garden area, 80 slots, ₹50/hr
• 🎡 **Kankaria Lake** — Maninagar, 200 slots, ₹30/hr
• 🌊 **Sabarmati Riverfront** — Gandhi Ashram area, 150 slots, ₹35/hr
• 🏬 **AlphaOne Mall** — Vastrapur, 500 slots, ₹60/hr
• 🏘️ **Navrangpura** — 60 slots, ₹25/hr`,
  },
  {
    keywords: ['available', 'availability', 'free', 'empty', 'space', 'slot', 'spots'],
    priority: 7,
    response: `Real-time availability is shown on each parking lot card. You can:
• See live slot counts on Find Parking page.
• Sort by **Availability** to show lots with most free spaces.
• Check the color-coded progress bar (green = plenty, orange = limited, red = almost full).`,
  },
  {
    keywords: ['account', 'profile', 'password', 'login', 'signup', 'register', 'forgot', 'reset'],
    priority: 6,
    response: `**Account Help:**
• **New here?** → Tap Register to create an account.
• **Forgot password?** → Go to Login → Forgot Password → reset via email.
• **Update profile?** → Go to My Profile (after login) to change name, phone, email.
• **My Vehicles** → Add your vehicle for faster booking.`,
  },
  {
    keywords: ['qr', 'entry', 'gate', 'enter', 'access'],
    priority: 6,
    response: `**QR Code Entry:**
After booking, you'll get a unique QR code. At the parking gate:
1. Open the booking in **My Bookings**.
2. Show the QR code to the attendant.
3. The gate scans it and you're in!
💡 Save the QR screenshot in case of network issues.`,
  },
  {
    keywords: ['ev', 'charging', 'electric', 'tesla'],
    priority: 5,
    response: `**EV Charging Stations:**
EV charging is available at these lots:
• SG Highway Smart Parking (2 chargers)
• AlphaOne Mall Multi-Level (6 chargers)
• Bodakdev Secure Parking (1 charger)
Filter by **EV Charging** on Find Parking page.`,
  },
  {
    keywords: ['valet', 'valet parking'],
    priority: 5,
    response: `**Valet Parking:**
Valet service is available at:
• CG Road Premium Lot
• AlphaOne Mall Multi-Level
Look for the "Valet" badge on parking cards.`,
  },
  {
    keywords: ['safe', 'secure', 'cctv', 'security', 'protected'],
    priority: 4,
    response: `✅ All SpotIQ lots are **CCTV monitored** with 24/7 security.
• Indoor & outdoor options available.
• Well-lit premises with guard patrol at night.
• Filter by **CCTV** or **Covered** for extra safety.`,
  },
  {
    keywords: ['peak', 'surge', 'timing', 'hour', 'time'],
    priority: 4,
    response: `**Peak Hours:**
• Morning: 9–11 AM (office rush)
• Evening: 6–9 PM (peak surcharge applies)
• Weekend: Kankaria, Riverfront fill up by noon
💡 Book in advance during peak times for best rates!`,
  },
  {
    keywords: ['monthly', 'pass', 'subscription', 'season', 'regular'],
    priority: 4,
    response: `**Monthly Passes:**
Select lots offer monthly parking passes at discounted rates.
• Standard: ₹3,000–5,000/mo
• Premium: ₹6,000–8,000/mo
Check the **Pricing** section on our homepage for details.`,
  },
  {
    keywords: ['support', 'contact', 'help', 'complaint', 'issue', 'problem'],
    priority: 3,
    response: `Need help? Reach us at:
📧 **support@spotiq.in**
We typically respond within 2 hours during business hours (9 AM – 9 PM).`,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening', 'namaste', 'howdy'],
    priority: 1,
    response: `👋 Hey there! Welcome to SpotIQ — Ahmedabad's smartest parking assistant. How can I help you today? Try asking about booking, pricing, locations, or availability!`,
  },
  {
    keywords: ['thank', 'thanks', 'ty', 'thx', 'appreciate', 'gratitude'],
    priority: 1,
    response: `You're welcome! 😊 Happy parking! If you ever need anything else, I'm just a message away.`,
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'ttfn'],
    priority: 1,
    response: `Goodbye! 🚗 Have a great day and safe driving!`,
  },
];

const FALLBACK_RESPONSE = `I'm not sure I understand. Here's what I can help with:
• 📍 Finding & booking parking
• 💰 Pricing & payments
• ❌ Cancellations & refunds
• 📱 QR entry & how it works
• 🔒 Safety & security
• ⚡ EV charging & valet

Just type your question naturally!`;

const findBestMatch = (message) => {
  const lower = message.toLowerCase().trim();
  if (!lower) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (score > 0) {
      const finalScore = score * (item.priority / 5);
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMatch = item;
      }
    }
  }

  return bestMatch;
};

exports.chat = asyncHandler(async (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return next(new AppError('Please provide a message', 400));
  }

  const match = findBestMatch(message);
  const response = match ? match.response : FALLBACK_RESPONSE;

  res.json({
    success: true,
    data: {
      message: response,
      intent: match ? 'matched' : 'fallback',
    },
  });
});
