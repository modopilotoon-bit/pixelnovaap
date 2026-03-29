import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultIngresos = [
  {
    id: '1',
    mes: '2026-04',
    clienteId: 'nicos-house',
    concepto: "Nico's House — Paquete Básico",
    monto: 3500,
    cobrado: 1750,
  }
]

const defaultGastos = [
  { id: '1', mes: '2026-04', nombre: 'Canva Pro', monto: 170, categoria: 'Apps y herramientas', fecha: '2026-04-01' },
  { id: '2', mes: '2026-04', nombre: 'TikTok Ads boost', monto: 300, categoria: 'TikTok Ads', fecha: '2026-04-01' },
]

export const useFinanceStore = create(
  persist(
    (set) => ({
      ingresos: defaultIngresos,
      gastos: defaultGastos,

      addIngreso: (ingreso) => set((s) => ({ ingresos: [...s.ingresos, { ...ingreso, id: Date.now().toString() }] })),
      updateIngreso: (id, data) => set((s) => ({ ingresos: s.ingresos.map((i) => i.id === id ? { ...i, ...data } : i) })),
      deleteIngreso: (id) => set((s) => ({ ingresos: s.ingresos.filter((i) => i.id !== id) })),

      addGasto: (gasto) => set((s) => ({ gastos: [...s.gastos, { ...gasto, id: Date.now().toString() }] })),
      updateGasto: (id, data) => set((s) => ({ gastos: s.gastos.map((g) => g.id === id ? { ...g, ...data } : g) })),
      deleteGasto: (id) => set((s) => ({ gastos: s.gastos.filter((g) => g.id !== id) })),
    }),
    { name: 'pixelnova-finance' }
  )
)
