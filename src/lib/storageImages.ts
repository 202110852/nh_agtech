import { supabase } from './supabase'

export const PUBLIC_IMAGES_BUCKET = 'product-images'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_IMAGE_EDGE = 1920
const WEBP_QUALITY = 0.82
const JPEG_QUALITY = 0.85

function mimeFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'heic' || ext === 'heif') return 'image/heic'
  return ''
}

function extensionForType(type: string) {
  if (type === 'image/webp') return 'webp'
  if (type === 'image/png') return 'png'
  if (type === 'image/gif') return 'gif'
  return 'jpg'
}

let webpEncoding: boolean | null = null

function supportsWebpEncoding() {
  if (webpEncoding == null) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    webpEncoding = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  }
  return webpEncoding
}

async function loadImageSource(file: File) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    return { source: bitmap, width: bitmap.width, height: bitmap.height }
  } catch {
    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      const url = URL.createObjectURL(file)
      image.onload = () => {
        URL.revokeObjectURL(url)
        resolve(image)
      }
      image.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('이미지를 읽을 수 없습니다.'))
      }
      image.src = url
    })
    return { source: loaded, width: loaded.naturalWidth, height: loaded.naturalHeight }
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (next) => (next ? resolve(next) : reject(new Error('이미지를 변환할 수 없습니다.'))),
      type,
      quality,
    )
  })
}

async function rasterToWebp(file: File) {
  const { source, width, height } = await loadImageSource(file)
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이미지를 변환할 수 없습니다.')
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  if ('close' in source && typeof source.close === 'function') source.close()

  const useWebp = supportsWebpEncoding()
  const type = useWebp ? 'image/webp' : 'image/jpeg'
  const quality = useWebp ? WEBP_QUALITY : JPEG_QUALITY
  const blob = await canvasToBlob(canvas, type, quality)
  const ext = extensionForType(blob.type || type)
  return new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: blob.type || type })
}

export async function preparePublicImage(file: File) {
  const type = (file.type || mimeFromName(file.name)).toLowerCase()
  if (type && !type.startsWith('image/')) return '이미지 파일만 업로드할 수 있습니다.'
  try {
    const converted = await rasterToWebp(file)
    if (converted.size > MAX_IMAGE_BYTES) return '이미지가 너무 큽니다. 다른 사진을 선택하세요.'
    return converted
  } catch {
    return '이 기기에서 해당 사진을 변환할 수 없습니다. JPEG 또는 PNG로 선택하세요.'
  }
}

function pathFromPublicUrl(url: string | null) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const prefix = `/storage/v1/object/public/${PUBLIC_IMAGES_BUCKET}/`
    if (!parsed.pathname.startsWith(prefix)) return null
    return decodeURIComponent(parsed.pathname.slice(prefix.length))
  } catch {
    return null
  }
}

export async function uploadFarmImage(farmId: string, file: File, folder?: string) {
  const ext = extensionForType(file.type)
  const path = folder
    ? `${farmId}/${folder}/${crypto.randomUUID()}.${ext}`
    : `${farmId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(PUBLIC_IMAGES_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from(PUBLIC_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function deletePublicImage(url: string | null) {
  const path = pathFromPublicUrl(url)
  if (!path) return
  await supabase.storage.from(PUBLIC_IMAGES_BUCKET).remove([path])
}
