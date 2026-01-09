# @zan-shop/push-notifications

Push notification module for Medusa.js using Firebase Cloud Messaging (FCM). Provides type-safe utilities for sending mobile push notifications with built-in formatters for common e-commerce events.

## Features

- 🔥 Firebase Cloud Messaging integration
- 📱 iOS & Android support
- 📦 Pre-built formatters (orders, shipments, returns, payouts)
- 🔄 Batch sending (up to 500 devices)
- ✅ Full TypeScript support
- 🧪 Dry-run mode for testing

## Installation

```bash
npm install @zan-shop/push-notifications
```

**Prerequisites:**
- Firebase project with Cloud Messaging enabled
- Firebase Admin SDK already initialized in your project
- Node.js >= 18.0.0

## Quick Start

### 1. Create FCM Service

```typescript
import { FCMService } from '@zan-shop/push-notifications';

const fcmService = new FCMService({
  firebaseApp,
  dryRun: false, // Set to true for testing
});
```

### 2. Send Notifications

```typescript
import { formatShipmentNotification } from '@zan-shop/push-notifications';

const notification = formatShipmentNotification({
  type: 'shipment.created',
  orderId: 'order_123',
  trackingNumber: 'TRACK123',
  carrier: 'FedEx',
  estimatedDelivery: '2024-01-15',
});

const result = await fcmService.sendToDevice(deviceToken, notification);

if (result.success) {
  console.log('Notification sent:', result.messageId);
} else {
  console.error('Failed to send:', result.error);
}
```

## Event Formatters

Pre-built formatters for common e-commerce events:

### Shipment Notifications

```typescript
import { formatShipmentNotification } from '@zan-shop/push-notifications';

const notification = formatShipmentNotification({
  type: 'shipment.created',
  orderId: 'order_123',
  trackingNumber: 'TRACK123',
  carrier: 'FedEx',
});
// Output: "📦 Order Shipped - Your order #order_123 has been shipped! Track your package..."
```

### Order Notifications

```typescript
import { formatOrderNotification } from '@zan-shop/push-notifications';

const notification = formatOrderNotification({
  type: 'order.placed',
  orderId: 'order_123',
  orderNumber: 'ORD-2024-001',
});
// Output: "✅ Order Confirmed - Your order ORD-2024-001 has been confirmed!"
```

### Return Notifications

```typescript
import { formatReturnNotification } from '@zan-shop/push-notifications';

const notification = formatReturnNotification({
  type: 'return.approved',
  returnId: 'return_123',
  orderId: 'order_123',
});
// Output: "✅ Return Approved - Your return request for order #order_123 has been approved!"
```

### Custom Notifications

```typescript
import type { NotificationPayload } from '@zan-shop/push-notifications';

const customNotification: NotificationPayload = {
  title: '🎉 Special Offer',
  body: 'Get 20% off your next purchase!',
  data: {
    type: 'promotion',
    promoCode: 'SAVE20',
  },
  imageUrl: 'https://example.com/promo-banner.jpg',
  clickAction: '/promotions/save20',
  priority: 'high',
  sound: 'default',
  badge: 1,
};

await fcmService.sendToDevice(deviceToken, customNotification);
```

## Batch Sending

```typescript
const tokens = ['token1', 'token2', 'token3'];
const result = await fcmService.sendToMultipleDevices(tokens, notification);

console.log(`Success: ${result.successCount}, Failed: ${result.failureCount}`);
```

## Medusa Integration

Example subscriber for shipment notifications:

```typescript
import type { SubscriberArgs } from '@medusajs/framework';
import { FCMService, formatShipmentNotification } from '@zan-shop/push-notifications';

export default async function handleShipmentCreated({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const fcmService = container.resolve<FCMService>('fcmService');
  const deviceService = container.resolve('deviceService');
  
  const shipment = await fetchShipmentDetails(event.data.id);
  
  // Get customer's devices
  const devices = await deviceService.getCustomerDevices(shipment.order.customer_id);
  
  if (devices.length === 0) return;
  
  // Format notification
  const notification = formatShipmentNotification({
    type: 'shipment.created',
    orderId: shipment.order.id,
    trackingNumber: shipment.tracking_number,
    carrier: shipment.carrier,
  });
  
  // Send to all customer devices
  const tokens = devices.map(d => d.token);
  const result = await fcmService.sendToMultipleDevices(tokens, notification);
  
  console.log(`Sent: ${result.successCount} succeeded, ${result.failureCount} failed`);
}
```

## API Reference

### FCMService

- `sendToDevice(token, payload)` - Send to single device
- `sendToMultipleDevices(tokens, payload)` - Batch send (auto-splits into batches of 500)
- `sendToCustomer(customerId, payload)` - Send to all customer devices
- `sendToTopic(topic, payload)` - Broadcast to topic subscribers
- `validateToken(token)` - Check if token is valid

### Formatters

- `formatShipmentNotification(data)` - Shipment events
- `formatOrderNotification(data)` - Order events
- `formatReturnNotification(data)` - Return events
- `formatPayoutNotification(data)` - Payout events

### Types

```typescript
import type {
  NotificationPayload,
  SendResult,
  BatchResult,
  DeviceToken,
  DeviceRegistration,
} from '@zan-shop/push-notifications';
```

## Device Management

The package provides an abstract `DeviceService` class. Extend it with your database implementation:

```typescript
import { DeviceService } from '@zan-shop/push-notifications';

class MyDeviceService extends DeviceService {
  async registerDevice(customerId, deviceData) { /* ... */ }
  async getCustomerDevices(customerId) { /* ... */ }
  async deactivateDevice(token) { /* ... */ }
  // ... other methods
}
```

## Testing

Enable dry-run mode for testing without sending actual notifications:

```typescript
const fcmService = new FCMService({ firebaseApp, dryRun: true });
```

## Versioning

This package uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning. Use conventional commits:

```
# For features (bumps minor version 1.0.0 -> 1.1.0)
git commit -m "feat: add notification scheduling"

# For fixes (bumps patch version 1.0.0 -> 1.0.1)
git commit -m "fix: handle expired tokens correctly"

# For breaking changes (bumps major version 1.0.0 -> 2.0.0)
git commit -m "feat!: change FCM service API

BREAKING CHANGE: sendToDevice now requires configuration object"

# No version bump
git commit -m "chore: update dependencies"
git commit -m "docs: update README"
```

## License

MIT

## Links

- [GitHub Repository](https://github.com/zan-shop/push-notifications)
- [Issues](https://github.com/zan-shop/push-notifications/issues)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Medusa.js Docs](https://docs.medusajs.com)
