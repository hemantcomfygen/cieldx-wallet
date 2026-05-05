import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig, VAPID_KEY } from "../utils/config.js";


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      // Explicitly register the service worker
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      // console.log("FCM Token:", token);
      return token;
    } else if (permission === "denied") {
      console.warn("Notification permission denied. Please enable it in browser settings.");
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };
