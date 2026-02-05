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
function buildSymptomOptions(symptomList) {
  const container = document.getElementById('symptomArea');
  container.innerHTML = '';

  symptomList.forEach(item => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" name="symptom" value="${item.symptom_code}">
      ${item.symptom_label}
    `;
    container.appendChild(label);
  });

  // ★ その他を最後に追加
  const otherLabel = document.createElement('label');
  otherLabel.innerHTML = `
    <input type="checkbox" name="symptom" value="OTHER" id="symptomOther">
    その他
  `;
  container.appendChild(otherLabel);

  // ★ 自由記入欄
  const otherArea = document.createElement('div');
  otherArea.id = 'symptomOtherArea';
  otherArea.style.display = 'none';
  otherArea.innerHTML = `
    <textarea
      id="symptomOtherText"
      placeholder="症状を具体的に記入してください"
    ></textarea>
  `;
  container.appendChild(otherArea);

  // イベント
  document
    .getElementById('symptomOther')
    .addEventListener('change', e => {
      otherArea.style.display = e.target.checked ? 'block' : 'none';
    });
}


// ================================
// 受診科 その他自由記入 masters（UI用）
// ================================
function buildDepartmentOptions(departmentList) {
  const container = document.getElementById('departmentArea');
  container.innerHTML = '';

  departmentList.forEach(item => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" name="department" value="${item.department_code}">
      ${item.department_label}
    `;
    container.appendChild(label);
  });

  // その他
  const otherLabel = document.createElement('label');
  otherLabel.innerHTML = `
    <input type="checkbox" name="department" value="OTHER" id="departmentOther">
    その他
  `;
  container.appendChild(otherLabel);

  const otherArea = document.createElement('div');
  otherArea.id = 'departmentOtherArea';
  otherArea.style.display = 'none';
  otherArea.innerHTML = `
    <textarea
      id="departmentOtherText"
      placeholder="受診内容を記入してください"
    ></textarea>
  `;
  container.appendChild(otherArea);

  document
    .getElementById('departmentOther')
    .addEventListener('change', e => {
      otherArea.style.display = e.target.checked ? 'block' : 'none';
    });
}
