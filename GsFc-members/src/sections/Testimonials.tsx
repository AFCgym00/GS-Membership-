import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Member since 2022',
    image: '/testimonial-1.jpg',
    rating: 5,
    text: 'AFC Gym transformed my life! The trainers are incredibly supportive and the equipment is top-notch. I\'ve lost 15kg in 6 months and feel more energetic than ever.',
  },
  {
    name: 'Priya Patel',
    role: 'Member since 2023',
    image: '/testimonial-2.jpg',
    rating: 5,
    text: 'Best gym in Mumbra! The group classes are amazing and the atmosphere is so motivating. The personal trainers really care about your progress.',
  },
  {
    name: 'Mohammed Khan',
    role: 'Member since 2021',
    image: '/testimonial-3.jpg',
    rating: 5,
    text: 'I\'ve been to many gyms but AFC Gym stands out. Flexible timings, great location, and affordable prices. Highly recommend to everyone in Thane area!',
  },
];

const Testimonials = () => {
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

    const cards = sectionRef.current?.querySelectorAll('.testimonial-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="testimonials" ref={sectionRef} className="py-20 lg:py-32 bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              What Our <span className="text-gradient">Members Say</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Real stories from real members who transformed their lives at AFC Gym
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => {
              const isVisible = visibleCards.includes(index);
              
              return (
                <div
                  key={index}
                  data-index={index}
                  className={`testimonial-card relative p-8 bg-neutral-900 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <Quote className="w-5 h-5 text-orange-500" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-orange-500/30"
                    />
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Banner */}
          <div className="mt-16 p-8 lg:p-12 bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-3xl border border-orange-500/20">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">500+</div>
                <div className="text-gray-400">Active Members</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">1000+</div>
                <div className="text-gray-400">Transformations</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">4.9★</div>
                <div className="text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
