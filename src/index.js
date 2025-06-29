import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <>
      <App />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop />
    </>
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onUpdate: registration => {
    // Notify the user about the update
    toast.info(
      <div>
        <p>A new version of the app is available!</p>
        <button 
          className="px-4 py-2 mt-2 bg-olive text-white rounded-md"
          onClick={() => {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }}
        >
          Update Now
        </button>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false
      }
    );
  },
  onSuccess: registration => {
    console.log('Service worker successfully registered.');
    // Request notification permission when service worker is successfully registered
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
