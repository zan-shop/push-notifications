/**
 * FCM Service
 * Handles sending push notifications via Firebase Cloud Messaging
 */

import * as admin from 'firebase-admin';
import {
  NotificationPayload,
  SendResult,
  BatchResult,
  NotificationError,
} from '../types/notification';

export interface FCMServiceOptions {
  firebaseApp: admin.app.App;
  dryRun?: boolean; // For testing without actually sending
}

export class FCMService {
  private messaging: admin.messaging.Messaging;
  private dryRun: boolean;

  constructor(options: FCMServiceOptions) {
    this.messaging = options.firebaseApp.messaging();
    this.dryRun = options.dryRun || false;
  }

  /**
   * Send notification to a single device
   */
  async sendToDevice(
    token: string,
    payload: NotificationPayload
  ): Promise<SendResult> {
    try {
      const message = this.buildMessage(token, payload);

      const messageId = await this.messaging.send(message, this.dryRun);

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error, token),
      };
    }
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultipleDevices(
    tokens: string[],
    payload: NotificationPayload
  ): Promise<BatchResult> {
    if (tokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        results: [],
      };
    }

    // FCM allows max 500 tokens per batch
    const batchSize = 500;
    const results: SendResult[] = [];

    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      const batchResults = await this.sendBatch(batch, payload);
      results.push(...batchResults);
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return {
      successCount,
      failureCount,
      results,
    };
  }

  /**
   * Send notification to a topic (broadcast)
   */
  async sendToTopic(
    topic: string,
    payload: NotificationPayload
  ): Promise<SendResult> {
    try {
      const message = this.buildTopicMessage(topic, payload);

      const messageId = await this.messaging.send(message, this.dryRun);

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error),
      };
    }
  }

  /**
   * Validate a device token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Try to send a dry-run message
      await this.messaging.send(
        {
          token,
          notification: {
            title: 'Test',
            body: 'Test',
          },
        },
        true // Always dry run for validation
      );
      return true;
    } catch (error: any) {
      // Token is invalid if we get specific error codes
      const invalidTokenCodes = [
        'messaging/invalid-registration-token',
        'messaging/registration-token-not-registered',
      ];
      return !invalidTokenCodes.includes(error?.code);
    }
  }

  /**
   * Send batch of notifications
   */
  private async sendBatch(
    tokens: string[],
    payload: NotificationPayload
  ): Promise<SendResult[]> {
    try {
      const messages = tokens.map((token) => this.buildMessage(token, payload));

      const response = await this.messaging.sendEach(messages, this.dryRun);

      return response.responses.map((resp, index) => {
        if (resp.success) {
          return {
            success: true,
            messageId: resp.messageId,
          };
        } else {
          return {
            success: false,
            error: this.parseError(resp.error, tokens[index]),
          };
        }
      });
    } catch (error) {
      // If entire batch fails, return error for all tokens
      return tokens.map((token) => ({
        success: false,
        error: this.parseError(error, token),
      }));
    }
  }

  /**
   * Build FCM message for a single device
   */
  private buildMessage(
    token: string,
    payload: NotificationPayload
  ): admin.messaging.Message {
    return {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      data: payload.data,
      android: {
        priority: payload.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: payload.sound || 'default',
          clickAction: payload.clickAction,
        },
      },
      apns: {
        payload: {
          aps: {
            badge: payload.badge,
            sound: payload.sound || 'default',
          },
        },
        fcmOptions: {
          ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
        },
      },
    };
  }

  /**
   * Build FCM message for a topic
   */
  private buildTopicMessage(
    topic: string,
    payload: NotificationPayload
  ): admin.messaging.Message {
    return {
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      data: payload.data,
      android: {
        priority: payload.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: payload.sound || 'default',
          clickAction: payload.clickAction,
        },
      },
      apns: {
        payload: {
          aps: {
            badge: payload.badge,
            sound: payload.sound || 'default',
          },
        },
      },
    };
  }

  /**
   * Parse Firebase error into standardized format
   */
  private parseError(error: any, token?: string): NotificationError {
    const code = error?.code || 'unknown';
    const message = error?.message || 'Unknown error occurred';

    return {
      code,
      message,
      ...(token && { token }),
    };
  }
}
