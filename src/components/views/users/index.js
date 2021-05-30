import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import LayoutPage from '../layout/LayoutPage';
import UsersForProject from './section/UsersForProject';

const UsersPage = () => {
  const project = useSelector(
    ({ project }) => ({
      list: project.list,
      current: project.current
    }),
    shallowEqual
  );

  const [current, setCurrent] = useState(null);
  useEffect(() => {
    if (['none', 'all'].includes(project.current)) {
      setCurrent(null);
    } else {
      setCurrent(project.current);
    }
  }, [project.current]);

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
    }

    return (
      <Select
        style={{ width: '300px' }}
        placeholder="Select a project"
        onChange={onChange}
        labelInValue
        defaultValue={{ value: current }}
        options={options}
      />
    );
  };
  return (
    <LayoutPage menu="4">
      <div className="inner-container">
        <ProjectDialog />
        <UsersForProject current={current} />
      </div>
    </LayoutPage>
  );
};

export default UsersPage;
