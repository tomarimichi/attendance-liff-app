
// ================================
// submit
// ================================
const form = document.getElementById('absenceForm');

const symptomCodes = Array.from(
  document.querySelectorAll('input[name="symptom"]:checked')
  ).map(el => el.value);

const symptomOther =
  symptomCodes.includes('OTHER')
    ? document.getElementById('symptomOtherText')?.value.trim() || ''
    : '';

const departmentCodes = Array.from(
  document.querySelectorAll('input[name="department"]:checked')
  ).map(el => el.value);

const departmentOther =
  symptomCodes.includes('OTHER')
    ? document.getElementById('departmentOtherText')?.value.trim() || ''
    : '';



function buildParams(form) {
  const formData = new FormData(form);
  const params = Object.fromEntries(formData.entries());

  const symptomValues = form.symptom
    ? [...form.symptom.selectedOptions].map(o => o.value)
    : [];

  const departmentValues = form.department
    ? [...form.department.selectedOptions].map(o => o.value)
    : [];

    try {
      params.userId = liff.getDecodedIDToken().sub;
    } catch {
      params.userId = 'web-user';
    }

    return { params, symptomValues, departmentValues};
}


function validateForm(params, symptomValues, departmentValues) {
  if (!params.reason) {
    return '理由を選択してください';
  }

  const reasonConfig = viewMasters.reasonList.find(
    r => r.reason_code === params.reason
  );

  if(!reasonConfig) {
    return '不正な理由が選択されています';
  }

  if (reasonConfig.symptom_required && symptomValues.length === 0) {
    return '症状を選択してください';
  }

  if (
    symptomValues.includes('OTHER') &&
    !params.symptomOther?.trim()
  ) {
    return '症状（その他）を入力してください';
  }

  if (reasonConfig.visit_required && !params.visitStatus) {
    return '通院有無を選択してください';
  }

  const visitConfig = visitStatusList.find(
    v => v.visit_code === params.visitStatus
  );

  if (params.visitStatus && !visitConfig) {
    return '不正な通院有無が選択されています';
  }

  const needDepartment =
    visitConfig?.requires_department &&
    reasonConfig.department_required_when_visit;

  if (needDepartment && departmentValues.length === 0) {
    return '受診科を選択してください';
  }

  if (
    departmentValues.includes('OTHER') &&
    !params.departmentOther?.trim()
  ) {
    return '受診科（その他）を入力してください';
  }

  return null; // エラーなし
}

// ================================
// DOM取得関数part1
// ================================
function collectAbsenceDataFromForm() {
  return {
    // LINE User data
    lineUserId: document.getElementById('lineUserId').value,
    displayName: document.getElementById('displayName').value,

    // HTML出力
    absentDate: document.getElementById('absentDate').value,
    nextDate: document.getElementById('nextDate').value,
    nextTime: document.getElementById('nextTime').value,

    // 既存データ
    reasonCode: document.getElementById('reason')?.value || '',

    symptomCodes: Array.from(
      document.getElementById('symptom')?.selectedOptions || []
    ).map(opt => opt.value),

    visitStatus: document.getElementById('visitStatus')?.value || '',

    departmentCodes: Array.from(
      document.getElementById('department')?.selectedOptions || []
    ).map(opt => opt.value),

    symptomOther: document.getElementById('symptomOtherText')?.value || '',
    departmentOther: document.getElementById('departmentOtherText')?.value || ''
  };
}

// -------------------------------------------
// 再送付き送信関数
// -------------------------------------------
// test中
// async function sendWithRetry(type, payload, retryCount = 1, timeout = 30000) {
async function sendWithRetry(type, payload, retryCount = 1, timeout = 15000) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retryCount) {
    const controller = new AbortController();
    try {
      console.log(`送信試行: ${attempt + 1}`);
      const res = await fetchWithTimeout(
        () => postToGAS(type, payload),
        timeout
      );

      return res; // 成功したら即リターン

    } catch (err) {
      lastError = err;
      attempt++;

      console.warn(`送信失敗 (試行 ${attempt}):`, err);

      if (attempt <= retryCount) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  // ここに来たら再送も失敗
  throw lastError;
}