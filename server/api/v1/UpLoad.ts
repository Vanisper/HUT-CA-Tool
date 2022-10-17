import fse from "fs-extra";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";
import url, { fileURLToPath } from "url";
import formidable from "formidable";

const __filenameNew = fileURLToPath(import.meta.url);
const __dirnameNew = path.dirname(__filenameNew);
const UPLOAD_DIR = path.resolve(__dirnameNew, "../../assets/upload");

// 创建文件夹
if (!fse.existsSync(UPLOAD_DIR)) {
  fse.mkdirSync(UPLOAD_DIR);
}

export default async (req: IncomingMessage, res: ServerResponse) => {
  // 创建文件夹
  if (
    !fse.existsSync(
      path.join(UPLOAD_DIR, url.parse(req.url, true).query.id as string)
    )
  ) {
    fse.mkdirSync(
      path.join(UPLOAD_DIR, url.parse(req.url, true).query.id as string)
    );
  }

  const form = formidable({
    multiples: true,
    uploadDir: path.join(
      UPLOAD_DIR,
      url.parse(req.url, true).query.id as string
    ),
    keepExtensions: true,
    encoding: "utf-8",
    filename: (name, ext) => {
      return url.parse(req.url, true).query.filename + ext;
    },
  });

  form.parse(req, (err, fields, files) => {
    //
  });

  return {
    code: 200,
    msg: "文件上传成功",
    data: {
      name: url.parse(req.url, true).query.filename,
      url:
        "/assets/upload/" +
        url.parse(req.url, true).query.id +
        "/" +
        url.parse(req.url, true).query.filename +
        "." +
        url.parse(req.url, true).query.ext,
    },
  };
};
