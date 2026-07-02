import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import HowItWorks from '../components/home/HowItWorks';
import PricingSection from '../components/home/PricingSection';
import PopularLocations from '../components/home/PopularLocations';
import Testimonials from '../components/home/Testimonials';
import CTASection from '../components/home/CTASection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <PopularLocations />
      <Testimonials />
      <CTASection />
    </main>
  );
}
