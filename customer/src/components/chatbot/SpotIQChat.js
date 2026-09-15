import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaMinus,
  FaTrash,
  FaBrain,
  FaCopy,
  FaCheck,
  FaCar,
  FaParking,
  FaCreditCard,
  FaBolt,
  FaTicketAlt,
  FaTags,
  FaMapMarkerAlt,
  FaWallet,
  FaHistory,
  FaTimesCircle,
  FaHeadset,
  FaStar,
  FaSearch,
  FaChevronRight,
  FaCarSide,
  FaPlug,
  FaReceipt,
  FaCalendarAlt,
  FaUserCog,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
} from 'react-icons/fa';

/* ------------------------------------------------------------------ */
/*  AI RESPONSE DATABASE                                               */
/* ------------------------------------------------------------------ */

const AI_RESPONSES = [
  {
    keywords: ['find parking', 'parking near', 'nearby parking', 'parking location', 'where can i park', 'parking spot'],
    response: `Great question! Here are the **top parking spots near you**:

| # | Location | Distance | Price/hr | Rating |
|---|----------|----------|----------|--------|
| 1 | SG Highway Mall | 0.3 km | ₹30 | ⭐ 4.8 |
| 2 | Ashram Road Plaza | 0.7 km | ₹25 | ⭐ 4.5 |
| 3 | Vastrapur Lake Lot | 1.2 km | ₹20 | ⭐ 4.3 |
| 4 | Bodakdev Tower Park | 1.5 km | ₹35 | ⭐ 4.7 |
| 5 | Prahlad Nagar Complex | 2.0 km | ₹28 | ⭐ 4.4 |

**AI Recommendation:** SG Highway Mall is the best pick — closest, highest rated, and has EV charging!

Tap a location to book instantly.`,
  },
  {
    keywords: ['book', 'reservation', 'reserve', 'book now', 'booking'],
    response: `I'd be happy to help you **book a parking spot**! 🚗

Here's how easy it is:

**Step 1:** Choose your preferred location from available spots
**Step 2:** Select date & time (or choose "Park Now")
**Step 3:** Pick your vehicle type
**Step 4:** Confirm & pay

**Available Booking Options:**
- ⏱ Hourly parking — Pay as you go
- 🌙 Overnight parking — Flat rate from 8 PM to 8 AM
- 📅 Day pass — Full day at discounted rate
- 📆 Monthly pass — Best value for daily commuters

**Pro Tip:** Book in advance during peak hours (10 AM - 1 PM & 5 PM - 8 PM) to guarantee your spot!

Would you like me to help you find a spot or check availability for a specific time?`,
  },
  {
    keywords: ['ev', 'charging', 'electric', 'charger', 'ev charging', 'ev station'],
    response: `Here are the **best EV charging stations** near you:

| Station | Type | Speed | Price | Slots |
|---------|------|-------|-------|-------|
| SG Highway Hub | DC Fast | 60 kW | ₹8/kWh | 4/6 |
| Vastrapur Station | AC + DC | 30 kW | ₹6/kWh | 2/4 |
| Bodakdev Plaza | DC Ultra | 120 kW | ₹10/kWh | 1/3 |
| Prahlad Nagar | AC Slow | 22 kW | ₹5/kWh | 3/5 |

**Quick Stats:**
- ⚡ DC Fast: 0-80% in ~35 min
- 🔌 AC Slow: Full charge in ~4 hrs
- 💰 Average cost: ₹80-150 per full charge

**AI Tip:** Bodakdev Plaza has the fastest charger — perfect if you're in a hurry!

All stations support **CCS2, CHAdeMO, and Type 2** connectors.`,
  },
  {
    keywords: ['rate', 'price', 'pricing', 'cost', 'tariff', 'how much'],
    response: `Here's our **complete parking rate card**:

| Vehicle Type | Hourly | Half Day | Full Day | Monthly |
|-------------|--------|----------|----------|---------|
| 🚗 Two Wheeler | ₹10 | ₹40 | ₹60 | ₹800 |
| 🚗 Hatchback | ₹25 | ₹80 | ₹120 | ₹1,500 |
| 🚗 Sedan | ₹30 | ₹100 | ₹150 | ₹2,000 |
| 🚙 SUV | ₹40 | ₹130 | ₹200 | ₹2,500 |
| 🏍 Premium Bike | ₹20 | ₹60 | ₹90 | ₹1,200 |

**Additional Charges:**
- 🌙 Overnight (8 PM - 8 AM): Flat ₹50 (cars)
- 🎉 Weekend surcharge: +10%
- 🅿️ Covered parking: +₹15/hr
- ⚡ EV charging: As per station rates

**Save More:** Monthly passes save you up to **40%** compared to daily rates!`,
  },
  {
    keywords: ['wallet', 'balance', 'money', 'credit', 'add money', 'top up'],
    response: `Here's your **SpotIQ Wallet Summary**:

**Current Balance:** ₹1,250.00

| Transaction | Amount | Date |
|------------|--------|------|
| Parking — SG Highway | -₹60 | Today, 2:30 PM |
| Wallet Top-up | +₹500 | Yesterday |
| Refund — Cancelled Booking | +₹30 | Jul 14 |
| Parking — Vastrapur | -₹45 | Jul 13 |
| Monthly Pass Auto-Debit | -₹2,000 | Jul 1 |

**Quick Actions:**
- 💳 Add money (min ₹100)
- 🔄 Auto-recharge: ON (recharges ₹500 when balance < ₹100)
- 🎁 Use coupon code
- 📊 View full transaction history

**Tip:** Add ₹2,000+ and get ₹200 cashback! 🎉`,
  },
  {
    keywords: ['history', 'booking history', 'past booking', 'previous', 'my bookings'],
    response: `Here's your **recent booking history**:

| # | Location | Date | Duration | Amount | Status |
|---|----------|------|----------|--------|--------|
| 1 | SG Highway Mall | Today | 2 hrs | ₹60 | ✅ Active |
| 2 | Vastrapur Lake | Jul 15 | 3 hrs | ₹75 | ✅ Completed |
| 3 | Ashram Road Plaza | Jul 14 | 1 hr | ₹25 | ✅ Completed |
| 4 | Bodakdev Tower | Jul 13 | 4 hrs | ₹120 | ❌ Cancelled |
| 5 | Prahlad Nagar | Jul 12 | 2 hrs | ₹56 | ✅ Completed |

**Monthly Summary (July):**
- 📊 Total bookings: 12
- 💰 Total spent: ₹680
- ⏱ Total parking time: 28 hrs
- ⭐ Most visited: SG Highway Mall

Need a detailed receipt or want to rebook any location?`,
  },
  {
    keywords: ['cancel', 'cancellation', 'cancel booking', 'refund'],
    response: `I can help you with **cancellation & refunds**. Here's how it works:

**Cancellation Policy:**
- ✅ **Free cancellation** up to 1 hour before booking
- ⚠️ 50% refund if cancelled within 1 hour of start
- ❌ No refund after parking session has started

**Your Active Bookings:**
1. SG Highway Mall — Today, 2:30 PM - 4:30 PM
   → Cancel for full refund (₹60)

**To cancel:**
1. Go to My Bookings → Select the booking
2. Tap "Cancel Booking"
3. Confirm cancellation
4. Refund credited to wallet within 5 minutes

**Need help?** If you face any issues with cancellation, our support team is available 24/7.

Would you like me to cancel your current active booking?`,
  },
  {
    keywords: ['support', 'help', 'contact', 'issue', 'problem', 'complaint'],
    response: `Our **support team** is here to help! 🤝

**Contact Options:**
| Channel | Availability | Response Time |
|---------|-------------|---------------|
| 📞 Phone | 24/7 | Instant |
| 💬 Live Chat | 24/7 | < 2 min |
| 📧 Email | 24/7 | < 4 hours |
| 🐦 Twitter | 9 AM - 9 PM | < 1 hour |

**Quick Help Topics:**
- 🔧 Report a broken barrier/gate
- 💳 Payment issues
- 🅿️ Spot not available at booking
- 🚗 Vehicle stuck / exit issues
- 💰 Refund not received
- ⚡ EV charger not working

**Emergency:** For urgent issues, call **1800-SPOTIQ (776-8747)** — toll free!

**SpotIQ Support Hours:** 24/7/365

What specific issue can I help you with?`,
  },
  {
    keywords: ['coupon', 'offer', 'discount', 'promo', 'code', 'deal'],
    response: `Here are the **best deals** available for you right now:

**Available Coupons:**
| Code | Discount | Valid Till | Min Order |
|------|----------|-----------|-----------|
| 🎉 FIRST50 | 50% off first booking | Jul 31 | ₹100 |
| 🚗 WEEKEND20 | ₹20 off weekend parking | Every weekend | ₹50 |
| ⚡ EVFREE50 | ₹50 off EV charging | Aug 15 | ₹200 |
| 📆 MONTHLY15 | 15% off monthly pass | Jul 31 | ₹1,000 |
| 🎁 REFER100 | ₹100 referral bonus | Unlimited | Any |

**How to Apply:**
1. Select a coupon code above
2. Go to booking/checkout
3. Tap "Apply Coupon"
4. Enter the code & enjoy savings!

**AI Recommendation:** Use **FIRST50** on your next booking for maximum savings! 💰

Want me to apply any coupon to your current booking?`,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    response: `Hey there! 👋 Welcome to **SpotIQ AI**!

I'm your intelligent parking assistant. How can I help you today?

**Quick things I can do:**
- 🅿️ Find the best parking near you
- 💳 Check rates & make bookings
- ⚡ Locate EV charging stations
- 🎟 Apply coupons & discounts
- 💰 Manage your wallet
- 🤖 Give personalized recommendations

Just type your question or choose a topic above!`,
  },
  {
    keywords: ['peak hour', 'busy', 'rush', 'best time', 'when to park'],
    response: `Here's the **parking demand pattern** for today:

**Peak Hours (High Demand):**
- 🕙 10:00 AM - 1:00 PM → Shopping & lunch rush
- 🕔 5:00 PM - 8:00 PM → Evening commute peak

**Off-Peak Hours (Easy Parking):**
- 🌅 7:00 AM - 9:00 AM → Early bird slots available
- 🌙 8:00 PM - 11:00 PM → Night rates apply
- 🌃 11:00 PM - 7:00 AM → Lowest demand

**AI Recommendation:** Park before 9:30 AM for the best availability and lowest rates!

**Real-time Availability:**
- SG Highway: 🟢 15/30 slots
- Ashram Road: 🟡 8/20 slots
- Vastrapur: 🔴 2/25 slots

Book early to avoid the rush! 🚗`,
  },
  {
    keywords: ['monthly pass', 'pass', 'subscription', 'plan'],
    response: `Here are the **monthly pass options**:

| Plan | Price | Savings | Best For |
|------|-------|---------|----------|
| 🥉 Basic | ₹800/mo | 30% off | 2-wheelers |
| 🥈 Standard | ₹1,500/mo | 35% off | Daily commuters |
| 🥇 Premium | ₹2,500/mo | 40% off | Multi-location |
| 💎 Unlimited | ₹4,000/mo | 50% off | All vehicles + EV |

**All Plans Include:**
- ✅ Guaranteed parking spot
- ✅ No surge pricing
- ✅ Priority EV charging
- ✅ Free cancellation
- ✅ 24/7 support

**Current Offer:** First month at 50% off! Use code **PASS50**

Would you like to subscribe to a monthly pass?`,
  },
  // ---- GENERAL KNOWLEDGE ----
  {
    keywords: ['weather', 'temperature', 'rain', 'sunny', 'forecast'],
    response: `I am SpotIQ, your parking assistant. I do not have real-time weather data, but I can help you find covered parking spots to protect your vehicle from rain or extreme sun!

Try asking me to find parking near you, and I will show spots with covered and shaded options.`,
  },
  {
    keywords: ['who are you', 'what are you', 'your name', 'tell me about yourself'],
    response: `I am SpotIQ AI, your intelligent parking assistant. I help drivers find, reserve, and pay for parking effortlessly. I can suggest the best parking spots based on your location, check real-time availability, help with EV charging, and manage your bookings. What would you like help with?`,
  },
  {
    keywords: ['time', 'what time', 'current time', 'clock'],
    response: `The current time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Need to book a parking spot? I can help you find one nearby!`,
  },
  {
    keywords: ['date', 'today date', 'what day', 'what date'],
    response: `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Need parking for today? I can help!`,
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate'],
    response: `You are welcome! I am always happy to help with your parking needs. Feel free to ask me anything anytime!`,
  },
  {
    keywords: ['joke', 'funny', 'make me laugh'],
    response: `Why did the car get a parking ticket? Because it could not find a SpotIQ parking spot! Just kidding. But seriously, let me help you find parking so you never get a ticket again.`,
  },
  {
    keywords: ['news', 'sports', 'cricket', 'football', 'movie', 'music', 'song', 'restaurant', 'food', 'recipe'],
    response: `I am SpotIQ, focused on smart parking solutions. I cannot help with that topic, but I can help you find parking near restaurants, stadiums, theaters, and more. Would you like me to find parking for you?`,
  },
  {
    keywords: ['help', 'what can you do', 'capabilities', 'features', 'options'],
    response: `Here is what I can help you with:

**Parking:** Find spots, check availability, see rates
**Booking:** Reserve spots, manage reservations
**Payments:** Wallet, transactions, refunds
**EV Charging:** Find stations, check speed and pricing
**Smart Features:** AI recommendations, peak hour tips
**Account:** Profile, vehicles, reward points

Just ask me anything about parking!`,
  },
  {
    keywords: ['ok', 'okay', 'k', 'sure', 'alright', 'cool', 'nice', 'great', 'awesome', 'good', 'perfect', 'fine'],
    response: `Great! Is there anything else I can help you with? I can find parking, check rates, or help with your bookings.`,
  },
];

const DEFAULT_RESPONSE = (topic) =>
  `I understand you're asking about **${topic}**. Let me help you with that!

For the best experience, try asking about:
- 🅿️ Parking locations & availability
- ⚡ EV charging stations
- 📅 Bookings & reservations
- 💳 Payments & wallet
- 🎟 Coupons & offers
- 📊 Rates & pricing

I'm always learning and getting smarter! What specific parking-related question can I help with?`;

/* ------------------------------------------------------------------ */
/*  CAPABILITIES DATA                                                  */
/* ------------------------------------------------------------------ */

const CAPABILITIES = [
  { emoji: '🚗', label: 'Find Parking', icon: FaCar },
  { emoji: '🅿️', label: 'Live Slots', icon: FaParking },
  { emoji: '💳', label: 'Payments', icon: FaCreditCard },
  { emoji: '⚡', label: 'EV Charging', icon: FaBolt },
  { emoji: '🎟', label: 'Coupons', icon: FaTags },
  { emoji: '🤖', label: 'AI Recommend', icon: FaRobot },
];

const SUGGESTED_QUESTIONS = [
  { text: 'Find parking near me', icon: FaMapMarkerAlt },
  { text: 'What are the rates?', icon: FaReceipt },
  { text: 'EV charging stations', icon: FaPlug },
  { text: 'Book a spot', icon: FaCalendarAlt },
  { text: 'My wallet balance', icon: FaWallet },
  { text: 'Cancel booking', icon: FaTimesCircle },
  { text: 'View booking history', icon: FaHistory },
  { text: 'Available coupons', icon: FaTags },
];

/* ------------------------------------------------------------------ */
/*  HELPER: format AI markdown-like text into JSX                       */
/* ------------------------------------------------------------------ */

function formatMessageText(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];

  const processInline = (line) => {
    const parts = [];
    let remaining = line;
    let key = 0;

    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={key++}>{remaining.slice(lastIndex, match.index)}</span>
        );
      }
      parts.push(
        <strong key={key++} className="font-semibold text-[#f9f0d7]">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < remaining.length) {
      parts.push(<span key={key++}>{remaining.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : line;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('|') && line.includes('|')) {
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c !== '');

      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      elements.push(
        <div
          key={`table-${i}`}
          className="my-2 overflow-x-auto rounded-lg border border-[#e7c588]/25"
        >
          <table className="w-full text-xs">
            {tableRows.length > 0 && (
              <thead>
                <tr className="bg-[#0a0a0b]/5 border-b border-[#e7c588]/25">
                  {tableRows[0].map((cell, ci) => (
                    <th
                      key={ci}
                      className="px-2 py-1.5 text-left text-[#e7c588]/80 font-medium"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tableRows.slice(1).map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-[#e7c588]/25 last:border-0 hover:bg-[#0a0a0b]/5 transition-colors"
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2 py-1.5 text-[#e7c588]/80">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }

    if (line.trim() === '') {
      elements.push(<div key={`space-${i}`} className="h-1.5" />);
      continue;
    }

    if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 ml-1 my-0.5">
          <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-0.5">•</span>
          <span className="text-[#e7c588]/80">{processInline(line.slice(2))}</span>
        </div>
      );
      continue;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 ml-1 my-0.5">
          <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 font-medium min-w-[14px]">
            {numberedMatch[1]}.
          </span>
          <span className="text-[#e7c588]/80">
            {processInline(numberedMatch[2])}
          </span>
        </div>
      );
      continue;
    }

    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <div key={i} className="mt-2 mb-1">
          <span className="text-[#f9f0d7] font-semibold">
            {line.slice(2, -2)}
          </span>
        </div>
      );
      continue;
    }

    elements.push(
      <div key={i} className="text-[#e7c588]/80 leading-relaxed">
        {processInline(line)}
      </div>
    );
  }

  if (inTable && tableRows.length > 0) {
    elements.push(
      <div
        key="table-final"
        className="my-2 overflow-x-auto rounded-lg border border-[#e7c588]/25"
      >
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#0a0a0b]/5 border-b border-[#e7c588]/25">
              {tableRows[0].map((cell, ci) => (
                <th
                  key={ci}
                  className="px-2 py-1.5 text-left text-[#e7c588]/80 font-medium"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-[#e7c588]/25 last:border-0 hover:bg-[#0a0a0b]/5 transition-colors"
              >
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 text-[#e7c588]/80">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return elements;
}

function getAIResponse(userMessage) {
  const lower = userMessage.toLowerCase();
  for (const entry of AI_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return DEFAULT_RESPONSE(
    userMessage.length > 40 ? userMessage.slice(0, 40) + '...' : userMessage
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', emoji: '🌅' };
  if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

/* ------------------------------------------------------------------ */
/*  STRIP EMOJIS (for speech synthesis)                                 */
/* ------------------------------------------------------------------ */

const STRIP_RE = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{200D}]|[\u{20E3}]|[\u{E0020}-\u{E007F}]|[^\w\s.,!?\-':;/()&]/gu;

function stripForSpeech(str) {
  if (!str) return '';
  return str
    .replace(STRIP_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ------------------------------------------------------------------ */
/*  AI AVATAR (memoized — never re-renders)                             */
/* ------------------------------------------------------------------ */

const AIAvatar = memo(({ size = 'md' }) => {
  const sizeClasses = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  const iconSizes = { sm: 'text-xs', md: 'text-base', lg: 'text-2xl' };
  return (
    <div className="relative flex-shrink-0">
      {size === 'lg' && (
        <span className="absolute inset-0 rounded-full bg-[#0a0a0b]0/30 animate-ping" />
      )}
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br bg-primary-400 flex items-center justify-center relative z-10`}
      >
        <FaRobot className={`text-[#f9f0d7] ${iconSizes[size]}`} />
      </div>
    </div>
  );
});
AIAvatar.displayName = 'AIAvatar';

/* ------------------------------------------------------------------ */
/*  THINKING ANIMATION (memoized)                                       */
/* ------------------------------------------------------------------ */

const ThinkingIndicator = memo(() => (
  <div className="flex items-start gap-2.5 mb-4">
    <AIAvatar size="sm" />
    <div className="bg-[#0a0a0b]/10  border border-[#e7c588]/25 rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex items-center gap-2">
        <FaBrain className="text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm animate-pulse" />
        <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm">SpotIQ AI is thinking</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1 h-1 rounded-full bg-gray-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </span>
      </div>
    </div>
  </div>
));
ThinkingIndicator.displayName = 'ThinkingIndicator';

/* ------------------------------------------------------------------ */
/*  MESSAGE BUBBLE (memoized — hover via CSS only, no parent re-render) */
/* ------------------------------------------------------------------ */

const MessageBubble = memo(({ msg, index }) => {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    const plainText = msg.text.replace(/\*\*/g, '');
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [msg.text]);
  const formattedContent = useMemo(
    () =>
      isUser ? null : (
        <div className="space-y-0.5">
          {formatMessageText(msg.text)}
        </div>
      ),
    [isUser, msg.text]
  );
  const timeStr = useMemo(() => {
    const d = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [msg.timestamp]);

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      style={{ willChange: 'transform' }}
    >
      {!isUser && <AIAvatar size="sm" />}

      <div
        className={`relative max-w-[82%] ${isUser ? 'ml-2' : 'mr-2'} group`}
      >
        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br bg-primary-600 text-[#f9f0d7] rounded-2xl rounded-br-md shadow-lg shadow-primary-400/10'
              : 'bg-[#0a0a0b]/10  border border-[#e7c588]/25 text-[#f3e0ae] rounded-2xl rounded-bl-md'
          }`}
        >
          {isUser ? (
            <span>{msg.text}</span>
          ) : (
            formattedContent
          )}
        </div>

        <div
          className={`flex items-center gap-2 mt-1 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="text-[10px] text-[#e7c588]/80">{timeStr}</span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#0a0a0b]/10 transition-opacity"
            >
              {copied ? (
                <FaCheck className="text-primary-400 text-[10px]" />
              ) : (
                <FaCopy className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-[10px]" />
              )}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-gray-700 flex items-center justify-center flex-shrink-0 ml-2">
          <FaUserCog className="text-[#e7c588]/80 text-[10px]" />
        </div>
      )}
    </div>
  );
});
MessageBubble.displayName = 'MessageBubble';

/* ================================================================== */
/*  MAIN COMPONENT                                                      */
/* ================================================================== */

const SpotIQChat = () => {
  /* ---- UI state ---- */
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  /* ---- Voice state ---- */
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  /* ---- Refs ---- */
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);
  const timersRef = useRef([]);
  const isOpenRef = useRef(false);
  const isListeningRef = useRef(false);
  const voiceModeRef = useRef(false);
  const accumulatedTranscript = useRef('');
  const autoRestartRef = useRef(false);
  const isThinkingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const lastSpeechTimeRef = useRef(0);

  /* ---- Keep refs in sync ---- */
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  /* ---- Greeting (memoized) ---- */
  const greeting = useMemo(() => getGreeting(), []);

  /* ---- Stable timer helper ---- */
  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  /* ================================================================ */
  /*  SCROLL (throttled via rAF)                                        */
  /* ================================================================ */

  const scrollRafRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      scrollRafRef.current = null;
    });
  }, []);

  /* ================================================================ */
  /*  INIT: browser support + cleanup on unmount                        */
  /* ================================================================ */

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
    synthRef.current = window.speechSynthesis;
    if (synthRef.current) {
      synthRef.current.getVoices();
      synthRef.current.onvoiceschanged = () => synthRef.current.getVoices();
    }
    return () => {
      /* full cleanup on unmount */
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      if (synthRef.current) synthRef.current.cancel();
      clearAllTimers();
      clearSilenceTimer();
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  /* ================================================================ */
  /*  CLEANUP when chat closes (not unmount)                            */
  /* ================================================================ */

  useEffect(() => {
    if (!isOpen) {
      /* stop everything when chat window closes */
      if (recognitionRef.current) {
        autoRestartRef.current = false;
        try { recognitionRef.current.stop(); } catch {}
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      if (synthRef.current) synthRef.current.cancel();
      setIsListening(false);
      setIsSpeaking(false);
      clearAllTimers();
      clearSilenceTimer();
    }
  }, [isOpen]);

  /* ================================================================ */
  /*  FOCUS input on open                                              */
  /* ================================================================ */

  useEffect(() => {
    if (isOpen && !isMinimized && messages.length === 0) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, messages.length]);

  /* ================================================================ */
  /*  SCROLL on new messages / thinking                                 */
  /* ================================================================ */

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  /* ================================================================ */
  /*  SPEECH SYNTHESIS (speak AI replies)                               */
  /* ================================================================ */

  const speakText = useCallback(
    (text) => {
      if (!synthRef.current || !voiceModeRef.current) return;
      synthRef.current.cancel();

      const cleanText = stripForSpeech(text);
      if (!cleanText) return;

      const voices = synthRef.current.getVoices();
      const preferred =
        voices.find(
          (v) =>
            v.lang === 'en-US' &&
            (v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Alex') ||
              v.name.includes('Natural'))
        ) || voices.find((v) => v.lang.startsWith('en'));

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);

      /* resume if browser pauses it on focus loss */
      const handleVisibility = () => {
        if (document.visibilityState === 'visible' && synthRef.current) {
          try { synthRef.current.resume(); } catch {}
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);
      return () => document.removeEventListener('visibilitychange', handleVisibility);
    },
    [] // no dependencies — reads voiceMode via ref
  );

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  /* ================================================================ */
  /*  SPEECH RECOGNITION (voice input) — FULLY FIXED                    */
  /*  - continuous = true                                               */
  /*  - accumulates interim results                                     */
  /*  - auto-sends after 2.5s silence                                   */
  /*  - auto-restarts on unexpected end                                 */
  /*  - handles errors gracefully                                       */
  /* ================================================================ */

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  /* Send accumulated speech text immediately */
  const sendAccumulatedText = useCallback(() => {
    clearSilenceTimer();
    const text = accumulatedTranscript.current.trim();
    accumulatedTranscript.current = '';
    setInput('');
    if (!text || !isOpenRef.current || isThinkingRef.current) return;

    const userMsg = { role: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    /* No artificial delay — respond instantly */
    const responseText = getAIResponse(text);
    const aiMsg = { role: 'assistant', text: responseText, timestamp: new Date() };
    setMessages((prev) => [...prev, aiMsg]);
    setIsThinking(false);
    if (voiceModeRef.current) {
      const speechText = stripForSpeech(responseText);
      if (speechText) setTimeout(() => speakText(speechText), 100);
    }
  }, [clearSilenceTimer, speakText]);

  /* Start silence timer — sends text after 2.5s of no speech */
  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      silenceTimerRef.current = null;
      /* User has been silent — send what we have */
      sendAccumulatedText();
      /* Restart recognition for next utterance */
      if (autoRestartRef.current && isOpenRef.current) {
        try {
          const r = createRecognition();
          if (r) {
            recognitionRef.current = r;
            r.start();
          }
        } catch {}
      }
    }, 2500);
  }, [clearSilenceTimer, sendAccumulatedText]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    autoRestartRef.current = false;
    /* Send any accumulated text before stopping */
    const text = accumulatedTranscript.current.trim();
    accumulatedTranscript.current = '';
    setInput('');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    /* Send the text if we have it */
    if (text && isOpenRef.current && !isThinkingRef.current) {
      const userMsg = { role: 'user', text, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);
      const responseText = getAIResponse(text);
      const aiMsg = { role: 'assistant', text: responseText, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
      if (voiceModeRef.current) {
        const speechText = stripForSpeech(responseText);
        if (speechText) setTimeout(() => speakText(speechText), 100);
      }
    }
  }, [clearSilenceTimer, speakText]);

  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      accumulatedTranscript.current = '';
      lastSpeechTimeRef.current = Date.now();
      setIsListening(true);
      setVoiceMode(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      /* Show interim results live in the input */
      if (interimTranscript) {
        setInput(accumulatedTranscript.current + interimTranscript);
      }

      /* Accumulate final results and reset silence timer */
      if (finalTranscript) {
        accumulatedTranscript.current += finalTranscript;
        setInput(accumulatedTranscript.current);
        lastSpeechTimeRef.current = Date.now();
        /* Reset silence timer — user is still speaking */
        startSilenceTimer();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        /* Silence detected — start/check silence timer */
        if (accumulatedTranscript.current.trim()) {
          /* We have text and got silence — start the send timer */
          startSilenceTimer();
        }
        return;
      }

      if (event.error === 'aborted') {
        return;
      }

      /* Fatal errors */
      console.warn('[SpotIQ Voice]', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        autoRestartRef.current = false;
        accumulatedTranscript.current = '';
        setInput('');
        clearSilenceTimer();
      }
    };

    recognition.onend = () => {
      clearSilenceTimer();
      setIsListening(false);

      /* If we have accumulated text, send it immediately */
      if (accumulatedTranscript.current.trim()) {
        const text = accumulatedTranscript.current.trim();
        accumulatedTranscript.current = '';
        setInput('');
        if (isOpenRef.current && !isThinkingRef.current) {
          const userMsg = { role: 'user', text, timestamp: new Date() };
          setMessages((prev) => [...prev, userMsg]);
          setIsThinking(true);
          const responseText = getAIResponse(text);
          const aiMsg = { role: 'assistant', text: responseText, timestamp: new Date() };
          setMessages((prev) => [...prev, aiMsg]);
          setIsThinking(false);
          if (voiceModeRef.current) {
            const speechText = stripForSpeech(responseText);
            if (speechText) setTimeout(() => speakText(speechText), 100);
          }
        }
      }

      /* Auto-restart if user hasn't manually stopped */
      if (autoRestartRef.current && isOpenRef.current) {
        addTimer(() => {
          if (autoRestartRef.current && isOpenRef.current) {
            try {
              const r = createRecognition();
              if (r) {
                recognitionRef.current = r;
                r.start();
              }
            } catch {}
          }
        }, 300);
      }
    };

    return recognition;
  }, [addTimer, speakText, startSilenceTimer, clearSilenceTimer]);

  const startVoiceInput = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
      return;
    }
    if (isSpeakingRef.current) {
      stopSpeaking();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    /* Stop any ongoing speech */
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
    accumulatedTranscript.current = '';
    autoRestartRef.current = true;

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {}
  }, [stopListening, stopSpeaking, createRecognition]);

  /* ================================================================ */
  /*  SEND MESSAGE                                                     */
  /* ================================================================ */

  const handleSend = useCallback(
    (text) => {
      const message = (text || input).trim();
      if (!message || isThinkingRef.current) return;

      /* stop any active listening */
      if (isListeningRef.current) {
        stopListening();
      }

      /* If user typed text (not voice), disable voice mode for replies */
      if (!text && input.trim()) {
        setVoiceMode(false);
        if (synthRef.current) synthRef.current.cancel();
        setIsSpeaking(false);
      }

      const userMsg = { role: 'user', text: message, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsThinking(true);

      addTimer(() => {
        const responseText = getAIResponse(message);
        const aiMsg = { role: 'assistant', text: responseText, timestamp: new Date() };
        setMessages((prev) => [...prev, aiMsg]);
        setIsThinking(false);
        if (voiceModeRef.current || text) {
          const speechText = stripForSpeech(responseText);
          if (speechText) setTimeout(() => speakText(speechText), 100);
        }
      }, 600);
    },
    [input, stopListening, speakText, addTimer]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const toggleVoiceMode = useCallback(() => {
    setVoiceMode((prev) => !prev);
    if (isSpeaking) stopSpeaking();
  }, [isSpeaking, stopSpeaking]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setIsThinking(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleToggleMinimize = useCallback(() => {
    setIsMinimized((p) => !p);
  }, []);

  const handleRestoreFromMinimized = useCallback(() => {
    setIsMinimized(false);
  }, []);

  /* ================================================================ */
  /*  RENDER                                                            */
  /* ================================================================ */

  return (
    <div className="spotiq-chat">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="floating-btn"
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br bg-primary-400 flex items-center justify-center shadow-xl shadow-primary-400/30 cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <span className="absolute inset-0 rounded-full border-2 border-gray-400/50 animate-ping" />
            <span className="absolute -inset-1 rounded-full border border-[#e7c588]/30 animate-pulse" />
            <FaRobot className="text-[#f9f0d7] text-xl relative z-10" />
            <span className="absolute -top-10 right-0 bg-[#0a0a0b] dark:bg-[#0a0a0b] text-[#f9f0d7] text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#e7c588]/25">
              Ask SpotIQ AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            key="chat-window"
            ref={chatWindowRef}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[9999] sm:w-[420px] sm:h-[650px] bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl shadow-primary-400/10 flex flex-col"
          >
            {/* Gradient border wrapper */}
            <div className="absolute inset-0 rounded-none sm:rounded-3xl p-px bg-gradient-to-br from-primary-400/30 via-[#e7c588]/10 to-[#e7c588]/20 pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col h-full bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-none sm:rounded-3xl overflow-hidden">
              {/* Background orbs — static, no animation */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#0a0a0b]0 rounded-full blur-3xl opacity-[0.03]" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#0a0a0b]0 rounded-full blur-3xl opacity-[0.03]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-400 rounded-full blur-3xl opacity-[0.02]" />
              </div>

              {/* ---- HEADER ---- */}
              <div className="relative z-20 flex-shrink-0 bg-[#0a0a0b] dark:bg-[#0a0a0b] border-b border-[#e7c588]/25">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="absolute inset-0 rounded-full bg-[#0a0a0b]0/20 animate-pulse" />
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-primary-400 flex items-center justify-center relative z-10">
                        <FaRobot className="text-[#f9f0d7] text-base" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[#f9f0d7] font-semibold text-sm leading-tight">
                        SpotIQ AI Assistant
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                        <span className="text-primary-400 text-[10px] font-medium">
                          Online
                        </span>
                        <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-[10px]">·</span>
                        <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-[10px] flex items-center gap-1">
                          <FaBrain className="text-[8px] text-[#e7c588]/80" />
                          Powered by AI
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleToggleMinimize}
                      className="p-2 rounded-xl hover:bg-[#0a0a0b]/5 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#f9f0d7] transition-all"
                      title="Minimize"
                    >
                      <FaMinus className="text-sm" />
                    </button>
                    <button
                      onClick={handleClearChat}
                      className="p-2 rounded-xl hover:bg-[#0a0a0b]/5 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#f9f0d7] transition-all"
                      title="Clear chat"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-xl hover:bg-[#0a0a0b]/5 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#f9f0d7] transition-all"
                      title="Close"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ---- MESSAGES OR WELCOME ---- */}
              <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.length === 0 && !isThinking ? (
                  /* ---- WELCOME SCREEN ---- */
                  <div className="flex-1 flex flex-col items-center justify-center px-0 py-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="mb-4"
                    >
                      <div className="relative">
                        <span className="absolute inset-0 rounded-full bg-[#0a0a0b]0/20 animate-ping" />
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br bg-primary-400 flex items-center justify-center shadow-lg shadow-primary-400/30 relative z-10">
                          <FaBrain className="text-[#f9f0d7] text-3xl" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center mb-6"
                    >
                      <h2 className="text-xl font-bold text-[#f9f0d7] mb-1">
                        {greeting.emoji} {greeting.text}!
                      </h2>
                      <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm leading-relaxed max-w-xs mx-auto">
                        I'm SpotIQ AI, your intelligent parking assistant
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="w-full mb-5"
                    >
                      <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 text-xs font-medium mb-3 text-center uppercase tracking-wider">
                        I can help you with
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {CAPABILITIES.map((cap, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.05 }}
                            className="bg-[#0a0a0b]/5 border border-[#e7c588]/25 rounded-xl p-3 flex items-center gap-2.5 hover:bg-[#0a0a0b]0/10 hover:border-primary-400/20 transition-all cursor-default group"
                          >
                            <span className="text-lg">{cap.emoji}</span>
                            <span className="text-[#e7c588]/80 text-xs font-medium group-hover:text-[#e7c588]/80 transition-colors">
                              {cap.label}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="w-full"
                    >
                      <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-xs mb-2.5 text-center">Try asking</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {SUGGESTED_QUESTIONS.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(q.text)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0b]/5 hover:bg-[#0a0a0b]0/15 border border-[#e7c588]/25 hover:border-primary-400/30 rounded-full text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 text-xs transition-all"
                          >
                            <q.icon className="text-[10px]" />
                            <span>{q.text}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <>
                    <AnimatePresence mode="popLayout">
                      {messages.map((msg, i) => (
                        <MessageBubble
                          key={`msg-${i}-${msg.timestamp.getTime()}`}
                          msg={msg}
                          index={i}
                        />
                      ))}
                    </AnimatePresence>

                    <AnimatePresence>{isThinking && <ThinkingIndicator />}</AnimatePresence>

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* ---- INPUT AREA ---- */}
              <div className="relative z-20 flex-shrink-0 bg-[#0a0a0b] dark:bg-[#0a0a0b]/80  border-t border-[#e7c588]/25 p-3">
                {/* Voice mode indicator */}
                {voiceMode && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0a0b]0/10 border border-primary-400/20">
                      <FaVolumeUp className="text-[#e7c588]/80 dark:text-[#e7c588]/80 text-[10px]" />
                      <span className="text-[10px] text-[#e7c588]/80 dark:text-[#e7c588]/80 font-medium">Voice replies ON</span>
                    </div>
                    <button
                      onClick={toggleVoiceMode}
                      className="text-[10px] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 transition-colors"
                    >
                      Turn off
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* Mic Button */}
                  {voiceSupported && (
                    <motion.button
                      onClick={startVoiceInput}
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        isListening
                          ? 'bg-[#e7c588] text-[#f9f0d7] shadow-lg shadow-[#e7c588]/20 animate-pulse'
                          : isSpeaking
                            ? 'bg-[#0a0a0b]0/20 text-primary-400 border border-primary-300/30'
                            : 'bg-[#0a0a0b]/5 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#f9f0d7] hover:bg-[#0a0a0b]/10 border border-[#e7c588]/25'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={isListening ? 'Stop listening' : isSpeaking ? 'Stop speaking' : 'Voice input'}
                    >
                      {isListening ? (
                        <FaMicrophoneSlash className="text-sm" />
                      ) : isSpeaking ? (
                        <FaVolumeUp className="text-sm" />
                      ) : (
                        <FaMicrophone className="text-sm" />
                      )}
                    </motion.button>
                  )}

                  <div className="flex-1 bg-[#0a0a0b]/5 rounded-2xl border border-[#e7c588]/25 focus-within:border-primary-400/30 transition-all overflow-hidden">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isListening ? 'Listening...' : 'Ask anything about parking...'}
                      className="w-full bg-transparent text-[#f9f0d7] text-sm px-4 py-3 placeholder-gray-500 focus:outline-none resize-none max-h-24"
                      rows={1}
                      disabled={isThinking || isListening}
                      style={{ minHeight: '44px' }}
                    />
                  </div>

                  {/* Voice mode toggle */}
                  {voiceSupported && (
                    <motion.button
                      onClick={toggleVoiceMode}
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        voiceMode
                          ? 'bg-[#0a0a0b]0/20 text-[#e7c588]/80 dark:text-[#e7c588]/80 border border-primary-400/30'
                          : 'bg-[#0a0a0b]/5 text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 border border-[#e7c588]/25'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={voiceMode ? 'Voice replies ON — click to disable' : 'Enable voice replies'}
                    >
                      {voiceMode ? <FaVolumeUp className="text-sm" /> : <FaVolumeMute className="text-sm" />}
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isThinking}
                    className="w-10 h-10 rounded-full bg-gradient-to-br bg-primary-400 flex items-center justify-center text-[#f9f0d7] shadow-lg shadow-primary-400/20 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPaperPlane className="text-sm" />
                  </motion.button>
                </div>

                {isThinking && (
                  <div className="flex items-center gap-1.5 mt-2 px-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                    <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-[10px] ml-1">AI is composing a response...</span>
                  </div>
                )}

                {/* Listening indicator */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 mt-2 px-1"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-[#e7c588] rounded-full"
                            animate={{ height: ['4px', '16px', '4px'] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                      <span className="text-[#e7c588] text-[10px] font-medium">Listening... speak now</span>
                      <button
                        onClick={stopListening}
                        className="text-[10px] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588] transition-colors ml-auto"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- MINIMIZED FLOATING BUTTON ---- */}
      {isOpen && isMinimized && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          onClick={handleRestoreFromMinimized}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br bg-primary-400 flex items-center justify-center shadow-xl shadow-primary-400/30 cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="absolute inset-0 rounded-full border-2 border-gray-400/50 animate-ping" />
          <FaRobot className="text-[#f9f0d7] text-xl relative z-10" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#e7c588] text-[#f9f0d7] text-[10px] font-bold flex items-center justify-center z-20">
              {messages.length}
            </span>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default SpotIQChat;
