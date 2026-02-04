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