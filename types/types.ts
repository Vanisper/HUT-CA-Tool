import { FormItemRule, UploadUserFile } from "element-plus";

export interface IstudentGrade {
  id: number;
  name: string;
  grades: number[];
  gradeList: string[];
  gradeWeighted: number[];
  lowGradeOldCount: string | number;
  lowGradeNewCount: number;
  gradeResult: number;
  gradeRank: number;
}

export interface IuserInfoItem<T> {
  label: string;
  value: T;
  rules: FormItemRule[];
}
export interface IuserInfos {
  school: IuserInfoItem<string>;
  college: IuserInfoItem<string>;
  professional: IuserInfoItem<string>;
  class: IuserInfoItem<number>;
  id: IuserInfoItem<number>;
  name: IuserInfoItem<string>;
}

// 评定细则
export interface IruleContents {
  rule: string;
  scoreItem: string | string[];
  desc?: string;
  example?: string[];
}
export interface IcommonRuleItems {
  ruleItem: string;
  label: string;
  scoresMax?: number;
  description: string[];
  isBasic?: boolean;
  content: IruleContents[];
}

export interface IcomplexRuleItems {
  ruleItem: string;
  label: string;
  scoresMax?: number;
  description: string[];
  isBasic?: boolean;
  contentCOX: IcommonRuleItems[];
}

export interface IACRule {
  ruleName: "qualities" | "wisdom" | "innovation-practice";
  label: string;
  description: string;
  scores: number;
  weighted: number;
  mode: "subtract" | "default" | "add";
  items: IcomplexRuleItems[] | IcommonRuleItems[];
}

export interface ICPResultItem {
  type: string;
  name: string;
  level: string;
  time: string[];
  file: UploadUserFile[];
}

export interface ICPExport {
  formResult: ICPResultItem[][];
  label: string;
  scores: number;
  result: number;
  resultT: number;
  weighted: number;
  resultGroup: { type: string; total: number }[];
  resultGroupT: { type: string; total: number }[];
}

export interface ICPExportWithUser {
  formResult: ICPResultItem[][];
  label: string;
  scores: number;
  result: number;
  resultT: number;
  weighted: number;
  resultGroup: { type: string; total: number }[];
  resultGroupT: { type: string; total: number }[];
  user: string;
}
