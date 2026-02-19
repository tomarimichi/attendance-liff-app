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

        masterRaw = master;

        // 整形
        console.log("⑨ buildViewMasters");
        buildViewMasters(masterRaw);

        // UI初期化
        console.log("⑩ initReasonSelect");
        initReasonSelect(viewMasters.reasonList);
        console.log("⑪ buildSymptomOptions");
        buildSymptomOptions(viewMasters.symptomList);
        console.log("⑫ buildDepartmentOptions");
        buildDepartmentOptions(viewMasters.departmentList);

        // イベント系
        console.log("⑬ bindEvents");
        bindEvents();
        console.log("⑭ updateVisibility");
        updateVisibility();
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



/*
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // showLoading('LINEに接続しています...');
    showLoading();


    // LIFF初期化
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    // プロフィール取得
    // showLoading('ユーザー情報を取得しています...');
    const profile = await liff.getProfile();
    document.getElementById('lineUserId').value = profile.userId;
    document.getElementById('displayName').value = profile.displayName;

    // マスター取得（★1回だけ）
    // showLoading('画面を準備しています...')
    const master = await loadMasters();
    if (!master) {
      // fetchMasters 側でエラー表示済み
      return;
    }

    masterRaw = master;

    // 整形
    buildViewMasters(masterRaw);

    // UI初期化
    initReasonSelect(viewMasters.reasonList);
    buildSymptomOptions(viewMasters.symptomList);
    buildDepartmentOptions(viewMasters.departmentList);

    // イベント系
    bindEvents();
    updateVisibility();

  } catch (e) {
    console.error('[LIFF init error]', e);
  } finally {
    hideLoading();
  }
});
*/

/*

document.addEventListener('DOMContentLoaded', async () => {
  await liff.init({ liffId: LIFF_ID });

    if (!liff.isLoggedIn()) {
    liff.login(); // ← ここで一度リダイレクトされる
    return;
  }

  // LIFF
  const profile = await liff.getProfile();
  console.log(profile);

  document.getElementById('lineUserId').value = profile.userId;
  document.getElementById('displayName').value = profile.displayName;

  // マスター取得
  const master = await fetchMasters();
  // ★廃止★　initViewMasters(viewMasters);
  console.log('testですよ')
  if (!master) {
    // 取得失敗時はここで止める
    return;
  }

  masterRaw = master;

  // 整形
  buildViewMasters(masterRaw);

  // 初期化
  initReasonSelect(viewMasters.reasonList);
  // initDepartmentSelect();

  bindEvents();
  updateVisibility();

  // イベント登録（現状のままでOK）
});

*/

