/**
 * Notification Types
 * Type definitions for push notification payloads and results
 */

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>; // Custom data (must be string key-value pairs for FCM)
  imageUrl?: string;
  sound?: string;
  badge?: number;
  clickAction?: string; // Deep link or action
  priority?: NotificationPriority;
}

export type NotificationPriority = 'high' | 'normal';

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: NotificationError;
}

export interface BatchResult {
  successCount: number;
  failureCount: number;
  results: SendResult[];
}

export interface NotificationError {
  code: string;
  message: string;
  token?: string;
}

// Event-specific notification payloads
export interface ShipmentNotification {
  type: 'shipment.created';
  orderId: string; // Internal order ID (order.id)
  orderDisplayId: string; // Customer-facing order number (order.display_id)
  orderSetId?: string; // Parent order set ID for grouped orders
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export interface OrderNotification {
  type: 'order.placed' | 'order.delivered' | 'order.canceled';
  orderId: string; // Internal order ID (order.id)
  orderDisplayId: string; // Customer-facing order number (order.display_id)
  orderSetId?: string; // Parent order set ID for grouped orders
}

export interface ReturnNotification {
  type: 'return.created' | 'return.approved' | 'return.rejected';
  returnId: string;
  orderId: string; // Internal order ID (order.id)
  orderDisplayId: string; // Customer-facing order number (order.display_id)
  orderSetId?: string; // Parent order set ID for grouped orders
}
