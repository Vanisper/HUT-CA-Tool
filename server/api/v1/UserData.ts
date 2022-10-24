import XLSX from "xlsx";
import path from "path";
import { PUBLIC_PATH } from "~~/commons/variables";
import fse from "fs-extra";
import md5 from "md5";
import schema from "~~/public/datas/schema.json";

export default defineHandle((handle) => {
  const { id } = useQuery(handle);
  let studentGrades = [];

  if (!id) {
    return {
      code: 0,
      data: studentGrades,
    };
  }

  /**
   * 原始数据的读取类型：
   * json 直接读取json数据
   * excel  直接读取excel数据
   * excel-json 先读取excel数据然后生成json数据
   */
  const dataTypes = ["json", "excel", "excel-json"] as const;
  const jsonDataPath = path.join(PUBLIC_PATH, "datas/json");
  const excelDataPath = path.join(PUBLIC_PATH, "datas/excel");
  const configPath = path.join(PUBLIC_PATH, "datas/config.json");
  fse.existsSync(jsonDataPath) ? "" : fse.mkdirpSync(jsonDataPath);
  fse.existsSync(excelDataPath) ? "" : fse.mkdirpSync(excelDataPath);
  const targetDataType = dataTypes[2];

  if (targetDataType == "excel-json") {
    if (fse.existsSync(excelDataPath)) {
      const prevFileList = fse
        .readdirSync(excelDataPath, { encoding: "utf-8", withFileTypes: true })
        .filter((v) => v.isFile())
        .map((v) => path.join(excelDataPath, v.name));
      prevFileList.forEach((ex) => {
        // 写入配置文件
        let tSave = [];
        if (fse.pathExistsSync(configPath)) {
          try {
            if (
              fse.readJSONSync(configPath, { encoding: "utf-8" }).length >= 1
            ) {
              tSave = fse.readJSONSync(configPath, { encoding: "utf-8" });
            }
          } catch (error) {
            tSave = [];
          }
        }
        if (tSave.map((v) => v.excelMd5).includes(md5(fse.readFileSync(ex)))) {
          // 已存在数据
          const tIndex = tSave
            .map((v) => v.excelMd5)
            .indexOf(md5(fse.readFileSync(ex)));
          const tJson = path.join(jsonDataPath, tSave[tIndex].label + ".json");
          studentGrades.push(fse.readJsonSync(tJson));
        } else {
          const tempResult = checkSchema(ex);
          if (tempResult.code) {
            fse.writeJsonSync(
              path.join(
                jsonDataPath,
                path.basename(ex, path.extname(ex)) + ".json"
              ),
              tempResult.data,
              {
                spaces: "\t",
              }
            );
            studentGrades.push(tempResult.data);
            tSave.push({
              isOpen: true,
              label: path.basename(ex, path.extname(ex)),
              json:
                "/datas/json/" + path.basename(ex, path.extname(ex)) + ".json",
              excel: "/datas/excel/" + path.basename(ex),
              excelMd5: md5(fse.readFileSync(ex)),
            });
            fse.writeJSONSync(configPath, tSave, { spaces: "\t" });
          }
        }
      });
    }
  }
  if (studentGrades.length > 0) {
    if (studentGrades.flat().filter((v) => v.id == id).length > 0) {
      return {
        code: 1,
        data: studentGrades.flat().filter((v) => v.id == id)[0],
      };
    } else {
      return {
        code: 0,
        data: [],
      };
    }
  } else {
    return {
      code: 0,
      data: studentGrades,
    };
  }
});

function checkSchema(excelPath: string) {
  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  // 表格所有行数
  const workAllRow = parseInt(
    worksheet["!ref"].split(":")[1].replace(/[^0-9]/gi, "")
  );
  // 列数
  const workAllCol =
    worksheet["!ref"].split(":").map((value) =>
      value.replace(/[0-9]/gi, "").length == 1
        ? value.replace(/[0-9]/gi, "").charCodeAt(0) - "A".charCodeAt(0)
        : value
            .replace(/[0-9]/gi, "")
            .split("")
            .map(
              (v, _i, a) =>
                v.charCodeAt(0) - "A".charCodeAt(0) + (a.length - 1) * 26
            )
            .filter((v, i, a) => i == a.length - 1)[0]
    )[1] + 1;
  // 最初的json格式
  const workjson = XLSX.utils.sheet_to_json(worksheet);
  const result: {
    code: number;
    data: { id: string; name: string; courses: any[]; [key: string]: any }[];
  } = {
    code: 0,
    data: [],
  };
  workjson.forEach((item, index, items) => {
    if (Object.keys(workjson[index]).length == workAllCol) {
      // 第一种表格类型：专业总综测表
      if (
        Object.keys(workjson[index])
          .filter((_v, i, a) =>
            [0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
          )
          .join() ===
        Object.keys(schema)
          .filter((_v, i, a) =>
            [0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
          )
          .join()
      ) {
        // 与模板文件比对学生是否符合模板
        const courseInfosKeys = Object.keys(schema)[2]
          .split("，")
          .map((v) => v.match(/(?<=\{)(.+?)(?=\})/g));
        try {
          const resultA = Object.keys(workjson[index])
            .filter(
              (_v, i, a) =>
                ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
            )
            .map((course, courseIdx, courses) => {
              const targetCourseInfosKeys = course.split("，");
              if (courseInfosKeys.length == targetCourseInfosKeys.length) {
                return targetCourseInfosKeys[0];
              } else {
                throw new Error("课程模板不匹配");
              }
            });
          const resultB = Object.keys(workjson[index])
            .filter(
              (_v, i, a) =>
                ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
            )
            .map((course, courseIdx, courses) => {
              const targetCourseInfosKeys = course.split("，");
              if (courseInfosKeys.length == targetCourseInfosKeys.length) {
                return +targetCourseInfosKeys[3].replace(
                  /[\u4e00-\u9fa5 ]/g,
                  ""
                );
              } else {
                throw new Error("课程模板不匹配");
              }
            });
          const resultC = Object.values(workjson[index]).filter(
            (v, i, a) =>
              ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
          );

          // 开始赋值
          result.code = 1;
          result.data.push({
            id: Object.values(workjson[index])[0],
            name: Object.values(workjson[index])[1],
            lowOld: Object.values(workjson[index]).filter(
              (v, i, vs) => i == vs.length - 3
            )[0],
            lowNew: Object.values(workjson[index]).filter(
              (v, i, a) =>
                ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i) &&
                v < 60
            ).length,
            result: Object.values(workjson[index]).filter(
              (v, i, vs) => i == vs.length - 2
            )[0],
            resultT:
              resultB.map((v, i) => v * resultC[i]).reduce((a, b) => a + b) /
              resultB.reduce((a, b) => a + b),
            resultA,
            resultB,
            resultC,
            rank: Object.values(workjson[index]).filter(
              (v, i, vs) => i == vs.length - 1
            )[0],
            courses: Object.keys(workjson[index])
              .filter(
                (_v, i, a) =>
                  ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
              )
              .map((course, courseIdx, courses) => {
                const targetCourseInfosKeys = course.split("，");
                if (courseInfosKeys.length == targetCourseInfosKeys.length) {
                  const targetCourseInfosValues = Object.values(
                    workjson[index]
                  ).filter(
                    (_v, i, a) =>
                      ![
                        0,
                        1,
                        a.length - 1,
                        a.length - 2,
                        a.length - 3,
                      ].includes(i)
                  );
                  return {
                    courseName: targetCourseInfosKeys[0],
                    courseValue: targetCourseInfosValues[courseIdx],
                    courseType: targetCourseInfosKeys[1],
                    isForced: targetCourseInfosKeys[2],
                    courseCredits: targetCourseInfosKeys[3].replace(
                      /[\u4e00-\u9fa5 ]/g,
                      ""
                    ),
                    courseHours: targetCourseInfosKeys[4].replace(
                      /[\u4e00-\u9fa5 ]/g,
                      ""
                    ),
                    coursePeriod: targetCourseInfosKeys[5],
                  };
                } else {
                  throw new Error("课程模板不匹配");
                }
              }),
          });
        } catch (error) {
          result.code = 0;
          result.data = [];
        }
      }
    } else if (Object.keys(workjson[index]).length - workAllCol == -4) {
      if (
        Object.values(workjson[1] as Object)
          .map((value: string, index) => {
            if (value.split("，").length > 1) {
              return value;
            } else {
              return value;
            }
          })
          .filter((_v, i, a) =>
            [0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
          )
          .join() ===
        Object.keys(schema)
          .filter((_v, i, a) =>
            [0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
          )
          .join()
      ) {
        // 与模板文件比对学生是否符合模板
        try {
          const resultB = Object.values(workjson[0]).filter(
            (v, i, a) => i != a.length - 1
          );
          const resultA = Object.values(workjson[1])
            .filter(
              (v, i, a) =>
                ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
            )
            .map((v) => v.split("，")[0]);
          const resultD = Object.values(workjson[1])
            .filter(
              (v, i, a) =>
                ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
            )
            .map((v) => v.split("，")[1]);
          const resultE = Object.values(workjson[1])
            .filter(
              (v, i, a) =>
                ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
            )
            .map((v) => v.split("，")[2]);
          const resultF = Object.values(workjson[1])
            .filter(
              (v, i, a) =>
                ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
            )
            .map((v) => v.split("，")[3].replace(/[\u4e00-\u9fa5 ]/g, ""));
          const resultG = Object.values(workjson[1])
            .filter(
              (v, i, a) =>
                ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
            )
            .map((v) => v.split("，")[4].replace(/[\u4e00-\u9fa5 ]/g, ""));
          const resultH = Object.values(workjson[1])
            .filter(
              (v, i, a) =>
                ![0, 1, a.length - 1, a.length - 2, a.length - 3].includes(i)
            )
            .map((v) => v.split("，")[5]);

          // 详细表格内容
          let detailsAll = [];
          for (let index = 2; index <= workAllRow; index++) {
            if (typeof workjson[index] != "undefined") {
              detailsAll.push(Object.values(workjson[index]));
            }
          }
          const resultC = detailsAll.map(
            (value: Array<string | number>, index) => {
              return value.slice(2, -3).map((val) => +val);
            }
          );
          // 加权平均分(result)
          const gradeResult = detailsAll.map(
            (value: Array<string | number>, index) => {
              return +value.slice(-2, -1)[0];
            }
          );

          // 不及格门数
          const lowGrade = {
            old: detailsAll.map((value: Array<string | number>, index) => {
              return value.slice(-3, -2)[0];
            }),
            new: detailsAll
              .map((value: Array<string | number>, index) => {
                return value.slice(2, -4).map((val) => +val);
              })
              .map((value) => {
                return value.filter((val) => val < 60 && val).length;
              }),
          };
          // 排名
          const gradeRank = {
            default: detailsAll.map((value: Array<string | number>, index) => {
              return +value.slice(-1)[0];
            }),
            verify: gradeResult.map((value, index, array) => {
              return [...array].sort().reverse().indexOf(value) + 1;
            }),
          };
          result.code = 1;
          detailsAll.map((value: Array<string | number>, index) => {
            result.data.push({
              id: detailsAll[index][0] + "",
              name: detailsAll[index][1],
              lowOld: lowGrade.old[index],
              lowNew: lowGrade.new[index],
              result: gradeResult[index],
              resultT: resultC[index]
                .map(
                  (v, i) => (v * +resultB[i]) / resultB.reduce((a, b) => a + b)
                )
                .reduce((a, b) => a + b),
              resultA: resultA,
              resultB: resultB,
              resultC: resultC[index],
              rank: gradeRank.verify[index],
              courses: resultA.map((v, i) => ({
                courseName: v,
                courseValue: resultC[index][i],
                courseType: resultD[i],
                isForced: resultE[i],
                courseCredits: resultF[i],
                courseHours: resultG[i],
                coursePeriod: resultH[i],
              })),
            });
          });
        } catch (error) {
          console.log(error);
          result.code = 0;
          result.data = [];
        }
      }
    }
    return result.code;
  });
  return result;
}
