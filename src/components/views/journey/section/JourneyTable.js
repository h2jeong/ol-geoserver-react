/* eslint-disable react/display-name */
import React, { useEffect, useRef, useState } from 'react';
import { Table, Button, Space, Input, Switch, Typography } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  getJourneyOne,
  updateEnable,
  changeMode,
  changeVisible
} from '../../../../store/journey';
import { useHistory } from 'react-router';
import moment from 'moment';

/**
 * 실제 Jounrey list table
 * 테이블 filter, sort
 * 각 Journey enable, visible 처리
 */
const JourneyTable = ({
  size,
  handleAllVisible,
  handleChangeEnable,
  handleFilter,
  handleZoom
}) => {
  const project = useSelector(
    ({ project }) => ({
      current: project.current
    }),
    shallowEqual
  );

  const journey = useSelector(
    ({ journey }) => ({
      list: journey.list,
      statusList: journey.statusList
    }),
    shallowEqual
  );

  const [index, setIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [list, setList] = useState([]);

  const dispatch = useDispatch();
  const history = useHistory();
  const ref = useRef(null);

  useEffect(() => {
    setList(journey.list);
  }, [journey.list]);

  useEffect(() => {
    setIndex(index + 1);
  }, [project.current]);

  const handleChange = (pagination, filters, sorter, extra) => {
    setList(extra.currentDataSource);
    handleFilter(extra.currentDataSource);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setList(journey.list);
    handleFilter(journey.list);
    setSearchText('');
  };

  const handleArchive = (value, journeyId) => {
    dispatch(updateEnable(value, journeyId));
    handleChangeEnable(value, journeyId);
  };

  const handleVisible = (value, journeyId) => {
    dispatch(changeVisible(value, journeyId));
    handleAllVisible(value, journeyId);
  };

  const handleClick = (journeyId) => {
    if (!journeyId) return;
    dispatch(getJourneyOne(journeyId)).then((res) => {
      if (res.payload?.id === journeyId) {
        dispatch(changeMode('view'));
        history.push(`/journey/${journeyId}`);
      }
    });
  };

  const handleSelect = (journey) => {
    handleZoom(journey);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={ref}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}>
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}>
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => ref.current.select(), 100);
      }
    },
    render: (text) => {
      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      );
    }
  });

  const columns = [
    {
      title: '상세',
      width: 55,
      dataIndex: 'detail',
      key: 'detail',
      render: (_, record) => (
        <Typography.Link
          onClick={() => handleClick(record.id)}
          style={{ padding: '0 0.5rem' }}>
          <MoreOutlined />
        </Typography.Link>
      )
    },
    {
      title: '지도표시',
      width: 80,
      dataIndex: 'isVisible',
      key: 'isVisible',
      render: (_, record) => (
        <Switch
          onChange={(value) => handleVisible(value, record.id)}
          checked={record.isVisible}
          disabled={!record.isEnabled}
          size="small"
        />
      )
    },
    {
      title: '촬영제목',
      width: 180,
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (_, record) => (
        <Typography.Link onClick={() => handleSelect(record)}>
          {record.name}
        </Typography.Link>
      )
    },
    {
      title: '처리진행',
      width: 120,
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      filters: journey.statusList?.map((item) => {
        return {
          text: item.name,
          value: item.name,
          ...item
        };
      }),
      filterMultiple: true,
      onFilter: (value, record) => record.status.indexOf(value) === 0
    },
    {
      title: '프로젝트',
      width: 150,
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      ...getColumnSearchProps('projectName')
    },
    {
      title: '장비',
      width: 120,
      dataIndex: 'vehicleName',
      key: 'vehicleName',
      ellipsis: true,
      ...getColumnSearchProps('vehicleName')
    },
    {
      title: '계획일자',
      width: 105,
      dataIndex: 'planDate',
      key: 'planDate',
      ellipsis: true,
      ...getColumnSearchProps('planDate'),
      render: (text) => moment(text).format('YYYY-MM-DD')
    },
    {
      title: '계획자',
      width: 90,
      dataIndex: 'plannerName',
      key: 'plannerName',
      ellipsis: true,
      ...getColumnSearchProps('plannerName')
    },
    {
      title: '촬영일자',
      width: 105,
      dataIndex: 'recordDate',
      key: 'recordDate',
      ellipsis: true,
      ...getColumnSearchProps('recordDate'),
      render: (text) => moment(text).format('YYYY-MM-DD')
    },
    {
      title: '촬영자',
      width: 90,
      dataIndex: 'recorderName',
      key: 'recorderName',
      ellipsis: true,
      ...getColumnSearchProps('recorderName')
    },
    {
      title: '업로드일자',
      width: 105,
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      ellipsis: true,
      ...getColumnSearchProps('uploadDate'),
      render: (text) => moment(text).format('YYYY-MM-DD')
    },
    {
      title: '업로더',
      width: 90,
      dataIndex: 'uploaderName',
      key: 'uploaderName',
      ellipsis: true,
      ...getColumnSearchProps('uploaderName')
    },
    {
      title: '활성화',
      width: 75,
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      sorter: {
        compare: (a, b) => a.isEnabled - b.isEnabled,
        multiple: 2
      },
      defaultSortOrder: 'descend',
      render: (_, record) => (
        <Switch
          onChange={(value) => handleArchive(value, record.id)}
          checked={record.isEnabled}
          size="small"
          className="btnEnable"
        />
      )
    },
    {
      title: '수정일자',
      width: 1,
      dataIndex: 'updateTIme',
      key: 'updateTIme',
      ellipsis: true,
      defaultSortOrder: 'descend',
      sorter: {
        compare: (a, b) =>
          a.updateTIme < b.updateTIme
            ? -1
            : a.updateTIme > b.updateTIme
            ? 1
            : 0,
        multiple: 1
      },
      render: (text) => moment(text).format('YYYY-MM-DD')
    }
  ];

  return (
    <Table
      key={index}
      columns={columns}
      dataSource={list}
      size={size}
      onChange={handleChange}
      sortDirections={['descend', 'ascend']}
      pagination={{ position: ['none', 'bottomCenter'] }}
    />
  );
};

export default JourneyTable;
