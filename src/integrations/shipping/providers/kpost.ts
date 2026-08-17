import { ShippingNotImplementedError, type ShippingProvider } from '../types'

export const kpostShippingProvider: ShippingProvider = {
  id: 'kpost',
  async requestLabel() {
    throw new ShippingNotImplementedError()
  },
}

export const KPOST_ENV = {
  KPOST_API_KEY: 'KPOST_API_KEY',
  KPOST_CONTRACT_NO: 'KPOST_CONTRACT_NO',
} as const
