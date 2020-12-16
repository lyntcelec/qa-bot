export function removeItemOnce(arr: Array<string>, value: string) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export function removeItemAll(arr: Array<string>, value: string) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

export function msleep(ms: number) {
  return new Promise((resolve, reject) => {
    if (isNaN(ms) || ms < 0) {
      reject("invalid_ms");
      return;
    }
    setTimeout(resolve, ms);
  });
}
