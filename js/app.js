// ================================
// app
// ================================
document.addEventListener('DOMContentLoaded', async () => {
  await liff.init({ liffId: LIFF_ID });

  bindDom();
  await fetchMasters();

  initReasonSelect();
  initDepartmentSelect();
  updateVisibility();
  bindEvents();
});
