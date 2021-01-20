import { TableColumnsMap, TableData } from './index-types';
import { Row } from './analysis';
import { ReactInstance } from 'react';

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