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

  // ===== 送信 submit =====
  form?.addEventListener('submit',async (e) => {
    e.preventDefault();
    console.log("🚀 submit start",form);
    console.log("viewMasters.reasonList:", viewMasters.reasonList);


    const { params, symptomValues, departmentValues } = buildParams(form);
    const reasonMaster = viewMasters.reasonList.find(
      r => r.reason_code === params.reason
    );
    console.log(
      viewMasters.reasonList.find(
        r => r.reason_code === params.reason
      )
    );
    console.log("params:", params);
    console.log("symptomValues:", symptomValues);
    console.log("departmentValues:", departmentValues);

    console.log("params.symptom:", params.symptom);
    console.log("params.symptomOther:", params.symptomOther);

    const error = validateForm(params, symptomValues, departmentValues);


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

    const submitBtn = document.getElementById('sendBtn');

    if (error) {
      alert(error);
      return;
      }
      try{
        submitBtn.disabled = true;

            // タイムアウトテスト
            const testBtn = document.getElementById('testBtn');
            testBtn.addEventListener('click', async (e) => {
              e.preventDefault();

              await testTimeout();  // タイムアウト挙動確認用
            });

        const result = await withLoading(
          () => postToGAS('submit_absence', payload),
          { text: '送信中...'}
        );

        console.log('[withLoading result]', result);

        console.log("before setStatus call");
        if(result.gasSuccess && result.lwSuccess) {
          console.log("setStatus call");
          setStatus('success','受付が完了しました。');
          submitBtn.disabled = true;
          if (liff.isInClient()) {
            setTimeout(() => {
              liff.closeWindow();
            }, 3000);
          }
          /*
          setTimeout(()=> {
            if (liff.isInClient()){
              liff.closeWindow();
            }
          },3000);
          */
        
        } else if (result.duplicate) {
          setStatus('success','すでに受付済みです。');
          return;
        } else if (result.gasSuccess) {
          setStatus('warning', '受付は完了しましたが通知に失敗しました。');

        } else {
          setStatus('error', '処理に失敗しました。LINEを再起動してください。');
          submitBtn.disabled = false;
        }

      } catch (error) {
        submitBtn.disabled = false;

        if (error.message === 'timeout') {
          setStatus('error', '通信がタイムアウトしました。電波状況をご確認ください。');
        } else {
          setStatus('error' ,'通信エラーが発生しました。');
        }
        console.error(error);
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
