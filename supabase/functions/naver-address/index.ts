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

interface KakaoRoadAddress {
  address_name?: string
  zone_no?: string
  building_name?: string
  x?: string
  y?: string
}

interface KakaoAddressDocument {
  address_name?: string
  address_type?: string
  x?: string
  y?: string
  address?: { address_name?: string } | null
  road_address?: KakaoRoadAddress | null
}

interface KakaoKeywordDocument {
  place_name?: string
  address_name?: string
  road_address_name?: string
  x?: string
  y?: string
}

interface KakaoSearchMeta {
  total_count?: number
  pageable_count?: number
  is_end?: boolean
}

interface KakaoCoordDocument {
  address?: { address_name?: string; zone_no?: string }
  road_address?: { address_name?: string; zone_no?: string; building_name?: string }
}

function kakaoHeaders() {
  const key = Deno.env.get('KAKAO_REST_API_KEY')
  if (!key) throw new Error('카카오 REST API 키(KAKAO_REST_API_KEY)가 설정되지 않았습니다.')
  return {
    Accept: 'application/json',
    Authorization: `KakaoAK ${key}`,
  }
}

function normalizeKeyword(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function withSpaceBeforeNumber(value: string) {
  return value.replace(/([가-힣A-Za-z]+)(\d[\d-]*)$/, '$1 $2')
}

function roadOnlyKeyword(value: string) {
  return value.replace(/\s*\d[\d-]*$/, '').trim()
}

function buildSearchQueries(input: string) {
  const normalized = normalizeKeyword(input)
  const spaced = normalizeKeyword(withSpaceBeforeNumber(normalized))
  const roadOnly = normalizeKeyword(roadOnlyKeyword(spaced))
  const hasTrailingNumber = /\d[\d-]*$/.test(spaced)
  const queries = [normalized]

  if (spaced && spaced !== normalized) queries.push(spaced)
  if (hasTrailingNumber && roadOnly.length >= 2 && roadOnly !== normalized && roadOnly !== spaced) {
    queries.push(roadOnly)
  }

  return [...new Set(queries)]
}

function toCandidate(
  address: string,
  lat: number,
  lng: number,
  zonecode: string,
  name?: string,
): AddressCandidate | null {
  if (!address || !Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return {
    id: `addr:${lng},${lat},${address}`,
    name: name?.trim() || address,
    address,
    zonecode,
    lat,
    lng,
  }
}

function fromAddressDocument(doc: KakaoAddressDocument): AddressCandidate | null {
  const road = doc.road_address
  const address = road?.address_name || doc.address_name || doc.address?.address_name || ''
  const lat = Number(road?.y ?? doc.y)
  const lng = Number(road?.x ?? doc.x)
  const zonecode = road?.zone_no ?? ''
  const name = road?.building_name?.trim() || address
  return toCandidate(address, lat, lng, zonecode, name)
}

function fromKeywordDocument(doc: KakaoKeywordDocument): AddressCandidate | null {
  const address = doc.road_address_name || doc.address_name || ''
  const lat = Number(doc.y)
  const lng = Number(doc.x)
  const name = doc.place_name?.trim() || address
  return toCandidate(address, lat, lng, '', name)
}

async function fetchKakaoAddressPage(query: string, page: number) {
  const url = new URL('https://dapi.kakao.com/v2/local/search/address.json')
  url.searchParams.set('query', query)
  url.searchParams.set('page', String(page))
  url.searchParams.set('size', '15')
  const response = await fetch(url, { headers: kakaoHeaders() })
  if (!response.ok) throw new Error('주소 검색에 실패했습니다.')
  return (await response.json()) as { documents?: KakaoAddressDocument[]; meta?: KakaoSearchMeta }
}

async function fetchKakaoKeywordPage(query: string, page: number) {
  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json')
  url.searchParams.set('query', query)
  url.searchParams.set('page', String(page))
  url.searchParams.set('size', '15')
  const response = await fetch(url, { headers: kakaoHeaders() })
  if (!response.ok) return { documents: [], meta: { is_end: true } }
  return (await response.json()) as { documents?: KakaoKeywordDocument[]; meta?: KakaoSearchMeta }
}

async function collectAddressSearch(query: string, seen: Set<string>, results: AddressCandidate[], maxResults: number) {
  for (let page = 1; page <= 3; page += 1) {
    const payload = await fetchKakaoAddressPage(query, page)
    const pageItems = (payload.documents ?? [])
      .map(fromAddressDocument)
      .filter((item): item is AddressCandidate => Boolean(item))

    for (const item of pageItems) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      results.push(item)
      if (results.length >= maxResults) return
    }

    if (payload.meta?.is_end || pageItems.length === 0) break
  }
}

async function collectKeywordSearch(query: string, seen: Set<string>, results: AddressCandidate[], maxResults: number) {
  for (let page = 1; page <= 2; page += 1) {
    const payload = await fetchKakaoKeywordPage(query, page)
    const pageItems = (payload.documents ?? [])
      .map(fromKeywordDocument)
      .filter((item): item is AddressCandidate => Boolean(item))

    for (const item of pageItems) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      results.push(item)
      if (results.length >= maxResults) return
    }

    if (payload.meta?.is_end || pageItems.length === 0) break
  }
}

async function searchAddresses(query: string): Promise<AddressCandidate[]> {
  const maxResults = 45
  const seen = new Set<string>()
  const results: AddressCandidate[] = []
  const searchQueries = buildSearchQueries(query)

  for (const keyword of searchQueries) {
    await collectAddressSearch(keyword, seen, results, maxResults)
    if (results.length >= maxResults) break
  }

  if (results.length < 5) {
    for (const keyword of searchQueries) {
      await collectKeywordSearch(keyword, seen, results, maxResults)
      if (results.length >= maxResults) break
    }
  }

  return results
}

async function reverseAddress(lat: number, lng: number): Promise<AddressCandidate> {
  const url = new URL('https://dapi.kakao.com/v2/local/geo/coord2address.json')
  url.searchParams.set('x', String(lng))
  url.searchParams.set('y', String(lat))
  url.searchParams.set('input_coord', 'WGS84')
  const response = await fetch(url, { headers: kakaoHeaders() })
  if (!response.ok) throw new Error('현재 위치 주소를 확인하지 못했습니다.')
  const payload = (await response.json()) as { documents?: KakaoCoordDocument[] }
  const doc = payload.documents?.[0]
  if (!doc) throw new Error('이 위치의 주소를 찾지 못했습니다. 주소 검색을 이용해 주세요.')

  const road = doc.road_address
  const jibun = doc.address
  const address = road?.address_name || jibun?.address_name || ''
  if (!address) throw new Error('이 위치의 주소를 찾지 못했습니다. 주소 검색을 이용해 주세요.')

  const zonecode = road?.zone_no || jibun?.zone_no || ''
  const name = road?.building_name?.trim() || address

  return {
    id: `coord:${lng},${lat}`,
    name,
    address,
    zonecode,
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
