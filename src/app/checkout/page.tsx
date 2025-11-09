'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, CheckCircle, User, Plus, Minus } from 'lucide-react';
import { formatCurrency, getDistanceKm, calcDeliveryCharge } from '@/lib/delivery-utils';
import { useAuth } from '@/contexts/auth-context';
import { RESTAURANT_LOCATION } from '@/config/restaurant';

interface CartItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const AVAILABLE_ADDONS: Omit<AddOn, 'quantity'>[] = [
  {
    id: 'nariyal-chutney',
    name: 'Nariyal Chutney',
    price: 10,
    image: '/nc.png'
  },
  {
    id: 'sambhar',
    name: 'Sambhar',
    price: 10,
    image: '/sambhar.png'
  }
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>(
    AVAILABLE_ADDONS.map(addon => ({ ...addon, quantity: 0 }))
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Check authentication using Firebase auth context
    if (!authLoading && !user) {
      window.location.href = '/';
      return;
    }

    if (user) {
      setPhoneNumber(user.phone || '');

      // Load cart from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      // Calculate delivery distance if user has location (hidden from user)
      if (user.locationLat && user.locationLng) {
        const distance = getDistanceKm(
          RESTAURANT_LOCATION.lat,
          RESTAURANT_LOCATION.lng,
          user.locationLat,
          user.locationLng
        );
        setDeliveryDistance(distance);
        // Store location but don't show coordinates to user
        setCurrentLocation({ lat: user.locationLat, lng: user.locationLng });
      }
    }
  }, [user, authLoading]);

  const updateCartQuantity = (itemId: string, change: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return null;
          return { ...item, quantity: newQuantity, subtotal: newQuantity * item.price };
        }
        return item;
      }).filter(Boolean) as CartItem[];

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const getTotalFoodAmount = () => cart.reduce((sum, item) => sum + item.subtotal, 0);

  const getAddOnsTotal = () => addOns.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);

  const getDeliveryCharge = () => {
    if (deliveryDistance === null) return 0;
    return calcDeliveryCharge(deliveryDistance);
  };

  const getGrandTotal = () => getTotalFoodAmount() + getAddOnsTotal() + getDeliveryCharge();

  const updateAddOnQuantity = (id: string, change: number) => {
    setAddOns(prev => prev.map(addon => {
      if (addon.id === id) {
        const newQuantity = Math.max(0, addon.quantity + change);
        return { ...addon, quantity: newQuantity };
      }
      return addon;
    }));
  };

  const getCurrentLocation = () => {
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
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Calculate distance (hidden from user)
        const distance = getDistanceKm(
          RESTAURANT_LOCATION.lat,
          RESTAURANT_LOCATION.lng,
          latitude,
          longitude
        );
        setDeliveryDistance(distance);

        // Don't show coordinates to user, just confirm location detected
        setLocationLoading(false);

        toast({
          title: 'Location Detected!',
          description: 'Your location has been captured for delivery',
        });
      },
      (error) => {
        console.error('Location error:', error);
        toast({
          title: 'Location Access Required',
          description: 'Please allow location access to use this feature',
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

  const placeOrder = async () => {
    if (!deliveryAddress || !phoneNumber) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Only include actual menu items (not add-ons which don't have valid UUIDs)
      const allItems = cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));

      // Prepare delivery address with coordinates for admin (hidden from user)
      const location = currentLocation || (user && user.locationLat && user.locationLng ? {
        lat: user.locationLat,
        lng: user.locationLng
      } : null);

      const addressWithLocation = location
        ? `${deliveryAddress}\n\n📍 Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
        : deliveryAddress;

      const orderData = {
        userId: user?.id,
        firebaseUid: user?.firebaseUid,
        items: allItems,
        totalFoodAmount: getTotalFoodAmount() + getAddOnsTotal(),
        deliveryDistanceKm: deliveryDistance || 0,
        deliveryCharge: getDeliveryCharge(),
        grandTotal: getGrandTotal(),
        paymentMode: 'COD',
        deliveryAddress: addressWithLocation,
        phoneNumber,
        orderNotes: orderNotes + (addOns.some(a => a.quantity > 0) ? '\n\nAdd-ons: ' + addOns.filter(a => a.quantity > 0).map(a => `${a.name} x${a.quantity}`).join(', ') : ''),
        userLocation: location,
        customerPhone: user?.phone
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const order = await response.json();

      // Clear cart
      localStorage.removeItem('cart');
      setCart([]);
      setOrderPlaced(true);

      toast({
        title: 'Order placed successfully!',
        description: `Order #${order.id} has been placed`,
      });

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order failed',
        description: 'Failed to place your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <CardDescription>
              Your order has been placed successfully and will be delivered soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📱 Order will be delivered to: +91 {phoneNumber}</p>
              <p>💳 Payment Mode: Cash on Delivery</p>
              <p>🚚 Estimated Delivery: 30-45 minutes</p>
            </div>
            <div className="space-y-2 mt-4">
              <Button onClick={() => window.location.href = '/orders'} className="w-full">
                Track Order
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
            <CardDescription>
              Add some delicious items to your cart before checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Checkout</h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user?.name || user?.phone}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    disabled
                    className="mt-1 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Phone number verified during login
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Add-ons Section - Badge Style */}
            <Card>
              <CardHeader>
                <CardTitle>Add-ons</CardTitle>
                <CardDescription>
                  Enhance your meal with these delicious extras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {addOns.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={addon.image}
                            alt={addon.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-food.png';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{addon.name}</p>
                          <p className="text-sm text-primary font-semibold">
                            {formatCurrency(addon.price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateAddOnQuantity(addon.id, -1)}
                          disabled={addon.quantity === 0}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center font-medium text-sm">
                          {addon.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateAddOnQuantity(addon.id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLocation && (
                  <Alert>
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      📍 Location detected for delivery
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="text-xs"
                    >
                      {locationLoading ? (
                        <>
                          <MapPin className="w-3 h-3 mr-1 animate-pulse" />
                          Getting...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3 mr-1" />
                          Use Current Location
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="address"
                    placeholder="H.No/Flat No, Floor, Building Name, Street, Landmark, Area"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    📍 Click "Use Current Location" to enable accurate delivery, then add your complete address.
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for your order"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-bold">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <span className="font-medium w-20 text-right">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Food Total</span>
                    <span>{formatCurrency(getTotalFoodAmount())}</span>
                  </div>

                  {getAddOnsTotal() > 0 && (
                    <div className="flex justify-between">
                      <span>Add-ons</span>
                      <span>{formatCurrency(getAddOnsTotal())}</span>
                    </div>
                  )}

                  {deliveryDistance !== null && (
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span>{formatCurrency(getDeliveryCharge())}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total</span>
                    <span className="text-primary">
                      {formatCurrency(getGrandTotal())}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center">
                    Cash on Delivery
                  </Badge>
                  <p className="text-xs text-muted-foreground text-center">
                    Pay when you receive your order
                  </p>
                </div>

                <Button
                  onClick={placeOrder}
                  disabled={loading || !deliveryAddress || !phoneNumber}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  🚚 Estimated delivery: 30-45 minutes
                </p>

                <p className="text-xs text-muted-foreground text-center">
                  📍 Delivering to your detected location
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}