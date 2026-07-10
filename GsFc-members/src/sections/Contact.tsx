import { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Clock, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Address',
    content: 'AFC GYM, Bhima Venu Apartment, A/3, Zainy Colony, Anand Koliwada, Mumbra, Thane, Maharashtra 400612',
    link: 'https://maps.google.com/?q=AFC+GYM+Mumbra+Thane',
    linkText: 'Get Directions',
  },
  {
    icon: Phone,
    title: 'Phone',
    content: '+91 77868 88111',
    link: 'tel:+917786888111',
    linkText: 'Call Now',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    content: 'Monday - Sunday: 6:00 AM - 11:30 PM',
    subContent: 'Open 7 days a week',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'contact@azharfitness.com',
    link: 'mailto:contact@azharfitness.com',
    linkText: 'Send Email',
  },
];

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const whatsappNumber = '917786888111';
  const whatsappMessage = encodeURIComponent('Hi! I want to join AFC Gym. Please share membership details.');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section id="contact" ref={sectionRef} className="py-20 lg:py-32 bg-neutral-950">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm font-medium mb-4">
              Contact Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Get In <span className="text-gradient">Touch</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Ready to start your fitness journey? Contact us today for a free consultation!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info Cards */}
            <div
              className={`space-y-6 transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="p-6 bg-neutral-900 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.content}</p>
                        {item.subContent && (
                          <p className="text-orange-400 text-sm mt-1">{item.subContent}</p>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target={item.link.startsWith('http') ? '_blank' : undefined}
                            rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm mt-2 transition-colors"
                          >
                            {item.linkText}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quick CTA */}
              <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">Chat with us on WhatsApp</h3>
                    <p className="text-white/80 text-sm">Get instant replies to your queries</p>
                  </div>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="secondary"
                      className="bg-white text-orange-600 hover:bg-gray-100 font-semibold"
                    >
                      Chat Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Map / Location Visual */}
            <div
              className={`transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <div className="h-full min-h-[400px] bg-neutral-900 rounded-3xl border border-white/5 overflow-hidden relative">
                {/* Map Placeholder with Location Info */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 bg-neutral-800 relative">
                    {/* Decorative Map Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        </pattern>
                        <rect width="100" height="100" fill="url(#grid)" className="text-orange-500"/>
                      </svg>
                    </div>
                    
                    {/* Location Pin */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center animate-pulse-glow">
                          <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rotate-45" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Location Details */}
                  <div className="p-6 bg-neutral-900 border-t border-white/5">
                    <h3 className="text-white font-bold text-lg mb-2">AFC Gym - AZhar Fitness</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Bhima Venu Apartment, A/3, Zainy Colony, Anand Koliwada, Mumbra, Thane
                    </p>
                    <a
                      href="https://maps.google.com/?q=AFC+GYM+Mumbra+Thane"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Areas Served */}
          <div className="mt-16 text-center">
            <h3 className="text-white font-semibold mb-4">Areas We Serve</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Mumbra', 'Thane', 'Kausa', 'Diva', 'Kalwa', 'Kalyan', 'Dombivli'].map((area) => (
                <span
                  key={area}
                  className="px-4 py-2 bg-neutral-900 text-gray-400 rounded-full text-sm border border-white/5"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
