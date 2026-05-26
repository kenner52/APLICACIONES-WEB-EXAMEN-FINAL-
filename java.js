

var SUPABASE_URL = 'https://hhjwavixqjdpkvuodumf.supabase.co';
var SUPABASE_KEY = 'sb_publishable_JDcmWaqihSSoUpq9Fo6LCA_7jHTyUy5';
var supabaseClient = null;

var carrito = [];
var totalProductos = 0;
var usuarioActivo = null;
var codigoEnviado = '';

var todasLasSecciones = ['servicios', 'kits-motor', 'frenos', 'transmision', 'suspension', 'accesorios', 'catalogo'];

// Productos desde Supabase (se llena al cargar)
var productosDB = {};

// Imagen placeholder cuando no hay foto
var IMG_PLACEHOLDER = 'https://via.placeholder.com/300x200/1a1a1a/e63946?text=MOTO+PRO';

// Imágenes de respaldo por nombre de producto
var IMG_FALLBACK = {
    'Cambio de Aceite Premium':      'https://lubricants.repsol.com/content/dam/repsol-lubricantes/es/noticias/post-cambio-aceite-moto-2.jpeg',
    'Revisión de Frenos':            'https://motor.elpais.com/wp-content/uploads/2019/09/Frenos.jpg',
    'Afinación General':             'https://img.freepik.com/foto-gratis/hombre-reparando-motocicleta-taller-moderno_158595-8129.jpg?w=740',
    'Ajuste de Cadena':              'https://www.marketresearchintellect.com/images/blogs/top-motorcycle-drive-chains.webp',
    'Revisión Eléctrica':            'https://1800baterias.com/wp-content/uploads/2025/10/6a2bde78-9c5f-4818-bfa1-1c11e257bd08.jpeg',
    'Cambio de Llantas':             'https://cdn.shopify.com/s/files/1/0719/0275/7037/files/Como-cambiar-la-rueda-de-una-moto.jpg',
    'Lavado y Desengrase':           'https://bxrepsol.s3.eu-west-1.amazonaws.com/static/2022/08/09125607/esponja-cargada-de-agua-jabonosa-1024x576.jpg',
    'Diagnóstico Computarizado':     'https://ingemotor.com/wp-content/uploads/2024/11/disgnostico-automotriz-ingemotor.webp',
    'Limpieza de Carburador':        'https://www.motociclismo.es/uploads/s1/10/99/32/53/istock-1388220942-1.jpeg',
    'Cambio de Batería':             'https://recambiosloeches.com/wp-content/uploads/2023/11/cambio-bateria-coche.jpeg',
    'Sincronización de Carburador':  'https://www.motociclismo.es/uploads/s1/10/99/32/53/istock-1388220942-1.jpeg',
    'Cilindro Kit de Motor':         'https://http2.mlstatic.com/D_NQ_NP_885889-MCO78992740736_092024-O.webp',
    'Kit de Pistón':                 'https://www.starspartaindonesia.com/~img/piston_set-68b0b-3285_227-twebp80.webp',
    'Kit de Empaques':               'https://www.itservitec.com.co/web/image/product.product/46797/image_1024/%5BX49463-82%5D%20Kit%20empaques%20-%20Taylor%20Freezer?unique=b189314',
    'Kit Motor Completo':            'https://image.made-in-china.com/202f0j00LoikTheBknbJ/OEM-Complete-Engine-50cc-60cc-80cc-100cc-110cc-2-Stroke-Pocket-Bike-Complete-Engine.webp',
    'Bujías de Alto Rendimiento':    'https://i0.wp.com/www.redd.es/wp-content/uploads/2019/10/NGK_03.jpg',
    'Kit de Válvulas Motor':         'https://tm.parts/media/image/36164/kit-valvulas-escapeadmissao.jpg',
    'Árbol de Levas':                'https://bxrepsol.s3.eu-west-1.amazonaws.com/static/2025/12/18073446/Diseno-sin-titulo-2025-12-18T103441.478.png',
    'Cigüeñal':                      'https://cdn.club-magazin.autodoc.de/uploads/sites/11/2020/12/que-es-el-ciguenal.jpg',
    'Pastillas de Freno Delanteras': 'https://gxmotor.co/cdn/shop/files/825297_a76f0cc3-ade4-418a-8015-69eaac1b095a.jpg',
    'Pastillas de Freno Wave':       'https://http2.mlstatic.com/D_NQ_NP_925193-MCO94356219577_102025-O.webp',
    'Disco de Freno Wave':           'https://static.retail.autofact.cl/blog/c_url_original.9q2tg8lyq0dwzq.jpg',
    'Caliper de Freno Delantero':    'https://api-rustoleum.s3.us-east-1.amazonaws.com/product-images/5e9db6ee857bb_automotivecaliper2.jpg',
    'Kit de Pastillas Dreno':        'https://http2.mlstatic.com/D_NQ_NP_605059-MCO74373273717_022024-O.webp',
    'Líquido de Frenos DOT4':        'https://media.falabella.com/sodimacCO/334838/public',
    'Cadena Dorada S20':             'https://http2.mlstatic.com/D_NQ_NP_732512-MCO92247963054_092025-O.webp',
    'Cadena Reforzada Wave':         'https://http2.mlstatic.com/D_NQ_NP_2X_818377-MCO90070402377_082025-T.webp',
    'Piñón de Salida 15 Dientes':    'https://gxmotor.co/cdn/shop/files/5002.jpg?v=1757363001',
    'Cadena de Transmisión':         'https://hersal.com.pe/web/wp-content/uploads/2021/06/hersal_productos_cadenas_de_transmision_3_960x480.jpg',
    'Kit de Transmisión Reforzado':  'https://www.kitdearrastre.com/298585-large_default/kit-de-arrastre-ducati-strada-851-biposto-90-92-reforzado-hypersport.jpg',
    'Tensor de Cadena Manual':       'https://http2.mlstatic.com/D_Q_NP_2X_743082-MCO100396827268_122025-P.webp',
    'Barras Delanteras Cónicas':     'https://gxmotor.co/cdn/shop/files/63031-1.jpg?v=1715891824&width=1000',
    'Kit Retenes Cónicos':           'https://media.partseurope.eu/parts/e01cc7e23981e90a11e5f8cad113e080.webp',
    'Amortiguador Trasero':          'https://gxmotor.co/cdn/shop/files/826228_1.jpg?v=1740494222',
    'Retenes de Suspensión':         'https://http2.mlstatic.com/D_NQ_NP_962123-MCO88219789462_072025-O.webp',
    'Filtro de Aceite Oroilite':     'https://http2.mlstatic.com/D_Q_NP_2X_853529-MCO31545897424_072019-P.webp',
    'Filtro de Aire DNA CRP-168':    'https://http2.mlstatic.com/D_NQ_NP_2X_601697-MCO90984879572_082025-T.webp',
    'Filtro de Aceite DNA S58':      'https://img.tpl.one/w/extra/products/DNA/OL-2100_1.jpg',
    'Espejo Retrovisor Universal':   'https://http2.mlstatic.com/D_NQ_NP_707594-MCO98511807670_112025-O.webp',
    'Puños de Manubrio Sport':       'https://http2.mlstatic.com/D_NQ_NP_756504-MLU71977898377_092023-O.webp'
};

var CATMAP = {
    'servicios':  'servicios',
    'kits-motor': 'kits-motor',
    'frenos':     'frenos',
    'transmision':'transmision',
    'suspension': 'suspension',
    'accesorios': 'accesorios'
};

var CATICONS = {
    'servicios':'fa-wrench','kits-motor':'fa-cog','frenos':'fa-circle-notch',
    'transmision':'fa-link','suspension':'fa-arrows-alt-v','accesorios':'fa-toolbox'
};

var CATNAMES = {
    'servicios':'SERVICIOS','kits-motor':'KITS DE MOTOR','frenos':'SISTEMAS DE FRENO',
    'transmision':'TRANSMISIÓN','suspension':'SUSPENSIÓN','accesorios':'ACCESORIOS'
};

function crearTarjeta(p, conDataCat) {
    var img = p.imagen || IMG_FALLBACK[p.nombre] || IMG_PLACEHOLDER;
    var cat = conDataCat ? ' data-cat="' + p.categoria + '"' : '';
    return '<div class="tarjeta-producto animado"' + cat + '>' +
        '<img src="' + img + '" alt="' + p.nombre + '" onerror="this.src=\'' + IMG_PLACEHOLDER + '\'">' +
        '<h3>' + p.nombre + '</h3>' +
        '<p class="precio">' + (p.precio || 'Consultar precio') + '</p>' +
        '<button class="boton-carrito" onclick="agregarCarrito(this)">Añadir al Carrito</button>' +
        '</div>';
}

function renderizarProductosWeb(productos) {
    // Solo productos activos
    var activos = productos.filter(function(p) { return p.activo !== false; });

    // Renderizar cada sección individual
    Object.keys(CATMAP).forEach(function(cat) {
        var grid = document.getElementById('grid-' + cat);
        if (!grid) return;
        var catProds = activos.filter(function(p) { return p.categoria === cat; });
        if (catProds.length > 0) {
            grid.innerHTML = catProds.map(function(p) { return crearTarjeta(p, false); }).join('');
        }
        // Si no hay productos en Supabase para esta categoría, se mantiene el contenido hardcodeado
    });

    // Renderizar catálogo general
    var catalogoDiv = document.getElementById('catalogo-dinamico');
    if (catalogoDiv) {
        var html = '';
        Object.keys(CATMAP).forEach(function(cat) {
            var catProds = activos.filter(function(p) { return p.categoria === cat; });
            if (catProds.length === 0) return;
            html += '<h3 class="catalogo-categoria" data-cat="' + cat + '">' +
                '<i class="fas ' + (CATICONS[cat] || 'fa-box') + '"></i> ' + (CATNAMES[cat] || cat.toUpperCase()) + '</h3>' +
                '<div class="grid-productos">' +
                catProds.map(function(p) { return crearTarjeta(p, true); }).join('') +
                '</div>';
        });
        catalogoDiv.innerHTML = html || '<p style="color:#888;text-align:center;padding:40px;">No hay productos disponibles.</p>';
    }

    // Disparar animaciones
    setTimeout(function() {
        document.querySelectorAll('.animado').forEach(function(el, i) {
            setTimeout(function() { el.classList.add('visible'); }, i * 30);
        });
    }, 100);
}

// ===== DESCRIPCIONES DE PRODUCTOS =====
var descripciones = {
    // SERVICIOS
    'Cambio de Aceite Premium': 'Servicio completo de cambio de aceite con lubricante de alta calidad. Incluye revisión del nivel, cambio del filtro y verificación de fugas. Recomendado cada 3.000 km para mantener el motor en óptimas condiciones.',
    'Revisión de Frenos': 'Inspección completa del sistema de frenos delantero y trasero. Verificamos pastillas, discos, líquido de frenos y calipers. Garantizamos tu seguridad en cada frenada.',
    'Afinación General': 'Servicio integral que incluye limpieza de carburador o inyectores, revisión de bujías, filtros y sistema eléctrico. Tu moto quedará como nueva con mejor rendimiento y ahorro de combustible.',
    'Ajuste de Cadena': 'Ajuste y lubricación profesional de la cadena de transmisión. Verificamos el tensado correcto, desgaste de piñones y corona. Evita roturas inesperadas y prolonga la vida útil.',
    'Revisión Eléctrica': 'Diagnóstico completo del sistema eléctrico: batería, luces, arranque, regulador y cableado. Detectamos fallas antes de que se conviertan en un problema mayor.',
    'Cambio de Llantas': 'Servicio de desmontaje, montaje y balanceo de llantas. Trabajamos con todas las marcas. Recomendamos revisión cada 20.000 km o ante cualquier desgaste irregular.',
    'Lavado y Desengrase': 'Lavado profesional con productos especializados para motos. Limpieza de motor, cadena, frenos y carrocería. Tu moto lucirá impecable y protegida contra la corrosión.',
    'Diagnóstico Computarizado': 'Escáner electrónico para motos con sistema de inyección. Leemos códigos de falla (DTC), analizamos sensores y reseteamos el sistema. Diagnóstico preciso en minutos.',
    'Limpieza de Carburador': 'Desmontaje, limpieza ultrasónica y calibración del carburador. Eliminamos depósitos de combustible que afectan el rendimiento. Mejora la respuesta del acelerador y reduce el consumo.',
    'Cambio de Batería': 'Sustitución de batería con revisión del sistema de carga. Verificamos el alternador y regulador. Incluye prueba de carga completa para garantizar el correcto funcionamiento.',
    // KITS DE MOTOR
    'Cilindro Kit de Motor': 'Kit completo de cilindro con pistón, aros y empaque de culata. Compatible con motos de trabajo 125cc-150cc como AKT, Auteco Boxer y Honda Wave. Material de fundición de alta resistencia para mayor durabilidad.',
    'Kit de Pistón': 'Pistón con segmentos incluidos para motores 4 tiempos. Fabricado en aleación de aluminio forjado de alta resistencia. Medidas estándar y sobremedida disponibles. Ideal para reconstrucción de motor.',
    'Kit de Empaques': 'Juego completo de empaques y sellos para revisión de motor. Incluye empaque de culata, base de cilindro y sellos de válvulas. Material de alta temperatura que garantiza hermeticidad perfecta.',
    'Kit Motor Completo': 'Kit todo incluido para reconstrucción completa de motor. Cilindro, pistón, aros, empaques, bujía y filtro. La solución más económica para dejar tu motor como nuevo sin salir del taller.',
    'Bujías de Alto Rendimiento': 'Bujías de iridio o platino para mayor durabilidad y mejor encendido. Compatible con la mayoría de motos del mercado colombiano. Mejoran la potencia, reducen el consumo y facilitan el arranque en frío.',
    'Kit de Válvulas Motor': 'Set completo de válvulas de admisión y escape con resortes. Fabricadas en acero inoxidable de alta temperatura. Incluye valvulinas y retenes. Para motores que presenten consumo de aceite o pérdida de compresión.',
    'Árbol de Levas': 'Árbol de levas de repuesto para motores 4 tiempos. Mecanizado con precisión para garantizar el tiempo correcto de apertura y cierre de válvulas. Restaura la potencia perdida por desgaste.',
    'Cigüeñal': 'Cigüeñal balanceado dinámicamente para motores monocilíndricos. Incluye rodamientos de apoyo. Soluciona vibración excesiva y pérdida de potencia. Componente crítico revisado con control de calidad riguroso.',
    // FRENOS
    'Pastillas de Freno Delanteras': 'Pastillas de freno sinterizadas de alto rendimiento para freno delantero. Mayor resistencia al calor y mejor mordida en condiciones húmedas. Compatibles con la mayoría de motos deportivas y urbanas.',
    'Pastillas de Freno Wave': 'Pastillas específicas para Honda Wave y motos similares de trabajo. Material orgánico que ofrece frenada progresiva y silenciosa. Larga duración y sin daño al disco.',
    'Disco de Freno Wave': 'Disco de freno ventilado para Honda Wave 110. Acero inoxidable tratado térmicamente. Mayor disipación del calor y resistencia a la deformación. Frenada más corta y segura.',
    'Caliper de Freno Delantero': 'Caliper hidráulico completo con pistones incluidos. Compatible con varias marcas. Soluciona fugas de líquido de frenos y pérdida de presión. Viene listo para instalar.',
    'Kit de Pastillas Dreno': 'Kit completo de pastillas delanteras y traseras marca Dreno. Certificadas para uso en Colombia. Excelente relación calidad-precio. Incluye resortes de fijación.',
    'Líquido de Frenos DOT4': 'Líquido de frenos DOT4 de alta temperatura para sistemas hidráulicos. Punto de ebullición superior a 230°C. Previene la formación de vapor en el circuito de frenos. Presentación 500ml.',
    // TRANSMISIÓN
    'Cadena Dorada S20': 'Cadena dorada reforzada para motos de trabajo y sport. Eslabones en acero de alta resistencia con tratamiento anticorrosión dorado. Mayor duración que las cadenas estándar. Compatible con AKT, Yamaha FZ y similares.',
    'Cadena Reforzada Wave': 'Cadena de transmisión específica para Honda Wave y motos de trabajo. Eslabones de acero templado con sellado O-ring para mayor lubricación. Resistente a las condiciones del clima colombiano.',
    'Piñón de Salida 15 Dientes': 'Piñón de salida de caja de 15 dientes en acero templado. Compatible con motos 125cc-150cc. Desgaste mínimo garantizado. Mejora la respuesta de aceleración en ciudad.',
    'Cadena de Transmisión': 'Cadena de transmisión estándar para motos de trabajo. Fabricada en acero de alta resistencia. Viene con eslabón de unión incluido. Compatible con coronas de 41 y 43 dientes.',
    'Kit de Transmisión Reforzado': 'Kit completo con cadena + piñón + corona reforzados. La mejor solución para quienes recorren muchos kilómetros. Duración hasta 3 veces mayor que los componentes originales.',
    'Tensor de Cadena Manual': 'Tensor de cadena de ajuste manual para motos de trabajo. Fabricado en aluminio anodizado. Mantiene la tensión correcta de la cadena y reduce el desgaste de piñones y corona.',
    // SUSPENSIÓN
    'Barras Delanteras Cónicas': 'Par de barras de horquilla delantera para motos de trabajo. Acero cromado de alta resistencia. Solucionan fugas de aceite y vibración en el manillar. Vienen listas para instalar.',
    'Kit Retenes Cónicos': 'Kit de retenes y sellos para horquilla delantera. Incluye retenes de aceite, sellos de polvo y clips de fijación. Evitan fugas y mantienen el nivel de aceite correcto en la suspensión.',
    'Amortiguador Trasero': 'Amortiguador trasero de gas para mayor confort y estabilidad. Regulable en precarga según el peso del conductor. Compatible con la mayoría de motos 125cc-200cc. Mejora notablemente la estabilidad en curvas.',
    'Retenes de Suspensión': 'Juego de retenes para amortiguadores traseros. Material NBR de alta resistencia a la temperatura y aceites. Sellan perfectamente e impiden pérdidas de gas. Restauran el amortiguador a su rendimiento original.',
    // ACCESORIOS
    'Filtro de Aceite Oroilite': 'Filtro de aceite de alta filtración marca Oroilite. Elemento filtrante de papel de precisión que retiene partículas de hasta 10 micras. Protege el motor del desgaste prematuro. Compatible con múltiples marcas.',
    'Filtro de Aire DNA CRP-168': 'Filtro de aire de alto flujo DNA para motos sport y naked. Aumenta el caudal de aire al motor mejorando la potencia y el torque. Lavable y reutilizable. Reemplaza el filtro original con mejor rendimiento.',
    'Filtro de Aceite DNA S58': 'Filtro de aceite deportivo DNA para motos de alto rendimiento. Mayor capacidad de filtración y flujo de aceite. Construcción en acero inoxidable con anilla de sellado reforzada.',
    'Espejo Retrovisor Universal': 'Par de espejos retrovisores universales con barra de 10mm. Vidrio convexo de gran ángulo de visión. Cuerpo en aluminio negro mate. Compatible con la mayoría de motos del mercado.',
    'Puños de Manubrio Sport': 'Puños deportivos antideslizantes con acabado en goma de alta densidad. Mayor agarre y menor fatiga en manos. Incluye puños izquierdo y derecho. Compatibles con manillares de 7/8" (22mm).'
};

function verProducto(img) {
    var tarjeta = img.closest('.tarjeta-producto');
    if (!tarjeta) return;
    var nombre = tarjeta.querySelector('h3').textContent.trim();
    var precioHTML = tarjeta.querySelector('.precio').textContent.trim();
    var src = img.src;

    // Usar datos de Supabase si están disponibles, si no usar los hardcodeados
    var dbProd = productosDB[nombre];
    var desc   = (dbProd && dbProd.descripcion) ? dbProd.descripcion : (descripciones[nombre] || 'Producto de alta calidad para tu motocicleta.');
    var precio = (dbProd && dbProd.precio)      ? dbProd.precio      : precioHTML;
    // Si en Supabase la imagen fue actualizada, usarla
    if (dbProd && dbProd.imagen) src = dbProd.imagen;

    document.getElementById('modalProducto-img').src = src;
    document.getElementById('modalProducto-img').alt = nombre;
    document.getElementById('modalProducto-nombre').textContent = nombre;
    document.getElementById('modalProducto-precio').textContent = precio;
    document.getElementById('modalProducto-desc').textContent = desc;
    var btn = document.getElementById('modalProducto-btn');
    btn.innerHTML = '<i class="fas fa-shopping-cart"></i> AÑADIR AL CARRITO';
    btn.style.background = '#e63946';
    btn.onclick = function() {
        agregarCarrito(tarjeta.querySelector('.boton-carrito'));
        btn.innerHTML = '<i class="fas fa-check"></i> ¡AGREGADO AL CARRITO!';
        btn.style.background = '#2a9d5c';
        setTimeout(function() {
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> AÑADIR AL CARRITO';
            btn.style.background = '#e63946';
        }, 2000);
    };
    abrirModal('modalProducto');
}

// Click en imagen de producto abre el detalle
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.tarjeta-producto')) {
        verProducto(e.target);
    }
});

function mostrarSeccion(id, nombre) {
    document.getElementById('paginaInicio').style.display = 'none';
    document.getElementById('paginaSeccion').style.display = 'block';

    todasLasSecciones.forEach(function(sec) {
        document.getElementById(sec).style.display = 'none';
    });

    document.getElementById(id).style.display = 'block';
    document.getElementById('nombreSeccion').textContent = nombre;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(function() {
        document.querySelectorAll('#' + id + ' .animado').forEach(function(el, i) {
            setTimeout(function() { el.classList.add('visible'); }, i * 60);
        });
    }, 100);
}

function irAHome() {
    document.getElementById('paginaInicio').style.display = 'block';
    document.getElementById('paginaSeccion').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function abrirModal(id) {
    if (id === 'modalAgendar') {
        if (!usuarioActivo) {
            mostrarMensaje('🔒 Inicia sesión primero para agendar tu cita');
            document.getElementById('modalLogin').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            return;
        }
        limpiarFormularioCita();
    }
    document.getElementById(id).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function limpiarFormularioCita() {
    // Fecha
    var fechaEl = document.getElementById('fechaCita');
    if (fechaEl) fechaEl.value = '';
    // Hora
    var horaEl = document.getElementById('horaCita');
    if (horaEl) horaEl.selectedIndex = 0;
    // Técnico
    var tecEl = document.getElementById('tecnicoCita');
    if (tecEl) tecEl.selectedIndex = 0;
    // Observaciones
    var obsEl = document.getElementById('observacionesCita');
    if (obsEl) obsEl.value = '';
    // Tipo mantenimiento — volver a ninguno seleccionado
    var radios = document.querySelectorAll('input[name="tipoMant"]');
    radios.forEach(function(r) { r.checked = false; });
    // Quitar borde rojo de los labels
    var lblPrev = document.getElementById('lbl-preventivo');
    var lblCorr = document.getElementById('lbl-correctivo');
    if (lblPrev) lblPrev.style.borderColor = '#333';
    if (lblCorr) lblCorr.style.borderColor = '#333';
    // Moto seleccionada
    var motoEl = document.getElementById('motoSeleccionada');
    if (motoEl) { motoEl.textContent = 'Sin seleccionar'; motoEl.style.color = '#888'; }
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
    document.body.style.overflow = 'auto';
}

function abrirPago() {
    if (!usuarioActivo) {
        cerrarModal('modalCarrito');
        abrirModal('modalLogin');
        mostrarMensaje('Debes iniciar sesión para proceder al pago');
        return;
    }
    if (carrito.length === 0) {
        mostrarMensaje('Tu carrito está vacío');
        return;
    }
    // Actualizar precio real en el botón
    var total = document.getElementById('carritoTotal').textContent;
    var btnPagar = document.getElementById('btnPagarFinal');
    if (btnPagar) btnPagar.textContent = 'Pagar ' + total;
    // Pre-llenar correo del usuario
    var emailInput = document.getElementById('emailPago');
    if (emailInput && usuarioActivo.email) emailInput.value = usuarioActivo.email;
    cerrarModal('modalCarrito');
    abrirModal('modalPago');
}

window.addEventListener('click', function(e) {
    document.querySelectorAll('.modal').forEach(function(modal) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    var dropdown = document.getElementById('usuarioDropdown');
    var nav = document.getElementById('usuarioNav');
    if (dropdown && nav && !nav.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

function mostrarPasoPassword() {
    document.getElementById('loginPaso1').style.display = 'none';
    document.getElementById('loginPasoPassword').style.display = 'block';
    document.getElementById('loginPasoRegistro').style.display = 'none';
}


function mostrarPasoRegistro() {
    document.getElementById('loginPaso1').style.display = 'none';
    document.getElementById('loginPasoPassword').style.display = 'none';
    document.getElementById('loginPasoRegistro').style.display = 'block';
}


function vaciarCarrito() {
    carrito = [];
    totalProductos = 0;
    document.querySelector('.contador-carrito').textContent = '0';
    actualizarCarrito();
    mostrarMensaje('Carrito vaciado');
}

function volverPaso1() {
    document.getElementById('loginPaso1').style.display = 'block';
    document.getElementById('loginPasoPassword').style.display = 'none';
    document.getElementById('loginPasoRegistro').style.display = 'none';
    var campos = ['emailUsuario', 'passwordUsuario', 'registroNombre', 'registroEmail', 'registroPassword', 'registroPassword2'];
    campos.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
}

async function registrarUsuario() {
    var nombre   = document.getElementById('registroNombre').value.trim();
    var email    = document.getElementById('registroEmail').value.trim();
    var password = document.getElementById('registroPassword').value;
    var password2= document.getElementById('registroPassword2').value;

    if (!nombre) { alert('Por favor ingresa tu nombre completo'); return; }
    if (!email || !email.includes('@')) { alert('Por favor ingresa un correo válido'); return; }
    if (!password || password.length < 6) { alert('La contraseña debe tener al menos 6 caracteres'); return; }
    if (password !== password2) { alert('Las contraseñas no coinciden'); return; }

    mostrarMensaje('Creando cuenta...');

    var resultado = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: { data: { nombre: nombre } }
    });

    if (resultado.error) {
        alert('Error: ' + resultado.error.message);
        return;
    }

    completarLogin(nombre, email);
}

async function iniciarSesion() {
    var email    = document.getElementById('emailUsuario').value.trim();
    var password = document.getElementById('passwordUsuario').value;

    if (!email || !email.includes('@')) { alert('Por favor ingresa un correo válido'); return; }
    if (!password) { alert('Por favor ingresa tu contraseña'); return; }

    mostrarMensaje('Iniciando sesión...');

    var resultado = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (resultado.error) {
        alert('Correo o contraseña incorrectos. ¿No tienes cuenta? Regístrate primero.');
        return;
    }

    var nombre = resultado.data.user.user_metadata.nombre || email.split('@')[0];
    nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
    completarLogin(nombre, email);
}


async function loginGoogle() {
    cerrarModal('modalLogin');
    mostrarMensaje('Redirigiendo a Google...');
    var { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            prompt: 'select_account',
            redirectTo: 'http://127.0.0.1:3000/index.html'
        }
    });
    if (error) mostrarMensaje('Error al conectar con Google');
}


function completarLogin(nombre, email, mostrarSaludo) {
    if (mostrarSaludo === undefined) mostrarSaludo = true;
    // Guardar usuario en la tabla usuarios
    if (supabaseClient) {
        supabaseClient.from('usuarios')
            .insert({ email: email, nombre: nombre })
            .then(function(res) {
                if (res.error && res.error.code !== '23505') {
                    console.log('Error usuario:', res.error.message);
                } else {
                    console.log('Usuario guardado o ya existía:', email);
                }
            });
    }
    usuarioActivo = { nombre: nombre, email: email };
    
    localStorage.setItem('motopro_sesion', JSON.stringify(usuarioActivo));

    cerrarModal('modalLogin');
    volverPaso1();

    var inicial = nombre.charAt(0).toUpperCase();
    var loginBtn = document.getElementById('loginBtn');
    loginBtn.outerHTML = '<div class="usuario-avatar-nav" id="loginBtn" onclick="toggleDropdown()">' + inicial + '</div>';

    document.getElementById('usuarioNombreNav').textContent = email;
    document.getElementById('usuarioDropdown').style.display = 'none';


    var nombreModal = document.getElementById('nombreEnModal');
    if (nombreModal) nombreModal.textContent = 'Bienvenido, ' + nombre;

    if (mostrarSaludo) mostrarMensaje('¡Bienvenido, ' + nombre + '! ✓');
}

function toggleDropdown() {
    var dropdown = document.getElementById('usuarioDropdown');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

async function cerrarSesion() {
    await supabaseClient.auth.signOut();
    usuarioActivo = null;
    localStorage.removeItem('motopro_sesion');

    var loginBtn = document.getElementById('loginBtn');
    loginBtn.outerHTML = '<a href="#" class="icono-login" id="loginBtn" title="Iniciar Sesión"><i class="fas fa-user"></i></a>';

    document.getElementById('loginBtn').addEventListener('click', function(e) {
        e.preventDefault();
        abrirModal('modalLogin');
    });

    document.getElementById('usuarioDropdown').style.display = 'none';
    document.getElementById('usuarioNombreNav').textContent = '';

    mostrarMensaje('Sesión cerrada ✓');
}

function agregarCarrito(boton) {
    if (!usuarioActivo) {
        abrirModal('modalLogin');
        mostrarMensaje('Debes iniciar sesión para agregar productos al carrito');
        return;
    }

    var tarjeta = boton.closest('.tarjeta-producto');
    var nombre = tarjeta.querySelector('h3').textContent;
    var precio = tarjeta.querySelector('.precio').textContent;

    carrito.push({ nombre: nombre, precio: precio });
    totalProductos++;

    var badge = document.querySelector('.contador-carrito');
    badge.textContent = totalProductos;
    badge.style.transform = 'scale(1.6)';
    setTimeout(function() { badge.style.transform = 'scale(1)'; }, 250);

    var img = tarjeta.querySelector('img');
    var imgSrc = img ? img.src : '';
    mostrarToastCarrito(nombre, precio, imgSrc);
    actualizarCarrito();
}

function actualizarCarrito() {
    var contenido = document.getElementById('carritoContenido');
    var totalEl = document.getElementById('carritoTotal');

    if (carrito.length === 0) {
        contenido.innerHTML = '<p style="text-align:center; color:#aaa; padding:40px 20px;">Tu carrito está vacío</p>';
        totalEl.textContent = '$0';
        return;
    }

    var html = '';
    var totalNumero = 0;

    carrito.forEach(function(item, index) {
        var numero = parseInt(item.precio.replace(/[^0-9]/g, ''));
        totalNumero += numero;
        html += '<div class="carrito-item">';
        html += '<span>' + item.nombre + '</span>';
        html += '<span style="color:#e63946; font-weight:bold;">' + item.precio + '</span>';
        html += '<button onclick="eliminarProducto(' + index + ')" style="background:none; border:none; color:#e63946; cursor:pointer; font-size:22px; line-height:1; padding:0 5px;">×</button>';
        html += '</div>';
    });

    contenido.innerHTML = html;
    totalEl.textContent = 'COP ' + totalNumero.toLocaleString('es-CO');
}

function eliminarProducto(index) {
    carrito.splice(index, 1);
    totalProductos--;
    document.querySelector('.contador-carrito').textContent = totalProductos;
    actualizarCarrito();
}

function mostrarToastCarrito(nombre, precio, imgSrc) {
    var anterior = document.querySelector('.toast-carrito');
    if (anterior) anterior.remove();

    var toast = document.createElement('div');
    toast.className = 'toast-carrito';
    toast.innerHTML =
        '<div class="toast-carrito-img">' +
            (imgSrc ? '<img src="' + imgSrc + '" alt="">' : '<i class="fas fa-box" style="font-size:28px;color:#e63946;"></i>') +
        '</div>' +
        '<div class="toast-carrito-info">' +
            '<div class="toast-carrito-titulo"><i class="fas fa-check-circle" style="color:#2a9d5c;"></i> ¡Añadido al carrito!</div>' +
            '<div class="toast-carrito-nombre">' + nombre + '</div>' +
            '<div class="toast-carrito-precio">' + precio + '</div>' +
        '</div>' +
        '<button class="toast-carrito-cerrar" onclick="this.parentElement.remove()">×</button>';

    document.body.appendChild(toast);

    setTimeout(function() { toast.classList.add('toast-visible'); }, 10);
    setTimeout(function() {
        toast.classList.remove('toast-visible');
        setTimeout(function() { if (toast.parentElement) toast.remove(); }, 400);
    }, 3500);
}

function mostrarMensaje(texto) {
    var anterior = document.querySelector('.mensaje-flotante');
    if (anterior) anterior.remove();

    var esError = texto.includes('⚠️') || texto.includes('❌') || texto.includes('Debes') || texto.includes('Inicia') || texto.includes('Error') || texto.includes('inválido');
    var esExito = texto.includes('✓') || texto.includes('✅') || texto.includes('Bienvenido') || texto.includes('exitosa') || texto.includes('enviado') || texto.includes('cerrada') || texto.includes('vaciado') || texto.includes('guardado') || texto.includes('Pago');

    var color  = esError ? '#e63946' : esExito ? '#22c55e' : '#f59e0b';
    var icono  = esError ? 'fa-lock' : esExito ? 'fa-check' : 'fa-motorcycle';
    var textoLimpio = texto.replace(/[⚠️❌✓✅🔒ℹ️]/g, '').trim();

    var msg = document.createElement('div');
    msg.className = 'mensaje-flotante';
    msg.innerHTML =
        '<div style="width:3px;background:' + color + ';border-radius:3px 0 0 3px;position:absolute;left:0;top:0;bottom:0;"></div>' +
        '<div style="display:flex;align-items:center;gap:10px;padding-left:4px;">' +
            '<i class="fas ' + icono + '" style="color:' + color + ';font-size:13px;flex-shrink:0;"></i>' +
            '<span style="font-size:15px;font-weight:700;color:#eee;font-family:\'Rajdhani\',sans-serif;letter-spacing:0.3px;">' + textoLimpio + '</span>' +
        '</div>';

    msg.style.cssText =
        'position:fixed;bottom:30px;left:50%;' +
        'transform:translateX(-50%) translateY(20px);' +
        'background:#111;border:1px solid #2a2a2a;' +
        'padding:14px 28px 14px 16px;border-radius:12px;' +
        'box-shadow:0 6px 28px rgba(0,0,0,0.5);' +
        'z-index:99999;opacity:0;' +
        'transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);' +
        'min-width:300px;max-width:440px;overflow:hidden;white-space:nowrap;';

    // Agregar animación CSS si no existe
    if (!document.getElementById('msgStyle')) {
        var style = document.createElement('style');
        style.id = 'msgStyle';
        style.textContent = '@keyframes msgProgress { from{width:100%} to{width:0%} }';
        document.head.appendChild(style);
    }

    document.body.appendChild(msg);

    setTimeout(function() {
        msg.style.opacity = '1';
        msg.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    setTimeout(function() {
        msg.style.opacity = '0';
        msg.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(function() { if (msg.parentElement) msg.remove(); }, 400);
    }, 3200);
}


async function confirmarCita() {
    var fecha = document.getElementById('fechaCita').value;
    var hora  = document.getElementById('horaCita').value;
    var tecnico = document.getElementById('tecnicoCita').value;
    var observaciones = document.getElementById('observacionesCita') ? document.getElementById('observacionesCita').value : '';
    var tipoMant = document.querySelector('input[name="tipoMant"]:checked');
    var tipoMantenimiento = tipoMant ? tipoMant.value : 'No especificado';

    if (!fecha) {
        alert('Por favor selecciona una fecha para tu cita');
        return;
    }

    // Validar fecha pasada
    var hoy = new Date();
    hoy.setHours(0,0,0,0);
    var fechaElegida = new Date(fecha + 'T00:00:00');
    if (fechaElegida < hoy) {
        mostrarMensaje('⚠️ Esa fecha ya pasó. Por favor selecciona desde hoy en adelante.');
        return;
    }

    // Verificar disponibilidad en Supabase
    var btnConfirmar = document.querySelector('#modalAgendar .boton-confirmar');
    if (btnConfirmar) { btnConfirmar.textContent = 'Verificando disponibilidad...'; btnConfirmar.disabled = true; }

    var resultado = await supabaseClient
        .from('citas')
        .select('id')
        .eq('fecha', fecha)
        .eq('hora', hora)
        .eq('tecnico', tecnico);

    if (btnConfirmar) { btnConfirmar.textContent = 'Confirmar Cita'; btnConfirmar.disabled = false; }

    console.log('Verificación disponibilidad:', resultado);

    if (resultado.data && resultado.data.length > 0) {
        mostrarModalOcupado(fecha, hora, tecnico);
        return;
    }

    var partes = fecha.split('-');
    var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    var fechaFormateada = partes[2] + ' de ' + meses[parseInt(partes[1]) - 1] + ' de ' + partes[0];

    guardarCitaEnDB(fecha, hora, tecnico, observaciones, tipoMantenimiento);
    agregarCitaCalendario(fecha, hora, tecnico, observaciones, tipoMantenimiento);
    enviarCorreoCita(fecha, hora, tecnico, observaciones, tipoMantenimiento);

    // Limpiar formulario para próxima cita
    document.getElementById('fechaCita').value = '';
    if (document.getElementById('observacionesCita')) document.getElementById('observacionesCita').value = '';
    document.getElementById('horaCita').selectedIndex = 0;
    document.getElementById('tecnicoCita').selectedIndex = 0;

    cerrarModal('modalAgendar');
    mostrarConfirmacionCita(fechaFormateada, hora, tecnico);
}

function mostrarModalOcupado(fecha, hora, tecnico) {
    var anterior = document.getElementById('modalOcupado');
    if (anterior) anterior.remove();

    var modal = document.createElement('div');
    modal.id = 'modalOcupado';
    modal.className = 'modal';
    modal.style.display = 'flex';

    var horas = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];
    var opciones = horas.filter(h => h !== hora).map(h =>
        '<button onclick="elegirOtraHora(\'' + h + '\'); document.getElementById(\'modalOcupado\').remove(); document.body.style.overflow=\'hidden\';" style="background:#1a1a1a; border:1px solid #333; color:#fff; padding:10px 16px; border-radius:8px; cursor:pointer; margin:4px; font-size:13px;">' + h + '</button>'
    ).join('');

    modal.innerHTML =
        '<div class="modal-contenido" style="max-width:480px; text-align:center;">' +
            '<div style="font-size:55px; margin-bottom:16px;">⏰</div>' +
            '<h2 style="color:#e63946; margin-bottom:10px;">Horario Ocupado</h2>' +
            '<p style="color:#aaa; margin-bottom:8px;">El técnico <strong style="color:#fff;">' + tecnico + '</strong> ya tiene una cita el <strong style="color:#fff;">' + fecha + '</strong> a las <strong style="color:#fff;">' + hora + '</strong>.</p>' +
            '<p style="color:#aaa; margin-bottom:20px;">Elige otro horario disponible:</p>' +
            '<div style="margin-bottom:20px;">' + opciones + '</div>' +
            '<button onclick="document.getElementById(\'modalOcupado\').remove(); document.body.style.overflow=\'auto\';" style="background:#333; color:#fff; border:none; padding:10px 24px; border-radius:8px; cursor:pointer;">Cancelar</button>' +
        '</div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    modal.addEventListener('click', function(e) {
        if (e.target === modal) { modal.remove(); document.body.style.overflow = 'auto'; }
    });
}

function elegirOtraHora(hora) {
    var select = document.getElementById('horaCita');
    if (select) select.value = hora;
}

async function enviarCorreoCompra(email, productos, total) {
    if (!usuarioActivo) return;
    try {
        await emailjs.send('service_9q186b4', 'template_1kg5d8g', {
            email: email,
            usuario_nombre: usuarioActivo.nombre,
            productos: productos,
            total: total
        });
    } catch (e) {
        console.log('Error correo compra:', e);
    }
}

async function enviarCorreoCita(fecha, hora, tecnico, observaciones, tipoMantenimiento) {
    if (!usuarioActivo) return;
    try {
        await emailjs.send('service_9q186b4', 'template_mi9zms9', {
            email: usuarioActivo.email,
            usuario_nombre: usuarioActivo.nombre,
            fecha: fecha,
            hora: hora,
            tecnico: tecnico,
            tipo_mantenimiento: tipoMantenimiento || 'No especificado',
            observaciones: observaciones || 'Ninguna'
        });
    } catch (e) {
        console.log('Error correo:', e);
    }
}

async function agregarCitaCalendario(fecha, hora, tecnico, observaciones, tipoMantenimiento) {
    if (!usuarioActivo) return;
    try {
        await fetch('https://hhjwavixqjdpkvuodumf.supabase.co/functions/v1/agregar-cita', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fecha: fecha,
                hora: hora,
                tecnico: tecnico,
                observaciones: observaciones,
                tipoMantenimiento: tipoMantenimiento || 'No especificado',
                usuarioEmail: usuarioActivo.email,
                usuarioNombre: usuarioActivo.nombre
            })
        });
    } catch (e) {
        console.log('Error calendario:', e);
    }
}

function mostrarConfirmacionCita(fecha, hora, tecnico) {
    
    var anterior = document.getElementById('modalConfirmacion');
    if (anterior) anterior.remove();

    var modal = document.createElement('div');
    modal.id = 'modalConfirmacion';
    modal.className = 'modal';
    modal.style.display = 'flex';

    modal.innerHTML =
        '<div class="modal-contenido" style="max-width:500px; text-align:center;">' +
            '<div style="font-size:60px; color:#e63946; margin-bottom:20px;"><i class="fas fa-check-circle"></i></div>' +
            '<h2 style="margin-bottom:15px;">¡CITA CONFIRMADA!</h2>' +
            '<p style="color:#aaa; margin-bottom:25px;">Tu cita ha sido agendada exitosamente. Nuestro equipo revisará el estado de tu moto y te informará el costo del servicio.</p>' +
            '<div style="background:#1a1a1a; border-radius:8px; padding:20px; text-align:left; margin-bottom:25px;">' +
                '<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #2a2a2a;">' +
                    '<span style="color:#888;">Fecha</span><strong>' + fecha + '</strong>' +
                '</div>' +
                '<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #2a2a2a;">' +
                    '<span style="color:#888;">Hora</span><strong>' + hora + '</strong>' +
                '</div>' +
                '<div style="display:flex; justify-content:space-between; padding:8px 0;">' +
                    '<span style="color:#888;">Técnico</span><strong>' + tecnico + '</strong>' +
                '</div>' +
            '</div>' +
            '<p style="color:#888; font-size:13px; margin-bottom:20px;">Te contactaremos al número registrado para confirmar tu cita.</p>' +
            '<button class="boton-confirmar" onclick="this.closest(\'.modal\').remove(); document.body.style.overflow=\'auto\';" style="width:100%;">ENTENDIDO</button>' +
        '</div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

function formatarTarjeta(input) {
    var valor = input.value.replace(/\D/g, '');
    var bloques = valor.match(/.{1,4}/g);
    if (bloques) input.value = bloques.join(' ');
}

async function guardarCitaEnDB(fecha, hora, tecnico, observaciones, tipoMantenimiento) {
    if (!usuarioActivo || !supabaseClient) return;
    await supabaseClient.from('citas').insert({
        usuario_email: usuarioActivo.email,
        usuario_nombre: usuarioActivo.nombre,
        fecha: fecha, hora: hora,
        tecnico: tecnico, observaciones: observaciones,
        tipo_mantenimiento: tipoMantenimiento || 'No especificado'
    });
}

async function guardarPedidoEnDB(productos, total) {
    if (!usuarioActivo || !supabaseClient) return;
    var productosGuardar = productos.map(function(p) { return { nombre: p.nombre, precio: p.precio }; });
    var { error } = await supabaseClient.from('pedidos').insert({
        usuario_email: usuarioActivo.email,
        usuario_nombre: usuarioActivo.nombre,
        productos: productosGuardar,
        total: total
    });
    if (error) console.log('Error guardando pedido:', error.message);
}

async function notificarAdminPedido(productos, total) {
    try {
        var productosTexto = productos.map(function(p) { return p.nombre + ' — ' + p.precio; }).join('\n');
        await emailjs.send('service_9q186b4', 'template_1kg5d8g', {
            email: 'kenner7894@gmail.com',
            usuario_nombre: 'ADMIN MOTO PRO',
            productos: '🛒 NUEVO PEDIDO de ' + (usuarioActivo ? usuarioActivo.email : 'cliente') + ':\n\n' + productosTexto,
            total: total
        });
    } catch(e) {
        console.log('Error notif admin:', e);
    }
}

// ===================== BUSCADOR Y FILTROS =====================
var filtroCategoria = 'todos';
var filtroPrecioMin = 0;
var filtroPrecioMax = 999999;

function filtrarCatalogo() {
    var texto = document.getElementById('buscadorCatalogo').value.toLowerCase();
    var tarjetas = document.querySelectorAll('#catalogo .tarjeta-producto');
    var visibles = 0;

    tarjetas.forEach(function(t) {
        var nombre = t.querySelector('h3').textContent.toLowerCase();
        var precioStr = t.querySelector('.precio').textContent.replace(/[^0-9]/g, '');
        var precio = parseInt(precioStr);
        var cat = t.dataset.cat || 'todos';

        var matchTexto = nombre.includes(texto);
        var matchCat = filtroCategoria === 'todos' || cat === filtroCategoria;
        var matchPrecio = precio >= filtroPrecioMin && precio <= filtroPrecioMax;

        if (matchTexto && matchCat && matchPrecio) {
            t.style.display = '';
            visibles++;
        } else {
            t.style.display = 'none';
        }
    });

    // Ocultar cabeceras de categorías vacías
    document.querySelectorAll('#catalogo .catalogo-categoria').forEach(function(h) {
        var cat = h.dataset.cat;
        var grid = h.nextElementSibling;
        if (grid) {
            var visiblesEnGrid = Array.from(grid.querySelectorAll('.tarjeta-producto')).filter(t => t.style.display !== 'none').length;
            h.style.display = visiblesEnGrid > 0 ? '' : 'none';
        }
    });

    document.getElementById('sinResultados').style.display = visibles === 0 ? 'block' : 'none';
}

function filtrarPorCategoria(cat, btn) {
    filtroCategoria = cat;
    document.querySelectorAll('.filtros-categoria .filtro-btn').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    filtrarCatalogo();
}

function filtrarPorPrecio(min, max, btn) {
    filtroPrecioMin = min;
    filtroPrecioMax = max;
    document.querySelectorAll('.filtros-precio .filtro-btn').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    filtrarCatalogo();
}

// ===================== HISTORIAL USUARIO =====================
async function abrirHistorial() {
    if (!usuarioActivo) { abrirModal('modalLogin'); return; }
    abrirModal('modalHistorial');
    mostrarTabHistorial('citas');
}

function mostrarTabHistorial(tab) {
    document.getElementById('historialCitas').style.display = tab === 'citas' ? 'block' : 'none';
    document.getElementById('historialPedidos').style.display = tab === 'pedidos' ? 'block' : 'none';
    document.getElementById('tabCitas').classList.toggle('activo', tab === 'citas');
    document.getElementById('tabPedidos').classList.toggle('activo', tab === 'pedidos');
    if (tab === 'citas') cargarMisCitas();
    else cargarMisPedidos();
}

async function cargarMisCitas() {
    var el = document.getElementById('historialCitas');
    var { data } = await supabaseClient.from('citas').select('*').eq('usuario_email', usuarioActivo.email).order('created_at', { ascending: false });
    if (!data || data.length === 0) { el.innerHTML = '<p style="color:#888; text-align:center; padding:30px;">No tienes citas agendadas.</p>'; return; }
    el.innerHTML = data.map(c => `
        <div style="background:#1a1a1a; border-radius:10px; padding:16px; margin-bottom:12px; border:1px solid #2a2a2a;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:#fff;">📅 ${c.fecha} — ${c.hora}</strong>
                    <p style="color:#888; margin:4px 0; font-size:13px;">🔧 Técnico: ${c.tecnico}</p>
                    ${c.observaciones ? `<p style="color:#888; font-size:13px;">📝 ${c.observaciones}</p>` : ''}
                </div>
                <span style="background:#e63946; color:#fff; padding:4px 12px; border-radius:20px; font-size:12px;">Confirmada</span>
            </div>
        </div>`).join('');
}

async function cargarMisPedidos() {
    var el = document.getElementById('historialPedidos');
    var { data } = await supabaseClient.from('pedidos').select('*').eq('usuario_email', usuarioActivo.email).order('created_at', { ascending: false });
    if (!data || data.length === 0) { el.innerHTML = '<p style="color:#888; text-align:center; padding:30px;">No tienes pedidos realizados.</p>'; return; }
    el.innerHTML = data.map(p => `
        <div style="background:#1a1a1a; border-radius:10px; padding:16px; margin-bottom:12px; border:1px solid #2a2a2a;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:#fff;">🛒 Pedido</strong>
                    <p style="color:#888; margin:4px 0; font-size:13px;">${new Date(p.created_at).toLocaleDateString('es-CO')}</p>
                </div>
                <strong style="color:#e63946; font-size:18px;">${p.total}</strong>
            </div>
        </div>`).join('');
}


async function procesarPago() {
    if (!usuarioActivo) {
        cerrarModal('modalPago');
        abrirModal('modalLogin');
        mostrarMensaje('Debes iniciar sesión para pagar');
        return;
    }
    var email = document.getElementById('emailPago').value.trim();
    var inputs = document.querySelectorAll('#modalPago .input-pago');
    var numero = inputs[1].value.replace(/\s/g, '');

    if (!email || !email.includes('@')) { alert('Por favor ingresa un correo válido para la confirmación'); return; }
    if (numero.length < 13) { alert('Número de tarjeta inválido'); return; }
    if (!inputs[2].value || inputs[2].value.length < 4) { alert('Ingresa la fecha de vencimiento (MM/AA)'); return; }
    if (!inputs[3].value || inputs[3].value.length < 3) { alert('Ingresa el CVV'); return; }
    if (!inputs[4].value) { alert('Ingresa el nombre en la tarjeta'); return; }

    var total = document.getElementById('carritoTotal').textContent;
    var productosTexto = carrito.map(function(p) { return p.nombre; }).join(', ');

    await guardarPedidoEnDB(carrito, total);
    enviarCorreoCompra(email, productosTexto, total);
    notificarAdminPedido(carrito, total);

    cerrarModal('modalPago');
    mostrarMensaje('¡Pago exitoso! Confirmación enviada a ' + email + ' ✓');

    carrito = [];
    totalProductos = 0;
    document.querySelector('.contador-carrito').textContent = '0';
    actualizarCarrito();
    document.getElementById('emailPago').value = '';
    inputs.forEach(function(i) { i.value = ''; });
}

function enviarFormulario(e) {
    e.preventDefault();
    mostrarMensaje('¡Mensaje enviado! Te contactaremos pronto ✓');
    e.target.reset();
}

// ===== HAMBURGUESA =====
function toggleMenu() {
    var menu = document.getElementById('navMenu');
    var btn = document.getElementById('hamburguesa');
    menu.classList.toggle('abierto');
    btn.classList.toggle('activo');
}
function cerrarMenu() {
    var menu = document.getElementById('navMenu');
    var btn = document.getElementById('hamburguesa');
    if (menu) menu.classList.remove('abierto');
    if (btn) btn.classList.remove('activo');
}

// ===== SELECTOR DE MOTO =====
function abrirSelectorMoto() {
    var selector = document.getElementById('selectorMoto');
    selector.style.display = 'flex';
}
function cerrarSelectorMoto() {
    document.getElementById('selectorMoto').style.display = 'none';
}
function elegirMoto(nombre) {
    document.getElementById('motoSeleccionada').textContent = '🏍️ ' + nombre;
    document.getElementById('motoSeleccionada').style.color = '#fff';
    cerrarSelectorMoto();
}
function elegirMotoPersonalizada() {
    var val = document.getElementById('motoPersonalizada').value.trim();
    if (val) { elegirMoto(val); document.getElementById('motoPersonalizada').value = ''; }
}

// ===== TIPO MANTENIMIENTO =====
function seleccionarTipoMant(tipo) {
    document.getElementById('lbl-preventivo').style.borderColor = tipo === 'preventivo' ? '#e63946' : '#333';
    document.getElementById('lbl-correctivo').style.borderColor = tipo === 'correctivo' ? '#e63946' : '#333';
    document.getElementById(tipo).checked = true;
}

document.addEventListener('DOMContentLoaded', function() {

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    emailjs.init('49igocWPXywuGIY3j');

    // Si viene de Google OAuth, cerrar modal y detectar sesión
    if (window.location.hash.includes('access_token')) {
        // Cerrar cualquier modal abierto
        document.querySelectorAll('.modal').forEach(function(m) { m.style.display = 'none'; });
        document.body.style.overflow = 'auto';
        supabaseClient.auth.getSession().then(function(res) {
            if (res.data && res.data.session) {
                var user = res.data.session.user;
                var nombre = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.nombre))
                    ? (user.user_metadata.full_name || user.user_metadata.nombre)
                    : user.email.split('@')[0];
                nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
                completarLogin(nombre, user.email, true);
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        });
    }

    // Cargar productos desde Supabase — renderiza secciones y catálogo dinámicamente
    supabaseClient.from('productos').select('*').order('nombre').then(function(res) {
        if (res.data && res.data.length > 0) {
            res.data.forEach(function(p) {
                productosDB[p.nombre] = p;
            });
            renderizarProductosWeb(res.data);
        } else {
            // Si Supabase está vacío o hay error, activar los productos hardcodeados
            document.querySelectorAll('.seccion-pagina .animado').forEach(function(el, i) {
                setTimeout(function() { el.classList.add('visible'); }, i * 20);
            });
        }
    });

    supabaseClient.auth.getSession().then(function(resultado) {
        if (resultado.data && resultado.data.session) {
            var user = resultado.data.session.user;
            var nombre = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.nombre))
                ? (user.user_metadata.full_name || user.user_metadata.nombre)
                : user.email.split('@')[0];
            nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
            completarLogin(nombre, user.email, false);
        }
    });

    // Detectar login nuevo (solo Google OAuth redirect, no recargas)
    supabaseClient.auth.onAuthStateChange(function(event, session) {
        if (event === 'SIGNED_IN' && session && window.location.hash.includes('access_token')) {
            if (!usuarioActivo) {
                var user = session.user;
                var nombre = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.nombre))
                    ? (user.user_metadata.full_name || user.user_metadata.nombre)
                    : user.email.split('@')[0];
                nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
                completarLogin(nombre, user.email, true);
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    });

    document.getElementById('carritoBtn').addEventListener('click', function(e) {
        e.preventDefault();
        abrirModal('modalCarrito');
    });

    document.getElementById('loginBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (usuarioActivo) {
            toggleDropdown();
        } else {
            abrirModal('modalLogin');
        }
    });

    var navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        navbar.style.boxShadow = window.scrollY > 50 ? '0 4px 20px rgba(0,0,0,0.7)' : 'none';
    });

    function activarAnimados() {
        var limite = window.innerHeight * 0.88;
        document.querySelectorAll('#paginaInicio .animado').forEach(function(el) {
            if (el.getBoundingClientRect().top < limite) el.classList.add('visible');
        });
    }

    window.addEventListener('scroll', activarAnimados);
    activarAnimados();

    var slideActual = 0;
    var slides = document.querySelectorAll('.carrusel-slide');
    var puntos = document.querySelectorAll('.punto');

    if (slides.length > 0) {
        window._slideActual = slideActual;

        window.irASlide = function(n) {
            slides[slideActual].classList.remove('activa');
            puntos[slideActual].classList.remove('activo');
            slideActual = (n + slides.length) % slides.length;
            window._slideActual = slideActual;
            slides[slideActual].classList.add('activa');
            puntos[slideActual].classList.add('activo');
        };

        var intervalo = setInterval(function() {
            window.irASlide(slideActual + 1);
        }, 5000);
    }
});
