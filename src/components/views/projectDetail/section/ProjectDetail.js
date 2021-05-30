/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Select,
  Upload
} from 'antd';
import Title from 'antd/lib/typography/Title';
import { DownloadOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { config } from '../../../../config';
import { getJourneyForProject, getProjectOne } from '../../../../store/project';
import { addGeom, editMode, updateProject } from '../../../../store/project';
import MakeVectorLayers, {
  getGeoJSONfromFile,
  getImageWMS
} from '../../../common/MakeVectorLayers';
import GeoMap from '../../journey/section/GeoMap';
const { Option } = Select;

const ProjectDetail = ({ projectInfo }) => {
  const project = useSelector(
    ({ project }) => ({
      edit: project.edit
    }),
    shallowEqual
  );
  const user = useSelector(({ user }) => ({ list: user.list }), shallowEqual);

  const [fileList, setFileList] = useState([]);
  const [layerList, setLayerList] = useState([]);
  const [fields, setFields] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  useEffect(() => {
    setFields([
      { name: 'uuid', value: projectInfo?.id },
      { name: 'name', value: projectInfo?.name },
      { name: 'adminBy', value: projectInfo?.adminBy },
      { name: 'description', value: projectInfo?.description }
    ]);
  }, [projectInfo]);

  useEffect(() => {
    async function fetchApi() {
      const { drafts, isEnabled, id } = projectInfo;
      let tempList = [];

      if (!isEnabled) return;

      for (let i = 0; i < drafts?.length; i += 1) {
        const { uuid, type } = drafts[i];
        const wmsLayer = await getImageWMS(
          uuid,
          'draft',
          'ImageWMS',
          '#35C',
          2,
          true,
          type,
          id
        );

        tempList.push(wmsLayer);
      }
      setLayerList([...tempList, ...layerList]);
    }

    if (!projectInfo) return;
    fetchApi();
  }, [projectInfo]);

  const handleReset = () => {
    dispatch(editMode(false));
    form.resetFields();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const row = await form
      .validateFields()
      .then((values) => {
        values.uuid = projectInfo?.id;
        return values;
      })
      .catch((err) => {
        err.errorFields.map((item) => {
          message.error(item.errors[0]);
        });
        return false;
      });

    if (!row) return;

    setUploading(true);

    setTimeout(() => {
      try {
        if (fileList.length > 0) {
          message.info('geojson 저장 시작');
          const formData = new FormData();

          fileList.forEach((file) => {
            const { originFileObj } = file;
            formData.append('file[]', originFileObj);
          });
          formData.append('projectId', projectInfo.id);

          dispatch(addGeom(formData));
        }
      } catch (err) {
        setUploading(false);
        message.error('Failed to upload file.');
        return false;
      }

      dispatch(updateProject(row)).then((res) => {
        if (res.payload.success) {
          setFileList([]);
          setLayerList([]);
          setUploading(false);

          const { id } = res.payload.project;

          dispatch(getProjectOne(id));
          dispatch(getJourneyForProject(id)).then((res) => {
            console.log('update:', res.payload);
            message.success('Success to update project.');
            dispatch(editMode(false));
            window.location.reload();
          });
        } else {
          message.error('Failed to update project.');
        }

        return true;
      });
    }, 1000);
  };

  const props = {
    multiple: true,
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newList = layerList.slice();

      newList.splice(index, 1);
      setLayerList(newList);
    },
    beforeUpload: async (file, fileList) => {
      message.info('geojson 표시 시작');
      let newList = [];
      for (let i = 0; i < fileList.length; i += 1) {
        const layer = await makeLayer(fileList[i]);

        layer.set('key', fileList[i].uid);
        newList.push(layer);
      }
      setTimeout(() => {
        setLayerList(newList);
        message.info('geojson 표시 완료');
      }, 1000);
      return false;
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    fileList
  };

  const makeLayer = async (file) => {
    const data = await getGeoJSONfromFile(file);
    if (data.name === 'Error') {
      message.error('파일을 불러올 수 없습니다.');
      return;
    }
    const layer = await MakeVectorLayers(data, 'tempLayer');

    return layer;
  };

  const handleEdit = () => {
    dispatch(editMode(true));
  };

  return (
    <>
      <Title level={4}>
        {project.edit ? '프로젝트 수정하기' : '프로젝트 상세보기'}
      </Title>
      <div style={{ textAlign: 'right' }}>
        {project.edit ? (
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={uploading}
            size="large">
            {uploading ? 'Uploading' : '저장하기'}
          </Button>
        ) : (
          <Button type="primary" onClick={handleEdit} size="large">
            프로젝트 수정하기
          </Button>
        )}
        <Button
          htmlType="button"
          onClick={handleReset}
          style={{ marginLeft: 8 }}
          size="large">
          취소하기
        </Button>
      </div>
      <Divider>프로젝트 정보</Divider>
      <Form
        form={form}
        layout="vertical"
        hideRequiredMark
        fields={fields}
        onFieldsChange={(newFields) => setFields(newFields)}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="식별코드">
              <Input disabled value={projectInfo?.code} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="생성자">
              <Input
                disabled
                value={
                  projectInfo?.createdBy &&
                  user.list?.find((item) => item.key === projectInfo?.createdBy)
                    .userName
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="프로젝트 이름"
              rules={[
                { required: true, message: 'Please enter project name.' }
              ]}>
              <Input disabled={!project.edit} ref={scrollRef} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="adminBy"
              label="프로젝트 관리자"
              rules={[{ required: true, message: 'Please enter adminBy' }]}>
              <Select disabled={!project.edit}>
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
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="description" label="설명">
              <Input.TextArea disabled={!project.edit} rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {project.edit && (
        <>
          <Divider>계획 업로드</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Button
                size="large"
                style={{
                  width: '100%'
                }}
                type="default"
                icon={<DownloadOutlined />}
                href={`${config.twr_api}/api/account/test?projectId=${projectInfo?.id}`}
                disabled={projectInfo?.draft && projectInfo?.id}
                target="_blank">
                이전 경로 다운로드
              </Button>
            </Col>
            <Col span={12}>
              <Upload {...props} className="btnUploadDraft">
                <Button
                  size="large"
                  type="primary"
                  style={{
                    width: '100%'
                  }}>
                  신규 경로 업로드 하기
                </Button>
              </Upload>
            </Col>
          </Row>
        </>
      )}
      <Divider>지도</Divider>
      <GeoMap addLayers={layerList} />
      <br />
    </>
  );
};

export default ProjectDetail;
