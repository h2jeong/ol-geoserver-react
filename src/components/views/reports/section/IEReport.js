import { Button, Col, Divider, Form, Input, message, Row } from 'antd';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { config } from '../../../../config';
import { createIe, updateIe } from '../../../../store/journey';
import EditorToast from '../../../common/EditorToast';

/** IE 처리보고 */
const IEReport = () => {
  const journey = useSelector(
    ({ journey }) => ({ current: journey.current, mode: journey.mode }),
    shallowEqual
  );
  const [content, setContent] = useState('IE처리 특이사항 메모');
  const [checked, setChecked] = useState(false);

  const ieRef = useRef(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!journey.current || journey.mode !== 'view') return;
    const { ieStep } = journey.current;

    setContent(ieStep?.content);
    ieRef.current.getInstance().setMarkdown(ieStep?.content);
  }, [journey.current]);

  const handleSubmit = async () => {
    let apiUrl;

    if (!checked) {
      if (!journey.current?.ieStep) {
        message.info('폴더 존재여부 확인해주세요.');
        return;
      } else {
        if (
          journey.current?.ieStep?.insFilePath !==
          form.getFieldValue('insFilePath')
        ) {
          message.info('폴더 존재여부 확인해주세요.');
          return;
        } else {
          apiUrl = updateIe;
        }
      }
    } else {
      if (!journey.current?.ieStep) {
        apiUrl = createIe;
      } else {
        apiUrl = updateIe;
      }
    }

    try {
      const row = await form.validateFields();
      const content = ieRef.current.getInstance().getMarkdown();
      let variables = { ...row, content };

      setContent(ieRef.current.getInstance().getMarkdown());

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

    if (journey.current.ieStep?.content) {
      setContent(journey.current.ieStep?.content);
      ieRef.current.getInstance().setMarkdown(journey.current.ieStep?.content);
    } else {
      setContent(null);
      ieRef.current.getInstance().setMarkdown(null);
    }
  };

  const handleCheckFolder = () => {
    const insFilePath = form.getFieldValue('insFilePath');
    if (!insFilePath) {
      message.info('경로와 파일명을 입력하세요.');
      return;
    }

    axios
      .post(`${config.twr_api}/api/worker/contents/util/checkFileExist`, {
        path: insFilePath
      })
      .then((res) => {
        const { success, bExist } = res.data;
        if (success && res.data.message) message.info(res.data.message);
        setChecked(bExist);
      });
  };

  const handleWrite = (e) => {
    if (e) {
      if (
        journey.current?.ieStep?.insFilePath !==
        form.getFieldValue('insFilePath')
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
        insFilePath: journey.current?.ieStep?.insPath
      }}>
      <Divider orientation="center">ins txt 파일 경로</Divider>

      <Row>
        <Col flex="8">
          <Form.Item name="insFilePath" extra="경로 전체 넣으세요.">
            <Input size="large" onChange={handleWrite} />
          </Form.Item>
        </Col>
        <Col flex="2">
          <Button
            size="large"
            style={{ width: '100%', marginLeft: '10px', fontSize: '14px' }}
            type="primary"
            onClick={handleCheckFolder}
            disabled={checked}>
            {checked ? '✔ 확인 완료' : '파일 존재여부 확인'}
          </Button>
        </Col>
      </Row>

      <Divider>메모</Divider>
      <EditorToast initialValue={content} height="300px" editorRef={ieRef} />
      <Form.Item name="journeyId">
        <Input type="hidden" />
      </Form.Item>
      <Form.Item
        wrapperCol={{
          offset: 10,
          span: 8
        }}>
        <Button type="primary" htmlType="submit">
          저장하기
        </Button>
        <Button htmlType="button" onClick={onReset} style={{ marginLeft: 8 }}>
          취소하기
        </Button>
      </Form.Item>
    </Form>
  );
};

export default IEReport;
