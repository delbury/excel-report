import { TableColumnsMap } from './index';

// 公式预处理
const pretreatFormula = function (formula: string): string {
  formula = formula.replace(/\s/g, '');

  return formula;
};

// 校验公式
export const validateFormula = function (formula: string): boolean {
  if (!formula) return false;
  if(/([^a-zA-Z0-9+\-*/\s^])/.test(formula)) return false;

  return true;
};

// 公式格式化显示
export const formatFormula = function (map: TableColumnsMap, formula: string): string {
  if (!map) return '';
  formula = pretreatFormula(formula).replace(/[A-z]+/g, (matched) => {
    return map.get(matched)?.title?.toString() || '';
  });

  console.log(formula);
  return formula;
};

// 计算公式
export const resolveFormula = function (formula: string, rowObjName: string = 'rowObj'): string {
  if (!formula) return '';
  formula = pretreatFormula(formula).replace(/[A-z]+/g, (matched) => {
    return `${rowObjName}.${matched}`;
  });

  console.log(formula);
  return formula;
};
