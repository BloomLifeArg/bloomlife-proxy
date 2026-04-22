const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── CREDENCIALES ──────────────────────────────────────────────────────────────
// El token y user ID se leen desde variables de entorno de Render.
// En Render: Environment → Add Environment Variable
//   TIENDANUBE_TOKEN = 8c2c0a239d7c4c1003edd283fb8f231e3626b45f
//   TIENDANUBE_USER_ID = 4969223
const ACCESS_TOKEN = process.env.TIENDANUBE_TOKEN;
const USER_ID = process.env.TIENDANUBE_USER_ID;
const BASE = 'https://api.tiendanube.com/v1/' + USER_ID;
const HEADERS = {
  'Authentication': 'bearer ' + ACCESS_TOKEN,
  'User-Agent': 'BloomLife Dashboard (sergio@bloomlife.co)',
  'Content-Type': 'application/json'
};

// ── TABLA DE COMBOS ───────────────────────────────────────────────────────────
// Cada combo indica qué productos descuenta y en qué cantidad.
// Los nombres deben coincidir EXACTAMENTE con los nombres en Tienda Nube.
// Si agregás un combo nuevo, añadí una entrada acá con el mismo formato.
const COMBO_COMPONENTES = {
  'Glow your Mind Combo | Tremella + Melena de león + Ashwagandha | Gummies y Capsuals': [
    { nombre: 'Tremella | Hongo de la Belleza | Gummies', cantidad: 1 },
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 1 },
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
  ],
  'Balance Combo | Melena de León + Reishi + Ashwagandha | Capsulas y Gummies': [
    { nombre: 'Melena de León | Claridad Mental | Cápsulas', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
  ],
  'Clear Mind Combo | Melena de León + Reishi + Ashwagandha | Gummies': [
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
  ],
  'Full Day Mix Combo | Melena de León capsulas + Cordyceps gummies + Ashwagandha capsulas': [
    { nombre: 'Melena de León | Claridad Mental | Cápsulas', cantidad: 1 },
    { nombre: 'Cordyceps | Energía Sostenida | Gummies', cantidad: 1 },
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Cápsulas', cantidad: 1 },
  ],
  'Beautiful Combo | Tremella Gummies x 3 meses': [
    { nombre: 'Tremella | Hongo de la Belleza | Gummies', cantidad: 3 },
  ],
  'Calm & Glow Combo | Tremella + Reishi + Ashwagandha capsulas': [
    { nombre: 'Tremella | Hongo de la Belleza | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Cápsulas', cantidad: 1 },
  ],
  'Glory Gummies Combo | Tremella + Reishi + Ashwagandha + Melena de León + Cordyceps': [
    { nombre: 'Tremella | Hongo de la Belleza | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 1 },
    { nombre: 'Cordyceps | Energía Sostenida | Gummies', cantidad: 1 },
  ],
  'Beauty & Balance Combo | Tremella + Reishi': [
    { nombre: 'Tremella | Hongo de la Belleza | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
  ],
  'Full Day Gummies 2 Combo | Melena de León + Cordyceps + Ashwagandha': [
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 1 },
    { nombre: 'Cordyceps | Energía Sostenida | Gummies', cantidad: 1 },
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
  ],
  'Bye Bye Anxiety Combo | Ashwagandha + Melena de León | Gummies': [
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 1 },
  ],
  'Combo Relax Duo | Magnesio + Ashwagandha | Gummies': [
    { nombre: 'Magnesio | Gummies', cantidad: 1 },
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
  ],
  'Combo Deep Sleep | Ashwagandha + Reishi + Magnesio': [
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
    { nombre: 'Magnesio | Gummies', cantidad: 1 },
  ],
  'Ultimate Balance Combo | Ashwagandha + Reishi + Cordyceps + Melena de León | Gummies': [
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
    { nombre: 'Cordyceps | Energía Sostenida | Gummies', cantidad: 1 },
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 1 },
  ],
  'Full Day Gummies Combo | Melena de León + Cordyceps + Reishi': [
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 1 },
    { nombre: 'Cordyceps | Energía Sostenida | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
  ],
  'Clarity & Defense Combo | Melena de León + Reishi | Gummies': [
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
  ],
  'Go Strong Combo | Cordyceps + Reishi | Gummies': [
    { nombre: 'Cordyceps | Energía Sostenida | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
  ],
  'Deep Sleep Combo | Ashwagandha + Reishi | Gummies': [
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 1 },
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 1 },
  ],
  'Brain Health Combo | Melena de León Cápsulas x 3 meses': [
    { nombre: 'Melena de León | Claridad Mental | Cápsulas', cantidad: 3 },
  ],
  'Hormonal Balance Combo | Ashwagandha Gummies x 3 meses': [
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Gummies', cantidad: 3 },
  ],
  'Bye Bye Anxiety Combo | Ashwagandha + Melena de León | Cápsulas': [
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Cápsulas', cantidad: 1 },
    { nombre: 'Melena de León | Claridad Mental | Cápsulas', cantidad: 1 },
  ],
  'High Performance Combo | Melena de León + Cordyceps | Gummies': [
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 1 },
    { nombre: 'Cordyceps | Energía Sostenida | Gummies', cantidad: 1 },
  ],
  'Energy Support Combo | Cordyceps Gummies x 3 meses': [
    { nombre: 'Cordyceps | Energía Sostenida | Gummies', cantidad: 3 },
  ],
  'Relaxation Combo | Reishi Gummies por 3 meses': [
    { nombre: 'Reishi | Descanso Profundo | Gummies', cantidad: 3 },
  ],
  'Combo Hormonal Balance | Ashwagandha Cápsulas x 3 meses': [
    { nombre: 'Ashwagandha | Equilibrio Hormonal | Cápsulas', cantidad: 3 },
  ],
  'Brain Health Combo | Melena de León Gummies x 3 meses': [
    { nombre: 'Melena de León | Claridad Mental | Gummies', cantidad: 3 },
  ],
};

// ── FUNCIONES DE STOCK ────────────────────────────────────────────────────────

// Busca el ID de un producto en Tienda Nube por su nombre exacto
async function buscarProductoPorNombre(nombre) {
  const url = BASE + '/products?per_page=200';
  const res = await fetch(url, { headers: HEADERS });
  const productos = await res.json();
  return productos.find(p => {
    const n = p.name?.es || p.name?.en || Object.values(p.name || {})[0] || '';
    return n.trim() === nombre.trim();
  });
}

// Descuenta stock de un producto individual en Tienda Nube
async function descontarStock(productoNombre, cantidad) {
  const producto = await buscarProductoPorNombre(productoNombre);
  if (!producto) {
    console.error(`[STOCK] Producto no encontrado: "${productoNombre}"`);
    return { ok: false, motivo: 'Producto no encontrado' };
  }
  const variante = producto.variants?.[0];
  if (!variante) {
    console.error(`[STOCK] Sin variante para: "${productoNombre}"`);
    return { ok: false, motivo: 'Sin variante' };
  }
  const stockActual = variante.stock;
  if (stockActual === null || stockActual === undefined) {
    console.log(`[STOCK] "${productoNombre}" no maneja stock, se omite`);
    return { ok: true, motivo: 'Sin control de stock' };
  }
  const nuevoStock = Math.max(0, stockActual - cantidad);
  const url = BASE + `/products/${producto.id}/variants/${variante.id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ stock: nuevoStock })
  });
  if (res.ok) {
    console.log(`[STOCK] ✓ "${productoNombre}": ${stockActual} → ${nuevoStock}`);
    return { ok: true, anterior: stockActual, nuevo: nuevoStock };
  } else {
    const err = await res.text();
    console.error(`[STOCK] ✗ Error actualizando "${productoNombre}":`, err);
    return { ok: false, motivo: err };
  }
}

// Procesa una orden: busca combos y descuenta stock de cada componente
async function procesarOrden(orden) {
  const productos = orden.products || [];
  const log = [];

  for (const item of productos) {
    const nombreProducto = item.name?.es || item.name?.en || Object.values(item.name || {})[0] || '';
    const cantidadVendida = item.quantity || 1;
    const componentes = COMBO_COMPONENTES[nombreProducto.trim()];

    if (componentes) {
      console.log(`[WEBHOOK] Combo detectado: "${nombreProducto}" (x${cantidadVendida})`);
      for (const comp of componentes) {
        const resultado = await descontarStock(comp.nombre, comp.cantidad * cantidadVendida);
        log.push({ combo: nombreProducto, componente: comp.nombre, ...resultado });
      }
    }
  }

  return log;
}

// ── WEBHOOK DE TIENDA NUBE ────────────────────────────────────────────────────
// Tienda Nube llama a esta URL cada vez que se paga una orden.
// Configurarlo en: Tienda Nube → Configuración → Notificaciones → Webhooks
//   Evento: order/paid
//   URL: https://TU-APP.onrender.com/webhook/orden-pagada
app.post('/webhook/orden-pagada', async (req, res) => {
  // Respondemos rápido para que Tienda Nube no reintente
  res.status(200).json({ recibido: true });

  try {
    const orden = req.body;
    const ordenId = orden.id || orden.number || 'desconocida';
    console.log(`[WEBHOOK] Orden recibida: #${ordenId}`);

    const resultados = await procesarOrden(orden);

    if (resultados.length === 0) {
      console.log(`[WEBHOOK] Orden #${ordenId}: sin combos, nada que descontar`);
    } else {
      console.log(`[WEBHOOK] Orden #${ordenId}: ${resultados.length} descuentos procesados`);
    }
  } catch (e) {
    console.error('[WEBHOOK] Error procesando orden:', e.message);
  }
});

// ── ENDPOINT DE DIAGNÓSTICO ───────────────────────────────────────────────────
// Visitá https://bloomlife-proxy.onrender.com/combos para ver la tabla cargada
app.get('/combos', (req, res) => {
  const lista = Object.entries(COMBO_COMPONENTES).map(([combo, comps]) => ({
    combo,
    componentes: comps
  }));
  res.json({ total: lista.length, combos: lista });
});

// ── REGISTRO DE WEBHOOK ───────────────────────────────────────────────────────
// Visitá https://bloomlife-proxy.onrender.com/registrar-webhook UNA SOLA VEZ
// para que Tienda Nube empiece a avisar al servidor cuando se paga una orden.
app.get('/registrar-webhook', async (req, res) => {
  try {
    const url = BASE + '/webhooks';
    const body = {
      event: 'order/paid',
      url: 'https://bloomlife-proxy.onrender.com/webhook/orden-pagada'
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok) {
      res.json({ ok: true, mensaje: '✓ Webhook registrado correctamente', detalle: data });
    } else {
      res.json({ ok: false, mensaje: 'Error al registrar', detalle: data });
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── VER WEBHOOKS REGISTRADOS ──────────────────────────────────────────────────
// Visitá https://bloomlife-proxy.onrender.com/ver-webhooks para confirmar
app.get('/ver-webhooks', async (req, res) => {
  try {
    const response = await fetch(BASE + '/webhooks', { headers: HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PROXY PARA EL DASHBOARD (igual que antes) ─────────────────────────────────
app.get('/api/*', async (req, res) => {
  try {
    const apiPath = req.params[0];
    const query = req.url.split('?')[1] ? '?' + req.url.split('?')[1] : '';
    const url = BASE + '/' + apiPath + query;
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
