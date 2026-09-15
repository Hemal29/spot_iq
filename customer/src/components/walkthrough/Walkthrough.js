import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaMapMarkerAlt, FaCalendarCheck, FaCreditCard, FaCheckCircle,
  FaTimes, FaArrowRight, FaArrowLeft, FaPlay, FaQuestionCircle,
  FaCar, FaMoneyBillWave, FaParking, FaMobileAlt, FaStar, FaShieldAlt,
} from 'react-icons/fa';

const STEPS = [
  {
    title: 'Find Your Parking',
    description: 'Search for parking spots across Ahmedabad. Use filters to find the perfect spot by location, price, or amenities like EV charging and covered parking.',
    icon: FaSearch,
    color: 'bg-primary-600',
    bgLight: 'bg-[#0a0a0b]',
    textLight: 'text-[#e7c588]/80',
    borderLight: 'border-[#e7c588]/25',
    illustration: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 to-transparent rounded-2xl" />
        <div className="relative grid grid-cols-3 gap-2 p-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-[#121214] dark:bg-[#121214]  animate-pulse" style={{ animationDelay: `${i * 0.1}s`, animationDuration: '2s' }} />
          ))}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0a0a0b]0 text-[#f9f0d7] text-[10px] font-bold rounded-full shadow-lg shadow-primary-400/30">
          12 spots near you
        </div>
      </div>
    ),
  },
  {
    title: 'Choose Your Spot',
    description: 'Browse parking details — check real-time availability, ratings, amenities, photos, and user reviews. Pick the spot that fits your needs.',
    icon: FaMapMarkerAlt,
    color: 'bg-primary-600',
    bgLight: 'bg-[#0a0a0b]',
    textLight: 'text-[#e7c588]/80',
    borderLight: 'border-[#e7c588]/25',
    illustration: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#121214]/10 flex items-center justify-center">
            <FaMapMarkerAlt className="text-4xl text-[#e7c588]/80" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#0a0a0b]0 flex items-center justify-center text-[#f9f0d7] text-xs font-bold shadow-lg">4.8</div>
          <div className="absolute -bottom-2 -left-2 px-2 py-0.5 bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-lg shadow text-[10px] font-medium text-primary-400 border border-[#e7c588]/25/20">
            Open Now
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Book & Schedule',
    description: 'Select your vehicle, choose date & time, and confirm your booking in seconds. Our smart system shows you the best rates and availability instantly.',
    icon: FaCalendarCheck,
    color: 'from-[#0a0a0b] to-[#e7c588]',
    bgLight: 'bg-[#0a0a0b]',
    textLight: 'text-primary-400',
    borderLight: 'border-[#e7c588]/25',
    illustration: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b]  rounded-xl p-3 shadow-sm border border-[#e7c588]/25 dark:border-[#e7c588]/25  w-40">
          <div className="text-[10px] font-semibold text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mb-2">SELECT DATE & TIME</div>
          <div className="flex items-center gap-1 mb-1">
            {['M','T','W','T','F','S','S'].map((d,i) => (
              <div key={i} className={`w-4 h-4 rounded text-[7px] flex items-center justify-center font-medium ${i === 2 ? 'bg-[#0a0a0b]0 text-[#f9f0d7]' : 'text-[#e7c588]/80'}`}>{d}</div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex-1 h-5 rounded bg-[#121214]/10 flex items-center justify-center text-[8px] font-medium text-primary-400">10:00 AM</div>
            <span className="text-[8px] text-[#e7c588]/80">to</span>
            <div className="flex-1 h-5 rounded bg-[#121214]/10 flex items-center justify-center text-[8px] font-medium text-primary-400">12:00 PM</div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#e7c588]/25 dark:border-[#e7c588]/25/50  flex justify-between text-[9px]">
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Total</span>
            <span className="font-bold text-primary-400">₹120</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Secure Payment',
    description: 'Pay seamlessly with our secure payment gateway. Multiple options including cards, UPI, and wallets. Your transaction is 100% protected.',
    icon: FaCreditCard,
    color: 'bg-primary-400',
    bgLight: 'bg-[#0a0a0b]',
    textLight: 'text-primary-400',
    borderLight: 'border-[#e7c588]/25',
    illustration: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b]  rounded-xl p-3 shadow-sm border border-[#e7c588]/25 dark:border-[#e7c588]/25  w-44">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-semibold text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">PAYMENT</span>
            <FaShieldAlt className="text-[10px] text-primary-400" />
          </div>
          <div className="bg-primary-400 rounded-lg p-2 mb-2">
            <div className="text-[6px] text-[#f9f0d7]/80">CARD</div>
            <div className="text-[10px] text-[#f9f0d7] font-mono font-bold tracking-wider">•••• •••• •••• 4821</div>
            <div className="flex justify-between text-[7px] text-[#f9f0d7]/80 mt-1">
              <span>VALID THRU 12/28</span>
              <span>VISA</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Amount</span>
            <span className="font-bold text-primary-400">₹120.00</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Park & Relax',
    description: 'Show your booking QR code at the parking lot for instant entry. Get directions, enjoy your day, and extend your booking anytime from the app.',
    icon: FaCheckCircle,
    color: 'from-[#0a0a0b] to-[#e7c588]',
    bgLight: 'bg-[#0a0a0b]',
    textLight: 'text-primary-400',
    borderLight: 'border-[#e7c588]/25',
    illustration: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 bg-[#0a0a0b] dark:bg-[#0a0a0b]  rounded-2xl shadow-sm border border-[#e7c588]/25 dark:border-[#e7c588]/25  flex items-center justify-center">
            <div className="grid grid-cols-5 gap-0.5">
              {[...Array(25)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-sm ${Math.random() > 0.5 ? 'bg-[#0a0a0b]white' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-[#0a0a0b]0 text-[#f9f0d7] text-[8px] font-bold rounded-full shadow-lg">
            QR Code
          </div>
        </div>
      </div>
    ),
  },
];

const WalkthroughButton = ({ onClick, isOpen }) => (
  <motion.button
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all ${
      isOpen
        ? 'bg-[#0a0a0b]white text-[#f9f0d7] rotate-90'
        : 'bg-gradient-to-br bg-primary-600 text-[#f9f0d7] hover:shadow-primary-400/30'
    }`}
    title="How to Book"
  >
    {isOpen ? <FaTimes className="text-xl" /> : <FaQuestionCircle className="text-2xl" />}
  </motion.button>
);

const StepIndicator = ({ current, total }) => (
  <div className="flex items-center justify-center gap-2">
    {[...Array(total)].map((_, i) => (
      <motion.div
        key={i}
        animate={{
          width: i === current ? 24 : 8,
          backgroundColor: i <= current ? '#3B82F6' : '#E5E7EB',
        }}
        className="h-2 rounded-full"
        transition={{ duration: 0.3 }}
      />
    ))}
  </div>
);

const Walkthrough = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeen, setHasSeen] = useState(() => localStorage.getItem('walkthrough_seen'));

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('walkthrough_seen', 'true');
    setHasSeen('true');
    setCurrentStep(0);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setCurrentStep(0);
  };

  const Icon = step.icon;

  return (
    <>
      {!hasSeen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-6 z-50"
        >
          <div className="relative bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-xl border border-[#e7c588]/25 dark:border-[#e7c588]/25 px-4 py-3">
            <button
              onClick={() => { setHasSeen('true'); localStorage.setItem('walkthrough_seen', 'true'); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1c1c1f] dark:bg-[#1c1c1f] rounded-full flex items-center justify-center text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:bg-gray-300:bg-[#0a0a0b]0"
            >
              <FaTimes className="text-[8px]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br bg-primary-600 flex items-center justify-center text-[#f9f0d7] shadow-lg shadow-primary-400/20">
                <FaPlay className="text-sm ml-0.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#f9f0d7] dark:text-[#f9f0d7] ">New to SpotIQ?</p>
                <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 ">See how it works in 1 minute</p>
              </div>
              <button
                onClick={handleOpen}
                className="px-3 py-1.5 text-xs font-semibold text-[#f9f0d7] bg-primary-400 hover:bg-primary-500 rounded-lg transition-colors whitespace-nowrap"
              >
                Show Me
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <WalkthroughButton onClick={handleOpen} isOpen={isOpen} />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60  z-50"
              onClick={handleClose}
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="pointer-events-auto w-full max-w-lg"
              >
                <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-3xl shadow-2xl border border-[#e7c588]/25 dark:border-[#e7c588]/25 overflow-hidden">
                  {/* Header */}
                  <div className="relative p-6 pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FaParking className="text-primary-400 text-lg" />
                        <span className="text-sm font-bold text-[#f9f0d7] dark:text-[#f9f0d7] ">How to Book</span>
                      </div>
                      <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-xl bg-[#121214] dark:bg-[#121214]  flex items-center justify-center text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:bg-[#1c1c1f] dark:hover:bg-[#1c1c1f] dark:bg-[#1c1c1f]  transition-all"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>

                    <StepIndicator current={currentStep} total={STEPS.length} />

                    <p className="text-center text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80  mt-2 font-medium">
                      Step {currentStep + 1} of {STEPS.length}
                    </p>
                  </div>

                  {/* Step Content */}
                  <div className="p-6">
                    <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0b] dark:bg-[#121214]  border border-[#e7c588]/25 dark:border-[#e7c588]/25/50  mb-5 h-36">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentStep}
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full"
                        >
                          {step.illustration}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-[#f9f0d7] shadow-lg`}>
                        <Icon className="text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#f9f0d7] dark:text-[#f9f0d7] ">Step {currentStep + 1}</p>
                        <h3 className="text-lg font-bold text-[#f9f0d7] dark:text-[#f9f0d7]  leading-tight">{step.title}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={handlePrev}
                        disabled={isFirst}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isFirst
                            ? 'text-[#e7c588]/80 cursor-not-allowed'
                            : 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214] '
                        }`}
                      >
                        <FaArrowLeft className="text-xs" />
                        Back
                      </button>

                      <button
                        onClick={handleNext}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#f9f0d7] shadow-lg transition-all ${
                          isLast
                            ? 'bg-gradient-to-r from-[#0a0a0b] to-[#e7c588] shadow-primary-400/20 hover:shadow-primary-400/30'
                            : 'bg-primary-500 shadow-primary-400/20 hover:shadow-primary-400/30'
                        }`}
                      >
                        {isLast ? 'Got It!' : 'Next'}
                        {!isLast && <FaArrowRight className="text-xs" />}
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center justify-center gap-1">
                      {STEPS.slice(0, -1).map((s, i) => {
                        const SpIcon = s.icon;
                        return (
                          <div key={i} className="flex items-center">
                            <button
                              onClick={() => setCurrentStep(i)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] transition-all ${
                                i < currentStep
                                  ? 'bg-[#0a0a0b]0 text-[#f9f0d7]'
                                  : i === currentStep
                                    ? 'bg-[#0a0a0b]0 text-[#f9f0d7] scale-110 shadow-md'
                                    : 'bg-[#121214] dark:bg-[#121214]  text-[#e7c588]/80 dark:text-[#e7c588]/80 '
                              }`}
                            >
                              {i < currentStep ? <FaCheckCircle className="text-[9px]" /> : <SpIcon className="text-[9px]" />}
                            </button>
                            {i < STEPS.length - 2 && (
                              <div className={`w-6 h-0.5 ${i < currentStep ? 'bg-[#0a0a0b]0' : 'bg-[#1c1c1f] dark:bg-[#1c1c1f] '}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Walkthrough;
