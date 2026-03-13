// ================================
// 設定
// ================================
const CONFIG = {
    ENV: "prob",
    VERSION:"0.9.1",
    TIMEOUT: 30000,

    ENV_CONFIG: {
        dev: {
            LIFF_ID: "2008783538-KeEB2k47",
            GAS_ID:
                'AKfycbxZvubfezFgESs4oDYdiGS6In4kDtxSSWjrjwGevpyju-kx58WxjfqOGbXX47_DSiyO'
        },
        prob: {
            LIFF_ID: '2008783538-yHgAa1tC',
            GAS_ID:
                'AKfycbzkhNbtMjxx_O9ca2PzhYV6AHpDG8-teX_Ya9JjniaxbkeFApKCn140yp-YImJ2mfGL'
        }
    }
}





// ============================================================

const ENV = CONFIG.ENV_CONFIG[CONFIG.ENV]
    if(!ENV){
    throw new Error(`ENV_CONFIG missing for ${CONFIG.ENV}`);
    }

const GAS_URL = `https://script.google.com/macros/s/${ENV.GAS_ID}/exec?v=${CONFIG.VERSION}`;
// const url = new URL(GAS_URL);

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


// 起動ログ
console.log("ENV:", CONFIG.ENV);
console.log("VERSION:", CONFIG.VERSION);
console.log("TIMEOUT:", CONFIG.TIMEOUT)

// ページ読み込み時に呼び出す
document.addEventListener('DOMContentLoaded', () => {
  applyDevOnlyVisibility(CONFIG.ENV);
});