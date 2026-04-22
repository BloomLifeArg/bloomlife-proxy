const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── CREDENCIALES ──────────────────────────────────────────────────────────────
const ACCESS_TOKEN = process.env.TIENDANUBE_TOKEN;
const USER_ID = process.env.TIENDANUBE_USER_ID;
const BASE = 'https://api.tiendanube.com/v1/' + USER_ID;
const HEADERS = {
  'Authentication': 'bearer ' + ACCESS_TOKEN,
  'User-Agent': 'BloomLife Dashboard (sergio@bloomlife.co)',
  'Content-Type': 'application/json'
};

// ── TABLA DE COMBOS ───────────────────────────────────────────────────────────
const COMBO_COMPONENTES = {
  'Glow your Mind Combo | Tremella + Melena de león + Ashwagandha | Gummies y Capsuals': [
    { sku: 'TREMELLAGUMMIES', cantidad: 1 },
    { sku: 'MELENACAPSULAS', cantidad: 1 },
    { sku: 'ASHWAGANDHACAPSULAS', cantidad: 1 },
  ],
  'Balance Combo | Melena de León + Reishi + Ashwagandha | Capsulas y Gummies': [
    { sku: 'MELENACAPSULAS', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
    { sku: 'ASHWAGANDHAGUMMIES', cantidad: 1 },
  ],
  'Clear Mind Combo | Melena de León + Reishi + Ashwagandha | Gummies': [
    { sku: 'MELENAGUMMIES', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
    { sku: 'ASHWAGANDHAGUMMIES', cantidad: 1 },
  ],
  'Full Day Mix Combo | Melena de León capsulas + Cordyceps gummies + Ashwagandha capsulas': [
    { sku: 'MELENACAPSULAS', cantidad: 1 },
    { sku: 'CORDYCEPSGUMMIES', cantidad: 1 },
    { sku: 'ASHWAGANDHACAPSULAS', cantidad: 1 },
  ],
  'Beautiful Combo | Tremella Gummies x 3 meses': [
    { sku: 'TREMELLAGUMMIES', cantidad: 3 },
  ],
  'Calm & Glow Combo | Tremella + Reishi + Ashwagandha capsulas': [
    { sku: 'TREMELLAGUMMIES', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
    { sku: 'ASHWAGANDHACAPSULAS', cantidad: 1 },
  ],
  'Glory Gummies Combo | Tremella + Reishi + Ashwagandha + Melena de León + Cordyceps': [
    { sku: 'TREMELLAGUMMIES', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
    { sku: 'ASHWAGANDHAGUMMIES', cantidad: 1 },
    { sku: 'MELENAGUMMIES', cantidad: 1 },
    { sku: 'CORDYCEPSGUMMIES', cantidad: 1 },
  ],
  'Beauty & Balance Combo | Tremella + Reishi': [
    { sku: 'TREMELLAGUMMIES', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
  ],
  'Full Day Gummies 2 Combo | Melena de León + Cordyceps + Ashwagandha': [
    { sku: 'MELENAGUMMIES', cantidad: 1 },
    { sku: 'CORDYCEPSGUMMIES', cantidad: 1 },
    { sku: 'ASHWAGANDHAGUMMIES', cantidad: 1 },
  ],
  'Bye Bye Anxiety Combo | Ashwagandha + Melena de León | Gummies': [
    { sku: 'ASHWAGANDHAGUMMIES', cantidad: 1 },
    { sku: 'MELENAGUMMIES', cantidad: 1 },
  ],
  'Ultimate Balance Combo | Ashwagandha + Reishi + Cordyceps + Melena de León | Gummies': [
    { sku: 'ASHWAGANDHAGUMMIES', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
    { sku: 'CORDYCEPSGUMMIES', cantidad: 1 },
    { sku: 'MELENAGUMMIES', cantidad: 1 },
  ],
  'Full Day Gummies Combo | Melena de León + Cordyceps + Reishi': [
    { sku: 'MELENAGUMMIES', cantidad: 1 },
    { sku: 'CORDYCEPSGUMMIES', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
  ],
  'Clarity & Defense Combo | Melena de León + Reishi | Gummies': [
    { sku: 'MELENAGUMMIES', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
  ],
  'Go Strong Combo | Cordyceps + Reishi | Gummies': [
    { sku: 'CORDYCEPSGUMMIES', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
  ],
  'Deep Sleep Combo | Ashwagandha + Reishi | Gummies': [
    { sku: 'ASHWAGANDHAGUMMIES', cantidad: 1 },
    { sku: 'REISHIGUMMIES', cantidad: 1 },
  ],
  'Brain Health Combo | Melena de León Cápsulas x 3 meses': [
    { sku: 'MELENACAPSULAS', cantidad: 3 },
  ],
  'Hormonal Balance Combo | Ashwagandha Gummies x 3 meses': [
    { sku: 'ASHWAGANDHAGUMMIES', cantidad: 3 },
  ],
  'Bye Bye Anxiety Combo | Ashwagandha + Melena de León | Cápsulas': [
    { sku: 'ASHWAGANDHACAPSULAS', cantidad: 1 },
    { sku: 'MELENACAPSULAS', cantidad: 1 },
  ],
  'High Performance Combo | Melena de León + Cordyceps | Gummies': [
    { sku: 'MELENAGUMMIES', cantidad: 1 },
    { sku: 'CORDYCEPSGUMMIES', cantidad: 1 },
  ],
  'Energy Support Combo | Cordyceps Gummies x 3 meses': [
    { sku: 'CORDYCEPSGUMMIES', cantidad: 3 },
  ],
  'Relaxation Combo | Reishi Gummies por 3 meses': [
    { sku: 'REISHIGUMMIES', cantidad: 3 },
  ],
  'Combo Hormonal Balance | Ashwagandha Cápsulas x 3 meses': [
    { sku: 'ASHWAGANDHACAPSULAS', cantidad: 3 },
  ],
  'Brain Health Combo | Melena de León Gummies x 3 meses': [
    { sku: 'MELENAGUMMIES', cantidad: 3 },
  ],
};

// ── FUNCIONES DE STOCK ────────────────────────────────────────────────────────

async function buscarVariantePorSKU(sku) {
  const res = await fetch(BASE + '/products?per_page=200', { headers: HEADERS });
  const productos = await res.json();
  for (const p of productos) {
    for (const v of p.variants || []) {
      if (v.sku === sku) return { producto: p, variante: v };
    }
  }
  return null;
}

async function descontarStockPorSKU(sku, cantidad) {
  const encontrado = await buscarVariantePorSKU(sku);
  if (!encontrado) {
    console.error(`[STOCK] SKU no encontrado: "${sku}"`);
    return { ok: false, motivo: 'SKU no encontrado' };
  }
  const { producto, variante } = encontrado;
  const stockActual = variante.stock;
  if (stockActual === null || stockActual === undefined) {
    console.log(`[STOCK] SKU "${sku}" no maneja stock, se omite`);
    return { ok: true, motivo: 'Sin control de stock' };
  }
  const nuevoStock = Math.max(0, stockActual - cantidad);
  const updateRes = await fetch(BASE + `/products/${producto.id}/variants/${variante.id}`, {
    method: 'PUT', headers: HEADERS, body: JSON.stringify({ stock: nuevoStock })
  });
  if (updateRes.ok) {
    console.log(`[STOCK] ✓ Descuento SKU "${sku}": ${stockActual} → ${nuevoStock}`);
    return { ok: true, anterior: stockActual, nuevo: nuevoStock };
  } else {
    const err = await updateRes.text();
    console.error(`[STOCK] ✗ Error descontando SKU "${sku}":`, err);
    return { ok: false, motivo: err };
  }
}

async function reintegrarStockPorSKU(sku, cantidad) {
  const encontrado = await buscarVariantePorSKU(sku);
  if (!encontrado) {
    console.error(`[STOCK] SKU no encontrado para reintegro: "${sku}"`);
    return { ok: false, motivo: 'SKU no encontrado' };
  }
  const { producto, variante } = encontrado;
  const stockActual = variante.stock;
  if (stockActual === null || stockActual === undefined) {
    console.log(`[STOCK] SKU "${sku}" no maneja stock, se omite`);
    return { ok: true, motivo: 'Sin control de stock' };
  }
  const nuevoStock = stockActual + cantidad;
  const updateRes = await fetch(BASE + `/products/${producto.id}/variants/${variante.id}`, {
    method: 'PUT', headers: HEADERS, body: JSON.stringify({ stock: nuevoStock })
  });
  if (updateRes.ok) {
    console.log(`[STOCK] ✓ Reintegro SKU "${sku}": ${stockActual} → ${nuevoStock}`);
    return { ok: true, anterior: stockActual, nuevo: nuevoStock };
  } else {
    const err = await updateRes.text();
    console.error(`[STOCK] ✗ Error reintegrando SKU "${sku}":`, err);
    return { ok: false, motivo: err };
  }
}

async function procesarOrden(orden, operacion) {
  // Si la orden no trae productos, la buscamos en la API
  if (!orden.products || orden.products.length === 0) {
    const ordenId = orden.id;
    console.log(`[WEBHOOK] Buscando productos de orden #${ordenId} en la API...`);
    const res = await fetch(BASE + `/orders/${ordenId}`, { headers: HEADERS });
    const ordenCompleta = await res.json();
    orden = ordenCompleta;
    console.log(`[WEBHOOK] Productos encontrados: ${(ordenCompleta.products||[]).map(p=>p.name?.es||p.name?.en||"?").join(", ")}`);
  }
  const productos = orden.products || [];
  const log = [];
  for (const item of productos) {
    const nombreProducto = item.name?.es || item.name?.en || Object.values(item.name || {})[0] || '';
    const cantidadVendida = item.quantity || 1;
    const componentes = COMBO_COMPONENTES[nombreProducto.trim()];
    if (componentes) {
      console.log(`[WEBHOOK] Combo detectado (${operacion}): "${nombreProducto}" (x${cantidadVendida})`);
      for (const comp of componentes) {
        const resultado = operacion === 'descontar'
          ? await descontarStockPorSKU(comp.sku, comp.cantidad * cantidadVendida)
          : await reintegrarStockPorSKU(comp.sku, comp.cantidad * cantidadVendida);
        log.push({ combo: nombreProducto, sku: comp.sku, ...resultado });
      }
    }
  }
  return log;
}

// ── WEBHOOK ORDEN PAGADA ──────────────────────────────────────────────────────
app.post('/webhook/orden-pagada', async (req, res) => {
  res.status(200).json({ recibido: true });
  try {
    const orden = req.body;
    const ordenId = orden.id || orden.number || 'desconocida';
    console.log(`[WEBHOOK] Orden pagada: #${ordenId}`);
    const resultados = await procesarOrden(orden, 'descontar');
    console.log(`[WEBHOOK] Orden #${ordenId}: ${resultados.length} operaciones procesadas`);
  } catch (e) {
    console.error('[WEBHOOK] Error procesando orden pagada:', e.message);
  }
});

// ── WEBHOOK ORDEN CANCELADA ───────────────────────────────────────────────────
app.post('/webhook/orden-cancelada', async (req, res) => {
  res.status(200).json({ recibido: true });
  try {
    const orden = req.body;
    const ordenId = orden.id || orden.number || 'desconocida';
    console.log(`[WEBHOOK] Orden cancelada: #${ordenId}`);
    const resultados = await procesarOrden(orden, 'reintegrar');
    console.log(`[WEBHOOK] Orden #${ordenId}: ${resultados.length} reintegros procesados`);
  } catch (e) {
    console.error('[WEBHOOK] Error procesando orden cancelada:', e.message);
  }
});

// ── ENDPOINTS DE DIAGNÓSTICO ──────────────────────────────────────────────────
app.get('/combos', (req, res) => {
  const lista = Object.entries(COMBO_COMPONENTES).map(([combo, comps]) => ({ combo, componentes: comps }));
  res.json({ total: lista.length, combos: lista });
});

app.get('/registrar-webhook', async (req, res) => {
  try {
    const response = await fetch(BASE + '/webhooks', {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify({ event: 'order/paid', url: 'https://bloomlife-proxy.onrender.com/webhook/orden-pagada' })
    });
    const data = await response.json();
    res.json(response.ok
      ? { ok: true, mensaje: '✓ Webhook order/paid registrado', detalle: data }
      : { ok: false, mensaje: 'Error al registrar', detalle: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/registrar-webhook-cancelacion', async (req, res) => {
  try {
    const response = await fetch(BASE + '/webhooks', {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify({ event: 'order/cancelled', url: 'https://bloomlife-proxy.onrender.com/webhook/orden-cancelada' })
    });
    const data = await response.json();
    res.json(response.ok
      ? { ok: true, mensaje: '✓ Webhook order/cancelled registrado', detalle: data }
      : { ok: false, mensaje: 'Error al registrar', detalle: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/ver-webhooks', async (req, res) => {
  try {
    const response = await fetch(BASE + '/webhooks', { headers: HEADERS });
    res.json(await response.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── STOCK DE SUPLEMENTOS INDIVIDUALES ────────────────────────────────────────
const SKUS_SUPLEMENTOS = [
  'TREMELLAGUMMIES', 'REISHIGUMMIES', 'ASHWAGANDHAGUMMIES',
  'MELENAGUMMIES', 'CORDYCEPSGUMMIES', 'ASHWAGANDHACAPSULAS', 'MELENACAPSULAS'
];

app.get('/stock-suplementos', async (req, res) => {
  try {
    const response = await fetch(BASE + '/products?per_page=200', { headers: HEADERS });
    const productos = await response.json();
    const suplementos = [];
    for (const p of productos) {
      for (const v of p.variants || []) {
        if (SKUS_SUPLEMENTOS.includes(v.sku)) {
          const nombre = p.name?.es || p.name?.en || Object.values(p.name || {})[0] || '';
          suplementos.push({ sku: v.sku, nombre, stock: v.stock !== null && v.stock !== undefined ? v.stock : 'sin control' });
        }
      }
    }
    suplementos.sort((a, b) => a.sku.localeCompare(b.sku));
    res.json({ total: suplementos.length, suplementos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PROXY PARA EL DASHBOARD ───────────────────────────────────────────────────
app.get('/api/*', async (req, res) => {
  try {
    const apiPath = req.params[0];
    const query = req.url.split('?')[1] ? '?' + req.url.split('?')[1] : '';
    const url = BASE + '/' + apiPath + query;
    const response = await fetch(url, { headers: HEADERS });
    res.json(await response.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
