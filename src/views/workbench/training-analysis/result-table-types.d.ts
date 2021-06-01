import { TableDataRow } from '../index-types';

interface Common {
  unitName: string;
  remarks?: Set<string>;
  remarksText?: string;
  isCondition?: boolean;
}
export interface TableDataRowBasisA extends Common {
  trainProjectCount: number;
  trainPersonCount: number;
  theoryHours: number;
  practiceHours: number;
  remarks?: Set<string>;
  remarksText?: string;
};
export interface TableDataRowA extends TableDataRowBasisA, TableDataRow { };

export interface TableDataRowBasisB extends Common {
  type: 'M' | 'P';
  station: string;
  month: number;
  nowPersonCount?: number;
  trainHours: number;
  trainCount: number;
  trainPersonCount: number;
  averTrainHours?: number;
  yearAverHours?: number;
  completeRate?: number;
};
export interface TableDataRowB extends TableDataRowBasisB, TableDataRow { }

export interface TableDataRowBasisC extends Common {
  personCount?: number;
  personCourseCount: number;
  rate?: number;
  totalHours: number;
  averHours?: number;
}
export interface TableDataRowC extends TableDataRowBasisC, TableDataRow { }

export interface TableDataRowBasisD extends Common {
  projectCount: number;
  assessCount: number;
  passedCount: number;
  failedCount: number;
  theoryCount: number;
  trainCount: number;
  passedRate?: number;
  remarks?: Set<string>;
  remarksText?: string;
}
export interface TableDataRowD extends TableDataRowBasisD, TableDataRow { }

export type TableDataRowKinds = TableDataRowA | TableDataRowB | TableDataRowC | TableDataRowD