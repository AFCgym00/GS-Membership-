import { useEffect, useRef, useState } from 'react';
import { Dumbbell, HeartPulse, UserRound, Apple, Flame, TrendingUp } from 'lucide-react';

const services = [
  {
    icon: Dumbbell,
    title: 'Strength Training',
    description: 'Build muscle and increase strength with our comprehensive free weights and machines area.',
    items: ['Free weights', 'Barbells & dumbbells', 'Cable machines', 'Compound lifts'],
  },
  {
    icon: HeartPulse,
    title: 'Cardio Zone',
    description: 'Improve cardiovascular fitness with our range of modern cardio equipment.',
    items: ['Treadmills', 'Cycling', 'Rowing machines', 'Cross trainers'],
  },
  {
    icon: UserRound,
    title: 'Personal Training',
    description: 'One-on-one sessions with certified trainers tailored to your specific goals.',
    items: ['Custom programs', 'Form correction', 'Progress tracking', '12 sessions/month'],
  },
  {
    icon: Apple,
    title: 'Nutrition Guidance',
    description: 'Expert diet plans and nutrition advice to complement your workout routine.',
    items: ['Diet planning', 'Calorie tracking', 'Macro guidance', 'Supplement advice'],
  },
  {
    icon: Flame,
    title: 'Fat Loss Programs',
    description: 'Targeted programs designed to accelerate fat loss while preserving lean muscle.',
    items: ['HIIT workouts', 'Metabolic training', 'Body composition tracking', 'Weekly check-ins'],
  },
  {
    icon: TrendingUp,
    title: 'Muscle Gain',
    description: 'Science-backed hypertrophy programs for maximum muscle growth and strength.',
    items: ['Progressive overload', 'Split routines', 'Recovery planning', 'Periodization'],
  },
];

const Services = () => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = sectionRef.current?.querySelectorAll('.service-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-20 lg:py-32 bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm font-medium mb-4">
              What We Offer
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our <span className="text-orange-500">Services</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Everything you need to achieve your fitness goals under one roof
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isVisible = visibleCards.includes(index);

              return (
                <div
                  key={service.title}
                  data-index={index}
                  className={`service-card rounded-2xl bg-neutral-900 border border-white/5 hover:border-orange-500/30 transition-all duration-700 p-6 sm:p-8 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400 mb-5">{service.description}</p>
                  <ul className="space-y-2">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
