// ================================
// DOM参照
// ================================

let masterRaw;
let reasonList = [];
let symptomList = [];
let departmentList = [];

// master.js
async function fetchMasters() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');

  loading.style.display = '';
  error.style.display = 'none';

  try {
    const res = await fetch(`${GAS_URL}?type=reason_master`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();

    return json; // 正常系
  } catch (err) {
    console.error('[fetchMasters error]', err);
    error.style.display = '';
    return null; // ← 重要
  } finally {
    loading.style.display = 'none';
  }
}


// 整形レイヤー本体
function buildViewMasters(master) {
  // reason（表示制御の核）
  reasonList = [...master.reasons]
    .sort((a, b) => a.sort - b.sort);

  // symptom（体調不良時のみ使用）
  symptomList = [...master.symptoms]
    .sort((a, b) => a.sort - b.sort);

  // department（通院 or 通院あり時）
  departmentList = [...master.departments]
    .sort((a, b) => a.sort - b.sort);

  console.log('[view masters]', {
    reasonList,
    symptomList,
    departmentList
  });
}

// ================================
// visit status master
// ================================
const visitStatusList = [
  {
    visit_code: 'NONE',
    label: '通院なし',
    requires_department: false
  },
  {
    visit_code: 'PLAN',
    label: '通院予定',
    requires_department: true
  },
  {
    visit_code: 'DONE',
    label: '通院済み',
    requires_department: true
  }
];

