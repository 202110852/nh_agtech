import { NotImplementedError, type DepositProvider } from '../types'

export const codefDepositProvider: DepositProvider = {
  id: 'codef',
  async poll() {
    throw new NotImplementedError('코드에프')
  },
}
