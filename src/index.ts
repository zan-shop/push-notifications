/**
 * @zan-shop/push-notifications
 * 
 * Reusable push notification module for Medusa.js using Firebase Cloud Messaging
 * 
 * @example
 * ```typescript
 * import { FCMService, formatShipmentNotification } from '@zan-shop/push-notifications';
 * 
 * const fcmService = new FCMService({ firebaseApp });
 * 
 * const notification = formatShipmentNotification({
 *   type: 'shipment.created',
 *   orderId: '123',
 *   trackingNumber: 'ABC123',
 *   carrier: 'FedEx',
 * });
 * 
 * await fcmService.sendToDevice(deviceToken, notification);
 * ```
 */

// Models
export type {
  DeviceToken,
  DeviceInfo,
  DeviceRegistration,
  Platform,
} from './models/device-token';

// Services
export { FCMService, DeviceService } from './services';
export type { FCMServiceOptions } from './services';

// Types
export type {
  NotificationPayload,
  NotificationPriority,
  SendResult,
  BatchResult,
  NotificationError,
  ShipmentNotification,
  OrderNotification,
  ReturnNotification,
} from './types';

// Utils
export {
  validateFCMToken,
  validatePlatform,
  validateAppVersion,
  formatShipmentNotification,
  formatOrderNotification,
  formatReturnNotification,
} from './utils';
