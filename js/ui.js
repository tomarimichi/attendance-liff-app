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

function populateSymptomSelect() {
  symptom.innerHTML = '<option value="">選択してください</option>';

  viewMasters.symptoms.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.symptom_code;
    opt.textContent = s.symptom_label;
    symptom.appendChild(opt);
  });
}


function initDepartmentSelect() {
  department.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '選択してください';
  placeholder.selected = true;
  department.appendChild(placeholder);

  viewMasters.departmentList.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.department_code;
    opt.textContent = d.department_label;
    department.appendChild(opt);
  });
}


function updateVisibility() {
  const reason = document.getElementById('reason');

  const symptomArea = document.getElementById('symptomBlock');
  const visitArea = document.getElementById('visitStatusBlock');
  const departmentArea = document.getElementById('departmentBlock');

  const reasonCode = reason?.value;

  console.log('symptomBlock:', symptomBlock);
  console.log('visitBlock:', visitBlock);
  console.log('departmentBlock:', departmentBlock);

  if (!reasonCode) return;

  hide(symptomArea);
  hide(visitArea);
  hide(departmentArea);

  // --- 体調不良 ---
  if (reasonCode === 'ILLNESS') {
    show(symptomArea);
  }

  // --- 通院 ---
  if (reasonCode === 'VISIT') {
    show(departmentArea);
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

function updateDepartmentVisibility(params, reasonConfig) {
  const departmentArea = document.getElementById('departmentArea');
  const visitConfig = visitStatusList.find(
    v => v.visit_code === params.visitStatus
  );

  const shouldShow =
    visitConfig?.requires_department &&
    reasonConfig.department_required_when_visit;

  departmentArea.style.display = shouldShow ? '' : 'none';

  if (shouldShow) {
    renderDepartment();
  }
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

