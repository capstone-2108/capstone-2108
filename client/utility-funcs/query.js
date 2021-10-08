export const getQueryParam = (location, key) => {
  const query = new URLSearchParams(location.search);
  return query.get(key);
};

export const hasQueryParam = (location, key) => {
  const query = new URLSearchParams(location.search);
  return query.has(key);
};

const arrayifyQueryParams = (query) => {
  return decodeURI(
    query.startsWith("?") ? query.slice(1) : query
  ).split("&");
}

const stringfyQueryArrMap = (queryArrMap) => {
  return encodeURI(
    Array.from(queryArrMap)
      .map(([key, val]) => key + "=" + val)
      .join("&")
  );
}

export const deleteFromQuery = (location, key) => {
  const queryParams = arrayifyQueryParams(location.search);
  const newQueryParams = new Map();
  queryParams.forEach((queryParam) => {
    const [queryKey, val] = queryParam.split("=");
    if (key !== queryKey) {
      newQueryParams.set(key, val);
    }
  });
  return stringfyQueryArrMap(newQueryParams);
};

export const deleteFromQueryParamArr = (location, keyToModify, valueToRemove) => {
  const queryParams = arrayifyQueryParams(location.search);
  const newQueryParams = new Map();
  queryParams.forEach((queryParam) => {
    const [key, valArr] = queryParam.split("=");
    if (key === keyToModify) {
      const values = valArr.split("|").filter((value) => value !== valueToRemove);
      newQueryParams.set(key, values.join("|"));
    } else newQueryParams.set(key, valArr);
  });
  return stringfyQueryArrMap(newQueryParams);
};

export const setQueryParam = (location, key, val) => {
  let rawQuery = typeof location === 'object' ? location.search : location;
  const query = new URLSearchParams(rawQuery);
  if (query.has(key)) {
    query.delete(key);
    query.append(key, val);
  } else {
    query.append(key, val);
  }
  query.sort();
  return query.toString();
};
