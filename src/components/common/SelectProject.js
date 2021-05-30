import React from 'react';
import { Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getJourneyForProject, setCurrentProject } from '../../store/project';
import { setFiltered } from '../../store/journey';

const SelectProject = ({ width = '300px', option = true }) => {
  const project = useSelector(
    ({ project }) => ({ list: project.list, current: project.current }),
    shallowEqual
  );
  const journey = useSelector(
    ({ journey }) => ({ list: journey.list }),
    shallowEqual
  );

  const options = () => {
    let options = [];
    if (project.list?.length > 0) {
      options = project.list?.map((item) => ({
        value: item.id,
        key: item.id,
        label: item.name
      }));
      if (option) {
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
      } else {
        options = options.filter(
          (item) => !['none', 'all'].includes(item.value)
        );
      }
    }
    return options;
  };

  const dispatch = useDispatch();

  const onChange = (option) => {
    if (option.value === 'none') {
      dispatch(setFiltered([]));
    } else if (option.value === 'all') {
      dispatch(setFiltered(journey.list));
    } else {
      dispatch(setCurrentProject(option.value));
      dispatch(getJourneyForProject(option.value)).then((res) => {
        dispatch(setFiltered(res.payload));
      });
    }
  };

  return (
    <Select
      style={{ width }}
      placeholder="Select a project"
      onChange={onChange}
      labelInValue
      defaultValue={option ? { value: 'all' } : { value: project.current }}
      options={options()}
    />
  );
};

export default SelectProject;
