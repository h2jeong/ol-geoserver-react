import React from 'react';
import LayoutPage from '../layout/LayoutPage';
import ProjectList from './section/ProjectList';

/** 프로젝트 관리 화면 */
const ProjectPage = () => {
  return (
    <LayoutPage menu="3">
      <div className="inner-container">
        <ProjectList />
      </div>
    </LayoutPage>
  );
};

export default ProjectPage;
