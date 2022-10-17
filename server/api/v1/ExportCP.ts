import fse from "fs-extra";
import path from "path";
import url, { fileURLToPath } from "url";
import archiver from "archiver";

const __filenameNew = fileURLToPath(import.meta.url);
const __dirnameNew = path.dirname(__filenameNew);
const UPLOAD_DIR = path.resolve(__dirnameNew, "../../assets/upload");

export default defineEventHandler(async (event) => {
  const body = await useBody(event);
  const { user } = body;
  const tempPath = path.join(UPLOAD_DIR, user);
  const exportPath = path.join(UPLOAD_DIR, "export/zip");
  if (!fse.existsSync(exportPath)) {
    fse.mkdirsSync(exportPath);
  }

  if (fse.existsSync(tempPath)) {
    const jsonSave = fse.createWriteStream(path.join(tempPath, "infos.json"));
    jsonSave.write(JSON.stringify(body), "utf-8");
    jsonSave.end();

    // 打包文件夹
    const imageSave = fse.createWriteStream(
      path.join(exportPath, `${user}.zip`)
    );
    const archive = archiver("zip");
    archive.pipe(imageSave);
    archive.directory(tempPath, false);
    archive.finalize();
  }

  return { body };
});
