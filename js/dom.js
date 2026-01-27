// ================================
// dom
// ================================
let reason, symptom, visitStatus, department;
let symptomBlock, visitStatusBlock, departmentBlock;

function bindDom() {
  reason           = document.getElementById('reason');
  symptom          = document.getElementById('symptom');
  visitStatus      = document.getElementById('visitStatus');
  department       = document.getElementById('department');

  symptomBlock     = document.getElementById('symptomBlock');
  visitStatusBlock = document.getElementById('visitStatusBlock');
  departmentBlock  = document.getElementById('departmentBlock');
}

function bindEvents() {
  const reason = document.getElementById('reason');
  if (reason) {
    reason.addEventListener('change', updateVisibility);
  }

  // visitStatus はまだ UI 未完成なので触らない
  // const visitStatus = document.getElementById('visitStatus');

  // symptom も今は不要なら触らない
}
