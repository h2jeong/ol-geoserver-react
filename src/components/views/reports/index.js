import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getJourneyOne } from '../../../store/journey';
import LayoutPage from '../layout/LayoutPage';
import ReportTabs from './ReportTabs';

const ReportsPage = ({ match }) => {
  const project = useSelector(
    ({ project }) => ({ current: project.current, list: project.list }),
    shallowEqual
  );
  const journey = useSelector(
    ({ journey }) => ({ mode: journey.mode }),
    shallowEqual
  );
  const [projectInfo, setProjectIinfo] = useState(null);

  const journeyId = match.params.id;
  const dispatch = useDispatch();

  useEffect(() => {
    let projectId = project.current;

    if (journeyId === 'new') {
      if (journey.mode === 'write') {
        return;
      } else {
        const currentProject = project.list?.find(
          (item) => item.id === projectId
        );

        setProjectIinfo(currentProject);
      }
    } else {
      dispatch(getJourneyOne(journeyId))
        .then((res) => {
          projectId = res.payload.projectId;

          const currentProject = project.list?.find(
            (item) => item.id === projectId
          );

          setProjectIinfo(currentProject);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [journeyId]);

  return (
    <LayoutPage menu="1">
      <div className="inner-container">
        <ReportTabs projectInfo={projectInfo} />
      </div>
    </LayoutPage>
  );
};

export default ReportsPage;
