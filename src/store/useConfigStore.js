import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncWrite, syncSubscribe } from '../lib/syncService'

let unsubscribe = null

export const useConfigStore = create(
  persist(
    (set, get) => ({
      precios: { basico: 3500, pro: 4000, premium: 4500 },
      reparto: { russell: 63, diego: 37 },
      socios: { s1: 'Russell', s2: 'Diego' },

      subscribeToFirebase: () => {
        if (unsubscribe) return
        unsubscribe = syncSubscribe('pixelnova', 'configData', (data) => {
          set({
            precios: data.precios || get().precios,
            reparto: data.reparto || get().reparto,
            socios: data.socios || get().socios,
          })
        })
      },

      _sync: () => {
        const s = get()
        syncWrite('pixelnova', 'configData', { precios: s.precios, reparto: s.reparto, socios: s.socios })
      },

      updatePrecios: (precios) => {
        set({ precios })
        get()._sync()
      },
      updateReparto: (reparto) => {
        set({ reparto })
        get()._sync()
      },
      updateSocios: (socios) => {
        set({ socios })
        get()._sync()
      },
    }),
    { name: 'pixelnova-config' }
  )
)
