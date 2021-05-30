/* eslint-disable react/display-name */
/* eslint-disable no-unused-vars */
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  changeMode,
  getJourneyOne,
  setAllList,
  updateEnable
} from '../../../store/journey';
import LayoutPage from '../layout/LayoutPage';
import { Table, Button, Space, Input, Switch, Typography, Spin } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router';
import { getJourneyForProjects } from '../../../store/project';
import moment from 'moment';

const { Title } = Typography;

const JourneyTablePage = () => {
  const project = useSelector(
    ({ project }) => ({ list: project.list }),
    shallowEqual
  );
  const [list, setList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const dispatch = useDispatch();
  const history = useHistory();
  const ref = useRef(null);

  useEffect(() => {
    async function fetchApi() {
      let journeys = [];

      const projectIds = project.list
        ?.filter((item) => item.isEnabled)
        .map((item) => item.id);

      dispatch(getJourneyForProjects(projectIds)).then(async (res) => {
        if (!res.payload) return;
        const journeyList = await res.payload;

        journeys.push(...journeyList);
      });

      setTimeout(() => {
        console.log('journeys:', journeys);
        setList(journeys);
        dispatch(setAllList(journeys));
      }, 1000);
    }
    console.log('projectList:', project.list);
    if (!project.list) return;
    fetchApi();
  }, [project.list.length]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleArchive = (value, journeyId) => {
    dispatch(updateEnable(value, journeyId)).then((res) => {
      if (res.payload.journeyId === journeyId) {
        setList(
          list.map((item) =>
            item.id === journeyId
              ? { ...item, isEnabled: value, isVisible: value }
              : item
          )
        );
      }
    });
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setList(list);
    setSearchText('');
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
      title: '촬영제목',
      width: 180,
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name')
    },
    {
      title: '처리진행',
      width: 120,
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      ...getColumnSearchProps('status')
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
    <Suspense
      fallback={
        <div className="loading">
          <Spin />
        </div>
      }>
      <LayoutPage menu="6">
        <div className="inner-container">
          <Title level={4}>촬영 이력 목록</Title>
          <br />
          <Table
            columns={columns}
            dataSource={list}
            sortDirections={['descend', 'ascend']}
            pagination={{ position: ['none', 'bottomCenter'] }}
          />
        </div>
      </LayoutPage>
    </Suspense>
  );
};

export default JourneyTablePage;
