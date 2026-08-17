import { NotImplementedError, type DepositProvider } from '../types'

export const hectoDepositProvider: DepositProvider = {
  id: 'hecto',
  async poll() {
    throw new NotImplementedError('헥토파이낸셜')
  },
}
