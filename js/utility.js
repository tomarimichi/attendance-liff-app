function showLoading(text) {
  const loading = document.getElementById('loading');
  const loadingText = document.getElementById('loading-text');
  loadingText.textContent = text;
  loading.style.display = '';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
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

  // ② ローカル確認
  const localVersion = localStorage.getItem(MASTER_VERSION_KEY);
  const localMasters = localStorage.getItem(MASTER_DATA_KEY);

  if (localVersion === latestVersion && localMasters) {
    console.log('[masters] from localStorage');
    return JSON.parse(localMasters);
  }

  // ③ 不一致 → 再取得
  console.log('[masters] from GAS');
  const masters = await fetchMasters();

  localStorage.setItem(MASTER_VERSION_KEY, latestVersion);
  localStorage.setItem(MASTER_DATA_KEY, JSON.stringify(masters));

  return masters;
}