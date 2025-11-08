'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, IndianRupee, Package, LogOut, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/delivery-utils';
import AuthFlow from '@/components/firebase-auth-flow';
import { useAuth } from '@/contexts/auth-context';
import ThemeToggle from '@/components/theme-toggle';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  prepTime: number | null;
  category: string | null;
  isAvailable: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
  subtotal: number;
}

interface UserSession {
  phone: string;
  location: { lat: number; lng: number };
  timestamp: number;
}

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopSettings, setShopSettings] = useState<any>(null);
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      fetchMenuItems();
      fetchShopSettings();
      loadCartFromStorage();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchShopSettings = async () => {
    try {
      const response = await fetch('/api/shop-settings');
      if (!response.ok) {
        // Use default settings if API fails
        console.warn('Shop settings API unavailable, using defaults');
        setShopSettings({
          id: 'default',
          is_open: true,
          open_time: '08:00',
          close_time: '22:00',
          closed_message: "We're currently closed. Please check back during our opening hours.",
          custom_message: '🍽️ Welcome to Sambhar Soul! Taste the tradition of authentic South Indian cuisine.',
          delivery_message: '🚚 Your delicious food is on its way!',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        return;
      }
      const settings = await response.json();
      setShopSettings(settings);
    } catch (error) {
      console.error('Error fetching shop settings:', error);
      // Use default settings on error
      setShopSettings({
        id: 'default',
        is_open: true,
        open_time: '08:00',
        close_time: '22:00',
        closed_message: "We're currently closed. Please check back during our opening hours.",
        custom_message: '🍽️ Welcome toSambhar Soul! Fresh, authentic South Indian food.',
        delivery_message: '🚚 Your delicious food is on its way!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Failed to fetch menu');
      const items = await response.json();
      setMenuItems(items);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const handleAuthComplete = () => {
    // Auth is complete - data will be fetched by useEffect when user updates
    // Just show loading state
    setLoading(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCart([]);
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1, subtotal: cartItem.subtotal + item.price }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1, subtotal: item.price }];
    });

    // Save to localStorage
    const newCart = [...cart, { ...item, quantity: 1, subtotal: item.price }];
    localStorage.setItem('cart', JSON.stringify(newCart));

    toast({
      title: 'Added to cart',
      description: `${item.name} added to your cart`,
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
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

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalAmount = () => cart.reduce((sum, item) => sum + item.subtotal, 0);

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before proceeding',
        variant: 'destructive',
      });
      return;
    }

    // Check if shop is open
    if (shopSettings && !shopSettings.isOpen) {
      toast({
        title: 'Shop is Closed',
        description: shopSettings.closedMessage || 'We are currently closed. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    // Save cart to localStorage for checkout page
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = '/checkout';
  };

  // Show auth flow if user is not authenticated
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-muted rounded-2xl mb-4"></div>
          <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthFlow onAuthComplete={handleAuthComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Sambhar Soul"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">Sambhar Soul</h1>
                <p className="text-xs text-muted-foreground">Taste the Tradition</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>👋 Hi, {user.name || 'Guest'}!</span>
              </div>
              <ThemeToggle />
              {/* My Orders - Icon only on mobile */}
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/orders'}
                size="icon"
                className="sm:w-auto sm:px-4"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">My Orders</span>
              </Button>
              {/* Logout - Icon only on mobile */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                size="icon"
                className="sm:w-auto sm:px-4"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
              {/* Cart - Icon only on mobile */}
              <Button
                onClick={proceedToCheckout}
                className="relative"
                size="icon"
                disabled={cart.length === 0}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Cart</span>
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shop Status Banner */}
        {shopSettings && (
          <div className={`mb-6 p-4 rounded-lg ${shopSettings.isOpen
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${shopSettings.isOpen ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                <div>
                  <p className="font-semibold">
                    {shopSettings.isOpen ? '🟢 Shop is Open' : '🔴 Shop is Closed'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {shopSettings.isOpen
                      ? `We're accepting orders until ${shopSettings.closeTime}`
                      : shopSettings.closedMessage
                    }
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {shopSettings.openTime} - {shopSettings.closeTime}
              </div>
            </div>
          </div>
        )}

        {/* Custom Message */}
        {shopSettings?.customMessage && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-center text-blue-800">
              {shopSettings.customMessage}
            </p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Welcome back! 🍽️
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready for some delicious South Indian food? Your location is set for quick delivery!
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Authentic South Indian Cuisine
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fresh, delicious, and delivered hot to your doorstep. Order now for a taste of home!
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {menuItems.filter(item => item.isAvailable).map((item, index) => (
            <div
              key={item.id}
              className="group relative"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Image - PNG with no background */}
              <div className="relative z-10 -mb-16 mx-4">
                <div className="aspect-square w-full flex items-center justify-center transition-all duration-300 group-hover:-translate-y-2">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl drop-shadow-lg">🍽️</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content - Behind Image */}
              <Card className="relative pt-20 pb-6 px-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card dark:bg-black">
                <div className="space-y-3">
                  {/* Category Badge */}
                  <Badge className="bg-accent text-accent-foreground border-0">
                    {item.category}
                  </Badge>

                  {/* Title and Description - Left Aligned */}
                  <div className="space-y-2 text-left">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {/* Prep Time in text body */}
                    {item.prepTime && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.prepTime} mins
                      </div>
                    )}
                  </div>

                  {/* Price and Add Button */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-accent">
                      {formatCurrency(item.price)}
                    </span>
                    <Button
                      onClick={() => addToCart(item)}
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="w-5 h-5 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="sticky bottom-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm animate-in slide-in-from-bottom duration-500">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <span>Order Summary</span>
                </div>
                <Badge className="bg-primary text-primary-foreground">{getTotalItems()} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <span className="w-20 text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(getTotalAmount())}
                </span>
              </div>

              <Button
                onClick={proceedToCheckout}
                className="w-full mt-4"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}