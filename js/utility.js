document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add(`env-${ENV_NAME}`);
});


async function withLoading(task, options = {}) {
  const {
    text = '読み込み中…',
    hideDelay = 300,
    type = 'normal'
  } = options;

  showLoading(text,type);

  try {
    return await task();
  } finally {
    hideLoading(hideDelay);
  }
}

function showLoading(text = '読み込み中…', type = 'normal') {
  const loadingText = document.getElementById('loading-text');
  if (loadingText) {
    loadingText.textContent = text;
  }

  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  overlay.classList.remove('sending');

  if(type === 'sending') {
    overlay.classList.add('sending');
  }

  overlay.style.display = 'flex';
}

function hideLoading(delay = 0) {
  setTimeout(() => {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;

    overlay.style.display = 'none';

    // 状態リセット
    overlay.classList.remove('sending');
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
  const result = await postToGAS('master_version');
  console.log('[master_version raw]', result);
  return result.getMasterVersion;
}


async function loadMasters() {
  console.log("GAS_URL:", GAS_URL);
  console.log("LIFF_ID:", LIFF_ID);

  // ① 最新バージョン取得
  const latestVersion = await fetchMasterVersion();

  const localVersion = localStorage.getItem(MASTER_VERSION_KEY);
  const localMasters = localStorage.getItem(MASTER_DATA_KEY);

  if (localVersion === latestVersion && localMasters) {
    console.log('[masters] use cache');
    return JSON.parse(localMasters);
  }

  console.log('[masters] fetch from GAS');

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
