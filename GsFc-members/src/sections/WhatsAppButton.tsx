import { MessageCircle, X, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);

  useEffect(() => {
    // Show button after scrolling a bit
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Hide notification after 5 seconds
    const notificationTimer = setTimeout(() => {
      setHasNotification(false);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(notificationTimer);
    };
  }, []);

  const whatsappNumber = '917786888111';
  const whatsappMessage = encodeURIComponent('Hi! I\'m interested in joining AFC Gym. Can you help me with membership details?');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const quickReplies = [
    'Membership plans & prices',
    'Gym timings & location',
    'Personal training info',
    'Free trial session',
  ];

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Chat Preview Popup */}
        {isChatOpen && (
          <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-green-500 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">AFC Gym Assistant</h4>
                <p className="text-white/80 text-xs">Typically replies instantly</p>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="p-4 bg-gray-50">
              {/* Welcome Message */}
              <div className="flex gap-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%]">
                  <p className="text-gray-700 text-sm">
                    👋 Welcome to AFC Gym! How can I help you today?
                  </p>
                </div>
              </div>

              {/* Quick Replies */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">Quick options:</p>
                {quickReplies.map((reply, index) => (
                  <a
                    key={index}
                    href={`${whatsappLink}&text=${encodeURIComponent(reply)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-left px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-green-50 hover:border-green-200 transition-colors"
                  >
                    {reply}
                  </a>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            setHasNotification(false);
          }}
          className="relative w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          {/* Notification Badge */}
          {hasNotification && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </span>
          )}

          {/* Pulse Animation */}
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
          
          {/* Icon */}
          <MessageCircle className="w-8 h-8 text-white" />
        </button>

        {/* Tooltip */}
        {!isChatOpen && (
          <div className="absolute bottom-20 right-0 bg-white px-4 py-2 rounded-xl shadow-lg whitespace-nowrap">
            <p className="text-sm text-gray-700 font-medium">Chat with us!</p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45" />
          </div>
        )}
      </div>
    </>
  );
};

export default WhatsAppButton;
