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
        // reasonLabel: reasonMaster?.reasonLabel || "",

        symptomCodes: symptomValues,
        departmentCodes: departmentValues,

        symptomOther: params.symptomOther,
        departmentOther: params.departmentOther

        // symptom: JSON.stringify(symptomValues),
        // department: JSON.stringify(departmentValues)
    }

    console.log("🚀 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));


    if (error) {
      alert(error);
      return;
    }
    try{
      // params.append('submissionId', submissionId);    
      await withLoading(async () => {
      const result = await postToGAS("submit_absence", payload);
      },
      { text: '送信中...'});

    alert('送信完了しました。');
    console.log(result)

  } catch (error) {
    console.error(error);
    alert("通信エラーが発生しました");
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
