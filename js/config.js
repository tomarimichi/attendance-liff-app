// ================================
// 設定
// ================================
const CONFIG = {
    ENV: "prod",
    VERSION:"0.9.6",
    TIMEOUT: 30000,

    ENV_CONFIG: {
        dev: {
            LIFF_ID: "2008783538-KeEB2k47",
            GAS_ID:
                'AKfycbyD12qFAUhH0h0rTlM5ad9ETssRVRztLCJPjS9NGWFFXbQf8Lfv_jZ_YJg-Ec7wDf6tAQ'
        },
        prod: {
            LIFF_ID: '2008783538-yHgAa1tC',
            GAS_ID:
                'AKfycbydkQTHkg3UdZGs8wVUsShGm_XRbj3hxCjAqUzpX668gsDD9G-5jQm3Eg2Vi2Tdrk_j'
        }
    }
}

// 起動ログ
console.log("ENV:", CONFIG.ENV);
console.log("VERSION:", CONFIG.VERSION);
console.log("TIMEOUT:", CONFIG.TIMEOUT)

// =======================
// ==== グローバル変数 ====
// =======================
let hasSubmitted = false; // 送信ボタン初回判定

let debounceTimer; // デパウンスタイマー

// キャッシュ
let memoryCache = {
  version: null,
  masters: null,
};

// 開発モード
let isSendEnabled = false; // デフォルトOFF
let isPreview = false; // 開発モードで標準表示にしたいとき用

let isDev = CONFIG.ENV === "dev" // 

// コンフィグデータ整形
  const ENV = CONFIG.ENV_CONFIG[CONFIG.ENV]
    if(!ENV){
      throw new Error(`ENV_CONFIG missing for ${CONFIG.ENV}`);
    }

  const GAS_URL = `https://script.google.com/macros/s/${ENV.GAS_ID}/exec?v=${CONFIG.VERSION}`;

  function buildGasUrl(type) {
    const url = new URL(GAS_URL);
    if(type) {
      url.searchParams.set("type",type);
    }

    return url;
  };

// ✅ 固定キー
const MASTER_DATA_KEY = 'masters';
const MASTER_VERSION_KEY = 'masterVersion';

// ランダムID
const submissionId = crypto.randomUUID();

// ページ読み込み時に呼び出す
document.addEventListener('DOMContentLoaded', () => {
  applyVisibility(CONFIG.ENV);
});


