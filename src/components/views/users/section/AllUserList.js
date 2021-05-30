import React, { useEffect, useState } from 'react';
import {
  List,
  Avatar,
  Skeleton,
  Card,
  Space,
  Divider,
  Button,
  Switch,
  Typography
} from 'antd';
import Search from 'antd/lib/input/Search';
import Meta from 'antd/lib/card/Meta';
import { useDispatch } from 'react-redux';
import { updateUserEnable } from '../../../../store/user';

const AllUserList = ({ allList, onAdd }) => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (!allList?.length) return;
    let searchList = allList?.filter(
      (item) => item.userName?.toLowerCase().indexOf(search.toLowerCase()) > -1
    );

    setList(searchList);
  }, [search, allList]);

  const onSearch = (value) => {
    setSearch(value);
  };

  const onChange = (value, id) => {
    dispatch(updateUserEnable(id, value, list)).then((res) =>
      setList(res.payload)
    );
  };

  return (
    <>
      <Search
        placeholder="이름으로 검색하세요."
        onSearch={onSearch}
        enterButton
        style={{ width: 300, margin: '1rem 0' }}
      />
      <List
        className="demo-loadmore-list"
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5 }}
        dataSource={list}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 5
        }}
        renderItem={(item) => (
          <Card
            style={{ margin: 5 }}
            actions={[
              <Button
                type="link"
                key="list-add"
                disabled={!item.isEnabled}
                onClick={() => onAdd(item)}>
                추가하기
              </Button>,
              <Switch
                onChange={(value) => onChange(value, item.id)}
                defaultChecked={item.isEnabled}
                size="small"
                key="list-edit"
              />
            ]}>
            <Skeleton
              avatar
              title={false}
              loading={false && item.loading}
              active>
              <Meta
                avatar={
                  <Avatar
                    src={`http://gravatar.com/avatar/${item.idx}?d=identicon`}
                    size={35}
                  />
                }
                title={
                  <Space split={<Divider type="vertical" />}>
                    <span>{item.userName}</span>
                    <span>{item.userId}</span>
                  </Space>
                }
                description={
                  <Typography.Text ellipsis="true" type="secondary">
                    {item.description}
                  </Typography.Text>
                }
              />
            </Skeleton>
          </Card>
        )}
      />
    </>
  );
};

export default AllUserList;
