(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => r.querySelectorAll(s);
  const CE = (t, p, a) => { const e = document.createElement(t); if (p) Object.assign(e, p); if (a) e.append(...a); return e; };

  const DEFAULTS = {
    username: "user", subtitle: "subtitle", avatar: { type: "text", src: ["?"] },
    bio: { typewriter: false, texts: [""], staticBio: "", suffix: "", typeSpeed: 80, deleteSpeed: 50, pauseDuration: 2000 },
    links: [], textLinks: [], badges: [],
    audio: { enabled: true, autoplay: false, loop: true, volume: 0.5, showControls: true, playlist: [] },
    discord: { enabled: false, serverName: "", inviteUrl: "", username: "", status: "", customStatus: "", avatarUrl: "" },
    fonts: { enabled: true, families: ["Inter", "DM Sans"], importUrl: "" },
    layout: { type: "glass", containerWidth: "44rem", containerPadding: "26px", containerRadius: "20px" },
    theme: {
      textColor: "#ffffff", backgroundColor: "#0a0a0a", glowColor: "#ffffff",
      containerColor: "rgba(255,255,255,0.06)", containerBlur: "12px",
      containerBorderWidth: "1px", containerBorderColor: "rgba(255,255,255,0.08)",
      buttonBg: "rgba(255,255,255,0.1)", buttonBorder: "1px solid rgba(255,255,255,0.12)",
      buttonRadius: "12px", buttonBgHover: "rgba(255,255,255,0.2)",
      volumeBg: "rgba(255,255,255,0.1)", volumeBorder: "1px solid rgba(255,255,255,0.05)",
    },
    background: { src: "", color: "#0a0a0a", effects: { aurora: false, dither: false, plasma: false } },
    card3d: { enabled: false, intensity: 8, perspective: 1000 },
    mouseEffect: { enabled: false, variant: "particles", color: "#ffffff" },
    cursor: { enabled: false, src: "", hotspotX: 16, hotspotY: 16 },
    shuffleText: { enabled: false, text: "", fontFamily: "Inter", fontSize: "4rem" },
    progressBar: { height: 3, radius: 15, color: "#ffffff", bgColor: "rgba(255,255,255,0.3)" },
    volumeControl: { enabled: false, position: "top-left" },
    equalizer: { enabled: false }, avatarWave: { enabled: false },
    badges: [], joinedDate: "", location: { enabled: false }, about: { enabled: false }, portfolio: { enabled: false },
  };

  const C = { ...DEFAULTS, ...window.CONFIG };
  C.theme = { ...DEFAULTS.theme, ...C.theme };
  C.bio = { ...DEFAULTS.bio, ...C.bio };
  C.background = { ...DEFAULTS.background, ...C.background };
  C.layout = { ...DEFAULTS.layout, ...C.layout };
  C.theme.usernameEffects = C.theme.usernameEffects || "none";
  C.theme.selectionBg = C.theme.selectionBg || "#ffffff";
  C.theme.selectionColor = C.theme.selectionColor || "#000000";

  const cssVar = (n, v) => document.documentElement.style.setProperty(n, v);

  function applyTheme() {
    const t = C.theme;
    cssVar("--textColor", t.textColor);
    cssVar("--bgColor", t.backgroundColor);
    cssVar("--glowColor", t.glowColor);
    cssVar("--containerColor", t.containerColor);
    cssVar("--containerBlur", t.containerBlur);
    cssVar("--containerBorder", `${t.containerBorderWidth||"1px"} solid ${t.containerBorderColor||"rgba(255,255,255,0.08)"}`);
    cssVar("--containerWidth", C.layout.containerWidth);
    cssVar("--containerPadding", C.layout.containerPadding);
    cssVar("--containerRadius", C.layout.containerRadius);
    cssVar("--buttonBg", t.buttonBg);
    cssVar("--buttonBorder", t.buttonBorder);
    cssVar("--buttonRadius", t.buttonRadius);
    cssVar("--buttonBgHover", t.buttonBgHover);
    cssVar("--volumeBg", t.volumeBg);
    cssVar("--volumeBorder", t.volumeBorder);
    cssVar("--usernameGlow", t.glowColor ? `0 0 10px ${t.glowColor}` : "none");
    cssVar("--usernameEffects", t.usernameEffects === "none" ? "none" : t.usernameEffects);
    cssVar("--colorUsernameGlow", t.glowColor ? `0 0 10px ${t.glowColor}` : "none");
    cssVar("--profileBorderWidth", "2px");
    cssVar("--profileBorderColor", "rgba(255,255,255,0.5)");
    cssVar("--userBadge", "14px");
    cssVar("--badgeContainerBorder", "1px solid rgba(255,255,255,0.12)");
    cssVar("--badgeContainerBackground", "rgba(255,255,255,0.06)");
    document.documentElement.style.colorScheme = "dark";
    document.documentElement.style.setProperty("--selection-bg", t.selectionBg);
    document.documentElement.style.setProperty("--selection-color", t.selectionColor);
  }

  function getVideoType(src) {
    const ext = src.split(".").pop().toLowerCase().split("?")[0];
    const map = { mp4: "video/mp4", webm: "video/webm", ogg: "video/ogg", ogv: "video/ogg", mov: "video/mp4" };
    return map[ext] || "video/mp4";
  }

  function isMobilePortrait() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
      window.matchMedia("(orientation: portrait)").matches;
  }

  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  function createVideoBackground(src) {
    const wrap = CE("div", { className: "bg-wrap" });
    const color = CE("div", { className: "bg-color", style: `background-color:${C.background.color}` });
    const video = CE("video", { className: "bg-image", src, autoplay: true, loop: true, muted: true, playsInline: true });
    video.preload = "auto";
    const dim = CE("div", { className: "bg-dim" });
    wrap.append(color, video, dim);
    return { wrap, type: "video", video };
  }

  function createImageBackground(src) {
    const wrap = CE("div", { className: "bg-wrap" });
    const color = CE("div", { className: "bg-color", style: `background-color:${C.background.color}` });
    const img = CE("div", { className: "bg-image", style: `background-image:url(${src})` });
    wrap.append(color, img);
    return { wrap, type: "image" };
  }

  function createColorBackground(color) {
    const wrap = CE("div", { className: "bg-wrap" });
    const div = CE("div", { className: "bg-color", style: `background-color:${color}` });
    wrap.append(div);
    return { wrap, type: "color" };
  }

  function createBackground() {
    const src = C.background.src;
    if (!src) return createColorBackground(C.background.color);
    if (/\.(mp4|webm|ogg|ogv|mov)(\?|$)/i.test(src)) return createVideoBackground(src);
    return createImageBackground(src);
  }

  function createSplash(onDismiss) {
    const splash = CE("div", { className: "splash" });
    splash.style.cssText = "opacity:1";
    const text = CE("div", { className: "splash-text" });
    const span = CE("span");
    span.style.cssText = `color:${C.theme.textColor};font-family:${C.splash?.fontFamily || "'Inter','DM Sans',sans-serif"};font-size:${C.splash?.fontSize || "34px"};font-weight:${C.splash?.fontWeight || "500"}`;
    span.textContent = C.splash?.text || C.username;
    text.append(span);
    splash.append(text);
    splash.addEventListener("click", () => {
      splash.style.opacity = "0";
      setTimeout(() => splash.remove(), 400);
      onDismiss();
    }, { once: true });
    document.body.append(splash);
    return splash;
  }

  function createLoadingScreen() {
    const overlay = CE("div", { className: "splash" });
    overlay.style.cssText = "opacity:1;z-index:99999";
    const barWrap = CE("div");
    barWrap.style.cssText = "width:200px;height:3px;background:rgba(255,255,255,0.15);border-radius:8px;overflow:hidden";
    const bar = CE("div");
    bar.style.cssText = "height:100%;width:0%;background:#fff;border-radius:8px;transition:width .3s";
    barWrap.append(bar);
    overlay.append(barWrap);
    document.body.append(overlay);
    return { overlay, bar };
  }

  function renderAvatar() {
    const container = CE("div", { className: "avatar" });
    const srcs = Array.isArray(C.avatar.src) ? C.avatar.src : [C.avatar.src];
    if (C.avatar.type === "image" && srcs.length) {
      const chosen = srcs[Math.floor(Math.random() * srcs.length)];
      const img = CE("img", { className: "avatar-img", src: chosen, alt: `${C.username} Avatar`, draggable: false });
      img.onerror = () => { img.style.display = "none"; };
      container.append(img);
    } else {
      container.textContent = srcs[0] || "?";
    }
    return container;
  }

  function renderBadges() {
    if (!C.badges?.length) return null;
    const el = CE("div", { className: "header-row" });
    [renderUsername(), renderSubtitle()].filter(Boolean).forEach(c => el.append(c));
    return el;
  }

  function renderUsername() {
    const wrap = CE("div", { className: "text-col h1" });
    const h1 = CE("h1");
    h1.textContent = `@${C.username}`;
    h1.style.cssText = `background-image:var(--usernameEffects);-webkit-background-clip:text;background-clip:text;text-shadow:var(--colorUsernameGlow);width:fit-content;color:var(--textColor);`;
    wrap.append(h1);
    return wrap;
  }

  function renderSubtitle() {
    if (!C.subtitle) return null;
    const el = CE("span", { className: "subtext", textContent: C.subtitle });
    el.style.cssText = `font-weight:500;font-size:15px;opacity:.75;color:var(--textColor);text-shadow:var(--colorUsernameGlow);`;
    return el;
  }

  function renderBio() {
    if (!C.bio.typewriter && !C.bio.staticBio && !C.bio.suffix) return null;
    const el = CE("div", { style: "text-align:left;font-size:14.5px;line-height:1.6" });
    el.style.color = "var(--textColor)";

    if (C.bio.typewriter && C.bio.texts?.length) {
      const staticEl = CE("span", { textContent: C.bio.staticBio || "" });
      const suffixEl = CE("span", { textContent: C.bio.suffix ? ` ${C.bio.suffix}` : "" });
      suffixEl.style.opacity = "0.7";
      const typeEl = CE("span");
      el.append(staticEl, typeEl, suffixEl);
      let ti = 0, ci = 0, deleting = false;
      function tick() {
        const current = C.bio.texts[ti];
        typeEl.textContent = deleting ? current.slice(0, ci--) : current.slice(0, ci++);
        if (!deleting && ci > current.length) { deleting = true; setTimeout(tick, C.bio.pauseDuration); return; }
        if (deleting && ci < 0) { deleting = false; ti = (ti + 1) % C.bio.texts.length; ci = 0; }
        setTimeout(tick, deleting ? C.bio.deleteSpeed : C.bio.typeSpeed);
      }
      tick();
    } else {
      const staticText = C.bio.staticBio || "";
      const suffixText = C.bio.suffix ? ` ${C.bio.suffix}` : "";
      if (staticText) {
        const sEl = CE("span", { textContent: staticText });
        el.append(sEl);
      }
      if (suffixText) {
        const sEl = CE("span", { textContent: suffixText });
        sEl.style.opacity = "0.7";
        el.append(sEl);
      }
    }

    return el;
  }

  function renderDivider() {
    if (!C.links?.length && !C.textLinks?.length) return null;
    const el = CE("div", { className: "divider" });
    const inner = CE("div", { className: "divider-inner" });
    el.append(inner);
    return el;
  }

  function renderIconLink(link) {
    const container = CE("div", { className: "link-btn" });
    const a = CE("a", { href: link.url, target: "_blank", rel: "noopener noreferrer", title: "" });
    if (/\.(svg|png|jpg|jpeg|gif|webp)$/i.test(link.icon)) {
      const img = CE("img", { className: "link-icon", src: link.icon, alt: "", draggable: false });
      img.onerror = () => { img.style.display = "none"; };
      a.append(img);
    } else {
      const span = CE("span");
      span.innerHTML = `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
      a.append(span);
    }
    container.append(a);
    return container;
  }

  function renderTextLink(link) {
    const a = CE("a", { href: link.url, target: "_blank", rel: "noopener noreferrer", textContent: link.text });
    a.style.cssText = `display:inline-block;padding:8px 16px;background:var(--buttonBg);border:var(--buttonBorder);border-radius:var(--buttonRadius);color:var(--textColor);text-decoration:none;font-size:13px;font-weight:500;transition:background .25s,transform .25s,box-shadow .25s;`;
    a.onmouseenter = () => { a.style.background = "var(--buttonBgHover)"; a.style.transform = "translateY(-1px)"; a.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)"; };
    a.onmouseleave = () => { a.style.background = "var(--buttonBg)"; a.style.transform = "none"; a.style.boxShadow = "none"; };
    return a;
  }

  function renderLinks() {
    if (!C.links?.length && !C.textLinks?.length) return null;
    const section = CE("div", { className: "links-section" });
    if (C.links?.length) {
      const row = CE("div", { className: "links-row" });
      C.links.forEach(l => row.append(renderIconLink(l)));
      section.append(row);
    }
    if (C.textLinks?.length) {
      const row = CE("div", { className: "links-row" });
      C.textLinks.forEach(l => row.append(renderTextLink(l)));
      section.append(row);
    }
    return section;
  }

  function createAudioPlayer() {
    if (!C.audio?.src) return null;
    const a = new Audio(C.audio.src);
    a.loop = C.audio.loop ?? true;
    a.volume = C.audio.volume ?? 0.5;
    return a;
  }

  function playAudio(audio) {
    if (!audio) return;
    audio.play().catch(() => {});
  }

  function init() {
    applyTheme();
    if (C.cursor?.enabled && C.cursor?.src && !isTouchDevice()) {
      document.body.classList.add("custom-cursor");
      const cur = CE("img", { src: C.cursor.src });
      cur.style.cssText = "position:fixed;top:0;left:0;width:48px;height:48px;pointer-events:none;z-index:999999;transform:translate(-50%,-50%);transition:opacity .15s;opacity:0";
      document.body.append(cur);

      const trailPool = [];
      const TRAIL_COUNT = 8;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const t = CE("img", { src: "src/assets/cursortrail-osu.png" });
        t.style.cssText = `position:fixed;top:0;left:0;width:${20 - i * 1.5}px;height:${20 - i * 1.5}px;pointer-events:none;z-index:${999998 - i};transform:translate(-50%,-50%);opacity:0;transition:opacity .08s`;
        document.body.append(t);
        trailPool.push({ el: t, x: 0, y: 0 });
      }

      let mx = 0, my = 0;
      document.addEventListener("mousemove", e => {
        mx = e.clientX; my = e.clientY;
        cur.style.left = mx + "px";
        cur.style.top = my + "px";
        cur.style.opacity = "1";
      });
      document.addEventListener("mouseleave", () => { cur.style.opacity = "0"; trailPool.forEach(t => t.el.style.opacity = "0"); });
      document.addEventListener("mouseenter", () => { cur.style.opacity = "1"; });

      let frame = 0;
      function animTrail() {
        frame++;
        if (frame % 2 === 0) {
          for (let i = trailPool.length - 1; i > 0; i--) {
            trailPool[i].x = trailPool[i - 1].x;
            trailPool[i].y = trailPool[i - 1].y;
          }
          trailPool[0].x = mx;
          trailPool[0].y = my;
        }
        trailPool.forEach((t, i) => {
          const d = Math.hypot(t.x - mx, t.y - my);
          t.el.style.left = t.x + "px";
          t.el.style.top = t.y + "px";
          t.el.style.opacity = d > 2 ? (0.4 - i * 0.04).toFixed(2) : "0";
        });
        requestAnimationFrame(animTrail);
      }
      animTrail();

      const interactiveSelector = 'a, button, [role="button"], input, textarea, select, .link-btn, .link-icon, .tip-trigger, [onclick]';
      document.addEventListener("mouseover", e => {
        if (e.target.closest(interactiveSelector)) {
          cur.style.width = "64px";
          cur.style.height = "64px";
          cur.style.filter = "drop-shadow(0 0 8px rgba(255,255,255,0.5))";
        }
      });
      document.addEventListener("mouseout", e => {
        if (e.target.closest(interactiveSelector)) {
          cur.style.width = "48px";
          cur.style.height = "48px";
          cur.style.filter = "";
        }
      });
    }
    const { wrap: bgWrap, video: bgVideo } = createBackground();
    document.body.prepend(bgWrap);

    if (bgVideo && isTouchDevice()) {
      const tryPlay = () => { bgVideo.play().catch(() => {}); };
      document.addEventListener("touchstart", tryPlay, { once: true });
      document.addEventListener("click", tryPlay, { once: true });
    }

    const loading = createLoadingScreen();
    const audio = createAudioPlayer();

    const waitForReady = () => new Promise(resolve => {
      if (C.background.src && /\.(mp4|webm|ogg|ogv|mov)(\?|$)/i.test(C.background.src)) {
        const v = bgWrap.querySelector("video");
        if (!v) return resolve();
        if (v.readyState >= 2) return resolve();
        v.oncanplay = resolve;
        v.onerror = resolve;
        setTimeout(resolve, 6000);
      } else {
        resolve();
      }
    });

    waitForReady().then(() => {
      let progress = 0;
      const iv = setInterval(() => {
        progress += Math.random() * 20 + 10;
        if (progress >= 100) { progress = 100; loading.bar.style.width = "100%"; clearInterval(iv); setTimeout(() => { loading.overlay.style.opacity = "0"; setTimeout(() => loading.overlay.remove(), 400); showSplash(); }, 200); }
        else loading.bar.style.width = progress + "%";
      }, 150);
    });

    function showSplash() {
      if (C.splash?.text) {
        createSplash(() => playAudio(audio));
      } else {
        playAudio(audio);
      }
      showProfile();
    }

    function showProfile() {
      const contentWrap = CE("div", { className: "content-wrap" });
      const card = CE("div", { className: "card" });
      [renderDivider(), renderProfile(), renderLinks()].filter(Boolean).forEach(el => card.append(el));
      contentWrap.append(card);
      document.body.append(contentWrap);
      requestAnimationFrame(() => { requestAnimationFrame(() => { card.classList.add("card-show"); }); });
    }

    function renderProfile() {
      const profile = CE("div");
      profile.style.cssText = "display:flex;flex-direction:column;gap:4px;";
      const row = CE("div", { className: "profile-row" });
      row.append(renderAvatar());
      const textCol = CE("div", { className: "text-col" });
      [renderUsername(), renderSubtitle(), renderBio()].filter(Boolean).forEach(el => textCol.append(el));
      if (C.badges?.length) {
        const badgeRow = CE("div", { className: "header-row", style: "flex-wrap:wrap;gap:6px;margin-top:4px" });
        C.badges.forEach(b => {
          const badgeEl = CE("span", { className: "badge" });
          const svg = BADGE_SVGS[b];
          if (svg) {
            const icon = CE("span", { className: "badge-icon" });
            icon.innerHTML = svg;
            badgeEl.append(icon);
          }
          const label = CE("span", { className: "badge-el-5", textContent: b });
          badgeEl.append(label);
          badgeRow.append(badgeEl);
        });
        textCol.append(badgeRow);
      }
      row.append(textCol);
      profile.append(row);
      return profile;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
