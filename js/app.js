// ================================
// 設定
// ================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbw3GJhdeVCi7WRnKVr3EeLArl2yU5nciv_HGeY4I_sCjH5IUKuQeJq2ZCG0atys3liJ/exec';
const LIFF_ID = '2008783538-yHgAa1tC';

// ================================
// LIFF 初期化
// ================================
async function initLiff() {
  await liff.init({ liffId: LIFF_ID });
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: location.href });
    return;
  }
}

// ================================
// DOM参照
// ================================
let reason, symptom, visitStatus, department;
let symptomBlock, visitStatusBlock, departmentBlock;

document.addEventListener('DOMContentLoaded', async () => {
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

  // イベント
  reason.addEventListener('change', () => {
    console.log('[change] reason:', reason.value);
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

  await initLiff();
});

// ================================
// 表示制御（②-B-2 確定版）
// ================================
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
