// Firebase Cloud Messaging Service Worker
// This runs in the background to handle push notifications

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// Note: These values are public and safe to include
firebase.initializeApp({
    apiKey: "AIzaSyCEiQwgMlTHsvnOkt6V5DepFqtcTGbYRCU",
    authDomain: "sambharsoul.firebaseapp.com",
    projectId: "sambharsoul",
    storageBucket: "sambharsoul.firebasestorage.app",
    messagingSenderId: "88719443708",
    appId: "1:88719443708:web:15dca0286ab2a783f63979"
});

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: payload.data?.orderId || 'notification',
        data: payload.data,
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View Order'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    if (event.action === 'view') {
        // Open the app to the order page
        const orderId = event.notification.data?.orderId;
        const url = orderId ? `/orders/${orderId}` : '/orders';

        event.waitUntil(
            clients.openWindow(url)
        );
    }
});
