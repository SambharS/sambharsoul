'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  IndianRupee,
  Package,
  CheckCircle,
  Truck,
  ChefHat,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, getOrderStatusColor, getOrderStatusProgress } from '@/lib/delivery-utils';
import DeliveryStatus from '@/components/delivery-status';
import { useAuth } from '@/contexts/auth-context';
import { NotificationPrompt } from '@/components/notification-prompt';

interface OrderItem {
  id: string;
  quantity: number;
  subtotal: number;
  menuItem: {
    id: string;
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  userId: string;
  totalFoodAmount: number;
  deliveryDistanceKm: number | null;
  deliveryCharge: number | null;
  grandTotal: number;
  paymentMode: string;
  status: string;
  riderName?: string;
  riderPhone?: string;
  riderMessage?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
}

const ORDER_STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: AlertCircle },
  { key: 'Accepted', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'Processing', label: 'Preparing Food', icon: ChefHat },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Package }
];

const getEstimatedDeliveryTime = (order: Order) => {
  const stepIndex = ORDER_STEPS.findIndex(step => step.key === order.status);
  const remainingSteps = ORDER_STEPS.length - stepIndex - 1;
  const baseTime = 30; // Base delivery time in minutes
  const additionalTime = remainingSteps * 10; // 10 minutes per remaining step
  return baseTime + additionalTime;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Check authentication using Firebase auth context
    if (!authLoading && !user) {
      window.location.href = '/';
      return;
    }

    if (user) {
      fetchOrders();
      // Set up polling for real-time updates
      const interval = setInterval(fetchOrders, 15000); // Poll every 15 seconds
      return () => clearInterval(interval);
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      // Try to fetch by user ID first, fallback to phone number
      let url = '';
      if (user.id) {
        url = `/api/orders?userId=${user.id}`;
      } else if (user.phone) {
        const phoneWithoutPrefix = user.phone.replace('+91', '').replace('+', '');
        url = `/api/orders?customerPhone=${phoneWithoutPrefix}`;
      } else {
        throw new Error('No user ID or phone number available');
      }

      console.log('Fetching orders from:', url);
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Failed to fetch orders:', response.status, response.statusText);
        throw new Error('Failed to fetch orders');
      }

      const ordersData = await response.json();
      console.log('Fetched orders:', ordersData.length, 'orders');
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <img
                  src="/logo.png"
                  alt="Sambhar Soul"
                  className="w-8 h-8 object-contain"
                />
                <h1 className="text-xl font-bold">My Orders</h1>
              </div>
            </div>
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Prompt */}
        {user && (
          <div className="mb-6">
            <NotificationPrompt
              userId={user.id}
              role="user"
              onEnable={() => toast({
                title: 'Notifications enabled',
                description: 'You will receive updates about your orders',
              })}
            />
          </div>
        )}

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any orders yet. Start by ordering some delicious food!
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Order Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={() => setSelectedOrder(order)}
                isSelected={selectedOrder?.id === order.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onSelect: () => void;
  isSelected: boolean;
}

function OrderCard({ order, onSelect, isSelected }: OrderCardProps) {
  const currentStepIndex = ORDER_STEPS.findIndex(step => step.key === order.status);
  const progress = getOrderStatusProgress(order.status);
  const estimatedTime = getEstimatedDeliveryTime(order);

  return (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader onClick={onSelect}>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
            <CardDescription>
              {new Date(order.createdAt).toLocaleString()}
            </CardDescription>
          </div>
          <Badge className={getOrderStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Order Progress</span>
            <span className="text-muted-foreground">
              {order.status === 'Delivered' ? 'Completed' : `~${estimatedTime} mins`}
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex justify-between">
            {ORDER_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center space-y-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-center hidden sm:block">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {isSelected && (
          <>
            {/* Show Delivery Status if Out for Delivery */}
            {order.status === 'Out for Delivery' && (
              <div className="mb-4">
                <DeliveryStatus
                  riderName={order.riderName}
                  riderPhone={order.riderPhone}
                  customMessage={order.riderMessage}
                  isAnimating={true}
                />
              </div>
            )}

            <Separator />

            {/* Order Items */}
            <div className="space-y-2">
              <div className="font-medium">Order Items:</div>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Order Total */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Food Total:</span>
                <span>{formatCurrency(order.totalFoodAmount)}</span>
              </div>
              {order.deliveryCharge && (
                <div className="flex justify-between text-sm">
                  <span>Delivery:</span>
                  <span>{formatCurrency(order.deliveryCharge)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total Paid:</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Payment Mode:</span>
                <span>{order.paymentMode}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}