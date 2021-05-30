import React, { useEffect, useState } from 'react';
import { Drawer, Form, Row, Col, Input, Select, Button } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { createEquip, updateEquip } from '../../../../store/equipment';

const { Option } = Select;

const DrawerEquip = ({ mode, equip, visible, onClose, list }) => {
  const user = useSelector(({ user }) => ({ list: user.list }), shallowEqual);

  const [fields, setFields] = useState([]);
  const [form] = Form.useForm();

  const dispatch = useDispatch();

  useEffect(() => {
    setFields([
      { name: 'uuid', value: equip?.id },
      { name: 'name', value: equip?.name },
      { name: 'serialNum', value: equip?.serialNum },
      { name: 'manager', value: equip?.manager },
      { name: 'isOnline', value: equip?.isOnline },
      { name: 'isRemote', value: equip?.isRemote },
      { name: 'description', value: equip?.description }
    ]);
  }, [equip]);

  const handleSubmit = async () => {
    try {
      const row = await form.validateFields();

      switch (mode) {
        case 'Create':
          delete row.uuid;
          dispatch(createEquip(row));
          form.resetFields();
          break;
        case 'Edit':
          dispatch(updateEquip(row, list));
          break;
      }

      handleClose();
    } catch (err) {
      console.log('err:', err);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={`${mode} Equipment`}
      placement="right"
      closable={false}
      onClose={onClose}
      width={720}
      bodyStyle={{ paddingBottom: 80 }}
      visible={visible}
      footer={
        <div
          style={{
            textAlign: 'right'
          }}>
          <Button onClick={handleClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="primary">
            Submit
          </Button>
        </div>
      }>
      <Form
        form={form}
        layout="vertical"
        hideRequiredMark
        fields={fields}
        onFieldsChange={(newFields) => setFields(newFields)}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter user name' }]}>
              <Input placeholder="Please enter user name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            {mode === 'Edit' && (
              <Form.Item
                name="uuid"
                label="uuid"
                rules={[{ required: true, message: 'Please enter uuid' }]}>
                <Input
                  placeholder="Please enter uuid"
                  disabled={mode === 'Edit'}
                />
              </Form.Item>
            )}
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="manager"
              label="Manager"
              rules={[
                { required: true, message: 'Please select an manager.' }
              ]}>
              <Select placeholder="Please select an manager.">
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
          </Col>
          <Col span={12}>
            <Form.Item
              name="serialNum"
              label="SerialNo"
              rules={[{ required: true, message: 'Please enter serialNo' }]}>
              <Input placeholder="Please enter serialNo" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="isRemote" label="Allow Remote Control">
              <Select placeholder="Not Yet" disabled>
                <Option value={0}>불허</Option>
                <Option value={1}>허용</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isOnline" label="Online">
              <Select placeholder="Not Yet" disabled>
                <Option value={0}>Offline</Option>
                <Option value={1}>Online</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="description" label="장비 접속 기록">
              <Input.TextArea disabled rows={4} placeholder="Not Yet" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default DrawerEquip;
