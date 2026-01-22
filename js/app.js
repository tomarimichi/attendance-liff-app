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
}

// ================================
// 表示制御（段階①の核）
// ================================
document.addEventListener('DOMContentLoaded', () => {
  const visitStatusBlock = document.getElementById('visitStatusBlock');
  const visitStatus      = document.getElementById('visitStatus');
  const departmentBlock  = document.getElementById('departmentBlock');
  const department       = document.getElementById('department');

  function hide(el) {
    el.required = false;
    el.style.display = 'none';

    if (el.multiple) {
      [...el.options].forEach(o => o.selected = false);
    } else {
      el.value = '';
    }
  }

  function show(el) {
    el.required = true;
    el.style.display = '';
  }



  reason.addEventListener('change', updateVisibility);
  visitStatus.addEventListener('change', updateVisibility);

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

// hide / show（block を消す）
function hide(block, el) {
  if (block) block.style.display = 'none';
  if (el) {
    el.required = false;
    el.disabled = true;   // ← 明示的に無効化
    el.value = '';
  }
}

function show(block, el) {
  if (block) block.style.display = '';
  if (el) {
    el.disabled = false;  // ← 必ず有効化
    el.required = true;
  }
}


function updateVisibility() {
  hide(visitStatusBlock, visitStatus);
  hide(departmentBlock, department);

  if (!reason.value) return;

  // 通院 → 直接 小項目
  if (reason.value === '通院') {
    show(departmentBlock, department);
    return;
  }

  // 体調不良 → 中項目 → 条件付き小項目
  if (reason.value === '体調不良') {
    show(visitStatusBlock, visitStatus);

    if (
      visitStatus.value === 'あり' ||
      visitStatus.value === '済み'
    ) {
      show(departmentBlock, department);
    }
  }
}

/*
  function updateVisibility() {
    hide(visitStatus);
    hide(department);

    if (!reason.value) return;

    // 通院 → 直接 小項目
    if (reason.value === '通院') {
      show(department);
      return;
    }

    // 体調不良 → 中項目 → 条件付き小項目
    if (reason.value === '体調不良') {
      show(visitStatus);

      if (
        visitStatus.value === 'あり' ||
        visitStatus.value === '済み'
      ) {
        show(department);
      }
    }
  }
*/