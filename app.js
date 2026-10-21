
(function(){
var S = {config:{}, propiedades:[]};
var app = document.getElementById('app');
var CAN_EDIT = false, ART = null, ASSETS = null;
var galIdx = 0;
var adminOpen = false, adminTab = 'props', editing = null, adminMsg = '';

var TIPOS = ['Casa','Departamento','Terreno','Parcela','Oficina','Local comercial','Bodega'];
var ESTADOS = ['Disponible','Reservada','Vendida','Arrendada'];

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function n(x){ return Number(x||0).toLocaleString('es-CL'); }
function codigo(p){ return 'PN-' + String(p.codigo).padStart(3,'0'); }
function valorUF(){ var v = parseFloat(S.config.valorUF); return v > 0 ? v : 41194.55; }
function enUF(p){ return p.moneda === 'UF' ? p.precio : p.precio / valorUF(); }
function precio(p){
  if (!p.precio) return 'Precio a consultar';
  var u = enUF(p);
  return 'UF ' + (u >= 1000 ? Math.round(u).toLocaleString('es-CL') : u.toLocaleString('es-CL', {minimumFractionDigits:2, maximumFractionDigits:2}));
}
function precioPesos(p){
  if (!p.precio) return '';
  return (p.moneda === 'UF' ? 'Aprox. ' : '') + '$ ' + n(Math.round(precioCLP(p))) + sufijo(p);
}
function sufijo(p){ return p.operacion === 'Arriendo' ? ' / mes' : ''; }
function precioCLP(p){ return p.moneda === 'UF' ? p.precio*valorUF() : p.precio; }
function disponible(p){ return p.estado === 'Disponible' || p.estado === 'Reservada'; }

/* Iconos */
var I = {
  bed:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 18V7M3 13h18v5M21 18v-3a3 3 0 0 0-3-3h-7v4"/><circle cx="7" cy="10.5" r="1.6"/></svg>',
  bath:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/></svg>',
  area:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16"/><path d="M4 10h6v10"/></svg>',
  land:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 20l5-9 4 6 3-4 6 7z"/><circle cx="17" cy="6" r="2"/></svg>',
  car:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM5 11h14"/></svg>',
  pin:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  home:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>',
  key:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l2 2M15 8l2 2"/></svg>',
  tag:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/></svg>',
  chart:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  type:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 21V9l8-5 8 5v12M9 21v-6h6v6"/></svg>',
  waBig:'<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg>',
  wa:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg>'
};

/* Ilustración de respaldo cuando una propiedad no tiene fotos (estilo render) */
function ilustracion(tipo, seed){
  var P = [
    ['#8DB7D2','#E4EDF0','#93A883','#F5F2EC','#D6D0C4','#2F2F2D','#F7CB7A','#5E7A55'],
    ['#2E4260','#EBAA6A','#4F5E45','#EFE8DC','#C5BBAB','#262625','#FFC765','#3E5236'],
    ['#AFC0CC','#F1F2EF','#8EA17D','#FFFFFF','#D8DCDF','#45494F','#F2D18F','#56704D']
  ];
  var c = P[seed % 3], t = tipo || 'Casa', s = '';
  s += '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></linearGradient>'
     + '<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[6]+'"/><stop offset="1" stop-color="'+c[6]+'" stop-opacity=".55"/></linearGradient></defs>';
  s += '<rect width="800" height="600" fill="url(#sk)"/>';
  s += '<path d="M0 330 L90 270 L170 300 L260 230 L330 262 L420 205 L500 250 L590 215 L680 262 L800 228 V600 H0Z" fill="'+c[0]+'" opacity=".55"/>';
  s += '<path d="M228 247 L260 230 L292 247 L276 252 L260 244 Z M392 220 L420 205 L452 224 L432 228 L420 220 Z M565 228 L590 215 L615 230 L598 233 Z" fill="#FFFFFF" opacity=".75"/>';
  s += '<rect y="440" width="800" height="160" fill="'+c[2]+'"/>';
  var tree = function(x,y,r){ return '<rect x="'+(x-3)+'" y="'+(y)+'" width="6" height="'+(r*1.2)+'" fill="#3B2F25"/><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c[7]+'"/><circle cx="'+(x-r*.35)+'" cy="'+(y-r*.25)+'" r="'+(r*.55)+'" fill="#FFFFFF" opacity=".08"/>'; };
  if (t === 'Casa'){
    s += '<path d="M150 470 L640 470 L700 520 L100 520Z" fill="#000" opacity=".08"/>';
    s += '<rect x="180" y="300" width="440" height="170" fill="'+c[3]+'"/><rect x="540" y="300" width="80" height="170" fill="'+c[4]+'"/>';
    s += '<rect x="250" y="205" width="300" height="95" fill="'+c[3]+'"/><rect x="490" y="205" width="60" height="95" fill="'+c[4]+'"/>';
    s += '<rect x="235" y="194" width="330" height="13" fill="'+c[5]+'"/><rect x="165" y="290" width="470" height="13" fill="'+c[5]+'"/>';
    s += '<rect x="275" y="222" width="190" height="62" fill="url(#gl)"/><path d="M338 222V284M401 222V284" stroke="'+c[5]+'" stroke-width="3"/>';
    s += '<rect x="205" y="330" width="210" height="120" fill="url(#gl)"/><path d="M275 330V450M345 330V450" stroke="'+c[5]+'" stroke-width="3"/>';
    s += '<rect x="440" y="360" width="60" height="110" fill="'+c[5]+'"/><rect x="560" y="330" width="40" height="60" fill="url(#gl)" opacity=".8"/>';
    s += '<rect x="0" y="505" width="800" height="10" fill="#FFFFFF" opacity=".25"/>';
    s += tree(110,400,48) + tree(700,390,56) + tree(650,430,30);
  } else if (t === 'Departamento' || t === 'Oficina'){
    s += '<rect x="300" y="90" width="220" height="380" fill="'+c[3]+'"/><rect x="470" y="90" width="50" height="380" fill="'+c[4]+'"/>';
    for (var r=0;r<9;r++){ var y = 110 + r*40; s += '<rect x="312" y="'+y+'" width="150" height="26" fill="url(#gl)" opacity="'+(((r+seed)%3)?.95:.55)+'"/><rect x="292" y="'+(y+26)+'" width="236" height="6" fill="'+c[5]+'"/>'; }
    s += '<rect x="150" y="250" width="130" height="220" fill="'+c[4]+'" opacity=".9"/>';
    for (var k=0;k<5;k++) s += '<rect x="166" y="'+(270+k*38)+'" width="98" height="18" fill="url(#gl)" opacity=".6"/>';
    s += '<rect x="545" y="300" width="110" height="170" fill="'+c[4]+'" opacity=".75"/>';
    s += tree(110,420,40) + tree(700,420,44);
  } else if (t === 'Local comercial' || t === 'Bodega'){
    s += '<rect x="170" y="270" width="460" height="200" fill="'+c[3]+'"/><rect x="170" y="255" width="460" height="18" fill="'+c[5]+'"/>';
    s += '<path d="M190 300 H610 L590 330 H210Z" fill="#FDB200"/>';
    s += '<rect x="205" y="345" width="260" height="125" fill="url(#gl)"/><path d="M270 345V470M335 345V470M400 345V470" stroke="'+c[5]+'" stroke-width="3"/>';
    s += '<rect x="495" y="355" width="100" height="115" fill="'+c[5]+'"/>';
    s += tree(110,410,44) + tree(705,405,48);
  } else {
    s += '<path d="M0 430 Q200 395 400 425 T800 415 V600 H0Z" fill="'+c[2]+'" opacity=".85"/>';
    s += '<path d="M0 480 Q240 455 460 478 T800 470 V600 H0Z" fill="'+c[7]+'" opacity=".45"/>';
    for (var f=0;f<16;f++) s += '<rect x="'+(30+f*50)+'" y="476" width="5" height="40" fill="#5B4A3A"/>';
    s += '<rect x="30" y="486" width="760" height="3" fill="#5B4A3A"/><rect x="30" y="502" width="760" height="3" fill="#5B4A3A"/>';
    s += tree(560,360,62) + tree(470,390,38) + tree(180,380,46);
  }
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">'+s+'</svg>');
}
/* Portada ilustrada: cordillera y ciudad al atardecer */
function heroArte(){
  var r = function(i){ var x = Math.sin(i*91.7)*10000; return x - Math.floor(x); };
  var s = '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2433"/><stop offset=".55" stop-color="#4A4E63"/><stop offset=".85" stop-color="#C98B5A"/><stop offset="1" stop-color="#E9B074"/></linearGradient>'
    + '<linearGradient id="mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5D5A6C"/><stop offset="1" stop-color="#8A6E66"/></linearGradient></defs>';
  s += '<rect width="1600" height="900" fill="url(#sk)"/>';
  s += '<circle cx="1180" cy="560" r="120" fill="#F6C27E" opacity=".35"/>';
  s += '<path d="M0 560 L140 470 L260 520 L420 400 L560 470 L700 380 L860 455 L1000 360 L1140 440 L1300 390 L1460 450 L1600 410 V900 H0Z" fill="url(#mt)"/>';
  s += '<path d="M380 430 L420 400 L462 432 L440 436 L420 424 Z M660 410 L700 380 L742 412 L722 416 L700 404 Z M960 392 L1000 360 L1046 396 L1022 398 L1000 386 Z M1262 418 L1300 390 L1340 420 L1318 422 Z" fill="#F3E9E1" opacity=".85"/>';
  s += '<path d="M0 640 L200 590 L420 620 L640 570 L880 610 L1100 575 L1340 615 L1600 585 V900 H0Z" fill="#3B3842" opacity=".85"/>';
  var x = 0, i = 0;
  while (x < 1600){
    var w = 40 + r(i)*70, h = 60 + r(i+50)*180; if (r(i+90) > .93) h += 220;
    s += '<rect x="'+x+'" y="'+(760-h)+'" width="'+w+'" height="'+(h+140)+'" fill="#1E1F25"/>';
    for (var wy = 760-h+12; wy < 750; wy += 16) for (var wx = x+8; wx < x+w-8; wx += 12) if (r(wx*.7+wy) > .72) s += '<rect x="'+wx+'" y="'+wy+'" width="5" height="7" fill="#FDC56A" opacity="'+(.5+r(wx+wy)*.5)+'"/>';
    x += w + 4 + r(i+20)*14; i++;
  }
  s += '<rect y="760" width="1600" height="140" fill="#17181C"/>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">'+s+'</svg>');
}
var HERO_ARTE = null;
function src(f){ if (!f) return ''; if (typeof f === 'string') return f; return f.foto || (f.a ? '/_blob/' + f.a : f.d); }
function fotos(p){
  if (p.fotos && p.fotos.length) return p.fotos.map(src);
  return [ilustracion(p.tipo, p.codigo || 0)];
}
function waNumero(){
  var d = String(S.config.whatsapp||'').replace(/\D/g,'');
  if (d.length === 9 && d[0] === '9') d = '56' + d;
  return d;
}
function waLink(texto){
  var num = waNumero(); if (!num) return '';
  return 'https://wa.me/' + num + '?text=' + encodeURIComponent(texto);
}
function mapQuery(p){ return [p.direccion, p.sector, p.comuna, 'Chile'].filter(Boolean).join(', '); }
function mapLink(p){
  if (p.coordenadas && mapPunto(p) !== mapQuery(p)) return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapPunto(p));
  if (p.mapa && /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[a-z.]+)/i.test(p.mapa)) return p.mapa;
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery(p));
}
function mapPunto(p){ var c = String(p.coordenadas||'').replace(/\s/g,''); return /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(c) ? c : mapQuery(p); }
function mapEmbed(p){ return 'https://maps.google.com/maps?q=' + encodeURIComponent(mapPunto(p)) + '&z=15&output=embed'; }
function rutaLink(p){ return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(mapPunto(p)); }
/* Vista de mapa ilustrada: calles generadas a partir del código, con un pin en la ubicación */
function mapaSVG(seed){
  var r = function(i){ var x = Math.sin(seed*97.3 + i*13.7)*10000; return x - Math.floor(x); };
  var s = '<rect width="800" height="420" fill="#E9ECE4"/>';
  s += '<path d="M0 '+(260+r(1)*60)+' C200 '+(200+r(2)*80)+' 420 '+(330+r(3)*60)+' 800 '+(240+r(4)*80)+' V420 H0Z" fill="#DCE6D3"/>';
  s += '<ellipse cx="'+(120+r(5)*200)+'" cy="'+(90+r(6)*80)+'" rx="90" ry="55" fill="#CFE0C3"/>';
  s += '<path d="M'+(560+r(7)*120)+' 0 C'+(520+r(8)*100)+' 140 '+(640+r(9)*80)+' 260 '+(600+r(10)*120)+' 420" stroke="#B9D6E8" stroke-width="22" fill="none"/>';
  for (var i=0;i<7;i++){ var y = 30+i*62+r(20+i)*20; s += '<path d="M0 '+y+' L800 '+(y+(r(30+i)-.5)*60)+'" stroke="#FFFFFF" stroke-width="'+(i%3?7:12)+'"/>'; }
  for (var j=0;j<9;j++){ var x = 40+j*92+r(40+j)*30; s += '<path d="M'+x+' 0 L'+(x+(r(50+j)-.5)*80)+' 420" stroke="#FFFFFF" stroke-width="'+(j%4?6:12)+'"/>'; }
  s += '<path d="M0 '+(150+r(60)*80)+' L800 '+(120+r(61)*120)+'" stroke="#FCD77A" stroke-width="14"/>';
  s += '<circle cx="400" cy="210" r="46" fill="#FDB200" fill-opacity=".22"/>';
  s += '<path d="M400 236 C392 222 372 204 372 184 a28 28 0 0 1 56 0 C428 204 408 222 400 236Z" fill="#1D1D1B"/><circle cx="400" cy="184" r="10" fill="#FDB200"/>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">'+s+'</svg>');
}

/* ---------- Vistas ---------- */
var I2 = {
  ig:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  fb:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8z"/></svg>',
  mail:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  phone:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
  cam:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  arrow:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  grid:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>'
};
var filtro = {tipo:'', comuna:''}, buscaOp = 'Venta', lbIdx = null;

function igUrl(v){ return 'https://instagram.com/' + String(v).replace(/^@/,''); }
function fbUrl(v){ v = String(v||'').trim(); return /^https?:\/\//.test(v) ? v : 'https://facebook.com/' + v.replace(/^@/,''); }
function waA(texto, cls, inner){
  var wa = waLink(texto);
  return '<a class="'+cls+'" href="'+esc(wa||'#contacto')+'"'+(wa?' target="_blank" rel="noopener"':'')+'>'+inner+'</a>';
}

function header(){
  var c = S.config;
  var items = [['inicio','Inicio'],['venta','Venta'],['arriendo','Arriendo'],['servicios','Servicios'],['historia','Nosotros'],['contacto','Contacto']];
  var util = '<div class="util"><div class="wrap"><div class="util-l">'
    + (c.whatsapp ? waA('Hola Propiedades Nava, quiero más información.','u-item',I.wa+'<span class="num">'+esc(c.whatsapp)+'</span>') : '')
    + (c.telefono ? '<span class="u-item">'+I2.phone+'<span class="num">'+esc(c.telefono)+'</span></span>' : '')
    + (c.email ? '<span class="u-item">'+I2.mail+'<span>'+esc(c.email)+'</span></span>' : '')
    + '</div><div class="util-r"><span class="u-tag">Venta · Arriendo · Asesorías</span>'
    + (c.instagram ? '<a class="u-soc" href="'+esc(igUrl(c.instagram))+'" target="_blank" rel="noopener" aria-label="Instagram">'+I2.ig+'</a>' : '')
    + (c.facebook ? '<a class="u-soc" href="'+esc(fbUrl(c.facebook))+'" target="_blank" rel="noopener" aria-label="Facebook">'+I2.fb+'</a>' : '')
    + '</div></div></div>';
  return util + '<header class="top"><div class="wrap">'
    + '<a class="logo" href="#inicio" aria-label="Propiedades Nava, inicio"><span class="logo-mark">P<i>N</i></span><span class="logo-txt">Propiedades <b>Nava</b></span></a>'
    + '<nav class="nav" id="nav">'+items.map(function(i){return '<a href="#'+i[0]+'">'+i[1]+'</a>';}).join('')
    + waA('Hola Propiedades Nava, quiero publicar mi propiedad con ustedes.','nav-cta','Publica tu propiedad') + '</nav>'
    + '<button class="menu-btn" data-act="menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span><b>Menú</b></button>'
    + '</div></header>';
}
function waFlotante(){
  return waA('Hola Propiedades Nava, quiero más información.','wa-float',I.waBig+'<span>¿Hablamos?</span>');
}

function listado(op){
  return S.propiedades.filter(function(p){
    if (p.operacion !== op) return false;
    if (filtro.tipo && p.tipo !== filtro.tipo) return false;
    if (filtro.comuna && p.comuna !== filtro.comuna) return false;
    return true;
  }).sort(function(a,b){
    var da = disponible(a)?0:1, db = disponible(b)?0:1;
    if (da !== db) return da - db;
    if (a.destacada !== b.destacada) return a.destacada ? -1 : 1;
    return b.codigo - a.codigo;
  });
}

function specsCorto(p){
  var o = [];
  if (p.dormitorios) o.push('<span title="Dormitorios">'+I.bed+'<b>'+p.dormitorios+'</b> dorm.</span>');
  if (p.banos) o.push('<span title="Baños">'+I.bath+'<b>'+p.banos+'</b> baños</span>');
  if (p.m2utiles) o.push('<span title="Superficie útil" class="num">'+I.area+'<b>'+n(p.m2utiles)+'</b> m²</span>');
  if (p.m2terreno) o.push('<span title="Terreno" class="num">'+I.land+'<b>'+n(p.m2terreno)+'</b> m² terr.</span>');
  if (!o.length) o.push('<span>'+I.type+esc(p.tipo)+'</span>');
  return '<div class="specs">'+o.join('')+'</div>';
}

function card(p){
  var tags = '<span class="tag op">'+esc(p.operacion)+'</span>';
  if (p.estado !== 'Disponible') tags += '<span class="tag st">'+esc(p.estado)+'</span>';
  if (p.ejemplo) tags += '<span class="tag ex">Ejemplo</span>';
  var nf = (p.fotos||[]).length;
  return '<a class="card'+(disponible(p)?'':' out')+'" href="#'+esc(p.id)+'">'
    + '<div class="ph"><img src="'+esc(fotos(p)[0])+'" alt="'+esc(p.titulo)+'" loading="lazy"><div class="tags">'+tags+'</div>'
    + '<span class="cod num">'+codigo(p)+'</span>'+(nf>1?'<span class="nfotos">'+I2.cam+nf+'</span>':'')+'</div>'
    + '<div class="body"><div class="price num">'+precio(p)+'<small>'+sufijo(p)+'</small></div>'+(p.precio?'<div class="clp num">'+precioPesos(p)+'</div>':'')
    + '<h3>'+esc(p.titulo)+'</h3>'
    + '<div class="loc">'+I.pin+'<span>'+esc([p.sector,p.comuna].filter(Boolean).join(', '))+'</span></div>'
    + specsCorto(p)
    + '<div class="card-foot"><span>'+esc(p.tipo)+'</span><span class="ver">Ver detalle '+I2.arrow+'</span></div></div></a>';
}

function seccionLista(id, op, titulo, eyebrow, vacio){
  var list = listado(op);
  var activo = filtro.tipo || filtro.comuna;
  return '<section class="section lista'+(op==='Arriendo'?' alt':'')+'" id="'+id+'"><div class="wrap">'
    + '<div class="sec-head"><div><div class="kicker">'+eyebrow+'</div><h2>'+titulo+'</h2></div>'
    + '<div class="sec-side">'+(activo?'<span class="chip">'+esc([filtro.tipo,filtro.comuna].filter(Boolean).join(' · '))+'<button data-act="limpiar" aria-label="Quitar filtro">×</button></span>':'')
    + '<span class="count num">'+list.filter(disponible).length+' disponibles</span></div></div>'
    + (list.length ? '<div class="grid">'+list.map(card).join('')+'</div>' : '<div class="empty">'+(activo?'No hay propiedades con ese filtro. <button class="linkbtn" data-act="limpiar">Ver todas</button>':vacio)+'</div>')
    + '</div></section>';
}

function home(){
  var disp = S.propiedades.filter(disponible);
  var heroP = disp.filter(function(p){return p.destacada && p.fotos && p.fotos.length;})[0] || disp.filter(function(p){return p.fotos && p.fotos.length;})[0];
  var heroImg = heroP ? src(heroP.fotos[0]) : (HERO_ARTE || (HERO_ARTE = heroArte()));
  var comunas = Array.from(new Set(S.propiedades.map(function(p){return p.comuna;}).filter(Boolean))).sort();
  var c = S.config;

  var h = header();
  h += '<section class="hero" id="inicio"><img class="hero-bg" src="'+esc(heroImg)+'" alt=""><div class="hero-shade"></div>'
    + '<div class="wrap hero-in"><div class="hero-copy"><div class="kicker light">'+esc(c.zona||'Chile')+'</div><h1>'+esc(c.heroTitulo)+'</h1><p>'+esc(c.heroTexto)+'</p></div>'
    + '<form class="search" id="buscador" role="search"><div class="s-tabs" role="group" aria-label="Operación">'
    + '<button type="button" data-bop="Venta" aria-pressed="'+(buscaOp==='Venta')+'">Comprar</button><button type="button" data-bop="Arriendo" aria-pressed="'+(buscaOp==='Arriendo')+'">Arrendar</button></div>'
    + '<div class="s-fields"><label for="s-tipo">Tipo de propiedad<select id="s-tipo"><option value="">Todos los tipos</option>'+TIPOS.map(function(t){return '<option'+(filtro.tipo===t?' selected':'')+'>'+t+'</option>';}).join('')+'</select></label>'
    + '<label for="s-comuna">Comuna<select id="s-comuna"><option value="">Todas las comunas</option>'+comunas.map(function(t){return '<option'+(filtro.comuna===t?' selected':'')+'>'+esc(t)+'</option>';}).join('')+'</select></label>'
    + '<button class="btn s-go" type="submit">Buscar propiedades</button></div></form></div></section>';

  h += '<div class="facts"><div class="wrap">'
    + '<div class="fact">'+I.tag+'<div><strong>Venta</strong><small>Casas, deptos. y terrenos</small></div></div>'
    + '<div class="fact">'+I.key+'<div><strong>Arriendo</strong><small>Gestión completa</small></div></div>'
    + '<div class="fact">'+I.chart+'<div><strong>Asesoría financiera</strong><small>Crédito y financiamiento</small></div></div>'
    + '<div class="fact">'+I.home+'<div><strong>Asesoría inmobiliaria</strong><small>Compra e inversión</small></div></div>'
    + '</div></div>';

  h += seccionLista('venta','Venta','Propiedades en venta','Venta','Pronto publicaremos propiedades en venta. Escríbenos para saber qué tenemos disponible.');
  h += seccionLista('arriendo','Arriendo','Propiedades en arriendo','Arriendo','Pronto publicaremos propiedades en arriendo. Escríbenos para saber qué tenemos disponible.');

  var serv = [
    [I.tag,'Venta de propiedades','Tasamos, publicamos y mostramos tu propiedad. Te acompañamos en la negociación, la promesa y la escritura.','venta de mi propiedad'],
    [I.key,'Arriendos','Buscamos arrendatarios, revisamos antecedentes, redactamos el contrato y hacemos la entrega con inventario.','arriendo de mi propiedad'],
    [I.chart,'Asesoría financiera','Te orientamos sobre crédito hipotecario, pie, subsidios y capacidad de compra antes de decidir.','asesoría financiera'],
    [I.home,'Asesoría inmobiliaria','Te ayudamos a evaluar una compra o inversión, revisar títulos y entender cada paso del proceso.','asesoría inmobiliaria']
  ];
  h += '<section class="section servicios" id="servicios"><div class="wrap"><div class="sec-head center"><div><div class="kicker">Servicios</div><h2>Lo que hacemos por ti</h2></div></div>'
    + '<div class="serv-grid">'+serv.map(function(s){return '<div class="serv"><span class="ico">'+s[0]+'</span><h3>'+s[1]+'</h3><p>'+s[2]+'</p>'+waA('Hola Propiedades Nava, quiero información sobre '+s[3]+'.','serv-link','Consultar '+I2.arrow)+'</div>';}).join('')+'</div></div></section>';

  var histImg = (S.propiedades.filter(function(p){return p.fotos && p.fotos.length;})[1] || {}).fotos;
  h += '<section class="section historia" id="historia"><div class="wrap hist-grid">'
    + '<div class="hist-copy"><div class="kicker">Nuestra historia</div><h2>'+esc(c.historiaTitulo)+'</h2><p class="desc">'+esc(c.historiaTexto)+'</p></div>'
    + '<div class="hist-media"><img src="'+esc(histImg ? src(histImg[0]) : ilustracion('Casa',1))+'" alt="">'
    + '<div class="hist-card"><b>Propiedades Nava</b><ul><li>Venta de propiedades</li><li>Arriendos</li><li>Asesoría financiera</li><li>Asesoría inmobiliaria</li></ul></div></div>'
    + '</div></section>';

  h += '<section class="owner"><div class="wrap owner-in"><div><h2>¿Quieres vender o arrendar tu propiedad?</h2><p>Publicamos tu casa, departamento o terreno, coordinamos las visitas y te acompañamos hasta la firma.</p></div>'
    + waA('Hola Propiedades Nava, quiero vender o arrendar mi propiedad.','btn dark big',I.wa+' Conversemos por WhatsApp') + '</div></section>';

  h += '<section class="section contacto" id="contacto"><div class="wrap contact-grid">'
    + '<div class="c-info"><div class="kicker light">Contacto</div><h2>Hablemos de tu próxima propiedad</h2><p>Cuando nos escribas por una propiedad, menciona su código (por ejemplo PN-001) para atenderte más rápido.</p>'
    + '<div class="c-lines">'+contactLines()+'</div></div>'
    + '<div class="c-form"><h3>Escríbenos</h3>'
    + '<label for="h-nombre">Nombre<input id="h-nombre" autocomplete="name" placeholder="Tu nombre"></label>'
    + '<label for="h-int">Me interesa<select id="h-int"><option>Comprar una propiedad</option><option>Arrendar una propiedad</option><option>Vender mi propiedad</option><option>Arrendar mi propiedad</option><option>Asesoría financiera</option><option>Asesoría inmobiliaria</option></select></label>'
    + '<label for="h-msg">Mensaje<textarea id="h-msg" rows="4" placeholder="Cuéntanos qué buscas: comuna, presupuesto, dormitorios…"></textarea></label>'
    + waA(mensajeHome(),'btn wa full" id="h-send',I.wa+' Enviar por WhatsApp')
    + '<p class="note">Se abrirá WhatsApp con tu mensaje listo para enviar.</p></div>'
    + '</div></section>';
  h += pie();
  return h;
}
function mensajeHome(){
  var g = function(id){ var e = document.getElementById(id); return e ? e.value.trim() : ''; };
  var nm = g('h-nombre'), it = g('h-int') || 'Comprar una propiedad', m = g('h-msg');
  return 'Hola Propiedades Nava' + (nm ? ', soy ' + nm : '') + '. Me interesa: ' + it + '.' + (m ? ' ' + m : '');
}

function pie(){
  var c = S.config;
  return '<footer><div class="wrap foot-grid">'
    + '<div class="f-brand"><a class="logo light" href="#inicio"><span class="logo-mark">P<i>N</i></span><span class="logo-txt">Propiedades <b>Nava</b></span></a><p>Venta y arriendo de propiedades, asesoría financiera e inmobiliaria en '+esc(c.zona||'Chile')+'.</p>'
    + '<div class="f-soc">'+(c.instagram?'<a href="'+esc(igUrl(c.instagram))+'" target="_blank" rel="noopener" aria-label="Instagram">'+I2.ig+'</a>':'')+(c.facebook?'<a href="'+esc(fbUrl(c.facebook))+'" target="_blank" rel="noopener" aria-label="Facebook">'+I2.fb+'</a>':'')+(c.whatsapp?waA('Hola Propiedades Nava','',I.wa):'')+'</div></div>'
    + '<div><h4>Propiedades</h4><a href="#venta">En venta</a><a href="#arriendo">En arriendo</a><a href="#contacto">Publica tu propiedad</a></div>'
    + '<div><h4>Servicios</h4><a href="#servicios">Venta de propiedades</a><a href="#servicios">Arriendos</a><a href="#servicios">Asesoría financiera</a><a href="#servicios">Asesoría inmobiliaria</a></div>'
    + '<div><h4>Contacto</h4>'+(c.whatsapp?'<span class="num">WhatsApp '+esc(c.whatsapp)+'</span>':'')+(c.telefono?'<span class="num">Tel. '+esc(c.telefono)+'</span>':'')+(c.email?'<span>'+esc(c.email)+'</span>':'')+'<span>'+esc(c.zona||'')+'</span></div>'
    + '</div><div class="foot-bar"><div class="wrap"><span>© '+new Date().getFullYear()+' Propiedades Nava. Todos los derechos reservados.</span><span class="num">Precios en UF. Valor UF usado: $ '+valorUF().toLocaleString('es-CL',{minimumFractionDigits:2})+(S.config.fechaUF?' ('+esc(S.config.fechaUF)+')':'')+'.</span></div></div></footer>';
}

function contactLines(){
  var c = S.config, o = '';
  if (c.whatsapp) o += '<div class="line-item"><span class="li-ico">'+I.wa+'</span><div><small>WhatsApp</small><span class="val num">'+esc(c.whatsapp)+'</span></div><button class="copy" data-copy="'+esc(c.whatsapp)+'">Copiar</button></div>';
  if (c.telefono) o += '<div class="line-item"><span class="li-ico">'+I2.phone+'</span><div><small>Teléfono</small><span class="val num">'+esc(c.telefono)+'</span></div><button class="copy" data-copy="'+esc(c.telefono)+'">Copiar</button></div>';
  if (c.email) o += '<div class="line-item"><span class="li-ico">'+I2.mail+'</span><div><small>Correo</small><span class="val">'+esc(c.email)+'</span></div><button class="copy" data-copy="'+esc(c.email)+'">Copiar</button></div>';
  if (c.instagram) o += '<div class="line-item"><span class="li-ico">'+I2.ig+'</span><div><small>Instagram</small><a class="val" href="'+esc(igUrl(c.instagram))+'" target="_blank" rel="noopener">@'+esc(c.instagram.replace(/^@/,''))+'</a></div></div>';
  if (c.facebook) o += '<div class="line-item"><span class="li-ico">'+I2.fb+'</span><div><small>Facebook</small><a class="val" href="'+esc(fbUrl(c.facebook))+'" target="_blank" rel="noopener">'+esc(c.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//,''))+'</a></div></div>';
  return o || '<p class="note">Datos de contacto próximamente.</p>';
}

function detail(p){
  var fs = fotos(p);
  var op = p.operacion === 'Arriendo' ? 'arriendo' : 'venta';
  var ficha = [['Código',codigo(p),I.tag],['Tipo',p.tipo,I.type],['Operación',p.operacion,I.key],['Estado',p.estado,I.home]];
  if (p.dormitorios) ficha.push(['Dormitorios',p.dormitorios,I.bed]);
  if (p.banos) ficha.push(['Baños',p.banos,I.bath]);
  if (p.m2utiles) ficha.push(['Superficie útil',n(p.m2utiles)+' m²',I.area]);
  if (p.m2terreno) ficha.push(['Terreno',n(p.m2terreno)+' m²',I.land]);
  if (p.estac) ficha.push(['Estacionamientos',p.estac,I.car]);
  if (p.comuna) ficha.push(['Comuna',p.comuna,I.pin]);
  var msgDef = 'Hola Propiedades Nava, me interesa la propiedad código '+codigo(p)+': "'+p.titulo+'". ¿Sigue disponible?';
  var wa = waLink(msgDef);
  var mos = fs.slice(0,5);
  var h = header();
  h += '<section class="detalle"><div class="wrap">'
    + '<nav class="crumbs" aria-label="Ruta"><a href="#inicio">Inicio</a><span>›</span><a href="#'+op+'">'+(op==='venta'?'En venta':'En arriendo')+'</a><span>›</span><span>'+codigo(p)+'</span></nav>'
    + '<div class="d-head"><div><div class="d-tags"><span class="tag op">'+esc(p.operacion)+'</span><span class="tag code">'+codigo(p)+'</span>'+(p.estado!=='Disponible'?'<span class="tag st">'+esc(p.estado)+'</span>':'')+(p.ejemplo?'<span class="tag ex">Ejemplo</span>':'')+'</div>'
    + '<h1>'+esc(p.titulo)+'</h1><div class="d-loc">'+I.pin+esc([p.sector,p.comuna].filter(Boolean).join(', '))+'</div></div>'
    + '<div class="d-price"><small>'+(p.operacion==='Arriendo'?'Arriendo mensual':'Precio de venta')+'</small><strong class="num">'+precio(p)+'<em>'+sufijo(p)+'</em></strong>'+(p.precio?'<span class="num">'+precioPesos(p)+'</span>':'')+'</div></div>'
    + '<div class="mosaic n'+mos.length+'">'+mos.map(function(s,i){return '<button class="m-item" data-lb="'+i+'" aria-label="Ver foto '+(i+1)+'"><img src="'+esc(s)+'" alt="'+(i?'':esc(p.titulo))+'"'+(i?' loading="lazy"':'')+'></button>';}).join('')
    + '<button class="m-all" data-lb="0">'+I2.grid+' Ver '+(fs.length>1?'las '+fs.length+' fotos':'foto')+'</button></div>'
    + '<div class="d-cols"><div class="d-main">'
    + '<div class="d-block"><h2>Ficha técnica</h2><div class="ficha">'+ficha.map(function(f){return '<div>'+f[2]+'<span><small>'+f[0]+'</small><strong class="num">'+esc(f[1])+'</strong></span></div>';}).join('')+'</div></div>'
    + '<div class="d-block"><h2>Descripción</h2><p class="desc">'+esc(p.descripcion||'')+'</p></div>'
    + ((p.caracteristicas||[]).length?'<div class="d-block"><h2>Características</h2><ul class="feat">'+p.caracteristicas.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div>':'')
    + (p.comuna || p.coordenadas || p.direccion ? '<div class="d-block"><h2>Ubicación</h2>'
    + '<div class="mapa-embed"><iframe title="Mapa de '+esc(p.titulo)+'" src="'+esc(mapEmbed(p))+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>'
    + '<div class="mapa-acts"><a class="btn" href="'+esc(mapLink(p))+'" target="_blank" rel="noopener">Abrir en Google Maps</a><a class="btn ghost" href="'+esc(rutaLink(p))+'" target="_blank" rel="noopener">Cómo llegar</a></div></div>' : '')
    + '</div><aside class="panel"><div class="p-price"><small>'+(p.operacion==='Arriendo'?'Arriendo mensual':'Precio de venta')+'</small><strong class="num">'+precio(p)+'<em>'+sufijo(p)+'</em></strong>'+(p.precio?'<span class="num clp-p">'+precioPesos(p)+'</span>':'')+'<span>Código <b>'+codigo(p)+'</b></span></div>'
    + '<h3>¿Te interesa esta propiedad?</h3>';
  if (wa){
    h += '<label for="c-nombre">Tu nombre<input id="c-nombre" autocomplete="name" placeholder="Ej: Camila Rojas"></label>'
      + '<label for="c-msg">Mensaje<textarea id="c-msg" rows="4">'+esc(msgDef)+'</textarea></label>'
      + '<a class="btn wa full" id="c-send" href="'+esc(wa)+'" target="_blank" rel="noopener">'+I.wa+' Enviar por WhatsApp</a>'
      + '<p class="note">Se abrirá WhatsApp con tu mensaje y el código de la propiedad.</p>';
  }
  h += '<div class="p-lines">'+contactLines()+'</div></aside></div></div></section>';
  var otras = S.propiedades.filter(function(x){ return x.id !== p.id && x.operacion === p.operacion && disponible(x); }).slice(0,3);
  if (otras.length) h += '<section class="section lista alt"><div class="wrap"><div class="sec-head"><div><div class="kicker">También te puede interesar</div><h2>Otras propiedades en '+op+'</h2></div></div><div class="grid">'+otras.map(card).join('')+'</div></div></section>';
  h += pie();
  if (lbIdx != null){
    var i = Math.min(lbIdx, fs.length-1);
    h += '<div class="lb" role="dialog" aria-label="Fotos de la propiedad"><div class="lb-top"><span class="num">'+(i+1)+' / '+fs.length+' · '+codigo(p)+'</span><button data-act="lb-cerrar" aria-label="Cerrar">✕</button></div>'
      + '<div class="lb-stage"><img src="'+esc(fs[i])+'" alt="">'+(fs.length>1?'<button class="lb-nav prev" data-lbmove="-1" aria-label="Foto anterior">‹</button><button class="lb-nav next" data-lbmove="1" aria-label="Foto siguiente">›</button>':'')+'</div>'
      + (fs.length>1?'<div class="lb-thumbs">'+fs.map(function(s,k){return '<button data-lb="'+k+'" aria-current="'+(k===i)+'"><img src="'+esc(s)+'" alt=""></button>';}).join('')+'</div>':'')+'</div>';
  }
  return h;
}

/* ---------- Administración ---------- */
function adminView(){
  var h = '<div class="admin" role="dialog" aria-label="Administrar propiedades"><div class="admin-top"><div class="wrap"><h2>Administrar</h2>'
    + '<div class="seg"><button data-tab="props" aria-pressed="'+(adminTab==='props')+'">Propiedades</button><button data-tab="config" aria-pressed="'+(adminTab==='config')+'">Contacto, portada e historia</button></div>'
    + '<button class="btn ghost small" data-act="cerrar-admin">Cerrar</button></div></div><div class="wrap a-body">';
  if (adminMsg) h += '<div class="msg'+(adminMsg.err?' err':'')+'">'+esc(adminMsg.t||adminMsg)+'</div>';
  if (!S.config.whatsapp) h += '<div class="msg">Agrega tu número de WhatsApp en <b>Contacto, portada e historia</b> para que los interesados puedan escribirte desde cada propiedad.</div>';
  if (adminTab === 'config') h += configForm();
  else if (editing) h += propForm(editing);
  else {
    h += '<div class="form-actions"><button class="btn" data-act="nueva">+ Publicar nueva propiedad</button>'
      + (S.propiedades.some(function(p){return p.ejemplo;})?'<button class="btn danger" data-act="borrar-ejemplos">Quitar propiedades de ejemplo</button>':'')+'</div>';
    h += S.propiedades.length ? S.propiedades.slice().sort(function(a,b){return b.codigo-a.codigo;}).map(function(p){
      return '<div class="row"><img src="'+esc(fotos(p)[0])+'" alt=""><div class="info"><b>'+esc(p.titulo)+(p.ejemplo?' <span class="tag ex">Ejemplo</span>':'')+'</b><span>'+codigo(p)+' · '+esc(p.operacion)+' · '+esc(p.comuna)+' · '+precio(p)+' · '+esc(p.estado)+'</span></div>'
        + '<div class="acts"><a class="btn ghost small" href="#'+esc(p.id)+'" data-act="cerrar-admin">Ver</a><button class="btn ghost small" data-edit="'+esc(p.id)+'">Editar</button><button class="btn danger small" data-del="'+esc(p.id)+'">Eliminar</button></div></div>';
    }).join('') : '<div class="empty">Aún no tienes propiedades publicadas.</div>';
  }
  return h + '</div></div>';
}

function opt(list, v){ return list.map(function(x){return '<option'+(x===v?' selected':'')+'>'+esc(x)+'</option>';}).join(''); }
function propForm(p){
  return '<form class="form" id="prop-form">'
    + '<div class="c6"><div class="eyebrow">'+(p.id?'Editar '+codigo(p):'Nueva propiedad')+'</div></div>'
    + '<label class="c6" for="f-titulo">Título<input id="f-titulo" required value="'+esc(p.titulo)+'" placeholder="Ej: Casa con patio en Maipú"></label>'
    + '<label class="c2" for="f-operacion">Operación<select id="f-operacion">'+opt(['Venta','Arriendo'],p.operacion)+'</select></label>'
    + '<label class="c2" for="f-tipo2">Tipo<select id="f-tipo2">'+opt(TIPOS,p.tipo)+'</select></label>'
    + '<label class="c2" for="f-estado">Estado<select id="f-estado">'+opt(ESTADOS,p.estado)+'</select></label>'
    + '<label class="c2" for="f-moneda">Moneda<select id="f-moneda">'+opt(['UF','CLP'],p.moneda)+'</select></label>'
    + '<label class="c2" for="f-precio">Precio'+' <input id="f-precio" type="number" min="0" step="any" value="'+esc(p.precio||'')+'" placeholder="Ej: 4500"></label>'
    + '<label class="c2 chk" for="f-dest"><input id="f-dest" type="checkbox"'+(p.destacada?' checked':'')+'> Destacada en portada</label>'
    + '<label class="c2" for="f-comuna2">Comuna<input id="f-comuna2" value="'+esc(p.comuna)+'" placeholder="Ej: Puente Alto"></label>'
    + '<label class="c2" for="f-sector">Sector o barrio<input id="f-sector" value="'+esc(p.sector)+'" placeholder="Ej: Cerca de metro Las Mercedes"></label>'
    + '<label class="c2" for="f-dir">Dirección (no se muestra, se usa para el mapa)<input id="f-dir" value="'+esc(p.direccion)+'" placeholder="Calle y número"></label>'
    + '<label class="c6" for="f-mapa">Enlace de Google Maps (opcional, para marcar el punto exacto)<input id="f-mapa" value="'+esc(p.mapa||'')+'" placeholder="Pega aquí el enlace de Compartir de Google Maps, ej: https://maps.app.goo.gl/..."></label>'
    + '<label class="c2" for="f-dorm">Dormitorios<input id="f-dorm" type="number" min="0" value="'+esc(p.dormitorios||'')+'"></label>'
    + '<label class="c2" for="f-banos">Baños<input id="f-banos" type="number" min="0" value="'+esc(p.banos||'')+'"></label>'
    + '<label class="c2" for="f-estac">Estacionamientos<input id="f-estac" type="number" min="0" value="'+esc(p.estac||'')+'"></label>'
    + '<label class="c3" for="f-m2u">m² útiles<input id="f-m2u" type="number" min="0" value="'+esc(p.m2utiles||'')+'"></label>'
    + '<label class="c3" for="f-m2t">m² terreno<input id="f-m2t" type="number" min="0" value="'+esc(p.m2terreno||'')+'"></label>'
    + '<label class="c6" for="f-desc">Descripción<textarea id="f-desc" rows="6">'+esc(p.descripcion)+'</textarea></label>'
    + '<label class="c6" for="f-car">Características (una por línea)<textarea id="f-car" rows="4" placeholder="Piscina&#10;Quincho&#10;Bodega">'+esc((p.caracteristicas||[]).join('\n'))+'</textarea></label>'
    + '<div class="c6" style="display:grid;gap:8px"><div class="eyebrow" style="color:var(--muted)">Fotos — la primera es la portada</div><div class="photos" id="photos">'+photosHTML(p)+'</div><input id="f-fotos" type="file" accept="image/*" multiple hidden><p class="note" id="foto-status"></p></div>'
    + '<div class="c6 form-actions"><button class="btn" type="submit" id="guardar">Guardar y publicar</button><button class="btn ghost" type="button" data-act="cancelar">Cancelar</button></div>'
    + '</form>';
}
function photosHTML(p){
  return (p.fotos||[]).map(function(f,i){
    return '<div class="photo"><img src="'+esc(src(f))+'" alt="">'+(i===0?'<span class="tag cover">Portada</span>':'')
      + '<div class="pa">'+(i>0?'<button type="button" data-cover="'+i+'">Portada</button>':'<span></span>')+'<button type="button" data-rmfoto="'+i+'">Quitar</button></div></div>';
  }).join('') + '<label class="drop" for="f-fotos">+ Agregar fotos</label>';
}
function configForm(){
  var c = S.config;
  return '<form class="form" id="config-form">'
    + '<label class="c3" for="k-wa">WhatsApp<input id="k-wa" value="'+esc(c.whatsapp)+'" placeholder="+56 9 1234 5678"></label>'
    + '<label class="c3" for="k-tel">Teléfono<input id="k-tel" value="'+esc(c.telefono)+'" placeholder="+56 2 2345 6789"></label>'
    + '<label class="c3" for="k-email">Correo<input id="k-email" type="email" value="'+esc(c.email)+'" placeholder="contacto@propiedadesnava.cl"></label>'
    + '<label class="c3" for="k-ig">Instagram<input id="k-ig" value="'+esc(c.instagram)+'" placeholder="@propiedadesnava"></label>'
    + '<label class="c3" for="k-fb">Facebook (página o enlace)<input id="k-fb" value="'+esc(c.facebook)+'" placeholder="facebook.com/propiedadesnava"></label>'
    + '<label class="c3" for="k-zona">Zona donde trabajas<input id="k-zona" value="'+esc(c.zona)+'"></label>'
    + '<label class="c6" for="k-ht">Título de portada<input id="k-ht" value="'+esc(c.heroTitulo)+'"></label>'
    + '<label class="c6" for="k-hx">Texto de portada<textarea id="k-hx" rows="3">'+esc(c.heroTexto)+'</textarea></label>'
    + '<label class="c6" for="k-hit">Título de "Nuestra historia"<input id="k-hit" value="'+esc(c.historiaTitulo)+'"></label>'
    + '<label class="c3" for="k-uf">Valor de la UF en pesos<input id="k-uf" inputmode="decimal" value="'+esc(S.config.valorUF||'')+'" placeholder="41194.55"></label>'
    + '<label class="c3" for="k-ufd">Fecha de ese valor<input id="k-ufd" value="'+esc(S.config.fechaUF||'')+'" placeholder="21-10-2026"></label>'
    + '<label class="c6" for="k-hix">Texto de "Nuestra historia" (deja una línea en blanco entre párrafos)<textarea id="k-hix" rows="8">'+esc(c.historiaTexto)+'</textarea></label>'
    + '<div class="c6 form-actions"><button class="btn" type="submit" id="guardar">Guardar y publicar</button></div></form>';
}

/* ---------- Publicar (guarda una nueva versión de la página) ---------- */
var RESET = ':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.4 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}';
function documento(state){
  var css = document.getElementById('estilos').textContent;
  var js = document.getElementById('main').textContent;
  var json = JSON.stringify(state).replace(/</g,'\\u003c');
  return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'+RESET+'</style></head><body>'
    + '<title>Propiedades Nava</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
    + '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap">\n'
    + '<style id="estilos">'+css+'</style>\n<div id="app" lang="es"></div>\n'
    + '<script type="application/json" id="datos">'+json+'<\/script>\n<script id="main">'+js+'<\/script>'
    + '</body></html>';
}
function publicar(nuevo, okTexto){
  var b = document.getElementById('guardar'); if (b){ b.disabled = true; b.textContent = 'Publicando…'; }
  if (!ART){ fallo('Publicar no está disponible en esta vista. Abre la página desde tu cuenta de Claude.'); return; }
  try { sessionStorage.setItem('jn-admin', JSON.stringify({open:true, tab:adminTab, msg:okTexto})); } catch(e){}
  ART.publish(documento(nuevo)).catch(function(err){
    try { sessionStorage.removeItem('jn-admin'); } catch(e){}
    var c = err && err.code;
    if (c === 'conflict') fallo('Otra versión se guardó al mismo tiempo. La página se está recargando; vuelve a intentar tu cambio.');
    else if (c === 'not_writer' || c === 'not_granted') fallo('Tu cuenta no tiene permiso para publicar cambios en esta página.');
    else fallo('No se pudo publicar ('+(err && (err.message||c) || 'error')+'). Revisa tu conexión e inténtalo otra vez.');
  });
}
function fallo(t){
  adminMsg = {t:t, err:true};
  var b = document.getElementById('guardar'); if (b){ b.disabled = false; b.textContent = 'Guardar y publicar'; }
  var body = document.querySelector('.a-body'); if (body){ var m = body.querySelector('.msg.err') || document.createElement('div'); m.className = 'msg err'; m.textContent = t; body.prepend(m); m.scrollIntoView({block:'center'}); }
}

/* ---------- Fotos ---------- */
function comprimir(file, max, q){
  return new Promise(function(res, rej){
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function(){
      var s = Math.min(1, max / Math.max(img.width, img.height));
      var cv = document.createElement('canvas'); cv.width = Math.round(img.width*s); cv.height = Math.round(img.height*s);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
      cv.toBlob(function(b){ b ? res({blob:b, canvas:cv}) : rej(new Error('blob')); }, 'image/jpeg', q);
    };
    img.onerror = function(){ rej(new Error('No se pudo leer la imagen')); };
    img.src = url;
  });
}
function subirFotos(files){
  var st = document.getElementById('foto-status');
  var arr = Array.from(files), i = 0;
  function next(){
    if (i >= arr.length){ st.textContent = arr.length + ' foto(s) agregadas. Recuerda guardar.'; return; }
    st.textContent = 'Procesando foto ' + (i+1) + ' de ' + arr.length + '…';
    var f = arr[i++];
    var job = ASSETS
      ? comprimir(f, 1800, .82).then(function(r){ return ASSETS.upload(r.blob).then(function(u){ return {a:u.id}; }); })
      : comprimir(f, 1200, .7).then(function(r){ return {d:r.canvas.toDataURL('image/jpeg', .7)}; });
    job.then(function(foto){ editing.fotos.push(foto); refrescarFotos(); next(); })
       .catch(function(e){ st.textContent = 'No se pudo subir "'+f.name+'": '+(e.message||e.code||'error')+'. Prueba con otra imagen.'; next(); });
  }
  next();
}
function refrescarFotos(){ var el = document.getElementById('photos'); if (el) el.innerHTML = photosHTML(editing); }
function leerForm(){
  var g = function(id){ return document.getElementById(id).value.trim(); };
  var num = function(id){ var v = parseFloat(g(id)); return isNaN(v) ? 0 : v; };
  editing.titulo = g('f-titulo'); editing.operacion = g('f-operacion'); editing.tipo = g('f-tipo2'); editing.estado = g('f-estado');
  editing.moneda = g('f-moneda'); editing.precio = num('f-precio'); editing.destacada = document.getElementById('f-dest').checked;
  editing.comuna = g('f-comuna2'); editing.sector = g('f-sector'); editing.direccion = g('f-dir'); editing.mapa = g('f-mapa');
  editing.dormitorios = num('f-dorm'); editing.banos = num('f-banos'); editing.estac = num('f-estac');
  editing.m2utiles = num('f-m2u'); editing.m2terreno = num('f-m2t');
  editing.descripcion = document.getElementById('f-desc').value.trim();
  editing.caracteristicas = document.getElementById('f-car').value.split('\n').map(function(s){return s.trim();}).filter(Boolean);
}
function copia(){ return JSON.parse(JSON.stringify(S)); }

/* ---------- Render y eventos ---------- */
function render(){
  var id = (location.hash||'').slice(1);
  var p = S.propiedades.filter(function(x){return x.id === id;})[0];
  if (!p) lbIdx = null;
  var h = p ? detail(p) : home();
  h += waFlotante();
  if (CAN_EDIT) h += adminOpen ? adminView() : '<button class="btn dark admin-fab" data-act="abrir-admin">Administrar propiedades</button>';
  app.innerHTML = h;
  document.body.style.overflow = (lbIdx != null || adminOpen) ? 'hidden' : '';
  document.title = p ? p.titulo + ' · ' + codigo(p) + ' · Propiedades Nava' : 'Propiedades Nava';
}
function propActual(){ var id = location.hash.slice(1); return S.propiedades.filter(function(x){return x.id===id;})[0]; }
var lastHash = location.hash;
window.addEventListener('hashchange', function(){
  var id = location.hash.slice(1), isP = S.propiedades.some(function(x){return x.id===id;}), wasP = S.propiedades.some(function(x){return x.id===lastHash.slice(1);});
  lastHash = location.hash; lbIdx = null;
  var nv = document.getElementById('nav'); if (nv) nv.classList.remove('open');
  if (isP || wasP){ render(); if (isP) window.scrollTo(0,0); else { var t = document.getElementById(id||'inicio'); if (t) t.scrollIntoView(); } }
});
document.addEventListener('keydown', function(e){
  if (lbIdx == null) return;
  var p = propActual(); if (!p) return; var nf = fotos(p).length;
  if (e.key === 'Escape'){ lbIdx = null; render(); }
  else if (e.key === 'ArrowRight' && nf > 1){ lbIdx = (lbIdx+1) % nf; render(); }
  else if (e.key === 'ArrowLeft' && nf > 1){ lbIdx = (lbIdx-1+nf) % nf; render(); }
});

app.addEventListener('click', function(e){
  var t = e.target.closest('button, a'); if (!t) return;
  if (t.dataset.lb != null){ lbIdx = +t.dataset.lb; render(); return; }
  if (t.dataset.lbmove){ var nf = fotos(propActual()).length; lbIdx = (lbIdx + (+t.dataset.lbmove) + nf) % nf; render(); return; }
  if (t.dataset.bop){ buscaOp = t.dataset.bop; document.querySelectorAll('[data-bop]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.bop===buscaOp)); }); return; }
  if (t.dataset.copy != null){
    var val = t.dataset.copy, ok = function(){ t.textContent = 'Copiado'; setTimeout(function(){ t.textContent = 'Copiar'; }, 1500); };
    var sel = function(){ var v = t.parentNode.querySelector('.val'); var r = document.createRange(); r.selectNodeContents(v); var s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try { navigator.clipboard.writeText(val).then(ok, sel); } catch(err){ sel(); }
    return;
  }
  var a = t.dataset.act;
  if (a === 'lb-cerrar'){ lbIdx = null; render(); return; }
  if (a === 'limpiar'){ var sec = t.closest('section'); filtro = {tipo:'', comuna:''}; render(); var el = sec && document.getElementById(sec.id); if (el) el.scrollIntoView(); return; }
  if (a === 'menu'){ var nv = document.getElementById('nav'); var op = nv.classList.toggle('open'); t.setAttribute('aria-expanded', String(op)); return; }
  if (t.closest('.nav')){ var nv2 = document.getElementById('nav'); nv2.classList.remove('open'); }
  if (a === 'abrir-admin'){ adminOpen = true; adminMsg = ''; render(); return; }
  if (a === 'cerrar-admin'){ adminOpen = false; editing = null; if (t.tagName === 'BUTTON') render(); else setTimeout(render); return; }
  if (t.dataset.tab){ adminTab = t.dataset.tab; editing = null; adminMsg = ''; render(); return; }
  if (a === 'nueva'){ editing = {id:'', titulo:'', operacion:'Venta', tipo:'Casa', estado:'Disponible', destacada:false, moneda:'UF', precio:0, comuna:'', sector:'', direccion:'', mapa:'', dormitorios:0, banos:0, m2utiles:0, m2terreno:0, estac:0, descripcion:'', caracteristicas:[], fotos:[]}; adminMsg=''; render(); var ad = document.querySelector('.admin'); if (ad) ad.scrollTop = 0; return; }
  if (a === 'cancelar'){ editing = null; adminMsg = ''; render(); return; }
  if (t.dataset.edit){ editing = JSON.parse(JSON.stringify(S.propiedades.filter(function(x){return x.id===t.dataset.edit;})[0])); adminMsg=''; render(); return; }
  if (t.dataset.del){
    if (t.dataset.confirm !== '1'){ t.dataset.confirm = '1'; t.textContent = '¿Seguro? Eliminar'; return; }
    var s = copia(); s.propiedades = s.propiedades.filter(function(x){return x.id !== t.dataset.del;});
    t.disabled = true; t.textContent = 'Eliminando…'; t.id = 'guardar';
    publicar(s, 'Propiedad eliminada.'); return;
  }
  if (a === 'borrar-ejemplos'){
    if (t.dataset.confirm !== '1'){ t.dataset.confirm = '1'; t.textContent = '¿Seguro? Quitar ejemplos'; return; }
    var s2 = copia(); s2.propiedades = s2.propiedades.filter(function(x){return !x.ejemplo;}); t.id = 'guardar';
    publicar(s2, 'Se quitaron las propiedades de ejemplo.'); return;
  }
  if (t.dataset.cover != null){ var i = +t.dataset.cover; var f = editing.fotos.splice(i,1)[0]; editing.fotos.unshift(f); refrescarFotos(); return; }
  if (t.dataset.rmfoto != null){ editing.fotos.splice(+t.dataset.rmfoto,1); refrescarFotos(); return; }
});

app.addEventListener('change', function(e){
  var id = e.target.id;
  if (id === 'f-fotos' && e.target.files.length){ subirFotos(e.target.files); e.target.value = ''; }
});
app.addEventListener('input', function(e){
  var id = e.target.id;
  if (id === 'c-nombre' || id === 'c-msg'){
    var nm = document.getElementById('c-nombre').value.trim(), m = document.getElementById('c-msg').value.trim();
    var txt = nm ? m.replace(/^Hola Propiedades Nava,/, 'Hola Propiedades Nava, soy ' + nm + '.') : m;
    if (nm && txt === m) txt = 'Soy ' + nm + '. ' + m;
    document.getElementById('c-send').href = waLink(txt);
  }
  if (id === 'h-nombre' || id === 'h-int' || id === 'h-msg'){
    var l = waLink(mensajeHome()); if (l) document.getElementById('h-send').href = l;
  }
});
app.addEventListener('submit', function(e){
  e.preventDefault();
  if (e.target.id === 'buscador'){
    filtro = {tipo: document.getElementById('s-tipo').value, comuna: document.getElementById('s-comuna').value};
    render(); var dest = document.getElementById(buscaOp === 'Arriendo' ? 'arriendo' : 'venta'); if (dest) dest.scrollIntoView();
    return;
  }
  if (e.target.id === 'prop-form'){
    leerForm();
    if (!editing.titulo){ fallo('Escribe un título para la propiedad.'); return; }
    if (!editing.comuna){ fallo('Indica la comuna de la propiedad.'); return; }
    var s = copia();
    if (editing.id){
      s.propiedades = s.propiedades.map(function(x){ return x.id === editing.id ? editing : x; });
    } else {
      s.seq = (s.seq||0) + 1; editing.codigo = s.seq; editing.id = 'p' + s.seq + Date.now().toString(36);
      editing.creada = new Date().toISOString().slice(0,10); s.propiedades.push(editing);
    }
    publicar(s, 'Listo: "' + editing.titulo + '" está publicada.');
  }
  if (e.target.id === 'config-form'){
    var s3 = copia(), g = function(id){ return document.getElementById(id).value.trim(); };
    s3.config = {whatsapp:g('k-wa'), telefono:g('k-tel'), email:g('k-email'), instagram:g('k-ig'), zona:g('k-zona'), heroTitulo:g('k-ht') || S.config.heroTitulo, heroTexto:g('k-hx'), facebook:g('k-fb'), historiaTitulo:g('k-hit') || S.config.historiaTitulo, historiaTexto:document.getElementById('k-hix').value.trim(), valorUF:parseFloat(g('k-uf').replace(/\./g,'').replace(',','.')) || S.config.valorUF, fechaUF:g('k-ufd')};
    publicar(s3, 'Datos de contacto y portada guardados.');
  }
});

function normalizar(p){
  p.codigo = parseInt(p.codigo,10) || 0;
  p.id = 'pn-' + String(p.codigo).padStart(3,'0');
  ['precio','dormitorios','banos','m2utiles','m2terreno','estac'].forEach(function(k){ p[k] = parseFloat(p[k]) || 0; });
  p.fotos = (p.fotos||[]).filter(Boolean);
  p.caracteristicas = (p.caracteristicas||[]).map(function(c){ return typeof c === 'string' ? c : (c && c.item) || ''; }).filter(Boolean);
  p.estado = p.estado || 'Disponible'; p.moneda = p.moneda || 'CLP';
  return p;
}
Promise.all([
  fetch('/data/config.json', {cache:'no-cache'}).then(function(r){ return r.json(); }),
  fetch('/data/propiedades.json', {cache:'no-cache'}).then(function(r){ return r.json(); })
]).then(function(res){
  S.config = res[0] || {};
  S.propiedades = ((res[1] && res[1].propiedades) || []).filter(function(p){ return p && p.publicada !== false; }).map(normalizar);
  lastHash = location.hash;
  render();
  if (location.hash.length > 1 && !S.propiedades.some(function(x){return x.id===location.hash.slice(1);})){ var tg = document.getElementById(location.hash.slice(1)); if (tg) tg.scrollIntoView(); }
}).catch(function(){
  app.innerHTML = '<div class="wrap" style="padding-block:80px;text-align:center"><h2>No pudimos cargar las propiedades</h2><p class="note" style="margin-top:12px">Recarga la página en unos segundos.</p></div>';
});
})();
