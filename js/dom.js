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
  console.log('[bindEvents] reason found:', !!reason);

  reason?.addEventListener('change', () => {
    console.log('[event] reason changed', reason.value);
    updateVisibility();
  });

  const visitStatus = document.getElementById('visitStatus');
  visitStatus?.addEventListener('change', () => {
    console.log('[event] visitStatus changed', visitStatus.value);
    updateVisibility();
  });

  // 症状「その他」制御
  const symptomSelect = document.getElementById('symptom');
  if (symptomSelect) {
    symptomSelect.addEventListener('change', e => {
      const otherArea = document.getElementById('symptomOtherArea');
      if (!otherArea) return;

      otherArea.style.display =
        e.target.value === 'OTHER' ? 'block' : 'none';
    });
  }

  // 受診科「その他」制御
  const departmentSelect = document.getElementById('department');
  if (departmentSelect) {
    departmentSelect.addEventListener('change', e => {
      const otherArea = document.getElementById('departmentOtherArea');
      if (!otherArea) return;

      otherArea.style.display =
        e.target.value === 'OTHER' ? 'block' : 'none';
    });
  }  
}
