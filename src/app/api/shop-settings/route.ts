import { NextRequest, NextResponse } from 'next/server';
import { getShopSettings, updateShopSettings } from '@/lib/supabase-service';

export async function GET() {
  try {
    const settings = await getShopSettings();

    // Convert snake_case to camelCase for frontend
    const formattedSettings = {
      id: settings.id,
      isOpen: settings.is_open,
      openTime: settings.open_time,
      closeTime: settings.close_time,
      closedMessage: settings.closed_message,
      customMessage: settings.custom_message,
      deliveryMessage: settings.delivery_message,
      createdAt: settings.created_at,
      updatedAt: settings.updated_at
    };

    return NextResponse.json(formattedSettings);
  } catch (error) {
    console.error('Error fetching shop settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { isOpen, openTime, closeTime, closedMessage, customMessage, deliveryMessage } = body;

    const settings = await updateShopSettings({
      is_open: isOpen,
      open_time: openTime,
      close_time: closeTime,
      closed_message: closedMessage,
      custom_message: customMessage,
      delivery_message: deliveryMessage
    });

    // Convert snake_case to camelCase for frontend
    const formattedSettings = {
      id: settings.id,
      isOpen: settings.is_open,
      openTime: settings.open_time,
      closeTime: settings.close_time,
      closedMessage: settings.closed_message,
      customMessage: settings.custom_message,
      deliveryMessage: settings.delivery_message,
      createdAt: settings.created_at,
      updatedAt: settings.updated_at
    };

    return NextResponse.json(formattedSettings);
  } catch (error) {
    console.error('Error updating shop settings:', error);
    return NextResponse.json(
      { error: 'Failed to update shop settings' },
      { status: 500 }
    );
  }
}