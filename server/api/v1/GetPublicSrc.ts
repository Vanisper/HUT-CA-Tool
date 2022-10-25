import { PUBLIC_PATH } from "~~/commons/variables";
import fse from "fs-extra";
import ppath from "path";
import { prevBase64 } from "~~/utils";

export default defineHandle((event) => {
  const { path } = useQuery(event);

  if (path && fse.existsSync(ppath.join(PUBLIC_PATH, path as string))) {
    const srcFullPath = ppath.join(PUBLIC_PATH, path as string);
    const prev = prevBase64(ppath.extname(path as string));
    return {
      path,
      prev,
      name: ppath.basename(path as string, ppath.extname(path as string)),
      ext: ppath.extname(path as string),
      data: fse.readFileSync(srcFullPath, { encoding: "base64" }),
    };
  }

  return {
    path,
  };
});
