import { corsHeaders, getUserFromRequest, json } from '../_shared/http.ts'

interface AddressCandidate {
  id: string
  name: string
  address: string
  zonecode: string
  lat: number
  lng: number
}

interface SearchBody {
  action: 'search'
  query: string
}

interface ReverseBody {
  action: 'reverse'
  lat: number
  lng: number
}

type Body = SearchBody | ReverseBody

interface GeoAddress {
  roadAddress?: string
  jibunAddress?: string
  x?: string
  y?: string
  addressElements?: { types?: string[]; longName?: string }[]
}

interface ReverseLand {
  name?: string
  number1?: string
  number2?: string
  addition0?: { type?: string; value?: string }
  addition1?: { type?: string; value?: string }
  addition2?: { type?: string; value?: string }
}

interface ReverseResult {
  name?: string
  region?: {
    area1?: { name?: string }
    area2?: { name?: string }
    area3?: { name?: string }
    area4?: { name?: string }
  }
  land?: ReverseLand
}

function naverHeaders() {
  const id = Deno.env.get('NAVER_MAP_CLIENT_ID')
  const secret = Deno.env.get('NAVER_MAP_CLIENT_SECRET')
  if (!id || !secret) throw new Error('네이버 지도 API 키가 설정되지 않았습니다.')
  return {
    Accept: 'application/json',
    'X-NCP-APIGW-API-KEY-ID': id,
    'X-NCP-APIGW-API-KEY': secret,
  }
}

function postalCode(elements: GeoAddress['addressElements']) {
  return elements?.find((item) => item.types?.includes('POSTAL_CODE'))?.longName ?? ''
}

function buildingName(elements: GeoAddress['addressElements']) {
  return elements?.find((item) => item.types?.includes('BUILDING_NAME'))?.longName ?? ''
}

function additionValue(land: ReverseLand | undefined, type: string) {
  return [land?.addition0, land?.addition1, land?.addition2].find((item) => item?.type === type)?.value ?? ''
}

function formatRegion(result: ReverseResult) {
  return [result.region?.area1?.name, result.region?.area2?.name, result.region?.area3?.name, result.region?.area4?.name]
    .filter(Boolean)
    .join(' ')
}

function formatReverseAddress(result: ReverseResult) {
  const region = formatRegion(result)
  if (result.name === 'roadaddr') {
    const number = result.land?.number2 ? `${result.land.number1}-${result.land.number2}` : result.land?.number1
    return [region, result.land?.name, number].filter(Boolean).join(' ')
  }
  const number = result.land?.number2 ? `${result.land.number1}-${result.land.number2}` : result.land?.number1
  return [region, number].filter(Boolean).join(' ')
}

async function searchAddresses(query: string): Promise<AddressCandidate[]> {
  const url = new URL('https://maps.apigw.ntruss.com/map-geocode/v2/geocode')
  url.searchParams.set('query', query)
  url.searchParams.set('count', '15')
  const response = await fetch(url, { headers: naverHeaders() })
  if (!response.ok) throw new Error('주소 검색에 실패했습니다.')
  const payload = (await response.json()) as { addresses?: GeoAddress[] }
  return (payload.addresses ?? [])
    .map((item) => {
      const address = item.roadAddress || item.jibunAddress || ''
      const name = buildingName(item.addressElements) || address
      if (!address || !item.x || !item.y) return null
      return {
        id: `addr:${item.x},${item.y},${address}`,
        name,
        address,
        zonecode: postalCode(item.addressElements),
        lat: Number(item.y),
        lng: Number(item.x),
      } satisfies AddressCandidate
    })
    .filter((item): item is AddressCandidate => Boolean(item))
}

async function reverseAddress(lat: number, lng: number): Promise<AddressCandidate> {
  const url = new URL('https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc')
  url.searchParams.set('coords', `${lng},${lat}`)
  url.searchParams.set('output', 'json')
  url.searchParams.set('orders', 'roadaddr,addr')
  const response = await fetch(url, { headers: naverHeaders() })
  if (!response.ok) throw new Error('현재 위치 주소를 확인하지 못했습니다.')
  const payload = (await response.json()) as { status?: { code?: number }; results?: ReverseResult[] }
  if (payload.status?.code === 3 || !payload.results?.length) {
    throw new Error('이 위치의 주소를 찾지 못했습니다. 주소 검색을 이용해 주세요.')
  }
  const picked = payload.results.find((item) => item.name === 'roadaddr') ?? payload.results[0]
  const address = formatReverseAddress(picked)
  if (!address) throw new Error('이 위치의 주소를 찾지 못했습니다. 주소 검색을 이용해 주세요.')
  const name = additionValue(picked.land, 'building') || address
  return {
    id: `coord:${lng},${lat}`,
    name,
    address,
    zonecode: additionValue(picked.land, 'zipcode'),
    lat,
    lng,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const user = await getUserFromRequest(req)
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401)

  try {
    const body = (await req.json()) as Body
    if (body?.action === 'search') {
      const query = body.query?.trim() ?? ''
      if (query.length < 2) return json({ error: '검색어를 입력해 주세요.' }, 400)
      return json({ results: await searchAddresses(query) })
    }
    if (body?.action === 'reverse') {
      if (!Number.isFinite(body.lat) || !Number.isFinite(body.lng)) {
        return json({ error: '위치 정보가 올바르지 않습니다.' }, 400)
      }
      return json({ result: await reverseAddress(body.lat, body.lng) })
    }
    return json({ error: '요청이 올바르지 않습니다.' }, 400)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : '주소 조회에 실패했습니다.' }, 500)
  }
})
