// ================================
// app
// ================================

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

  viewMasters = await fetchMasters();
  initViewMasters(viewMasters);

  // マスター取得
  const master = await fetchMasters();
  initViewMasters(viewMasters)
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
