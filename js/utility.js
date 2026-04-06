function showError() {
  document.getElementById('error').style.display = '';
}


// ===========================
// 表示関連
// ===========================
let loadingTimer = null;

function showLoading(text = '読み込み中') {
  console.log("loading show");
  if (loadingTimer) clearTimeout(loadingTimer);

  const overlay = document.getElementById('loading-overlay');
  const lodingText = document.getElementById('loading-text');
  const closeBtn = document.getElementById('loading-close-btn');

  if (lodingText) lodingText.textContent = text;
  if (overlay) overlay.style.display = 'flex';

  if (closeBtn) {
    closeBtn.onclick = () => hideLoading(0);
  }
}

function hideLoading(delay = 0) {
  console.log("loading hide", delay);
  if (loadingTimer) clearTimeout(loadingTimer);

  loadingTimer = setTimeout(() => {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    loadingTimer = null;
  }, delay);
}

async function withLoading(task, options = {}) {
  const {
    text = '読み込み中...',
    hideDelay = 300,
    safetyTimeout = 45000
  } = options;

  showLoading(text);

  let finished = false;

  const safeHide = () => {
    if (!finished) {
      finished = true;
      hideLoading(hideDelay);
    }
  };

  const safetyTimer = setTimeout(() => {
    console.warn('loading safety timeout');
    safeHide();
  }, safetyTimeout);

  const closeBtn = document.getElementById('loading-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => safeHide();
  }


  try {
    const result = await task();
    return result;
  } catch (error) {
    throw error;
  } finally {
    clearTimeout(safetyTimer);
    safeHide();
  }
}

async function fetchWithTimeout(fetchFunc, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetchFunc(controller.signal);
    return res;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('送信に少し時間がかかっています。\n報告はもう届いているかもしれません。\n返信が来るまで少しお待ちください。');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}




// サニタイズ
function sanitizeBeforeSubmit(data) {
  const sanitized = { ...data };

  const isVisit = sanitized.reasonCode === 'VISIT';
  const isIllnessWithVisit =
  sanitized.reasonCode === 'ILLNESS' &&
  ['PLAN', 'DONE'].includes(sanitized.visitStatus);

if (!(isVisit || isIllnessWithVisit)) {
  sanitized.departmentCodes = [];
  sanitized.departmentOther = '';
}


  return sanitized;
}



// -------------------------------------------
// タイムアウトテスト用送信関数
// 元の postToGAS を使う
// -------------------------------------------
async function testTimeout() {
  const payload = { dummy: 'test' }; // 適当なテストデータ

  try {
    // withLoading でモーダル表示
    const result = await withLoading(
      // postToGAS はすでに Promise を返すので直接渡す
      () => sendWithRetry('submit_absence', payload,1),
      { text: '送信中…（タイムアウトテスト）' }
    );

    console.log('GAS response (遅延テスト):', result);
    setStatus('success', '遅延テスト成功');

  } catch (err) {
    console.error('タイムアウト発生:', err);
    setStatus('error', err.message || '送信失敗（タイムアウト）');
  } finally {
    hideLoading();
  }
}

