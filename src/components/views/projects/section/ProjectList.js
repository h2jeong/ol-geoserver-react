/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Typography, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CreateProject from './CreateProject';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { deleteProject, getProjectOne } from '../../../../store/project';
import Search from 'antd/lib/input/Search';
import { useHistory } from 'react-router';

const ProjectList = () => {
  const project = useSelector(
    ({ project }) => ({ list: project.list }),
    shallowEqual
  );
  const user = useSelector(({ user }) => ({ list: user.list }), shallowEqual);

  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (!project.list?.length) return;

    const searchList = project.list.filter(
      (item) => item.name?.toLowerCase().indexOf(search.toLowerCase()) > -1
    );
    setData(searchList);
  }, [search, project.list]);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setVisible(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleDelete = (id) => {
    dispatch(deleteProject(id, project.list));
  };

  const handleClick = (projectId) => {
    dispatch(getProjectOne(projectId)).then((res) => {
      if (res.payload?.id === projectId) {
        history.push(`/projects/${projectId}`);
      }
    });
  };

  const columns = [
    {
      title: '프로젝트 이름',
      dataIndex: 'name',
      render: (_, record) => (
        <Typography.Link onClick={() => handleClick(record.id)}>
          {record.name}
        </Typography.Link>
      )
    },
    {
      title: '식별코드',
      dataIndex: 'code',
      render: (_, record) => (
        <a href={`/projects/${record.id}`}>{record.code}</a>
      )
    },
    {
      title: '프로젝트 관리자',
      dataIndex: 'adminBy',
      render: (text) =>
        user.list?.length >= 1
          ? user.list.find((item) => item.key === text)?.userName
          : text
    },
    {
      title: '프로젝트 생성자',
      dataIndex: 'createdBy',
      render: (text) =>
        user.list?.length >= 1
          ? user.list.find((item) => item.key === text).userName
          : text
    },
    {
      title: '삭제',
      dataIndex: 'delete',
      render: (_, record) => (
        <Popconfirm
          title="Sure to delete?"
          onConfirm={() => handleDelete(record.id)}>
          <a href="/#">Delete</a>
        </Popconfirm>
      )
    }
  ];

  const onSearch = (value) => {
    setSearch(value);
  };

  return (
    <Form form={form} component={false}>
      <Form.Item label="">
        <Search
          placeholder="프로젝트명으로 검색하세요."
          onSearch={onSearch}
          enterButton
          style={{ width: 300, marginRight: 8 }}
        />
        <Button type="primary" onClick={showModal}>
          <PlusOutlined /> 촬영계획 추가
        </Button>
      </Form.Item>
      <Table
        dataSource={data?.length > 0 && data}
        columns={columns}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          position: ['none', 'bottomCenter']
        }}
      />
      <CreateProject
        visible={visible}
        confirmLoading={confirmLoading}
        handleOk={handleOk}
        handleCancel={handleCancel}
      />
    </Form>
  );
};

export default ProjectList;
