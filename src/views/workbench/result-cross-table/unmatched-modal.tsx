import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Badge, Button, Table, Radio, Tooltip, Select, Input, Popconfirm } from 'antd';
import {
  UnmatchedCachesType,
  ResolvedDataType,
  DataCachesType,
  TableDataRowNameList
} from './index-types';
import { TableDataRow } from '../index-types';
import { getColumnsResolvedData, getColumnsNameList } from './columns';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '@/redux/actions/global';
import { EnumTimes, EnumColumns } from './enums';
import { exportExcelFile } from '../tools';

interface CurrentInfoProps {
  infos: { key: string; value: string; }[];
}
const CurrentInfo: React.FC<CurrentInfoProps> = function (props: CurrentInfoProps) {
  return (
    <span>
      <span className="color-info">当前匹配项信息：</span>
      {
        props.infos.map((item, index) => (
          <span key={index}>
            <span className="color-info">{ index === 0 ? '' : '，' }{item.key}：</span>
            <span className="fw-b">{item.value}</span>
          </span>
        ))
      }
    </span>
  );
};

interface IProps {
  matchedData: DataCachesType;
  unmatchedDataCount: [number, number];
  unmatchedData: UnmatchedCachesType;
  toggleLoading: (status?: boolean) => void;
  unitNameSelectOptions: { label: string; value: string; }[];
  onMatch?: (times: EnumTimes, matchingItem: ResolvedDataType, matchedItem: TableDataRowNameList) => void;
  onMatchBatch?: (times: EnumTimes, matchingItems: ResolvedDataType[], matchedItems: TableDataRowNameList[]) => void;
  enumColumns: EnumColumns;
}

const UnmatchedModal: React.FC<IProps> = function (props: IProps) {
  const [showModal, setShowModal] = useState<boolean>(false); // 显示未匹配信息详情弹框
  const [timesScores, setTimesScores] = useState<EnumTimes>(EnumTimes.First); // 第几次提交
  const [tableData, setTableData] = useState<ResolvedDataType[]>([]); // tbale 数据

  const [showSecondModal, setShowSecondModal] = useState<boolean>(false); // 手动匹配弹框
  const [filteredNameList, setFilteredNameList] = useState<TableDataRowNameList[]>([]); // 搜索过滤后的数据列表

  // 查询条件
  const [searchIsMatched, setSearchIsMatched] = useState<'0' | '1'>(); // 是否匹配
  const [searchUnitName, setSearchUnitName] = useState<string>(); // 选择单位
  const [searchName, setSearchName] = useState<string>(); // 姓名
  const [searchPhone, setSearchPhone] = useState<string>(); // 手机号码
  const [searchStation, setSearchStation] = useState<string>(); // 岗位
  
  const [currentMatching, setCurrentMatching] = useState<ResolvedDataType>(); // 当前被匹配的行

  // 当前被匹配项信息格式化
  const currentMatchingInfos = useMemo<{ key: string; value: string; }[]>(() => {
    if (!currentMatching) return [];

    const infoList: { key: string; value: string; }[] = [];
    infoList.push({ key: '姓名', value: currentMatching.Name });
    infoList.push({ key: '手机号码', value: currentMatching.Phone });
    infoList.push({ key: '得分', value: currentMatching.Score.toString() });
    infoList.push({ key: '是否通过', value: currentMatching.Pass });
    infoList.push({ key: '交卷时间', value: currentMatching.Time });
    infoList.push({ key: '考试用时', value: currentMatching.Duration });
    infoList.push({ key: '员工编码', value: currentMatching.Code });
    infoList.push({ key: '所属专业', value: currentMatching.Major });
    infoList.push({ key: '所在单位', value: currentMatching.Unit });

    return infoList;
  }, [currentMatching, props.enumColumns]);

  // 总条数
  const currentTotal = useMemo<number>(() => {
    if (timesScores === EnumTimes.First) {
      return props.matchedData.first.length;
    } else if (timesScores === EnumTimes.Second) {
      return props.matchedData.second.length;
    }

    return 0;
  }, [timesScores, props.matchedData]);
  
  // 初始化表数据
  useEffect(() => {
    if (EnumTimes.First === timesScores) {
      setTableData(props.unmatchedData.first);
    } else if (EnumTimes.Second === timesScores) {
      setTableData(props.unmatchedData.second);
    }

  }, [props.unmatchedData]);

  // 关闭弹框
  const close = () => setShowModal(false);
  // 打开弹框
  const open = () => setShowModal(true);

  // 关闭二级弹框
  const closeSecond = () => {
    setSearchIsMatched(undefined);
    setSearchUnitName(undefined);
    setSearchName(undefined);
    setSearchPhone(undefined);
    setSearchStation(undefined);
    setShowSecondModal(false);
  };

  // 导出
  const handleExportExcel = () => {
    exportExcelFile([
      {
        sheetName: '一次提交未匹配成绩',
        data: props.unmatchedData.first as TableDataRow[],
        columns: columnsResolvedData,
      },
      {
        sheetName: '二次提交未匹配成绩',
        data: props.unmatchedData.second as TableDataRow[],
        columns: columnsResolvedData,
      }
    ], '未匹配成绩');
  };

  // 二级弹框表头
  const columnsNameList = getColumnsNameList('select', (record, index) => {
    // 确定选择项并匹配
    if (!record || !currentMatching) return;

    props.onMatch && props.onMatch(timesScores, currentMatching, record);

    closeSecond(); // 关闭弹框
  });

  // 过滤
  const handleFilterNameList = (isMatched?: string, name?: string) => {
    props.toggleLoading(true);

    let list: TableDataRowNameList[] = [];

    if (timesScores === EnumTimes.First) {
      list = props.matchedData.first;
    } else if (timesScores === EnumTimes.Second) {
      list = props.matchedData.second;
    }

    const localIsMatched = isMatched ?? searchIsMatched;
    const localName = name ?? searchName;
    const matchFlag = Boolean(+(searchIsMatched ?? 0));
    list = list.filter(item =>
      (localIsMatched === undefined || item.isMatched === matchFlag) &&
      (searchUnitName === undefined || item.unitName === searchUnitName) &&
      (!localName || item.name.includes(localName)) &&
      (!searchPhone || item.phone.includes(searchPhone)) &&
      (!searchStation || item.station.includes(searchStation))
    );

    setFilteredNameList(list);

    setTimeout(() => props.toggleLoading(false), 0);
  };

  // 一级弹框表头
  const columnsResolvedData = getColumnsResolvedData((record, index) => {
    // 点击进行手动匹配
    if (!record) return;

    setCurrentMatching(record); // 设置当前被匹配行

    setShowSecondModal(true);
    setSearchIsMatched('0');
    setSearchName(record.Name);
    handleFilterNameList('0', record.Name);
  });

  // 自动匹配
  const handleAutoMatchConfirm = () => {
    props.toggleLoading(true);

    let list: TableDataRowNameList[] = [];
    if (timesScores === EnumTimes.First) {
      list = props.matchedData.first;
    } else if (timesScores === EnumTimes.Second) {
      list = props.matchedData.second;
    }

    const temp: { matchingItems: ResolvedDataType[]; matchedItems: TableDataRowNameList[]; } = {
      matchingItems: [],
      matchedItems: []
    };
    tableData.forEach((item, index) => { 
      // 批量匹配
      const filteredList = list.filter(it =>
        it.isMatched === false &&
        it.name === item.Name
      );
      
      if (filteredList.length === 1) {
        temp.matchingItems.push(item);
        temp.matchedItems.push(filteredList[0]);
      }
    });

    props.onMatchBatch && props.onMatchBatch(timesScores, temp.matchingItems, temp.matchedItems);
    props.toggleLoading(false);
  };
  
  return (
    <>
      <Badge count={props.unmatchedDataCount[0] + props.unmatchedDataCount[1]} size="small" offset={[-8, -1]}>
        <Button size="small" onClick={open}>查看未匹配成绩</Button>
      </Badge>
      <Modal
        title="未匹配成绩详情"
        visible={showModal}
        onCancel={close}
        onOk={close}
        cancelText="关闭"
        okText="确定"
        width="80vw"
        bodyStyle={{ minHeight: '400px' }}
        destroyOnClose
      >  
        <div className="toolbar">
          <Radio.Group
            // options={[
            //   { label: '一次提交', value: EnumTimes.First },
            //   { label: '二次提交', value: EnumTimes.Second },
            // ]}
            value={timesScores}
            optionType="button"
            size="small"
            onChange={(ev) => {
              props.toggleLoading(true);
              setTimesScores(ev.target.value);
              if (ev.target.value === EnumTimes.First ) {
                setTableData(props.unmatchedData.first);
              } else if(ev.target.value === EnumTimes.Second ) {
                setTableData(props.unmatchedData.second);
              }
              setTimeout(() => props.toggleLoading(false), 0);
            }}
          >
            <Badge count={props.unmatchedDataCount[0]} size="small" offset={[-8, -1]} style={{ zIndex: 5 }}>
              <Radio.Button value={EnumTimes.First}>一次提交</Radio.Button>
            </Badge>
            <Badge count={props.unmatchedDataCount[1]} size="small" offset={[-8, -1]} style={{ zIndex: 5 }}>
              <Radio.Button value={EnumTimes.Second}>二次提交</Radio.Button>
            </Badge>
          </Radio.Group>
          
          <Popconfirm
            title="是否自动匹配通过姓名字段筛选出唯一名单信息的成绩？"
            okText="确定"
            cancelText="取消"
            onConfirm={handleAutoMatchConfirm}
          >
            <Button size="small">自动匹配</Button>
          </Popconfirm>

          <Button size="small" type="primary" onClick={() => handleExportExcel()}>导出</Button>
        </div>

        <div style={{ overflow: 'auto', maxHeight: '60vh', marginTop: '10px' }}>
          <Table
            columns={columnsResolvedData}
            dataSource={tableData}
            rowKey="id"
            size="small"
            bordered
            pagination={false}
          ></Table>
        </div>
        
        {/* 二级弹框 */}
        <Modal
          title="手动匹配成绩"
          visible={showSecondModal}
          onCancel={() => closeSecond()}
          onOk={() => closeSecond()}
          width="80vw"
        >
          <div style={{ minHeight: '400px' }}>
            <div className="mg-b-10"><CurrentInfo infos={currentMatchingInfos} /></div>

            <div className="toolbar mg-b-10">
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
                  options={props.unitNameSelectOptions}
                  value={searchUnitName}
                  onChange={ev => setSearchUnitName(ev)}
                ></Select>
              </Tooltip>

              <Tooltip title="输入姓名">
                <Input 
                  className="field-width-short" 
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
              columns={columnsNameList}
              dataSource={filteredNameList}
              size="small"
              bordered
              rowKey="id"
              pagination={{
                defaultPageSize: 10,
                showTotal: (total) => (
                  <span className="mg-r-10">{ `当前条数 / 总条数：${filteredNameList.length} / ${currentTotal}` }</span>
                ),
                size: 'default',
              }}
              scroll={{ x: 'max-content' }}
              sticky
            ></Table>
          </div>
        </Modal>
      </Modal>
    </>
  );
};

const dispatchToProps = (dispatch: Dispatch) => {
  return {
    toggleLoading: (status?: boolean) => dispatch(actions.toggleGlobalLoading(status)),
  };
};
export default connect(undefined, dispatchToProps)(UnmatchedModal);