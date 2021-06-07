import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Upload, Button, Divider, message, Alert, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import EditorToast from '../../../common/EditorToast';
import {
  changeMode,
  createJourney,
  createRecord,
  updateRecord
} from '../../../../store/journey';
import EachEquip from '../../equipment/section/EachEquip';
import axios from 'axios';
import { config } from '../../../../config';

const { Option } = Select;

const LogUpload = ({ title }) => {
  const journey = useSelector(
    ({ journey }) => ({ current: journey.current, mode: journey.mode }),
    shallowEqual
  );
  const equipment = useSelector(
    ({ equipment }) => ({ list: equipment.list }),
    shallowEqual
  );

  const project = useSelector(
    ({ project }) => ({ current: project.current }),
    shallowEqual
  );

  const [file, setFile] = useState(null);
  const [content, setContent] = useState('업로드중 특이사항 메모');
  const [vehicleId, setVehicleId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const logRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!journey.current || journey.mode !== 'view') return;
    const { recordStep, vehicle } = journey.current;

    setVehicleId(vehicle?.id);
    setContent(recordStep?.content);
    logRef.current.getInstance().setMarkdown(recordStep?.content);
  }, [journey.current]);

  const chcekcLogFileAvailable = async (file) => {
    if (!file) {
      message.warn('업로드 가능 체크');
      return;
    }

    const formData = new FormData();

    formData.append('file[]', file);

    const result = await axios
      .post(
        `${config.twr_api}/api/worker/contents/util/checkLogFileAvailable`,
        formData,
        {
          header: { 'content-type': 'multipart/form-data' }
        }
      )
      .then((res) => res.data)
      .catch((err) => {
        return err.toJSON();
      });
    return result;
  };

  const props = {
    maxCount: 1,
    onRemove: () => {
      setFile(null);
    },
    beforeUpload: async (file) => {
      const result = await chcekcLogFileAvailable(file);

      if (result.success) {
        if (result.bAvailable) {
          setFile(file);
          return false;
        } else {
          alert('log파일을 확인해주세요.', result.message);
          return;
        }
      } else {
        message.error('ERROR Message.', 10);
        return;
      }
    }
  };

  const getJourneyId = async () => {
    const variables = {
      projectId: project.current,
      name: title,
      description: ''
    };

    const journey = await dispatch(createJourney(variables)).then((res) => {
      if (res.payload) {
        return res.payload.id;
      } else {
        message.warn('filed:', res.payload);
      }
    });
    return journey;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let journeyId = null;

    if (journey.mode === 'add') {
      journeyId = await getJourneyId();
    } else {
      journeyId = journey.current?.id;
    }

    if (!journeyId) return;

    const formData = new FormData();
    let apiUrl;
    if (journey.mode === 'view' && journey.current?.recordStep?.recordLayers) {
      apiUrl = updateRecord;

      file && formData.append('file[]', file);
      message.info('Log 업로드 시작');
      vehicleId && formData.append('vehicleId', vehicleId);
    } else {
      if (!file) {
        message.warn('업로드할 파일이 없습니다.');
        return;
      }
      apiUrl = createRecord;

      formData.append('bRecordLayer', true);
      formData.append('bRecordGeom', false);
      formData.append('file[]', file);
      formData.append('vehicleId', vehicleId);
    }

    formData.append('journeyId', journeyId);
    formData.append('content', logRef.current.getInstance().getMarkdown());

    setContent(logRef.current.getInstance().getMarkdown());
    setUploading(true);

    setTimeout(() => {
      try {
        dispatch(apiUrl(formData))
          .then((res) => {
            if (!res.payload.success) {
              setUploading(false);
              message.error(`Error message: ${res.payload.message}`, 10);
              return false;
            } else {
              setFile(null);
              setContent('');
              setVehicleId(null);
              setUploading(false);

              message.success('Successful Upload Data ');
              dispatch(changeMode('view'));
              window.location.reload();
              return true;
            }
          })
          .catch((err) => {
            setUploading(false);
            message.error(`Error message - ${err}`, 10);
            return false;
          });
      } catch (err) {
        setUploading(false);
        message.error('Failed to upload file.');
        return false;
      }
    }, 100);
  };

  const handleReset = () => {
    window.location.reload();
  };

  const onChange = (value) => {
    const vehicleId = equipment.list?.find((item) => item.id === value).id;
    setVehicleId(vehicleId);
  };

  return (
    <>
      <Divider>LOG파일 업로드</Divider>
      <div
        style={
          journey.mode === 'view' && journey.current?.recordStep?.recordLayers
            ? {
                display: 'block',
                margin: '1rem 0'
              }
            : { display: 'none' }
        }>
        <Alert
          message="새로 추가할 경우 기존 업로드된 파일은 삭제됩니다."
          type="warning"
          showIcon
        />
        <p
          style={{
            margin: '1rem 0',
            padding: '1rem',
            color: '#aaa',
            border: '1px solid #eee',
            borderRadius: '5px'
          }}>
          업로드된 로그 파일 경로 :
          {journey.mode === 'view' &&
            journey.current.recordStep?.recordLayers &&
            journey.current.recordStep?.recordLayers[0].filePath}
        </p>
      </div>
      <Upload {...props}>
        <Button
          size="large"
          type="primary"
          icon={<UploadOutlined />}
          style={{ fontSize: '14px' }}>
          파일에서 추가하기
        </Button>
      </Upload>
      <Divider>장비 선택</Divider>
      <Select
        placeholder="Please select a vehicle."
        onChange={onChange}
        defaultValue={journey.current?.vehicle?.id}
        style={{
          width: '100%'
        }}
        size="large">
        {equipment.list?.length >= 1 &&
          equipment.list?.map((item) => {
            return (
              <Option value={item.id} key={item.id}>
                {item.name}
              </Option>
            );
          })}
      </Select>
      <br />
      <br />
      {journey.mode === 'view' && journey.current?.vehicle && (
        <EachEquip
          equip={equipment.list?.find((item) => item.id === vehicleId)}
        />
      )}
      <Divider>메모</Divider>
      <EditorToast initialValue={content} height="200px" editorRef={logRef} />
      <br />
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" onClick={handleSubmit} loading={uploading}>
          {uploading ? 'Uploading' : '등록하기'}
        </Button>
        <Button
          htmlType="button"
          onClick={handleReset}
          style={{ marginLeft: 8 }}>
          취소하기
        </Button>
      </div>
    </>
  );
};

export default LogUpload;
