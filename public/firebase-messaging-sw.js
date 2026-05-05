// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// This is required to receive notifications.
firebase.initializeApp({
  apiKey: "AIzaSyDfqsAXUa-SESSTZUNuCyAVFtApKAxNKO0",
  authDomain: "dwm-wallet.firebaseapp.com",
  projectId: "dwm-wallet",
  storageBucket: "dwm-wallet.firebasestorage.app",
  messagingSenderId: "112568320057",
  appId: "1:112568320057:web:f5fedfe20b10bced934de8",
  measurementId: "G-5KK9EP9BQL"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
