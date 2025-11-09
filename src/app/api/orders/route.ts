import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getOrdersByPhone, createOrder } from '@/lib/supabase-service';
import { realtimeOrderService } from '@/lib/realtime-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const customerPhone = searchParams.get('customerPhone');

    let orders;
    if (customerPhone) {
      orders = await getOrdersByPhone(customerPhone);
    } else if (userId) {
      orders = await getOrders(userId);
    } else {
      orders = await getOrders();
    }

    // Transform snake_case to camelCase for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      userId: order.user_id,
      totalFoodAmount: order.total_food_amount,
      deliveryDistanceKm: order.delivery_distance_km,
      deliveryCharge: order.delivery_charge,
      grandTotal: order.grand_total,
      paymentMode: order.payment_mode,
      status: order.status,
      deliveryAddress: order.delivery_address,
      orderNotes: order.order_notes,
      customerPhone: order.customer_phone,
      riderName: order.rider_name,
      riderPhone: order.rider_phone,
      riderMessage: order.rider_message,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: order.items?.map(item => ({
        id: item.id,
        orderId: item.order_id,
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        subtotal: item.subtotal,
        menuItem: item.menu_item ? {
          id: item.menu_item.id,
          name: item.menu_item.name,
          description: item.menu_item.description,
          price: item.menu_item.price,
          imageUrl: item.menu_item.image_url,
          category: item.menu_item.category,
          isAvailable: item.menu_item.is_available
        } : undefined
      })) || [],
      user: order.user ? {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone
      } : undefined
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      totalFoodAmount,
      deliveryDistanceKm,
      deliveryCharge,
      grandTotal,
      paymentMode,
      deliveryAddress,
      phoneNumber,
      orderNotes,
      userLocation,
      customerPhone
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    // Get user ID from request or use phone-based guest ID
    const userId = body.userId || body.firebaseUid;
    let orderUserId = userId;

    // If Firebase UID provided, look up Supabase user ID
    if (!orderUserId && body.firebaseUid) {
      const { supabaseAdmin } = await import('@/lib/supabase');
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('firebase_uid', body.firebaseUid)
        .single();

      orderUserId = user?.id;
    }

    // Fallback to guest order with phone
    if (!orderUserId) {
      orderUserId = `guest-${customerPhone || phoneNumber}`;
    }

    const order = await createOrder({
      user_id: orderUserId,
      total_food_amount: totalFoodAmount,
      delivery_distance_km: deliveryDistanceKm,
      delivery_charge: deliveryCharge,
      grand_total: grandTotal,
      payment_mode: paymentMode || 'COD',
      delivery_address: deliveryAddress,
      order_notes: orderNotes,
      customer_phone: customerPhone || phoneNumber,
      items: items.map(item => ({
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        subtotal: item.subtotal
      }))
    });

    // Send real-time update
    realtimeOrderService.sendOrderUpdate(orderUserId, {
      orderId: order.id,
      status: 'Pending',
      timestamp: Date.now()
    });

    // Send push notification to admins about new order
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
      if (appUrl) {
        const notifUrl = appUrl.startsWith('http') ? appUrl : `https://${appUrl}`;
        await fetch(`${notifUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_order',
            orderId: order.id,
          }),
        });
      }
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Don't fail the order creation if notification fails
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}