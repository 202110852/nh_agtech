import { createContext, useContext } from 'react'
import type { NavItem } from './BottomNav'

interface NavContextValue {
  mobileSettingsItem?: NavItem
}

export const NavContext = createContext<NavContextValue>({})

export function useNavContext() {
  return useContext(NavContext)
}
