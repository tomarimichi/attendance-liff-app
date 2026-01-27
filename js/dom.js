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
  reason.addEventListener('change', () => {
    populateSymptomSelect();
    updateVisibility();
  });

  symptom.addEventListener('change', updateVisibility);
  visitStatus.addEventListener('change', updateVisibility);
}
