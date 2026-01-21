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
  const { orderId, orderDisplayId, orderSetId, trackingNumber, carrier, trackingUrl, estimatedDelivery } = data;

  let body = `Your order #${orderDisplayId} has been shipped!`;

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
      orderDisplayId,
      ...(orderSetId && { orderSetId }),
      ...(trackingNumber && { trackingNumber }),
      ...(carrier && { carrier }),
      ...(trackingUrl && { trackingUrl }),
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
  const { type, orderId, orderDisplayId, orderSetId } = data;

  const titles: Record<OrderNotification['type'], string> = {
    'order.placed': '✅ Order Confirmed',
    'order.delivered': '🎉 Order Delivered',
    'order.canceled': '❌ Order Canceled',
  };

  const bodies: Record<OrderNotification['type'], string> = {
    'order.placed': `Your order #${orderDisplayId} has been confirmed!`,
    'order.delivered': `Your order #${orderDisplayId} has been delivered!`,
    'order.canceled': `Your order #${orderDisplayId} has been canceled.`,
  };

  return {
    title: titles[type],
    body: bodies[type],
    data: {
      type,
      orderId,
      orderDisplayId,
      ...(orderSetId && { orderSetId }),
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
  const { type, returnId, orderId, orderDisplayId, orderSetId } = data;

  const titles: Record<ReturnNotification['type'], string> = {
    'return.created': '🔄 Return Initiated',
    'return.approved': '✅ Return Approved',
    'return.rejected': '❌ Return Rejected',
  };

  const bodies: Record<ReturnNotification['type'], string> = {
    'return.created': `Your return request for order #${orderDisplayId} has been submitted.`,
    'return.approved': `Your return request for order #${orderDisplayId} has been approved!`,
    'return.rejected': `Your return request for order #${orderDisplayId} was rejected.`,
  };

  return {
    title: titles[type],
    body: bodies[type],
    data: {
      type,
      returnId,
      orderId,
      orderDisplayId,
      ...(orderSetId && { orderSetId }),
    },
    clickAction: `/returns/${returnId}`,
    priority: 'normal',
  };
}
