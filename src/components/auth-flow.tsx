'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Phone, MapPin, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';

interface AuthFlowProps {
  onAuthComplete: (user: { phone: string; location: { lat: number; lng: number } }) => void;
}

export default function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'location'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const sendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    // Generate 6-digit OTP
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpValue);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setOtpTimer(60); // 60 seconds timer
      
      toast({
        title: 'OTP Sent!',
        description: `OTP has been sent to +91 ${phoneNumber}. For demo: ${otpValue}`,
      });
    }, 1000);
  };

  const verifyOtp = () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter all 6 digits',
        variant: 'destructive',
      });
      return;
    }

    if (enteredOtp === generatedOtp) {
      toast({
        title: 'OTP Verified!',
        description: 'Phone number verified successfully',
      });
      setStep('location');
    } else {
      toast({
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect',
        variant: 'destructive',
      });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const getLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: 'Location Not Supported',
        description: 'Your browser does not support location services',
        variant: 'destructive',
      });
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLocationLoading(false);
        
        toast({
          title: 'Location Detected!',
          description: 'Your location has been detected successfully',
        });
      },
      (error) => {
        console.error('Location error:', error);
        toast({
          title: 'Location Access Required',
          description: 'Please allow location access to continue. We need this for delivery.',
          variant: 'destructive',
        });
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const completeAuth = () => {
    if (!location) {
      toast({
        title: 'Location Required',
        description: 'Please provide location access to continue',
        variant: 'destructive',
      });
      return;
    }

    // Save user session
    const userSession = {
      phone: phoneNumber,
      location,
      timestamp: Date.now()
    };
    
    localStorage.setItem('userSession', JSON.stringify(userSession));
    
    onAuthComplete(userSession);
    
    toast({
      title: 'Welcome!',
      description: 'You can now browse our menu and place orders',
    });
  };

  const resendOtp = () => {
    if (otpTimer > 0) return;
    sendOtp();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">ID</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Idli Dosa Express</h1>
          <p className="text-muted-foreground">Authentic South Indian Food Delivery</p>
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Enter Your Phone Number
              </CardTitle>
              <CardDescription>
                We'll send a 6-digit OTP to verify your number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center mt-1">
                  <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
              </div>
              
              <Button 
                onClick={sendOtp} 
                disabled={loading || phoneNumber.length !== 10}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              <Alert>
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  Enter your 10-digit mobile number to receive OTP
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <Card>
            <CardHeader>
              <CardTitle>Enter OTP</CardTitle>
              <CardDescription>
                Enter the 6-digit OTP sent to +91 {phoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold"
                  />
                ))}
              </div>
              
              <Button onClick={verifyOtp} className="w-full">
                Verify OTP
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Didn't receive OTP?{' '}
                <Button 
                  variant="link" 
                  onClick={resendOtp}
                  disabled={otpTimer > 0}
                  className="p-0 h-auto"
                >
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setStep('phone')}
                className="w-full"
              >
                Change Phone Number
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Location Access Step */}
        {step === 'location' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Enable Location Access
              </CardTitle>
              <CardDescription>
                We need your location to calculate delivery charges and deliver your order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {location && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Location detected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={getLocation} 
                disabled={locationLoading}
                className="w-full"
              >
                {locationLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : location ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Location Detected
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Get My Location
                  </>
                )}
              </Button>
              
              <Button 
                onClick={completeAuth} 
                disabled={!location}
                className="w-full"
                size="lg"
              >
                Start Ordering
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Location access is required for delivery. We use this to calculate delivery charges and find the best route to you.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}