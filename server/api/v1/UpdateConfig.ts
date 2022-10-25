// 更新配置文件
/**
 * 需要传参：token ==> 由之前IsAdmin的接口返回
 */

import { Type, validateBody } from "h3-typebox";
import path from "path";
import { PUBLIC_PATH } from "~~/commons/variables";
import fse from "fs-extra";
import { isToken } from "~~/utils/secret";

export default defineHandle(async (event) => {
  const body = await validateBody(
    event,
    Type.Object({
      token: Type.String(),
      dataConfig: Type.Array(
        Type.Object({
          label: Type.String(),
          grade: Type.String(),
          school: Type.String(),
          count: Type.Number(),
          isOpen: Type.Boolean(),
          json: Type.String(),
          excel: Type.String(),
          detail: Type.Array(Type.Any()),
        })
      ),
    })
  );
  const { token, dataConfig } = body;
  const result = isToken(token);
  if (result.code) {
    const datasConfigPath = path.join(PUBLIC_PATH, "datas/config.json");
    if (fse.existsSync(datasConfigPath)) {
      try {
        const config = fse.readJSONSync(datasConfigPath);
        const tConfig = config.map(
          (
            v: {
              isOpen: boolean;
              label: string;
              json: string;
              excel: string;
              excelMd5?: string;
            },
            i: number
          ) => {
            v = v.excelMd5
              ? {
                  isOpen: dataConfig[i].isOpen,
                  label: dataConfig[i].label,
                  json: dataConfig[i].json,
                  excel: dataConfig[i].excel,
                  excelMd5: v.excelMd5,
                }
              : {
                  isOpen: dataConfig[i].isOpen,
                  label: dataConfig[i].label,
                  json: dataConfig[i].json,
                  excel: dataConfig[i].excel,
                };

            return v;
          }
        );
        fse.writeJsonSync(datasConfigPath, tConfig, {
          spaces: "\t",
          encoding: "utf-8",
        });
        return {
          code: 1,
          message: "配置文件更新成功",
        };
      } catch (error) {
        return { code: 0, message: "更新配置失败(配置文件格式可能有问题)" };
      }
    } else {
      return { code: 0, message: "更新配置失败(找不到datas配置文件)" };
    }
  } else {
    return { code: 0, message: result.message };
  }
});
