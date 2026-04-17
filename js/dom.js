// ================================
// dom
// ================================
let reason, symptom, visitStatus, department;
let symptomBlock, visitStatusBlock, departmentBlock;
let selectedDates = [];



function getFormParams() {
  return {
    reason: reason?.value,
    symptomOther: document.getElementById('symptomOther')?.value,
    departmentOther: document.getElementById('departmentOther')?.value,
    visitStatus: visitStatus?.value,
    nextDate: document.getElementById('nextDate')?.value
  };
}

function getSymptomValues() {
  return Array.from(
    document.querySelectorAll('#symptom input:checked')
  ).map(el => el.value);
}

function getDepartmentValues() {
  return Array.from(
    document.querySelectorAll('#department input:checked')
  ).map(el => el.value);
}

function getSelectedDates() {
  return selectedDates;
}


document.addEventListener('input', handleRealtimeValidation);
document.addEventListener('change', handleRealtimeValidation);

document.querySelectorAll('#symptom input')
  .forEach(el => {
    el.addEventListener('change', handleRealtimeValidation);
  });

document.querySelectorAll('#department input')
  .forEach(el => {
    el.addEventListener('change', handleRealtimeValidation);
  });

  
// ================================
// イベント管理
// ================================
function bindEvents() {
  bindCalendarEvents();
  bindFormSubmit();
  bindVisibilityEvents();
  bindOtherToggleEvents();
  bindRealtimeValidationEvents(); // ←追加
}


// カレンダーイベント
function bindCalendarEvents() {
  const dayButtons = document.querySelectorAll('.day');

  dayButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.classList.contains('disabled')) return;

      const date = button.dataset.date;
      if (!date) return;

      if (selectedDates.includes(date)) {
        selectedDates = selectedDates.filter(d => d !== date);
        button.classList.remove('selected');
      } else {
        selectedDates.push(date);
        button.classList.add('selected');
      }

      document.getElementById('selectedCount').textContent =
        `選択中：${selectedDates.length}日`;
      
      handleRealtimeValidation();
    });
  });
}

// submitイベント
function bindFormSubmit() {
  const form = document.getElementById('absenceForm');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    hasSubmitted = true;

    const shouldBlockSend =
      !isPreview && (!isSendEnabled || isDev);

    if (shouldBlockSend) {
      showToast("現在送信は無効です（開発中）");
      return;
    }

    await handleSubmit(form);
  });
}

// 表示制御イベント
function bindVisibilityEvents() {
  document.getElementById('reason')
    ?.addEventListener('change', () => {
      updateVisibility();
      handleRealtimeValidation();
      console.log("[bindVisibilityEvents]:reason");
    });

  document.getElementById('visitStatus')
    ?.addEventListener('change', () => {
      updateVisibility();
      handleRealtimeValidation();
      console.log("[bindVisibilityEvents]:visitStatus");
    });

  document.getElementById('nextDate')
    ?.addEventListener('change',handleRealtimeValidation);

}

// Other表示イベント
function bindOtherToggleEvents() {
  const symptom = document.getElementById('symptom');
  const department = document.getElementById('department');

  symptom?.addEventListener('change', () => {
    const area = document.getElementById('symptomOtherArea');
    if (area) {
      area.style.display =
        isOtherSelected(symptom) ? 'block' : 'none';
    }
  });

  department?.addEventListener('change', () => {
    const area = document.getElementById('departmentOtherArea');
    if (area) {
      area.style.display =
        isOtherSelected(department) ? 'block' : 'none';
    }
  });
}

// リアルタイム更新イベント
function bindRealtimeValidationEvents() {
  console.log('リアルタイムイベント登録');
  document.getElementById('reason')
    ?.addEventListener('change', handleRealtimeValidation);

  document.getElementById('visitStatus')
    ?.addEventListener('change', handleRealtimeValidation);

  document.getElementById('symptom')
    ?.addEventListener('change', handleRealtimeValidation);

  document.getElementById('department')
    ?.addEventListener('change', handleRealtimeValidation);

  document.getElementById('symptomOther')
    ?.addEventListener('input', handleRealtimeValidation);

  document.getElementById('departmentOther')
    ?.addEventListener('input', handleRealtimeValidation);
}


function isOtherSelected(selectEl) {
  return Array.from(selectEl.selectedOptions)
    .some(opt => opt.value === 'OTHER');
}


