// ===== SUPABASE CONFIG =====
var SUPABASE_URL  = 'https://hhjwavixqjdpkvuodumf.supabase.co';
var SUPABASE_KEY  = 'sb_publishable_JDcmWaqihSSoUpq9Fo6LCA_7jHTyUy5';
var db            = null;

var ADMIN_EMAIL        = 'kenner7894@gmail.com';
var ADMIN_PASSWORD     = 'kenner12345';
var ADMIN_PASSWORD_KEY = 'motopro_admin_ok';

var MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
var DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

var _citasGlobal = []; // cache para toggle semana/mes

document.addEventListener('DOMContentLoaded', function () {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    var pagina      = window.location.pathname;
    var estaLogueado = sessionStorage.getItem(ADMIN_PASSWORD_KEY);

    if (!pagina.includes('login.html') && !estaLogueado) {
        window.location.href = 'login.html';
        return;
    }

    if (pagina.includes('home.html') || pagina.endsWith('/DASHBOARD/')) {
        cargarHome();
        activarRealtime();
    }
    if (pagina.includes('citas.html'))       cargarCitas();
    if (pagina.includes('pedidos.html'))     cargarPedidos();
    if (pagina.includes('usuarios.html'))    cargarUsuarios();
    if (pagina.includes('reportes.html'))    cargarReportes();
    // inventario.html maneja su propia carga via window.onload
});

// ===== AVATAR MENU =====
function toggleAvatarMenu() {
    var menu = document.getElementById('avatarMenu');
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
document.addEventListener('click', function(e) {
    var wrap = document.querySelector('.admin-avatar-wrap');
    var menu = document.getElementById('avatarMenu');
    if (wrap && menu && !wrap.contains(e.target)) menu.style.display = 'none';
});

// ===== SIDEBAR TOGGLE =====
function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    var main    = document.getElementById('mainContent');
    sidebar.classList.toggle('sidebar-cerrado');
    if (main) main.classList.toggle('main-expandido');
}

// ===== NOTIFICACIONES =====
function toggleNotifs() {
    var panel = document.getElementById('notifPanel');
    if (!panel) return;
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', function (e) {
    var wrap = document.getElementById('notifWrap');
    if (wrap && !wrap.contains(e.target)) {
        var panel = document.getElementById('notifPanel');
        if (panel) panel.style.display = 'none';
    }
});

function agregarNotif(texto, tipo) {
    var lista = document.getElementById('notifLista');
    var dot   = document.getElementById('notifDot');
    if (!lista) return;
    var placeholder = lista.querySelector('p');
    if (placeholder) lista.innerHTML = '';
    var item = document.createElement('div');
    item.className = 'notif-item';
    var icon = tipo === 'cita' ? 'calendar-check' : 'shopping-cart';
    item.innerHTML = '<span><i class="fas fa-' + icon + '"></i> ' + texto + '</span>' +
        '<div style="font-size:10px;color:var(--text3);margin-top:3px;">Ahora mismo</div>';
    lista.prepend(item);
    if (dot) dot.style.display = 'block';
}

// ===== REALTIME =====
function activarRealtime() {
    if (!db) return;
    db.channel('citas-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'citas' }, function (payload) {
            var c = payload.new;
            agregarNotif('Nueva cita: ' + (c.usuario_nombre || c.usuario_email) + ' — ' + c.fecha + ' ' + c.hora, 'cita');
            cargarHome();
        })
        .subscribe();

    db.channel('pedidos-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, function (payload) {
            var p = payload.new;
            agregarNotif('Nuevo pedido de ' + p.usuario_email + ' — ' + p.total, 'pedido');
            cargarHome();
        })
        .subscribe();
}

// ===== LOGIN =====
function adminLogin() {
    var email = document.getElementById('adminEmail').value.trim();
    var pass  = document.getElementById('adminPass').value;
    var err   = document.getElementById('loginError');
    if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
        sessionStorage.setItem(ADMIN_PASSWORD_KEY, '1');
        window.location.href = 'home.html';
    } else {
        if (err) { err.style.display = 'block'; err.textContent = 'Credenciales incorrectas.'; }
    }
}

function adminLogout() {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    window.location.href = 'login.html';
}

// ===== HELPER: estado → badge class =====
function estadoToBadge(estado) {
    if (!estado) return 'active';
    estado = estado.toLowerCase();
    if (estado === 'completada') return 'shipped';
    if (estado === 'cancelada')  return 'cancelled';
    if (estado === 'pendiente')  return 'pending';
    return 'active'; // confirmada
}

// ===== HOME =====
async function cargarHome() {
    var { data: citas }   = await db.from('citas').select('*');
    var { data: pedidos } = await db.from('pedidos').select('*');
    citas   = citas   || [];
    pedidos = pedidos || [];

    // ---- Stat cards ----
    var elCitas = document.getElementById('statCitas');
    var elPed   = document.getElementById('statPedidos');
    var elIng   = document.getElementById('statIngresos');
    var elUsr   = document.getElementById('statUsuarios');

    if (elCitas)   elCitas.textContent   = citas.length;
    if (elPed)     elPed.textContent     = pedidos.length;

    var total = pedidos.reduce(function (sum, p) {
        return sum + parseInt((p.total || '0').replace(/[^0-9]/g, ''));
    }, 0);
    if (elIng) elIng.textContent = 'COP ' + total.toLocaleString('es-CO');

    var emails = new Set(
        citas.map(function (c) { return c.usuario_email; })
            .concat(pedidos.map(function (p) { return p.usuario_email; }))
    );
    if (elUsr) elUsr.textContent = emails.size;

    // ---- Pedidos recientes (recent-row list) ----
    var listaPedidos = document.getElementById('pedidosRecientes');
    if (listaPedidos) {
        if (pedidos.length === 0) {
            listaPedidos.innerHTML =
                '<div class="empty-state" style="padding:32px 0;">' +
                '<i class="fas fa-shopping-bag"></i><p>No hay pedidos aún</p></div>';
        } else {
            listaPedidos.innerHTML = pedidos.slice(-6).reverse().map(function (p) {
                var inicial = (p.usuario_email || 'U')[0].toUpperCase();
                var fecha   = new Date(p.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
                var idCorto = 'MP-' + String(p.id).substring(0, 6).toUpperCase();
                var badge   = p.estado ? estadoToBadge(p.estado) : 'active';
                var badgeLbl= p.estado ? p.estado.charAt(0).toUpperCase() + p.estado.slice(1) : 'Recibido';
                return (
                    '<div class="recent-row">' +
                        '<div class="recent-avatar">' + inicial + '</div>' +
                        '<div class="recent-info">' +
                            '<div class="recent-id">' + idCorto + '</div>' +
                            '<div class="recent-name">' + p.usuario_email + '</div>' +
                            '<div class="recent-email">' + fecha + '</div>' +
                        '</div>' +
                        '<div class="recent-meta">' +
                            '<div class="recent-amount">' + p.total + '</div>' +
                            '<span class="badge-status ' + badge + '">' + badgeLbl + '</span>' +
                        '</div>' +
                    '</div>'
                );
            }).join('');
        }
    }

    // ---- Citas recientes (table rows) ----
    var tbody = document.getElementById('citasRecientes');
    if (tbody) {
        if (citas.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text3);">No hay citas aún</td></tr>';
        } else {
            tbody.innerHTML = citas.slice(-8).reverse().map(function (c) {
                var estado     = c.estado || 'confirmada';
                var badgeClass = estadoToBadge(estado);
                var badgeLabel = estado.charAt(0).toUpperCase() + estado.slice(1);
                return (
                    '<tr>' +
                        '<td>' +
                            '<strong style="font-size:13px;">' + (c.usuario_nombre || 'Cliente') + '</strong>' +
                            '<div style="font-size:11px;color:var(--text3);">' + (c.usuario_email || '') + '</div>' +
                        '</td>' +
                        '<td>' + (c.fecha || '—') + '</td>' +
                        '<td>' + (c.hora  || '—') + '</td>' +
                        '<td>' + (c.tecnico || '—') + '</td>' +
                        '<td><span class="badge-status ' + badgeClass + '">' + badgeLabel + '</span></td>' +
                        '<td><a href="citas.html" class="btn-admin outline sm"><i class="fas fa-eye"></i> Ver</a></td>' +
                    '</tr>'
                );
            }).join('');
        }
    }

    // ---- Gráfica citas por mes (default) ----
    _citasGlobal = citas;
    renderGraficaMes();

    // ---- Gráfica ingresos (si la página la tiene) ----
    var ingresosPorMes = new Array(12).fill(0);
    pedidos.forEach(function (p) {
        var mes   = new Date(p.created_at).getMonth();
        var monto = parseInt((p.total || '0').replace(/[^0-9]/g, ''));
        if (!isNaN(mes)) ingresosPorMes[mes] += monto;
    });
    if (document.getElementById('graficaIngresos')) {
        renderGrafica('graficaIngresos', MESES, ingresosPorMes, 'Ingresos', '#22c55e', true);
    }
}

// ===== CITAS =====
async function cargarCitas() {
    var { data: citas } = await db.from('citas').select('*').order('created_at', { ascending: false });
    citas = citas || [];

    // Mini stat cards on citas page
    var elTotal     = document.getElementById('citaStatTotal');
    var elConf      = document.getElementById('citaStatConf');
    var elComp      = document.getElementById('citaStatComp');
    var elCanc      = document.getElementById('citaStatCanc');

    if (elTotal) elTotal.textContent = citas.length;
    if (elConf)  elConf.textContent  = citas.filter(function(c){ return c.estado === 'confirmada'; }).length;
    if (elComp)  elComp.textContent  = citas.filter(function(c){ return c.estado === 'completada'; }).length;
    if (elCanc)  elCanc.textContent  = citas.filter(function(c){ return c.estado === 'cancelada';  }).length;

    var tbody = document.getElementById('tablaCitas');
    if (!tbody) return;

    if (citas.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:40px;">' +
            'No hay citas registradas</td></tr>';
        return;
    }

    tbody.innerHTML = citas.map(function (c) {
        var estado     = c.estado || 'confirmada';
        var badgeClass = estadoToBadge(estado);
        var label      = estado.charAt(0).toUpperCase() + estado.slice(1);
        return (
            '<tr id="fila-cita-' + c.id + '">' +
                '<td>' +
                    '<strong>' + (c.usuario_nombre || '—') + '</strong>' +
                    '<br><small style="color:var(--text3);">' + (c.usuario_email || '') + '</small>' +
                '</td>' +
                '<td>' + (c.fecha || '—') + '</td>' +
                '<td>' + (c.hora  || '—') + '</td>' +
                '<td>' + (c.tecnico || '—') + '</td>' +
                '<td style="max-width:180px;color:var(--text3);font-size:12px;">' + (c.observaciones || '—') + '</td>' +
                '<td><span class="badge-status ' + badgeClass + '" id="badge-' + c.id + '">' + label + '</span></td>' +
                '<td>' +
                    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
                        '<select onchange="cambiarEstadoCita(\'' + c.id + '\', this.value)" ' +
                            'style="background:#f8fafc;color:var(--text);border:1px solid var(--border);' +
                            'border-radius:6px;padding:5px 8px;font-size:11px;cursor:pointer;' +
                            'font-family:\'Varela Round\',sans-serif;">' +
                            '<option value="confirmada"' + (estado==='confirmada'?' selected':'') + '>Confirmada</option>' +
                            '<option value="completada"' + (estado==='completada'?' selected':'') + '>Completada</option>' +
                            '<option value="pendiente"'  + (estado==='pendiente' ?' selected':'') + '>Pendiente</option>' +
                            '<option value="cancelada"'  + (estado==='cancelada' ?' selected':'') + '>Cancelada</option>' +
                        '</select>' +
                        '<button onclick="eliminarCita(\'' + c.id + '\')" class="btn-admin danger sm">' +
                            '<i class="fas fa-trash"></i>' +
                        '</button>' +
                    '</div>' +
                '</td>' +
            '</tr>'
        );
    }).join('');

    var totalEl = document.getElementById('totalCitas');
    if (totalEl) totalEl.textContent = citas.length + ' citas';
}

// ===== CAMBIAR ESTADO CITA =====
async function cambiarEstadoCita(id, nuevoEstado) {
    var { error } = await db.from('citas').update({ estado: nuevoEstado }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }

    // 1. Actualizar badge de la fila al instante
    var badge = document.getElementById('badge-' + id);
    if (badge) {
        badge.className = 'badge-status ' + estadoToBadge(nuevoEstado);
        badge.textContent = nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1);
    }

    // 2. Recalcular contadores de arriba leyendo todos los badges actuales
    var todasFilas = document.querySelectorAll('#tablaCitas tr[id^="fila-cita-"]');
    var conf = 0, comp = 0, canc = 0, pend = 0, total = todasFilas.length;
    todasFilas.forEach(function(fila) {
        var b = fila.querySelector('.badge-status');
        if (!b) return;
        var txt = b.textContent.toLowerCase();
        if (txt === 'confirmada') conf++;
        else if (txt === 'completada') comp++;
        else if (txt === 'cancelada') canc++;
        else if (txt === 'pendiente') pend++;
    });

    var elTotal = document.getElementById('citaStatTotal');
    var elConf  = document.getElementById('citaStatConf');
    var elComp  = document.getElementById('citaStatComp');
    var elCanc  = document.getElementById('citaStatCanc');
    if (elTotal) elTotal.textContent = total;
    if (elConf)  elConf.textContent  = conf;
    if (elComp)  elComp.textContent  = comp;
    if (elCanc)  elCanc.textContent  = canc;
}

// ===== ELIMINAR CITA =====
async function eliminarCita(id) {
    if (!confirm('¿Seguro que quieres eliminar esta cita?')) return;
    var { error } = await db.from('citas').delete().eq('id', id);
    if (error) {
        alert('Error: ' + error.message);
    } else {
        // Recargar todo para que los stats queden correctos
        await cargarCitas();
    }
}

// ===== PEDIDOS =====
async function cargarPedidos() {
    var { data: pedidos } = await db.from('pedidos').select('*').order('created_at', { ascending: false });
    pedidos = pedidos || [];

    var tbody = document.getElementById('tablaPedidos');
    if (!tbody) return;

    if (pedidos.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:40px;">' +
            'No hay pedidos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = pedidos.map(function (p) {
        var prods = Array.isArray(p.productos)
            ? p.productos.map(function (x) { return x.nombre || x; }).join(', ')
            : (p.productos ? JSON.stringify(p.productos) : '—');
        var idCorto = 'MP-' + String(p.id).substring(0, 6).toUpperCase();
        return (
            '<tr id="fila-pedido-' + p.id + '">' +
                '<td><span style="color:var(--primary);font-weight:700;font-size:13px;">' + idCorto + '</span></td>' +
                '<td>' + (p.usuario_email || '—') + '</td>' +
                '<td style="max-width:220px;font-size:12px;color:var(--text2);">' + (prods || '—') + '</td>' +
                '<td><strong style="color:var(--primary);">' + (p.total || '—') + '</strong></td>' +
                '<td>' + new Date(p.created_at).toLocaleDateString('es-CO') + '</td>' +
                '<td>' +
                    '<button onclick="eliminarPedido(\'' + p.id + '\')" class="btn-admin danger sm">' +
                        '<i class="fas fa-trash"></i> Borrar' +
                    '</button>' +
                '</td>' +
            '</tr>'
        );
    }).join('');

    var totalEl = document.getElementById('totalPedidos');
    if (totalEl) totalEl.textContent = pedidos.length + ' pedidos';
}

// ===== ELIMINAR PEDIDO =====
async function eliminarPedido(id) {
    if (!confirm('¿Seguro que quieres eliminar este pedido?')) return;
    var { error } = await db.from('pedidos').delete().eq('id', id);
    if (error) {
        alert('Error: ' + error.message);
    } else {
        var fila = document.getElementById('fila-pedido-' + id);
        if (fila) fila.remove();
        var totalEl = document.getElementById('totalPedidos');
        if (totalEl) {
            var n = parseInt(totalEl.textContent) - 1;
            totalEl.textContent = n + ' pedidos';
        }
    }
}

// ===== USUARIOS =====
async function cargarUsuarios() {
    var { data: citas }    = await db.from('citas').select('usuario_email, usuario_nombre, created_at');
    var { data: pedidos }  = await db.from('pedidos').select('usuario_email, created_at');
    var { data: usuariosDB } = await db.from('usuarios').select('email, nombre, created_at');
    citas      = citas      || [];
    pedidos    = pedidos    || [];
    usuariosDB = usuariosDB || [];

    var mapa = {};

    // Primero agregar todos los usuarios registrados
    usuariosDB.forEach(function(u) {
        mapa[u.email] = { nombre: u.nombre || '—', email: u.email, citas: 0, pedidos: 0, fecha: u.created_at };
    });

    citas.forEach(function (c) {
        if (!mapa[c.usuario_email])
            mapa[c.usuario_email] = { nombre: c.usuario_nombre, email: c.usuario_email, citas: 0, pedidos: 0, fecha: c.created_at };
        mapa[c.usuario_email].citas++;
    });
    pedidos.forEach(function (p) {
        if (!mapa[p.usuario_email])
            mapa[p.usuario_email] = { nombre: '—', email: p.usuario_email, citas: 0, pedidos: 0, fecha: p.created_at };
        mapa[p.usuario_email].pedidos++;
    });

    var usuarios = Object.values(mapa);
    var tbody    = document.getElementById('tablaUsuarios');
    if (!tbody) return;

    if (usuarios.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:40px;">No hay usuarios aún</td></tr>';
        return;
    }

    tbody.innerHTML = usuarios.map(function (u) {
        var inicial = (u.nombre || u.email || 'U')[0].toUpperCase();
        return (
            '<tr>' +
                '<td>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                        '<div style="width:34px;height:34px;background:var(--primary-light);color:var(--primary);' +
                            'border-radius:50%;display:flex;align-items:center;justify-content:center;' +
                            'font-weight:700;font-size:13px;flex-shrink:0;">' + inicial + '</div>' +
                        '<strong>' + (u.nombre || '—') + '</strong>' +
                    '</div>' +
                '</td>' +
                '<td style="color:var(--text2);">' + (u.email || '—') + '</td>' +
                '<td><span class="badge-status active">' + u.citas + ' cita' + (u.citas !== 1 ? 's' : '') + '</span></td>' +
                '<td><span class="badge-status shipped">' + u.pedidos + ' pedido' + (u.pedidos !== 1 ? 's' : '') + '</span></td>' +
                '<td style="color:var(--text3);font-size:12px;">' + new Date(u.fecha).toLocaleDateString('es-CO') + '</td>' +
            '</tr>'
        );
    }).join('');

    var totalEl = document.getElementById('totalUsuarios');
    if (totalEl) totalEl.textContent = usuarios.length + ' usuarios';
}

// ===== REPORTES =====
async function cargarReportes() {
    var { data: citas }   = await db.from('citas').select('*');
    var { data: pedidos } = await db.from('pedidos').select('*');
    citas   = citas   || [];
    pedidos = pedidos || [];

    var mesActual  = new Date().getMonth();
    var anioActual = new Date().getFullYear();

    var citasMes   = citas.filter(function (c) {
        var d = new Date(c.created_at);
        return d.getMonth() === mesActual && d.getFullYear() === anioActual;
    });
    var pedidosMes = pedidos.filter(function (p) {
        var d = new Date(p.created_at);
        return d.getMonth() === mesActual && d.getFullYear() === anioActual;
    });
    var ingresosMes = pedidosMes.reduce(function (s, p) {
        return s + parseInt((p.total || '0').replace(/[^0-9]/g, ''));
    }, 0);

    var elCM = document.getElementById('repCitasMes');
    var elPM = document.getElementById('repPedidosMes');
    var elIM = document.getElementById('repIngresosMes');
    var elTec= document.getElementById('repTecnico');

    if (elCM)  elCM.textContent  = citasMes.length;
    if (elPM)  elPM.textContent  = pedidosMes.length;
    if (elIM)  elIM.textContent  = 'COP ' + ingresosMes.toLocaleString('es-CO');

    // Técnico más activo
    var tecMap = {};
    citas.forEach(function (c) { if (c.tecnico) tecMap[c.tecnico] = (tecMap[c.tecnico] || 0) + 1; });
    var tecTop = Object.entries(tecMap).sort(function (a, b) { return b[1] - a[1]; })[0];
    if (elTec) elTec.textContent = tecTop ? tecTop[0] + ' (' + tecTop[1] + ')' : '—';

    // Gráfica citas por mes
    var citasPorMes = new Array(12).fill(0);
    citas.forEach(function (c) { var m = new Date(c.created_at).getMonth(); if (!isNaN(m)) citasPorMes[m]++; });
    renderGrafica('repGraficaCitas', MESES, citasPorMes, 'Citas', '#0D6EBE');

    // Gráfica ingresos por mes
    var ingresosPorMes = new Array(12).fill(0);
    pedidos.forEach(function (p) {
        var m     = new Date(p.created_at).getMonth();
        var monto = parseInt((p.total || '0').replace(/[^0-9]/g, ''));
        if (!isNaN(m)) ingresosPorMes[m] += monto;
    });
    renderGrafica('repGraficaIngresos', MESES, ingresosPorMes, 'Ingresos', '#22c55e', true);

    // Gráfica por técnico
    var tecNombres = Object.keys(tecMap);
    var tecCitas   = tecNombres.map(function (t) { return tecMap[t]; });
    renderGraficaBarra('repGraficaTecnicos', tecNombres, tecCitas, 'Citas por técnico', '#0D6EBE');

    // Gráfica horarios
    var horasMap = {};
    citas.forEach(function (c) { if (c.hora) horasMap[c.hora] = (horasMap[c.hora] || 0) + 1; });
    var horas      = Object.keys(horasMap).sort();
    var horaCounts = horas.map(function (h) { return horasMap[h]; });
    renderGraficaBarra('repGraficaHorarios', horas, horaCounts, 'Citas por horario', '#22c55e');
}

// ===== GRÁFICAS =====
// ===== TOGGLE GRÁFICA SEMANA / MES =====
function renderGraficaMes() {
    var citasPorMes = new Array(12).fill(0);
    _citasGlobal.forEach(function (c) {
        var mes = new Date(c.created_at).getMonth();
        if (!isNaN(mes)) citasPorMes[mes]++;
    });
    renderGrafica('graficaCitas', MESES, citasPorMes, 'Citas', '#e63946');
}

function renderGraficaSemana() {
    // Últimos 7 días desde hoy
    var hoy = new Date();
    hoy.setHours(23,59,59,999);
    var hace7 = new Date(hoy);
    hace7.setDate(hoy.getDate() - 6);
    hace7.setHours(0,0,0,0);

    var labels = [];
    var datos  = [];
    for (var i = 0; i < 7; i++) {
        var d = new Date(hace7);
        d.setDate(hace7.getDate() + i);
        labels.push(DIAS_SEMANA[d.getDay()] + ' ' + d.getDate());
        datos.push(0);
    }

    _citasGlobal.forEach(function (c) {
        var fecha = new Date(c.created_at);
        if (fecha >= hace7 && fecha <= hoy) {
            var diff = Math.floor((fecha - hace7) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff < 7) datos[diff]++;
        }
    });

    renderGrafica('graficaCitas', labels, datos, 'Citas', '#e63946');
}

function cambiarVistaGrafica(vista) {
    var btnS = document.getElementById('btnSemana');
    var btnM = document.getElementById('btnMes');
    if (btnS) btnS.classList.toggle('active', vista === 'semana');
    if (btnM) btnM.classList.toggle('active', vista === 'mes');
    if (vista === 'semana') renderGraficaSemana();
    else renderGraficaMes();
}

var chartsCreados = {};

function renderGrafica(canvasId, labels, data, label, color, esDinero) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (chartsCreados[canvasId]) chartsCreados[canvasId].destroy();
    chartsCreados[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '22',
                borderWidth: 2.5,
                pointBackgroundColor: color,
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: '#f0f2f5' },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11 },
                        callback: esDinero
                            ? function (v) { return '$' + (v / 1000).toFixed(0) + 'K'; }
                            : undefined
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                }
            }
        }
    });
}

function renderGraficaBarra(canvasId, labels, data, label, color) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (chartsCreados[canvasId]) chartsCreados[canvasId].destroy();
    chartsCreados[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['Sin datos'],
            datasets: [{
                label: label,
                data: data.length ? data : [0],
                backgroundColor: color + 'bb',
                borderColor: color,
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: '#f0f2f5' },
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                }
            }
        }
    });
}

// ===== SEARCH TABLE =====
function buscarEnTabla(inputId, tablaId) {
    var texto = document.getElementById(inputId).value.toLowerCase();
    var filas = document.querySelectorAll('#' + tablaId + ' tr');
    filas.forEach(function (fila) {
        fila.style.display = fila.textContent.toLowerCase().includes(texto) ? '' : 'none';
    });
}

// ===== INVENTARIO =====
