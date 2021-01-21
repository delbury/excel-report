import XLSX, { WorkBook, WorkSheet } from 'xlsx';

const USELESS_LINES = 8; // 表头多余行
// 列数据对应
export enum EnumColumns {
  Name = 'B', // 姓名
  Phone = 'C', // 手机
  Score = 'D', // 得分
  Pass = 'E', // 是否通过
  Time = 'F', // 交卷时间
  Duration = 'G', // 考试用时
  Code = 'H', // 员工编码
}
export interface ResolvedDataType {
  [key: string]: EnumColumns
} 

// 解析成绩 excel 文件
export const resolveScoreExcelFile = (file: File | Blob): Promise<{}[]> => {
  return new Promise((resolve, reject) => {
    const fileReader: FileReader = new FileReader();
  
    // 加载完成
    fileReader.onload = ev => {
      const workbook = XLSX.read(fileReader.result, {
        type: 'array',
        // cellDates: true
      });
  
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const resolvedData = XLSX.utils.sheet_to_json<ResolvedDataType>(sheet, {
        range: USELESS_LINES, // 去除表头行
        header: 'A',
      });

      resolve(resolvedData);
    };

    fileReader.onerror = ev => {
      reject(new Error('load file error'));
    };
    
    fileReader.readAsArrayBuffer(file); // 读取文件

  });
};

// 过滤一次提交的成绩和二次提交的成绩
interface SeparateScoreDateTimesReturnType {
  first: ResolvedDataType[];
  second: ResolvedDataType[];
}
export const separateScoreDateTimes = (totalData: ResolvedDataType[]): SeparateScoreDateTimesReturnType => {
  // 按时间排序，升序
  totalData.sort((a, b) => {
    if (a[EnumColumns.Time] > b[EnumColumns.Time]) {
      return 1;
    } else if (a[EnumColumns.Time] < b[EnumColumns.Time]) {
      return -1;
    }
    return 0;
  });

  // 过滤一次提交、二次提交的成绩
  const hashSet1: Set<string> = new Set(); // 一次提交的 hash
  const hashSet2: Set<string> = new Set(); // 二次提交的 hash
  const resultData1: ResolvedDataType[] = []; // 一次提交的成绩数据
  const resultData2: ResolvedDataType[] = []; // 二次提交的成绩数据
  for (let item of totalData) {
    const hash: string = item[EnumColumns.Name] + item[EnumColumns.Phone]; // 构造 hash，名字 + 手机
    if (hashSet1.has(hash)) {
      // 非第一次提交
      if (!hashSet2.has(hash)) {
        // 第二次提交
        hashSet2.add(hash);
        resultData2.push(item);
      }
    } else {
      // 第一次提交
      hashSet1.add(hash);
      resultData1.push(item);
    }
  }

  return {
    first: resultData1,
    second: resultData2,
  };
};
