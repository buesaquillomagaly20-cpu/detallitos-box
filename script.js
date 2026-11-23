const E = ["Pendiente", "En proceso", "Completado", "Cancelado"];

const M = {
  inicio: { t: "Panel principal", i: "🏠" },
  clientes: { t: "Clientes y CRM", i: "👥", d: "Administra clientes, empresas, contactos y oportunidades comerciales.",
    f: [["nombre","Nombre / empresa","text"],["email","Correo","text"],["tel","Teléfono","text"],["estado","Estado","select",["Prospecto","Activo","Inactivo"]]] },
  productos: { t: "Productos", i: "🎁", d: "Gestiona el catálogo, categorías, precios y costos.",
    f: [["nombre","Producto","text"],["cat","Categoría","select",["Cajas regalo","Desayunos","Peluches","Flores","Otros"]],["costo","Costo ($)","number"],["precio","Precio ($)","number"]] },
  inventario: { t: "Inventario", i: "📦", d: "Controla existencias y alertas de stock mínimo.",
    f: [["producto","Producto","text"],["stock","Stock actual","number"],["min","Stock mínimo","number"]] },
  proveedores: { t: "Proveedores", i: "🚚", d: "Administra los datos y contactos de tus proveedores.",
    f: [["nombre","Proveedor","text"],["contacto","Contacto","text"],["tel","Teléfono","text"],["rubro","Rubro","text"]] },
  compras: { t: "Compras", i: "🛒", d: "Registra compras y productos adquiridos.",
    f: [["fecha","Fecha","date"],["proveedor","Proveedor","text"],["detalle","Detalle","text"],["total","Total ($)","number"]] },
  ventas: { t: "Ventas", i: "💰", d: "Administra ventas, pedidos y productos vendidos.",
    f: [["fecha","Fecha","date"],["cliente","Cliente","text"],["producto","Producto","text"],["cant","Cantidad","number"],["total","Total ($)","number"],["estado","Estado","select",E]] },
  cotizaciones: { t: "Cotizaciones", i: "📄", d: "Elabora y administra cotizaciones para clientes.",
    f: [["fecha","Fecha","date"],["cliente","Cliente","text"],["detalle","Descripción","text"],["total","Total ($)","number"],["estado","Estado","select",["Enviada","Aprobada","Rechazada"]]] },
  produccion: { t: "Producción", i: "🏭", d: "Organiza y controla la elaboración de productos.",
    f: [["producto","Producto","text"],["cant","Cantidad","number"],["entrega","Entrega","date"],["estado","Estado","select",E]] },
  pagos: { t: "Pagos", i: "💳", d: "Registra pagos, métodos y estados de cobro.",
    f: [["fecha","Fecha","date"],["cliente","Cliente","text"],["monto","Monto ($)","number"],["metodo","Método","select",["Efectivo","Transferencia","Tarjeta"]],["estado","Estado","select",["Pendiente","Cobrado"]]] },
  exportaciones: { t: "Exportaciones y embarques", i: "🌎", d: "Gestiona exportaciones, destinos y seguimiento de envíos.",
    f: [["fecha","Fecha","date"],["cliente","Cliente","text"],["destino","Destino","text"],["estado","Estado","select",["Preparando","En tránsito","Entregado"]]] },
  reportes: { t: "Reportes e indicadores", i: "📊", d: "Consulta información para evaluar el desempeño de la empresa." }
};

const hoy = new Date().toISOString().slice(0, 10);

// Datos de ejemplo (luego se reemplazan por Supabase)
const SEED = {
  clientes: [{nombre:"María Torres",email:"maria@correo.com",tel:"0991234567",estado:"Activo"},{nombre:"Eventos Costa S.A.",email:"info@eventoscosta.com",tel:"042345678",estado:"Prospecto"}],
  productos: [{nombre:"Box Cumpleaños",cat:"Cajas regalo",costo:12,precio:25},{nombre:"Desayuno Sorpresa",cat:"Desayunos",costo:9,precio:20}],
  inventario: [{producto:"Box Cumpleaños",stock:14,min:5},{producto:"Desayuno Sorpresa",stock:3,min:5}],
  proveedores: [{nombre:"Importadora Delta",contacto:"Luis Mora",tel:"0987654321",rubro:"Empaques"}],
  compras: [{fecha:hoy,proveedor:"Importadora Delta",detalle:"Cajas y lazos",total:80}],
  ventas: [{fecha:hoy,cliente:"María Torres",producto:"Box Cumpleaños",cant:2,total:50,estado:"Completado"},{fecha:hoy,cliente:"Eventos Costa S.A.",producto:"Desayuno Sorpresa",cant:5,total:100,estado:"Pendiente"}],
  cotizaciones: [{fecha:hoy,cliente:"Eventos Costa S.A.",detalle:"50 boxes corporativos",total:900,estado:"Enviada"}],
  produccion: [{producto:"Desayuno Sorpresa",cant:5,entrega:hoy,estado:"En proceso"}],
  pagos: [{fecha:hoy,cliente:"María Torres",monto:50,metodo:"Transferencia",estado:"Cobrado"}],
  exportaciones: [{fecha:hoy,cliente:"Eventos Costa S.A.",destino:"Lima, Perú",estado:"Preparando"}]
};

let D = JSON.parse(JSON.stringify(SEED)), cur = "inicio", q = "", editing = null;
try { const s = localStorage.getItem("detallitos_v1"); if (s) D = Object.assign(D, JSON.parse(s)); } catch (e) {}
function save() { try { localStorage.setItem("detallitos_v1", JSON.stringify(D)); } catch (e) {} }

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const money = n => "$" + (+n || 0).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sum = (a, k) => a.reduce((t, r) => t + (+r[k] || 0), 0);
const tagc = v => ["Completado","Activo","Cobrado","Aprobada","Entregado"].includes(v) ? "ok"
  : ["Cancelado","Rechazada","Inactivo"].includes(v) ? "b"
  : ["Pendiente","Prospecto","Enviada","Preparando","En proceso","En tránsito"].includes(v) ? "w" : "";

document.querySelectorAll(".mi").forEach(b => b.onclick = () => go(b.dataset.s));

function go(k) {
  cur = k; q = "";
  document.querySelectorAll(".mi").forEach(b => b.classList.toggle("active", b.dataset.s === k));
  render();
  window.scrollTo(0, 0);
}

function render() {
  const m = M[cur], v = $("view");
  if (cur === "inicio") return home(v);
  if (cur === "reportes") return reports(v);
    if (cur === "gemelo_inv") return twinInv(v);
  if (cur === "gemelo_prod") return twinProd(v);
  const rows = D[cur] || [];
  const fl = rows.map((r, i) => [r, i]).filter(([r]) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  v.innerHTML = `
  <div class="welcome"><h1>${m.i} ${m.t}</h1><p>${m.d}</p></div>
  <div class="panel">
    <div class="tools"><input id="sq" placeholder="Buscar..." value="${esc(q)}"><button class="btn" id="nw">+ Nuevo registro</button></div>
    <div class="tw"><table><thead><tr>${m.f.map(f => `<th>${f[1]}</th>`).join("")}<th></th></tr></thead><tbody>
    ${fl.length ? fl.map(([r, i]) => `<tr>${m.f.map(f => {
        let x = r[f[0]];
        if (f[2] === "number" && /\$/.test(f[1])) x = money(x);
        else if (f[0] === "estado") return `<td><span class="tag ${tagc(x)}">${esc(x)}</span></td>`;
        else if (f[0] === "stock" && +r.stock <= +r.min) return `<td><span class="tag b">${esc(x)} · bajo</span></td>`;
        return `<td>${esc(x)}</td>`;
      }).join("")}
      <td><button class="btn g s" data-e="${i}">Editar</button> <button class="btn d s" data-d="${i}">Eliminar</button></td></tr>`).join("")
      : `<tr><td class="empty" colspan="${m.f.length + 1}">Sin registros todavía.</td></tr>`}
    </tbody></table></div>
    <div class="notice">Datos guardados en este navegador. La conexión a Supabase se configurará en la siguiente etapa.</div>
  </div>`;
  $("sq").oninput = e => { q = e.target.value; const p = e.target.selectionStart; render(); const s = $("sq"); s.focus(); s.setSelectionRange(p, p); };
  $("nw").onclick = () => form(null);
  v.querySelectorAll("[data-e]").forEach(b => b.onclick = () => form(+b.dataset.e));
  v.querySelectorAll("[data-d]").forEach(b => b.onclick = () => {
    if (confirm("¿Eliminar este registro?")) { D[cur].splice(+b.dataset.d, 1); save(); render(); }
  });
}

function form(i) {
  const m = M[cur]; editing = i;
  const r = i === null ? {} : D[cur][i];
  $("dt").textContent = (i === null ? "Nuevo registro · " : "Editar · ") + m.t;
  $("df").innerHTML = m.f.map(f => `<div class="fld"><label>${f[1]}</label>${
    f[2] === "select"
      ? `<select data-k="${f[0]}">${f[3].map(o => `<option${r[f[0]] === o ? " selected" : ""}>${o}</option>`).join("")}</select>`
      : `<input data-k="${f[0]}" type="${f[2]}" ${f[2] === "number" ? 'step="any" min="0"' : ""} value="${esc(r[f[0]] ?? (f[2] === "date" ? hoy : ""))}">`
  }</div>`).join("");
  $("dlg").showModal();
}

$("cx").onclick = () => $("dlg").close();
$("ok").onclick = () => {
  const m = M[cur], o = {};
  document.querySelectorAll("#df [data-k]").forEach(e => o[e.dataset.k] = e.type === "number" ? (parseFloat(e.value) || 0) : e.value.trim());
  if (!o[m.f[0][0]] && m.f[0][2] === "text") { alert("Completa el primer campo."); return; }
  if (editing === null) D[cur].push(o); else D[cur][editing] = o;
  save(); $("dlg").close(); render();
};

function home(v) {
  const vt = sum(D.ventas, "total"), low = D.inventario.filter(r => +r.stock <= +r.min).length;
  const cob = sum(D.pagos.filter(p => p.estado === "Cobrado"), "monto");
  const k = [
    ["👥","Clientes",D.clientes.length,"Gestión comercial"],
    ["🎁","Productos",D.productos.length,"Catálogo empresarial"],
    ["📦","Alertas de stock",low,"Productos bajo el mínimo"],
    ["💰","Ventas",money(vt),"Total registrado"],
    ["💳","Cobrado",money(cob),"Pagos confirmados"],
    ["📄","Cotizaciones",D.cotizaciones.filter(c => c.estado === "Enviada").length,"Esperando respuesta"],
    ["🏭","En producción",D.produccion.filter(p => p.estado !== "Completado").length,"Pedidos activos"],
    ["🌎","Embarques",D.exportaciones.length,"Exportaciones"]
  ];
  v.innerHTML = `
  <div class="welcome"><h1>¡Bienvenido a Detallitos Box!</h1><p>Administra y controla las operaciones de tu empresa desde un solo lugar.</p></div>
  <div class="grid">${k.map(c => `<div class="card"><span>${c[0]}</span><h3>${c[1]}</h3><strong>${c[2]}</strong><p>${c[3]}</p></div>`).join("")}</div>
  <div class="panel"><h2>Últimas ventas</h2><div class="tw"><table><thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Total</th><th>Estado</th></tr></thead><tbody>
  ${D.ventas.length ? D.ventas.slice(-5).reverse().map(r => `<tr><td>${esc(r.fecha)}</td><td>${esc(r.cliente)}</td><td>${esc(r.producto)}</td><td>${money(r.total)}</td><td><span class="tag ${tagc(r.estado)}">${esc(r.estado)}</span></td></tr>`).join("")
    : `<tr><td class="empty" colspan="5">Aún no hay ventas.</td></tr>`}
  </tbody></table></div></div>`;
}

function reports(v) {
  const vt = sum(D.ventas, "total"), ct = sum(D.compras, "total");
  const cob = sum(D.pagos.filter(p => p.estado === "Cobrado"), "monto");
  const pen = sum(D.pagos.filter(p => p.estado !== "Cobrado"), "monto");
  const mx = Math.max(vt, ct, cob, pen, 1);
  const bars = [["Ventas", vt], ["Compras", ct], ["Cobrado", cob], ["Por cobrar", pen]];
  const st = {}; D.ventas.forEach(r => st[r.estado] = (st[r.estado] || 0) + 1);
  v.innerHTML = `
  <div class="welcome"><h1>📊 Reportes e indicadores</h1><p>${M.reportes.d}</p></div>
  <div class="grid">
    <div class="card"><span>💰</span><h3>Ventas</h3><strong>${money(vt)}</strong></div>
    <div class="card"><span>🛒</span><h3>Compras</h3><strong>${money(ct)}</strong></div>
    <div class="card"><span>📈</span><h3>Utilidad bruta</h3><strong>${money(vt - ct)}</strong></div>
    <div class="card"><span>🎟️</span><h3>Ticket promedio</h3><strong>${money(D.ventas.length ? vt / D.ventas.length : 0)}</strong></div>
  </div>
  <div class="panel"><h2>Flujo financiero</h2>${bars.map(b => `<div class="bar"><b>${b[0]}</b><i style="width:${Math.round(b[1] / mx * 60)}%"></i><em>${money(b[1])}</em></div>`).join("")}</div>
  <div class="panel"><h2>Ventas por estado</h2>${Object.keys(st).length
    ? Object.entries(st).map(([k, n]) => `<div class="bar"><b>${k}</b><i style="width:${n / D.ventas.length * 60}%"></i><em>${n}</em></div>`).join("")
    : '<div class="empty">Sin datos.</div>'}
  <div class="notice">Los indicadores se calculan con los registros actuales; luego se conectarán a Supabase.</div></div>`;
}

render();
/* ===== GEMELO DIGITAL: INVENTARIO ===== */
function twinInv(v) {
  const it = D.inventario;
  const cap = r => Math.max((+r.min || 1) * 3, +r.stock, 1);
  const est = r => +r.stock <= 0 ? "b" : +r.stock <= +r.min ? "w" : "ok";
  const txt = { ok: "Normal", w: "Stock bajo", b: "Agotado" };
  const bajo = it.filter(r => +r.stock <= +r.min);
  const ocu = it.length ? Math.round(it.reduce((t, r) => t + Math.min(+r.stock / cap(r), 1), 0) / it.length * 100) : 0;
  v.innerHTML = `
  <div class="welcome"><h1>🧬 Gemelo digital · Inventario</h1>
  <p>Réplica virtual de tu bodega. Los niveles vienen del módulo Inventario; simula entradas y salidas y los datos se actualizan.</p></div>
  <div class="grid">
    <div class="card"><span>📦</span><h3>Productos</h3><strong>${it.length}</strong></div>
    <div class="card"><span>🔢</span><h3>Unidades</h3><strong>${sum(it, "stock")}</strong></div>
    <div class="card"><span>⚠️</span><h3>Bajo el mínimo</h3><strong>${bajo.length}</strong></div>
    <div class="card"><span>🏬</span><h3>Ocupación</h3><strong>${ocu}%</strong></div>
  </div>
  <div class="panel">
    <div class="tools"><button class="btn" id="gdsim">▶ Simular un día de ventas</button></div>
    ${it.length ? `<div class="gd-wh">${it.map((r, i) => {
      const c = cap(r), p = Math.min(+r.stock / c * 100, 100), e = est(r);
      return `<div class="gd-bin"><strong>${esc(r.producto)}</strong>
        <div class="gd-tank"><div class="gd-fill ${e}" style="height:${p}%"></div><div class="gd-min" style="bottom:${Math.min(+r.min / c * 100, 100)}%"></div><span class="gd-pct">${Math.round(p)}%</span></div>
        <div>${r.stock} / ${c} u.</div><span class="tag ${e}">${txt[e]}</span>
        <div style="margin-top:8px"><button class="btn g s" data-i="${i}" data-a="-1">−1</button><button class="btn g s" data-i="${i}" data-a="1">+1</button></div></div>`;
    }).join("")}</div>` : `<div class="empty">No hay productos en Inventario todavía.</div>`}
    ${bajo.length ? `<div class="notice">⚠️ Reponer pronto: ${bajo.map(r => esc(r.producto)).join(", ")}</div>` : ""}
  </div>`;
  v.querySelectorAll("[data-a]").forEach(b => b.onclick = () => {
    const r = D.inventario[+b.dataset.i];
    r.stock = Math.max(0, (+r.stock || 0) + (+b.dataset.a));
    save(); twinInv(v);
  });
  const sim = document.getElementById("gdsim");
  if (sim) sim.onclick = () => {
    D.inventario.forEach(r => r.stock = Math.max(0, (+r.stock || 0) - Math.floor(Math.random() * 3)));
    save(); twinInv(v);
  };
}

/* ===== GEMELO DIGITAL: PRODUCTO ===== */
var twinSel = 0;
function twinProd(v) {
  const P = D.productos;
  if (!P.length) {
    v.innerHTML = `<div class="welcome"><h1>🧊 Gemelo digital · Producto</h1><p>Primero registra productos en el módulo Productos.</p></div>`;
    return;
  }
  if (twinSel >= P.length) twinSel = 0;
  const p = P[twinSel], n = String(p.nombre).toLowerCase();
  const inv = D.inventario.find(r => String(r.producto).toLowerCase() === n);
  const vs = D.ventas.filter(r => String(r.producto).toLowerCase() === n);
  const enp = sum(D.produccion.filter(r => String(r.producto).toLowerCase() === n && r.estado !== "Completado"), "cant");
  const stock = inv ? +inv.stock : 0;
  const mg = (+p.precio || 0) - (+p.costo || 0);
  const mp = p.precio ? mg / p.precio * 100 : 0;
  const maxP = Math.max((+p.precio || 1) * 2, 1);
  v.innerHTML = `
  <div class="welcome"><h1>🧊 Gemelo digital · Producto</h1>
  <p>Réplica virtual del producto con sus datos de catálogo, inventario, ventas y producción.</p></div>
  <div class="panel"><div class="fld"><label>Selecciona un producto</label>
    <select id="gdsel">${P.map((x, i) => `<option value="${i}"${i === twinSel ? " selected" : ""}>${esc(x.nombre)}</option>`).join("")}</select></div></div>
  <div class="gd-prod">
    <div class="panel gd-center"><div class="gd-scene"><div class="gd-cube">
      <div class="f1">🎁</div><div class="f2">🎁</div><div class="f3">🎁</div><div class="f4">🎁</div><div class="f5">🎁</div><div class="f6">🎁</div></div></div>
      <h2>${esc(p.nombre)}</h2><span class="tag">${esc(p.cat)}</span></div>
    <div class="panel"><h2>Datos del gemelo</h2>
      <div class="gd-row"><span>Costo</span><b>${money(p.costo)}</b></div>
      <div class="gd-row"><span>Precio de venta</span><b>${money(p.precio)}</b></div>
      <div class="gd-row"><span>Margen unitario</span><b>${money(mg)} (${mp.toFixed(1)}%)</b></div>
      <div class="gd-row"><span>Stock en bodega</span><b>${inv ? stock + " u." : "Sin registro en inventario"}</b></div>
      <div class="gd-row"><span>Unidades vendidas</span><b>${sum(vs, "cant")}</b></div>
      <div class="gd-row"><span>Ingresos por ventas</span><b>${money(sum(vs, "total"))}</b></div>
      <div class="gd-row"><span>En producción</span><b>${enp} u.</b></div></div>
  </div>
  <div class="panel"><h2>Simulador de precio</h2>
    <input type="range" id="gdrg" min="0" max="${maxP}" step="0.5" value="${p.precio || 0}">
    <div id="gdout" class="notice"></div></div>`;
  const calc = () => {
    const np = +document.getElementById("gdrg").value, m = np - (+p.costo || 0);
    document.getElementById("gdout").innerHTML =
      `Precio simulado: <b>${money(np)}</b> · Margen unitario: <b>${money(m)}</b> (${np ? (m / np * 100).toFixed(1) : 0}%) · Utilidad potencial con el stock actual: <b>${money(m * stock)}</b>`;
  };
  document.getElementById("gdrg").oninput = calc;
  calc();
  document.getElementById("gdsel").onchange = e => { twinSel = +e.target.value; twinProd(v); };
}
