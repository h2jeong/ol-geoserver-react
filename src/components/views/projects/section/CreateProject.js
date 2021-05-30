/* eslint-disable no-unused-vars */
import { Modal, Form, Input, Select } from 'antd';
import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { createProject } from '../../../../store/project';
const { Option } = Select;
const { TextArea } = Input;

const CreateProject = ({ visible, confirmLoading, handleOk, handleCancel }) => {
  const user = useSelector(({ user }) => ({ list: user.list }), shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const row = await form.validateFields();
      // const validate = Object.values(row).every((el) => !!el);
      // if (!validate) return;

      dispatch(createProject(row)).then((res) => {
        if (res.payload.success) handleOk();
        else alert('생성실패');
        onHandleCancel();
      });
    } catch (err) {
      console.log('err:', err);
    }
  };

  const onHandleCancel = () => {
    form.resetFields();
    handleCancel();
  };

  const renderForm = () => (
    <Form form={form} layout="vertical" name="basic">
      <Form.Item label="프로젝트 이름" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="식별코드" name="code" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="프로젝트 관리자"
        name="adminBy"
        rules={[{ required: true }]}>
        <Select placeholder="Please select an adminBy">
          {user.list?.length >= 1 &&
            user.list?.map((item) => {
              return (
                <Option value={item.id} key={item.id}>
                  {item.userName}
                </Option>
              );
            })}
        </Select>
      </Form.Item>
      <Form.Item label="설명" name="description">
        <TextArea
          placeholder="Autosize height based on content lines"
          autoSize
        />
      </Form.Item>
    </Form>
  );

  return (
    <Modal
      title="촬영계획 추가"
      visible={visible}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
      onCancel={onHandleCancel}>
      {renderForm()}
    </Modal>
  );
};

export default CreateProject;
