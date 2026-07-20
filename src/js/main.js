(function () {
  var isPageHidden = false;
  var isLowEndDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4) || window.innerWidth < 480;
  var isMobile = window.innerWidth < 768;
  var performanceScale = (isLowEndDevice || isMobile) ? 0.4 : 1;
  document.addEventListener("visibilitychange", function () { isPageHidden = document.hidden; });

  var resizeTimer;
  var resizeCallbacks = [];
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      for (var i = 0; i < resizeCallbacks.length; i++) resizeCallbacks[i]();
    }, 120);
  });
  function onResize(fn) { resizeCallbacks.push(fn); }

  var canvasScale = (isLowEndDevice ? 0.35 : isMobile ? 0.5 : 0.55);
  var pixelScale = 0.35;

  var animationQueue = [];
  function _registerAnimation(fn, weight) {
    animationQueue.push({ fn: fn, weight: weight || 1, skipCounter: 0 });
  }
  function _unregisterAnimation(fn) {
    for (var i = animationQueue.length - 1; i >= 0; i--) {
      if (animationQueue[i].fn === fn) animationQueue.splice(i, 1);
    }
  }
  function runAnimationLoop() {
    requestAnimationFrame(runAnimationLoop);
    if (isPageHidden) return;
    for (var i = 0; i < animationQueue.length; i++) {
      var entry = animationQueue[i];
      if (entry.weight > 1) {
        entry.skipCounter++;
        if (entry.skipCounter < entry.weight) continue;
        entry.skipCounter = 0;
      }
      entry.fn();
    }
  }
  runAnimationLoop();

  var theme = CONFIG.theme;

  if (theme.preset) {
    var presets = {
      dark: {
        textColor: "#ffffff", backgroundColor: "#050505", glowColor: "#ffffff",
        containerColor: "rgba(255,255,255,0.04)", containerBlur: "8px", containerBorderColor: "rgba(255,255,255,0.15)",
        buttonBg: "rgba(255,255,255,0.1)", buttonBorder: "1px solid rgba(255,255,255,0.12)",
        selectionBg: "#ffffff", selectionColor: "#000000",
      },
      light: {
        textColor: "#1a1a1a", backgroundColor: "#ffffff", glowColor: "#1a1a1a",
        usernameEffects: "none", containerColor: "rgba(0,0,0,0.03)", containerBlur: "0px",
        containerBorderColor: "rgba(0,0,0,0.12)", buttonBg: "rgba(0,0,0,0.06)",
        buttonBorder: "1px solid rgba(0,0,0,0.1)", selectionBg: "#1a1a1a", selectionColor: "#ffffff",
      },
      neon: {
        textColor: "#ffffff", backgroundColor: "#0a0015", glowColor: "#ff00ff",
        usernameEffects: "none", containerColor: "rgba(255,0,255,0.05)", containerBlur: "6px",
        containerBorderColor: "#ff00ff", containerBorderWidth: "1px",
        buttonBg: "rgba(255,0,255,0.15)", buttonBorder: "1px solid #ff00ff",
        selectionBg: "#ff00ff", selectionColor: "#000000",
      },
      ocean: {
        textColor: "#e0f7ff", backgroundColor: "#001220", glowColor: "#00e5ff",
        usernameEffects: "none", containerColor: "rgba(0,180,255,0.06)", containerBlur: "8px",
        containerBorderColor: "rgba(0,229,255,0.3)", buttonBg: "rgba(0,180,255,0.12)",
        buttonBorder: "1px solid rgba(0,229,255,0.2)", selectionBg: "#00e5ff", selectionColor: "#000a14",
      },
    };
    var preset = presets[theme.preset];
    if (preset) { for (var key in preset) { theme[key] = preset[key]; } }
  }

  var css = document.createElement("style");
  css.textContent =
    ":root{" +
    "--textColor:" + theme.textColor + ";" +
    "--backgroundColor:" + theme.backgroundColor + ";" +
    "--colorUsernameGlow:0px 0px 16.5px " + theme.glowColor + ";" +
    "--usernameEffects:" + theme.usernameEffects + ";" +
    "--containerColor:" + theme.containerColor + ";" +
    "--containerBlur:" + theme.containerBlur + ";" +
    "--containerRadius:" + CONFIG.layout.containerRadius + ";" +
    "--containerWidth:" + CONFIG.layout.containerWidth + ";" +
    "--containerPadding:" + CONFIG.layout.containerPadding + ";" +
    "--profileBorderWidth:" + theme.containerBorderWidth + ";" +
    "--profileBorderColor:" + theme.containerBorderColor + ";" +
    "--presenceUsernameColor:" + theme.textColor + ";" +
    "--presenceStatusColor:" + theme.textColor + "b3;" +
    "--badgeContainerBackground:rgba(255,255,255,0.08);" +
    "--badgeContainerBorder:2px solid rgba(255,255,255,0.04);" +
    "--userBadge:18px;" +
    "--textColorDarker:rgba(255,255,255,0.5);" +
    "--iconColor:" + theme.textColor + ";" +
    "--joinStatus:rgba(255,255,255,0.65);" +
    "--audioPlayerBar:rgba(255,255,255,0.35);" +
    "--avatarBorder:2px solid rgba(255,255,255,0.4);" +
    "--volumeBackgroundcolor:" + theme.volumeBg + ";" +
    "--volumeBorder:" + theme.volumeBorder + ";" +
    "--buttonBackground:" + theme.buttonBg + ";" +
    "--buttonBorder:" + theme.buttonBorder + ";" +
    "--buttonRadius:" + theme.buttonRadius + ";" +
    "--buttonBackgroundHover:" + theme.buttonBgHover + ";" +
    "--progessBarFull:rgba(255,255,255,0.3);" +
    "--progessBarPlaying:" + theme.textColor + ";" +
    "--controlButtonsOther:rgba(255,255,255,0.5);" +
    "--controlButtonPlaying:" + theme.textColor + ";" +
    "--controlTextColor:rgba(255,255,255,0.7);" +
    "}";

  if (CONFIG.theme.selectionBg) {
    css.textContent += "::selection{background:" + CONFIG.theme.selectionBg + ";color:" + CONFIG.theme.selectionColor + "}";
  }

  if (CONFIG.cursor.enabled) {
    css.textContent += '*{cursor:url("' + CONFIG.cursor.src + '") ' + CONFIG.cursor.hotspotX + " " + CONFIG.cursor.hotspotY + ",auto!important}";
  }
  css.textContent += '.card{pointer-events:auto!important}.badge{padding:2px!important}.badge-icon,.splash-text{border-radius:6px!important}';
  css.textContent += ':root{--userBadge:14px!important}';
  css.textContent += '.header-row{flex-wrap:nowrap!important;overflow-x:visible!important}';

  switch (CONFIG.layout.type) {
    case "glass":
      css.textContent += '.card{--containerColor:rgba(255,255,255,0.06)!important;--containerBlur:12px!important;--profileBorderColor:rgba(255,255,255,0.08)!important;--profileBorderWidth:1px!important}.card{-webkit-backdrop-filter:blur(12px)!important;backdrop-filter:blur(12px)!important}';
      break;
  }
  document.head.appendChild(css);

  if (CONFIG.fonts.enabled && CONFIG.fonts.families) {
    var fontCss = document.createElement("style");
    fontCss.textContent = "body, * { font-family: '" + CONFIG.fonts.families.join("', '") + "', sans-serif !important; }.Typewriter__wrapper { font-family: '" + CONFIG.fonts.families[0] + "', sans-serif !important; }";
    if (CONFIG.fonts.importUrl) fontCss.textContent = '@import url("' + CONFIG.fonts.importUrl + '");' + fontCss.textContent;
    document.head.appendChild(fontCss);
  }

  function renderAvatar() {
    if (CONFIG.avatar.type === "image") return '<img class="avatar-img" src="' + CONFIG.avatar.src + '" alt="" width="120" height="120">';
    return '<span class="avatar"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="4 4 16 16"><path fill="currentColor" d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12Zm-6 8q-.825 0-1.413-.588T4 18v-.8q0-.85.438-1.563T5.6 14.55q1.55-.775 3.15-1.163T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2v.8q0 .825-.588 1.413T18 20H6Z"/></svg></span>';
  }

  var BADGE_NAMES = { premium: "Premium", staff: "Staff Member", bug: "Bug Hunter", legend: "Legend", shield: "Shield", star: "Image Host", heart: "Heart", crown: "Crown", verified: "Verified", gift: "Gift", trophy: "Trophy", booster: "Booster" };

  function renderBadges() {
    if (!CONFIG.badges.length) return "";
    var badgeHtml = CONFIG.badges.map(function (b) {
      if (typeof b === "string") b = { icon: b, name: BADGE_NAMES[b] || b.charAt(0).toUpperCase() + b.slice(1), monochrome: true };
      var iconSvg = BADGE_SVGS[b.icon] || BADGE_SVGS.premium;
      var c = b.monochrome ? "#ffffff" : b.color || "#a749dd";
      var cls = "bg-" + b.name.replace(/[^a-zA-Z0-9]/g, "");
      var style = document.createElement("style");
      style.textContent = "." + cls + " svg{color:" + c + "!important;filter:drop-shadow(" + c + " 0 0 2.5px)!important}";
      document.head.appendChild(style);
      return '<div class="badge"><span class="tip-trigger"><div class="badge-icon"><div class="' + cls + '" style="display:flex">' + iconSvg + '</div></div><span class="tip-content" style="--tooltip-max-width:260px;top:0;left:0;border-color:#1a1a1a33;background-color:#14141463" data-visible="false" data-placement="top">' + b.name + '</span></span></div>';
    }).join("");
    return badgeHtml;
  }

  function renderLinks() {
    return CONFIG.links.map(function (l) {
      return '<div class="link-btn link-btn-alt"><a target="_blank" href="' + l.url + '"><img class="link-icon" alt="" loading="lazy" src="' + l.icon + '" style="filter:drop-shadow(' + l.color + ' 1px 0 7px);"></a></div>';
    }).join("");
  }

  function renderAbout() {
    if (!CONFIG.about.enabled) return "";
    return '<div class="divider"><div class="divider-inner"></div></div><div style="width:100%;max-width:var(--containerWidth);text-align:left;color:var(--textColor);font-size:15px;line-height:1.5;opacity:.85;padding:0 5px">' + CONFIG.about.text + "</div>";
  }

  function renderLocation() {
    if (!CONFIG.location.enabled) return "";
    return '<div style="display:flex;align-items:center;gap:8px;color:var(--textColor);font-size:13px;opacity:.7;margin-top:5px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg><span>' + CONFIG.location.text + "</span></div>";
  }

  function renderPortfolio() {
    if (!CONFIG.portfolio.enabled) return "";
    var html = '<div class="divider false"><div class="divider-inner"></div></div>';
    if (CONFIG.portfolio.skills && CONFIG.portfolio.skills.length) {
      html += '<div style="width:100%;max-width:var(--containerWidth);margin-bottom:10px"><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">';
      CONFIG.portfolio.skills.forEach(function (skill) {
        html += '<span style="padding:5px 14px;border-radius:15px;background:var(--buttonBackground);border:var(--buttonBorder);color:var(--textColor);font-size:13px;font-weight:500">' + skill + "</span>";
      });
      html += "</div></div>";
    }
    if (CONFIG.portfolio.projects && CONFIG.portfolio.projects.length) {
      CONFIG.portfolio.projects.forEach(function (p) {
        html += '<div style="width:100%;max-width:var(--containerWidth);padding:var(--containerPadding);border-radius:var(--containerRadius);background:var(--containerColor);-webkit-backdrop-filter:blur(var(--containerBlur));border:var(--profileBorderWidth) solid var(--profileBorderColor);box-sizing:border-box;margin-bottom:10px"><div style="color:var(--textColor);font-weight:600;font-size:16px;margin-bottom:4px">' + p.name + "</div><div style='color:var(--textColor);font-size:14px;opacity:.75;margin-bottom:8px'>" + p.description + "</div>" + (p.url ? '<a href="' + p.url + '" target="_blank" style="display:inline-block;padding:7px 18px;border-radius:20px;background:var(--buttonBackground);border:var(--buttonBorder);color:var(--textColor);text-decoration:none;font-size:13px;font-weight:500">Visit</a>' : "") + "</div>";
      });
    }
    return html;
  }

  function initBackgroundEffects() {
    var effects = CONFIG.background.effects;
    if (!effects) return;
    if (effects.aurora) mountCanvasContainer("aurora-container", initAurora);
    if (effects.stars) mountCanvasContainer("dither-container", initStars);
    if (effects.dither) mountCanvasContainer("dither-container", initDither);
    if (effects.plasma) mountCanvasContainer("plasma-container", initPlasma);
    if (effects.snow) mountCanvasContainer("dither-container", initSnow);
    if (effects.rain) mountCanvasContainer("dither-container", initRain);
    if (effects.fireflies) mountCanvasContainer("dither-container", initFireflies);
  }

  function mountCanvasContainer(cls, init) {
    var c = document.createElement("div");
    c.className = cls;
    var cv = document.createElement("canvas");
    cv.style.cssText = "width:100%;height:100%;display:block";
    c.appendChild(cv);
    document.body.insertBefore(c, document.body.firstChild);
    init(cv);
  }

  function initAurora(canvas) {
    var ctx = canvas.getContext("2d");
    var s = pixelScale;
    var w = canvas.width = Math.round(canvas.offsetWidth * s);
    var h = canvas.height = Math.round(canvas.offsetHeight * s);
    var t = 0;
    function resize() { w = canvas.width = Math.round(canvas.offsetWidth * s); h = canvas.height = Math.round(canvas.offsetHeight * s); }
    onResize(resize);
    function draw() {
      if (isPageHidden) return;
      t += 0.003;
      var id = ctx.createImageData(w, h);
      var d = id.data;
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var i = (y * w + x) * 4;
          var nx = x / w - 0.5, ny = y / h - 0.5;
          var v1 = Math.sin(nx * 8 + t) * Math.cos(ny * 6 + t * 0.7) * 0.5 + 0.5;
          var v2 = Math.sin(nx * 5 + ny * 7 + t * 1.3) * 0.5 + 0.5;
          var v3 = Math.sin(nx * 3 - ny * 9 + t * 0.5) * 0.5 + 0.5;
          d[i] = Math.floor(80 + v1 * 120 + v2 * 30);
          d[i + 1] = Math.floor(20 + v2 * 60 + v3 * 80);
          d[i + 2] = Math.floor(120 + v3 * 100 + v1 * 40);
          d[i + 3] = Math.floor(180 + v2 * 75);
        }
      }
      ctx.putImageData(id, 0, 0);
    }
    _registerAnimation(draw, 1);
  }

  function initStars(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.offsetWidth;
    var h = canvas.height = canvas.offsetHeight;
    var count = Math.max(Math.round(200 * performanceScale), 50);
    var stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.3, speed: 0.005 + Math.random() * 0.015, twinkle: Math.random() * Math.PI * 2 });
    }
    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
    onResize(resize);
    var glow = document.createElement("canvas");
    glow.width = 64; glow.height = 64;
    var gc = glow.getContext("2d");
    var gg = gc.createRadialGradient(32, 32, 0, 32, 32, 32);
    gg.addColorStop(0, "rgba(200,220,255,0.3)"); gg.addColorStop(1, "rgba(200,220,255,0)");
    gc.fillStyle = gg; gc.fillRect(0, 0, 64, 64);
    function draw() {
      if (isPageHidden) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i]; s.twinkle += s.speed;
        var a = 0.3 + Math.sin(s.twinkle) * 0.5;
        ctx.globalAlpha = a;
        ctx.drawImage(glow, s.x - 32, s.y - 32);
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + a + ")"; ctx.fill();
      }
    }
    _registerAnimation(draw, 1);
  }

  function initDither(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = Math.round(canvas.offsetWidth * canvasScale);
    var h = canvas.height = Math.round(canvas.offsetHeight * canvasScale);
    function draw() {
      if (isPageHidden) { setTimeout(draw, 200); return; }
      var id = ctx.createImageData(w, h); var d = id.data;
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4; var v = Math.random() * 255;
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = Math.floor(15 + Math.random() * 25);
      }
      ctx.putImageData(id, 0, 0);
      setTimeout(draw, isPageHidden ? 500 : 50);
    }
    draw();
  }

  function initSnow(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.offsetWidth;
    var h = canvas.height = canvas.offsetHeight;
    var flakes = [];
    for (var i = 0; i < 120; i++) flakes.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 3 + 1, speed: Math.random() * 2 + 1, wind: Math.random() * 0.5 - 0.25 });
    function draw() {
      if (isPageHidden) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i]; f.y += f.speed; f.x += f.wind;
        if (f.y > h) { f.y = -f.r; f.x = Math.random() * w; }
        if (f.x > w) f.x = 0; if (f.x < 0) f.x = w;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + (0.5 + Math.random() * 0.5) + ")"; ctx.fill();
      }
    }
    _registerAnimation(draw, 1);
  }

  function initRain(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.offsetWidth;
    var h = canvas.height = canvas.offsetHeight;
    var drops = [];
    for (var i = 0; i < 500; i++) drops.push({ x: Math.random() * w, y: Math.random() * h, len: Math.random() * 25 + 10, speed: Math.random() * 8 + 4, opacity: Math.random() * 0.3 + 0.2 });
    function draw() {
      if (isPageHidden) return;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(220,230,255,1)"; ctx.lineWidth = 1.5;
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i]; ctx.globalAlpha = d.opacity;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + 0.5, d.y + d.len); ctx.stroke();
        d.y += d.speed; if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
      }
    }
    _registerAnimation(draw, 1);
  }

  function initFireflies(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.offsetWidth;
    var h = canvas.height = canvas.offsetHeight;
    var flies = [];
    for (var i = 0; i < 40; i++) flies.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, r: Math.random() * 3 + 2, alpha: 0.3 + Math.random() * 0.7, phase: Math.random() * Math.PI * 2, hue: 60 + Math.random() * 60, life: Math.random() * 200 + 100, maxLife: Math.random() * 200 + 100 });
    function draw() {
      if (isPageHidden) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = flies.length - 1; i >= 0; i--) {
        var f = flies[i]; f.life--;
        if (f.life <= 0) { flies.splice(i, 1); flies.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, r: Math.random() * 3 + 2, alpha: 0.3 + Math.random() * 0.7, phase: Math.random() * Math.PI * 2, hue: 60 + Math.random() * 60, life: Math.random() * 200 + 100, maxLife: Math.random() * 200 + 100 }); continue; }
        f.phase += 0.02; f.x += f.vx + Math.sin(f.phase) * 0.2; f.y += f.vy + Math.cos(f.phase * 0.7) * 0.2;
        if (f.x < 0) f.x = w; if (f.x > w) f.x = 0; if (f.y < 0) f.y = h; if (f.y > h) f.y = 0;
        var a = f.alpha * (f.life / f.maxLife) * (0.6 + Math.sin(f.phase) * 0.4);
        var grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
        grad.addColorStop(0, "hsla(" + f.hue + ",100%,80%," + a + ")");
        grad.addColorStop(1, "hsla(" + f.hue + ",100%,60%,0)");
        ctx.fillStyle = grad; ctx.fillRect(f.x - f.r * 6, f.y - f.r * 6, f.r * 12, f.r * 12);
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,220," + a * 0.9 + ")"; ctx.fill();
      }
    }
    _registerAnimation(draw, 1);
  }

  function initPlasma(canvas) {
    var ctx = canvas.getContext("2d");
    var s = pixelScale;
    var w = canvas.width = Math.round(canvas.offsetWidth * s);
    var h = canvas.height = Math.round(canvas.offsetHeight * s);
    var t = 0;
    function resize() { w = canvas.width = Math.round(canvas.offsetWidth * s); h = canvas.height = Math.round(canvas.offsetHeight * s); }
    onResize(resize);
    function draw() {
      if (isPageHidden) return;
      t += 0.05;
      var id = ctx.createImageData(w, h); var d = id.data;
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        var v = Math.sin(x * 0.02 + t) + Math.sin(y * 0.03 + t * 0.7) + Math.sin((x + y) * 0.015 + t * 0.5) + Math.sqrt(x * x + y * y) * 0.02 + t;
        v = (v + 4) / 8;
        d[i] = Math.floor(100 + Math.sin(v * 6.28) * 100);
        d[i + 1] = Math.floor(50 + Math.sin(v * 6.28 + 2.09) * 80);
        d[i + 2] = Math.floor(150 + Math.sin(v * 6.28 + 4.19) * 100);
        d[i + 3] = 180;
      }
      ctx.putImageData(id, 0, 0);
    }
    _registerAnimation(draw, 1);
  }

  var isVideo = CONFIG.background.src && /\.(mp4|webm|ogg)$/i.test(CONFIG.background.src);
  var html;
  if (isVideo) {
    html = '<video class="bg-image" src="' + CONFIG.background.src + '" autoplay muted loop playsinline style="object-fit:cover"></video><div class="bg-color" style="background-color:' + CONFIG.background.color + '"></div>';
  } else {
    var bgStyle = CONFIG.background.src ? 'background-image:url("' + CONFIG.background.src + '")' : "";
    html = '<div class="bg-image" style="' + bgStyle + '"></div><div class="bg-color" style="background-color:' + CONFIG.background.color + '"></div>';
  }

  if (CONFIG.audio.src) html += '<audio id="bgAudio" src="' + CONFIG.audio.src + '"' + (CONFIG.audio.loop ? " loop" : "") + ' preload="none"></audio>';

  html += '<div id="overlay" class="splash" style="pointer-events:auto;"><div class="splash-text" style="font-weight:' + (CONFIG.splash.fontWeight || "500") + ";font-size:" + (CONFIG.splash.fontSize || "34px") + '">' + CONFIG.splash.text + "</div></div>";

  html += '<div id="mainContent"><div class="page-wrap"><div class="content-wrap"><div style="position:relative;width:100%;align-items:center;max-width:var(--containerWidth);display:flex;justify-content:center;flex-direction:column;gap:15px;z-index:1;">';
  html += '<div class="card card-init" style="position:relative;"><div class="text-col-2 text-col-4"></div>';
  html += '<div class="profile-row false">' + renderAvatar();
  html += '<div class="text-col"><div class="header-row"><span class="tip-trigger"><h1 style="font-weight:400;font-size:36.5px;line-height:41px;margin:0" class="false">' + CONFIG.username + "</h1>";
  html += '<span class="tip-content" style="--tooltip-max-width:260px;top:0;left:0;border-color:#1a1a1a33;background-color:#14141463;" data-visible="false" data-placement="top">UID ' + CONFIG.uid + "</span></span>";
  html += renderBadges() + "</div>";
  html += '<h3 style="font-weight:570;font-size:17px;margin:0"><div class="Typewriter"><span class="Typewriter__wrapper" id="bioText"></span><span class="Typewriter__cursor">|</span></div></h3>';
  html += '<h2 style="font-weight:400;font-size:13px;margin:0;color:var(--joinStatus)">' + CONFIG.joinedDate + "</h2>";
  html += renderLocation() + "</div></div>";
  html += '<div class="divider"><div class="divider-inner"></div></div>';
  html += '<div class="links-section" style="margin-bottom:10px"><div class="links-row" style="justify-content:center">' + renderLinks() + "</div></div>";
  html += renderAbout() + renderPortfolio();
  html += "</div></div></div></div></div>";

  document.body.innerHTML = html;
  initBackgroundEffects();

  var bioEl = document.getElementById("bioText");
  if (bioEl) {
    if (CONFIG.bio.typewriter) {
      var texts = CONFIG.bio.texts;
      var idx = 0, charIdx = 0, deleting = false;
      function typeStep() {
        if (isPageHidden) { setTimeout(typeStep, 200); return; }
        var word = texts[idx];
        if (!deleting) {
          bioEl.textContent = word.slice(0, charIdx + 1); charIdx++;
          if (charIdx === word.length) { deleting = true; setTimeout(typeStep, CONFIG.bio.pauseDuration); return; }
          setTimeout(typeStep, CONFIG.bio.typeSpeed);
        } else {
          bioEl.textContent = word.slice(0, charIdx - 1); charIdx--;
          if (charIdx === 0) { deleting = false; idx = (idx + 1) % texts.length; setTimeout(typeStep, CONFIG.bio.deleteSpeed); return; }
          setTimeout(typeStep, CONFIG.bio.deleteSpeed);
        }
      }
      typeStep();
    } else {
      bioEl.textContent = CONFIG.bio.staticBio;
    }
  }

  var overlay = document.getElementById("overlay");
  var card = document.querySelector(".card");
  if (overlay) {
    overlay.addEventListener("click", function () {
      overlay.classList.add("overlay-hide");
      overlay.style.pointerEvents = "none";
      if (card) card.classList.add("card-show");
      setTimeout(function () { overlay.style.display = "none"; }, 750);
    });
  }

  var tipEl = document.createElement("div");
  tipEl.id = "forge-tip";
  tipEl.style.cssText = "position:fixed;z-index:99999999;padding:5px 12px;border-radius:15px;font-size:14px;line-height:1.3;color:#fafafa;background:rgba(20,20,20,0.55);border:2px solid rgba(26,26,26,0.2);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);pointer-events:none;opacity:0;transition:opacity .12s ease;white-space:nowrap";
  document.body.appendChild(tipEl);

  var _tipRAF;
  document.addEventListener("mouseover", function (e) {
    var trigger = e.target.closest('.tip-trigger');
    if (!trigger) { if (e.target !== tipEl) tipEl.style.opacity = "0"; return; }
    if (_tipRAF) cancelAnimationFrame(_tipRAF);
    _tipRAF = requestAnimationFrame(function () {
      _tipRAF = null;
      var src = trigger.querySelector('.tip-content');
      if (!src) return;
      tipEl.textContent = src.textContent;
      var tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
      var l = Math.round(e.clientX - tw / 2), t = Math.round(e.clientY - th - 12);
      if (l < 4) l = 4; if (l + tw > window.innerWidth - 4) l = window.innerWidth - tw - 4;
      if (t < 4) t = 4;
      tipEl.style.left = l + "px"; tipEl.style.top = t + "px"; tipEl.style.opacity = "1";
    });
  });
  document.addEventListener("mouseleave", function () { tipEl.style.opacity = "0"; });
})();
