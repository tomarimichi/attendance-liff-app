
// ================================
// submit
// ================================
const form = document.getElementById('absenceForm');

function collectList() {
  // チェックされた症状を取得
  const symptomCodes = Array.from(
    document.querySelectorAll('input[name="symptom"]:checked')
  ).map(el => el.value);

  const symptomOther = symptomCodes.includes('OTHER')
    ? document.getElementById('symptomOtherText')?.value.trim() || ''
    : '';

  // チェックされた部署を取得
  const departmentCodes = Array.from(
    document.querySelectorAll('input[name="department"]:checked')
  ).map(el => el.value);

  const departmentOther = departmentCodes.includes('OTHER')
    ? document.getElementById('departmentOtherText')?.value.trim() || ''
    : '';

  return {
    symptomCodes,
    symptomOther,
    departmentCodes,
    departmentOther
  };
}

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

/* メッセージ分岐 */
function validateForm(params, symptomValues, departmentValues,selectedDates) {
  if (selectedDates.length === 0) {
    return "日付を選択してください";
  }

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

  // 文言改善
    // 症状(その他)を入力してください
    // 　↓
    // 理由を書かないといけない旨の文面に変更
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


async function sendWithRetry(type, payload, retryCount = 1, timeout = 15000) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retryCount) {
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


async function handleSubmit(form) {
    const submitBtn = document.getElementById('sendBtn');
    console.log("🚀 submit start");
    /* console.log("viewMasters.reasonList:", viewMasters.reasonList); */


    const { params, symptomValues, departmentValues } = buildParams(form);
    const reasonMaster = viewMasters.reasonList.find(
      r => r.reason_code === params.reason
    );


    const payload = {
      ...params,
      dates: [...selectedDates].sort(),
      submissionId,
      reasonCode: reasonMaster?.reason_code || "",
      symptomCodes: symptomValues,
      departmentCodes: departmentValues,
      symptomOther: params.symptomOther,
      departmentOther: params.departmentOther
    }

    const error = validateForm(params, symptomValues, departmentValues,selectedDates);
   
    if (error) {
      showToast(error);
      // setStatus()
      return;
      }
    console.log("✅ validation passed");

    console.log("🚀 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));




    return; // 開発中STOP

      submitBtn.disabled = true;

      try{
        console.log("before withLoading");
        const result = await withLoading(
          () => fetchWithTimeout((signal) => postToGAS('submit_absence',payload, {signal}), 15000),
          { text: '送信中...', hideDelay: 300, safetyTimeout: 45000}
        );
        console.log('[送信結果]', result);

        hideLoading();

        if(result.gasSuccess && result.lwSuccess) {
          setStatus('success','受付が完了しました。');
          setTimeout(() => liff.closeWindow(),3000);
          submitBtn.disabled = true;
          if (liff.isInClient()) setTimeout(() => liff.closeWindow(),3000);
        
        } else if (result.duplicate) {
          setStatus('success','すでに受付済みです。');
          if (liff.isInClient()) setTimeout(() => liff.closeWindow(),2000);
          return;
        } else if (result.gasSuccess) {
          setStatus('warning', '受付は完了しましたが通知に失敗しました。');
          if (liff.isInClient()) setTimeout(() => liff.closeWindow(),3000);

        } else {
          setStatus('error', '処理に失敗しました。<br>LINEを再起動してください。');
          submitBtn.disabled = false;
          if (liff.isInClient()) setTimeout(() => liff.closeWindow(),5000);
        }

      } catch (error) {
        console.error("送信エラー", error);
        hideLoading();
        setStatus('error', error.message || '通信エラーが発生しました。<br>LINEで直接連絡してください');
        submitBtn.disabled = false;
        if (liff.isInClient()) setTimeout(() => liff.closeWindow(),5000);
    }  
}