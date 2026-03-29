import { useAppStore } from './useAppStore'

export function useIsAdmin() {
  return useAppStore((s) => s.currentUser === 'RUSSELL')
}
