// 更新配置文件
/**
 * 需要传参：token ==> 由之前IsAdmin的接口返回
 */

import { Type, validateBody } from "h3-typebox";
import path from "path";
import { PUBLIC_PATH } from "~~/commons/variables";
import fse from "fs-extra";
import { isToken } from "~~/utils/secret";
import { arrayAminusB } from "~~/utils";

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
    return updateConfig(dataConfig);
  } else {
    return { code: 0, message: result.message };
  }
});

export function updateConfig(
  dataConfig: {
    label: string;
    grade: string;
    school: string;
    count: number;
    isOpen: boolean;
    json: string;
    excel: string;
    detail: any[];
  }[]
) {
  const datasConfigPath = path.join(PUBLIC_PATH, "datas/config.json");
  if (fse.existsSync(datasConfigPath)) {
    try {
      const config = fse.readJSONSync(datasConfigPath);
      if (config.length == dataConfig.length) {
        const tConfig = config.map(
          (
            v: {
              isOpen: boolean;
              label: string;
              json: string;
              excel: string;
            },
            i: number
          ) => {
            v = {
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
      } else {
        const config = fse.readJSONSync(datasConfigPath);
        const tConfig = dataConfig.map((v, i, a) => {
          return {
            isOpen: a[i].isOpen,
            label: a[i].label,
            json: a[i].json,
            excel: a[i].excel,
          };
        });
        const jsonName = tConfig.map((v) => v.json);
        const excelName = tConfig.map((v) => v.excel);
        const jsonTname = config.map((v: any) => v.json);
        const excelTname = config.map((v: any) => v.excel);
        arrayAminusB(jsonName, jsonTname).forEach((v) => {
          fse.removeSync(path.join(PUBLIC_PATH, v));
        });
        arrayAminusB(excelName, excelTname).forEach((v) => {
          fse.removeSync(path.join(PUBLIC_PATH, v));
        });
        fse.writeJsonSync(datasConfigPath, tConfig, {
          spaces: "\t",
          encoding: "utf-8",
        });

        return {
          code: 1,
          message: "配置文件更新成功",
        };
      }
    } catch (error) {
      return { code: 0, message: "更新配置失败(配置文件格式可能有问题)" };
    }
  } else {
    return { code: 0, message: "更新配置失败(找不到datas配置文件)" };
  }
}
