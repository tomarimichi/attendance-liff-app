async function withLoading(task, options = {}) {
  const {
    text = '読み込み中…',
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



// -------------------------------------------
// fetchWithTimeout：Promise.race でタイムアウト判定
// postToGAS のように Promise を返す関数で使用可能
// -------------------------------------------
async function fetchWithTimeout(promise, timeout = 30000) {
  // timeout 用の Promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() =>{
      reject(new Error('timeout'));
     }, timeout);
  });

  // Promise.race で競合させる
  return Promise.race([
    promise,
    timeoutPromise
  ]);
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

// -------------------------------------------
// タイムアウトテストボタンにイベント登録
// -------------------------------------------
/*
const testBtn = document.getElementById('testBtn');
testBtn.addEventListener('click', async (e) => {
  e.preventDefault();  // フォーム送信を防ぐ
  await testTimeout();
});
*/