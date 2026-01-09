/**
 * Device Service Interface
 * Abstract interface for managing device tokens
 * 
 * This is an abstract class that should be implemented with database-specific logic
 * The implementing class in zan-backend will use Medusa's data layer
 */

import { DeviceToken, DeviceRegistration } from '../models/device-token';

export abstract class DeviceService {
  /**
   * Register a new device token for a customer
   * Should handle deduplication (same customer + token)
   */
  abstract registerDevice(
    customerId: string,
    deviceData: DeviceRegistration
  ): Promise<DeviceToken>;

  /**
   * Update an existing device
   */
  abstract updateDevice(
    tokenId: string,
    updates: Partial<DeviceToken>
  ): Promise<DeviceToken>;

  /**
   * Deactivate a device (e.g., on logout)
   * Marks device as inactive rather than deleting
   */
  abstract deactivateDevice(token: string): Promise<void>;

  /**
   * Deactivate all devices for a customer (e.g., on account deletion)
   */
  abstract deactivateCustomerDevices(customerId: string): Promise<number>;

  /**
   * Get all active devices for a customer
   */
  abstract getCustomerDevices(customerId: string): Promise<DeviceToken[]>;

  /**
   * Get a specific device by token
   */
  abstract getDeviceByToken(token: string): Promise<DeviceToken | null>;

  /**
   * Update last_used_at timestamp for a device
   */
  abstract touchDevice(token: string): Promise<void>;

  /**
   * Clean up inactive tokens older than specified days
   * Returns number of devices cleaned up
   */
  abstract cleanupInactiveTokens(daysThreshold: number): Promise<number>;

  /**
   * Handle invalid tokens (called when FCM reports token as invalid)
   * Marks tokens as inactive
   */
  abstract markTokensAsInvalid(tokens: string[]): Promise<void>;
}
