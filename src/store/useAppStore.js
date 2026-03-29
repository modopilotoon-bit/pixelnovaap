import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultClientes } from '../data/clientes'
import { defaultVideos } from '../data/videos'
import { defaultHerramientas } from '../data/herramientas'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      unlocked: false,
      currentUser: null, // 'RUSSELL' | 'DIEGO'
      unlock: (username) => set({ unlocked: true, currentUser: username }),
      lock: () => set({ unlocked: false, currentUser: null }),

      // Clientes
      clientes: defaultClientes,
      addCliente: (cliente) => set((s) => ({ clientes: [...s.clientes, { ...cliente, id: Date.now().toString() }] })),
      updateCliente: (id, data) => set((s) => ({
        clientes: s.clientes.map((c) => c.id === id ? { ...c, ...data } : c)
      })),
      deleteCliente: (id) => set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) })),

      // Pagos de clientes
      marcarPagado: (clienteId, pagoId) => set((s) => ({
        clientes: s.clientes.map((c) =>
          c.id === clienteId
            ? { ...c, pagos: c.pagos.map((p) => p.id === pagoId ? { ...p, estado: 'PAGADO', fechaPago: new Date().toISOString() } : p) }
            : c
        )
      })),
      addPago: (clienteId, pago) => set((s) => ({
        clientes: s.clientes.map((c) =>
          c.id === clienteId
            ? { ...c, pagos: [...c.pagos, { ...pago, id: Date.now().toString() }] }
            : c
        )
      })),

      // Cuentas de clientes
      updateCuenta: (clienteId, cuentaId, data) => set((s) => ({
        clientes: s.clientes.map((c) =>
          c.id === clienteId
            ? { ...c, cuentas: c.cuentas.map((cu) => cu.id === cuentaId ? { ...cu, ...data } : cu) }
            : c
        )
      })),
      addCuenta: (clienteId, cuenta) => set((s) => ({
        clientes: s.clientes.map((c) =>
          c.id === clienteId
            ? { ...c, cuentas: [...(c.cuentas || []), { ...cuenta, id: Date.now().toString() }] }
            : c
        )
      })),
      deleteCuenta: (clienteId, cuentaId) => set((s) => ({
        clientes: s.clientes.map((c) =>
          c.id === clienteId
            ? { ...c, cuentas: c.cuentas.filter((cu) => cu.id !== cuentaId) }
            : c
        )
      })),

      // Videos
      videos: defaultVideos,
      addVideo: (video) => set((s) => ({ videos: [...s.videos, { ...video, id: Date.now().toString() }] })),
      updateVideo: (id, data) => set((s) => ({
        videos: s.videos.map((v) => v.id === id ? { ...v, ...data } : v)
      })),
      deleteVideo: (id) => set((s) => ({ videos: s.videos.filter((v) => v.id !== id) })),
      avanzarEstado: (id) => {
        const estados = ['PENDIENTE', 'GRABADO', 'EN EDICIÓN', 'LISTO', 'APROBADO', 'PUBLICADO']
        set((s) => ({
          videos: s.videos.map((v) => {
            if (v.id !== id) return v
            const idx = estados.indexOf(v.estado)
            const nextEstado = idx < estados.length - 1 ? estados[idx + 1] : v.estado
            return {
              ...v,
              estado: nextEstado,
              fechaPublicacion: nextEstado === 'PUBLICADO' ? new Date().toISOString() : v.fechaPublicacion
            }
          })
        }))
      },

      // Herramientas
      herramientas: defaultHerramientas,
      updateHerramienta: (id, data) => set((s) => ({
        herramientas: s.herramientas.map((h) => h.id === id ? { ...h, ...data } : h)
      })),
      addHerramienta: (h) => set((s) => ({ herramientas: [...s.herramientas, { ...h, id: Date.now().toString() }] })),

      // Grabaciones tracker
      grabaciones: [
        { id: '1', clienteId: 'nicos-house', mes: '2026-04', numero: 1, tipo: 'Miércoles ambiente', fecha: '2026-04-01', completada: false },
        { id: '2', clienteId: 'nicos-house', mes: '2026-04', numero: 2, tipo: 'Viernes producto', fecha: '2026-04-04', completada: false },
      ],
      toggleGrabacion: (id) => set((s) => ({
        grabaciones: s.grabaciones.map((g) => g.id === id ? { ...g, completada: !g.completada } : g)
      })),

      // Historias tracker
      historias: [
        { id: '1', clienteId: 'nicos-house', mes: '2026-04', total: 20, publicadas: 0 }
      ],
      updateHistorias: (clienteId, mes, publicadas) => set((s) => ({
        historias: s.historias.map((h) =>
          h.clienteId === clienteId && h.mes === mes ? { ...h, publicadas } : h
        )
      })),

      // Reset
      resetAll: () => set({
        clientes: defaultClientes,
        videos: defaultVideos,
        herramientas: defaultHerramientas,
      }),

      exportData: () => {
        const s = get()
        return JSON.stringify({
          clientes: s.clientes,
          videos: s.videos,
          herramientas: s.herramientas,
          grabaciones: s.grabaciones,
          historias: s.historias,
        }, null, 2)
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json)
          set({
            clientes: data.clientes || defaultClientes,
            videos: data.videos || defaultVideos,
            herramientas: data.herramientas || defaultHerramientas,
            grabaciones: data.grabaciones || [],
            historias: data.historias || [],
          })
          return true
        } catch {
          return false
        }
      }
    }),
    {
      name: 'pixelnova-storage',
      partialize: (state) => ({
        clientes: state.clientes,
        videos: state.videos,
        herramientas: state.herramientas,
        grabaciones: state.grabaciones,
        historias: state.historias,
      })
    }
  )
)
