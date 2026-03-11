async function postToGAS(type, extraParams = {}, options = {}) {

  const params = new URLSearchParams();
  params.append('type', type);

  Object.entries(extraParams).forEach(([k,v])=>{
    params.append(k,v);
  });

  const res = await fetch(GAS_URL,{
    method:'POST',
    headers:{
      'Content-Type':'application/x-www-form-urlencoded'
    },
    body:params,
    signal:options.signal
  });

  if(!res.ok){
    throw new Error('Network error');
  }

  const result = await res.json();

  if(!result.gasSuccess){
    throw new Error(result.message || 'GAS failed');
  }

  return result;
}