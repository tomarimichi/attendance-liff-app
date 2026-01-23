// ================================
// 設定
// ================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbx5FOW7TDahCd9W2_6RSxO2RSyy_T1ejbwKXlPi05cy-IOf9GRSEq5oZFN645JcNdDp/exec';
const LIFF_ID = '2008783538-yHgAa1tC';




// ================================
// DOM参照
// ================================
let reason, symptom, visitStatus, department;
let symptomBlock, visitStatusBlock, departmentBlock;

document.addEventListener('DOMContentLoaded', async () => {
  await liff.init({ liffId: LIFF_ID});

  // DOM取得
  reason           = document.getElementById('reason');
  symptom          = document.getElementById('symptom');
  visitStatus      = document.getElementById('visitStatus');
  department       = document.getElementById('department');

  symptomBlock     = document.getElementById('symptomBlock');
  visitStatusBlock = document.getElementById('visitStatusBlock');
  departmentBlock  = document.getElementById('departmentBlock');

  console.log('[init elements]', {
    reason,
    symptom,
    visitStatus,
    department
  });

  // マスター取得
  const res = await fetch(`${GAS_URL}?type=reason_master`);
  reasonMaster = await res.json();

  console.log('[reasonMaster]', reasonMaster);

  initReasonSelect();
  initDepartmentSelect();
  updateVisibility();


  // イベント
  reason.addEventListener('change', () => {
    console.log('[change] reason:', reason.value);
    populateSymptomSelect(reason.value);
    updateVisibility();
  });

  symptom.addEventListener('change', () => {
    console.log('[change] symptom:', symptom.value);
    updateVisibility();
  });

  visitStatus.addEventListener('change', () => {
    console.log('[change] visitStatus:', visitStatus.value);
    updateVisibility();
  });

  updateVisibility();

});

// ================================
// 表示制御（②-B-2 確定版）
// ================================
function updateVisibility() {
  if (!Array.isArray(reasonMaster) || reasonMaster.length === 0) {
    console.warn('reasonMaster not ready');
    return;
  }

  console.log('[updateVisibility]', {
    reason: reason.value,
    symptom: symptom?.value,
    visitStatus: visitStatus?.value
  });

  // ===== 初期化 =====
  symptomBlock.style.display = 'none';
  visitStatusBlock.style.display = 'none';
  departmentBlock.style.display = 'none';

  symptom.required = false;
  visitStatus.required = false;
  department.required = false;

  if (!reason.value) return;

  // reason 単位で該当レコードを取得
  const records = reasonMaster.filter(r => r.reason === reason.value);
  if (records.length === 0) return;

  const config = records[0];

  // ===== 症状 =====
  if (config.symptom_required) {
    symptomBlock.style.display = '';
    symptom.required = true;
  }

  // ===== 通院有無 =====
  if (config.visit_required) {
    visitStatusBlock.style.display = '';
    visitStatus.required = true;
  }

  // ===== 受診科 =====
  if (
    // 通院は常に受診科が必要
    reason.value === '通院' ||

    // 体調不良で通院あり／済み
    (
      config.department_required_when_visit &&
      (visitStatus.value === 'あり' || visitStatus.value === '済み')
    )
  ) {
    departmentBlock.style.display = '';
    department.required = true;
  }
}

/* 20260123 GAS改修前最終版
function updateVisibility() {
  console.log('[updateVisibility]', {
    reason: reason.value,
    symptom: symptom?.value,
    visitStatus: visitStatus?.value,
    department: department?.value
  });

  // --- 初期化 ---
  symptomBlock.style.display = 'none';
  visitStatusBlock.style.display = 'none';
  departmentBlock.style.display = 'none';

  symptom.required = false;
  visitStatus.required = false;
  department.required = false;

  if (!reason.value) return;

  // ===== 体調不良 =====
  if (reason.value === '体調不良') {
    symptomBlock.style.display = '';
    visitStatusBlock.style.display = '';

    symptom.required = true;
    visitStatus.required = true;

    if (visitStatus.value === 'あり' || visitStatus.value === '済み') {
      departmentBlock.style.display = '';
      department.required = true;
    }
    return;
  }

  // ===== 通院 =====
  if (reason.value === '通院') {
    departmentBlock.style.display = '';
    department.required = true;
    return;
  }

  // ===== 私用 =====
  // 何も表示しない
}
*/
// ================================
// 送信処理
// ================================
async function submitAbsence() {
  const form = document.getElementById('absenceForm');
  const formData = new FormData(form);
  const params = Object.fromEntries(formData.entries());

  // department（複数選択）
  if (form.department) {
    params.department = [...form.department.selectedOptions]
      .map(o => o.value)
      .join(',');
  }

  try {
    params.userId = liff.getDecodedIDToken().sub;
  } catch {
    params.userId = 'web-user';
  }

  // 必須チェック（②-B仕様）
  if (!params.reason) {
    alert('大項目を選択してください');
    return;
  }

  if (params.reason === '体調不良') {
    if (!params.symptom) {
      alert('症状を選択してください');
      return;
    }
    if (!params.visitStatus) {
      alert('通院有無を選択してください');
      return;
    }
  }

  if (
    params.reason === '通院' ||
    (params.reason === '体調不良' &&
      (params.visitStatus === 'あり' || params.visitStatus === '済み'))
  ) {
    if (!params.department) {
      alert('受診科を選択してください');
      return;
    }
  }

  await fetch(`${GAS_URL}?${new URLSearchParams(params)}`);
  liff.closeWindow();
}


// 症状selectの生成
function populateSymptomSelect(reasonValue) {
  const list = reasonMaster
    .filter(r => r.reason === reasonValue && r.symptom_code)
    .sort((a, b) => a.sort - b.sort);

  symptom.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '選択してください';
  placeholder.selected = true;
  symptom.appendChild(placeholder);

  const seen = new Set();

  list.forEach(r => {
    if (seen.has(r.symptom_code)) return;
    seen.add(r.symptom_code);

    const opt = document.createElement('option');
    opt.value = r.symptom_code;
    opt.textContent = r.symptom_label;
    symptom.appendChild(opt);
  });
}





// 理由selectの生成
function initReasonSelect() {
  if (!Array.isArray(reasonMaster) || reasonMaster.length === 0) {
    console.warn('initReasonSelect: reasonMaster empty');
    return;
  }

  reason.innerHTML = '';


  // reason の重複を除外して並び順を維持
  const list = [];
  const seen = new Set();

  reasonMaster
    .sort((a, b) => a.sort - b.sort)
    .forEach(r => {
      if (seen.has(r.reason)) return;
      seen.add(r.reason);
      list.push(r);

      const opt = document.createElement('option');
      opt.value = r.reason;
      opt.textContent = r.reason;
      reason.appendChild(opt);
    });
  
  console.log('[initReasonSelect] option:',[...seen]);

  // 初期化
  reason.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '選択してください';
  placeholder.disabled = true;
  placeholder.selected = true;
  reason.appendChild(placeholder);

  list.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.reason;
    opt.textContent = r.reason;
    reason.appendChild(opt);
  });

  console.log('[initReasonSelect] options:', list.map(r => r.reason));
}


function initDepartmentSelect() {
  department.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '選択してください';
  placeholder.selected = true;
  department.appendChild(placeholder);

  const list = reasonMaster
    .filter(r => r.department_code)
    .sort((a, b) => a.sort - b.sort);

  const seen = new Set();

  list.forEach(r => {
    if (seen.has(r.department_code)) return;
    seen.add(r.department_code);

    const opt = document.createElement('option');
    opt.value = r.department_code;
    opt.textContent = r.department_label;
    department.appendChild(opt);
  });
}
