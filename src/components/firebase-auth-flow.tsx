'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Phone, MapPin, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface AuthFlowProps {
  onAuthComplete: () => void;
}

export default function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const { signInWithPhone, verifyOTP, user } = useAuth();
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

    try {
      await signInWithPhone(`+91${phoneNumber}`);
      setStep('otp');
      setOtpTimer(60);

      toast({
        title: 'OTP Sent!',
        description: `OTP has been sent to +91 ${phoneNumber}`,
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpCode = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter all 6 digits',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await verifyOTP(enteredOtp);

      toast({
        title: 'OTP Verified!',
        description: 'Phone number verified successfully',
      });

      // Check if user exists in database
      // Wait a bit for user context to update
      setTimeout(async () => {
        if (user?.name) {
          // Existing user with name - go to menu
          onAuthComplete();
        } else {
          // New user or user without name - ask for name
          setStep('name');
        }
      }, 500);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Invalid OTP',
        description: error.message || 'The OTP you entered is incorrect',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const saveName = async () => {
    if (!customerName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name to continue',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user?.firebaseUid,
          name: customerName.trim(),
          phone: phoneNumber
        })
      });

      if (!response.ok) {
        console.error('Failed to update profile');
      }

      toast({
        title: 'Welcome!',
        description: 'Your account has been set up successfully',
      });

      // Complete auth and go to menu
      onAuthComplete();
    } catch (error) {
      console.error('Error saving user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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

  const resendOtp = () => {
    if (otpTimer > 0) return;
    sendOtp();
  };

  // If user is already authenticated, proceed
  if (user && user.name) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>
              You're all set to continue ordering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onAuthComplete} className="w-full">
              Continue to Menu
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Sambhar Soul"
            className="w-24 h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold mb-2 text-primary">Sambhar Soul</h1>
          <p className="text-muted-foreground text-lg">Taste the Tradition</p>
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
                Let's get started with your phone number
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
                  We'll send a 6-digit OTP to verify your number
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

              <Button onClick={verifyOtpCode} className="w-full">
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

        {/* Name Collection Step */}
        {step === 'name' && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome! What's your name?</CardTitle>
              <CardDescription>
                Help us personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={saveName}
                disabled={!customerName.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Menu
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
}