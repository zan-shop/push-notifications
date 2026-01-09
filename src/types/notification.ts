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
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface OrderNotification {
  type: 'order.placed' | 'order.delivered' | 'order.canceled';
  orderId: string;
  orderNumber?: string;
}

export interface ReturnNotification {
  type: 'return.created' | 'return.approved' | 'return.rejected';
  returnId: string;
  orderId: string;
}
