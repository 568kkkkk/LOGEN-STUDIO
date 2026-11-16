/* LOGEN STUDIO · MV3 service worker
   只负责「拿标签页流 ID」和转发消息；真正的录制在 offscreen.js 里完成。
   tabCapture 是唯一能在不弹共享窗口的前提下读取当前标签页音频的通道。 */
const OFFSCREEN_PATH = 'offscreen.html';

async function hasOffscreen() {
  try {
    const list = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
    return list.some(c => c.documentUrl && c.documentUrl.indexOf(OFFSCREEN_PATH) >= 0);
  } catch (e) { return false; }
}
async function ensureOffscreen() {
  if (await hasOffscreen()) return;
  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_PATH,
      reasons: ['USER_MEDIA'],
      justification: '在后台采集当前标签页音频并录制为采样文件'
    });
  } catch (e) {
    if (String(e && e.message || '').indexOf('only one') < 0) throw e;
  }
}
function toOffscreen(msg) {
  return chrome.runtime.sendMessage(Object.assign({ target: 'offscreen' }, msg))
    .catch(() => chrome.runtime.sendMessage(msg));
}
async function startForTab(tabId, ownerTabId) {
  try {
    await ensureOffscreen();
    /* getMediaStreamId 需要「用户调用扩展」；从悬浮球点击或工具栏图标点击都会走到这里。
       若浏览器仍拒绝，content.js 会自动回退到共享窗口，不会卡死。 */
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });
    await toOffscreen({ type: 'logen:rec:start', streamId: streamId, tabId: tabId,
      ownerTabId: ownerTabId || tabId, duration: 8000 });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message || e) };
  }
}
function toTab(tabId, msg) {
  if (!tabId) return;
  try { chrome.tabs.sendMessage(tabId, msg).catch(() => {}); } catch (e) {}
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;
  const tabId = (sender.tab && sender.tab.id) || msg.tabId;

  if (msg.type === 'logen:ext:start') {
    /* 悬浮球可选定任意已打开的标签页，而不是只能采当前页 */
    startForTab(msg.tabId || tabId, tabId).then(r => sendResponse(r));
    return true;
  }
  if (msg.type === 'logen:ext:listTabs') {
    chrome.tabs.query({}, tabs => {
      const list = (tabs || []).filter(t => t.id && t.url && /^https?:/i.test(t.url))
        .map(t => ({ id: t.id, title: t.title || t.url }));
      sendResponse({ ok: true, tabs: list });
    });
    return true;
  }
  if (msg.type === 'logen:ext:stop') {
    toOffscreen({ type: 'logen:rec:stop' });
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'logen:ext:done') {
    toTab(msg.ownerTabId || msg.tabId || tabId, { type: 'logen:ext:sample', b64: msg.b64, mime: msg.mime, dur: msg.dur });
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'logen:ext:status') {
    toTab(msg.ownerTabId || msg.tabId || tabId, { type: 'logen:ext:status', text: msg.text });
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'logen:ext:error') {
    toTab(msg.ownerTabId || msg.tabId || tabId, { type: 'logen:ext:error', error: msg.error });
    sendResponse({ ok: true });
    return true;
  }
});

/* 工具栏图标 = 一次明确的「用户调用扩展」，可满足 tabCapture 的授权前提。
   点一下就开始录当前标签页，全程没有共享窗口。 */
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;
  /* 若悬浮球里选过目标标签页，工具栏点击也作用于同一个标签页 */
  let chosen = null;
  try { const d = await chrome.storage.local.get('logenTargetTabId'); chosen = d && d.logenTargetTabId; } catch (e) {}
  const id = chosen || tab.id;
  const r = await startForTab(id, tab.id);
  if (!r.ok) toTab(tab.id, { type: 'logen:ext:error', error: r.error });
});
