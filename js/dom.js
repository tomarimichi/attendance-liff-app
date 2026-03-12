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
  const submitBtn = document.getElementById('sendBtn');

  // ===== 送信 submit =====
  form?.addEventListener('submit',async (e) => {
    e.preventDefault();

    /*
    const {
      symptomCodes,
      symptomOther,
      departmentCodes,
      departmentOther 
    } = collectList();
    */

    console.log("🚀 submit start",form);
    console.log("viewMasters.reasonList:", viewMasters.reasonList);


    const { params, symptomValues, departmentValues } = buildParams(form);
    const reasonMaster = viewMasters.reasonList.find(
      r => r.reason_code === params.reason
    );

    console.log("✅ validation passed");

    const payload = {
      ...params,
      submissionId,
      reasonCode: reasonMaster?.reason_code || "",
      symptomCodes: symptomValues,
      departmentCodes: departmentValues,
      symptomOther: params.symptomOther,
      departmentOther: params.departmentOther
    }

    console.log("🚀 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

    const error = validateForm(params, symptomValues, departmentValues);
    if (error) {
      alert(error);
      return;
      }

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
