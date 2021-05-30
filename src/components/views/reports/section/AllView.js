/* eslint-disable react/display-name */
import { Badge, Descriptions, Divider, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { Viewer } from '@toast-ui/react-editor';
import GeoxyzReport from './GeoxyzReport';
import { getJourneyOne } from '../../../../store/journey';

const AllView = () => {
  const journey = useSelector(
    ({ journey }) => ({ current: journey.current, mode: journey.mode }),
    shallowEqual
  );

  const [journeyInfo, setJourneyInfo] = useState(null);
  const [planList, setPlanList] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!journey.current?.id || journey.mode !== 'view') return;

    dispatch(getJourneyOne(journey.current.id)).then((res) => {
      const { id, uploadStep, planStep, ieStep, vehicleName } = res.payload;

      setJourneyInfo({
        id,
        upload: {
          nasPath: uploadStep?.nasPath,
          content: uploadStep?.content
        },
        plan: {
          planLayers: planStep?.planLayers,
          content: planStep?.content
        },
        ie: {
          insPath: ieStep?.insPath,
          content: ieStep?.content
        },
        vehicleName: vehicleName
      });
    });
  }, [journey.current.id]);

  useEffect(() => {
    const planList = journey.current?.planStep?.planLayers
      ?.filter((item) => item.mission)
      .map((item) => ({
        ...item,
        key: item.id
      }));

    setPlanList(planList);
  }, [journey.current]);

  const columns = [
    {
      title: 'Layer Name',
      dataIndex: 'name'
    },
    {
      title: 'Color',
      dataIndex: 'lineColor',
      render: (text) => {
        if (!text) text = 'black';
        return <Badge color={text} text={text} />;
      }
    },
    {
      title: 'LineWidth (Radius)',
      dataIndex: 'lineWidth'
    },
    {
      title: 'Enabled',
      dataIndex: 'isEnabled',
      render: (text) => (text ? 'ON' : 'OFF')
    }
  ];

  return (
    <>
      <Divider className="reportTitle">경로 계획</Divider>
      <Descriptions labelStyle={{ fontWeight: 600, minWidth: 140 }}>
        <Descriptions.Item label="경로 계획 목록" span={3}>
          <Table
            columns={columns}
            dataSource={planList}
            size="small"
            pagination={false}
          />
        </Descriptions.Item>
        <Descriptions.Item label="메모">
          {journeyInfo?.plan?.content && (
            <Viewer height="500px" initialValue={journeyInfo?.plan?.content} />
          )}
        </Descriptions.Item>
      </Descriptions>
      <Divider className="reportTitle">로그 업로드 보고</Divider>
      <Descriptions labelStyle={{ fontWeight: 600, minWidth: 140 }}>
        <Descriptions.Item label="장비 이름" span={3}>
          {journeyInfo?.vehicleName}
        </Descriptions.Item>
        <Descriptions.Item label="업로드 로그 파일" span={3}>
          {journeyInfo?.record?.filePath}
        </Descriptions.Item>
        <Descriptions.Item label="메모">
          {journeyInfo?.record?.content && (
            <Viewer
              height="500px"
              initialValue={journeyInfo?.record?.content}
            />
          )}
        </Descriptions.Item>
      </Descriptions>
      <Divider className="reportTitle">데이터 업로드 보고</Divider>
      <Descriptions labelStyle={{ fontWeight: 600, minWidth: 140 }}>
        <Descriptions.Item label="업로드 NAS 경로" span={3}>
          {journeyInfo?.upload?.nasPath}
        </Descriptions.Item>
        <Descriptions.Item label="메모">
          {journeyInfo?.upload?.content && (
            <Viewer
              height="500px"
              initialValue={journeyInfo?.upload?.content}
            />
          )}
        </Descriptions.Item>
      </Descriptions>
      <Divider className="reportTitle">IE 처리 보고</Divider>
      <Descriptions labelStyle={{ fontWeight: 600, minWidth: 140 }}>
        <Descriptions.Item label="ins 파일 이름" span={3}>
          {journeyInfo?.ie?.insPath}
        </Descriptions.Item>
        <Descriptions.Item label="메모">
          {journeyInfo?.ie?.content && (
            <Viewer height="500px" initialValue={journeyInfo?.ie?.content} />
          )}
        </Descriptions.Item>
      </Descriptions>
      <GeoxyzReport />
    </>
  );
};

export default AllView;
