import React from 'react';
// import { useDispatch } from 'react-redux';
// import { getEquipAll } from '../../../store/equipment';
import LayoutPage from '../layout/LayoutPage';
import EquipList from './section/EquipList';

const EquipmentPage = () => {
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(getEquipAll());
  // }, []);

  return (
    <LayoutPage menu="2">
      <div className="inner-container">
        <EquipList />
      </div>
    </LayoutPage>
  );
};

export default EquipmentPage;
