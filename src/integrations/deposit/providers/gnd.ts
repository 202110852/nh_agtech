import { NotImplementedError, type DepositProvider } from '../types'

export const gndDepositProvider: DepositProvider = {
  id: 'gnd',
  async poll() {
    throw new NotImplementedError('GND')
  },
}
