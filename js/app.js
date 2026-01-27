// ================================
// app
// ================================
document.addEventListener('DOMContentLoaded', async () => {
  await liff.init({ liffId: LIFF_ID });

  // DOM取得（省略：現状のままでOK）

  // マスター取得
  const master = await fetchMasters();
  if (!master) {
    // 取得失敗時はここで止める
    return;
  }

  masterRaw = master;

  // 整形
  buildViewMasters(masterRaw);

  // 初期化
  initReasonSelect();
  initDepartmentSelect();

  bindEvents();
  updateVisibility();

  // イベント登録（現状のままでOK）
});
