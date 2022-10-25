// 从json中去除想要的子项数据
export const pick = (obj: Object, arr: Array<string>) =>
  arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {});
// 数组差集
export const arrayAminusB = (arrA: string[], arrB: string[]) => {
  if (arrA.length >= arrB.length) {
    return arrA.filter((v) => !arrB.includes(v));
  } else {
    return arrB.filter((v) => !arrA.includes(v));
  }
};

//
export const dataURLtoFile = (dataurl: string, filename: string) => {
  // 获取到base64编码
  const arr = dataurl.split(",");
  // 将base64编码转为字符串
  const bstr = window.atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n); // 创建初始化为0的，包含length个元素的无符号整型数组
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {
    type: "image/jpeg",
  });
};
// base64前缀
export const prevBase64 = (ext: string) => {
  const data = [
    [".doc", "data:application/msword;base64,"],
    [
      "docx",
      "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,",
    ],
    [".xls", "data:application/vnd.ms-excel;base64,"],
    [
      "xlsx",
      "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,",
    ],
    [".pdf", "data:application/pdf;base64,"],
    [".ppt", "data:application/vnd.ms-powerpoint;base64,"],
    [
      "pptx",
      "data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,",
    ],
    [".txt", "data:text/plain;base64,"],
    [".json", "data:text/plain;base64,"],
    [".png", "data:image/png;base64,"],
    [".jpg", "data:image/jpeg;base64,"],
    [".gif", "data:image/gif;base64,"],
    [".svg", "data:image/svg+xml;base64,"],
    [".ico", "data:image/x-icon;base64,"],
    [".bmp", "data:image/bmp;base64,"],
  ];
  return data.filter((v) => v[0] == ext)[0][1];
};
// 前端操作工具
/**
 * 图像转base64
 * @param imageFile 图像文件可以是Blob类型也可以是url字符串
 * @param callback 成功之后的回调函数
 * @param errorCallback 有错误的回调
 * @param prev 是否带有base64的前缀
 * @returns base64字符串或者null
 */
export const convertImgToBase64 = (
  imageFile: string | Blob,
  callback: Function,
  errorCallback: Function,
  prev: boolean
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    try {
      if (imageFile instanceof Blob) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = function (e) {
          const base64Str = e.target.result as string;
          if (callback) {
            callback(
              prev
                ? base64Str
                : base64Str.replace(/^data:image\/\w+;base64,/, "")
            );
          }
          resolve(
            prev ? base64Str : base64Str.replace(/^data:image\/\w+;base64,/, "")
          );
        };
      } else {
        if (/^data:image\/\w+;base64,/.test(imageFile)) {
          resolve(
            prev ? imageFile : imageFile.replace(/^data:image\/\w+;base64,/, "")
          );
        } else {
          // url 转 base64
          const image = new Image();
          image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            // 将图片插入画布并开始绘制
            canvas.getContext("2d").drawImage(image, 0, 0);
            // result
            if (callback) {
              callback(
                prev
                  ? canvas.toDataURL("image/png")
                  : canvas
                      .toDataURL("image/png")
                      .replace(/^data:image\/\w+;base64,/, "")
              );
            }
            resolve(
              prev
                ? canvas.toDataURL("image/png")
                : canvas
                    .toDataURL("image/png")
                    .replace(/^data:image\/\w+;base64,/, "")
            );
          };
          // CORS 策略，会存在跨域问题https://stackoverflow.com/questions/20424279/canvas-todataurl-securityerror
          image.setAttribute("crossOrigin", "Anonymous");
          image.src = imageFile;
          // 图片加载失败的错误处理
          image.onerror = (error) => {
            console.log("发生一个错误: 图像不在服务器上");
            if (errorCallback) {
              errorCallback(error);
            }
            reject(null);
          };
        }
      }
    } catch (error) {
      console.log("发生一个错误: 图像不在服务器上");
      if (errorCallback) {
        errorCallback(error);
      }
      reject(null);
    }
  });
};

/**
 * base64转blob
 * @param base64Data base64字符串 记得带上前缀
 * @returns 返回Blob
 */
export const dataURItoBlob = (base64Data: string) => {
  let byteString: string;
  if (base64Data.split(",")[0].indexOf("base64,") >= 0)
    byteString = window.atob(base64Data.split(",")[1]);
  else byteString = window.unescape(base64Data.split(",")[1]);
  let mimeString = base64Data.split(",")[0].split(":")[1].split(";")[0];
  let ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], {
    type: mimeString,
  });
};

/**
 *
 * @param fileBase64 base64无前缀string
 * @returns 文件类型
 */
export const base64FileHeaderMapper = (fileBase64: string) => {
  let fileHeader = new Map();

  //获取不同文件的文件头前3个字作为判断依据
  fileHeader.set("/9j", ".JPG");
  fileHeader.set("iVB", ".PNG");
  fileHeader.set("Qk0", ".BMP");
  fileHeader.set("SUk", ".TIFF");
  fileHeader.set("JVB", ".PDF");
  fileHeader.set("UEs", ".OFD");

  let res = "";

  //遍历map中所提及的文件头特征
  fileHeader.forEach((v, k) => {
    if (k == fileBase64.substr(0, 3)) {
      res = v;
    }
  });

  //如果不在map中返回unknown file
  if (res == "") {
    res = ".file";
  }

  //否则返回map中的value值
  return res;
};
