'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/delivery-utils';
import { TrendingUp, Calendar, Clock, DollarSign, ShoppingBag, Users, TrendingDown, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Order {
    id: string;
    grandTotal: number;
    createdAt: string;
    status: string;
}

interface EarningsAnalyticsProps {
    orders: Order[];
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

export default function EarningsAnalytics({ orders }: EarningsAnalyticsProps) {
    // Calculate total earnings
    const totalEarnings = orders
        .filter(order => order.status === 'Delivered')
        .reduce((sum, order) => sum + order.grandTotal, 0);

    // Calculate average order value
    const deliveredOrders = orders.filter(order => order.status === 'Delivered');
    const averageOrderValue = deliveredOrders.length > 0
        ? totalEarnings / deliveredOrders.length
        : 0;

    // Calculate total orders
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => ['Pending', 'Accepted', 'Processing', 'Out for Delivery'].includes(o.status)).length;

    // Calculate conversion rate
    const conversionRate = totalOrders > 0
        ? (deliveredOrders.length / totalOrders) * 100
        : 0;

    // Get earnings by hour
    const getEarningsByHour = () => {
        const hourlyEarnings: { [key: number]: number } = {};

        orders
            .filter(order => order.status === 'Delivered')
            .forEach(order => {
                const hour = new Date(order.createdAt).getHours();
                hourlyEarnings[hour] = (hourlyEarnings[hour] || 0) + order.grandTotal;
            });

        return Object.entries(hourlyEarnings)
            .map(([hour, amount]) => ({
                hour: parseInt(hour),
                amount,
                label: `${hour}:00 - ${hour}:59`
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    };

    // Get earnings by day
    const getEarningsByDay = () => {
        const dailyEarnings: { [key: string]: number } = {};

        orders
            .filter(order => order.status === 'Delivered')
            .forEach(order => {
                const date = new Date(order.createdAt).toLocaleDateString();
                dailyEarnings[date] = (dailyEarnings[date] || 0) + order.grandTotal;
            });

        return Object.entries(dailyEarnings)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7);
    };

    // Get earnings by week
    const getEarningsByWeek = () => {
        const weeklyEarnings: { [key: string]: number } = {};

        orders
            .filter(order => order.status === 'Delivered')
            .forEach(order => {
                const date = new Date(order.createdAt);
                const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
                const weekKey = weekStart.toLocaleDateString();
                weeklyEarnings[weekKey] = (weeklyEarnings[weekKey] || 0) + order.grandTotal;
            });

        return Object.entries(weeklyEarnings)
            .map(([week, amount]) => ({ week, amount }))
            .sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime())
            .slice(0, 4);
    };

    const hourlyData = getEarningsByHour();
    const dailyData = getEarningsByDay();
    const weeklyData = getEarningsByWeek();

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(totalEarnings)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {deliveredOrders.length} delivered orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Per delivered order
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {pendingOrders} pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Order completion rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Earnings Breakdown
                    </CardTitle>
                    <CardDescription>Analyze your business performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="hour" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="hour">
                                <Clock className="w-4 h-4 mr-2" />
                                By Hour
                            </TabsTrigger>
                            <TabsTrigger value="day">
                                <Calendar className="w-4 h-4 mr-2" />
                                By Day
                            </TabsTrigger>
                            <TabsTrigger value="week">
                                <Calendar className="w-4 h-4 mr-2" />
                                By Week
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="hour" className="space-y-4 mt-4">
                            <div className="text-sm font-medium mb-4">Peak Hours Performance</div>
                            {hourlyData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={hourlyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                labelStyle={{ color: '#000' }}
                                            />
                                            <Bar dataKey="amount" fill="#f97316" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 mt-4">
                                        {hourlyData.map((item, index) => (
                                            <div key={item.hour} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                                        #{index + 1}
                                                    </div>
                                                    <span className="font-medium">{item.label}</span>
                                                </div>
                                                <span className="font-bold text-primary">{formatCurrency(item.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No data available</p>
                            )}
                        </TabsContent>

                        <TabsContent value="day" className="space-y-4 mt-4">
                            <div className="text-sm font-medium mb-4">Daily Earnings Trend (Last 7 Days)</div>
                            {dailyData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={[...dailyData].reverse()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                labelStyle={{ color: '#000' }}
                                            />
                                            <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 mt-4">
                                        {dailyData.map((item) => (
                                            <div key={item.date} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <span className="font-medium">{item.date}</span>
                                                <span className="font-bold text-primary">{formatCurrency(item.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No data available</p>
                            )}
                        </TabsContent>

                        <TabsContent value="week" className="space-y-4 mt-4">
                            <div className="text-sm font-medium mb-4">Weekly Performance (Last 4 Weeks)</div>
                            {weeklyData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={[...weeklyData].reverse()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="week" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                labelStyle={{ color: '#000' }}
                                            />
                                            <Bar dataKey="amount" fill="#f97316" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 mt-4">
                                        {weeklyData.map((item) => (
                                            <div key={item.week} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <span className="font-medium">Week of {item.week}</span>
                                                <span className="font-bold text-primary">{formatCurrency(item.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No data available</p>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Order Status Distribution
                    </CardTitle>
                    <CardDescription>Breakdown of orders by status</CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length },
                                            { name: 'Processing', value: orders.filter(o => ['Accepted', 'Processing'].includes(o.status)).length },
                                            { name: 'Out for Delivery', value: orders.filter(o => o.status === 'Out for Delivery').length },
                                            { name: 'Pending', value: orders.filter(o => o.status === 'Pending').length },
                                        ].filter(item => item.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <span className="font-medium">Delivered</span>
                                    <span className="font-bold text-green-600">{orders.filter(o => o.status === 'Delivered').length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <span className="font-medium">Processing</span>
                                    <span className="font-bold text-blue-600">{orders.filter(o => ['Accepted', 'Processing'].includes(o.status)).length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <span className="font-medium">Out for Delivery</span>
                                    <span className="font-bold text-orange-600">{orders.filter(o => o.status === 'Out for Delivery').length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <span className="font-medium">Pending</span>
                                    <span className="font-bold text-yellow-600">{orders.filter(o => o.status === 'Pending').length}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No orders available</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
