function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

function bufferToBase64(buffer: ArrayBuffer | null) {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  if (registrationPromise) return registrationPromise

  registrationPromise = (async () => {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    })

    const requestUpdate = () => {
      void registration.update()
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') requestUpdate()
    })
    window.addEventListener('focus', requestUpdate)

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }

    return registration
  })()

  return registrationPromise
}

export async function subscribePush() {
  const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapid) throw new Error('VAPID 공개키가 설정되지 않았습니다.')
  const registration = await registerServiceWorker()
  if (!registration) throw new Error('서비스 워커를 등록할 수 없습니다.')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('알림 권한이 필요합니다. 브라우저 설정에서 허용해주세요.')
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapid),
  })
  const json = subscription.toJSON()
  return {
    endpoint: subscription.endpoint,
    p256dh: json.keys?.p256dh ?? bufferToBase64(subscription.getKey('p256dh')),
    auth: json.keys?.auth ?? bufferToBase64(subscription.getKey('auth')),
  }
}
