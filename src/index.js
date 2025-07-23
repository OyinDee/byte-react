import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
    />
  </React.StrictMode>
);

const waitForSWActivation = (registration) => {
  if (!registration?.waiting) return;

  // Tell the waiting SW to skip waiting
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });

  // Listen for the new SW to take control before reloading
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
};

serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    toast.info(
      <div className="space-y-2">
        <p>A new version of Byte is available!</p>
        <button
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          onClick={() => waitForSWActivation(registration)}
        >
          🔄 Update Now
        </button>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false
      }
    );
  },

  onSuccess: () => {
    console.log('✅ Service worker successfully registered.');
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
});

reportWebVitals();
