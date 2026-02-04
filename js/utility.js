function showLoading(text) {
  const loading = document.getElementById('loading');
  const loadingText = document.getElementById('loading-text');
  loadingText.textContent = text;
  loading.style.display = '';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}