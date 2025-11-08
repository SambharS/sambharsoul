import { NextRequest, NextResponse } from 'next/server';
import { updateMenuItem, deleteMenuItem } from '@/lib/supabase-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { name, description, price, imageUrl, prepTime, category, isAvailable } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const menuItem = await updateMenuItem(itemId, {
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

    return NextResponse.json(formattedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    // Check if item exists in any orders
    // This would need to be implemented in the service
    // For now, we'll just delete the item
    await deleteMenuItem(itemId);

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}