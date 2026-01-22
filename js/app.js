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
// reason_master 読み込み
// ================================
let reasonMaster = [];

async function loadReasonMaster() {
  const res = await fetch(`${GAS_URL}?action=reason_master`);
  const data = await res.json();

  // 空行・inactive 除外（段階①では必須）
  reasonMaster = data.filter(r =>
    r.active === true &&
    r.reason &&
    r.detail_code
  );

  console.log('[master filtered]', reasonMaster);

  populateReasonSelect();
}

// 大項目（reason）だけを select に反映
function populateReasonSelect() {
  const reasonEl = document.getElementById('reason');
  reasonEl.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '選択してください';
  // placeholder.disabled = true;
  placeholder.selected = true;
  reasonEl.appendChild(placeholder);

  // reason（大項目）を重複排除
  const reasons = [...new Set(reasonMaster.map(r => r.reason))];

  reasons.forEach(reason => {
    const opt = document.createElement('option');
    opt.value = reason;
    opt.textContent = reason;
    reasonEl.appendChild(opt);
  });

  updateVisibility();
}

// ================================
// DOM参照（グローバル）
// ================================
let reason, symptom, visitStatus, department;
let symptomBlock, visitStatusBlock, departmentBlock;

document.addEventListener('DOMContentLoaded', () => {
  reason            = document.getElementById('reason');
  symptom           = document.getElementById('sympton');
  visitStatus       = document.getElementById('visitStatus');
  department        = document.getElementById('department');

  symptomBlock      = document.getElementById('symptomBlock');
  visitStatusBlock  = document.getElementById('visitStatusBlock');
  departmentBlock   = document.getElementById('departmentBlock');

  console.log('[init elements]', {
    reason,
    visitStatus,
    department
  });

  reason.addEventListener('change', () => {
    console.log('[change] reason:', reason.value);
    updateVisibility();
  });

  visitStatus.addEventListener('change', () => {
    console.log('[change] visitStatus:', visitStatus.value);
    updateVisibility();
  });

  updateVisibility();
});

// ================================
// 送信処理
// ================================
async function submitAbsence() {
  const form = document.getElementById('absenceForm');
  const formData = new FormData(form);
  const params = Object.fromEntries(formData.entries());

  // department（複数選択）は配列化 → concat 用
  if (form.department) {
    params.department = [...form.department.selectedOptions]
      .map(o => o.value)
      .join(',');
  }

  // userId
  try {
    params.userId = liff.getDecodedIDToken().sub;
  } catch {
    params.userId = 'web-user';
  }

  // 必須チェック（段階①用）
  if (!params.reason) {
    alert('大項目を選択してください');
    return;
  }
  if (params.reason === '体調不良' && !params.visitStatus) {
    alert('通院予定を選択してください');
    return;
  }
  if (
    (params.reason === '通院' ||
     params.visitStatus === 'あり' ||
     params.visitStatus === '済み') &&
    !params.department
  ) {
    alert('受診科を選択してください');
    return;
  }

  // 送信
  await fetch(`${GAS_URL}?${new URLSearchParams(params)}`);

  liff.closeWindow();
}

// ================================
// 初期化
// ================================
document.addEventListener('DOMContentLoaded', async () => {
  await initLiff();
  await loadReasonMaster();
});

// ================================
// 表示制御
// ================================
function updateVisibility() {
  console.log('[updateVisibility]', {
    reason: reason.value,
    symptom: symptom?.value,
    visitStatus: visitStatus.value
  });

  // ===== 初期化：全部非表示・無効 =====
  symptomBlock.style.display = 'none';
  visitStatusBlock.style.display = 'none';
  departmentBlock.style.display = 'none';


  symptom.required = false;
  visitStatus.required = false;
  department.required = false;

  // ===== 大項目未選択 =====
  if (!reason.value) {
    symptom.disabled = true;
    visitStatus.disabled = true;
    department.disabled = true;
    return;    
  }


  // ===== 通院 =====
  if (reason.value === '通院') {
    departmentBlock.style.display = '';
    department.disabled = false;
    department.required = true;
    return;
  }

  // ===== 体調不良 =====
  if (reason.value === '体調不良') {
    // 中項目A：症状
    symptomBlock.style.display = '';
    symptom.disabled = false;
    // ※ この段階では required にしない

    // 中項目B：通院有無
    visitStatusBlock.style.display = '';
    visitStatus.disabled = false;
    visitStatus.required = true;

    // 小項目：受診科
    if (visitStatus.value === 'あり' || visitStatus.value === '済み') {
      departmentBlock.style.display = '';
      department.disabled = false;
      department.required = true;
    } else {
      department.disabled = true;
    }
  }
}


/* bak
  function updateVisibility() {
    console.log('[updateVisibility]', {
      reason: reason.value,
      visitStatus: visitStatus.value,
      visitStatusDisabled: visitStatus.disabled
    });

    // 初期：全部非表示
    visitStatusBlock.style.display = 'none';
    departmentBlock.style.display = 'none';

    visitStatus.required = false;
    department.required = false;

    // 大項目未選択
    if (!reason.value) {
      visitStatus.disabled = true;
      department.disabled = true;
      return;
    }

    // 通院
    if (reason.value === '通院') {
      departmentBlock.style.display = '';
      department.disabled = false;
      department.required = true;
      return;
    }

    // 体調不良
    if (reason.value === '体調不良') {
      visitStatusBlock.style.display = '';
      visitStatus.disabled = false;
      visitStatus.required = true;

      if (visitStatus.value === 'あり' || visitStatus.value === '済み') {
        departmentBlock.style.display = '';
        department.disabled = false;
        department.required = true;
      } else {
        department.disabled = true;
      }
    }
  }
*/