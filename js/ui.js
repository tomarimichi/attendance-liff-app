// ================================
// ui
// ================================
function initReasonSelect(reasonList) {
  const reason = document.getElementById('reason');
  console.log('[initReasonSelect] reason element:', reason);
  console.log('[initReasonSelect] reasonList:', reasonList);

  if (!reason) {
    console.error('reason element not found');
    return;
  }

  if (!Array.isArray(reasonList)) {
    console.error('reasonList is invalid', reasonList);
    return;
  }
  reason.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '選択してください';
  placeholder.disabled = true;
  placeholder.selected = true;
  reason.appendChild(placeholder);

  reasonList.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.reason_code;
    opt.textContent = r.reason_label;
    reason.appendChild(opt);
  });
}

function updateVisibility() {
  console.log("reason raw:", document.getElementById('reason').value);

  const reasonCode = document.getElementById('reason')?.value;
  const visitStatus = document.getElementById('visitStatus')?.value;

  console.log('[updateVisibility]', {reasonCode, visitStatus});

  const symptomArea = document.getElementById('symptomBlock');
  const visitArea = document.getElementById('visitStatusBlock');
  const departmentArea = document.getElementById('departmentBlock');


  console.log('symptomBlock:', symptomArea);
  console.log('visitBlock:', visitArea);
  console.log('departmentBlock:', departmentArea);

  hide(symptomArea);
  hide(visitArea);
  hide(departmentArea);

  if (!reasonCode) {
    return;
  }

  // --- 体調不良 ---
  if (reasonCode === 'ILLNESS') {
    show(symptomArea);
    show(visitArea); 

    if (visitStatus === 'PLAN' || visitStatus === 'DONE') {
      show(departmentArea);
      console.log('[updateVisibility]', {
        reasonCode,
        visitStatus
        }
      );
    }

  }

  // --- 通院 ---
  if (reasonCode === 'VISIT') {
    show(departmentArea);

  console.log(viewMasters.symptomList);
  console.log(viewMasters.departmentList);

  }

  // --- 私用 ---
  // PRIVATE は何も表示しない
}





// ================================
// visit status UI
// ================================
function renderVisitStatus() {
  const wrapper = document.getElementById('visitStatusWrapper');
  wrapper.innerHTML = '';

  visitStatusList.forEach(v => {
    const label = document.createElement('label');
    label.style.display = 'block';

    label.innerHTML = `
      <input type="radio" name="visitStatus" value="${v.visit_code}">
      ${v.label}
    `;

    wrapper.appendChild(label);
  });
}

// ================================
// department UI
// ================================
function renderDepartment() {
  const wrapper = document.getElementById('departmentWrapper');
  wrapper.innerHTML = '';

  const sorted = [...departmentList]
    .filter(d => d.active)
    .sort((a, b) => a.sort - b.sort);

  sorted.forEach(dep => {
    const option = document.createElement('option');
    option.value = dep.department_code;
    option.textContent = dep.label;
    wrapper.appendChild(option);
  });
}


function sortBySort(a, b) {
  return a.sort - b.sort;
}

// 共通ユーティリティ
function getSortedActive(list) {
  return [...list]
    .filter(i => i.active !== false)
    .sort(sortBySort);
}


function hide(el) {
  if (!el) return;
  el.style.display = 'none';
}

function show(el) {
  if (!el) return;
  el.style.display = '';
}

// ================================
// ステータス表示エリア関数
// ================================
function setStatus(type, message) {
  const el = document.getElementById('statusArea');
  el.className = `status ${type}`;
  el.textContent = message;
}