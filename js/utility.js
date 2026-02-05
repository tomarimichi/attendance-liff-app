/*
function showLoading(text) {
  const loading = document.getElementById('loading');
  const loadingText = document.getElementById('loading-text');
  loadingText.textContent = text;
  loading.style.display = '';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}
*/
async function withLoading(task, options = {}) {
  const {
    text = '読み込み中…',
    hideDelay = 300
  } = options;

  showLoading(text);

  try {
    return await task();
  } finally {
    hideLoading(hideDelay);
  }
}

function showLoading(text = '読み込み中…') {
  const loadingText = document.getElementById('loading-text');
  if (loadingText) {
    loadingText.textContent = text;
  }

  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideLoading(delay = 0) {
  setTimeout(() => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
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
  return json.masterVersion;
}

async function loadMasters() {
  // ① GAS の最新 version
  const latestVersion = await fetchMasterVersion();

  console.log('latestVersion:', latestVersion);
  console.log('typeof latestVersion:', typeof latestVersion);


  // ② ローカル確認
  const localVersion = localStorage.getItem(MASTER_VERSION_KEY);
  const localMasters = localStorage.getItem(MASTER_DATA_KEY);

console.log('[Type1]:',{
  localVersion,
  latestVersion,
  equal: localVersion === latestVersion,
  hasLocalMasters: !!localMasters,
});
console.log('[Type2]:',{ 
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

  // 症状は「体調不良」のときだけ有効
  if (sanitized.reasonCode !== 'ILLNESS') {
    sanitized.symptomCodes = [];
    sanitized.symptomOther = '';
  }

  // 受診科は「通院あり」のときだけ有効
  if (!['PLANNED', 'DONE'].includes(sanitized.visitStatus)) {
    sanitized.departmentCodes = [];
    sanitized.departmentOther = '';
  }

  return sanitized;
}
