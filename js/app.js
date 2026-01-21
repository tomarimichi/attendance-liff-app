// GAS/LIFF用の既存関数（そのまま保持）
async function initLiff(){
  await liff.init({ liffId:'2008783538-yHgAa1tC' });
  if(!liff.isLoggedIn()) return liff.login({ redirectUri: location.href });

  const id = liff.getDecodedIDToken().sub;

  const userIdEl = document.getElementById('userId');
  if (userIdEl) {
    userIdEl.textContent = id.substring(0,20)+'...';
  }
}



async function submitAbsence() {
  const submitBtn = document.getElementById('sendBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '送信中...⏳';

  // ★必須チェック
  const required = { absentDate: '欠席・遅刻日', reason: '欠席・遅刻理由', nextDate: '次回通所予定日' };
  for (let [id, label] of Object.entries(required)) {
    const element = document.getElementById(id);
    if (!element.value.trim()) {
      alert(`${label}を選択/入力してください`);
      submitBtn.disabled = false;
      submitBtn.textContent = '>送信';
      element.focus();
      return;
    }
  }

  // ★formData取得＋userId設定（これが抜けていた）
  const formData = new FormData(document.getElementById('absenceForm'));
  const params = Object.fromEntries(formData.entries());
  try {
    params.userId = liff.getDecodedIDToken().sub;
  } catch(e) {
    params.userId = 'web-user';
  }
  console.log('送信データ:', params);

  // プログレス開始（親100%＋子アニメ）
  const progress = document.getElementById('progress');
  const progressFill = progress.querySelector('div');
  progress.style.width = '100%';     // 親：即時表示
  progressFill.style.width = '100%'; // 子：4秒アニメ



  // ★GAS送信（復旧）
    const startTime = performance.now();

    fetch(GAS_URL + '?' + new URLSearchParams(params))
      .then(response => {
        const elapsed = performance.now() - startTime;
        console.log('GAS応答:', response.status, `${elapsed}ms`);
        
        // 4秒以上保証＋最大7秒制限
        const closeDelay = Math.min(Math.max(elapsed, 4000) + 300, 7000);
        console.log('クローズ時間:', closeDelay, 'ms');
        
      setTimeout(() => {
        const closeElapsed = performance.now() - startTime;
        console.log(
          'closeWindow実行:',
          closeElapsed.toFixed(1),
          'ms'
        );
        liff?.closeWindow();
      }, closeDelay);

      })
      .catch(e => {
        const elapsed = performance.now() - startTime;
        console.error('GASエラー:', e, `${elapsed}ms`);
        
        // エラー時も最大7秒
        const closeDelay = Math.min(Math.max(elapsed + 1000, 4500), 7000);
        console.log('エラークローズ:', closeDelay, 'ms');
        
      setTimeout(() => {
        const closeElapsed = performance.now() - startTime;
        console.log(
          'closeWindow（エラー時）実行:',
          closeElapsed.toFixed(1),
          'ms'
        );
        liff?.closeWindow();
      }, closeDelay);

      });

}

// 選択肢用マスターデータ取得
async function loadReasonMaster() {
  const select = document.getElementById('reason');
  if (!select) return;

  try {
    const res = await fetch(GAS_URL + '?action=reason_master');
    const list = await res.json();

    // ★ここに追加
    console.log('reason_master raw:', list);


    // 一旦すべてクリア
    select.innerHTML = '';

    // ★ 初期表示用 option
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '選択してください';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    // マスタ反映
    list.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.code;        // 送信値
      opt.textContent = item.label; // 表示名
      select.appendChild(opt);
    });

  } catch (e) {
    console.error('reason_master 取得失敗', e);
  }
}



  

  document.addEventListener('DOMContentLoaded',function(){
  initLiff();
  loadReasonMaster();
});

// 選択肢表示制御
document.addEventListener('DOMContentLoaded', () => {
  const reason = document.getElementById('reason');
  const visitStatus = document.getElementById('visitStatus');
  const department = document.getElementById('department');

  function hide(el) {
    if (!el) return;
    el.required = false;

    // 単数 / 複数 両対応
    if (el.multiple) {
      el.selectedIndex = -1;
    } else {
      el.value = '';
    }

    el.style.display = 'none';
  }

  function show(el) {
    if (!el) return;
    el.required = true;
    el.style.display = '';
  }

  function updateVisibility() {
    hide(visitStatus);
    hide(department);

    if (!reason.value) return;

    // 大項目：通院
    if (reason.value === '通院') {
      show(department);
      return;
    }

    // 大項目：体調不良
    if (reason.value === '体調不良') {
      show(visitStatus);

      if (
        visitStatus.value === 'あり' ||
        visitStatus.value === '済み'
      ) {
        show(department);
      }
    }
  }

  reason.addEventListener('change', updateVisibility);
  visitStatus.addEventListener('change', updateVisibility);

  // 初期化
  updateVisibility();
});
