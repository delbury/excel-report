import React, { useState } from 'react';
import { TableColumns, TableDataRow, TableColumnsMap } from '../index-types';
import { Button, Tooltip, Table } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { TableDataRowNameList } from './columns-types';
import { columnsNameList } from './columns';
import { sheetFieldMap } from './sheet-fields-map';

interface IProps {
  outerData: TableDataRow[];
  outerColumns: TableColumns;
  outerColumnsMap: TableColumnsMap;
  currentSheetName: string;
}

const ResultCrossTable: React.FC<IProps> = function (props: IProps) {
  const [tableDataNameList, setTableDataNameList] = useState<TableDataRowNameList[]>([]);

  // 生成名单，单张表
  let idCount: number = Date.now();
  const handleGenerateNameList = () => {
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
  };

  // 生成全部名单
  const handleGenerateTotalNameList = () => { };

  return (
    <div className="workbench-result">
      <div className="workbench-result-toolbar">
        <div className="workbench-result-btns">
          <Button size="small" type="primary" onClick={() => handleGenerateTotalNameList()}>生成完整名单</Button>
          <Button size="small" onClick={() => handleGenerateNameList()}>生成单表名单</Button>

          <Tooltip
            title="需先导入选择花名册"
            placement="top"
          >
            <InfoCircleOutlined />
          </Tooltip>
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

export default ResultCrossTable;