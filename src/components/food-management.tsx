'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  IndianRupee, 
  Image as ImageIcon,
  ChefHat,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/delivery-utils';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  prepTime: number | null;
  category: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FoodFormData {
  name: string;
  description: string;
  price: string;
  prepTime: string;
  category: string;
  isAvailable: boolean;
  imageUrl: string;
}

const CATEGORIES = [
  'Dosa',
  'Idli', 
  'Rice',
  'Beverage',
  'Snacks',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert'
];

export default function FoodManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FoodFormData>({
    name: '',
    description: '',
    price: '',
    prepTime: '',
    category: '',
    isAvailable: true,
    imageUrl: ''
  });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const items = await response.json();
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch menu items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      prepTime: '',
      category: '',
      isAvailable: true,
      imageUrl: ''
    });
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      prepTime: item.prepTime?.toString() || '',
      category: item.category || '',
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl || ''
    });
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        prepTime: formData.prepTime ? parseInt(formData.prepTime) : null,
        category: formData.category,
        isAvailable: formData.isAvailable,
        imageUrl: formData.imageUrl || null
      };

      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save menu item');

      const savedItem = await response.json();
      
      if (editingItem) {
        setMenuItems(prev => prev.map(item => 
          item.id === editingItem.id ? savedItem : item
        ));
        toast({
          title: 'Food item updated',
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        setMenuItems(prev => [savedItem, ...prev]);
        toast({
          title: 'Food item added',
          description: `${formData.name} has been added to the menu`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save food item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete menu item');

      setMenuItems(prev => prev.filter(i => i.id !== item.id));
      toast({
        title: 'Food item deleted',
        description: `${item.name} has been removed from the menu`,
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete food item',
        variant: 'destructive',
      });
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          isAvailable: !item.isAvailable
        }),
      });

      if (!response.ok) throw new Error('Failed to update availability');

      const updatedItem = await response.json();
      setMenuItems(prev => prev.map(i => 
        i.id === item.id ? updatedItem : i
      ));

      toast({
        title: 'Availability updated',
        description: `${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`,
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Food Management</h2>
          <p className="text-muted-foreground">Manage your menu items, pricing, and availability</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Food Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the food item details' : 'Add a new food item to your menu'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Food Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Masala Dosa"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the food item..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="80.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    min="1"
                    value={formData.prepTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a URL for the food image. For demo purposes, you can use any image URL.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
                />
                <Label htmlFor="isAvailable">Available for order</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Add'} Food Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.id} className={`relative ${!item.isAvailable ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary">{item.category}</Badge>
                    {!item.isAvailable && (
                      <Badge variant="destructive">Unavailable</Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {item.imageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-md">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    <span className="font-bold text-lg">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                  
                  {item.prepTime && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.prepTime}m
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleAvailability(item)}
                  className="flex-1"
                >
                  {item.isAvailable ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Available
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Unavailable
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {menuItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ChefHat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No food items yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first food item to get started with your menu.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Food Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}