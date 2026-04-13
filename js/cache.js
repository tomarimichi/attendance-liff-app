// Master Cache
async function loadMasters() {
  // ① メモリキャッシュ
  if (memoryCache.masters) {
    console.log('[masters] from memory');
    return memoryCache.masters;
  }

  // ② 最新 version
  const latestVersion = await fetchMasterVersion();
  console.log ("[最新 version]:",latestVersion)

  // ③ ローカル確認
  const localVersion = localStorage.getItem(MASTER_VERSION_KEY);
  const localMasters = localStorage.getItem(MASTER_DATA_KEY);

  // 強制キャッシュクリア
  /* 
    const FORCE_REFRESH = true;
    if (FORCE_REFRESH) {
      localStorage.removeItem(MASTER_VERSION_KEY);
      localStorage.removeItem(MASTER_DATA_KEY);
    }
  */

  if (localVersion === latestVersion && localMasters) {
    console.log('[masters] from localStorage');

    const parsed = JSON.parse(localMasters);
    console.log('[parsed before normalize]');

    const masters = normalizeMasters(parsed.data);
    
    console.log("[memoryCache before assign]");

    memoryCache.version = latestVersion;
    memoryCache.masters = masters;

    console.log("[memoryCache after assign]");

    return masters;
  }

  // ④ GAS取得
  console.log('[masters] from GAS');
  const data = await fetchMasters();

    if (!data) {
      throw new Error('masters fetch failed');
    }

  console.log('[masters raw before normalize]:');
  const masters = normalizeMasters(data.data);
  console.log("[masters raw after normalize]:")

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
  const toMap = (list,key) =>
    Object.fromEntries(list.map(v => [String(v[key]), v]));
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
    reasonMap: toMap(data.reasons || [], 'reason_code'),

    // --- symptom ---
    symptomList: data.cat_symptom || data.symptoms || [],
    symptomMap: toMap(data.m_symptom || data.symptoms || [], 'symptom_code'),

    // --- symptomカテゴリ ---
    symptomCategoryList: data.cat_symptom || data.symptomCategories || [],
    symptomCategoryMap: toMap(data.symptomCategories || [], 'category_code'),
    symptomByCategory: toGroupedMap(data.m_symptom || data.symptoms || [], 'category_code'),

    // --- department ---
    departmentList: data.m_department || data.departments || [],
    departmentMap: toMap(data.m_department || data.departments || [], 'department_code'),

    // --- departmentカテゴリ ---
    departmentCategoryList: data.cat_department || data.departmentCategories || [],
    departmentCategoryMap: toMap(data.departmentCategories || [], 'category_code'),
    departmentByCategory: toGroupedMap(data.m_department || data.departments || [], 'category_code'),
  };
}

// nonBusiness Cache
async function loadNonBusinessDays() {
  const latestVersion = await fetchNonBusinessVersion();
  const localVersion = localStorage.getItem('non_business_version')
  const cached = localStorage.getItem('non_business_days');

  if (!cached) {
    console.log('[nonBusiness] no cache');
  } else if (latestVersion !== localVersion) {
    console.log('[nonBusiness] version mismatch');
  } else {
    console.log('[nonBusiness] cache hit');
    return JSON.parse(cached);
  }
    const data = await fetchNonBusinessDays();

    localStorage.setItem('non_business_days', JSON.stringify(data));
    localStorage.setItem('non_business_version', latestVersion);

    return data;

}

async function fetchNonBusinessVersion() {
  const res = await fetch(buildGasUrl("nbd_version"));
  if (!res.ok) throw new Error('nbd_version fetch failed');

  const json = await res.json();

  return String(json.data.version);
}

async function fetchNonBusinessDays() {
  const res = await fetch(buildGasUrl("non_business_days"));
  if (!res.ok) throw new Error('non_business_days fetch failed');

  const json = await res.json();

  console.log('[nonBusiness raw]', json);

  return json.data;
}