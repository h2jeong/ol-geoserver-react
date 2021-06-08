import React from 'react';
import {
  Avatar,
  Button,
  Divider,
  Layout,
  Menu,
  message,
  Space,
  Typography
} from 'antd';
import {
  PushpinOutlined,
  VideoCameraOutlined,
  TagsOutlined,
  TeamOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../store/user';
import { resetStore } from '../../../store';

const { Sider } = Layout;

/** 좌측 사이드 메뉴 바, 로그아웃 처리 */
const MenuBar = (props, { menu }) => {
  const user = useSelector(
    ({ user }) => ({ userData: user.userData }),
    shallowEqual
  );

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser()).then((res) => {
      if (res.payload) {
        dispatch(resetStore());
        props.history.push('/login');
      } else
        message.error({
          content: res.payload.message,
          style: {
            marginTop: '15vh'
          }
        });
    });
  };

  return (
    <Sider breakpoint="lg" collapsedWidth="0">
      <Space className="userInfo" direction="vertical" align="center">
        <Link to="/">
          <Avatar
            size={64}
            src="https://global.ebs.co.kr/global/img/sub/programs_01.jpg"
          />
          <h3 style={{ textAlign: 'center' }}>{user.userData?.userName}</h3>
        </Link>
        <Space split={<Divider type="vertical" />}>
          <Typography>{user.userData?.role}</Typography>
          <Button type="link" onClick={handleLogout} style={{ padding: 0 }}>
            LOGOUT
          </Button>
        </Space>
      </Space>
      <Menu mode="inline" className="menuList" defaultSelectedKeys={[menu]}>
        <Menu.Item key="1" icon={<PushpinOutlined />}>
          <Link to="/journey">촬영이력-지도</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<UnorderedListOutlined />}>
          <Link to="/journeyList">촬영이력-목록</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<VideoCameraOutlined />}>
          <Link to="/equipment">장비관리</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<TagsOutlined />}>
          <Link to="/projects">프로젝트관리</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<TeamOutlined />}>
          <Link to="/users">유저관리</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<SettingOutlined />}>
          <Link to="/programInfo">프로그램정보</Link>
        </Menu.Item>
        <Menu.Item key="7" icon={<LinkOutlined />}>
          <Link to="/referenceLink">참고 링크</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default withRouter(MenuBar);
