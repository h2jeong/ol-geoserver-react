import { Badge, Input, Select, Switch, Table } from 'antd';
import React from 'react';

const { Option } = Select;

const colors = [
  '#ff0000',
  '#800000',
  '#ffff00',
  '#808000',
  '#00ff00',
  '#008000',
  '#00ffff',
  '#008080',
  '#0000ff',
  '#000080',
  '#ff00ff',
  '#800080'
];

/** 경로계획 목록 */
const LayerTable = ({ dataList, handleChange, showHeader }) => {
  const handleChangeInput = (e) => {
    const { id, name, value } = e.target;
    handleChange(id, name, value);
  };

  const columns = [
    {
      title: 'Layer Name',
      dataIndex: 'fileName'
    },
    {
      title: 'LineColor',
      dataIndex: 'lineColor',
      // eslint-disable-next-line react/display-name
      render: (_, record) => (
        <Select
          style={{ width: 120 }}
          name="lineColor"
          defaultValue={record.lineColor || '#ff0000'}
          onChange={(value) => handleChange(record.key, 'lineColor', value)}>
          {colors.map((color) => (
            <Option key={color} value={color}>
              <Badge color={color} text={color} />
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'LineWidth (Radius)',
      dataIndex: 'lineWidth',
      // eslint-disable-next-line react/display-name
      render: (_, record) => (
        <Input
          id={record.key}
          name="lineWidth"
          defaultValue={record.lineWidth || 1}
          onChange={handleChangeInput}
        />
      )
    },
    {
      title: 'Enabled',
      dataIndex: 'isEnabled',
      // eslint-disable-next-line react/display-name
      render: (_, record) => (
        <Switch
          defaultChecked={record.isEnabled}
          onChange={(value) => handleChange(record.key, 'isEnabled', value)}
        />
      )
    }
  ];

  return (
    <Table
      rowClassName={() => 'editable-row'}
      dataSource={dataList}
      columns={columns}
      pagination={false}
      showHeader={showHeader}
    />
  );
};

export default LayerTable;
