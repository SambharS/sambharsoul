'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  MapPin,
  Phone,
  IndianRupee,
  Package,
  CheckCircle,
  Truck,
  ChefHat,
  AlertCircle,
  RefreshCw,
  Utensils,
  Store
} from 'lucide-react';
import { formatCurrency, getOrderStatusColor, getOrderStatusProgress } from '@/lib/delivery-utils';
import FoodManagement from '@/components/food-management';
import ShopSettingsManager from '@/components/shop-settings-manager';
import EarningsAnalytics from '@/components/earnings-analytics';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/theme-toggle';
import { NotificationSettings } from '@/components/notification-settings';
import { NotificationPrompt } from '@/components/notification-prompt';
import { useAdminAuth } from '@/contexts/admin-auth-context';

interface OrderItem {
  id: string;
  quantity: number;
  subtotal: number;
  menuItem?: {
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
  deliveryAddress?: string;
  orderNotes?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
}

const ORDER_STATUSES = [
  { value: 'Pending', label: 'Pending', icon: AlertCircle },
  { value: 'Accepted', label: 'Accepted', icon: CheckCircle },
  { value: 'Processing', label: 'Processing', icon: ChefHat },
  { value: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { value: 'Delivered', label: 'Delivered', icon: Package }
];

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user: admin } = useAdminAuth();

  useEffect(() => {
    fetchOrders();
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const ordersData = await response.json();
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: 'Status updated',
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    return statusConfig ? statusConfig.icon : AlertCircle;
  };

  const getFilteredOrders = () => {
    if (!searchQuery) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter(order =>
      order.user?.name?.toLowerCase().includes(query) ||
      order.user?.phone?.includes(query) ||
      order.customerPhone?.includes(query)
    );
  };

  const getOrdersByStatus = () => {
    const filtered = getFilteredOrders();
    return ORDER_STATUSES.map(status => ({
      ...status,
      orders: filtered.filter(order => order.status === status.value)
    }));
  };

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'Delivered')
      .reduce((sum, order) => sum + order.grandTotal, 0);
  };

  const getPendingOrdersCount = () => {
    return orders.filter(order =>
      ['Pending', 'Accepted', 'Processing', 'Out for Delivery'].includes(order.status)
    ).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Prompt */}
        {admin && (
          <div className="mb-6">
            <NotificationPrompt
              userId={admin.id}
              role="admin"
              onEnable={() => toast({
                title: 'Notifications enabled',
                description: 'You will now receive alerts for new orders',
              })}
            />
          </div>
        )}

        {/* Header with Logo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <img
              src="/logo.png"
              alt="Sambhar Soul"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">Sambhar Soul</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <ThemeToggle />
            <Button variant="outline" onClick={fetchOrders} className="flex-1 sm:flex-none">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        {/* Stats Cards - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-0 pb-2 sm:pb-2">
              <Package className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground mb-2 sm:mb-0" />
              <CardTitle className="text-xs font-medium hidden sm:block">Total Orders</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground sm:hidden">Total</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-0 pb-2 sm:pb-2">
              <Clock className="h-5 w-5 sm:h-4 sm:w-4 text-orange-600 mb-2 sm:mb-0" />
              <CardTitle className="text-xs font-medium hidden sm:block">Pending</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-2xl font-bold text-orange-600">{getPendingOrdersCount()}</div>
              <p className="text-xs text-muted-foreground sm:hidden">Pending</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-0 pb-2 sm:pb-2">
              <CheckCircle className="h-5 w-5 sm:h-4 sm:w-4 text-green-600 mb-2 sm:mb-0" />
              <CardTitle className="text-xs font-medium hidden sm:block">Delivered</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-2xl font-bold text-green-600">
                {orders.filter(order => order.status === 'Delivered').length}
              </div>
              <p className="text-xs text-muted-foreground sm:hidden">Delivered</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-0 pb-2 sm:pb-2">
              <IndianRupee className="h-5 w-5 sm:h-4 sm:w-4 text-green-600 mb-2 sm:mb-0" />
              <CardTitle className="text-xs font-medium hidden sm:block">Revenue</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                {formatCurrency(getTotalRevenue())}
              </div>
              <p className="text-xs text-muted-foreground sm:hidden">Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center">
              <IndianRupee className="w-4 h-4 mr-2" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="food" className="flex items-center">
              <Utensils className="w-4 h-4 mr-2" />
              Food Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Store className="w-4 h-4 mr-2" />
              Shop Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-8">
            {/* Search Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search by customer name or phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  {searchQuery && (
                    <Button variant="ghost" onClick={() => setSearchQuery('')}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Orders by Status */}
            {getOrdersByStatus().map(({ value, label, icon: Icon, orders: statusOrders }) => (
              statusOrders.length > 0 && (
                <Card key={value}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon className="w-5 h-5 mr-2" />
                      {label} ({statusOrders.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {statusOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onUpdateStatus={updateOrderStatus}
                          isUpdating={updatingOrderId === order.id}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            ))}

            {orders.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground">
                    Orders will appear here when customers place them.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <EarningsAnalytics orders={orders} />
          </TabsContent>

          <TabsContent value="food" className="space-y-6">
            <FoodManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Notification Settings */}
            {admin && (
              <NotificationSettings userId={admin.id} role="admin" />
            )}

            <ShopSettingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
  isUpdating: boolean;
}

function OrderCard({ order, onUpdateStatus, isUpdating }: OrderCardProps) {
  const StatusIcon = getStatusIcon(order.status);

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
            <CardDescription>
              {new Date(order.createdAt).toLocaleString()}
            </CardDescription>
          </div>
          <Badge className={getOrderStatusColor(order.status)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {order.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="font-medium mr-2">Customer:</span>
            {order.user?.name || order.user?.email || 'Guest'}
          </div>
          {order.user?.phone && (
            <div className="flex items-center text-sm">
              <Phone className="w-3 h-3 mr-2" />
              {order.user.phone}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Order Items:</div>
          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.menuItem?.name || 'Unknown Item'}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Delivery Address with Location Link */}
        {order.deliveryAddress && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Delivery Address:</div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">{order.deliveryAddress}</div>
            {order.deliveryAddress?.includes('Location:') && (
              <Button
                variant="default"
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // Extract coordinates from address
                  const match = order.deliveryAddress?.match(/Location:\s*([\d.]+),\s*([\d.]+)/);
                  if (match) {
                    const [, lat, lng] = match;
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                  }
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            )}
          </div>
        )}

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
            <span>Total:</span>
            <span>{formatCurrency(order.grandTotal)}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">Payment:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              💵 {order.paymentMode || 'COD'}
            </Badge>
          </div>
        </div>

        {/* Status Update */}
        <div className="flex items-center space-x-2">
          <Select
            value={order.status}
            onValueChange={(value) => onUpdateStatus(order.id, value)}
            disabled={isUpdating}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isUpdating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusIcon(status: string) {
  const statusConfig = ORDER_STATUSES.find(s => s.value === status);
  return statusConfig ? statusConfig.icon : AlertCircle;
}