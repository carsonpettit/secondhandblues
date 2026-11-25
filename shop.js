/* Shopify Buy Button setup shared by every page that shows products.
   Call SHB.mountCollections([{ id: 'COLLECTION_ID', node: 'element-id' }, ...]) */
(function () {
  var SHOP = {
    domain: 'x3thui-yk.myshopify.com',
    storefrontAccessToken: '9dec90d1e19b88e9e4af5b29481d0b41'
  };

  var INK = '#1F3A5F', INK_HOVER = '#2A4C78', TEXT = '#23221A', MUTED = '#5C5A4E',
      DUSTY = '#DDE3E6', CREAM = '#F5F1E8', SANS = 'Inter, system-ui, sans-serif',
      SERIF = 'Fraunces, Georgia, serif';

  var button = {
    'font-family': SANS,
    'font-size': '15px',
    'font-weight': '500',
    'padding-top': '14px',
    'padding-bottom': '14px',
    'border-radius': '0px',
    'background-color': INK,
    ':hover': { 'background-color': INK_HOVER },
    ':focus': { 'background-color': INK_HOVER }
  };

  var options = {
    product: {
      styles: {
        product: {
          'text-align': 'left',
          '@media (min-width: 601px)': {
            'max-width': 'calc(25% - 20px)',
            'margin-left': '20px',
            'margin-bottom': '48px',
            'width': 'calc(25% - 20px)'
          }
        },
        imgWrapper: {
          'background-color': DUSTY,
          'border-radius': '4px',
          'padding-top': '125%',
          'position': 'relative',
          'height': '0',
          'margin-bottom': '12px'
        },
        img: {
          'height': '100%',
          'width': '100%',
          'object-fit': 'contain',
          'position': 'absolute',
          'left': '0',
          'right': '0',
          'top': '0'
        },
        title: { 'font-family': SERIF, 'font-weight': '400', 'font-size': '18px', 'color': TEXT },
        price: { 'font-family': SANS, 'font-size': '15px', 'color': MUTED },
        compareAt: { 'display': 'none' },
        button: button
      },
      googleFonts: ['Fraunces', 'Inter'],
      buttonDestination: 'modal',
      contents: { options: false },
      text: { button: 'View piece' }
    },
    productSet: {
      styles: {
        products: { '@media (min-width: 601px)': { 'margin-left': '-20px' } }
      }
    },
    modalProduct: {
      contents: { img: false, imgWithCarousel: true, button: false, buttonWithQuantity: false, addToCart: true },
      styles: {
        product: { '@media (min-width: 601px)': { 'max-width': '100%', 'margin-left': '0px', 'margin-bottom': '0px' } },
        title: { 'font-family': SERIF, 'font-weight': '400', 'font-size': '30px', 'color': TEXT },
        price: { 'font-family': SANS, 'font-size': '20px', 'color': TEXT },
        description: { 'font-family': SANS, 'color': MUTED },
        button: button
      },
      googleFonts: ['Fraunces', 'Inter'],
      text: { button: 'Add to bag' }
    },
    modal: { styles: { modal: { 'background-color': CREAM } } },
    cart: {
      styles: {
        button: button,
        title: { 'font-family': SERIF, 'color': TEXT },
        header: { 'color': TEXT },
        lineItems: { 'color': TEXT },
        subtotalText: { 'color': TEXT },
        subtotal: { 'color': TEXT },
        notice: { 'color': MUTED },
        currency: { 'color': TEXT },
        close: { 'color': TEXT, ':hover': { 'color': TEXT } },
        empty: { 'color': MUTED },
        cart: { 'background-color': CREAM }
      },
      googleFonts: ['Fraunces', 'Inter'],
      text: { title: 'Your bag', total: 'Subtotal', button: 'Checkout' },
      popup: false,
      events: { afterRender: function (c) { setCartCount(c); } }
    },
    toggle: {
      contents: { title: false, icon: false, count: false },
      styles: {
        toggle: { 'display': 'none' },
        count: { 'font-size': '15px' }
      }
    }
  };

  function load(cb) {
    if (window.ShopifyBuy && window.ShopifyBuy.UI) { cb(); return; }
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  function setCartCount(c) {
    var n = 0;
    try { (c.model.lineItems || []).forEach(function (li) { n += li.quantity || 0; }); } catch (e) {}
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = n; el.hidden = !n; });
  }
  var uiPromise = null;
  function getUI() {
    if (uiPromise) return uiPromise;
    uiPromise = new Promise(function (resolve) {
      load(function () {
        var client = ShopifyBuy.buildClient(SHOP);
        ShopifyBuy.UI.onReady(client).then(function (ui) {
          ui.createCart({ options: options, moneyFormat: '%24%7B%7Bamount%7D%7D' }).then(function (c) { setCartCount(c); resolve(ui); }, function () { resolve(ui); });
        });
      });
    });
    return uiPromise;
  }
  function openCart() { getUI().then(function (ui) { ui.openCart(); }); }
  function initCart() {
    document.querySelectorAll('.cart-toggle').forEach(function (b) { b.onclick = openCart; });
    if (!window.SHB_MOCK) setTimeout(getUI, 600);
  }
  var productCache = {}, hiddenHost;
  function openProduct(id) {
    getUI().then(function (ui) {
      if (productCache[id]) { productCache[id].openModal(); return; }
      if (!hiddenHost) { hiddenHost = document.createElement('div'); hiddenHost.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;left:-9999px'; document.body.appendChild(hiddenHost); }
      var node = document.createElement('div'); hiddenHost.appendChild(node);
      ui.createComponent('product', { id: id, node: node, moneyFormat: '%24%7B%7Bamount%7D%7D', options: options })
        .then(function (c) { productCache[id] = c; c.openModal(); });
    });
  }

  window.SHB = {
    openProduct: openProduct,
    openCart: openCart,
    initCart: initCart,
    mountCollections: function (list) {
      load(function () {
        var client = ShopifyBuy.buildClient(SHOP);
        ShopifyBuy.UI.onReady(client).then(function (ui) {
          list.forEach(function (c) {
            var node = document.getElementById(c.node);
            if (!node) return;
            ui.createComponent('collection', {
              id: c.id,
              node: node,
              moneyFormat: '%24%7B%7Bamount%7D%7D',
              options: options
            });
          });
        });
      });
    }
  };
})();

/* ---------- Product library: shop page, homepage carousels, favorites ----------
   Pulls products from the Shopify Storefront API and sorts each one into a
   category, subcategory and season from its title. Product tags override it:
     season:Winter   cat:Tops   sub:Tank tops & camis                       */
(function () {
  var API = 'https://x3thui-yk.myshopify.com/api/2024-10/graphql.json';
  var TOKEN = '9dec90d1e19b88e9e4af5b29481d0b41';
  var TREE = [
    ['Tops', ['Tank tops & camis', 'Tees', 'Long sleeves', 'Sweaters & cardigans', 'Blouses & tops', 'Bodysuits', 'Outerwear']],
    ['Bottoms', ['Jeans', 'Shorts', 'Skirts', 'Pants']],
    ['Dresses', ['Mini dresses', 'Midi & maxi dresses', 'Slip dresses']],
    ['Shoes', ['Sneakers', 'Flats', 'Boots', 'Sandals & heels']],
    ['Accessories', ['Bags', 'Jewelry', 'Hats & headbands', 'Sunglasses']]
  ];
  var SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
  var COLORS = [
    ['Black', /\bblack\b/], ['White & cream', /\bwhite\b|\bcream\b|ivory|natural/],
    ['Brown & tan', /\bbrown\b|\btan\b|camel|tortoise/], ['Red & burgundy', /\bred\b|burgundy|maroon/],
    ['Pink', /pink|fuchsia|magenta|coral/], ['Purple', /purple|lavender|lilac/],
    ['Blue', /\bblue\b|navy|turquoise|denim|jeans|jorts|wash\b/], ['Green', /green|olive|lime|sage/],
    ['Yellow', /yellow/], ['Gray & silver', /gr[ae]y|silver|python/], ['Gold', /\bgold\b/],
    ['Prints & patterns', /floral|leopard|stripe|plaid|camo|paisley|polka|checker|tie-dye|patchwork|print|pinstripe|skull/]
  ];
  var LETTER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  function sizeOf(p, cat) {
    var m = /Size:\s*([^<\n]+)/i.exec(p.html || ''); if (!m) return null;
    var raw = m[1].trim(), low = raw.toLowerCase();
    if (/one size/.test(low)) return 'One size';
    if (cat === 'Shoes') { var n = /(?:women'?s\s*)?(\d+(?:\.5)?)/i.exec(raw); return n ? 'Shoe ' + n[1] : null; }
    var w = /^w\s*(\d+)/i.exec(raw); if (w) return 'Waist ' + w[1];
    low = low.replace(/^petite\s+/, '').replace(/\bsmall\b/, 's').replace(/\bmedium\b/, 'm').replace(/\blarge\b/, 'l');
    var l = /^(xxs|xs|xxl|xl|s|m|l)\b/.exec(low); if (l) return l[1].toUpperCase();
    var d = /^(\d+)/.exec(low); if (d) return (cat === 'Bottoms' && +d[1] >= 23 ? 'Waist ' : 'Size ') + d[1];
    return null;
  }
  function sizeRank(s) {
    var i = LETTER.indexOf(s); if (i !== -1) return i;
    if (s === 'One size') return 50;
    var n = parseFloat((/[\d.]+/.exec(s) || [999])[0]);
    return (/^Size/.test(s) ? 100 : /^Waist/.test(s) ? 200 : 300) + n;
  }
  function has(t, re) { return re.test(t); }

  function classify(p) {
    var t = p.title.toLowerCase(), pt = (p.productType || '').toLowerCase(), cat, sub;
    if (has(t, /\bboots?\b/)) { cat = 'Shoes'; sub = 'Boots'; }
    else if (has(t, /sneaker|samba|new balance|onitsuka|hiking shoe/)) { cat = 'Shoes'; sub = 'Sneakers'; }
    else if (has(t, /\bflats?\b|mary jane|loafer/)) { cat = 'Shoes'; sub = 'Flats'; }
    else if (has(t, /sandal|flip flop|\bheels?\b|jack rogers/)) { cat = 'Shoes'; sub = 'Sandals & heels'; }
    else if (has(t, /\bshoes?\b/)) { cat = 'Shoes'; sub = 'Sneakers'; }
    else if (has(t, /\bbag\b|purse|tote|clutch/)) { cat = 'Accessories'; sub = 'Bags'; }
    else if (has(t, /earring|necklace|bracelet|\bring\b|jewel/)) { cat = 'Accessories'; sub = 'Jewelry'; }
    else if (has(t, /sunglass/)) { cat = 'Accessories'; sub = 'Sunglasses'; }
    else if (has(t, /\bhat\b|beanie|headband|\bcap\b/)) { cat = 'Accessories'; sub = 'Hats & headbands'; }
    else if (has(t, /jacket|\bcoat\b|sherpa|blazer|puffer/)) { cat = 'Tops'; sub = 'Outerwear'; }
    else if (has(t, /hoodie|zip[ -]up|sweatshirt/)) { cat = 'Tops'; sub = 'Outerwear'; }
    else if (has(t, /\bslip\b.*dress|slip dress/)) { cat = 'Dresses'; sub = 'Slip dresses'; }
    else if (has(t, /\bdress\b/)) { cat = 'Dresses'; sub = has(t, /maxi|midi/) ? 'Midi & maxi dresses' : 'Mini dresses'; }
    else if (has(t, /skirt/)) { cat = 'Bottoms'; sub = 'Skirts'; }
    else if (has(t, /\bshorts\b|\bskort|jorts/)) { cat = 'Bottoms'; sub = 'Shorts'; }
    else if (has(t, /\bjeans?\b|bootcut|flare jeans/)) { cat = 'Bottoms'; sub = 'Jeans'; }
    else if (has(t, /pants|trouser|legging|capri/)) { cat = 'Bottoms'; sub = 'Pants'; }
    else if (has(t, /\btank\b|\bcami\b|tube top|halter/)) { cat = 'Tops'; sub = 'Tank tops & camis'; }
    else if (has(t, /bodysuit/)) { cat = 'Tops'; sub = 'Bodysuits'; }
    else if (has(t, /cardigan|sweater|\bknit\b.*(long sleeve|3\/4)/)) { cat = 'Tops'; sub = 'Sweaters & cardigans'; }
    else if (has(t, /long sleeve|3\/4 sleeve/)) { cat = 'Tops'; sub = 'Long sleeves'; }
    else if (has(t, /\btee\b|t[ -]shirt|graphic/)) { cat = 'Tops'; sub = 'Tees'; }
    else if (has(t, /blouse|button[ -]up|\bshirt\b/)) { cat = 'Tops'; sub = 'Blouses & tops'; }
    else if (has(pt, /bottom/)) { cat = 'Bottoms'; sub = null; }
    else if (has(pt, /dress/)) { cat = 'Dresses'; sub = 'Mini dresses'; }
    else if (has(pt, /shoe/)) { cat = 'Shoes'; sub = null; }
    else if (has(pt, /accessor|bag/)) { cat = 'Accessories'; sub = null; }
    else if (has(pt, /long sleeve|layer/)) { cat = 'Tops'; sub = 'Long sleeves'; }
    else { cat = 'Tops'; sub = 'Blouses & tops'; }
    var S = {
      Summer: /tank|cami|\bshorts\b|skort|sandal|flip flop|tube top|halter|swim|sunglass|\btee\b|babydoll|slip|linen|crochet|mini/,
      Spring: /floral|babydoll|lace|cardigan|\bjeans?\b|skirt|ballet|\bflats?\b|blouse|sneaker|mini dress|midi/,
      Fall: /sweater|cardigan|corduroy|long sleeve|\bjeans?\b|flannel|plaid|\bboots?\b|leather|camo|hoodie|brown|suede|knit|zip[ -]up/,
      Winter: /sweater|\bcoat\b|jacket|sherpa|fleece|velvet|beanie|\bhat\b|\bboots?\b|hoodie|wool|cashmere|insulated|fur|long sleeve|cardigan|knit|corduroy/
    };
    var seasons = [], tagged = false;
    SEASONS.forEach(function (s) { if (S[s].test(t)) seasons.push(s); });
    (p.tags || []).forEach(function (tag) {
      var m = /^(season|cat|sub):\s*(.+)$/i.exec(tag); if (!m) return;
      var k = m[1].toLowerCase(), v = m[2].trim();
      if (k === 'cat') cat = v;
      if (k === 'sub') sub = v;
      if (k === 'season') { if (!tagged) { seasons = []; tagged = true; } seasons.push(v); }
    });
    if (!seasons.length) seasons = SEASONS.slice();
    var colors = [], ctag = false, size = sizeOf(p, cat);
    COLORS.forEach(function (c) { if (c[1].test(t)) colors.push(c[0]); });
    (p.tags || []).forEach(function (tag) {
      var m = /^(color|size):\s*(.+)$/i.exec(tag); if (!m) return;
      if (m[1].toLowerCase() === 'size') size = m[2].trim();
      else { if (!ctag) { colors = []; ctag = true; } colors.push(m[2].trim()); }
    });
    return { cat: cat, sub: sub, seasons: seasons, colors: colors, size: size };
  }

  var QUERY = 'query($cursor:String){products(first:250,after:$cursor,sortKey:CREATED_AT,reverse:true){pageInfo{hasNextPage endCursor}edges{node{id title productType tags availableForSale createdAt priceRange{minVariantPrice{amount}}descriptionHtml images(first:2){edges{node{url(transform:{maxWidth:700}) altText}}}}}}}';
  function fetchAll(cursor, acc) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
      body: JSON.stringify({ query: QUERY, variables: { cursor: cursor || null } })
    }).then(function (r) { return r.json(); }).then(function (j) {
      var d = j.data.products;
      d.edges.forEach(function (e) { acc.push(e.node); });
      return d.pageInfo.hasNextPage ? fetchAll(d.pageInfo.endCursor, acc) : acc;
    });
  }
  var loading = null;
  function loadProducts() {
    if (loading) return loading;
    var src = window.SHB_MOCK ? Promise.resolve(window.SHB_MOCK) : fetchAll(null, []);
    loading = src.then(function (list) {
      return list.map(function (n) {
        var imgs = (n.images && n.images.edges ? n.images.edges.map(function (e) { return e.node; }) : []);
        var p = {
          id: String(n.id).split('/').pop(), title: n.title, productType: n.productType, tags: n.tags || [], html: n.descriptionHtml || '',
          available: n.availableForSale, created: n.createdAt,
          price: parseFloat(n.priceRange.minVariantPrice.amount),
          img: imgs[0] && imgs[0].url, img2: imgs[1] && imgs[1].url, alt: (imgs[0] && imgs[0].altText) || n.title
        };
        p.c = classify(p); return p;
      }).filter(function (p) { return p.available; });
    });
    return loading;
  }

  /* ----- favorites (saved in this browser) ----- */
  var FKEY = 'shb-favorites';
  function readFavs() { try { return JSON.parse(localStorage.getItem(FKEY) || '{}') || {}; } catch (e) { return memFavs; } }
  var memFavs = {};
  function writeFavs(f) { memFavs = f; try { localStorage.setItem(FKEY, JSON.stringify(f)); } catch (e) {} }
  function isFav(id) { return !!readFavs()[id]; }
  function toggleFav(p) {
    var f = readFavs();
    if (f[p.id]) delete f[p.id]; else f[p.id] = { id: p.id, title: p.title, price: p.price, img: p.img };
    writeFavs(f); syncFavUI();
  }
  function syncFavUI() {
    var f = readFavs(), ids = Object.keys(f);
    document.querySelectorAll('.fav-count').forEach(function (c) { c.textContent = ids.length; c.hidden = !ids.length; });
    document.querySelectorAll('.heart-btn').forEach(function (b) {
      var on = !!f[b.getAttribute('data-id')];
      b.classList.toggle('is-fav', on); b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + b.getAttribute('data-title') + (on ? ' from favorites' : ' to favorites'));
    });
    var list = document.querySelector('.fav-list'); if (!list) return;
    list.innerHTML = '';
    if (!ids.length) { list.appendChild(el('p', { 'class': 'fav-empty' }, 'Tap the heart on any piece to save it here.')); return; }
    ids.forEach(function (id) {
      var it = f[id], row = el('div', { 'class': 'fav-item' });
      var open = el('button', { type: 'button', 'class': 'fav-open' });
      if (it.img) open.appendChild(el('img', { src: it.img, alt: '', width: '80', height: '80' }));
      var txt = el('span', { 'class': 'fav-text' });
      txt.appendChild(el('span', { 'class': 'fav-title' }, it.title));
      txt.appendChild(el('span', { 'class': 'fav-price' }, '$' + Number(it.price).toFixed(2)));
      open.appendChild(txt);
      open.onclick = function () { closeDrawer(); window.SHB.openProduct(id); };
      var rm = el('button', { type: 'button', 'class': 'fav-remove', 'aria-label': 'Remove ' + it.title + ' from favorites' }, '×');
      rm.onclick = function () { var g = readFavs(); delete g[id]; writeFavs(g); syncFavUI(); };
      row.appendChild(open); row.appendChild(rm); list.appendChild(row);
    });
  }
  function openDrawer() {
    var d = document.getElementById('favDrawer'); if (!d) return;
    d.hidden = false; document.querySelector('.fav-scrim').hidden = false;
    document.querySelector('.fav-toggle').setAttribute('aria-expanded', 'true');
    d.querySelector('.fav-close').focus();
  }
  function closeDrawer() {
    var d = document.getElementById('favDrawer'); if (!d || d.hidden) return;
    d.hidden = true; document.querySelector('.fav-scrim').hidden = true;
    var t = document.querySelector('.fav-toggle'); t.setAttribute('aria-expanded', 'false'); t.focus();
  }
  var navInit = false;
  function initNav() {
    if (navInit) return; navInit = true;
    window.SHB.initCart();
    var dd = document.querySelector('.nav-dd'); if (!dd) return;
    var caret = dd.querySelector('.dd-caret');
    function set(o) { dd.classList.toggle('open', o); caret.setAttribute('aria-expanded', String(o)); }
    caret.onclick = function (e) { e.stopPropagation(); set(!dd.classList.contains('open')); };
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) set(false); });
  }
  function initFavs() {
    initNav();
    var t = document.querySelector('.fav-toggle'); if (!t) return;
    t.onclick = openDrawer;
    document.querySelector('.fav-close').onclick = closeDrawer;
    document.querySelector('.fav-scrim').onclick = closeDrawer;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
    syncFavUI();
  }

  /* ----- product card ----- */
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1z"/></svg>';
  function card(p) {
    var wrap = el('div', { 'class': 'product-card' });
    var open = el('button', { type: 'button', 'class': 'product-open', 'aria-label': p.title + ', $' + p.price.toFixed(2) });
    var fig = el('span', { 'class': 'product-img' + (p.img2 ? ' has-alt' : '') });
    if (p.img) fig.appendChild(el('img', { 'class': 'img-main', src: p.img, alt: '', loading: 'lazy', width: '700', height: '700' }));
    if (p.img2) fig.appendChild(el('img', { 'class': 'img-alt', src: p.img2, alt: '', loading: 'lazy', width: '700', height: '700' }));
    open.appendChild(fig);
    open.appendChild(el('span', { 'class': 'product-title' }, p.title));
    open.appendChild(el('span', { 'class': 'product-price' }, '$' + p.price.toFixed(2)));
    open.onclick = function () { window.SHB.openProduct(p.id); };
    var heart = el('button', { type: 'button', 'class': 'heart-btn', 'data-id': p.id, 'data-title': p.title, 'aria-pressed': 'false' });
    heart.innerHTML = HEART;
    heart.onclick = function (e) { e.stopPropagation(); toggleFav(p); };
    wrap.appendChild(open); wrap.appendChild(heart);
    return wrap;
  }
  function carousel(node, items, label) {
    node.innerHTML = '';
    if (!items.length) { node.appendChild(el('p', { 'class': 'empty' }, 'New pieces coming soon.')); return; }
    var track = el('div', { 'class': 'carousel-track', role: 'list', 'aria-label': label });
    items.forEach(function (p) { var li = el('div', { role: 'listitem', 'class': 'carousel-item' }); li.appendChild(card(p)); track.appendChild(li); });
    var prev = el('button', { type: 'button', 'class': 'carousel-arrow prev', 'aria-label': 'Previous ' + label }, '‹');
    var next = el('button', { type: 'button', 'class': 'carousel-arrow next', 'aria-label': 'Next ' + label }, '›');
    function step(dir) {
      var item = track.querySelector('.carousel-item'); if (!item) return;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var w = item.getBoundingClientRect().width + gap;
      var i = Math.round(track.scrollLeft / w) + dir;
      track.scrollTo({ left: Math.max(0, i * w), behavior: 'smooth' });
    }
    prev.onclick = function () { step(-1); }; next.onclick = function () { step(1); };
    function upd() {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    }
    track.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd);
    node.appendChild(prev); node.appendChild(track); node.appendChild(next);
    setTimeout(upd, 50);
  }

  /* ----- homepage ----- */
  window.SHB.mountHome = function () {
    initFavs();
    loadProducts().then(function (all) {
      var winter = all.filter(function (p) { return p.c.seasons.indexOf('Winter') !== -1 && p.c.seasons.length < 4; });
      carousel(document.querySelector('[data-carousel="winter"]'), winter.slice(0, 16), 'winter pieces');
      var host = document.getElementById('categoryCarousels'); host.innerHTML = '';
      TREE.forEach(function (row) {
        var items = all.filter(function (p) { return p.c.cat === row[0]; });
        if (!items.length) return;
        var sec = el('div', { 'class': 'cat-row' });
        var head = el('div', { 'class': 'section-head' });
        head.appendChild(el('h2', {}, row[0]));
        var a = el('a', { href: 'shop.html?cat=' + encodeURIComponent(row[0]) }, 'Shop all ' + row[0].toLowerCase());
        head.appendChild(a); sec.appendChild(head);
        var c = el('div', { 'class': 'carousel' }); sec.appendChild(c); host.appendChild(sec);
        carousel(c, items.slice(0, 16), row[0]);
      });
      var nf = document.getElementById('newFinds'); nf.innerHTML = '';
      all.slice().sort(function (a, b) { return a.created < b.created ? 1 : -1; }).slice(0, 8).forEach(function (p) { nf.appendChild(card(p)); });
      syncFavUI();
    }).catch(function () {
      document.querySelectorAll('.carousel, #newFinds').forEach(function (n) { n.textContent = 'Couldn’t load pieces right now. Please refresh.'; });
    });
  };

  /* ----- shop page ----- */
  var FRESH = function () { return { season: 'All', cat: 'All', sub: null, sort: 'new', color: '', size: '' }; };
  var state = FRESH(), collapsed = false;
  var products = [];
  function readUrl() {
    var q = new URLSearchParams(location.search);
    ['season', 'cat', 'sub', 'sort', 'color', 'size'].forEach(function (k) { if (q.get(k)) state[k] = q.get(k); });
  }
  function writeUrl() {
    var q = new URLSearchParams();
    if (state.season !== 'All') q.set('season', state.season);
    if (state.cat !== 'All') q.set('cat', state.cat);
    if (state.sub) q.set('sub', state.sub);
    if (state.sort !== 'new') q.set('sort', state.sort);
    if (state.color) q.set('color', state.color);
    if (state.size) q.set('size', state.size);
    var s = q.toString(); history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }
  function seasonOk(p) {
    return (state.season === 'All' || p.c.seasons.indexOf(state.season) !== -1) &&
      (!state.color || p.c.colors.indexOf(state.color) !== -1) && (!state.size || p.c.size === state.size);
  }
  function count(fn) { return products.filter(function (p) { return seasonOk(p) && fn(p); }).length; }
  function renderControls() {
    var tree = document.getElementById('catTree'); tree.innerHTML = '';
    var allLi = el('li'), allB = el('button', { type: 'button', 'class': 'cat-btn', 'aria-pressed': String(state.cat === 'All') }, 'All pieces');
    allB.appendChild(el('span', { 'class': 'count' }, String(count(function () { return true; }))));
    allB.onclick = function () { state.cat = 'All'; state.sub = null; collapsed = false; update(); };
    allLi.appendChild(allB); tree.appendChild(allLi);
    TREE.forEach(function (row) {
      var cat = row[0], open = state.cat === cat && !collapsed, li = el('li');
      var b = el('button', { type: 'button', 'class': 'cat-btn', 'aria-pressed': String(open && !state.sub), 'aria-expanded': String(open) }, cat);
      b.appendChild(el('span', { 'class': 'count' }, String(count(function (p) { return p.c.cat === cat; }))));
      b.onclick = function () {
        if (state.cat === cat) collapsed = !collapsed; else { state.cat = cat; state.sub = null; collapsed = false; }
        update();
      };
      li.appendChild(b);
      if (open) {
        var ul = el('ul', { 'class': 'sub-list' });
        var a0 = el('button', { type: 'button', 'class': 'sub-btn', 'aria-pressed': String(!state.sub) }, 'All ' + cat.toLowerCase());
        a0.onclick = function () { state.sub = null; update(); };
        var l0 = el('li'); l0.appendChild(a0); ul.appendChild(l0);
        row[1].forEach(function (s) {
          var n = count(function (p) { return p.c.cat === cat && p.c.sub === s; });
          var sb = el('button', { type: 'button', 'class': 'sub-btn', 'aria-pressed': String(state.sub === s) }, s);
          sb.appendChild(el('span', { 'class': 'count' }, String(n)));
          if (!n) sb.disabled = true;
          sb.onclick = function () { state.sub = s; update(); };
          var l = el('li'); l.appendChild(sb); ul.appendChild(l);
        });
        li.appendChild(ul);
      }
      tree.appendChild(li);
    });
    document.getElementById('sortSelect').value = state.sort;
    fillSelect('colorSelect', 'All colors', COLORS.map(function (c) { return c[0]; }), 'color', function (p, v) { return p.c.colors.indexOf(v) !== -1; });
    var sizes = {}; products.forEach(function (p) { if (p.c.size) sizes[p.c.size] = 1; });
    fillSelect('sizeSelect', 'All sizes', Object.keys(sizes).sort(function (a, b) { return sizeRank(a) - sizeRank(b); }), 'size', function (p, v) { return p.c.size === v; });
  }
  function catOk(p) { return (state.cat === 'All' || p.c.cat === state.cat) && (!state.sub || p.c.sub === state.sub); }
  function fillSelect(id, allLabel, values, key, test) {
    var sel = document.getElementById(id); sel.innerHTML = '';
    sel.appendChild(el('option', { value: '' }, allLabel));
    var keep = state[key]; state[key] = '';
    values.forEach(function (v) {
      var n = products.filter(function (p) { return seasonOk(p) && catOk(p) && test(p, v); }).length;
      if (!n && v !== keep) return;
      sel.appendChild(el('option', { value: v }, v + ' (' + n + ')'));
    });
    state[key] = keep; sel.value = keep;
  }
  function renderGrid() {
    var list = products.filter(function (p) {
      return seasonOk(p) && catOk(p);
    });
    if (state.sort === 'low') list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === 'high') list.sort(function (a, b) { return b.price - a.price; });
    else list.sort(function (a, b) { return a.created < b.created ? 1 : -1; });
    var grid = document.getElementById('productGrid'); grid.innerHTML = '';
    document.getElementById('resultCount').textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
    var af = document.getElementById('activeFilters'); af.innerHTML = '';
    var chips = [];
    if (state.season !== 'All') chips.push([state.season, function () { state.season = 'All'; }]);
    if (state.sub) chips.push([state.sub, function () { state.sub = null; }]);
    else if (state.cat !== 'All') chips.push([state.cat, function () { state.cat = 'All'; collapsed = false; }]);
    if (state.color) chips.push([state.color, function () { state.color = ''; }]);
    if (state.size) chips.push([state.size, function () { state.size = ''; }]);
    chips.forEach(function (c) {
      var b = el('button', { type: 'button', 'class': 'filter-chip', 'aria-label': 'Remove filter: ' + c[0] });
      b.appendChild(el('span', {}, c[0])); b.appendChild(el('span', { 'class': 'chip-x', 'aria-hidden': 'true' }, '×'));
      b.onclick = function () { c[1](); update(); };
      af.appendChild(b);
    });
    if (!list.length) {
      var box = el('div', { 'class': 'empty empty-search' });
      box.appendChild(el('h2', {}, 'Can’t find what you’re looking for?'));
      box.appendChild(el('p', {}, 'Let me search for you! Tell me what you want and I’ll thrift it for you in a style bundle.'));
      var a = el('a', { 'class': 'btn btn-ink', href: 'bundles.html' }, 'Get a style bundle'); box.appendChild(a);
      grid.appendChild(box); return;
    }
    list.forEach(function (p) { grid.appendChild(card(p)); });
    syncFavUI();
  }
  function update() { writeUrl(); renderControls(); renderGrid(); }
  window.SHB.mountShop = function () {
    initFavs(); readUrl();
    document.getElementById('sortSelect').onchange = function (e) { state.sort = e.target.value; update(); };
    document.getElementById('colorSelect').onchange = function (e) { state.color = e.target.value; update(); };
    document.getElementById('sizeSelect').onchange = function (e) { state.size = e.target.value; update(); };
    document.getElementById('clearFilters').onclick = function () { state = FRESH(); collapsed = false; update(); };
    var tog = document.querySelector('.filters-toggle');
    tog.onclick = function () { var o = document.querySelector('.filters').classList.toggle('open'); tog.setAttribute('aria-expanded', String(o)); };
    loadProducts().then(function (list) { products = list; update(); })
      .catch(function () { document.getElementById('resultCount').textContent = 'Couldn’t load the shop right now. Please refresh.'; });
  };
  window.SHB.initFavs = initFavs;
  window.SHB.classify = classify;
  if (!document.body.classList.contains('home') && !document.body.classList.contains('shop')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFavs); else initFavs();
  }
})();
