import localforage from "localforage";

const localForage = localforage;
localForage.config({ driver: localforage.INDEXEDDB, name: "HUT CA Tool" });

localForage
  .ready()
  .then(function () {
    // 当 localforage 将指定驱动初始化完成时，此处代码运行
    console.log(localForage.driver()); // LocalStorage
  })
  .catch(function (e) {
    console.log(e); // `No available storage method found.`
    // 当没有可用的驱动时，`ready()` 将会失败
  });

export default localForage;
