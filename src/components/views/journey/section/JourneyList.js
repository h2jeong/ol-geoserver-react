import React, { useState } from 'react';
import { Button, message } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { changeMode, changeVisible } from '../../../../store/journey';
import JourneyTable from './JourneyTable';
import { useHistory } from 'react-router';

const JourneyList = ({
  projectId,
  handleAllVisible,
  handleChangeEnable,
  handleFilter
}) => {
  const journey = useSelector(
    ({ journey }) => ({
      list: journey.list
    }),
    shallowEqual
  );
  // console.log('journeyList:', journey.list);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  const onStart = (value) => {
    value ? setLoading1(true) : setLoading2(true);
    for (let i = 0; i < journey.list?.length; i += 1) {
      const { id, isEnabled } = journey.list[i];

      if (isEnabled) {
        dispatch(changeVisible(value, id));
      }
    }
    handleAllVisible(value);
    setLoading1(false);
    setLoading2(false);
  };

  const handleMode = (mode) => {
    dispatch(changeMode(mode));
    if (mode === 'add') {
      if (!projectId || ['none', 'all'].includes(projectId)) {
        message.warn('프로젝트를 선택하세요.');
        return;
      }
    }
    history.push('/journey/new');
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => handleMode('write')} size="small">
          촬영계획 추가
        </Button>
        <Button
          style={{ marginLeft: 8 }}
          type="primary"
          onClick={() => handleMode('add')}
          size="small">
          촬영물 추가
        </Button>
        <Button
          style={{ marginLeft: 8 }}
          onClick={() => onStart(true)}
          loading={loading1}
          size="small">
          지도에표시 모두
        </Button>
        <Button
          style={{ marginLeft: 8 }}
          onClick={() => onStart(false)}
          loading={loading2}
          size="small">
          지도에표시 해제
        </Button>
      </div>
      <JourneyTable
        size="small"
        handleChangeEnable={handleChangeEnable}
        handleAllVisible={handleAllVisible}
        handleFilter={handleFilter}
      />
    </>
  );
};

export default JourneyList;
