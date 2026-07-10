import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import Services from '@/sections/Services';
import Pricing from '@/sections/Pricing';
import About from '@/sections/About';
import Testimonials from '@/sections/Testimonials';
import Contact from '@/sections/Contact';
import Footer from '@/sections/Footer';
import WhatsAppButton from '@/sections/WhatsAppButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <Services />
        <Pricing />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
