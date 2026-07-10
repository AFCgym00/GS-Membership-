import { useEffect, useRef, useState } from 'react';
import { Check, Sparkles, Flame, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pricingPlans = [
  {
    name: 'Strength Plan',
    description: 'Perfect for building muscle and strength',
    icon: Flame,
    popular: false,
    periods: [
      { months: 1, price: 1200 },
      { months: 3, price: 2800, save: 'Save ₹800' },
      { months: 6, price: 5000, save: 'Save ₹2,200' },
      { months: 12, price: 9000, save: 'Save ₹5,400', best: true },
    ],
    features: [
      'Full Gym Access',
      'Strength Equipment',
      'Basic Guidance',
      'Locker Facility',
      'Free Wi-Fi',
    ],
  },
  {
    name: 'Strength + Cardio Plan',
    description: 'Complete fitness with strength & cardio',
    icon: Sparkles,
    popular: true,
    periods: [
      { months: 1, price: 1800 },
      { months: 3, price: 4000, save: 'Save ₹1,400' },
      { months: 6, price: 7000, save: 'Save ₹3,800' },
      { months: 12, price: 12000, save: 'Save ₹9,600', best: true },
    ],
    features: [
      'Full Gym Access',
      'Strength Training',
      'All Cardio Machines',
      'Personal Trainer Support',
      'Locker Facility',
      'Free Wi-Fi',
      'Diet Consultation',
    ],
  },
];

const Pricing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState<{ [key: string]: number }>({
    'Strength Plan': 3,
    'Strength + Cardio Plan': 3,
  });
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
  const getWhatsAppLink = (planName: string, months: number, price: number) => {
    const message = encodeURIComponent(
      `Hi! I'm interested in the ${planName} for ${months} month(s) at ₹${price}. Please provide more details.`
    );
    return `https://wa.me/${whatsappNumber}?text=${message}`;
  };

  return (
    <section id="pricing" ref={sectionRef} className="py-20 lg:py-32 bg-neutral-950">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm font-medium mb-4">
              Membership Plans
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Choose Your <span className="text-gradient">Plan</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Flexible membership options to fit your fitness goals and budget
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-2 gap-8">
            {pricingPlans.map((plan, planIndex) => {
              const Icon = plan.icon;
              const selectedPeriod = selectedPeriods[plan.name];
              const currentPeriod = plan.periods.find((p) => p.months === selectedPeriod)!;

              return (
                <div
                  key={plan.name}
                  className={`relative p-8 rounded-3xl transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  } ${
                    plan.popular
                      ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/50'
                      : 'bg-neutral-900 border border-white/5'
                  }`}
                  style={{ transitionDelay: `${planIndex * 200}ms` }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 rounded-full">
                      <span className="text-white text-sm font-semibold">Most Popular</span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                        plan.popular ? 'bg-orange-500' : 'bg-orange-500/10'
                      }`}
                    >
                      <Icon className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-orange-500'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>

                  {/* Period Selector */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {plan.periods.map((period) => (
                      <button
                        key={period.months}
                        onClick={() =>
                          setSelectedPeriods((prev) => ({ ...prev, [plan.name]: period.months }))
                        }
                        className={`py-2 px-1 rounded-xl text-sm font-medium transition-all ${
                          selectedPeriod === period.months
                            ? 'bg-orange-500 text-white'
                            : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                        }`}
                      >
                        {period.months}M
                        {period.best && (
                          <span className="block text-[10px] opacity-80">BEST</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Price Display */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-gray-400 text-lg">₹</span>
                      <span className="text-5xl font-bold text-white">{currentPeriod.price.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      for {currentPeriod.months} month{currentPeriod.months > 1 ? 's' : ''}
                    </p>
                    {currentPeriod.save && (
                      <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        {currentPeriod.save}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.popular ? 'bg-orange-500' : 'bg-orange-500/20'
                          }`}
                        >
                          <Check className={`w-3 h-3 ${plan.popular ? 'text-white' : 'text-orange-500'}`} />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <a
                    href={getWhatsAppLink(plan.name, currentPeriod.months, currentPeriod.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      className={`w-full py-6 text-lg font-semibold rounded-xl ${
                        plan.popular
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Enquire on WhatsApp
                    </Button>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-400">
              💡 <span className="text-white font-medium">Pro Tip:</span> Longer plans offer better value and help you stay committed to your fitness journey!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
