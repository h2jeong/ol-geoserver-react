import {
  Descriptions,
  Badge,
  Space,
  Divider,
  Typography,
  Popconfirm
} from 'antd';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import moment from 'moment';

const EachEquip = ({ equip, hasActions, onEdit, handleDelete }) => {
  const user = useSelector(({ user }) => ({ list: user.list }), shallowEqual);

  return (
    <Descriptions
      size="small"
      bordered
      key={equip?.id}
      style={{ marginBottom: 20 }}
      pagination={{
        onChange: (page) => {
          console.log(page);
        }
      }}>
      <Descriptions.Item label="Name">{equip?.name}</Descriptions.Item>
      <Descriptions.Item label="Serial Number">
        {equip?.serialNum}
      </Descriptions.Item>
      {hasActions && (
        <>
          <Descriptions.Item label="Actions">
            <Space split={<Divider type="vertical" />}>
              <Typography.Link onClick={() => onEdit(equip)}>
                Edit
              </Typography.Link>
              <Popconfirm
                title="Sure to delete?"
                onConfirm={() => handleDelete(equip?.id)}
                style={{ marginLeft: 8 }}>
                <a href="/#">Delete</a>
              </Popconfirm>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Manager">
            {user.list?.length >= 1 &&
              user.list.find((item) => item.id === equip?.manager)?.userName}
          </Descriptions.Item>
        </>
      )}
      <Descriptions.Item label="Allow Remote Control">
        {equip?.isRemote ? '허용' : '불허'}
      </Descriptions.Item>
      <Descriptions.Item label="Online">
        <Badge
          status={equip?.isOnline ? 'processing' : 'default'}
          text={equip?.isOnline ? 'Online' : 'Offline'}
        />
      </Descriptions.Item>
      <Descriptions.Item label="Current Info">
        현재 위치: {equip?.curConnGeom}
        <br />
        현재 접속자 : {equip?.curConnUser}
      </Descriptions.Item>
      <Descriptions.Item label="Recent Info">
        장비 마지막 위치 : {equip?.lastConnGeom}
        <br />
        마지막 접속 시간 :{' '}
        {moment(equip?.lastConnTime).format('YYYY:MM:DD hh:mm:ss')}
        <br />
        마지막 사용자 : {equip?.lastConnUser}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default EachEquip;
