import React, { lazy, Suspense, useEffect, useState } from 'react';
import LayoutPage from '../layout/LayoutPage';
import { DraggableModalProvider } from 'ant-design-draggable-modal';
import ModalDragResize from '../../common/ModalDragResize';
import JourneyList from './section/JourneyList';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Select, Spin } from 'antd';
import { getImageWMS } from '../../common/MakeVectorLayers';
import {
  getJourneyForProjects,
  setCurrentProject
} from '../../../store/project';
import { setAllList } from '../../../store/journey';

const GeoMap = lazy(() => import('./section/GeoMap'));

const JourneyPage = () => {
  const project = useSelector(
    ({ project }) => ({
      list: project.list,
      current: project.current
    }),
    shallowEqual
  );
  const [projectList, setProjectList] = useState([]);
  const [current, setCurrent] = useState(project.current);
  const [layerList, setLayerList] = useState([]);
  const [draftLayers, setDraftLayers] = useState([]);
  const [allJourney, setAllJourney] = useState([]);

  const dispatch = useDispatch();

  const onChange = (option) => {
    setCurrent(option.value);
  };

  const ProjectDialog = () => {
    let options = [];

    if (project.list?.length > 0) {
      options = project.list?.map((item) => ({
        value: item.id,
        key: item.id,
        label: item.name
      }));

      options.push(
        {
          value: 'none',
          key: 'none',
          label: 'None'
        },
        {
          value: 'all',
          key: 'all',
          label: 'All'
        }
      );
    }

    return (
      <Select
        style={{
          width: '300px',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10
        }}
        size="large"
        placeholder="Select a project"
        onChange={onChange}
        labelInValue
        defaultValue={current ? { value: current } : { value: 'all' }}
        options={options}
      />
    );
  };

  useEffect(() => {
    dispatch(setCurrentProject(current));
    // check : if none or all => current project & journey list
    let selected = projectList;
    if (!current) {
      selected = project.list;
    } else if (current === 'none') {
      selected = [];
    } else if (current === 'all') {
      selected = project.list;
    } else {
      selected = project.list.filter((item) => item.id === current);
    }

    setProjectList(selected);
  }, [current]);

  useEffect(() => {
    async function fetchApi() {
      let tempList = [];
      let journeys = [];
      let projectIds = [];

      for (let i = 0; i < projectList?.length; i += 1) {
        const { id, isEnabled, drafts } = projectList[i];

        if (!isEnabled) continue;

        for (let i = 0; i < drafts?.length; i += 1) {
          const { uuid, type } = drafts[i];
          const wmsLayer = await getImageWMS(
            uuid,
            'draft',
            'ImageWMS',
            '#35C',
            2,
            isEnabled,
            type,
            id
          );

          tempList.push(wmsLayer);
        }
        projectIds.push(id);
      }

      if (projectIds.length > 0) {
        dispatch(getJourneyForProjects(projectIds)).then(async (res) => {
          if (!res.payload) return;
          const journeyList = await res.payload;

          journeys.push(...journeyList);
        });
      }

      setTimeout(() => {
        setDraftLayers(tempList);
        dispatch(setAllList(journeys));
        setAllJourney(journeys);
      }, 1000);
    }

    if (!projectList) return;
    fetchApi();
  }, [projectList]);

  useEffect(() => {
    async function makeJouneyLayers() {
      let tempList = [];

      for (let i = 0; i < allJourney?.length; i += 1) {
        const { id, missions, records, uploads, isVisible } = allJourney[i];
        // if (!isVisible) continue;

        for (let i = 0; i < missions?.length; i += 1) {
          const { mission, isEnabled } = missions[i];

          if (!isEnabled) continue;

          for (let i = 0; i < mission?.length; i += 1) {
            const { uuid, type } = mission[i];
            const wmsLayer = await getImageWMS(
              uuid,
              'mission',
              'ImageWMS',
              '#F36',
              2,
              isVisible,
              type,
              id
            );
            tempList.push(wmsLayer);
          }
        }
        for (let i = 0; i < uploads?.length; i += 1) {
          const { recorded, id } = uploads[i];

          for (let i = 0; i < recorded?.length; i += 1) {
            const { uuid, type } = recorded[i];
            const wmsLayer = await getImageWMS(
              uuid,
              'recorded',
              'ImageWMS',
              '#00ff00',
              2,
              isVisible,
              type,
              id
            );
            tempList.push(wmsLayer);
          }
        }
        for (let i = 0; i < records?.length; i += 1) {
          const { recorded, id } = records[i];

          for (let i = 0; i < recorded?.length; i += 1) {
            const { uuid, type } = recorded[i];
            const wmsLayer = await getImageWMS(
              uuid,
              'recorded',
              'ImageWMS',
              '#00ff00',
              2,
              isVisible,
              type,
              id
            );
            tempList.push(wmsLayer);
          }
        }
      }
      setLayerList(tempList);
      console.log('tempList:', tempList);
    }
    if (!allJourney) return;
    makeJouneyLayers();
  }, [allJourney]);

  const handleAllVisible = (value, id) => {
    if (!id) {
      for (let i = 0; i < layerList.length; i += 1) {
        layerList[i].setVisible(value);
      }
      for (let i = 0; i < draftLayers.length; i += 1) {
        draftLayers[i].setVisible(value);
      }
    } else {
      for (let i = 0; i < layerList.length; i += 1) {
        if (layerList[i].get('key') === id) {
          layerList[i].setVisible(value);
        }
      }
    }
  };

  const handleChangeEnable = (value, id) => {
    const changed = allJourney.map((item) =>
      item.id === id ? { ...item, isEnabled: value, isVisible: value } : item
    );
    setAllJourney(changed);
  };

  const handleFilter = (list) => {
    setAllJourney(list);
  };

  return (
    <DraggableModalProvider>
      <Suspense
        fallback={
          <div className="loading">
            <Spin />
          </div>
        }>
        <LayoutPage menu="1">
          <ProjectDialog />
          <GeoMap addLayers={[...draftLayers, ...layerList]} />
          <ModalDragResize
            title="촬영목록필터"
            initialWidth={700}
            initialHeight={500}>
            <JourneyList
              projectId={current}
              handleAllVisible={handleAllVisible}
              handleChangeEnable={handleChangeEnable}
              handleFilter={handleFilter}
            />
          </ModalDragResize>
        </LayoutPage>
      </Suspense>
    </DraggableModalProvider>
  );
};

export default JourneyPage;
