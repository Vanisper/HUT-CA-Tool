import formidable from "formidable";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";
import url, { fileURLToPath } from "url";
import fse from "fs-extra";
import { isToken } from "~~/utils/secret";
import { PUBLIC_PATH } from "~~/commons/variables";
import { checkSchema } from "./UserData";
import { updateConfig } from "./UpdateConfig";
import md5 from "md5";

const UPLOAD_DIR = path.join(PUBLIC_PATH, "/upload/datas/excel");
const jsonDataPath = path.join(PUBLIC_PATH, "datas/json");
if (!fse.existsSync(UPLOAD_DIR)) {
  fse.mkdirpSync(UPLOAD_DIR);
}
if (!fse.existsSync(jsonDataPath)) {
  fse.mkdirpSync(jsonDataPath);
}

export default async (req: IncomingMessage) => {
  return new Promise((res, rej) => {
    const token = req.headers.authorization;
    const query = JSON.parse(JSON.stringify(url.parse(req.url, true).query));
    try {
      let { filename, isOpen } = query;
      isOpen = isOpen == "true" ? true : false;
      const tokenResult = isToken(token);
      if (tokenResult.code) {
        const form = formidable({
          multiples: true,
          uploadDir: UPLOAD_DIR,
          keepExtensions: true,
          encoding: "utf-8",
          filename: (name, ext) => {
            return filename + ext;
          },
        });

        form.parse(req, (err, fields, files) => {
          const filen = (files.file as any).filepath as string;
          if (err == null) {
            const checkResult = checkSchema(filen);
            if (!checkResult.code) {
              // 删除不服符合模板的文件
              fse.removeSync(filen);
              res({
                code: 0,
                message: "excel文件不符合规定模板",
              });
            } else {
              // 写入json
              fse.writeJsonSync(
                path.join(
                  jsonDataPath,
                  path.basename(filen, path.extname(filen)) + ".json"
                ),
                checkResult.data,
                {
                  spaces: "\t",
                  encoding: "utf-8",
                }
              );
              // 写入配置文件
              const configPath = path.join(PUBLIC_PATH, "datas/config.json");
              if (fse.existsSync(configPath)) {
                try {
                  const config = fse.readJSONSync(configPath);
                  if (config instanceof Array) {
                    const reIndex = config
                      .map((v) => v.label == filename)
                      .indexOf(true);
                    // 取代同名
                    if (reIndex >= 0) {
                      config.splice(reIndex, 1);
                    }
                    config.push({
                      isOpen: isOpen,
                      label: filename,
                      json:
                        "/datas/json/" +
                        path.basename(filen, path.extname(filen)) +
                        ".json",
                      excel: "/upload/datas/excel/" + path.basename(filen),
                      excelMd5: md5(fse.readFileSync(filen)),
                    });
                    fse.writeJsonSync(configPath, config, {
                      spaces: "\t",
                      encoding: "utf-8",
                    });
                  }
                } catch (error) {
                  fse.removeSync(filen);
                  res({
                    code: 0,
                    message: "配置文件格式错误,无法记录配置",
                  });
                }
              }

              res({
                code: 1,
                message: "上传成功",
                data: {
                  label: filename,
                  json:
                    "/datas/json/" +
                    path.basename(filen, path.extname(filen)) +
                    ".json",
                  excel: "/upload/datas/excel/" + path.basename(filen),
                  isOpen: isOpen,
                  studentGrades: checkResult.data,
                },
              });
            }
          } else {
            fse.removeSync(filen);
            res({
              code: 0,
              message: "上传失败：" + err,
            });
          }
        });
      } else {
        res({
          code: 0,
          message: tokenResult.message,
        });
      }
    } catch (error) {
      res({
        code: 0,
        message: error + "",
      });
    }
  });
};
