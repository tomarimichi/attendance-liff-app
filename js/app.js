// ================================
// app
// ================================
let isSubmitting = false;

window.addEventListener('beforeunload', (e) => {
  if (isSubmitting) {
    e.preventDefault();
    e.returnValue = '';
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await withLoading(
      async () => {
        // LIFF初期化
        console.log("① liff.init start");
        await liff.init({ liffId: LIFF_ID });
        console.log("② liff.init done");

        if (!liff.isLoggedIn()) {
          console.log("③ not logged in");
          liff.login();
          return;
        }

        // プロフィール取得
        console.log("④ getProfile start");
        const profile = await liff.getProfile();
        console.log("⑤ getProfile done");

        document.getElementById('lineUserId').value = profile.userId;
        document.getElementById('displayName').value = profile.displayName;

        // マスター取得
        console.log("⑥ loadMasters start");
        const master = await loadMasters();
        console.log("⑦ loadMasters done", master);

        if (!master) {
          console.log("⑧ master null");
          return;
          }

        masterRaw = master.data; //👈

        // 整形
        console.log("⑨ buildViewMasters");
        buildViewMasters(masterRaw);

        // UI初期化
        console.log("⑩ initReasonSelect");
        initReasonSelect(viewMasters.reasonList);
        console.log("⑪ buildSymptomOptions");
        buildSymptomOptions(
          viewMasters.symptomList,
          viewMasters.symptomCategoryList
        );
        console.log("⑫ buildDepartmentOptions");
        buildDepartmentOptions(
          viewMasters.departmentList,
          viewMasters.departmentCategoryList
        );

        // イベント系
        console.log("⑬ bindEvents");
        bindEvents();
        console.log("⑭ updateVisibility");
        updateVisibility();

console.log("categories:", viewMasters.categories);
console.log("departments:", viewMasters.departments);
      },
      {
        text: '画面を準備しています…',
        hideDelay: 300
      }
    );
  } catch (e) {
    console.error('[LIFF init error]', e);
    alert("JSエラー：" + e.message);
    showError();
  }
});


async function postToGAS(type, extraParams = {}) {
  const params = new URLSearchParams();
  params.append('type', type);

  Object.entries(extraParams).forEach(([key, value]) => {
    params.append(key, value);
  });

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  if (!res.ok) {
    throw new Error('Network error');
  }

  const result = await res.json();
  console.log("GAS response:", result);

  if (!result.gasSuccess) {
    throw new Error(result.message || 'GAS failed');
  }

  return result;

}