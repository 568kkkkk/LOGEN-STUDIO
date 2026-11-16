/* LOGEN STUDIO · offscreen document
   tabCapture 给出的只是流 ID，必须在一个有 DOM / Web Audio 的扩展页面里兑换成
   MediaStream；离屏文档是唯一能长期存活又不挡用户的地方。 */
let rec = null, stream = null, chunks = [], ac = null, srcNode = null;
let tabId = null, ownerTabId = null, started = 0, timer = null, suppress = false;

function send(msg) {
  msg.ownerTabId = ownerTabId;
  try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (e) {}
}
function status(text) { send({ type: 'logen:ext:status', tabId: tabId, text: text }); }
function fail(err) { send({ type: 'logen:ext:error', tabId: tabId, error: err }); }
function done(b64, mime, dur) { send({ type: 'logen:ext:done', tabId: tabId, b64: b64, mime: mime, dur: dur }); }
function blobToB64(blob) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1] || '');
    r.onerror = () => res('');
    r.readAsDataURL(blob);
  });
}
function release() {
  try { if (srcNode) srcNode.disconnect(); } catch (e) {}
  try { if (ac && ac.state !== 'closed') ac.close(); } catch (e) {}
  try { if (stream) stream.getTracks().forEach(t => t.stop()); } catch (e) {}
  srcNode = null; ac = null; stream = null;
}
function stop(silent) {
  if (timer) { clearTimeout(timer); timer = null; }
  suppress = !!silent;
  if (rec && rec.state !== 'inactive') { try { rec.stop(); } catch (e) {} }
  rec = null;
  release();   // 立即释放，否则同一个标签页会报 "Cannot capture a tab with an active stream"
}
async function start(msg) {
  stop(true);
  tabId = msg.tabId || null;
  ownerTabId = msg.ownerTabId || tabId;
  let s;
  try {
    s = await navigator.mediaDevices.getUserMedia({
      audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: msg.streamId } },
      video: false
    });
  } catch (e) {
    fail('无法兑换标签页音频流：' + (e.message || e.name) + '。请点一下工具栏的 LOGEN 图标再试，或改用共享窗口模式。');
    return;
  }
  if (!s.getAudioTracks().length) { fail('该标签页没有音频轨'); release(); return; }
  stream = s;
  /* 捕获标签页后默认会让该标签页静音，把流接回输出用户才听得到 */
  try {
    ac = new AudioContext();
    srcNode = ac.createMediaStreamSource(s);
    srcNode.connect(ac.destination);
  } catch (e) {}
  let mime = '';
  try {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mime = 'audio/webm;codecs=opus';
  } catch (e) {}
  try {
    rec = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
  } catch (e) {
    fail('录制器不可用：' + (e.message || e.name));
    release(); return;
  }
  chunks = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = async () => {
    if (suppress) { suppress = false; return; }
    const blob = new Blob(chunks, { type: (chunks[0] && chunks[0].type) || mime || 'audio/webm' });
    chunks = [];
    if (blob.size) {
      const b64 = await blobToB64(blob);
      done(b64, blob.type, (Date.now() - started) / 1000);
      status('直采完成 · 已保存到悬浮采样球');
    } else {
      fail('没有录到声音（目标标签页当时可能没有播放音频）');
    }
  };
  started = Date.now();
  try { rec.start(150); } catch (e) { fail('录制启动失败：' + (e.message || e.name)); release(); return; }
  status('扩展直采中（无共享窗口）· 8 秒后自动结束');
  timer = setTimeout(() => stop(false), Math.max(1000, msg.duration || 8000));
}

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || (msg.target && msg.target !== 'offscreen')) return;
  if (msg.type === 'logen:rec:start') start(msg);
  else if (msg.type === 'logen:rec:stop') stop(false);
});
