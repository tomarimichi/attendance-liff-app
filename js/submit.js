
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


async function submitAbsence() {
  const form = document.getElementById('absenceForm');

  form.addEventListener('submit',async(e) => {
    e.preventDefault();

    const errorMessage = validateForm();
    if(errorMessage) {
      alert(errorMessage);
      return;
    }

    await submitForm();
  });


  const formData = new FormData(form);
  const params = Object.fromEntries(formData.entries());

  // department（複数選択）
  if (form.department) {
    params.department = [...form.department.selectedOptions]
      .map(o => o.value)
      .join(',');
  }

  // userId
  try {
    params.userId = liff.getDecodedIDToken().sub;
  } catch {
    params.userId = 'web-user';
  }

  // ===== reason 必須 =====
  if (!params.reason) {
    alert('大項目を選択してください');
    return;
  }

  const reasonConfig = reasonList.find(
    r => r.reason_code === params.reason
  );

  if (!reasonConfig) {
    alert('不正な理由が選択されています');
    return;
  }

  // ===== symptom =====
  if (reasonConfig.symptom_required && !params.symptom) {
    alert('症状を選択してください');
    return;
  }

  // visitStatus 必須
  if (reasonConfig.visit_required && !params.visitStatus) {
    alert('通院有無を選択してください');
    return;
  }

  const visitConfig = visitStatusList.find(
    v => v.visit_code === params.visitStatus
  );

  if (params.visitStatus && !visitConfig) {
    alert('不正な通院有無が選択されています');
    return;
  }

  // department 必須判定
  const needDepartment =
    visitConfig?.requires_department &&
    reasonConfig.department_required_when_visit;

  if (needDepartment && !params.department) {
    alert('受診科を選択してください');
    return;
  }


  if (needDepartment && !params.department) {
    alert('受診科を選択してください');
    return;
  }

  // ===== 送信 =====
  await fetch(`${GAS_URL}?${new URLSearchParams(params)}`);
  liff.closeWindow();
}


function validateForm() {
  console.log(
    '[validateForm]',
    document.getElementById('reason'),
    document.getElementById('reason')?.value
  );

  const reasonCode = 
    document.getElementById('reason')?.value || '';
    console.log('[validateForm] reasonCode =', reasonCode);
  const symptomValue = 
    document.getElementById('symptom')?.value || '';
  const visitValue = 
    document.getElementById('visitStatus')?.value || '';
  const departmentValue = 
    document.getElementById('department')?.value || '';

  // 欠席理由未選択
  if (!reasonCode) {
    return '欠席理由を選択してください。';
  }

  // --- 体調不良 ---
  if (reasonCode === 'ILLNESS') {
    if (!symptomValue) {
      return '症状を選択してください。';
    }

    if (!visitValue) {
      return '受診有無を選択してください。';
    }

    if (
      (visitValue === 'PLAN' || visitValue === 'DONE') &&
      !departmentValue
    ) {
      return '受診科を選択してください。';
    }
  }

  // --- 通院 ---
  if (reasonCode === 'VISIT') {
    if (!departmentValue) {
      return '受診科を選択してください。';
    }
  }

  return null; // OK
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  console.log('[form submit]');

  const errorMessage = validateForm();
  if (errorMessage) {
    alert(errorMessage);
    return;
  }

  await submitForm();
});



async function submitForm() {
  // clearFormError();
  const btn = document.getElementById('sendBtn');
  btn.disabled = true;
  btn.textContent = '送信中...';

  try {
    isSubmitting = true;
    await withLoading(
      async () => {
        const absenceData = collectAbsenceDataFromForm();
        const sanitized = sanitizeBeforeSubmit(absenceData);

        console.log('[submitForm] sanitized',sanitized);

        const result = await postToGAS('submit_absence',{
          submissionId,
          ...sanitized,
          symptomCodes: sanitized.symptomCodes.join(','),
          departmentCodes: sanitized.departmentCodes.join(',')
        });
      },
      {
        text: '送信しています...',
        hideDelay: 300
      }
    );

    alert('送信しました');
    if (liff.isInClient()) {
      liff.closeWindow();
    }
  } catch(e) {
    isSubmitting = false;
    console.error('[submitForm error]', e);

    btn.disabled = false;
    btn.textContent = '送信';

    alert (
      '送信できませんでした。\n\n' +
      'お手数ですが、LINEのトークで\n' +
      '直接ご連絡ください'
    );
    /*
      if (liff.isInClient()) {
        liff.closeWindow();
      }
    */
  }
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

/*
  const params = new URLSearchParams();
  // 単純な値
  params.append('type', 'submit_absence');
  
  params.append('submissionId', submissionId);
  params.append('lineUserId', sanitized.lineUserId);
  params.append('displayName', sanitized.displayName);
  params.append('absentDate', sanitized.absentDate);
  params.append('nextDate', sanitized.nextDate);
  params.append('nextTime', sanitized.nextTime);
  params.append('reasonCode', sanitized.reasonCode);
  params.append('visitStatus', sanitized.visitStatus);
  params.append('symptomOther', sanitized.symptomOther);
  params.append('departmentOther', sanitized.departmentOther);

  // 配列は join
  params.append('symptomCodes', sanitized.symptomCodes.join(','));
  params.append('departmentCodes', sanitized.departmentCodes.join(','));


  console.log('[submit params]', params.toString());
*/

