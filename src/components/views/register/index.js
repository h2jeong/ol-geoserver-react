/* eslint-disable no-undef */
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { config } from '../../../config';

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 8
    }
  },
  wrapperCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 16
    }
  }
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 16,
      offset: 8
    }
  }
};

/**회원가입 화면 */
const RegisterPage = (prop) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    axios.post(`${config.twr_api}/api/account/register`, values).then((res) => {
      if (res.data.success) {
        message.success({
          content: '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.',
          style: {
            marginTop: '15vh'
          }
        });
        prop.history.push('/login');
      } else message.warn(res.data.message);
    });
  };

  return (
    <Form
      {...formItemLayout}
      form={form}
      className="login-form register-form"
      name="register"
      onFinish={onFinish}
      scrollToFirstError>
      <h1>REGISTER</h1>
      <Form.Item
        name="userId"
        label="UserId"
        rules={[
          {
            required: true,
            message: 'Please input your UserId!'
          }
        ]}>
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            required: true,
            message: 'Please input your password!'
          }
        ]}
        hasFeedback>
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Confirm Password"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'Please confirm your password!'
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }

              return Promise.reject(
                new Error('The two passwords that you entered do not match!')
              );
            }
          })
        ]}>
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="name"
        label="Name"
        rules={[
          {
            required: true,
            message: 'Please input your name!',
            whitespace: true
          }
        ]}>
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input />
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          Register
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterPage;
