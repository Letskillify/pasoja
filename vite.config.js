import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables with any prefix
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.VITE_CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME),
      'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(env.VITE_CLOUDINARY_UPLOAD_PRESET || env.CLOUDINARY_UPLOAD_PRESET),

      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.VITE_FIREBASE_MEASUREMENT_ID || env.FIREBASE_MEASUREMENT_ID),

      'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(env.VITE_RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID),
      'import.meta.env.VITE_RAZORPAY_KEY_SECRET': JSON.stringify(env.VITE_RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET),

      'import.meta.env.VITE_SHIPROCKET_EMAIL': JSON.stringify(env.VITE_SHIPROCKET_EMAIL || env.SHIPROCKET_EMAIL),
      'import.meta.env.VITE_SHIPROCKET_PASSWORD': JSON.stringify(env.VITE_SHIPROCKET_PASSWORD || env.SHIPROCKET_PASSWORD),

      'import.meta.env.VITE_EMAILJS_PUBLIC_KEY': JSON.stringify(env.VITE_EMAILJS_PUBLIC_KEY || env.EMAILJS_PUBLIC_KEY),
      'import.meta.env.VITE_EMAILJS_PRIVATE_KEY': JSON.stringify(env.VITE_EMAILJS_PRIVATE_KEY || env.EMAILJS_PRIVATE_KEY),
      'import.meta.env.VITE_EMAILJS_SERVICE_ID': JSON.stringify(env.VITE_EMAILJS_SERVICE_ID || env.EMAILJS_SERVICE_ID),
      'import.meta.env.VITE_EMAILJS_TEMPLATE_ID': JSON.stringify(env.VITE_EMAILJS_TEMPLATE_ID || env.EMAILJS_TEMPLATE_ID),
      'import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID': JSON.stringify(env.VITE_EMAILJS_WELCOME_TEMPLATE_ID || env.EMAILJS_WELCOME_TEMPLATE_ID),
      'import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID': JSON.stringify(env.VITE_EMAILJS_ORDER_TEMPLATE_ID || env.EMAILJS_ORDER_TEMPLATE_ID),
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'vendor-firebase';
              if (id.includes('framer-motion')) return 'vendor-framer';
              if (id.includes('swiper')) return 'vendor-swiper';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              return 'vendor';
            }
          },
        },
      },
    },
  }
})