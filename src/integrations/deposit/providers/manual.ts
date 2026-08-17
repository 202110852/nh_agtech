import type { DepositProvider, PolledDeposit } from '../types'

export const manualDepositProvider: DepositProvider = {
  id: 'manual',
  async poll(): Promise<PolledDeposit[]> {
    return []
  },
}
