import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
const __filenameNew = fileURLToPath(import.meta.url);
const __dirnameNew = path.dirname(__filenameNew);

export default () => {
  return {
    code: 1,
    data: studentGrades,
  };
};

const workbook = XLSX.readFile(
  path.join(__dirnameNew, "../../assets/datas/excel.xls")
);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
// console.log("------");
// console.log(worksheet["C1"]);
// console.log(worksheet["!range"]);
// console.log(worksheet["!merges"]);
// 表格所有行数
const workAllLine = parseInt(
  worksheet["!ref"].split(":")[1].replace(/[^0-9]/gi, "")
);
// 最初的json格式
const workjson = XLSX.utils.sheet_to_json(worksheet);
// 权重、学分
const weighted = Object.values(workjson[0] as Object).map((value) => +value);
// 表格主标题
const filetitle = Object.keys(workjson[1] as Object)[0];
// 表头
const tabletitle = Object.values(workjson[1] as Object).map(
  (value: string, index) => {
    if (value.split("，").length > 1) {
      return value.split("，")[0];
    } else {
      return value;
    }
  }
);
// 详细表格内容
let detailsAll = [];
for (let index = 2; index <= workAllLine; index++) {
  if (typeof workjson[index] != "undefined") {
    detailsAll.push(Object.values(workjson[index]));
  }
}
// 课程列表
const gradeList = tabletitle.splice(2, 17);
// 成绩数据
const detailsGrade = detailsAll.map((value: Array<string | number>, index) => {
  return value.slice(2, -4).map((val) => +val);
});
// 加权平均分(result)
const gradeResult = detailsAll.map((value: Array<string | number>, index) => {
  return +value.slice(-3, -2)[0];
});
// 不及格门数
const lowGrade = {
  old: detailsAll.map((value: Array<string | number>, index) => {
    return value.slice(-4, -3)[0];
  }),
  new: detailsGrade.map((value) => {
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

const studentGrades = detailsAll.map((value: Array<string | number>, index) => {
  return {
    id: +value[0],
    name: value[1] as string,
    grades: detailsGrade[index],
    gradeList: gradeList,
    gradeWeighted: weighted,
    lowGradeOldCount: lowGrade.old[index],
    lowGradeNewCount: lowGrade.new[index],
    gradeResult: gradeResult[index],
    gradeRank: gradeRank.default[index],
  };
});
