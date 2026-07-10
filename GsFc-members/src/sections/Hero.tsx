import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dumbbell, ChevronRight, Users, Trophy, Flame, Clock } from 'lucide-react';

const stats = [
  { icon: Users, value: '500+', label: 'Active Members' },
  { icon: Trophy, value: '5+', label: 'Years Experience' },
  { icon: Flame, value: '10+', label: 'Expert Trainers' },
  { icon: Clock, value: '17+', label: 'Hours Open' },
];

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center bg-background overflow-hidden pt-24 pb-16">
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <div
            className={`space-y-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-orange-400 text-sm font-medium">MM Valley Grace Square — Society Gym</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-white">Transform Your </span>
                <span className="text-orange-500">Body</span>
                <br />
                <span className="text-white">at AFC Gym</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                Professional trainers, state-of-the-art equipment, and flexible timings. Your fitness
                journey starts here at MM Valley Grace Square, Mumbra.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#pricing">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-full gap-2 shadow-[0_0_30px_rgba(249,115,22,0.4)]"
                >
                  <Dumbbell className="w-5 h-5" />
                  Start Your Journey
                </Button>
              </a>
              <a href="#pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 px-8 py-6 text-lg font-semibold rounded-full gap-2"
                >
                  View Plans
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-neutral-900/60 border border-white/10 rounded-2xl p-5 text-center space-y-1"
                  >
                    <Icon className="w-5 h-5 text-orange-500 mx-auto" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-gray-400 text-xs">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
