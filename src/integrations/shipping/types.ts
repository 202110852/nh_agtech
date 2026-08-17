export type ShippingProviderId = 'kpost'

export interface LabelRequest {
  orderId: string
  recipientName: string
  recipientPhone: string
  zonecode?: string | null
  address: string
  addressDetail?: string | null
}

export interface LabelResult {
  trackingNumber: string
  raw: Record<string, unknown>
}

export interface ShippingProvider {
  id: ShippingProviderId
  requestLabel(payload: LabelRequest): Promise<LabelResult>
}

export class ShippingNotImplementedError extends Error {
  constructor() {
    super('우체국 택배 API 연동은 아직 구현되지 않았습니다.')
    this.name = 'ShippingNotImplementedError'
  }
}
