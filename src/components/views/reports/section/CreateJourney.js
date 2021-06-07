import React from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  changeMode,
  createJourney,
  updateJourney
} from '../../../../store/journey';
import { useHistory } from 'react-router';
const { Option } = Select;

const layout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 16
  }
};

const CreateJourney = ({ title }) => {
  const project = useSelector(
    ({ project }) => ({ list: project.list, current: project.current }),
    shallowEqual
  );
  const journey = useSelector(
    ({ journey }) => ({ current: journey.current, mode: journey.mode }),
    shallowEqual
  );
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    switch (journey.mode) {
      case 'write':
        dispatch(createJourney(values)).then((res) => {
          if (res.payload) {
            dispatch(changeMode('view'));
            window.location.reload();
          } else {
            message.warn('filed:', res.payload);
          }
        });
        break;
      case 'view': {
        if (!journey.current) return;
        dispatch(
          updateJourney(journey.current.id, values, journey.current)
        ).then((res) => {
          if (res.payload.id === journey.current.id) {
            window.location.reload();
          }
        });
        break;
      }
      default:
        break;
    }
  };

  const onReset = () => {
    form.resetFields();
    if (journey.mode === 'write') history.push('/journey');
  };

  return (
    <Form
      form={form}
      {...layout}
      onFinish={onFinish}
      initialValues={{
        projectId: ['none', 'all'].includes(project.current)
          ? null
          : project.current,
        name: journey.mode === 'write' ? null : title,
        description: journey.mode === 'view' ? journey.current?.description : ``
      }}>
      {journey.mode === 'write' && (
        <Form.Item
          label="프로젝트명"
          name="projectId"
          rules={[{ required: true, message: 'Please select project!' }]}>
          <Select>
            {project.list?.length >= 1 &&
              project.list?.map((item) => {
                return (
                  <Option value={item.id} key={item.id}>
                    {item.name}
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        label="촬영계획명"
        name="name"
        rules={[
          {
            required: true,
            message: 'Please input the journey name!'
          }
        ]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
        <Button type="primary" htmlType="submit">
          {journey.mode === 'write' ? '등록하기' : '수정하기'}
        </Button>
        <Button htmlType="button" onClick={onReset} style={{ marginLeft: 8 }}>
          취소하기
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateJourney;
