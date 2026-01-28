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

  const visitStatus = document.getElementById('visitStatus');
  if (visitStatus) {
    visitStatus.addEventListener('change', updateVisibility);
  }
}
