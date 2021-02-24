import { TableColumnsMap, TableData, TableColumns, TableDataRow, TableColumn } from './index-types';
import { ResolvedDataType } from './result-cross-table/index-types';
import { Row } from './analysis';
import { ReactInstance } from 'react';
import XLSX, { WorkBook, WorkSheet, ColInfo } from 'xlsx';
import React from 'react';

// 公式预处理
const pretreatFormula = function (formula: string): string {
  // formula = formula.replace(/\s/g, '');

  return formula;
};

// 公式格式化显示
const COL_MATCH_REG = /(?<=^|\+|-|\*|\/|\\|\^|\.|\(|\)|\[|\]|,|\s)([A-Z]+)(?=$|\+|-|\*|\/|\\|\^|\.|\(|\)|\[|\]|,|\s)/g;
export const formatFormula = function (map: TableColumnsMap, formula: string): string {
  if (!map) return '';
  formula = pretreatFormula(formula).replace(COL_MATCH_REG, (matched, col) => {
    return map.get(col)?.title?.toString() || '';
  });

  return formula;
};

// 计算公式
const ROW_OBJ_NAME = 'rowObj';
export const resolveFormula = function (formula: string, rowObjName: string = ROW_OBJ_NAME): string {
  if (!formula) return '';
  formula = pretreatFormula(formula).replace(COL_MATCH_REG, (matched, col) => {
    return `${rowObjName}.${col}`;
  });

  return formula;
};

// 校验公式
export const validateFormula = function (formula: string, row: Row, map: TableColumnsMap, data: TableData): boolean | string {
  if (!formula) return false;
  if(/([^a-zA-Z0-9+\-*/\s^.()',\[\]])/.test(formula)) return false;

  const resolvedFormula = resolveFormula(formula);
  const rowObj = data[0];
  console.log(resolvedFormula);
  try {
    const res = eval(resolvedFormula);
    return res;
  } catch (err) {
    return false;
  }

};


// 生成 excel sheet
export const generateExcelSheet = (
  columns: TableColumns<any>,
  data: TableDataRow[],
  additionalRows?: string[]
): WorkSheet => {

  const map: Map<string, string> = new Map();
  const res: any = [];
  const colInfos: ColInfo[] = [];
  columns.filter(item => /^[^_]/.test((item.dataIndex ?? '').toString())).forEach((item, index) => {
    const title: string = item.titleName.toString();
    map.set((item.key ?? '').toString(), title);
    colInfos.push({
      wpx: Number(item.width ?? 100),
    });
  });

  data.forEach(item => {
    const obj: any = {};
    for (let [key, val] of map.entries()) {
      obj[val] = item[key];
    }
    res.push(obj);
  });

  if (additionalRows) {
    res.push({}); // 插入空行

    const firstKey = map.values().next().value;
    additionalRows.forEach(msg => res.push({ [firstKey]: msg }));
  }

  const sheet = XLSX.utils.json_to_sheet(res);
  sheet['!cols'] = colInfos;
  return sheet;
};

// 导出 excel 文件
interface ExportParam {
  sheetName: string; // 表名
  columns: TableColumns<any>; // 表头
  data: TableDataRow[]; // 表格数据
  additionalRows?: string[]; // 附加行
}
export const exportExcelFile = (params: ExportParam[], fileName: string = '导出结果') => {
  const wb = XLSX.utils.book_new();

  params.forEach((item) => {
    const sheet = generateExcelSheet(item.columns, item.data, item.additionalRows);
    XLSX.utils.book_append_sheet(wb, sheet, item.sheetName);
  });

  XLSX.writeFile(wb, `${fileName}.xlsx`);
};


// 加载 excel 文件
export const loadFile = (file: File | Blob): Promise<WorkBook> => {
  return new Promise((resolve, reject) => {
    const fileReader: FileReader = new FileReader();
  
    // 加载完成
    fileReader.onload = ev => {
      const workbook = XLSX.read(fileReader.result, {
        type: 'array',
        // cellDates: true
      });
  
      resolve(workbook);
    };

    fileReader.onerror = ev => {
      reject(ev);
    };
    
    fileReader.readAsArrayBuffer(file); // 读取文件
  });
};

// 生成 sheet table 数据
const createTableData = (
  sheet: WorkSheet,
  {
    ref = sheet?.['!autofilter']?.ref ?? sheet?.['!ref'] ?? '',
    hasHeader = true,
    hasBody = true,
  }: { ref?: string, hasHeader?: boolean, hasBody?: boolean } = {}
) => {
  if (!ref) return { header: [], body: [] };

  const range = XLSX.utils.decode_range(ref); // 当前 sheet 的数据范围

  // 去除有合并的单元格行
  const mergeRows: Set<number> = new Set();
  if (sheet['!merges']) {
    sheet['!merges'].forEach(rg => {
      for (let i = rg.s.r; i <= rg.e.r; i++) {
        mergeRows.add(i);
      }
    });
  }

  // 过滤存在合并的行
  const validRows: Set<number> = new Set();
  for (let i = range.s.r; i <= range.e.r; i++) {
    if (!sheet['A' + (i + 1)]) break;
      
    if (!mergeRows.has(i)) {
      validRows.add(i + 1);
    }
  }

  // 过滤空列，第一行的最长连续非空区域
  const firstRow: number = validRows.values().next().value;
  const validCols: Set<string> = new Set();
  for (let i = range.s.c; i <= range.e.c; i++) {
    const col: string = XLSX.utils.encode_col(i);
    if (sheet[col + firstRow]) {
      validCols.add(col);
    } else {
      break;
    }
  }

  // 构造表头、hash
  const header: TableColumns = [];
  // const headerMap: TableColumnsMap = new Map();
  if (hasHeader) {
    for (let col of validCols.values()) {
      const key = col + firstRow;
      const title = sheet[key].w + `(${col})`;
      const length = title.length;
      const obj: TableColumn = {
        titleName: title,
        title,
        key: col,
        dataIndex: col,
        width: `calc(${(length >= 4 ? length : 4) + 'em'} + 17px)`,
        ellipsis: true,
      };
      header.push(obj);
      // headerMap.set(col, obj);
    }
  }

  // 构造表数据
  const body: TableData = [];
  // 行
  if (hasBody) {
    const rows = validRows.values();
    rows.next(); // 去除表头
    for (let r of rows) {
      const rowData: TableDataRow = { id: r + '' };
      
      // 列
      for (let c of validCols.values()) {
        if (sheet[c + r]?.t === 'd') {
          rowData[c] = sheet[c + r].v.toLocaleDateString();
        } else {
          rowData[c] = sheet[c + r]?.w ?? '';
        }
      }
  
      body.push(rowData);
    }
  }

  return {
    header,
    body,
  };
};

interface GenerateSheetDataReturnType {
  header: TableColumns;
  body: TableDataRow[];
}
// 构造表数据
export const generateSheetData = (workbook: WorkBook, sheetName: string = workbook.SheetNames[0]): GenerateSheetDataReturnType  => {
  const sheet = workbook.Sheets[sheetName];
  const ref: string = sheet?.['!autofilter']?.ref ?? sheet?.['!ref'] ?? '';

  // 空表
  if (!ref) {
    return {
      header: [],
      body: [],
    };
  }

  const { header, body } = createTableData(sheet, { ref, hasHeader: false });
  
  return { header, body };
};


// 从 excel 生成 table datas
type GetTableDatasFromExcelReturnType = Map<string, TableDataRow[]>
export const getTableDatasFromExcel = async (file: File | Blob | undefined): Promise<GetTableDatasFromExcelReturnType> => {
  const resultMap: GetTableDatasFromExcelReturnType = new Map();
  
  if (!file) return resultMap;

  try {
    const workbook = await loadFile(file);
    workbook.SheetNames.forEach(name => {
      resultMap.set(name, generateSheetData(workbook, name).body);
    });
  } catch {
    //
  }

  return resultMap;
};
