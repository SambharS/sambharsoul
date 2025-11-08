'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  Store,
  MessageSquare,
  Truck,
  Save,
  Power,
  PowerOff
} from 'lucide-react';

interface ShopSettings {
  id: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  closedMessage: string;
  customMessage: string | null;
  deliveryMessage: string | null;
  updatedAt: string;
  createdAt: string;
}

export default function ShopSettingsManager() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/shop-settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch shop settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/shop-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      const updatedSettings = await response.json();
      setSettings(updatedSettings);

      toast({
        title: 'Settings saved',
        description: 'Shop settings have been updated successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shop settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleShopStatus = () => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, isOpen: !prev.isOpen } : null);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No settings found</h3>
          <p className="text-muted-foreground">
            Please create shop settings to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shop Settings</h2>
          <p className="text-muted-foreground">Manage your shop hours, status, and messages</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={settings.isOpen ? "destructive" : "default"}
            onClick={toggleShopStatus}
            className="flex items-center"
          >
            {settings.isOpen ? (
              <>
                <PowerOff className="w-4 h-4 mr-2" />
                Close Shop
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-2" />
                Open Shop
              </>
            )}
          </Button>

          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Shop Status Card */}
      <Card className={settings.isOpen ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="w-5 h-5 mr-2" />
            Shop Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${settings.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold">
                  {settings.isOpen ? 'Shop is Open' : 'Shop is Closed'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {settings.isOpen ? 'Currently accepting orders' : 'Not accepting orders at the moment'}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {settings.openTime} - {settings.closeTime}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Daily operating hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Operating Hours
            </CardTitle>
            <CardDescription>
              Set your daily opening and closing times
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openTime">Opening Time</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={settings.openTime || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, openTime: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={settings.closeTime || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, closeTime: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Current Schedule:</p>
              <p className="text-sm text-muted-foreground">
                Daily: {settings.openTime} - {settings.closeTime}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shop Status Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Power className="w-5 h-5 mr-2" />
              Shop Status Control
            </CardTitle>
            <CardDescription>
              Enable or disable order acceptance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shopStatus">Accepting Orders</Label>
                <p className="text-sm text-muted-foreground">
                  {settings.isOpen ? 'Customers can place orders' : 'Orders are temporarily disabled'}
                </p>
              </div>
              <Switch
                id="shopStatus"
                checked={settings.isOpen ?? false}
                onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, isOpen: checked } : null)}
              />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Status Impact:</p>
              <p className="text-sm text-muted-foreground">
                {settings.isOpen
                  ? '✅ Menu is accessible and orders are being accepted'
                  : '❌ Menu is hidden and new orders are blocked'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Closed Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Closed Shop Message
            </CardTitle>
            <CardDescription>
              Message shown when shop is closed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={settings.closedMessage}
              onChange={(e) => setSettings(prev => prev ? { ...prev, closedMessage: e.target.value } : null)}
              placeholder="Enter message for when shop is closed..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This message appears on the website when orders are disabled
            </p>
          </CardContent>
        </Card>

        {/* Custom Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Welcome Message
            </CardTitle>
            <CardDescription>
              Custom message for your customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={settings.customMessage || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, customMessage: e.target.value } : null)}
              placeholder="Enter a welcome message for your customers..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Shown to customers on the main page
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Default Delivery Message
          </CardTitle>
          <CardDescription>
            Default message for delivery notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={settings.deliveryMessage || ''}
            onChange={(e) => setSettings(prev => prev ? { ...prev, deliveryMessage: e.target.value } : null)}
            placeholder="Enter default delivery message..."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Used as the default message when orders are out for delivery
          </p>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Last updated: {new Date(settings.updatedAt).toLocaleString()}</span>
            <span>Created: {new Date(settings.createdAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}