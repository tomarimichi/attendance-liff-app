// ================================
// DOM参照
// ================================

let masterRaw;

async function fetchMasters(timeout = 15000) {
  return await fetchWithTimeout(
    (signal) => postToGAS('reason_master', {}, {signal}),
    timeout
  );
}

// ================================
// visit status master
// ================================
const visitStatusList = [
  {
    visit_code: 'NONE',
    label: '通院なし',
    requires_department: false
  },
  {
    visit_code: 'PLAN',
    label: '通院予定',
    requires_department: true
  },
  {
    visit_code: 'DONE',
    label: '通院済み',
    requires_department: true
  }
];

// ================================
// view masters（UI用）
// ================================
let viewMasters = {
  // reasonList: [],
  // symptomList: [],
  symptomCategoryList:[],
  // departmentList: [],
  departmentCategoryList: []
};

function buildViewMasters(master) {
  viewMasters.reasonList = [...master.reasonList].sort((a, b) => a.sort - b.sort);
  viewMasters.symptomList = [...master.symptomList].sort((a, b) => a.sort - b.sort);
  viewMasters.symptomCategoryList = [...master.symptomCategoryList].sort((a,b) =>a.sort - b.sort);
  viewMasters.departmentList = [...master.departmentList].sort((a, b) => a.sort - b.sort);
  viewMasters.departmentCategoryList = [...master.departmentCategoryList].sort((a,b) => a.sort - b.sort);

  console.log('[view masters]', viewMasters);
}


// ================================
// 症状 masters（UI用）
// ================================
function buildSymptomOptions(symptoms, categories) {
  const select = document.getElementById('symptom');
  if (!select) return;

  select.innerHTML = '';

  // カテゴリ描画
  categories.forEach(category => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category.category_label;

    symptoms
      .filter(item => item.category_code === category.category_code)
      .forEach(item => {
        const option = document.createElement('option');
        option.value = item.symptom_code;
        option.textContent = item.symptom_label;
        optgroup.appendChild(option);
      });

    // 空カテゴリは出さない
    if (optgroup.children.length > 0) {
      select.appendChild(optgroup);
    }
  });

  // ★ その他（必ず最後）
  const otherOption = document.createElement('option');
  otherOption.value = 'OTHER';
  otherOption.textContent = 'その他';
  select.appendChild(otherOption);
}

// 表示制御
function updateSymptomVisibility(reasonCode) {
  const area = document.getElementById('symptomArea');
  if (!area) return;

  area.style.display =
    reasonCode === 'ILLNESS' ? 'block' : 'none';
}



// ================================
// 受診科 masters（UI用）
// ================================
function buildDepartmentOptions(departments, categories) {
  const select = document.getElementById('department');
  if (!select) return;

  select.innerHTML = '';

  // ■有効なカテゴリ数
  const validCategories = categories.filter(category =>
    departments.some(d => d.category_code === category.category_code)
  );

  // ◆カテゴリが1つ以下の場合
  if(validCategories.length <=1){
    departments.forEach(item => {
      const option = document.createElement('option');
      option.value = item.department_code;
      option.textContent = item.department_label;
      select.appendChild(option);
    });

  } else {

    // ◆カテゴリが複数ある場合
    validCategories.forEach(category => {

      const optgroup = document.createElement('optgroup');
      optgroup.label = category.category_label;

      departments
        .filter(item => item.category_code === category.category_code)
        .forEach(item => {
          const option = document.createElement('option');
          option.value = item.department_code;
          option.textContent = item.department_label;
          optgroup.appendChild(option);
        });

      if(optgroup.children.length>0) {
        select.appendChild(optgroup);
      }
    });
  }

  // その他
  const otherOption = document.createElement('option');
  otherOption.value = 'OTHER';
  otherOption.textContent = 'その他';
  select.appendChild(otherOption);
}

// 表示制御
function updateDepartmentVisibility(visitStatus) {
  const area = document.getElementById('departmentArea');
  if (!area) return;

  area.style.display =
    ['PLAN', 'DONE'].includes(visitStatus)
      ? 'block'
      : 'none';
}



document.getElementById('symptom').addEventListener('change', e => {
  const otherArea = document.getElementById('symptomOtherArea');
  if (!otherArea) return;

  otherArea.style.display =
    e.target.value === 'OTHER' ? 'block' : 'none';
});


document.getElementById('reason').addEventListener('change', e => {
  updateSymptomVisibility(e.target.value);
});

/* 
document.getElementById('department').addEventListener('change', e => {
  const otherArea = document.getElementById('departmentOtherArea');
  if (!otherArea) return;

});
 */

document.getElementById('visitStatus').addEventListener('change', e => {
  updateDepartmentVisibility(e.target.value);
});


// ================================
// 欠席日カレンダー
// ================================
// ■ 営業日判定
function isBusinessDay(date, nonBusinessSet) {
  const day = date.getDay(); // 0=日,6=土

  if (day === 0 || day === 6) return false;

  const dateStr = formatDate(date);
  if (nonBusinessSet.has(dateStr)) return false;

  return true;
}

// ■ カレンダー生成
function renderCalendar(nonBusinessDays) {
  const nonBusinessSet = new Set(nonBusinessDays);
  const today = new Date();

  const days = [];
  const businessDays = [];

  // ① 7日分生成
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, i);
    const dateStr = formatDate(d);

    const isBiz = isBusinessDay(d, nonBusinessSet);

    if (isBiz) {
      businessDays.push(dateStr);
    }

    days.push({
      date: d,
      dateStr,
      isBiz
    });
  }

  // ② 上位3営業日（本日含む）
  const selectableSet = new Set(businessDays.slice(0, 3));

  // ③ DOM反映
  const buttons = document.querySelectorAll('.day');

  days.forEach((d, i) => {
    const btn = buttons[i];

    btn.dataset.date = d.dateStr;
    btn.textContent = formatDisplay(d.date);

    if (!d.isBiz) {
      btn.className = "day disabled";
    } else if (selectableSet.has(d.dateStr)) {
      btn.className = "day selectable";
    } else {
      btn.className = "day disabled";
    }
  });
}

// ■ 補助関数
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatDisplay(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = ['日','月','火','水','木','金','土'][date.getDay()];
  return `${m}/${d}(${w})`;
}


