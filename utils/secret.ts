import crypto from "crypto";
import qs from "querystringify";
import path from "path";
import fse from "fs-extra";
import { PUBLIC_PATH } from "~~/commons/variables";
import { dayjs } from "element-plus";

const SECRET_KEY = "xingxinghuishuoh";
// token持续时间(ms) => 3小时
const TOKEN_PERIOD = 1000 * 60 * 60 * 3;
/**
 * AES加密的配置
 * 1.密钥
 * 2.偏移向量
 * 3.算法模式CBC
 * 4.补全值
 */
const AES_conf = {
  key: SECRET_KEY, //密钥
  iv: "1012132405963708", //偏移向量
  padding: "PKCS7Padding", //补全值
};

// md5 加密
function md5(content: string) {
  let md5 = crypto.createHash("md5");
  return md5.update(content).digest("hex"); // 把输出编程16进制的格式
}

/**
 * AES_128_CBC 加密
 * 128位
 * return base64
 */
function encryption(data: string) {
  let key = AES_conf.key;
  let iv = AES_conf.iv;
  // let padding = AES_conf.padding;

  let cipherChunks = [];
  let cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  cipher.setAutoPadding(true);
  cipherChunks.push(cipher.update(data, "utf8", "base64"));
  cipherChunks.push(cipher.final("base64"));
  return cipherChunks.join("");
}
/**
 * AES_128_CBC 解密
 * return utf8
 */
function decryption(data: string) {
  let key = AES_conf.key;
  let iv = AES_conf.iv;
  // let padding = AES_conf.padding;

  let cipherChunks = [];
  let decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(data, "base64", "utf8"));
  cipherChunks.push(decipher.final("utf8"));
  return cipherChunks.join("");
}

// 加密函数
function genPassword(password: string) {
  const str = `password=${password}&key=${SECRET_KEY}`; // 拼接方式是自定的，只要包含密匙即可
  return md5(str);
}

// 生成token
function genToken(id: string, password: string, name: string, time: number) {
  const str = `id=${id}&password=${password}&name=${name}&timestamp=${time}&period=${TOKEN_PERIOD}&key=${SECRET_KEY}`; // 拼接方式是自定的，只要包含密匙即可
  return encryption(str);
}

// 解密token
function deToken(str: string): any {
  return qs.parse(decryption(str));
}

// token是否过期
function isToken(str: string) {
  try {
    const { id, password, name, timestamp, period, key } = deToken(str);
    if (id && password && name && timestamp && period && key) {
      const adminListPath = path.join(PUBLIC_PATH, "configs/_admin.json");
      if (fse.existsSync(adminListPath)) {
        const admin = fse.readJsonSync(adminListPath);
        if (admin instanceof Array) {
          const targetAdmin = admin.filter(
            (v) =>
              v.id == id &&
              v.password == password &&
              v.name == name &&
              +period == TOKEN_PERIOD &&
              key == SECRET_KEY
          );
          if (targetAdmin.length > 0) {
            if (+timestamp + +period >= Date.now()) {
              return {
                code: 1,
                message: `将于${dayjs(+timestamp + +period).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}过期`,
                timeout: +timestamp + +period,
                id,
                name,
                password,
              };
            } else {
              return {
                code: 0,
                message: "token过期了",
              };
            }
          } else {
            return {
              code: 0,
              message: "管理员验证失败",
            };
          }
        } else {
          return {
            code: 0,
            message: "管理员账号文件格式错乱",
          };
        }
      } else {
        return {
          code: 0,
          message: "管理员账号文件丢失",
        };
      }
    } else {
      return {
        code: 0,
        message: "token信息丢失/不匹配",
      };
    }
  } catch (error) {
    return {
      code: 0,
      message: "token长度不正确",
    };
  }
}

export { genPassword, genToken, deToken, isToken };
