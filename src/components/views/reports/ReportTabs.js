import React, { useEffect, useState } from 'react';
import { Tabs, Typography } from 'antd';
import UploadReport from './section/UploadReport';
import IEReport from './section/IEReport';
import PlanReport from './section/PlanReport';
import {
  EditOutlined,
  CarOutlined,
  UploadOutlined,
  CloudUploadOutlined,
  ProjectOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import AllView from './section/AllView';
import CreateJourney from './section/CreateJourney';
import LogUpload from './section/LogUpload';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { changeMode } from '../../../store/journey';

const { Title } = Typography;
const { TabPane } = Tabs;

/** Journey 촬영계획 단계별 tabs */
const ReportTabs = ({ projectInfo }) => {
  const journey = useSelector(
    ({ journey }) => ({
      current: journey.current,
      mode: journey.mode
    }),
    shallowEqual
  );

  const [title, setTitle] = useState('');
  const [title2, setTitle2] = useState('');
  const [selectedKey, setSelectedKey] = useState('6');

  const dispatch = useDispatch();

  const handleTab = (key) => {
    if (key === '6') {
      dispatch(changeMode('view'));
      window.location.reload();
    }
    setSelectedKey(key);
  };

  useEffect(() => {
    const length = !projectInfo?.journeyList
      ? '0'
      : projectInfo?.journeyList?.length + 1;

    switch (journey.mode) {
      case 'write':
        setTitle('촬영 계획 추가');
        setTitle2('촬영 계획 추가');
        handleTab('1');
        break;
      case 'view': {
        let projectName = projectInfo
          ? `[ ${projectInfo.name} ] `
          : journey.current.projectName
          ? `[ ${journey.current.projectName} ] `
          : '';
        setTitle(`${projectName}${journey.current.name}`);
        setTitle2(journey.current.name);
        break;
      }
      case 'add':
        setTitle(
          `[ ${projectInfo?.name} ] ${projectInfo?.name}_${length}_auto`
        );
        setTitle2(`${projectInfo?.name}_${length}_auto`);
        handleTab('3');
        break;
      default:
        break;
    }
  }, [journey.mode, projectInfo]);

  return (
    <>
      <Title level={4}>{title}</Title>
      <br />
      <Tabs type="card" activeKey={selectedKey} onChange={handleTab}>
        <TabPane
          disabled={journey.mode !== 'view'}
          tab={
            <span>
              <EditOutlined />
              기본 정보
            </span>
          }
          key="1">
          <CreateJourney onHandleTab={handleTab} title={title2} />
        </TabPane>
        <TabPane
          disabled={journey.mode !== 'view'}
          tab={
            <span>
              <CarOutlined />
              경로 계획
            </span>
          }
          key="2">
          <PlanReport onHandleTab={handleTab} />
        </TabPane>
        <TabPane
          disabled={journey.mode === 'write'}
          tab={
            <span>
              <FileAddOutlined />
              LOG 업로드
            </span>
          }
          key="3">
          <LogUpload onHandleTab={handleTab} title={title2} />
        </TabPane>
        <TabPane
          disabled={journey.mode !== 'view'}
          tab={
            <span>
              <UploadOutlined />
              데이터 업로드 보고
            </span>
          }
          key="4">
          <UploadReport onHandleTab={handleTab} />
        </TabPane>
        <TabPane
          disabled={journey.mode !== 'view'}
          tab={
            <span>
              <CloudUploadOutlined />
              IE 처리 보고
            </span>
          }
          key="5">
          <IEReport onHandleTab={handleTab} />
        </TabPane>
        <TabPane
          disabled={journey.mode !== 'view'}
          tab={
            <span>
              <ProjectOutlined />
              한번에 보기
            </span>
          }
          key="6">
          <AllView />
        </TabPane>
      </Tabs>
    </>
  );
};

export default ReportTabs;
