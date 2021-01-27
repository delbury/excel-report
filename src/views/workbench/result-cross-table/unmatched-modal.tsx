import React, { useState, useEffect } from 'react';
import { Modal, Badge, Button, Table, Radio } from 'antd';
import {
  UnmatchedCachesType,
  ResolvedDataType,
  DataCachesType,
  TableDataRowNameList
} from './index-types';
import { TableDataRow } from '../index-types';
import { getColumnsResolvedData } from './columns';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '@/redux/actions/global';
import { EnumTimes, EnumColumns } from './enums';
import { exportExcelFile } from '../tools';

interface IProps {
  matchecData: DataCachesType;
  unmatchedDataCount: [number, number];
  unmatchedData: UnmatchedCachesType;
  toggleLoading: (status?: boolean) => void;
}

const UnmatchedModal: React.FC<IProps> = function (props: IProps) {
  const [showModal, setShowModal] = useState<boolean>(false); // 显示未匹配信息详情弹框
  const [timesScores, setTimesScores] = useState<EnumTimes>(EnumTimes.First); // 第几次提交
  const [tableData, setTableData] = useState<ResolvedDataType[]>([]); // tbale 数据
  
  // 初始化表数据
  useEffect(() => {
    setTimesScores(EnumTimes.First);
    setTableData(props.unmatchedData.first);
  }, [props.unmatchedData]);

  // 关闭弹框
  const close = () => setShowModal(false);
  // 打开弹框
  const open = () => setShowModal(true);

  // 表头
  const columnsResolvedData = getColumnsResolvedData((record, index) => {
    // 行点击回调，搜索可能匹配项
    if (!record) return;

    let matchedList: TableDataRowNameList[] = [];
    if (timesScores === EnumTimes.First) {
      matchedList = props.matchecData.first;
    } else if (timesScores === EnumTimes.Second) {
      matchedList = props.matchecData.second;
    }

    // 过滤可能匹配项
    const name: string = record[EnumColumns.Name];
    const phone: string = record[EnumColumns.Phone];
    const searchedList = matchedList.filter(item => {
      return item.phone === phone || item.name.includes(name);
    });

    console.log(searchedList);
  });

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
          <Button size="small" type="primary" onClick={() => handleExportExcel()}>导出</Button>

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