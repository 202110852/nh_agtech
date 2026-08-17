self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = { title: '팜어시', body: '새 알림이 있습니다.', url: '/farm' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    // keep defaults
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192.svg',
      badge: '/pwa-192.svg',
      data: { url: data.url || '/farm' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/farm'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate?.(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})
