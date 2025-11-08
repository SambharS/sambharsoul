import { NextRequest, NextResponse } from 'next/server';
import { getMenuItems, createMenuItem } from '@/lib/supabase-service';

export async function GET() {
  try {
    const menuItems = await getMenuItems();

    // Transform snake_case to camelCase for frontend
    const formattedItems = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image_url,
      prepTime: item.prep_time,
      category: item.category,
      isAvailable: item.is_available,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, prepTime, category, isAvailable } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const menuItem = await createMenuItem({
      name,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
      prep_time: prepTime ? parseInt(prepTime) : undefined,
      category,
      is_available: isAvailable !== undefined ? isAvailable : true
    });

    // Transform to camelCase for frontend
    const formattedItem = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      imageUrl: menuItem.image_url,
      prepTime: menuItem.prep_time,
      category: menuItem.category,
      isAvailable: menuItem.is_available,
      createdAt: menuItem.created_at,
      updatedAt: menuItem.updated_at
    };

    return NextResponse.json(formattedItem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating menu item:', error);

    // Check if it's an RLS policy error
    if (error.message?.includes('policy') || error.code === '42501') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}