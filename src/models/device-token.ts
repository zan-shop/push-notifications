/**
 * Device Token Model
 * Represents a registered mobile device for push notifications
 */

export interface DeviceToken {
  id: string;
  customer_id: string;
  token: string; // FCM device token
  platform: 'ios' | 'android';
  app_version?: string;
  device_info?: DeviceInfo;
  is_active: boolean;
  last_used_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface DeviceInfo {
  model?: string;
  os_version?: string;
  manufacturer?: string;
}

export interface DeviceRegistration {
  token: string;
  platform: 'ios' | 'android';
  app_version?: string;
  device_info?: DeviceInfo;
}

export type Platform = 'ios' | 'android';
