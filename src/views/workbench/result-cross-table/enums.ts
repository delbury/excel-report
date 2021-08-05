export enum EnumTimes { First, Second };

// 成绩文件列数据对应
export const enumColumns = {
  // Name: 'B', // 姓名
  // Phone: 'C', // 手机
  // Score: 'D', // 得分
  // Pass: 'E', // 是否通过
  // Time: 'F', // 交卷时间
  // Duration: 'G', // 考试用时
  // Code: 'H', // 员工编码
  // Major: 'I', // 所属专业
  // Unit: 'J', // 所在单位
  Name: 'C', // 姓名
  Phone: 'E', // 手机
  Score: 'L', // 得分
  Pass: 'M', // 是否通过
  Time: 'I', // 交卷时间
  Duration: 'K', // 考试用时
  Code: '', // 员工编码
  Major: '', // 所属专业
  Unit: '', // 所在单位
};

export type EnumColumns = typeof enumColumns;