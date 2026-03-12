// ================================
// 設定
// ================================
const CONFIG = {
    ENV: "prob",
    VERSION:"0.9.0",
    TIMEOUT: 30000,

    ENV_CONFIG: {
        dev: {
            LIFF_ID: "2008783538-KeEB2k47"
        },
        prob: {
            LIFF_ID: '2008783538-yHgAa1tC'
        }
    }
}

const GAS_ID = 
'AKfycbxZvubfezFgESs4oDYdiGS6In4kDtxSSWjrjwGevpyju-kx58WxjfqOGbXX47_DSiyO';



const GAS_URL = `https://script.google.com/macros/s/${GAS_ID}/exec`;


// ✅ 固定キー
const MASTER_DATA_KEY = 'masters';
const MASTER_VERSION_KEY = 'masterVersion';

// ランダムID
const submissionId = crypto.randomUUID();
