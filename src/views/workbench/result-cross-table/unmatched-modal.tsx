import React, { useState, useEffect } from 'react';
import { Modal, Badge, Button, Table, Radio } from 'antd';
import { UnmatchedCachesType, ResolvedDataType } from './index-types';
import { columnsResolvedData } from './columns';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '@/redux/actions/global';
import { EnumTimes } from './enums';

interface IProps {
  unmatchedDataCount: number;
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

  return (
    <>
      <Badge count={props.unmatchedDataCount} size="small" offset={[-8, -1]}>
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
      > 
        <Radio.Group
          options={[
            { label: '一次提交', value: EnumTimes.First },
            { label: '二次提交', value: EnumTimes.Second },
          ]}
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
        ></Radio.Group>

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