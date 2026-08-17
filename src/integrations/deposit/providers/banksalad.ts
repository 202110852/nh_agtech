import { NotImplementedError, type DepositProvider } from '../types'

export const banksaladDepositProvider: DepositProvider = {
  id: 'banksalad',
  async poll() {
    throw new NotImplementedError('뱅크샐러드')
  },
}
