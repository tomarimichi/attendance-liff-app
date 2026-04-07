// キャッシュ関連
/*
async function fetchMastersWithCache() {
  // ① ローカルストレージ確認
  const cached = localStorage.getItem(MASTER_CACHE_KEY);

  if (cached) {
    console.log('[fetchMasters] from localStorage');
    return JSON.parse(cached);
  }

  // ② なければ GAS から取得
  console.log('[fetchMasters] from GAS');
  const json = await fetchMasters();

  // fetchMasters は失敗時 null を返す設計なので
  if (json) {
    localStorage.setItem(
      MASTER_CACHE_KEY,
      JSON.stringify(json)
    );
  }

  return json;
}
*/
// 2604 改修直前
/* async function loadMasters() {
  // ① GAS の最新 version
  const latestVersion = await fetchMasterVersion();

  console.log('latestVersion:', latestVersion);
  console.log('typeof latestVersion:', typeof latestVersion);


  // ② ローカル確認
  const localVersion = localStorage.getItem(MASTER_VERSION_KEY) || null;
  const localMasters = localStorage.getItem(MASTER_DATA_KEY);

  console.log('[loadMasters]:',{ 
    localVersion: localStorage.getItem(MASTER_VERSION_KEY),
    latestVersion,
    equal: localStorage.getItem(MASTER_VERSION_KEY) === latestVersion,
    localMastersRaw: localStorage.getItem(MASTER_DATA_KEY),
  });


  if (localVersion === latestVersion && localMasters) {
    console.log('[masters] use cache', {
        serverVersion: latestVersion,
        localVersion: localVersion,
        hasLocal: true
    });
    return JSON.parse(localMasters);
  } else {
    console.log('[masters] fetch from GAS', {
        serverVersion: latestVersion,
        localVersion: localVersion,
        hasLocal: !!localMasters
        });
  }

  // ③ 不一致 → 再取得
  console.log('[masters] from GAS');
  const masters = await fetchMasters();

  localStorage.setItem(MASTER_VERSION_KEY, latestVersion);
  localStorage.setItem(MASTER_DATA_KEY, JSON.stringify(masters));

  return masters;
} */

async function loadMasters() {
  // ① メモリキャッシュ
  if (memoryCache.masters) {
    console.log('[masters] from memory');
    return memoryCache.masters;
  }

  // ② 最新 version
  const latestVersion = await fetchMasterVersion();
  console.log ("[② 最新 version]:",latestVersion)

  // ③ ローカル確認
  const localVersion = localStorage.getItem(MASTER_VERSION_KEY);
  const localMasters = localStorage.getItem(MASTER_DATA_KEY);

  console.log("[③ ローカル確認]localVersion:",localVersion);
  console.log("[③ ローカル確認]:localMasters:",localMasters);

  // 強制キャッシュクリア
  const FORCE_REFRESH = true;
  if (FORCE_REFRESH) {
    localStorage.removeItem(MASTER_VERSION_KEY);
    localStorage.removeItem(MASTER_DATA_KEY);
  }

  if (localVersion === latestVersion && localMasters) {
    console.log('[masters] from localStorage');

    const parsed = JSON.parse(localMasters);
    console.log('[parsed before normalize]', parsed);

    const masters = normalizeMasters(parsed.data);
    console.log("[masters after normalize]",masters);
    
    console.log("[memoryCache before assign]",memoryCache);

    memoryCache.version = latestVersion;
    memoryCache.masters = masters;

    console.log("[memoryCache after assign]",memoryCache);

    return masters;
  }

  // ④ GAS取得
  console.log('[masters] from GAS');
  const data = await fetchMasters();

    if (!data) {
      throw new Error('masters fetch failed');
    }

  console.log('[masters raw before normalize]:', data);
  const masters = normalizeMasters(data.data);
  console.log("[masters raw after normalize]:", masters.data)

  // 保存
  localStorage.setItem(MASTER_VERSION_KEY, latestVersion);
  localStorage.setItem(MASTER_DATA_KEY, JSON.stringify(data));

  memoryCache.version = latestVersion;
  memoryCache.masters = masters;

  return masters;
}


async function fetchMasterVersion() {
  const res = await fetch(buildGasUrl("master_version"));
  if (!res.ok) throw new Error('master_version fetch failed');
  
  const text = await res.text();
  console.log("[raw response]", text);

  // const json = await res.json();
  const json = JSON.parse(text);

  console.log('[master_version raw]', json);

  return String(json.data.version);
}

function normalizeMasters(data) {
  console.log("[start normalizeMasters]",data)

  // 汎用マップ生成
  const toMap = (list) =>
    Object.fromEntries(list.map(v => [v.id, v]));
  console.log(`[toMap]: ${toMap}`)

  // カテゴリ付きマップ
  const toGroupedMap = (list, key) => {
    return list.reduce((acc, item) => {
      const k = item[key];
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    }, {});
  };
  console.log(`[toGroupedMap]: ${toGroupedMap}`)

  return {
    // --- 元データ ---
    raw: data,

    // --- 非営業日 ---
    nonBusinessSet: new Set(data.business_days || []),

    // --- reason ---
    reasonList: data.reasons || [],
    reasonMap: toMap(data.reasons || []),

    // --- symptom ---
    symptomList: data.symptoms || [],
    symptomMap: toMap(data.symptoms || []),

    // --- symptomカテゴリ ---
    symptomCategoryList: data.symptomCategories || [],
    symptomCategoryMap: toMap(data.symptomCategories || []),
    symptomByCategory: toGroupedMap(data.symptoms || [], 'category_id'),

    // --- department ---
    departmentList: data.departments || [],
    departmentMap: toMap(data.departments || []),

    // --- departmentカテゴリ ---
    departmentCategoryList: data.departmentCategories || [],
    departmentCategoryMap: toMap(data.departmentCategories || []),
    departmentByCategory: toGroupedMap(data.departments || [], 'category_id'),
  };
}
