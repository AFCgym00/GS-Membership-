import { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Clock, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const highlights = [
  'State-of-the-art equipment',
  'Certified professional trainers',
  'Personalized workout plans',
  'Nutrition guidance',
  'Flexible timing',
  'Affordable membership plans',
];

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const whatsappNumber = '917786888111';
  const whatsappMessage = encodeURIComponent('Hi! I want to know more about AFC Gym membership plans.');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section id="about" ref={sectionRef} className="py-20 lg:py-32 bg-neutral-950">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Image */}
            <div
              className={`relative transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative rounded-3xl overflow-hidden">
                  <img
                    src="/gym-interior.jpg"
                    alt="AFC Gym Interior"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Floating Card */}
                <div className="absolute -bottom-6 -right-6 bg-orange-500 rounded-2xl p-6 shadow-2xl">
                  <div className="text-4xl font-bold text-white">5+</div>
                  <div className="text-white/80 text-sm">Years of<br />Excellence</div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-orange-500/30 rounded-2xl" />
                <div className="absolute -bottom-4 left-1/4 w-16 h-16 bg-orange-500/10 rounded-xl" />
              </div>
            </div>

            {/* Right - Content */}
            <div
              className={`space-y-8 transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <div>
                <span className="inline-block px-4 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm font-medium mb-4">
                  About Us
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Welcome to <span className="text-gradient">AFC Gym</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Located in the heart of Mumbra, Thane, AFC Gym - AZhar Fitness is your premier 
                  destination for fitness and wellness. We provide a supportive environment where 
                  you can achieve your fitness goals with the help of our expert trainers and 
                  state-of-the-art equipment.
                </p>
              </div>

              {/* Highlights */}
              <div className="grid sm:grid-cols-2 gap-3">
                {highlights.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              {/* Contact Info Cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-900 rounded-xl border border-white/5">
                  <MapPin className="w-6 h-6 text-orange-500 mb-2" />
                  <p className="text-white text-sm font-medium">Location</p>
                  <p className="text-gray-400 text-xs mt-1">Mumbra, Thane</p>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl border border-white/5">
                  <Clock className="w-6 h-6 text-orange-500 mb-2" />
                  <p className="text-white text-sm font-medium">Hours</p>
                  <p className="text-gray-400 text-xs mt-1">6 AM - 11:30 PM</p>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl border border-white/5">
                  <Phone className="w-6 h-6 text-orange-500 mb-2" />
                  <p className="text-white text-sm font-medium">Contact</p>
                  <p className="text-gray-400 text-xs mt-1">077868 88111</p>
                </div>
              </div>

              {/* CTA */}
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-full"
                >
                  <Award className="w-5 h-5 mr-2" />
                  Get Free Consultation
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
