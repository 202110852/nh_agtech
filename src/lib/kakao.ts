const SDK_SRC = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.2/kakao.min.js'
const SDK_INTEGRITY = 'sha384-zt/G7/KfaRQ9dT/QIkS0ujMtzouJqzuSJcXVQu50x0rl/+mD1dc70AeOejVbMD9E'
const STATE_KEY = 'farmassi-kakao-state'
const REDIRECT_KEY = 'farmassi-kakao-redirect'

interface KakaoSDK {
  init: (key: string) => void
  isInitialized: () => boolean
  Auth: {
    authorize: (options: {
      redirectUri: string
      throughTalk?: boolean
      scope?: string
      state?: string
    }) => void
  }
}

declare global {
  interface Window {
    Kakao?: KakaoSDK
  }
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function loadScript() {
  if (window.Kakao) return Promise.resolve()
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_SRC}"]`)
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('카카오 SDK를 불러오지 못했습니다.')), { once: true })
    })
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_SRC
    script.integrity = SDK_INTEGRITY
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('카카오 SDK를 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })
}

export function kakaoJsKey() {
  return import.meta.env.VITE_KAKAO_JS_KEY?.trim() ?? ''
}

export function kakaoRedirectUri() {
  return `${window.location.origin}/auth/callback`
}

export async function initKakao() {
  const key = kakaoJsKey()
  if (!key) {
    throw new Error('카카오 JavaScript 키가 없습니다. .env.local에 VITE_KAKAO_JS_KEY를 넣고 개발 서버를 다시 시작하세요.')
  }

  await loadScript()
  if (!window.Kakao) throw new Error('카카오 SDK를 초기화하지 못했습니다.')
  if (!window.Kakao.isInitialized()) window.Kakao.init(key)
  return window.Kakao
}

export async function startKakaoTalkLogin(next?: string) {
  const kakao = await initKakao()
  const redirectUri = kakaoRedirectUri()
  const state = randomToken()
  sessionStorage.setItem(STATE_KEY, state)
  sessionStorage.setItem(REDIRECT_KEY, redirectUri)
  if (next) sessionStorage.setItem('farmassi-next', next)

  kakao.Auth.authorize({
    redirectUri,
    throughTalk: true,
    scope: 'profile_nickname,profile_image',
    state,
  })
}

export function readKakaoCallback(params: URLSearchParams) {
  const error = params.get('error')
  const errorDescription = params.get('error_description')
  const code = params.get('code')
  const state = params.get('state')
  const savedState = sessionStorage.getItem(STATE_KEY)
  const redirectUri = sessionStorage.getItem(REDIRECT_KEY) || kakaoRedirectUri()

  return {
    error,
    errorDescription,
    code,
    state,
    savedState,
    redirectUri,
    isKakaoCallback: Boolean(code && savedState),
  }
}

export function clearKakaoCallback() {
  sessionStorage.removeItem(STATE_KEY)
  sessionStorage.removeItem(REDIRECT_KEY)
}
