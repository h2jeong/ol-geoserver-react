import React, { useEffect, useState } from 'react';
import { Popconfirm, Table, Select, message } from 'antd';
import Search from 'antd/lib/input/Search';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  getUsersForProject,
  manageUser,
  updateAuth
} from '../../../../store/user';
import AllUserList from './AllUserList';
import { getProjectOne } from '../../../../store/project';

const { Option } = Select;

const UsersForProject = ({ current }) => {
  const user = useSelector(
    ({ user }) => ({
      list: user.list,
      projectUsers: user.projectUsers,
      userData: user.userData,
      isAdmin: user.isAdmin
    }),
    shallowEqual
  );

  const [list, setList] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [search, setSearch] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user.projectUsers?.length) {
      setList([]);
    } else {
      let searchList = user.projectUsers?.filter(
        (item) =>
          item.userName?.toLowerCase().indexOf(search.toLowerCase()) > -1
      );
      setList(searchList);
    }
  }, [search, user.projectUsers]);

  useEffect(() => {
    if (!current) setList([]);
    else {
      if (!user.isAdmin) return;
      dispatch(getProjectOne(current)).then((res) => {
        setProjectInfo(res.payload);
      });
      dispatch(getUsersForProject(current)).then((res) => {
        setList(res.payload);
      });
    }
  }, [current]);

  const authLevel = ['ROLE_ADMIN', 'ROLE_WORKER', 'ROLE_GUEST'];
  const columns = [
    {
      title: 'User Name',
      dataIndex: 'userName'
    },
    {
      title: 'User ID',
      dataIndex: 'userId'
    },
    {
      title: 'Authority',
      dataIndex: 'role',
      // eslint-disable-next-line react/display-name
      render: (_, record) =>
        list.length >= 1 ? (
          projectInfo?.createdBy === record.userName ? (
            '생성자'
          ) : (
            <Select
              defaultValue={record.role}
              style={{ width: 200 }}
              onChange={(value) => handleChange(value, record.id)}>
              {authLevel.map((el) => (
                <Option key={el} value={el}>
                  {el}
                </Option>
              ))}
            </Select>
          )
        ) : null
    },
    {
      title: 'Setting',
      dataIndex: 'operation',
      // eslint-disable-next-line react/display-name
      render: (_, record) =>
        list.length >= 1 ? (
          projectInfo?.createdBy === record.userName ? null : (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record)}>
              <a href="/#">제외시키기</a>
            </Popconfirm>
          )
        ) : null
    }
  ];

  const handleChange = (auth, id) => {
    if (user.userData.id === id) {
      message
        .info(
          '본인의 권한을 변경할 경우 대시보드 페이지로 이동합니다.',
          5,
          dispatch(updateAuth(id, auth))
        )
        .then(() => window.location.reload());
    } else {
      dispatch(updateAuth(id, auth));
    }
  };

  const handleDelete = (value) => {
    if (!current) return;

    const idsArray = list.map((item) => item.id);

    if (!idsArray.includes(value.id)) return;
    else {
      let uuids = idsArray.filter((item) => item !== value.id);

      dispatch(manageUser(uuids, current, value, list)).then((res) => {
        setList(res.payload);
      });
    }
  };

  const handleAdd = (value) => {
    if (!current) return;

    let uuids = list?.map((item) => item.id) || [];
    if (uuids.includes(value.id)) return;
    else {
      uuids.push(value.id);

      dispatch(manageUser(uuids, current, value, list)).then((res) => {
        setList(res.payload);
      });
    }
  };

  const onSearch = (value) => {
    setSearch(value);
  };

  return (
    <>
      <Search
        placeholder="이름으로 검색하세요."
        onSearch={onSearch}
        enterButton
        style={{ width: 300, margin: '0 0 1.5rem 0.5rem' }}
      />
      <Table
        rowClassName={() => 'editable-row'}
        dataSource={list}
        columns={columns}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 10,
          position: ['none', 'bottomCenter']
        }}
      />
      <AllUserList allList={user.list} onAdd={handleAdd} />
    </>
  );
};

export default UsersForProject;
