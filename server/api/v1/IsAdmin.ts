import { PUBLIC_PATH } from "~~/commons/variables";
import fse from "fs-extra";
import path from "path";
import { genPassword, genToken } from "~~/utils/secret";

// console.log(genPassword("admin"));
// console.log(genPassword("ms848789"));

export default defineHandle((handle) => {
  const { id, passwd } = useQuery(handle);

  const newPassWd = genPassword(passwd as string);
  const adminListPath = path.join(PUBLIC_PATH, "configs/_admin.json");

  if (fse.existsSync(adminListPath)) {
    try {
      const admin = fse.readJsonSync(adminListPath);

      if (admin instanceof Array) {
        if (
          admin.filter((v) => v.id == id && v.password == newPassWd).length > 0
        ) {
          const name = admin.filter(
            (v) => v.id == id && v.password == newPassWd
          )[0].name;
          const token = genToken(id as string, newPassWd, name, Date.now());
          //   console.log(deToken(token));
          const tAdmin = admin.map((value, index) => {
            if (value.id == id) {
              value.token = token;
            }
            return value;
          });
          fse.writeJSONSync(adminListPath, tAdmin, {
            spaces: "\t",
            encoding: "utf-8",
          });

          return {
            code: 1,
            message:
              "欢迎：" +
              admin.filter((v) => v.id == id && v.password == newPassWd)[0]
                .name,
            name: name,
            token: token,
          };
        } else {
          return {
            code: 0,
            message: "管理员身份验证失败",
          };
        }
      } else {
        throw "管理员数据格式不正确,导致无法读取";
      }
    } catch (error) {
      return {
        code: 0,
        message: "管理员账号数据出现未知错误(请联系qq 27326649)",
      };
    }
  } else {
    return {
      code: 0,
      message: "后台没有设置管理员账号<br />请联系qq 273266469",
    };
  }
});
