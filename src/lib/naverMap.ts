import { invokeFunction } from './functions'

export interface AddressCandidate {
  id: string
  name: string
  address: string
  zonecode: string
  lat: number
  lng: number
}

interface NaverLatLng {
  lat(): number
  lng(): number
}

interface NaverMap {
  setCenter(latlng: NaverLatLng): void
  autoResize(): void
}

interface NaverMarker {
  setMap(map: NaverMap | null): void
  setPosition(latlng: NaverLatLng): void
}

interface NaverMapsSdk {
  LatLng: new (lat: number, lng: number) => NaverLatLng
  Map: new (container: HTMLElement, options: { center: NaverLatLng; zoom: number }) => NaverMap
  Marker: new (options: { position: NaverLatLng; map: NaverMap }) => NaverMarker
  Event: {
    addListener(target: NaverMap, type: 'click', handler: (e: { coord: NaverLatLng }) => void): void
  }
}

declare global {
  interface Window {
    naver?: { maps: NaverMapsSdk }
  }
}

let mapsReady: Promise<NaverMapsSdk> | null = null

function getClientId() {
  const key = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
  if (!key) throw new Error('네이버 지도 Client ID(VITE_NAVER_MAP_CLIENT_ID)가 설정되지 않았습니다.')
  return key
}

export function loadNaverMaps(): Promise<NaverMapsSdk> {
  if (window.naver?.maps?.LatLng) return Promise.resolve(window.naver.maps)
  if (mapsReady) return mapsReady

  mapsReady = new Promise((resolve, reject) => {
    const existing = document.getElementById('naver-maps-sdk')
    if (existing && window.naver?.maps?.LatLng) {
      resolve(window.naver.maps)
      return
    }

    const script = document.createElement('script')
    script.id = 'naver-maps-sdk'
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${getClientId()}`
    script.async = true
    script.onload = () => {
      if (!window.naver?.maps?.LatLng) {
        mapsReady = null
        reject(new Error('네이버 지도를 불러오지 못했습니다.'))
        return
      }
      resolve(window.naver.maps)
    }
    script.onerror = () => {
      mapsReady = null
      reject(
        new Error(
          '네이버 지도를 불러오지 못했습니다. 콘솔에 Web 서비스 URL(http://localhost, http://farmassi.kr)이 등록돼 있는지 확인하세요.',
        ),
      )
    }
    document.head.appendChild(script)
  })

  return mapsReady
}

export async function searchAddresses(query: string): Promise<AddressCandidate[]> {
  const data = await invokeFunction<{ results?: AddressCandidate[] }>('naver-address', {
    action: 'search',
    query,
  })
  return data.results ?? []
}

export async function coordToAddress(lat: number, lng: number): Promise<AddressCandidate> {
  const data = await invokeFunction<{ result: AddressCandidate }>('naver-address', {
    action: 'reverse',
    lat,
    lng,
  })
  return data.result
}

export async function enrichZonecode(candidate: AddressCandidate): Promise<AddressCandidate> {
  if (candidate.zonecode) return candidate
  try {
    const fromCoord = await coordToAddress(candidate.lat, candidate.lng)
    return {
      ...candidate,
      zonecode: fromCoord.zonecode || candidate.zonecode,
      address: candidate.address || fromCoord.address,
    }
  } catch {
    return candidate
  }
}

export async function getCurrentAddress(): Promise<AddressCandidate> {
  const position = await getCurrentPosition()
  return coordToAddress(position.coords.latitude, position.coords.longitude)
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 정보를 지원하지 않습니다.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('위치 권한을 허용해 주세요.'))
          return
        }
        reject(new Error('현재 위치를 확인할 수 없습니다.'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30_000 },
    )
  })
}

export function createAddressMap(
  container: HTMLElement,
  candidate: AddressCandidate,
  onMove: (next: AddressCandidate) => void,
): () => void {
  const maps = window.naver?.maps
  if (!maps) throw new Error('네이버 지도를 불러오지 못했습니다.')

  container.classList.add('naver-map')
  const center = new maps.LatLng(candidate.lat, candidate.lng)
  const map = new maps.Map(container, { center, zoom: 16 })
  const marker = new maps.Marker({ position: center, map })

  const relayout = () => {
    map.autoResize()
    map.setCenter(center)
  }
  requestAnimationFrame(relayout)
  const relayoutTimer = window.setTimeout(relayout, 120)

  maps.Event.addListener(map, 'click', (event) => {
    const lat = event.coord.lat()
    const lng = event.coord.lng()
    marker.setPosition(event.coord)
    void coordToAddress(lat, lng)
      .then(onMove)
      .catch(() => {
        /* keep previous address if reverse geocode fails */
      })
  })

  return () => {
    window.clearTimeout(relayoutTimer)
    marker.setMap(null)
    container.innerHTML = ''
  }
}
