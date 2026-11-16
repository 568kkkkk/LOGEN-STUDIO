/* LOGEN STUDIO floating sampler - Chrome / Edge MV3 content script
   Injected into every http(s) page. Uses Shadow DOM so host page CSS cannot affect it. */
(function () {
  'use strict';
  if (window.__logenExtLoaded) return;
  if (document.getElementById('fab') && document.title.indexOf('LOGEN STUDIO') >= 0) return;
  window.__logenExtLoaded = true;

  var host = document.createElement('div');
  host.style.cssText = 'position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;';
  var root = host.attachShadow({ mode: 'open' });
  root.innerHTML =
    '<style>' +
    ':host{all:initial}*{box-sizing:border-box}' +
    '#ball{position:fixed;right:20px;bottom:20px;width:54px;height:54px;border-radius:50%;background:#17191d;' +
    'border:3px solid #fff;box-shadow:0 8px 24px rgba(0,0,0,.3);display:grid;place-items:center;cursor:grab;' +
    'user-select:none;touch-action:none;z-index:2147483647}' +
    '#ball.live{background:#d63c22;animation:lp 1.1s infinite}@keyframes lp{50%{opacity:.6}}' +
    '#ball .w{display:flex;align-items:center;gap:3px;height:20px;pointer-events:none}' +
    '#ball .w i{display:block;width:3px;height:6px;background:#fff;border-radius:2px}' +
    '#ball .w i:nth-child(2){height:15px;background:#2f5fe0}#ball .w i:nth-child(3){height:9px}' +
    '#ball .w i:nth-child(4){height:19px;background:#2f5fe0}#ball .w i:nth-child(5){height:7px}' +
    '#ball b{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;' +
    'background:#2f5fe0;color:#fff;font:700 10px/18px Arial;text-align:center;pointer-events:none}' +
    '#panel{position:fixed;width:300px;background:#fff;color:#17191d;border:1px solid #d2d4cf;border-radius:14px;' +
    'box-shadow:0 18px 48px rgba(0,0,0,.22);font:12px/1.5 "Microsoft YaHei",Arial,sans-serif;display:none;' +
    'overflow:hidden;z-index:2147483647}' +
    '#panel.open{display:block}' +
    '.hd{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f7f7f4;' +
    'border-bottom:1px solid #e4e5e1;font-weight:700;letter-spacing:.04em}' +
    '.hd button{border:0;background:transparent;font-size:18px;line-height:1;color:#8a8d92;cursor:pointer}' +
    '.bd{padding:11px 12px}' +
    '.seg{display:flex;gap:5px;margin-bottom:8px}' +
    '.seg button{flex:1;border:1px solid #d2d4cf;background:#fff;border-radius:6px;padding:6px 3px;' +
    'font-size:10px;font-weight:600;color:#17191d;cursor:pointer}' +
    '.seg button.on{background:#17191d;color:#fff;border-color:#17191d}' +
    '#rec{width:100%;border:1px solid #2f5fe0;background:#2f5fe0;color:#fff;border-radius:8px;padding:9px;' +
    'font-size:12px;font-weight:700;cursor:pointer}' +
    '#rec.stop{background:#fff;color:#d63c22;border-color:#d63c22}' +
    '.bar{height:5px;background:#e4e5e1;border-radius:4px;overflow:hidden;margin:9px 0}' +
    '.bar i{display:block;height:100%;width:0;background:#2f5fe0}' +
    '.hint{font-size:10px;color:#8a8d92;line-height:1.65;margin:6px 0}' +
    '.list{max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-top:8px}' +
    '.item{border:1px solid #e4e5e1;background:#f7f7f4;border-radius:7px;padding:7px 8px}' +
    '.nm{font-size:11px;font-weight:700}.du{float:right;font-size:10px;color:#8a8d92}' +
    '.acts{display:flex;gap:5px;margin-top:6px}' +
    '.acts button,.mini{border:1px solid #d2d4cf;background:#fff;border-radius:5px;padding:3px 8px;' +
    'font-size:10px;font-weight:600;color:#17191d;cursor:pointer}' +
    '.acts button:hover,.mini:hover{border-color:#2f5fe0}' +
    '.empty{text-align:center;color:#9a9da2;font-size:10px;padding:12px 4px}' +
    '.div{height:1px;background:#e4e5e1;margin:11px 0}' +
    '.row{display:flex;gap:5px;margin-top:6px}' +
    '#site{flex:1;min-width:0;border:1px solid #d2d4cf;border-radius:5px;padding:5px 7px;font-size:10px}' +
    '.wide{width:100%;margin-top:6px}' +
    '#keep{accent-color:#2f5fe0;margin:0}' +
    '#tabPick{width:100%;border:1px solid #d2d4cf;border-radius:5px;padding:5px 7px;font-size:10px;margin-top:6px;background:#fff;color:#17191d}' +
    '</style>' +
    '<div id="ball" title="LOGEN STUDIO 悬浮采样器"><span class="w"><i></i><i></i><i></i><i></i><i></i></span><b id="cnt">0</b></div>' +
    '<div id="panel"><div class="hd"><strong>LOGEN STUDIO · 悬浮采样</strong><button id="close">×</button></div>' +
    '<div class="bd">' +
    '<div class="seg"><button data-src="ext" class="on">⚡ 任意网页（无弹窗）</button><button data-src="screen">▣ 窗口 / 系统</button><button data-src="tab">▣ 共享标签页</button><button data-src="mic">◉ 麦克风</button></div>' +
    '<select id="tabPick" title="选择要采集的标签页"><option value="">● 当前标签页</option></select>' +
    '<button id="rec">● 开始采样 〔F9〕（最长 8 秒）</button>' +
    '<div class="bar"><i id="lvl"></i></div>' +
    '<div id="hint" class="hint">默认用扩展直采，下拉可选任意已打开标签页，全程不弹共享窗口；按 F9 也能开始 / 停止。采其他应用窗口请用「▣ 窗口 / 系统」，授权一次后会保持连接。若浏览器要求授权，点一下工具栏的 LOGEN 图标即可。</div>' +
    '<div class="row"><label style="display:flex;align-items:center;gap:5px;flex:1;font-size:10px;color:#8a8d92"><input id="keep" type="checkbox" checked> 保持授权（不再弹窗）</label><button id="disconnect" class="mini">⛔ 断开共享</button></div>' +
    '<div id="list" class="list"></div>' +
    '<audio id="audio" style="display:none"></audio>' +
    '<div class="div"></div>' +
    '<div class="hint">采样保存在本扩展里，可试听、下载。把下载的音频导入 LOGEN STUDIO 的采样库，即可当作音色使用。</div>' +
    '<div class="row"><input id="site" placeholder="粘贴 LOGEN STUDIO 分享链接"><button id="saveSite" class="mini">保存</button></div>' +
    '<button id="openSite" class="mini wide">↗ 打开 LOGEN STUDIO</button>' +
    '<div id="status" class="hint"></div>' +
    '</div></div>';
  (document.body || document.documentElement).appendChild(host);

  var $ = function (s) { return root.querySelector(s); };
  var ball = $('#ball'), panel = $('#panel');
  var source = 'ext', recording = false, stream = null, rec = null, chunks = [], t0 = 0;
  var timer = null, meter = null, meterData = null, samples = [], siteUrl = '';
  var shareMap = {}, keepShare = true, extMode = false, targetTabId = null;

  function setStatus(t) { $('#status').textContent = t; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function persist() {
    try { chrome.storage.local.set({ logenSamples: samples }, function () {
      if (chrome.runtime.lastError && samples.length > 1) { samples.pop(); persist(); }
    }); } catch (e) {}
  }
  function blobToB64(blob) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1]); };
      r.onerror = rej; r.readAsDataURL(blob);
    });
  }
  function b64ToBlob(b64, type) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: type || 'audio/webm' });
  }
  function extOf(type) { return String(type).indexOf('webm') >= 0 ? 'webm' : 'wav'; }
  function render() {
    $('#cnt').textContent = samples.length;
    $('#list').innerHTML = samples.length ? samples.map(function (s) {
      return '<div class="item"><span class="nm">' + esc(s.name) + '</span><span class="du">' +
        Number(s.dur || 0).toFixed(1) + 's</span><div class="acts">' +
        '<button data-act="play" data-id="' + s.id + '">▶ 试听</button>' +
        '<button data-act="dl" data-id="' + s.id + '">⤓ 下载</button>' +
        '<button data-act="del" data-id="' + s.id + '">✕</button></div></div>';
    }).join('') : '<div class="empty">还没有采样</div>';
  }
  try {
    chrome.storage.local.get(['logenSamples', 'logenSite', 'logenPos'], function (d) {
      d = d || {};
      samples = Array.isArray(d.logenSamples) ? d.logenSamples : [];
      siteUrl = d.logenSite || '';
      $('#site').value = siteUrl;
      if (d.logenPos && typeof d.logenPos.x === 'number') {
        ball.style.left = d.logenPos.x + 'px'; ball.style.top = d.logenPos.y + 'px';
        ball.style.right = 'auto'; ball.style.bottom = 'auto';
      }
      render();
    });
  } catch (e) { render(); }

  function placePanel() {
    var r = ball.getBoundingClientRect(), w = 300, h = panel.offsetHeight || 380;
    var x = Math.min(Math.max(8, r.right - w), Math.max(8, window.innerWidth - w - 8));
    var y = r.top - h - 12;
    if (y < 8) y = Math.min(window.innerHeight - h - 8, r.bottom + 12);
    panel.style.left = x + 'px'; panel.style.top = y + 'px';
    panel.style.right = 'auto'; panel.style.bottom = 'auto';
  }
  function toggle(force) {
    var open = force === undefined ? !panel.classList.contains('open') : force;
    panel.classList.toggle('open', open);
    if (open) { placePanel(); loadTabs(); }
  }
  $('#close').onclick = function () { toggle(false); };

  var drag = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
  ball.addEventListener('pointerdown', function (e) {
    drag = true; moved = false; sx = e.clientX; sy = e.clientY;
    var r = ball.getBoundingClientRect(); ox = r.left; oy = r.top;
    try { ball.setPointerCapture(e.pointerId); } catch (err) {}
  });
  ball.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    var x = Math.max(4, Math.min(window.innerWidth - 58, ox + dx));
    var y = Math.max(4, Math.min(window.innerHeight - 58, oy + dy));
    ball.style.left = x + 'px'; ball.style.top = y + 'px';
    ball.style.right = 'auto'; ball.style.bottom = 'auto';
    if (panel.classList.contains('open')) placePanel();
  });
  ball.addEventListener('pointerup', function () {
    if (!drag) return;
    drag = false;
    if (moved) {
      var r = ball.getBoundingClientRect();
      try { chrome.storage.local.set({ logenPos: { x: r.left, y: r.top } }); } catch (e) {}
    } else toggle();
  });

  root.querySelectorAll('[data-src]').forEach(function (b) {
    b.onclick = function () {
      source = b.dataset.src;
      root.querySelectorAll('[data-src]').forEach(function (x) {
        x.classList.toggle('on', x.dataset.src === source);
      });
      setStatus(source === 'mic' ? '麦克风模式：可录环境声或音箱外放；把系统混音设为输入即可录其他窗口声音。' :
        source === 'ext' ? '扩展直采：下拉可选任意已打开标签页，不弹共享窗口；按 F9 也能开始 / 停止。' :
        source === 'screen' ? '窗口 / 系统：共享窗口切「整个屏幕」并勾选「分享系统音频」，可采其他应用窗口；授权一次后保持连接。' :
        '共享标签页：第一次选好标签页后会保持连接，之后不再弹窗。');
      $('#tabPick').style.display = source === 'ext' ? 'block' : 'none';
    };
  });

  function cachedStream(src) {
    var s = shareMap[src];
    if (!s) return null;
    var live = false;
    try { live = (s.getAudioTracks() || []).some(function (t) { return t.readyState === 'live'; }); } catch (e) {}
    if (!live) { delete shareMap[src]; return null; }
    return s;
  }
  function cacheStream(src, s) {
    shareMap[src] = s;
    try {
      var tracks = s.getAudioTracks() || [];
      if (tracks[0]) tracks[0].addEventListener('ended', function () {
        if (shareMap[src] === s) delete shareMap[src];
        setStatus('共享连接已结束，下次采样会重新询问一次。');
      }, { once: true });
    } catch (e) {}
  }
  function disconnect() {
    Object.keys(shareMap).forEach(function (k) {
      var s = shareMap[k];
      if (s) { try { s.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} }
      delete shareMap[k];
    });
    stream = null;
    setStatus('已断开所有共享连接。');
  }
  /* 列出所有已打开标签页：扩展直采不限于「当前页」 */
  function loadTabs() {
    try {
      chrome.runtime.sendMessage({ type: 'logen:ext:listTabs' }).then(function (r) {
        if (!r || !r.ok || !r.tabs) return;
        var sel = $('#tabPick'), cur = sel.value;
        sel.innerHTML = '<option value="">● 当前标签页</option>' + r.tabs.map(function (t) {
          return '<option value="' + t.id + '">' + esc((t.title || '未命名标签页').slice(0, 34)) + '</option>';
        }).join('');
        if (cur && r.tabs.some(function (t) { return String(t.id) === cur; })) sel.value = cur;
      }).catch(function () {});
    } catch (e) {}
  }
  $('#tabPick').onchange = function () {
    targetTabId = this.value ? Number(this.value) : null;
    try { chrome.storage.local.set({ logenTargetTabId: targetTabId }); } catch (e) {}
    setStatus(targetTabId ? '已选定目标标签页，按 F9 或点开始即可无弹窗直采。' : '已切回「当前标签页」。');
  };
  $('#ball').addEventListener('dblclick', loadTabs);
  loadTabs();
  $('#keep').onchange = function () {
    keepShare = !!this.checked;
    if (!keepShare) disconnect();
    else setStatus('已开启保持授权：完成一次授权后不再弹窗。');
  };
  $('#disconnect').onclick = disconnect;

  function stopTracks(force) {
    if (stream && (!keepShare || force)) {
      try { stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      stream = null;
    }
  }
  function updateRec(sec) {
    $('#rec').textContent = recording ? ('■ 停止采样 〔F9〕 ' + sec.toFixed(1) + 's / 8s') : '● 开始采样 〔F9〕（最长 8 秒）';
    $('#rec').classList.toggle('stop', recording);
    ball.classList.toggle('live', recording);
    if (!recording && meter) meter = null;
  }
  function meterLoop() {
    if (!recording || !meter) return;
    meter.getByteTimeDomainData(meterData);
    var sum = 0;
    for (var i = 0; i < meterData.length; i++) { var v = (meterData[i] - 128) / 128; sum += v * v; }
    $('#lvl').style.width = Math.min(100, Math.sqrt(sum / meterData.length) * 260).toFixed(0) + '%';
    requestAnimationFrame(meterLoop);
  }
  async function saveRecording() {
    if (!chunks.length) { setStatus('没有录到声音'); return; }
    var blob = new Blob(chunks, { type: chunks[0].type || 'audio/webm' });
    var b64;
    try { b64 = await blobToB64(blob); } catch (e) { setStatus('保存失败'); return; }
    var dur = (Date.now() - t0) / 1000;
    var name = '采样 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + (source === 'mic' ? '麦克风' : source === 'screen' ? '窗口/系统' : '网页');
    samples.unshift({ id: 'x' + Date.now(), name: name, dur: dur, type: blob.type, b64: b64, createdAt: Date.now() });
    samples = samples.slice(0, 12);
    persist(); render();
    setStatus('已保存 ' + dur.toFixed(1) + ' 秒，可试听或下载导入 LOGEN STUDIO');
  }
  /* 扩展直采：tabCapture 在 offscreen 文档里兑换流 ID，全程没有共享窗口 */
  function fallbackToShare(why) {
    source = 'tab'; extMode = false; recording = false;
    clearInterval(timer); updateRec(0);
    root.querySelectorAll('[data-src]').forEach(function (x) { x.classList.toggle('on', x.dataset.src === 'tab'); });
    setStatus('直采未启动：' + why + '。可点一下浏览器工具栏的 LOGEN 图标授权后再试；也可保持「共享窗口」模式点开始（只授权一次，之后会保持连接）。');
  }
  function startExtRec() {
    var p;
    try { p = chrome.runtime.sendMessage({ type: 'logen:ext:start', tabId: targetTabId || undefined }); }
    catch (e) { fallbackToShare('扩展消息发送失败，请重载扩展'); return; }
    if (!p || !p.then) { fallbackToShare('请更新 Chrome 到 116+ 并重载扩展'); return; }
    p.then(function (r) {
      if (!r || !r.ok) { fallbackToShare((r && r.error) || '浏览器要求先调用一次扩展'); return; }
      extMode = true; recording = true; t0 = Date.now();
      timer = setInterval(function () {
        if (!recording) return;
        var s = (Date.now() - t0) / 1000;
        if (s >= 8.5) stopRec(); else updateRec(s);
      }, 200);
      updateRec(0);
      setStatus('扩展直采中（无共享窗口）· 现在去播放想录的声音');
    }).catch(function (e) { fallbackToShare(String(e && e.message || e)); });
  }
  async function startRec() {
    if (recording) return;
    if (source === 'ext') { startExtRec(); return; }
    if (!navigator.mediaDevices) {
      setStatus('需要 HTTPS 页面，且浏览器为 Chrome / Edge'); return;
    }
    var reused = false, s = cachedStream(source);
    if (s) { stream = s; reused = true; }
    else {
      try {
        var opts = { video: true, audio: true, systemAudio: 'include', surfaceSwitching: 'include' };
        if (source === 'screen') { opts.monitorTypeSurfaces = 'include'; opts.selfBrowserSurface = 'exclude'; }
        else opts.selfBrowserSurface = 'exclude';
        stream = source === 'mic'
          ? await navigator.mediaDevices.getUserMedia({ audio: true })
          : await navigator.mediaDevices.getDisplayMedia(opts);
      } catch (e) { setStatus('已取消或没有权限：' + (e.message || e.name)); return; }
      if (keepShare) cacheStream(source, stream);
    }
    if (!stream.getAudioTracks().length) {
      setStatus(source === 'screen' ?
        '没拿到音频轨：共享窗口请切「整个屏幕」并勾选「同时分享系统音频」；macOS 多数版本只给标签页音频，可改用「麦克风 + 虚拟声卡」。' :
        '没拿到音频：请在共享窗口勾选「分享标签页音频 / 系统音频」');
      stopTracks(true); return;
    }
    /* 只把音频轨交给录制器：混合 video 轨会让 Chrome 的 MediaRecorder.start() 报错 */
    var audioStream = new MediaStream(stream.getAudioTracks());
    var opt = {};
    try { if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) opt = { mimeType: 'audio/webm;codecs=opus' }; } catch (e) {}
    try { rec = new MediaRecorder(audioStream, opt); } catch (e) { setStatus('浏览器不支持录音'); stopTracks(true); return; }
    chunks = [];
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = saveRecording;
    try { rec.start(150); } catch (e) { setStatus('录制器启动失败'); stopTracks(true); return; }
    if (!reused) {
      try {
        var at = stream.getAudioTracks()[0];
        if (at) at.addEventListener('ended', function () { if (recording) stopRec(); }, { once: true });
      } catch (e) {}
    }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      var ac = new AC();
      var an = ac.createAnalyser(); an.fftSize = 512;
      ac.createMediaStreamSource(audioStream).connect(an);
      meter = an; meterData = new Uint8Array(an.frequencyBinCount);
    } catch (e) {}
    recording = true; t0 = Date.now();
    meterLoop();
    timer = setInterval(function () {
      if (!recording) return;
      var s = (Date.now() - t0) / 1000;
      if (s >= 8) stopRec(); else updateRec(s);
    }, 200);
    updateRec(0);
    setStatus(reused ? '已复用保持中的共享连接 · 本次不弹窗，采样中' : '采样中 · 现在去播放想录的声音');
  }
  function stopRec() {
    if (!recording) return;
    recording = false;
    clearInterval(timer);
    if (extMode) {
      extMode = false;
      try { chrome.runtime.sendMessage({ type: 'logen:ext:stop' }); } catch (e) {}
      updateRec(0); setStatus('正在结束扩展直采…'); return;
    }
    try { rec.stop(); } catch (e) { saveRecording(); }
    setTimeout(function () { stopTracks(false); }, 250);
    updateRec(0);
  }
  $('#rec').onclick = function () { recording ? stopRec() : startRec(); };

  /* offscreen / service worker 回传的直采结果 */
  try {
    chrome.runtime.onMessage.addListener(function (msg) {
      if (!msg || !msg.type) return;
      if (msg.type === 'logen:ext:status') { setStatus(msg.text || ''); }
      else if (msg.type === 'logen:ext:error') {
        if (recording) { recording = false; extMode = false; clearInterval(timer); updateRec(0); }
        setStatus('直采失败：' + (msg.error || '未知错误') + '。可点一下工具栏的 LOGEN 图标，或切「共享窗口」。');
      } else if (msg.type === 'logen:ext:sample') {
        if (recording) { recording = false; extMode = false; clearInterval(timer); updateRec(0); }
        if (!msg.b64) { setStatus('没有录到声音（该标签页当时可能没有播放音频）'); return; }
        var name = '采样 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + ' · 扩展直采';
        samples.unshift({ id: 'x' + Date.now(), name: name, dur: msg.dur || 8,
          type: msg.mime || 'audio/webm', b64: msg.b64, createdAt: Date.now() });
        samples = samples.slice(0, 12);
        persist(); render();
        setStatus('已保存 ' + Number(msg.dur || 0).toFixed(1) + ' 秒（无共享窗口），可试听或下载导入 LOGEN STUDIO');
      }
    });
  } catch (e) {}
  /* 任意网页按 F9 开始 / 停止采样，输入框聚焦时不拦截 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'F9') return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    e.preventDefault(); if (e.repeat) return;
    recording ? stopRec() : startRec();
  });

  $('#list').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[data-act]') : null;
    if (!b) return;
    var s = samples.find(function (x) { return x.id === b.dataset.id; });
    if (!s) return;
    var blob = b64ToBlob(s.b64, s.type);
    var url = URL.createObjectURL(blob);
    if (b.dataset.act === 'play') {
      var a = $('#audio'); a.src = url; a.play().catch(function () { setStatus('无法试听这段音频'); });
    } else if (b.dataset.act === 'dl') {
      var link = document.createElement('a');
      link.href = url; link.download = 'LOGEN_' + s.name.replace(/[\\/:*?"<>|\s]+/g, '_') + '.' + extOf(s.type);
      document.body.appendChild(link); link.click(); link.remove();
      setStatus('已下载，可到 LOGEN STUDIO 用「导入本地音频」调用');
    } else if (b.dataset.act === 'del') {
      samples = samples.filter(function (x) { return x.id !== s.id; });
      persist(); render();
    }
    if (b.dataset.act !== 'play') setTimeout(function () { URL.revokeObjectURL(url); }, 6000);
  });

  $('#saveSite').onclick = function () {
    siteUrl = $('#site').value.trim();
    try { chrome.storage.local.set({ logenSite: siteUrl }); } catch (e) {}
    setStatus(siteUrl ? '已保存站点地址' : '已清空站点地址');
  };
  $('#openSite').onclick = function () {
    if (!siteUrl) { setStatus('先粘贴 LOGEN STUDIO 的分享链接，再点保存'); $('#site').focus(); return; }
    window.open(siteUrl, '_blank', 'noopener');
  };
})();
