import React, { useState, useEffect } from 'react';
import { TableColumns, TableDataRow, TableColumnsMap } from '../index-types';
import { Button, Tooltip, Table, Upload, Badge, message, Radio } from 'antd';
import { RcFile, UploadProps, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { TableDataRowNameList } from './columns-types';
import { columnsNameList } from './columns';
import { sheetFieldMap } from './sheet-fields-map';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { actions } from '@/redux/actions/global';
import { resolveScoreExcelFile, ResolvedDataType, separateScoreDateTimes } from './resolve-excel';

type FilteredDataMap = Map<string, TableDataRowNameList[]>;
enum EnumTimes { First, Second };

interface IProps {
  outerData: TableDataRow[];
  outerColumns: TableColumns;
  currentSheetName: string;
  getAllSheetData: () => Map<string, TableDataRow[]>;
  toggleLoading: (status?: boolean) => void;
}

const ResultCrossTable: React.FC<IProps> = function (props: IProps) {
  const [tableDataNameList, setTableDataNameList] = useState<TableDataRowNameList[]>([]); // 数据列表
  // const [filteredDataMap, setFilteredDataMap] = useState<FilteredDataMap>(new Map());
  const [fileList, setFileList] = useState<UploadFile[]>([]); // 成绩文件列表
  const [timesScores, setTimesScores] = useState<EnumTimes>(EnumTimes.First); // 第几次提交

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
    props.toggleLoading(true);

    setTimeout(() => {
      const dataMap = props.getAllSheetData();
      const tempFilteredDataMap: FilteredDataMap = new Map();
      const list: TableDataRowNameList[] = [];

      for (let [sheetName, data] of dataMap.entries()) {
        const keyMap = sheetFieldMap.get(sheetName);
        const tempArr: TableDataRowNameList[] = [];
        tempFilteredDataMap.set(sheetName, tempArr);
        if (keyMap) {
          data.forEach(item => {
            const tempObj = {
              id: (idCount++).toString(),
              unitName: item[keyMap.unitName],
              name: item[keyMap.name],
              phone: item[keyMap.phone],
              station: item[keyMap.station],
            };
            tempArr.push(tempObj);
            list.push(tempObj);
          });
        }
      }
      // setFilteredDataMap(tempFilteredDataMap);
      setTableDataNameList(list);
      props.toggleLoading(false);

    }, 0);

  };

  // 统计成绩
  const resolveScoreExcelFiles = async () => {
    // if (!tableDataNameList.length) {
    //   return message.warning('请先生成名单！');
    // }

    if (!fileList.length) {
      return message.warning('请先导入成绩excel！');
    }

    props.toggleLoading(true);
    try {
      // 整合所有成绩
      const totalData: ResolvedDataType[] = [];
      for (let item of fileList) {
        if (item.originFileObj) {
          const data = await resolveScoreExcelFile(item.originFileObj);
          totalData.push(...data);
        }
      }

      const timesData = separateScoreDateTimes(totalData);
      console.log(timesData);

    } catch {
      //
    } finally {
      props.toggleLoading(false);
    }
  };

  return (
    <div className="workbench-result">
      <div className="workbench-result-toolbar">
        <div className="workbench-result-btns">
          <Button.Group size="small">
            <Button type="primary" onClick={() => handleGenerateTotalNameList()}>生成完整名单</Button>
            {/* <Button onClick={() => handleGenerateNameList()}>生成单表名单</Button> */}
          </Button.Group>

          <Tooltip
            title="需先导入选择花名册"
            placement="top"
          >
            <InfoCircleOutlined />
          </Tooltip>

          <Upload
            accept=".xlsx, .xls"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={ev => setFileList(ev.fileList)}
            multiple
            className={`workbench-result-upload${fileList.length ? '' : ' is-empty'}`}
          >
            <Badge count={fileList.length} size="small" offset={[-8, -1]}>
              <Button size="small" icon={<UploadOutlined />}>导入成绩excel</Button>
            </Badge>
          </Upload>

          <Button size="small" onClick={() => resolveScoreExcelFiles()}>统计成绩</Button>
          {
            <Radio.Group
              options={[
                { label: '一次提交', value: EnumTimes.First },
                { label: '二次提交', value: EnumTimes.Second },
              ]}
              value={timesScores}
              optionType="button"
              size="small"
              onChange={(ev) => setTimesScores(ev.target.value)}
            ></Radio.Group>
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