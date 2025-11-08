import { supabase, supabaseAdmin } from '@/lib/supabase';

// Menu Items
export const getMenuItems = async () => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const createMenuItem = async (item: {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  prep_time?: number;
  category?: string;
  is_available?: boolean;
}) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMenuItem = async (id: string, item: Partial<{
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  prep_time?: number;
  category?: string;
  is_available?: boolean;
}>) => {
  // Use admin client to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(item)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMenuItem = async (id: string) => {
  // Use admin client to bypass RLS
  const { error } = await supabaseAdmin
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Orders
export const createOrder = async (order: {
  user_id: string;
  total_food_amount: number;
  delivery_distance_km?: number;
  delivery_charge?: number;
  grand_total: number;
  payment_mode?: string;
  delivery_address: string;
  order_notes?: string;
  customer_phone: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    subtotal: number;
  }>;
}) => {
  // Use admin client to bypass RLS for order creation
  const { data: newOrder, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: order.user_id,
      total_food_amount: order.total_food_amount,
      delivery_distance_km: order.delivery_distance_km,
      delivery_charge: order.delivery_charge,
      grand_total: order.grand_total,
      payment_mode: order.payment_mode || 'COD',
      delivery_address: order.delivery_address,
      order_notes: order.order_notes,
      customer_phone: order.customer_phone
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Insert order items using admin client
  const orderItems = order.items.map(item => ({
    ...item,
    order_id: newOrder.id
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  // Return the complete order with items
  return getOrderById(newOrder.id);
};

export const getOrders = async (userId?: string) => {
  // Use admin client to bypass RLS for fetching orders
  let query = supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(*)
      ),
      user:users(
        id,
        name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getOrdersByPhone = async (phone: string) => {
  // Normalize phone number (remove +91 prefix if present)
  const normalizedPhone = phone.replace(/^\+91/, '').replace(/^\+/, '');

  // Use admin client to bypass RLS for fetching orders by phone
  // Try to match with or without country code
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(*)
      ),
      user:users(
        id,
        name,
        email,
        phone
      )
    `)
    .or(`customer_phone.eq.${normalizedPhone},customer_phone.eq.+91${normalizedPhone},customer_phone.eq.${phone}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getOrderById = async (id: string) => {
  // Use admin client to bypass RLS for fetching order details
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(*)
      ),
      user:users(
        id,
        name,
        email,
        phone
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (id: string, status: string, riderInfo?: {
  rider_name?: string;
  rider_phone?: string;
  rider_message?: string;
}) => {
  const updateData: any = { status };

  if (status === 'Out for Delivery' && riderInfo) {
    const riders = [
      { name: 'Ravi', phone: '+91 9876543210' },
      { name: 'Amit', phone: '+91 9876543220' },
      { name: 'Priya', phone: '+91 9876543230' },
      { name: 'Karan', phone: '+91 9876543240' }
    ];

    const randomRider = riders[Math.floor(Math.random() * riders.length)];

    updateData.rider_name = riderInfo.rider_name || randomRider.name;
    updateData.rider_phone = riderInfo.rider_phone || randomRider.phone;
    updateData.rider_message = riderInfo.rider_message || `🛵 ${updateData.rider_name} is on the way with your delicious food!`;
  }

  // Use admin client to bypass RLS for order updates
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      items:order_items(
        *,
        menu_item:menu_items(*)
      ),
      user:users(
        id,
        name,
        email,
        phone
      )
    `)
    .single();

  if (error) throw error;
  return data;
};

// Shop Settings
export const getShopSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    // If no settings exist, create default ones
    if (!data) {
      return createDefaultShopSettings();
    }

    return data;
  } catch (error: any) {
    // If Supabase is not configured, return default settings
    if (error.message?.includes('Invalid API key') ||
      error.message?.includes('Failed to fetch') ||
      error.code === 'ECONNREFUSED') {
      console.warn('Supabase not configured, using default shop settings');
      return {
        id: 'default',
        is_open: true,
        open_time: '08:00',
        close_time: '22:00',
        closed_message: "We're currently closed. Please check back during our opening hours.",
        custom_message: '🍽️ Welcome toSambhar Soul! Fresh, authentic South Indian food.',
        delivery_message: '🚚 Your delicious food is on its way!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    throw error;
  }
};

export const updateShopSettings = async (settings: {
  is_open?: boolean;
  open_time?: string;
  close_time?: string;
  closed_message?: string;
  custom_message?: string;
  delivery_message?: string;
}) => {
  // Get the first (and should be only) shop settings record
  const { data: existingSettings } = await supabaseAdmin
    .from('shop_settings')
    .select('id')
    .limit(1)
    .single();

  if (!existingSettings) {
    // Create if doesn't exist
    const { data, error } = await supabaseAdmin
      .from('shop_settings')
      .insert(settings)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update existing settings using admin client
  const { data, error } = await supabaseAdmin
    .from('shop_settings')
    .update(settings)
    .eq('id', existingSettings.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const createDefaultShopSettings = async () => {
  const { data, error } = await supabase
    .from('shop_settings')
    .insert({
      is_open: true,
      open_time: "08:00",
      close_time: "22:00",
      closed_message: "We're currently closed. Please check back during our opening hours (8:00 AM - 10:00 PM).",
      custom_message: "🍽️ Welcome toSambhar Soul! Fresh, authentic South Indian food made with love.",
      delivery_message: "🚚 Your delicious food is on its way! Our delivery partner will contact you shortly."
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Users
export const updateUserProfile = async (userId: string, profile: {
  name?: string;
  phone?: string;
  location_lat?: number;
  location_lng?: number;
}) => {
  const { data, error } = await supabase
    .from('users')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};