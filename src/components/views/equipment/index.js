import React from 'react';
import LayoutPage from '../layout/LayoutPage';
import EquipList from './section/EquipList';

/**장비관리 */
const EquipmentPage = () => {
  return (
    <LayoutPage menu="2">
      <div className="inner-container">
        <EquipList />
      </div>
    </LayoutPage>
  );
};

export default EquipmentPage;
