// ================================
// DOM参照
// ================================

let masterRaw;
let reasonList = [];
let symptomList = [];
let departmentList = [];

async function fetchMasters() {
  const res = await fetch(`${GAS_URL}?type=reason_master`);
  masterRaw = await res.json();
  buildViewMasters(masterRaw);
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

// ================================
// department master
// ================================
const departmentList = [
  {
    department_code: 'INT',
    label: '内科',
    active: true,
    sort: 1
  },
  {
    department_code: 'ENT',
    label: '耳鼻科',
    active: true,
    sort: 2
  },
  {
    department_code: 'ORTHO',
    label: '整形外科',
    active: true,
    sort: 3
  }
];
