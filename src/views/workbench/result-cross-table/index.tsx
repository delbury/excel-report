import React, { useState, useEffect, useMemo } from 'react';
import { TableColumns, TableDataRow, TableColumnsMap, ColumnsType } from '../index-types';
import { Button, Tooltip, Table, Upload, Badge, message, Radio, Popover, Select, Input } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { UploadOutlined, DownloadOutlined, SelectOutlined } from '@ant-design/icons';
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

interface SeparatedDataType {
  first: Map<string, ResolvedDataType>;
  second: Map<string, ResolvedDataType>;
}

const ResultCrossTable: React.FC<IProps> = function (props: IProps) {
  const [tableDataNameList, setTableDataNameList] = useState<TableDataRowNameList[]>([]); // 数据列表
  const [filteredNameList, setFilteredNameList] = useState<TableDataRowNameList[]>([]); // 搜索过滤后的数据列表
  // const [filteredDataMap, setFilteredDataMap] = useState<FilteredDataMap>(new Map());
  const [fileList, setFileList] = useState<UploadFile[]>([]); // 成绩文件列表
  const [timesScores, setTimesScores] = useState<EnumTimes>(EnumTimes.First); // 第几次提交
  const [separatedData, setSeparatedData] = useState<SeparatedDataType | null>(null);
  const [dataCaches, setDataCaches] = useState<DataCachesType>({ first: [], second: [] });
  const [unmatchedCaches, setUnmatchedCaches] = useState<UnmatchedCachesType>({ first: [], second: [] });
  const [namesFileListA, setNamesFileListA] = useState<UploadFile[]>([]); // 车间花名册
  const [namesFileListB, setNamesFileListB] = useState<UploadFile[]>([]); // 委外花名册
  const [unitNameSelectOptions, setUnitNameSelectOptions] = useState<{ label: string; value: string; }[]>([]); // 单位选择项

  // 查询条件
  const [searchIsMatched, setSearchIsMatched] = useState<string>(); // 是否匹配
  const [searchUnitName, setSearchUnitName] = useState<string>(); // 选择单位
  const [searchName, setSearchName] = useState<string>(); // 姓名
  const [searchPhone, setSearchPhone] = useState<string>(); // 手机号码
  const [searchStation, setSearchStation] = useState<string>(); // 岗位

  let idCount: number = Date.now(); // 全局 id

  // 未匹配的数量
  const unmatchedDataCount = useMemo<[number, number]>(() => ([
    unmatchedCaches.first.length,
    unmatchedCaches.second.length,
  ]), [unmatchedCaches]);

  // 生成全部名单
  const handleGenerateTotalNameList = () => {
    if (!namesFileListA.length && !namesFileListB.length) {
      return message.warning('请先选择车间和委外的花名册！');
    }

    props.toggleLoading(true);

    setTimeout(async () => {
      const unitNameSet: Set<string> = new Set(); // 保存所有不同的 unitName
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
              unitNameSet.add(unitName);
              const tempObj = {
                id: (idCount++).toString(),
                unitName,
                name: item[keyMap.name],
                phone: item[keyMap.phone],
                station: item[keyMap.station],
                isOutsource: itemIndex === '1',
                isMatched: false,
              };
              tempArr.push(tempObj);
              list.push(tempObj);
            });
          }
        }
      }
      // setFilteredDataMap(tempFilteredDataMap);
      handleFilterNameList(list);
      const selectOptions: { label: string; value: string }[] = [];
      for (let name of unitNameSet.keys()) {
        selectOptions.push({ label: name, value: name });
      }
      setUnitNameSelectOptions(selectOptions);
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

      // 生成 id
      totalData.forEach(item => item.id = (idCount++).toString());

      const timesData = separateScoreDateTimes(totalData);
      const firstTimeDataMap: Map<string, ResolvedDataType> = new Map();
      const secondTimeDataMap: Map<string, ResolvedDataType> = new Map();
      timesData.first.forEach(item => firstTimeDataMap.set(item.id as string, item));
      timesData.second.forEach(item => secondTimeDataMap.set(item.id as string, item));
      setSeparatedData({
        first: firstTimeDataMap,
        second: secondTimeDataMap,
      });

      const map: Map<string, TableDataRowNameList> = new Map(); // hash 用于搜索优化
      // 计算1次提交成绩
      const unmatchedFirstData: ResolvedDataType[] = []; // 在名单内未匹配到的分数
      const unmatchedSecondData: ResolvedDataType[] = []; // 在名单内未匹配到的分数
      const firstData: TableDataRowNameList[] = JSON.parse(JSON.stringify(tableDataNameList));
      const secondData: TableDataRowNameList[] = JSON.parse(JSON.stringify(tableDataNameList));

      const unmatchedBothDatas = [unmatchedFirstData, unmatchedSecondData];
      const bothData = [firstData, secondData];
      const timesDatasArr = [timesData.first, timesData.second];

      // 匹配一次和二次提交的成绩
      for (let i = 0; i < timesDatasArr.length; i++) {
        map.clear();

        bothData[i].forEach(item => map.set(
          ONLY_MATCH_PHONE ? item.phone : item.name + item.phone,
          item
        )); // map 化，优化处理速度

        timesDatasArr[i].forEach(item => {
          const hash: string = ONLY_MATCH_PHONE ?
            item[EnumColumns.Phone] : item[EnumColumns.Name] + item[EnumColumns.Phone]; // 匹配条件

          // item.id = (idCount++).toString();
          if (map.has(hash)) {
            const row = map.get(hash);
            if (row) {
              row.score = Number(item[EnumColumns.Score]);
              row.result = item[EnumColumns.Pass];
              row.isMatched = true;
              row.matchedId = item.id;
            }
          } else {
            unmatchedBothDatas[i].push(item);
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
      if (timesScores === EnumTimes.First) {
        handleFilterNameList(firstData);
      } else if(timesScores === EnumTimes.Second) {
        handleFilterNameList(secondData);
      }

    } catch {
      //
    } finally {
      props.toggleLoading(false);
    }
  };

  // 手动匹配一行数据
  const matchManually = (times: EnumTimes, matchingItem: ResolvedDataType, matchedItem: TableDataRowNameList) => {
    matchedItem.isMatched = true;
    matchedItem.matchedId = matchingItem.id;
    matchedItem.result = matchingItem[EnumColumns.Pass];
    matchedItem.score = matchingItem[EnumColumns.Score];

    if (times === EnumTimes.First) {
      const unmatchedList = unmatchedCaches.first;
      const index = unmatchedList.findIndex(item => item.id === matchingItem.id);
      unmatchedList.splice(index, 1);
      setUnmatchedCaches({
        first: [...unmatchedList],
        second: unmatchedCaches.second,
      });

    } else if (times === EnumTimes.Second) {
      const unmatchedList = unmatchedCaches.second;
      const index = unmatchedList.findIndex(item => item.id === matchingItem.id);
      unmatchedList.splice(index, 1);
      setUnmatchedCaches({
        first: unmatchedCaches.first,
        second: [...unmatchedList],
      });
    }

    handleFilterNameList(); // 更新总名单
    setDataCaches({
      first: dataCaches.first,
      second: dataCaches.second,
    }); // 更新图表
  };

  // 生成表头
  const columnsNameList = getColumnsNameList('unmatch', (record, index) => {
    // 操作按钮回调，点击取消匹配

    if (!record || !record.isMatched || !separatedData || index === undefined) return;

    const firstList = unmatchedCaches.first;
    const secondList = unmatchedCaches.second;
    const tableRow = filteredNameList[index];
    let operationList: ResolvedDataType[] = [];
    let operationRow: ResolvedDataType | undefined;


    if (timesScores === EnumTimes.First) {
      operationRow = separatedData.first.get(record.matchedId as string);
      operationList = firstList;
    } else if (timesScores === EnumTimes.Second) {
      operationRow = separatedData.second.get(record.matchedId as string);
      operationList = secondList;
    }

    if (operationRow && operationList) {
      operationList.push(operationRow);
      setUnmatchedCaches({
        first: firstList,
        second: secondList,
      });

      tableRow.score = undefined;
      tableRow.isMatched = false;
      tableRow.matchedId = undefined;
      tableRow.result = undefined;

      handleFilterNameList([...tableDataNameList]);
    }
  });

  // 搜索过滤
  const handleFilterNameList = (list?: TableDataRowNameList[]) => {
    props.toggleLoading(true);

    list && setTableDataNameList(list);

    list = list ? list : tableDataNameList;

    const matchFlag = Boolean(+(searchIsMatched ?? 0));
    list = list.filter(item =>
      (searchIsMatched === undefined || item.isMatched === matchFlag) &&
      (searchUnitName === undefined || item.unitName === searchUnitName) &&
      (!searchName || item.name.includes(searchName)) &&
      (!searchPhone || item.phone.includes(searchPhone)) &&
      (!searchStation || item.station.includes(searchStation))
    );

    setFilteredNameList(list);

    setTimeout(() => props.toggleLoading(false), 0);
  };

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
                      handleFilterNameList(dataCaches.first);
                    } else if(ev.target.value === EnumTimes.Second ) {
                      handleFilterNameList(dataCaches.second);
                    }
                    setTimeout(() => props.toggleLoading(false), 0);
                  }}
                ></Radio.Group>

                <UnmatchedModal
                  matchedData={dataCaches}
                  unmatchedDataCount={unmatchedDataCount}
                  unmatchedData={unmatchedCaches}
                  unitNameSelectOptions={unitNameSelectOptions}
                  onMatch={matchManually}
                ></UnmatchedModal>

                <ChartsModal
                  datas={dataCaches}
                ></ChartsModal>

                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => exportExcelFile([
                    {
                      sheetName: '一次提交成绩单',
                      columns: columnsNameList,
                      data: dataCaches.first,
                    },
                    {
                      sheetName: '二次提交成绩单',
                      columns: columnsNameList,
                      data: dataCaches.second,
                    },
                  ], '完整成绩单')}
                >导出成绩</Button>
              </> : null
          }
        </div>
      </div>

      <div className="workbench-result-tables">
        <div className="toolbar">
          <Tooltip title="选择是否已匹配">
            <Select
              className="field-width-short"
              size="small"
              placeholder="是否匹配"
              allowClear
              options={[
                { label: '已匹配', value: '1' },
                { label: '未匹配', value: '0' },
              ]}
              value={searchIsMatched}
              onChange={ev => setSearchIsMatched(ev)}
            ></Select>
          </Tooltip>
          
          <Tooltip title="选择单位">
            <Select
              className="field-width-long"
              size="small" 
              placeholder="选择单位" 
              allowClear
              options={unitNameSelectOptions}
              value={searchUnitName}
              onChange={ev => setSearchUnitName(ev)}
            ></Select>
          </Tooltip>

          <Tooltip title="输入姓名">
            <Input 
              className="field-width" 
              size="small"
              placeholder="输入姓名" 
              allowClear
              value={searchName}
              onChange={ev => setSearchName((ev.target.value ?? '').trim())}
            ></Input>
          </Tooltip>

          <Tooltip title="输入手机号码">
            <Input
              className="field-width" 
              size="small"
              placeholder="输入手机号码"
              allowClear
              value={searchPhone}
              onChange={ev => setSearchPhone((ev.target.value ?? '').trim())}
            ></Input>
          </Tooltip>

          <Tooltip title="输入岗位">
            <Input
              className="field-width"
              size="small"
              placeholder="输入岗位"
              allowClear
              value={searchStation}
              onChange={ev => setSearchStation((ev.target.value ?? '').trim())}
            ></Input>
          </Tooltip>

          <Button type="primary" size="small" onClick={() => handleFilterNameList()}>搜索</Button>
        </div>
        <Table
          className="result-cross-table"
          columns={columnsNameList}
          dataSource={filteredNameList}
          size="small"
          bordered
          rowKey="id"
          // pagination={false}
          pagination={{
            defaultPageSize: 20,
            showTotal: (total) => (
              <span className="mg-r-10">{ `当前条数 / 总条数：${filteredNameList.length} / ${tableDataNameList.length}` }</span>
            ),
            size: 'default',
          }}
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