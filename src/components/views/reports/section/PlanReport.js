/* eslint-disable no-unused-vars */
import { Button, Checkbox, Divider, message, Upload } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import EditorToast from '../../../common/EditorToast';
import GeoMap from '../../journey/section/GeoMap';
import { UploadOutlined } from '@ant-design/icons';
import LayerTable from './LayerTable';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { createPlan, updateLine, updatePlan } from '../../../../store/journey';
import MakeVectorLayers, {
  changeStyle,
  getGeoJSONfromFile,
  getGeoJSONFromGeoSever,
  getImageWMS
} from '../../../common/MakeVectorLayers';
import { getProjectOne } from '../../../../store/project';
import { useHistory } from 'react-router';

const PlanReport = () => {
  const journey = useSelector(
    ({ journey }) => ({ current: journey.current, mode: journey.mode }),
    shallowEqual
  );

  const [content, setContent] = useState('촬영계획 메모');
  const [uploading, setUploading] = useState(false);
  const [isShowDraft, setIsShowDraft] = useState(false);

  const [fileList, setFileList] = useState([]);
  const [layerList, setLayerList] = useState([]);
  const [layerInfos, setLayerInfos] = useState([]);
  const [newLayerInfos, setNewLayerInfos] = useState([]);

  const ref = useRef(null);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (!journey.current?.planStep) return;

    const { planStep } = journey.current;
    console.log('plan:', planStep);
    const layers = planStep?.planLayers
      ?.filter((item) => item.mission)
      .map((item) => ({
        ...item,
        key: item.id,
        fileName: item.name
      }));

    setLayerInfos(layers);
    setContent(planStep?.content);
    ref.current.getInstance().setMarkdown(planStep?.content);
  }, [journey.current]);

  useEffect(() => {
    async function fetchApi() {
      const { drafts, projectId, planStep } = journey.current;

      let layers = [];
      for (let i = 0; i < planStep?.planLayers?.length; i += 1) {
        const { isEnabled, lineColor, id, lineWidth, mission } =
          planStep?.planLayers[i];
        if (!mission) continue;

        const data = await getGeoJSONFromGeoSever(id, 'mission');
        const geoVectorLayer = await MakeVectorLayers(data, 'tempLayer', {
          lineColor,
          lineWidth,
          isEnabled
        });

        geoVectorLayer.set('key', id);
        geoVectorLayer.setZIndex(105);
        layers.push(geoVectorLayer);
      }

      let draftLayers = [];

      if (drafts && drafts.length > 0) {
        draftLayers = drafts;
      } else {
        dispatch(getProjectOne(projectId)).then(async (res) => {
          const { drafts, id } = await res.payload;
          draftLayers = drafts ? drafts : [];
        });
      }

      for (let i = 0; i < draftLayers?.length; i += 1) {
        const { uuid, type } = drafts[i];
        const wmsLayer = await getImageWMS(
          uuid,
          'draft',
          'ImageWMS',
          '#35C',
          2,
          isShowDraft,
          type,
          projectId
        );

        layers.push(wmsLayer);
      }

      setTimeout(() => {
        setLayerList(layers);
      }, 1000);
    }

    if (!journey.current?.planStep?.planLayers && !journey.current?.drafts)
      return;

    fetchApi();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fileList.length) {
      message.warn('업로드할 경로가 없습니다.');
      return;
    }
    const formData = new FormData();
    let apiUrl;

    if (!layerInfos.length) {
      apiUrl = createPlan;

      formData.append('bPlanLayer', true);
      formData.append('bPlanGeom', false);
    } else {
      apiUrl = updatePlan;
    }

    fileList.forEach((file) => {
      const { originFileObj } = file;
      formData.append('file[]', originFileObj);
    });
    const updatedLayers = newLayerInfos
      //.filter((item) => !item.id && item.isEnabled)
      .map((item) => ({
        fileName: item.fileName,
        lineColor: item.lineColor,
        lineWidth: item.lineWidth * 1
      }));

    formData.append('journeyId', journey.current.id);
    formData.append('layers', JSON.stringify(updatedLayers));
    formData.append('content', ref.current.getInstance().getMarkdown());
    console.log('plan::', ...formData);
    setContent(ref.current.getInstance().getMarkdown());
    setUploading(true);

    setTimeout(() => {
      try {
        dispatch(apiUrl(formData))
          .then((res) => {
            if (!res.payload.success) {
              message.error(`Error message: ${res.payload.message}`, 10);
              return false;
            } else {
              setFileList([]);
              setContent('');
              setNewLayerInfos([]);
              setLayerInfos([]);
              setLayerList([]);

              message.info('Successful Upload Data ');
              window.location.reload();
            }
          })
          .catch((err) => {
            const errObj = err.toJSON();
            message.error(errObj.message, 10);
          });
      } catch (err) {
        message.error('Failed to upload file.', 100);
      }

      setUploading(false);
    }, 1000);
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleChangeNew = async (key, name, value) => {
    let selected = newLayerInfos.find((item) => item.key === key);
    selected = { ...selected, [name]: value };

    const updated = layerList.map((item) => {
      if (item.get('key') === key) {
        return changeStyle(item, selected);
      } else {
        return item;
      }
    });

    setNewLayerInfos(
      newLayerInfos.map((item) => (item.key === key ? selected : item))
    );
    setLayerList(updated);
  };

  const handleChange = async (key, name, value) => {
    let selected = layerInfos.find((item) => item.key === key);
    selected = { ...selected, [name]: value };

    const updated = layerList.map((item) => {
      if (item.get('key') === key) {
        return changeStyle(item, selected);
      } else {
        return item;
      }
    });

    if (selected.id) {
      dispatch(updateLine(selected)).then((res) => {
        if (res.payload.id === key) {
          message.success('속성 변경 성공');
        } else message.info('속성 변경 실패');
      });
    }

    setLayerInfos(
      layerInfos.map((item) => (item.key === key ? selected : item))
    );
    setLayerList(updated);
  };

  const props = {
    multiple: true,
    onRemove: (file) => {
      setNewLayerInfos(newLayerInfos.filter((item) => item.key !== file.uid));
      setLayerList(layerList.filter((item) => item.get('key') !== file.uid));
    },
    beforeUpload: async (file, fileList) => {
      let newLayerList = [];
      let newInfos = [];
      for (let i = 0; i < fileList.length; i += 1) {
        const layer = await makeLayer(fileList[i], 'tempLayer');

        layer.set('key', fileList[i].uid);
        newLayerList.push(layer);

        const layerInfo = {
          key: fileList[i].uid,
          fileName: fileList[i].name,
          lineColor: '#ff0000',
          lineWidth: 1,
          isEnabled: true
        };
        newInfos.push(layerInfo);
      }

      setTimeout(() => {
        setLayerList([...layerList, ...newLayerList]);
        setNewLayerInfos([...newLayerInfos, ...newInfos]);
      }, 1000);

      return false;
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    fileList
  };

  const handleShowDraft = (e) => {
    if (!journey.current?.projectId) return;

    setIsShowDraft(e.target.checked);

    for (let i = 0; i < layerList.length; i += 1) {
      if (layerList[i].get('key') === journey.current?.projectId) {
        layerList[i].setVisible(e.target.checked);
      }
    }
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

  return (
    <>
      <Divider>신규 업로드</Divider>

      <br />
      <Upload {...props}>
        <Button
          size="large"
          type="primary"
          icon={<UploadOutlined />}
          style={{ fontSize: '14px' }}>
          파일에서 추가하기
        </Button>
      </Upload>
      <br />
      <p>
        * 현재 경로는 빨간색 실선으로 표시됩니다. 촬영시 혼동되지 않게 적절한
        색깔을 설정하세요.
      </p>
      <br />

      <LayerTable
        dataList={layerInfos}
        handleChange={handleChange}
        editable="true"
      />
      {newLayerInfos.length > 0 && (
        <LayerTable
          showHeader={false}
          dataList={newLayerInfos}
          handleChange={handleChangeNew}
          editable="true"
        />
      )}
      <br />
      <Divider>지도</Divider>
      <GeoMap addLayers={layerList} />
      <Checkbox onChange={handleShowDraft}>프로젝트 DRAFT 경로 표시</Checkbox>
      <br />
      <Divider>메모</Divider>
      <EditorToast initialValue={content} height="200px" editorRef={ref} />
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

export default PlanReport;
