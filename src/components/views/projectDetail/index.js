import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import LayoutPage from '../layout/LayoutPage';
import ProjectDetail from './section/ProjectDetail';
import { editMode, getProjectOne } from '../../../store/project';

/** 프로젝트 상세 화면 */
const ProjectDetailPage = ({ match }) => {
  const [project, setProject] = useState(null);

  const projectId = match.params.id;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProjectOne(projectId)).then((res) => {
      setProject(res.payload);
    });
    dispatch(editMode(false));
  }, []);

  return (
    <LayoutPage menu="3">
      <div className="inner-container">
        <ProjectDetail projectInfo={project} />
      </div>
    </LayoutPage>
  );
};

export default ProjectDetailPage;
