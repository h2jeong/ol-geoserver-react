import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Select,
  List
} from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { config } from '../../../../config';
import { createUpload, updateUpload } from '../../../../store/journey';
import EditorToast from '../../../common/EditorToast';

const { Option } = Select;

/** 데이터 업로드 보고 */
const UploadReport = () => {
  const journey = useSelector(
    ({ journey }) => ({
      current: journey.current,
      mode: journey.mode
    }),
    shallowEqual
  );
  const [content, setContent] = useState('업로드중 특이사항 메모');
  const [checked, setChecked] = useState(false);
  const [statusList, setStatusList] = useState([]);

  const uploadRef = useRef(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(`${config.twr_api}/api/worker/contents/journey/status/upload`)
      .then((res) => {
        if (res.data.success) {
          setStatusList(res.data.status);
        }
      });
  }, []);

  useEffect(() => {
    if (!journey.current || journey.mode !== 'view') return;
    const { uploadStep } = journey.current;

    setContent(uploadStep?.content);
    uploadRef.current.getInstance().setMarkdown(uploadStep?.content);
  }, [journey.current]);

  const handleSubmit = async () => {
    let apiUrl;

    if (!checked) {
      if (!journey.current?.uploadStep) {
        message.info('폴더 존재여부 확인해주세요.');
        return;
      } else {
        if (
          journey.current?.uploadStep?.nasPath !== form.getFieldValue('nasPath')
        ) {
          message.info('폴더 존재여부 확인해주세요.');
          return;
        } else {
          apiUrl = updateUpload;
        }
      }
    } else {
      if (!journey.current?.uploadStep) {
        apiUrl = createUpload;
      } else {
        apiUrl = updateUpload;
      }
    }

    try {
      const row = await form.validateFields();

      let variables = {
        ...row,
        content: uploadRef.current.getInstance().getMarkdown(),
        status: statusList?.find((item) => item.name === row.status)?.uuid
      };
      setContent(uploadRef.current.getInstance().getMarkdown());

      dispatch(apiUrl(variables))
        .then((res) => {
          if (!res.payload.success) {
            message.error(`Error message: ${res.payload.message}`, 10);
            return false;
          } else {
            window.location.reload();
          }
        })
        .catch((err) => {
          message.error(`Error message - ${err}`, 10);
        });
    } catch (err) {
      console.log('err:', err);
    }
    setChecked(false);
  };

  const onReset = () => {
    form.resetFields();
    setChecked(false);

    if (journey.mode === 'view' && journey.current.uploadStep?.content) {
      setContent(journey.current.uploadStep?.content);
      uploadRef.current
        .getInstance()
        .setMarkdown(journey.current.uploadStep?.content);
    } else {
      setContent(null);
      uploadRef.current.getInstance().setMarkdown(null);
    }
  };

  const handleCheckFolder = () => {
    const path = form.getFieldValue('nasPath');
    if (!path) {
      message.info('경로를 입력하세요.');
      return;
    }
    axios
      .post(`${config.twr_api}/api/worker/contents/util/checkFolderExist`, {
        path
      })
      .then((res) => {
        const { success, bExist } = res.data;
        if (success && res.data.message) message.info(res.data.message);
        setChecked(bExist);
      });
  };

  const uploadHistory = useCallback(() => {
    if (!journey.current?.content) return;
    return journey.current?.content.split(';');
  }, [journey.current]);

  const handleWrite = (e) => {
    if (e) {
      if (
        journey.current?.uploadStep?.nasPath !== form.getFieldValue('nasPath')
      )
        setChecked(false);
    }
  };

  return (
    <Form
      onFinish={handleSubmit}
      form={form}
      layout="vertical"
      initialValues={{
        journeyId: journey.current?.id,
        nasPath: journey.current?.uploadStep?.nasPath,
        status: journey.current?.status
      }}>
      <Divider orientation="center">업로드 된 NAS 경로</Divider>

      <Row>
        <Col flex="8">
          <Form.Item name="nasPath">
            <Input size="large" onChange={handleWrite} />
          </Form.Item>
        </Col>
        <Col flex="2">
          <Button
            size="large"
            style={{
              width: 'calc(100% - 10px)',
              marginLeft: '10px',
              fontSize: '14px'
            }}
            type="primary"
            onClick={handleCheckFolder}
            disabled={checked}>
            {checked ? '✔ 확인 완료' : '폴더 존재여부 확인'}
          </Button>
        </Col>
      </Row>

      <ul>
        <li>Z:\\ 가 아닌 실제 나스경로를 넣어주세요.</li>
        <li>라운드까지만 경로를 입력하면 됩니다. </li>
        <li>업로드가 모두 완료된 다음에 등록하기를 눌러주세요.</li>
      </ul>
      <Divider orientation="center">업로드상태</Divider>
      <Form.Item name="status">
        <Select
          placeholder="Please select a status."
          // onChange={onChange}
          style={{
            width: '100%'
          }}
          size="large">
          {statusList?.length >= 1 &&
            statusList?.map((item) => {
              return (
                <Option value={item.name} key={item.uuid}>
                  {item.name}
                </Option>
              );
            })}
        </Select>
      </Form.Item>
      <br />
      <br />

      <List
        header={<div>업로드상태 변경 이력</div>}
        bordered
        size="small"
        dataSource={uploadHistory()}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
      <br />
      <Divider orientation="center">메모</Divider>
      <EditorToast
        initialValue={content}
        height="300px"
        editorRef={uploadRef}
      />
      <Form.Item name="journeyId">
        <Input type="hidden" />
      </Form.Item>
      <Form.Item
        wrapperCol={{
          offset: 10,
          span: 8
        }}>
        <Button type="primary" htmlType="submit">
          등록하기
        </Button>
        <Button htmlType="button" onClick={onReset} style={{ marginLeft: 8 }}>
          취소하기
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UploadReport;
