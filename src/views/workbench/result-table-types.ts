import { TableDataRow } from './index';

export interface TableDataRowBasisA {
  trainProjectCount: number;
  trainPersonCount: number;
  theoryHours: number;
  practiceHours: number;
  unitName: string;
};
export interface TableDataRowA extends TableDataRowBasisA, TableDataRow { };

export interface TableDataRowBasisB {
  type: 'M' | 'P';
  unitName: string;
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

export interface TableDataRowBasisC {
  unitName: string;
  personCount?: number;
  personCourseCount: number;
  rate?: number;
  totalHours: number;
  averHours?: number;
}
export interface TableDataRowC extends TableDataRowBasisC, TableDataRow { }

export interface TableDataRowBasisD {
  unitName: string;
  projectCount: number;
  assessCount: number;
  passedCount: number;
  failedCount: number;
  theoryCount: number;
  trainCount: number;
}
export interface TableDataRowD extends TableDataRowBasisD, TableDataRow { }