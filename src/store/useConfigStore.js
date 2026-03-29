import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useConfigStore = create(
  persist(
    (set) => ({
      precios: { basico: 3500, pro: 4000, premium: 4500 },
      updatePrecios: (precios) => set({ precios }),

      reparto: { russell: 63, diego: 37 },
      updateReparto: (reparto) => set({ reparto }),

      socios: { s1: 'Russell', s2: 'Diego' },
      updateSocios: (socios) => set({ socios }),
    }),
    { name: 'pixelnova-config' }
  )
)
