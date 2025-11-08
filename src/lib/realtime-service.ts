import { database } from '@/lib/firebase';
import { ref, onValue, set, off } from 'firebase/database';

export interface OrderUpdate {
  orderId: string;
  status: string;
  riderName?: string;
  riderPhone?: string;
  riderMessage?: string;
  timestamp: number;
}

export class RealtimeOrderService {
  private static instance: RealtimeOrderService;
  private listeners: Map<string, () => void> = new Map();

  static getInstance(): RealtimeOrderService {
    if (!RealtimeOrderService.instance) {
      RealtimeOrderService.instance = new RealtimeOrderService();
    }
    return RealtimeOrderService.instance;
  }

  // Subscribe to order updates for a specific user
  subscribeToOrderUpdates(userId: string, callback: (update: OrderUpdate) => void): () => void {
    const ordersRef = ref(database, `orders/${userId}`);
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Send order update to all subscribers
  sendOrderUpdate(userId: string, update: OrderUpdate): void {
    const ordersRef = ref(database, `orders/${userId}`);
    set(ordersRef, update);
  }

  // Subscribe to all order updates (for admin)
  subscribeToAllOrderUpdates(callback: (update: OrderUpdate) => void): () => void {
    const allOrdersRef = ref(database, 'all_orders');
    
    const unsubscribe = onValue(allOrdersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });

    return unsubscribe;
  }

  // Send order update to all subscribers (for admin)
  sendAllOrderUpdate(update: OrderUpdate): void {
    const allOrdersRef = ref(database, 'all_orders');
    set(allOrdersRef, update);
  }

  // Cleanup all listeners
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }
}

export const realtimeOrderService = RealtimeOrderService.getInstance();