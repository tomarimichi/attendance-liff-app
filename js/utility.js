async function withLoading(task, options = {}) {
  const {
    text = '読み込み中…',
    hideDelay = 300,
    safetyTimeout = 40000
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

  try {
    const result = await Promise.resolve().then(task);
    return result;
  } catch (error) {
      throw error;
  } finally {
    clearTimeout(safetyTimer);
    safeHide();
  }
}

let loadingTimer = null;

function showLoading(text = '読み込み中…') {

  if (loadingTimer) {
    clearTimeout(loadingTimer);
    loadingTimer = null;
  }

  const overlay = document.getElementById('loading-overlay');
  const lodingText = document.getElementById('loading-text');

  if (lodingText) lodingText.textContent = text;

  if (overlay) overlay.style.display = 'flex';
}

/*
function showLoading(text = '読み込み中…') {
  const loadingText = document.getElementById('loading-text');
  if (loadingText) {
    loadingText.textContent = text;
  }

  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'flex';
}
*/

function hideLoading(delay = 0) {

  if (loadingTimer) {
    clearTimeout(loadingTimer);
  }

  loadingTimer = setTimeout(() => {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
       overlay.style.display = 'none';
       loadingTimer = null;
  }, delay);
}



function showError() {
  document.getElementById('error').style.display = '';
}



async function fetchMastersWithCache() {
  // ① ローカルストレージ確認
  const cached = localStorage.getItem(MASTER_CACHE_KEY);

  if (cached) {
    console.log('[fetchMasters] from localStorage');
    return JSON.parse(cached);
  }

  // ② なければ GAS から取得
  console.log('[fetchMasters] from GAS');
  const json = await fetchMasters();

  // fetchMasters は失敗時 null を返す設計なので
  if (json) {
    localStorage.setItem(
      MASTER_CACHE_KEY,
      JSON.stringify(json)
    );
  }

  return json;
}

async function fetchMasterVersion() {
  const res = await fetch(`${GAS_URL}?type=master_version`);
  if (!res.ok) throw new Error('master_version fetch failed');
  const json = await res.json();

  console.log('[master_version raw]', json);

  return json.data.version;
}

async function loadMasters() {
  // ① GAS の最新 version
  const latestVersion = await fetchMasterVersion();

  console.log('latestVersion:', latestVersion);
  console.log('typeof latestVersion:', typeof latestVersion);


  // ② ローカル確認
  const localVersion = localStorage.getItem(MASTER_VERSION_KEY) || null;
  const localMasters = localStorage.getItem(MASTER_DATA_KEY);

  console.log('[loadMasters]:',{ 
    localVersion: localStorage.getItem(MASTER_VERSION_KEY),
    latestVersion,
    equal: localStorage.getItem(MASTER_VERSION_KEY) === latestVersion,
    localMastersRaw: localStorage.getItem(MASTER_DATA_KEY),
  });


  if (localVersion === latestVersion && localMasters) {
    console.log('[masters] use cache', {
        serverVersion: latestVersion,
        localVersion: localVersion,
        hasLocal: true
    });
    return JSON.parse(localMasters);
  } else {
    console.log('[masters] fetch from GAS', {
        serverVersion: latestVersion,
        localVersion: localVersion,
        hasLocal: !!localMasters
        });
  }

  // ③ 不一致 → 再取得
  console.log('[masters] from GAS');
  const masters = await fetchMasters();

  localStorage.setItem(MASTER_VERSION_KEY, latestVersion);
  localStorage.setItem(MASTER_DATA_KEY, JSON.stringify(masters));

  return masters;
}


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



async function fetchWithTimeout(promise, timeout = 30000) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const res = await new Promise({ signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('timeout');
    }

    throw err;
  } finally {
    clearTimeout(timer);
  }
}
/*
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), timeout)
  );

  return Promise.race([
    promise,
    timeoutPromise
  ]);
}
*/
  /*
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    )
  ]);
  */


  



  // -------------------------------------------
// タイムアウトテスト用送信関数
// 元の postToGAS を使う
// -------------------------------------------
async function testTimeout() {
  const payload = { dummy: 'test' };

  try {
    const result = await withLoading(
      () => fetchWithTimeout(
        postToGAS('timeout_test', payload), // ← Promise を直接渡す
        30000                              // ← タイムアウトは第二引数
      ),
      { text: '送信中…（タイムアウトテスト）' }
    );

    console.log('GAS response (遅延テスト):', result);
    setStatus('success', '遅延テスト成功');
  } catch (err) {
    console.error('タイムアウト発生:', err);
    setStatus('error', err.message || '送信失敗（タイムアウト）');
  }
}