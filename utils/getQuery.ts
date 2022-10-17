export default (value: string): any => {
  let temp = value.split("?");
  let map = new Object();
  if (temp.length > 1) {
    temp[1]
      .split("&")
      .map((v) => ({
        key: v.split("=")[0],
        value: v.split("=").length > 1 ? v.split("=")[1] : "",
      }))
      .forEach((value, index) => {
        map[value.key] = value.value;
      });
    return map;
  } else {
    return map;
  }
};
