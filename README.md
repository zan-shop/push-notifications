# @zan-shop/push-notifications

Reusable push notification module for Medusa.js using Firebase Cloud Messaging (FCM). This package provides type-safe utilities for sending mobile push notifications with built-in support for common e-commerce events.

## Features

- ✅ **Firebase Cloud Messaging** integration
- ✅ **Type-safe** TypeScript definitions
- ✅ **Event formatters** for common e-commerce scenarios
- ✅ **Batch sending** support (up to 500 devices per batch)
- ✅ **Topic subscriptions** for broadcast notifications
- ✅ **Token validation** utilities
- ✅ **Platform-specific** handling (iOS & Android)
- ✅ **Dry-run mode** for testing
- ✅ **Abstract device service** for flexible database integration

## Installation

```bash
npm install @zan-shop/push-notifications firebase-admin
```

## Prerequisites

- Firebase project with Cloud Messaging enabled
- Firebase Admin SDK credentials (service account JSON or Workload Identity)
- Node.js >= 18.0.0

## Usage

### 1. Initialize Firebase

```typescript
import * as admin from 'firebase-admin';

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
```

### 2. Create FCM Service

```typescript
import { FCMService } from '@zan-shop/push-notifications';

const fcmService = new FCMService({
  firebaseApp,
  dryRun: false, // Set to true for testing
});
```

### 3. Send Notifications

#### Send to Single Device

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

#### Send to Multiple Devices

```typescript
const tokens = ['token1', 'token2', 'token3'];

const batchResult = await fcmService.sendToMultipleDevices(tokens, notification);

console.log(`Success: ${batchResult.successCount}, Failed: ${batchResult.failureCount}`);

// Handle failures
batchResult.results.forEach((result, index) => {
  if (!result.success) {
    console.error(`Failed to send to ${tokens[index]}:`, result.error);
  }
});
```

#### Send to Topic (Broadcast)

```typescript
const result = await fcmService.sendToTopic('all-customers', notification);
```

### 4. Format Notifications

The package includes pre-built formatters for common events:

#### Shipment Notification

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

#### Order Notification

```typescript
import { formatOrderNotification } from '@zan-shop/push-notifications';

const notification = formatOrderNotification({
  type: 'order.placed',
  orderId: 'order_123',
  orderNumber: 'ORD-2024-001',
});
// Output: "✅ Order Confirmed - Your order ORD-2024-001 has been confirmed!"
```

#### Return Notification

```typescript
import { formatReturnNotification } from '@zan-shop/push-notifications';

const notification = formatReturnNotification({
  type: 'return.approved',
  returnId: 'return_123',
  orderId: 'order_123',
});
// Output: "✅ Return Approved - Your return request for order #order_123 has been approved!"
```

### 5. Custom Notifications

Create custom notification payloads:

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

## Device Management

The package provides an abstract `DeviceService` class that you should implement with your database layer:

```typescript
import { DeviceService, DeviceToken, DeviceRegistration } from '@zan-shop/push-notifications';

class MyDeviceService extends DeviceService {
  async registerDevice(customerId: string, deviceData: DeviceRegistration): Promise<DeviceToken> {
    // Implement with your database (e.g., Medusa's data layer, TypeORM, etc.)
    // Handle deduplication: update if token exists, otherwise create new
  }

  async getCustomerDevices(customerId: string): Promise<DeviceToken[]> {
    // Fetch all active devices for a customer
  }

  async deactivateDevice(token: string): Promise<void> {
    // Mark device as inactive (soft delete)
  }

  // ... implement other methods
}
```

## Validation Utilities

```typescript
import { validateFCMToken, validatePlatform, validateAppVersion } from '@zan-shop/push-notifications';

// Validate FCM token format
if (!validateFCMToken(token)) {
  throw new Error('Invalid FCM token');
}

// Validate platform
if (!validatePlatform(platform)) {
  throw new Error('Platform must be ios or android');
}

// Validate app version
if (!validateAppVersion(version)) {
  throw new Error('Invalid version format');
}
```

## Error Handling

All FCM operations return structured results:

```typescript
const result = await fcmService.sendToDevice(token, notification);

if (!result.success) {
  const error = result.error;
  
  // Common error codes:
  switch (error?.code) {
    case 'messaging/invalid-registration-token':
    case 'messaging/registration-token-not-registered':
      // Token is invalid - deactivate it in database
      await deviceService.markTokensAsInvalid([token]);
      break;
    
    case 'messaging/message-rate-exceeded':
      // Rate limit exceeded - implement backoff
      break;
    
    default:
      console.error('Unknown error:', error);
  }
}
```

## Integration with Medusa

### In a Medusa Subscriber

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
  
  console.log(`Sent shipment notification: ${result.successCount} succeeded, ${result.failureCount} failed`);
}
```

## Testing

### Dry Run Mode

Test notifications without actually sending them:

```typescript
const fcmService = new FCMService({
  firebaseApp,
  dryRun: true, // No actual notifications sent
});

const result = await fcmService.sendToDevice(token, notification);
// Firebase validates the request but doesn't send
```

### Token Validation

```typescript
const isValid = await fcmService.validateToken(token);
if (!isValid) {
  console.log('Token is invalid or expired');
}
```

## Type Definitions

The package is fully typed. Import types for your implementations:

```typescript
import type {
  DeviceToken,
  DeviceRegistration,
  NotificationPayload,
  SendResult,
  BatchResult,
  ShipmentNotification,
  OrderNotification,
  ReturnNotification,
} from '@zan-shop/push-notifications';
```

## Best Practices

1. **Handle Invalid Tokens**: Always check for invalid token errors and deactivate them in your database
2. **Batch Operations**: Use `sendToMultipleDevices` for multiple recipients (automatic batching)
3. **Rate Limiting**: Implement exponential backoff for rate limit errors
4. **Dry Run Testing**: Test in dry-run mode before production
5. **Structured Data**: Keep `data` payload as string key-value pairs (FCM requirement)
6. **Deep Links**: Use `clickAction` for navigation to specific app screens
7. **Token Cleanup**: Regularly run `cleanupInactiveTokens` to remove old tokens

## Advanced Usage

### Custom Notification Builder

```typescript
function buildCustomNotification(params: any): NotificationPayload {
  return {
    title: params.title,
    body: params.body,
    data: {
      // Must be string key-value pairs
      ...Object.entries(params.data).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>),
    },
    priority: params.urgent ? 'high' : 'normal',
    clickAction: params.url,
  };
}
```

### Topic Management

```typescript
// Subscribe device to topic
await firebaseApp.messaging().subscribeToTopic([token], 'promotions');

// Send to topic
await fcmService.sendToTopic('promotions', notification);

// Unsubscribe from topic
await firebaseApp.messaging().unsubscribeFromTopic([token], 'promotions');
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Support

For issues and questions:
- GitHub Issues: https://github.com/zan-shop/push-notifications/issues
- Documentation: https://github.com/zan-shop/push-notifications#readme

## Related

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Medusa.js Documentation](https://docs.medusajs.com)
- [Firebase Admin SDK Reference](https://firebase.google.com/docs/reference/admin/node)
