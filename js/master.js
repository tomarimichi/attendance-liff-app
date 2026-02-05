// ================================
// DOM参照
// ================================

let masterRaw;
let reasonList = [];
let symptomList = [];
let departmentList = [];

// master.js
async function fetchMasters() {
  try {
    const res = await fetch(`${GAS_URL}?type=reason_master`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[fetchMasters error]', err);
    return null;
  }
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
// view masters（UI用）
// ================================
let viewMasters = {
  reasonList: [],
  symptomList: [],
  departmentList: []
};

function buildViewMasters(master) {
  viewMasters.reasonList = [...master.reasons].sort((a, b) => a.sort - b.sort);
  viewMasters.symptomList = [...master.symptoms].sort((a, b) => a.sort - b.sort);
  viewMasters.departmentList = [...master.departments].sort((a, b) => a.sort - b.sort);

  console.log('[view masters]', viewMasters);
}


// ================================
// 症状 その他自由記入 masters（UI用）
// ================================
function buildSymptomOptions(list) {
  const select = document.getElementById('symptom');
  if (!select) return;

  select.innerHTML = '';

  // マスター由来
  list.forEach(item => {
    const option = document.createElement('option');
    option.value = item.symptom_code;
    option.textContent = item.symptom_label;
    select.appendChild(option);
  });

  // ★ その他（必ず最後）
  const otherOption = document.createElement('option');
  otherOption.value = 'OTHER';
  otherOption.textContent = 'その他';
  select.appendChild(otherOption);
}

// 表示制御
function updateSymptomVisibility(reasonCode) {
  const area = document.getElementById('symptomArea');
  if (!area) return;

  area.style.display =
    reasonCode === 'ILLNESS' ? 'block' : 'none';
}



// ================================
// 受診科 その他自由記入 masters（UI用）
// ================================
function buildDepartmentOptions(list) {
  const select = document.getElementById('department');
  if (!select) return;

  select.innerHTML = '';

  list.forEach(item => {
    const option = document.createElement('option');
    option.value = item.department_code;
    option.textContent = item.department_label;
    select.appendChild(option);
  });

  // ★ その他（必ず最後）
  const otherOption = document.createElement('option');
  otherOption.value = 'OTHER';
  otherOption.textContent = 'その他';
  select.appendChild(otherOption);
}

// 表示制御
function updateDepartmentVisibility(visitStatus) {
  const area = document.getElementById('departmentArea');
  if (!area) return;

  area.style.display =
    ['PLAN', 'DONE'].includes(visitStatus)
      ? 'block'
      : 'none';
}



document.getElementById('symptom').addEventListener('change', e => {
  const otherArea = document.getElementById('symptomOtherArea');
  if (!otherArea) return;

  otherArea.style.display =
    e.target.value === 'OTHER' ? 'block' : 'none';
});


document.getElementById('reason').addEventListener('change', e => {
  updateSymptomVisibility(e.target.value);
});

document.getElementById('department').addEventListener('change', e => {
  const otherArea = document.getElementById('departmentOtherArea');
  if (!otherArea) return;

  otherArea.style.display =
    e.target.value === 'OTHER' ? 'block' : 'none';
});


document.getElementById('visitStatus').addEventListener('change', e => {
  updateDepartmentVisibility(e.target.value);
});
