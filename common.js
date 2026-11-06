// index.html と settings.html の共通部品(設定の読み書き・メディアDB)
(() => {
  const DEF = {
    fit: 'cover',
    clock: { on: true, h24: true, sec: false, date: true, font: 'sans', weight: 200, size: 18,
             c1: '#ffffff', c2: '#9ec5ff', grad: false, glow: true, x: 50, y: 26 },
    search: { on: true, engine: 'brave', x: 50, y: 46, w: 84, bg: '#000000', op: 40,
              color: '#ffffff', radius: 24 },
    sc: { on: true, x: 50, y: 68, cols: 4, size: 56, label: true, shape: 'round',
          mode: 'auto', color: '#3b6cff',
          items: [
            { name: 'YouTube', url: 'https://www.youtube.com/' },
            { name: 'Gmail', url: 'https://mail.google.com/' },
            { name: 'GitHub', url: 'https://github.com/' },
            { name: 'Maps', url: 'https://maps.google.com/' }
          ] }
  };
  const ENG = {
    brave: ['Brave', 'https://search.brave.com/search?q='],
    google: ['Google', 'https://www.google.com/search?q='],
    ddg: ['DuckDuckGo', 'https://duckduckgo.com/?q='],
    yt: ['YouTube', 'https://www.youtube.com/results?search_query=']
  };
  // 外部フォントは読み込まない(通信0のため端末内蔵フォントのみ)
  const FONTS = {
    sans: 'system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif',
    round: 'ui-rounded,"Hiragino Maru Gothic ProN","Arial Rounded MT Bold",system-ui,sans-serif',
    serif: 'Georgia,"Hiragino Mincho ProN","Noto Serif JP",serif',
    mono: 'ui-monospace,Menlo,Consolas,monospace'
  };

  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const merge = (d, s) => {
    for (const k in s) d[k] = isObj(s[k]) && isObj(d[k]) ? merge(d[k], s[k]) : s[k];
    return d;
  };
  const load = () => {
    const c = structuredClone(DEF);
    try { merge(c, JSON.parse(localStorage.cfg || '{}')); } catch (e) {}
    return c;
  };
  const save = c => { localStorage.cfg = JSON.stringify(c); };
  const fixUrl = u => { u = String(u).trim(); return /^https?:\/\//i.test(u) ? u : 'https://' + u; };

  // ---------- IndexedDB(背景メディア) ----------
  const open = () => new Promise((res, rej) => {
    const r = indexedDB.open('startpage', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('media', { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const tx = async (mode, fn) => {
    const d = await open();
    return new Promise((res, rej) => {
      const t = d.transaction('media', mode);
      const req = fn(t.objectStore('media'));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
    });
  };

  window.SP = {
    DEF, ENG, FONTS, merge, load, save, fixUrl,
    getAll: () => tx('readonly', s => s.getAll()),
    put: o => tx('readwrite', s => s.put(o)),
    del: id => tx('readwrite', s => s.delete(id))
  };
})();
