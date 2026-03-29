import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncWrite, syncSubscribe } from '../lib/syncService'

const defaultIngresos = [
  { id: '1', mes: '2026-04', clienteId: 'nicos-house', concepto: "Nico's House — Paquete Básico", monto: 3500, cobrado: 1750 }
]

const defaultGastos = [
  { id: '1', mes: '2026-04', nombre: 'Canva Pro', monto: 170, categoria: 'Apps y herramientas', fecha: '2026-04-01' },
  { id: '2', mes: '2026-04', nombre: 'TikTok Ads boost', monto: 300, categoria: 'TikTok Ads', fecha: '2026-04-01' },
]

let unsubscribe = null

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      ingresos: defaultIngresos,
      gastos: defaultGastos,

      subscribeToFirebase: () => {
        if (unsubscribe) return
        unsubscribe = syncSubscribe('pixelnova', 'financeData', (data) => {
          set({
            ingresos: data.ingresos || get().ingresos,
            gastos: data.gastos || get().gastos,
          })
        })
      },

      _sync: () => {
        const s = get()
        syncWrite('pixelnova', 'financeData', { ingresos: s.ingresos, gastos: s.gastos })
      },

      addIngreso: (ingreso) => {
        set((s) => ({ ingresos: [...s.ingresos, { ...ingreso, id: Date.now().toString() }] }))
        get()._sync()
      },
      updateIngreso: (id, data) => {
        set((s) => ({ ingresos: s.ingresos.map((i) => i.id === id ? { ...i, ...data } : i) }))
        get()._sync()
      },
      deleteIngreso: (id) => {
        set((s) => ({ ingresos: s.ingresos.filter((i) => i.id !== id) }))
        get()._sync()
      },

      addGasto: (gasto) => {
        set((s) => ({ gastos: [...s.gastos, { ...gasto, id: Date.now().toString() }] }))
        get()._sync()
      },
      updateGasto: (id, data) => {
        set((s) => ({ gastos: s.gastos.map((g) => g.id === id ? { ...g, ...data } : g) }))
        get()._sync()
      },
      deleteGasto: (id) => {
        set((s) => ({ gastos: s.gastos.filter((g) => g.id !== id) }))
        get()._sync()
      },
    }),
    { name: 'pixelnova-finance' }
  )
)
