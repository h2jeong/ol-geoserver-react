/* eslint-disable no-unused-vars */
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Descriptions, Checkbox, Space, Divider, Spin } from 'antd';
// import { shallowEqual, useSelector } from 'react-redux';
import { getImageWMS } from '../../../common/MakeVectorLayers';
import moment from 'moment';
import { shallowEqual, useSelector } from 'react-redux';

const GeoMap = lazy(() => import('../../journey/section/GeoMap'));

const CheckboxGroup = Checkbox.Group;

const GeoxyzReport = () => {
  const journey = useSelector(
    ({ journey }) => ({ current: journey.current }),
    shallowEqual
  );

  const [layerList, setLayerList] = useState([]);
  const [logData, setLogData] = useState(null);

  const [showDraft, setShowDraft] = useState(true);
  const [planOptions, setPlanOptions] = useState([]);
  const [recordOptions, setRecordOptions] = useState([]);
  const [planCheckedList, setPlanCheckedList] = useState([]);
  const [recordCheckedList, setRecordCheckedList] = useState([]);

  const [checkAll1, setCheckAll1] = useState(false);
  const [checkAll2, setCheckAll2] = useState(false);
  const [indeterminate1, setIndeterminate1] = useState(false);
  const [indeterminate2, setIndeterminate2] = useState(false);

  useEffect(() => {
    const { planStep, recordStep } = journey.current;
    const plans =
      planStep?.planLayers
        ?.filter((item) => item.mission)
        .map((item) => item.name) || [];
    const visiblePlans =
      planStep?.planLayers
        ?.filter((item) => item.isEnabled && item.mission)
        .map((item) => item.name) || [];

    setPlanOptions(plans);
    setPlanCheckedList(visiblePlans);
    setIndeterminate1(
      !!visiblePlans.length && visiblePlans.length < plans.length
    );
    setCheckAll1(!!visiblePlans.length && visiblePlans.length === plans.length);

    const records =
      recordStep?.recordLayers
        ?.filter((item) => item.recorded)
        .map((item) => item.name) || [];
    const visibleRecords =
      recordStep?.recordLayers
        ?.filter((item) => item.isEnabled && item.recorded)
        .map((item) => item.name) || [];

    setRecordOptions(records);
    setRecordCheckedList(visibleRecords);
    setIndeterminate2(
      !!visibleRecords.length && visibleRecords.length < records.length
    );
    setCheckAll2(
      !!visibleRecords.length && visibleRecords.length === records.length
    );
  }, [journey.current?.planStep, journey.current?.recordStep]);

  useEffect(() => {
    async function fetchApi() {
      const { planStep, recordStep, drafts, projectId } = journey.current;
      let tempList = [];

      for (let i = 0; i < planStep?.planLayers?.length; i += 1) {
        const { mission, lineColor, lineWidth, isEnabled, name } =
          planStep?.planLayers[i];

        for (let i = 0; i < mission?.length; i += 1) {
          const { uuid, type } = mission[i];
          const wmsLayer = await getImageWMS(
            uuid,
            'mission',
            'ImageWMS',
            lineColor,
            lineWidth,
            isEnabled,
            type,
            name
          );
          tempList.push(wmsLayer);
        }
      }
      // console.log('recorded:', recordStep);
      for (let i = 0; i < recordStep?.recordLayers?.length; i += 1) {
        const { recorded, isEnabled, name } = recordStep?.recordLayers[i];

        let color = '#008000';
        let size = 5;
        if (name === 'bestPos1') {
          color = '#00ff00';
          size = 2;
        }

        for (let i = 0; i < recorded?.length; i += 1) {
          const { uuid, type } = recorded[i];
          // console.log('recorded:', name, type);
          const wmsLayer = await getImageWMS(
            uuid,
            'recorded',
            'ImageWMS',
            color,
            size,
            isEnabled,
            type,
            name
          );

          tempList.push(wmsLayer);
        }
      }

      if (drafts?.length > 0) {
        for (let i = 0; i < drafts.length; i += 1) {
          const { uuid, type } = drafts[i];
          const wmsLayer = await getImageWMS(
            uuid,
            'draft',
            'ImageWMS',
            '#35C',
            2,
            showDraft,
            type,
            projectId
          );

          tempList.push(wmsLayer);
        }
      }
      setLayerList(tempList);
    }

    if (!journey.current) return;

    fetchApi();
  }, [journey.current]);

  useEffect(() => {
    if (!journey.current?.recordStep) return;

    const { logData, recordLayers, content, isEnabled } =
      journey.current.recordStep;
    const diff = moment.duration(logData?.elapsedTime);
    let hour_val = diff.weeks() * 24 * 7 + diff.days() * 24 + diff.hours();
    const convertElapsed = `${hour_val}시간 ${diff.minutes()}분 ${diff.seconds()}초`;
    const convertDistance = logData?.distance?.toFixed(3);

    setLogData({
      filePath: recordLayers && recordLayers[0].filePath,
      nasPath: journey.current?.uploadStep?.nasPath,
      content: content,
      isEnabled: isEnabled,
      distance: convertDistance,
      startTime: moment(logData?.startTime).format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment(logData?.endTime).format('YYYY-MM-DD HH:mm:ss'),
      cntBestPos: logData?.cntBestPos,
      cntMarkPos1: logData?.cntMarkPos1,
      cntMarkPos4: logData?.cntMarkPos4,
      cntMarkPos3: logData?.cntMarkPos3,
      cntMarkPos2: logData?.cntMarkPos2,
      elapsedTime: convertElapsed
    });
  }, [journey.current?.recordStep?.logData]);

  const onCheckboxPlanChange = (list) => {
    setPlanCheckedList(list);
    setIndeterminate1(!!list.length && list.length < planOptions.length);
    setCheckAll1(list.length === planOptions.length);

    const selected = layerList.filter((item) => item.get('type') === 'mission');
    for (let i = 0; i < selected.length; i += 1) {
      if (list.includes(selected[i].get('key'))) selected[i].setVisible(true);
      else selected[i].setVisible(false);
    }
  };

  const onCheckAllPlanChange = (e) => {
    setPlanCheckedList(e.target.checked ? planOptions : []);
    setIndeterminate1(false);
    setCheckAll1(e.target.checked);

    const selected = layerList.filter(
      (layer) => layer.get('type') === 'mission'
    );
    console.log(
      'onCheckAllPlanChange:',
      e.target.checked,
      planCheckedList,
      selected
    );

    for (let i = 0; i < selected.length; i += 1) {
      selected[i].setVisible(e.target.checked);
    }
  };

  const onCheckboxRecordChange = (list) => {
    setRecordCheckedList(list);
    setIndeterminate2(!!list.length && list.length < recordOptions.length);
    setCheckAll2(list.length === recordOptions.length);

    const selected = layerList.filter(
      (item) => item.get('type') === 'recorded'
    );

    for (let i = 0; i < selected.length; i += 1) {
      if (list.includes(selected[i].get('key'))) selected[i].setVisible(true);
      else selected[i].setVisible(false);
    }
  };

  const onCheckAllRecordChange = (e) => {
    setRecordCheckedList(e.target.checked ? recordOptions : []);
    setIndeterminate2(false);
    setCheckAll2(e.target.checked);

    const selected = layerList.filter(
      (layer) => layer.get('type') === 'recorded'
    );

    for (let i = 0; i < selected.length; i += 1) {
      selected[i].setVisible(e.target.checked);
    }
  };

  const handleShowDraft = (e) => {
    const { checked, name } = e.target;

    setShowDraft(checked);
    for (let i = 0; i < layerList.length; i += 1) {
      if (
        layerList[i].get('key') === journey.current?.projectId &&
        name === 'draft'
      ) {
        layerList[i].setVisible(checked);
      }
    }
  };

  return (
    <Suspense
      fallback={
        <div className="loading">
          <Spin />
        </div>
      }>
      <Divider className="reportTitle">LOG 데이터 표시</Divider>
      <Descriptions title="처리결과" bordered>
        <Descriptions.Item label="로그파일명">
          {logData?.filePath || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="폴더명" span={2}>
          {logData?.nasPath || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="BESTPOS개수">
          {logData?.cntBestPos || '0'}
        </Descriptions.Item>
        <Descriptions.Item label="진행거리(BESTPOS) / 단위(km)">
          {logData?.distance || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="경과시간">
          {logData?.elapsedTime}
        </Descriptions.Item>
        <Descriptions.Item label="마크1개수">
          {logData?.cntMarkPos1 || '0'}
        </Descriptions.Item>
        <Descriptions.Item label="마크2개수">
          {logData?.cntMarkPos2 || '0'}
        </Descriptions.Item>
        <Descriptions.Item label="마크3개수">
          {logData?.cntMarkPos3 || '0'}
        </Descriptions.Item>
        <Descriptions.Item label="마크4개수">
          {logData?.cntMarkPos4 || '0'}
        </Descriptions.Item>
        <Descriptions.Item label="시작시간">
          {logData?.startTime}
        </Descriptions.Item>
        <Descriptions.Item label="종료시간">
          {logData?.endTime}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <br />
      <h3>촬영계획 및 실제촬영 표시</h3>
      <div
        style={{
          float: 'left',
          width: '700px',
          height: '500px',
          marginRight: '20px',
          border: '1px solid #ccc',
          overflow: 'hidden'
        }}>
        <GeoMap addLayers={layerList} />
      </div>
      <div style={{ display: 'inline-block' }}>
        <h4>지도표시설정</h4>
        <Space direction="vertical">
          <Checkbox
            indeterminate={indeterminate2}
            onChange={onCheckAllRecordChange}
            checked={checkAll2}>
            촬영경로 표시
          </Checkbox>
          <CheckboxGroup
            options={recordOptions}
            value={recordCheckedList}
            onChange={onCheckboxRecordChange}
            style={{ paddingLeft: '1rem' }}
          />
          <Checkbox
            indeterminate={indeterminate1}
            onChange={onCheckAllPlanChange}
            checked={checkAll1}>
            경로계획 표시
          </Checkbox>
          <CheckboxGroup
            options={planOptions}
            value={planCheckedList}
            onChange={onCheckboxPlanChange}
            style={{ paddingLeft: '1rem' }}
          />
          <Checkbox onChange={handleShowDraft} name="draft" checked={showDraft}>
            프로젝트 DRAFT 경로 표시
          </Checkbox>
        </Space>
      </div>
    </Suspense>
  );
};

export default GeoxyzReport;
