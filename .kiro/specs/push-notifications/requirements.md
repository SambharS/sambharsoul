# Requirements Document

## Status: ✅ IMPLEMENTATION COMPLETE

**Implementation Date**: 2025-11-08
**Documentation**: See `NOTIFICATIONS_README.md` for quick start guide

## Introduction

This feature enables real-time push notifications for a food ordering PWA using Firebase Cloud Messaging (FCM). The system will notify admins of new orders and payment confirmations, while keeping users informed about their order status throughout the preparation and delivery lifecycle. The implementation leverages Firebase for message delivery and Supabase for token management and order state tracking.

## Implementation Summary

All requirements have been successfully implemented:
- ✅ Firebase configuration and setup
- ✅ Device token registration and management
- ✅ Database schema with RLS policies
- ✅ Admin notifications for new orders
- ✅ User notifications for order status updates
- ✅ Background notification handling via service worker
- ✅ Foreground notification handling with toast messages
- ✅ API endpoints for sending and registering notifications
- ✅ Secure token and credential management
- ✅ Personalized notifications with order details

**Next Steps**: 
1. Get VAPID key from Firebase Console
2. Update `.env.local` with VAPID key
3. Run database migration
4. Add notification settings to UI
5. Test with real orders

## Requirements

### Requirement 1: Firebase Configuration and Setup

**User Story:** As a developer, I want to configure Firebase Cloud Messaging in the application, so that the infrastructure is ready to send and receive push notifications.

#### Acceptance Criteria

1. WHEN the application initializes THEN the system SHALL load Firebase configuration from environment variables
2. WHEN Firebase is initialized THEN the system SHALL configure both client-side messaging and server-side admin SDK
3. IF the application is a PWA THEN the system SHALL register a service worker for background message handling
4. WHEN Firebase setup is complete THEN the system SHALL expose messaging capabilities for token registration and message handling

### Requirement 2: Device Token Registration and Management

**User Story:** As a user or admin, I want my device to be registered for notifications, so that I can receive relevant alerts about orders.

#### Acceptance Criteria

1. WHEN a user logs in or opens the app THEN the system SHALL request notification permissions from the browser
2. IF notification permission is granted THEN the system SHALL retrieve an FCM device token using the VAPID key
3. WHEN an FCM token is obtained THEN the system SHALL save it to the `fcm_tokens` table with user_id and role
4. IF a token already exists for the user THEN the system SHALL update the existing record with the new token and timestamp
5. WHEN a user logs out THEN the system SHALL optionally remove or mark the token as inactive
6. IF token retrieval fails THEN the system SHALL log the error and continue without blocking the user experience

### Requirement 3: Database Schema for Token Storage

**User Story:** As a system administrator, I want a database table to store FCM tokens, so that the backend can target specific users and roles for notifications.

#### Acceptance Criteria

1. WHEN the database is initialized THEN the system SHALL create an `fcm_tokens` table with columns: id (UUID), user_id (UUID), role (text), fcm_token (text), updated_at (timestamp)
2. WHEN storing tokens THEN the system SHALL enforce a foreign key relationship between user_id and the users table
3. WHEN a token is saved THEN the system SHALL validate that role is either 'user' or 'admin'
4. WHEN querying tokens THEN the system SHALL support filtering by user_id and role for targeted notifications

### Requirement 4: Admin Notification for New Orders

**User Story:** As an admin, I want to receive a push notification when a new order is placed, so that I can promptly acknowledge and begin preparing it.

#### Acceptance Criteria

1. WHEN a new order is created THEN the system SHALL trigger a notification process for all admin devices
2. WHEN sending admin notifications THEN the system SHALL query the `fcm_tokens` table for all records with role='admin'
3. WHEN composing the notification THEN the system SHALL include title "New Order Received" and body with order ID
4. WHEN sending notifications THEN the system SHALL use Firebase Admin SDK's sendEachForMulticast method
5. IF notification delivery fails for a token THEN the system SHALL log the error but continue processing other tokens
6. WHEN the notification is sent THEN the system SHALL not block the order creation response

### Requirement 5: User Notification for Order Status Updates

**User Story:** As a user, I want to receive push notifications when my order status changes, so that I know when to pick up my food or track its progress.

#### Acceptance Criteria

1. WHEN an order status changes to "confirmed" THEN the system SHALL send a notification to the user with title "Order Confirmed ✅"
2. WHEN an order status changes to "preparing" THEN the system SHALL send a notification with title "Your [item] is being prepared 🍳"
3. WHEN an order status changes to "ready" THEN the system SHALL send a notification with title "Your Order is Ready for Pickup 🍱"
4. WHEN an order status changes to "completed" THEN the system SHALL send a notification with title "Enjoy your meal!"
5. WHEN sending user notifications THEN the system SHALL query the `fcm_tokens` table for the specific user_id
6. WHEN composing notifications THEN the system SHALL include the order ID in the notification body
7. IF no FCM token exists for the user THEN the system SHALL skip notification sending without error

### Requirement 6: Background Notification Handling

**User Story:** As a user, I want to receive notifications even when the app is not in the foreground, so that I don't miss important order updates.

#### Acceptance Criteria

1. WHEN a notification arrives and the app is in the background THEN the service worker SHALL display a system notification
2. WHEN displaying background notifications THEN the system SHALL include the notification title, body, and app icon
3. WHEN a user clicks a background notification THEN the system SHALL open or focus the PWA
4. IF the notification contains order data THEN the system SHALL navigate to the relevant order details page
5. WHEN the service worker receives a message THEN the system SHALL handle it using the onBackgroundMessage handler

### Requirement 7: Foreground Notification Handling

**User Story:** As a user with the app open, I want to see in-app notifications for order updates, so that I'm aware of changes without leaving the current page.

#### Acceptance Criteria

1. WHEN a notification arrives and the app is in the foreground THEN the system SHALL display an in-app toast or alert
2. WHEN displaying foreground notifications THEN the system SHALL use the onMessage handler from Firebase messaging
3. WHEN showing in-app notifications THEN the system SHALL include the notification title and body
4. WHEN a foreground notification is displayed THEN the system SHALL not show a duplicate system notification
5. IF the user is on the orders page THEN the system SHALL optionally refresh the order list automatically

### Requirement 8: Notification API Endpoint

**User Story:** As a backend service, I want an API endpoint to trigger notifications, so that order status changes can reliably send push messages.

#### Acceptance Criteria

1. WHEN the API receives a notification request THEN the system SHALL validate required fields: order_id, user_id, and status
2. WHEN processing a notification request THEN the system SHALL determine the recipient role (admin or user) based on the notification type
3. WHEN sending notifications THEN the system SHALL use the Firebase Admin SDK with proper authentication
4. IF Firebase Admin is not initialized THEN the system SHALL initialize it using the service account credentials
5. WHEN the notification is sent successfully THEN the system SHALL return a 200 status with success confirmation
6. IF notification sending fails THEN the system SHALL return an appropriate error status and message
7. WHEN handling errors THEN the system SHALL log detailed error information for debugging

### Requirement 9: Security and Token Management

**User Story:** As a security-conscious developer, I want FCM tokens and credentials to be securely managed, so that unauthorized parties cannot send notifications.

#### Acceptance Criteria

1. WHEN storing Firebase credentials THEN the system SHALL use environment variables and never commit them to version control
2. WHEN accessing the `fcm_tokens` table THEN the system SHALL enforce Row Level Security (RLS) policies
3. WHEN a user requests their tokens THEN the system SHALL only return tokens belonging to that user
4. WHEN admin operations access tokens THEN the system SHALL use the Supabase service role key
5. WHEN Firebase Admin SDK is initialized THEN the system SHALL use the service account JSON securely loaded from environment variables
6. IF a token is compromised or expired THEN the system SHALL support token refresh and re-registration

### Requirement 10: Notification Personalization

**User Story:** As a user, I want notifications to include relevant details about my specific order, so that I can quickly understand what the notification is about.

#### Acceptance Criteria

1. WHEN composing notifications THEN the system SHALL include the order ID in the message
2. WHEN notifying about food preparation THEN the system SHALL include the specific item name (e.g., "Your Dosa")
3. WHEN sending status updates THEN the system SHALL use appropriate emojis and friendly language
4. WHEN notifying admins THEN the system SHALL include customer information if available
5. WHEN multiple orders exist THEN the system SHALL ensure notifications are specific to the correct order
