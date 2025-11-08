'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Clock, Star, MessageCircle, CheckCircle } from 'lucide-react';

interface DeliveryStatusProps {
  riderName?: string;
  riderPhone?: string;
  customMessage?: string;
  isAnimating?: boolean;
}

const DELIVERY_STORIES = [
  "🏍️ Ravi is on his way with your delicious food!",
  "🚚 Your order is cruising through the city streets...",
  "🛵 Ravi is navigating the traffic to reach you soon!",
  "📍 Your food is just around the corner now!",
  "⭐ Ravi is excited to deliver your hot meal!",
  "🌟 Getting closer to your location with fresh food!",
  "🎯 Almost there! Ravi can see your destination!",
  "🔥 Your piping hot food is moments away!"
];

const RIDER_PROFILES = [
  { name: "Ravi", phone: "+91 9876543210", rating: 4.8, experience: "2+ years" },
  { name: "Amit", phone: "+91 9876543220", rating: 4.9, experience: "3+ years" },
  { name: "Priya", phone: "+91 9876543230", rating: 4.7, experience: "1+ years" },
  { name: "Karan", phone: "+91 9876543240", rating: 4.6, experience: "2+ years" }
];

export default function DeliveryStatus({ 
  riderName = "Ravi", 
  riderPhone = "+91 9876543210", 
  customMessage,
  isAnimating = true 
}: DeliveryStatusProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [rider, setRider] = useState(RIDER_PROFILES[0]);

  useEffect(() => {
    if (!isAnimating) return;

    const storyInterval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % DELIVERY_STORIES.length);
    }, 3000); // Change story every 3 seconds

    // Change rider profile occasionally
    const riderInterval = setInterval(() => {
      const randomRider = RIDER_PROFILES[Math.floor(Math.random() * RIDER_PROFILES.length)];
      setRider(randomRider);
    }, 15000); // Change rider every 15 seconds

    return () => {
      clearInterval(storyInterval);
      clearInterval(riderInterval);
    };
  }, [isAnimating]);

  const handleCallRider = () => {
    window.open(`tel:${riderPhone}`);
  };

  const handleMessageRider = () => {
    window.open(`https://wa.me/${riderPhone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 opacity-50"></div>
      
      <CardContent className="relative p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <div className="animate-pulse">
              🛵
            </div>
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-2">
            Out for Delivery!
          </h3>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            On the way
          </Badge>
        </div>

        {/* Animated Story Message */}
        <div className="bg-white rounded-lg p-4 mb-6 text-center">
          <p className="text-lg font-medium text-gray-800 transition-all duration-500 ease-in-out">
            {customMessage || DELIVERY_STORIES[currentStoryIndex]}
          </p>
        </div>

        {/* Rider Information Card */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  {rider.name.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{rider.name}</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-3 h-3 text-yellow-500 mr-1" />
                  {rider.rating} • {rider.experience}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Experience</div>
              <div className="font-medium">{rider.experience}</div>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleCallRider}
              className="flex items-center justify-center"
              variant="outline"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button 
              onClick={handleMessageRider}
              className="flex items-center justify-center"
              variant="outline"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </div>

        {/* Delivery Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Estimated arrival</span>
            <span className="font-medium">15-20 mins</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Contact</span>
            <Button 
              variant="link" 
              onClick={handleCallRider}
              className="p-0 h-auto text-blue-600"
            >
              {riderPhone}
            </Button>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-3 h-3 mr-2" />
            <span>Delivery partner is heading to your location</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Delivery Progress</span>
            <span className="text-xs font-medium">80%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: '80%' }}
            ></div>
          </div>
        </div>

        {/* Animated Dots */}
        {isAnimating && (
          <div className="flex justify-center space-x-2 mt-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                style={{
                  animationDelay: `${index * 0.3}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}