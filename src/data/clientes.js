export const defaultClientes = [
  {
    id: 'nicos-house',
    nombre: "Nico's House",
    descripcion: 'Hamburguesas, Hotdogs & Malteadas',
    propietario: 'Armando Macías Bibriesca',
    telefono: '+52 998 490 7644',
    email: 'nicoshousecancun@gmail.com',
    direccion: 'Cancún, Quintana Roo (drive-thru y delivery)',
    instagram: '',
    tiktok: '',
    paquete: 'Básico',
    precioMensual: 3500,
    fechaInicio: '2026-04-01',
    vigenciaMinima: 3,
    estado: 'ACTIVO',
    diasGrabacion: [
      { dia: 'Miércoles', hora: '4:10 PM', tipo: 'Local activo con clientes (ambiente)' },
      { dia: 'Viernes', hora: '6:00 PM', tipo: 'Local tranquilo, tomas de producto' },
    ],
    notas: 'Primera grabación: Viernes 4 de abril 2026. Primeras publicaciones: Lunes 6 de abril 2026.',
    noIncluye: [
      'Gestión de DMs ni atención a clientes por chat',
      'Diseños avanzados en Canva (menús, carteles, branding completo)',
      'Historias avanzadas con animaciones o diseño premium',
    ],
    cuentas: [
      { id: 'c1', plataforma: 'Meta Business Suite', usuario: '', password: '', url: 'https://business.facebook.com', notas: '' },
      { id: 'c2', plataforma: 'TikTok Business Center', usuario: '', password: '', url: 'https://ads.tiktok.com', notas: '' },
      { id: 'c3', plataforma: 'Canva (carpeta de marca)', usuario: '', password: '', url: 'https://canva.com', notas: '' },
    ],
    pagos: [
      { id: 'p1', concepto: 'Anticipo mes 1 (50%)', monto: 1750, fechaEsperada: '2026-03-28', estado: 'PAGADO', fechaPago: '2026-03-28T00:00:00.000Z' },
      { id: 'p2', concepto: 'Saldo mes 1', monto: 1750, fechaEsperada: '2026-04-01', estado: 'PENDIENTE', fechaPago: null },
      { id: 'p3', concepto: 'Mes 2 completo', monto: 3500, fechaEsperada: '2026-05-01', estado: 'PENDIENTE', fechaPago: null },
      { id: 'p4', concepto: 'Mes 3 completo', monto: 3500, fechaEsperada: '2026-06-01', estado: 'PENDIENTE', fechaPago: null },
    ],
  }
]
