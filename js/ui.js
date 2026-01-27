// ================================
// ui
// ================================
function initReasonSelect() {
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
  symptom.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '選択してください';
  placeholder.selected = true;
  symptom.appendChild(placeholder);

  symptomList.forEach(s => {
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

  departmentList.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.department_code;
    opt.textContent = d.department_label;
    department.appendChild(opt);
  });
}

function updateVisibility() {
  symptomBlock.style.display = 'none';
  visitStatusBlock.style.display = 'none';
  departmentBlock.style.display = 'none';

  symptom.required = false;
  visitStatus.required = false;
  department.required = false;

  if (!reason.value) return;

  const cfg = reasonList.find(r => r.reason_code === reason.value);
  if (!cfg) return;

  if (cfg.symptom_required) {
    symptomBlock.style.display = '';
    symptom.required = true;
  }

  if (cfg.visit_required) {
    visitStatusBlock.style.display = '';
    visitStatus.required = true;
  }

  if (
    cfg.department_required_when_visit &&
    (reason.value === 'VISIT' ||
     visitStatus.value === 'あり' ||
     visitStatus.value === '済み')
  ) {
    departmentBlock.style.display = '';
    department.required = true;
  }
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
