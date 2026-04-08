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


// ================================
// イベント管理
// ================================
function bindEvents() {
  const form = document.getElementById('absenceForm');

  // ===== カレンダー選択 =====
  let selectedDates = [];

  const dayButtons = document.querySelectorAll('.day');

  dayButtons.forEach(button => {
    button.addEventListener('click', () => {
      // disabledは無視
      if (button.classList.contains('disabled')) return;

      const date = button.dataset.date;

      // ← ここ重要：data-dateが無いと動かない
      if (!date) {
        console.warn("data-dateが未設定です", button);
        return;
      }

      if (selectedDates.includes(date)) {
        selectedDates = selectedDates.filter(d => d !== date);
        button.classList.remove('selected');
      } else {
        selectedDates.push(date);
        button.classList.add('selected');
      }

      console.log("selectedDates:", selectedDates);
    });
    
    const countEl = document.getElementById('selectedCount');

    countEl.textContent = `選択中：${selectedDates.length}日`;
  });
  
  // ===== 送信 submit =====
  form?.addEventListener('submit',async (e) => {
    e.preventDefault();


  // 🔒 開発モードガード（最優先）
  if (!isSendEnabled) {
    console.warn("🚫 送信ブロック（開発モード）");
    alert("現在送信は無効です（開発中）");
    return;
  }

    await handleSubmit(form);
  });


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
        isOtherSelected(symptomSelect) ? 'block' : 'none';
    });
  }

  // 受診科「その他」制御
  const departmentSelect = document.getElementById('department');
  if (departmentSelect) {
    departmentSelect.addEventListener('change', e => {
      const otherArea = document.getElementById('departmentOtherArea');
      if (!otherArea) return;

      otherArea.style.display =
        isOtherSelected(departmentSelect) ? 'block' : 'none';
    });
  }  
}

function isOtherSelected(selectEl) {
  return Array.from(selectEl.selectedOptions)
    .some(opt => opt.value === 'OTHER');
}


