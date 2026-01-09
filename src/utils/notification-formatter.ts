/**
 * Notification Formatters
 * Helper functions to format notifications for different event types
 */

import {
  NotificationPayload,
  ShipmentNotification,
  OrderNotification,
  ReturnNotification,
} from '../types/notification';

/**
 * Format shipment notification
 */
export function formatShipmentNotification(
  data: ShipmentNotification
): NotificationPayload {
  const { orderId, trackingNumber, carrier, estimatedDelivery } = data;

  let body = `Your order #${orderId} has been shipped!`;

  if (carrier && trackingNumber) {
    body += ` Track your package with ${carrier}: ${trackingNumber}`;
  } else if (trackingNumber) {
    body += ` Tracking: ${trackingNumber}`;
  }

  if (estimatedDelivery) {
    body += ` Estimated delivery: ${estimatedDelivery}`;
  }

  return {
    title: '📦 Order Shipped',
    body,
    data: {
      type: 'shipment.created',
      orderId,
      ...(trackingNumber && { trackingNumber }),
      ...(carrier && { carrier }),
    },
    clickAction: `/orders/${orderId}`,
    priority: 'high',
  };
}

/**
 * Format order notification
 */
export function formatOrderNotification(
  data: OrderNotification
): NotificationPayload {
  const { type, orderId, orderNumber } = data;

  const titles: Record<OrderNotification['type'], string> = {
    'order.placed': '✅ Order Confirmed',
    'order.delivered': '🎉 Order Delivered',
    'order.canceled': '❌ Order Canceled',
  };

  const bodies: Record<OrderNotification['type'], string> = {
    'order.placed': `Your order ${orderNumber || `#${orderId}`} has been confirmed!`,
    'order.delivered': `Your order ${orderNumber || `#${orderId}`} has been delivered!`,
    'order.canceled': `Your order ${orderNumber || `#${orderId}`} has been canceled.`,
  };

  return {
    title: titles[type],
    body: bodies[type],
    data: {
      type,
      orderId,
      ...(orderNumber && { orderNumber }),
    },
    clickAction: `/orders/${orderId}`,
    priority: type === 'order.placed' ? 'high' : 'normal',
  };
}

/**
 * Format return notification
 */
export function formatReturnNotification(
  data: ReturnNotification
): NotificationPayload {
  const { type, returnId, orderId } = data;

  const titles: Record<ReturnNotification['type'], string> = {
    'return.created': '🔄 Return Initiated',
    'return.approved': '✅ Return Approved',
    'return.rejected': '❌ Return Rejected',
  };

  const bodies: Record<ReturnNotification['type'], string> = {
    'return.created': `Your return request for order #${orderId} has been submitted.`,
    'return.approved': `Your return request for order #${orderId} has been approved!`,
    'return.rejected': `Your return request for order #${orderId} was rejected.`,
  };

  return {
    title: titles[type],
    body: bodies[type],
    data: {
      type,
      returnId,
      orderId,
    },
    clickAction: `/returns/${returnId}`,
    priority: 'normal',
  };
}
