export interface PostcodeResult {
  zonecode: string
  address: string
}

interface DaumPostcodeCtor {
  new (options: { oncomplete: (data: DaumPostcodeData) => void }): { open: () => void }
}

interface DaumPostcodeData {
  zonecode: string
  roadAddress: string
  jibunAddress: string
  address: string
}

let loading: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve()
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loading = null
      reject(new Error('주소 검색 스크립트를 불러오지 못했습니다.'))
    }
    document.head.appendChild(script)
  })
  return loading
}

export async function openPostcode(): Promise<PostcodeResult> {
  await loadScript()
  const Postcode = window.daum?.Postcode
  if (!Postcode) {
    throw new Error('카카오 우편번호 서비스를 사용할 수 없습니다.')
  }
  return new Promise((resolve) => {
    new Postcode({
      oncomplete: (data) => {
        resolve({
          zonecode: data.zonecode,
          address: data.roadAddress || data.address || data.jibunAddress,
        })
      },
    }).open()
  })
}

declare global {
  interface Window {
    daum?: { Postcode: DaumPostcodeCtor }
  }
}
