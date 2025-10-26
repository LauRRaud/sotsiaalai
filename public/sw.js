// Minimal Service Worker for installability
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control immediately so installability checks pass
  event.waitUntil(self.clients.claim());
});

// No fetch handler -> pass-through; add caching later if needed

