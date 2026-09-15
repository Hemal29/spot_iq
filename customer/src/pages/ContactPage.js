import React, { useState } from 'react';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheck } from 'react-icons/fa';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import PageTransition from '../components/common/PageTransition';

const CONTACTS = [
  { icon: FaEnvelope, label: 'Email', value: 'support@spotiq.com' },
  { icon: FaPhoneAlt, label: 'Phone', value: '+91 79 4000 1234' },
  { icon: FaMapMarkerAlt, label: 'Office', value: 'SG Highway, Ahmedabad, Gujarat' },
  { icon: FaClock, label: 'Hours', value: '24x7 support, all days' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0b]">
        <PageHero
          badge={<><FaEnvelope className="text-[#e7c588]" /> We reply within 24 hours</>}
          title="Contact"
          highlight="Support"
          subtitle="Questions about bookings, payments or refunds — reach out"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-6">
          <div className="grid sm:grid-cols-2 gap-4 content-start">
            {CONTACTS.map((c) => (
              <GlassCard key={c.label} className="p-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#bf8a2e] to-[#e7c588] flex items-center justify-center shadow-lg mb-4">
                  <c.icon className="text-black" />
                </div>
                <p className="text-xs uppercase tracking-widest text-[#f9f0d7]/50">{c.label}</p>
                <p className="mt-1 font-semibold text-[#f9f0d7]">{c.value}</p>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="p-6" hover={false}>
            <h2 className="text-xl font-bold text-[#f9f0d7]">Send us a message</h2>
            <p className="mt-1 text-sm text-[#f9f0d7]/60">Our team usually responds within a few hours.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-[#e7c588]/25 text-[#f9f0d7] placeholder-[#f9f0d7]/40 text-sm focus:outline-none focus:border-[#e7c588]"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-[#e7c588]/25 text-[#f9f0d7] placeholder-[#f9f0d7]/40 text-sm focus:outline-none focus:border-[#e7c588]"
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help?"
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-[#e7c588]/25 text-[#f9f0d7] placeholder-[#f9f0d7]/40 text-sm focus:outline-none focus:border-[#e7c588] resize-none"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#e7c588] text-black font-bold hover:bg-[#f3e0ae] active:scale-[0.98] transition-all"
              >
                <FaPaperPlane className="text-sm" /> Send Message
              </button>
              {sent && (
                <p className="flex items-center gap-2 text-sm text-[#e7c588]">
                  <FaCheck /> Message received. We will get back to you soon.
                </p>
              )}
            </form>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
