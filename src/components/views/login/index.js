import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../../store/user';

/** 로그인 화면 */
const LoginPage = (props) => {
  const dispatch = useDispatch();
  const onFinish = (values) => {
    dispatch(loginUser(values)).then((res) => {
      if (res.payload.success) {
        if (!res.payload.user?.isEnabled) {
          message.info('중지된 계정입니다. 확인 후 다시 시도하세요.');
        } else if (res.payload.user?.role === 'ROLE_GUEST') {
          message.info('게스트 권한입니다. 권한 변경 후 다시 로그인 해주세요.');
        }

        props.history.push('/');
      } else {
        message.warn(res.payload.message, 5);
      }
    });
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true
      }}
      onFinish={onFinish}>
      <h1>LOGIN</h1>
      <Form.Item
        name="userId"
        rules={[
          {
            required: true,
            message: 'Please input your UserId!'
          }
        ]}>
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="UserId"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: 'Please input your Password!'
          }
        ]}>
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Log in
        </Button>
        Or <Link to="/register">register now!</Link>
      </Form.Item>
    </Form>
  );
};

export default withRouter(LoginPage);
