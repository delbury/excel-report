import React, { useState, useEffect } from 'react';
import { TableColumns, TableDataRow, TableColumnsMap, ColumnsType } from '../index-types';
import { Button, Tooltip, Table, Upload, Badge, message, Radio, Popover } from 'antd';
import { RcFile, UploadProps, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { InfoCircleOutlined, UploadOutlined, DownloadOutlined, SelectOutlined } from '@ant-design/icons';
import { TableDataRowNameList } from './columns-types';
import { getColumnsNameList } from './columns';
import { sheetFieldMap } from './sheet-fields-map';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '@/redux/actions/global';
import { resolveScoreExcelFile, separateScoreDateTimes } from './resolve-excel';
import UnmatchedModal from './unmatched-modal';
import ChartsModal from './charts-modal';
import {
  DataCachesType,
  UnmatchedCachesType,
  ResolvedDataTypeMap,
  ResolvedDataType,
} from './index-types';
import { EnumTimes, EnumColumns } from './enums';
import { exportExcelFile, getTableDatasFromExcel } from '../tools';
import DelVirtualTable from '@/components/del-virtual-table';
// type FilteredDataMap = Map<string, TableDataRowNameList[]>;

const ONLY_MATCH_PHONE: boolean = true;
  
interface IProps {
  className?: string;
  outerData: TableDataRow[];
  outerColumns: TableColumns;
  currentSheetName: string;
  toggleLoading: (status?: boolean) => void;
}

const ResultCrossTable: React.FC<IProps> = function (props: IProps) {
  const [tableDataNameList, setTableDataNameList] = useState<TableDataRowNameList[]>([]); // 数据列表
  // const [filteredDataMap, setFilteredDataMap] = useState<FilteredDataMap>(new Map());
  const [fileList, setFileList] = useState<UploadFile[]>([]); // 成绩文件列表
  const [timesScores, setTimesScores] = useState<EnumTimes>(EnumTimes.First); // 第几次提交
  const [separatedData, setSeparatedData] = useState<ResolvedDataTypeMap | null>(null);
  const [unmatchedDataCount, setUnmatchedDataCount] = useState<[number, number]>([0, 0]); // 是否有未匹配的成绩
  const [dataCahces, setDataCaches] = useState<DataCachesType>({ first: [], second: [] });
  const [unmatchedCaches, setUnmatchedCaches] = useState<UnmatchedCachesType>({ first: [], second: [] });
  const [namesFileListA, setNamesFileListA] = useState<UploadFile[]>([]); // 车间花名册
  const [namesFileListB, setNamesFileListB] = useState<UploadFile[]>([]); // 委外花名册

  let idCount: number = Date.now();
  /** 
  // 生成名单，单张表
  const handleGenerateNameList = () => {
    props.toggleLoading(true);

    setTimeout(() => {
      const map = sheetFieldMap.get(props.currentSheetName);
      if (!map) return;
  
      const list: TableDataRowNameList[] = props.outerData.map(item => ({
        id: (idCount++).toString(),
        unitName: item[map.unitName],
        name: item[map.name],
        phone: item[map.phone],
        station: item[map.station],
      }));
  
      setTableDataNameList(list);
      props.toggleLoading(false);
    }, 0);
  };
  */

  // 生成全部名单
  const handleGenerateTotalNameList = () => {
    if (!namesFileListA.length && !namesFileListB.length) {
      return message.warning('请先选择车间和委外的花名册！');
    }

    props.toggleLoading(true);

    setTimeout(async () => {
      const dataMapWorkshop = await getTableDatasFromExcel(namesFileListA[0]?.originFileObj);
      const dataMapOutsource = await getTableDatasFromExcel(namesFileListB[0]?.originFileObj);

      if (!dataMapWorkshop.size && !dataMapOutsource.size) {
        props.toggleLoading(false);
        return;
      }

      // const tempFilteredDataMap: FilteredDataMap = new Map();
      const dataMaps = [dataMapWorkshop, dataMapOutsource];
      const list: TableDataRowNameList[] = [];
      for (let itemIndex in dataMaps) {
        const dataMap = dataMaps[itemIndex]; // 0：车间，1：委外

        for (let [sheetName, data] of dataMap.entries()) {
          const keyMap = sheetFieldMap.get(itemIndex === '0' ? '车间' : sheetName);
          const tempArr: TableDataRowNameList[] = [];
          // tempFilteredDataMap.set(sheetName, tempArr);
          if (keyMap) {
            data.forEach(item => {
              let unitName = '';
              if (itemIndex === '0') {
                const arr = item[keyMap.unitName].split('/');
                unitName = arr[arr.length - 1];
              } else {
                unitName = item[keyMap.unitName];
              }
              const tempObj = {
                id: (idCount++).toString(),
                unitName,
                name: item[keyMap.name],
                phone: item[keyMap.phone],
                station: item[keyMap.station],
                isOutsource: itemIndex === '1',
              };
              tempArr.push(tempObj);
              list.push(tempObj);
            });
          }
        }
      }
      // setFilteredDataMap(tempFilteredDataMap);
      setTableDataNameList(list);
      props.toggleLoading(false);

    }, 0);

  };

  // 确认导入
  const resolveScoreExcelFiles = async () => {
    if (!tableDataNameList.length) {
      return message.warning('请先生成名单！');
    }

    if (!fileList.length) {
      return message.warning('请先导入成绩excel！');
    }

    props.toggleLoading(true);
    try {
      // 整合所有成绩
      const totalData: ResolvedDataType[] = [];
      let idCount: number = Date.now();
      for (let item of fileList) {
        if (item.originFileObj) {
          const data = await resolveScoreExcelFile(item.originFileObj);
          totalData.push(...data);
        }
      }

      const timesData = separateScoreDateTimes(totalData);
      setSeparatedData(timesData);

      const map: Map<string, TableDataRowNameList> = new Map(); // hash 用于搜索优化
      // 计算1次提交成绩
      const unmatchedFirstData: ResolvedDataType[] = []; // 在名单内未匹配到的分数
      const firstData: TableDataRowNameList[] = JSON.parse(JSON.stringify(tableDataNameList));
      if (timesData.first) {
        firstData.forEach(item => map.set(
          ONLY_MATCH_PHONE ? item.phone : item.name + item.phone,
          item
        )); // map 化，优化处理速度
        
        timesData.first.forEach(item => {
          const hash: string = ONLY_MATCH_PHONE ?
            item[EnumColumns.Phone] : item[EnumColumns.Name] + item[EnumColumns.Phone]; // 匹配条件

          item.id = (idCount++).toString();
          if (map.has(hash)) {
            const row = map.get(hash);
            if (row) {
              row.score = Number(item[EnumColumns.Score]);
              row.result = item[EnumColumns.Pass];
            }
          } else {
            unmatchedFirstData.push(item);
          }
        });
      }

      // 计算2次提交成绩
      map.clear();
      const unmatchedSecondData: ResolvedDataType[] = []; // 在名单内未匹配到的分数
      const secondData: TableDataRowNameList[] = JSON.parse(JSON.stringify(tableDataNameList));
      if (timesData.second) {
        secondData.forEach(item => map.set(
          ONLY_MATCH_PHONE ? item.phone : item.name + item.phone,
          item,
        )); // map 化，优化处理速度
        
        timesData.second.forEach(item => {
          const hash: string = ONLY_MATCH_PHONE ?
            item[EnumColumns.Phone] : item[EnumColumns.Name] + item[EnumColumns.Phone]; // 匹配条件
          
          item.id = (idCount++).toString();
          if (map.has(hash)) {
            const row = map.get(hash);
            if (row) {
              row.score = Number(item[EnumColumns.Score]);
              row.result = item[EnumColumns.Pass];
            }
          } else {
            unmatchedSecondData.push(item);
          }
        });
      }

      // 保存合并后的数据缓存
      setDataCaches({
        first: firstData,
        second: secondData,
      });

      // 设置未匹配成绩的缓存
      setUnmatchedCaches({
        first: unmatchedFirstData,
        second: unmatchedSecondData,
      });
      
      // 设置未匹配条数角标数字
      setUnmatchedDataCount([unmatchedFirstData.length, unmatchedSecondData.length]);
      if (timesScores === EnumTimes.First) {
        setTableDataNameList(firstData);
      } else if(timesScores === EnumTimes.Second) {
        setTableDataNameList(secondData);
      }

    } catch {
      //
    } finally {
      props.toggleLoading(false);
    }
  };

  // 生成表头
  const columnsNameList = getColumnsNameList((record, index) => {
    if (!record) return;

    console.log(record);
  });

  return (
    <div className={`workbench-result ${props.className}`}>
      <div className="workbench-result-toolbar">
        <div className="workbench-result-btns">
          <Button.Group size="small">
            <Button type="primary" onClick={() => handleGenerateTotalNameList()}>生成名单</Button>

            <Popover
              title="选择花名册"
              placement="bottomLeft"
              trigger={['click']}
              content={
                <div className="workbench-result-uploads-box">
                  {/* 车间花名册 */}
                  <Upload
                    accept=".xlsx, .xls"
                    fileList={namesFileListA}
                    beforeUpload={() => false}
                    className="upload"
                    onChange={ev => {
                      const fileList: UploadFile[] = ev.fileList.slice(-1);
                      setNamesFileListA(fileList);
                    }}
                  >
                    <Button size="small" icon={<UploadOutlined />}>选择车间花名册</Button>
                  </Upload>

                  {/* 委外花名册 */}
                  <Upload
                    accept=".xlsx, .xls"
                    fileList={namesFileListB}
                    beforeUpload={() => false}
                    className="upload"
                    onChange={ev => {
                      const fileList: UploadFile[] = ev.fileList.slice(-1);
                      setNamesFileListB(fileList);
                    }}
                  >
                    <Button size="small" icon={<UploadOutlined />}>选择委外花名册</Button>
                  </Upload>
                </div>
              }>
              <Button icon={<SelectOutlined />}>选择</Button>
            </Popover>
          </Button.Group>

          {/* <Tooltip
            title="需先导入选择花名册"
            placement="top"
          >
            <InfoCircleOutlined />
          </Tooltip> */}

          <Upload
            accept=".xlsx, .xls"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={ev => setFileList(ev.fileList)}
            multiple
            className={`workbench-result-upload${fileList.length ? '' : ' is-empty'}`}
          >
            <Badge count={fileList.length} size="small" offset={[-8, -1]}>
              <Button size="small" icon={<UploadOutlined />}>选择成绩文件</Button>
            </Badge>
          </Upload>

          <Button size="small" type="primary" onClick={() => resolveScoreExcelFiles()}>确认导入</Button>
          {
            separatedData ?
              <>
                <Radio.Group
                  options={[
                    { label: '一次提交', value: EnumTimes.First },
                    { label: '二次提交', value: EnumTimes.Second },
                  ]}
                  value={timesScores}
                  optionType="button"
                  size="small"
                  onChange={(ev) => {
                    setTimesScores(ev.target.value);
                    props.toggleLoading(true);
                    if (ev.target.value === EnumTimes.First ) {
                      setTableDataNameList(dataCahces.first);
                    } else if(ev.target.value === EnumTimes.Second ) {
                      setTableDataNameList(dataCahces.second);
                    }
                    setTimeout(() => props.toggleLoading(false), 0);
                  }}
                ></Radio.Group>

                <UnmatchedModal
                  matchecData={dataCahces}
                  unmatchedDataCount={unmatchedDataCount}
                  unmatchedData={unmatchedCaches}
                ></UnmatchedModal>

                <ChartsModal
                  datas={dataCahces}
                ></ChartsModal>

                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => exportExcelFile([
                    {
                      sheetName: '一次提交成绩单',
                      columns: columnsNameList,
                      data: dataCahces.first,
                    },
                    {
                      sheetName: '二次提交成绩单',
                      columns: columnsNameList,
                      data: dataCahces.second,
                    },
                  ], '完整成绩单')}
                >导出成绩</Button>
              </> : null
          }
        </div>
      </div>

      <div className="workbench-result-tables">
        <Table
          columns={columnsNameList}
          dataSource={tableDataNameList}
          size="small"
          bordered
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          sticky
        >
        </Table>
      </div>
    </div>
  );
};

// export default ResultCrossTable;

const dispatchToProps = (dispatch: Dispatch) => {
  return {
    toggleLoading: (status?: boolean) => dispatch(actions.toggleGlobalLoading(status)),
  };
};
export default connect(undefined, dispatchToProps)(ResultCrossTable);