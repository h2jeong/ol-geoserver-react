import React, { useCallback, useEffect, useState } from 'react';
import { Button, List } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Search from 'antd/lib/input/Search';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import DrawerEquip from './DrawerEquip';
import { deleteEquip } from '../../../../store/equipment';
import EachEquip from './EachEquip';

/** 전체 장비 목록 */
const EquipList = () => {
  const equipment = useSelector(
    ({ equipment }) => ({ list: equipment.list }),
    shallowEqual
  );

  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState('Create' || 'Edit');
  const [current, setCurrent] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!equipment.list?.length) return;
    const searchList = equipment.list?.filter(
      (item) => item.name.toLowerCase().indexOf(search.toLocaleLowerCase()) > -1
    );
    setData(searchList);
  }, [search, equipment.list]);

  const onEdit = useCallback(
    (equip) => {
      setCurrent(equip);
      setMode('Edit');
      setVisible(true);
    },
    [current]
  );

  const onClose = () => {
    setVisible(false);
  };

  const onCreate = () => {
    setMode('Create');
    setCurrent(null);
    setVisible(true);
  };

  const handleDelete = (key) => {
    dispatch(deleteEquip(key, data)).then((res) => {
      setData(res.payload);
    });
  };

  const onSearch = (value) => setSearch(value);

  return (
    <>
      <Search
        placeholder="장비명으로 검색하세요."
        onSearch={onSearch}
        enterButton
        style={{ width: 300, marginRight: 8 }}
      />
      <Button
        type="primary"
        onClick={onCreate}
        style={{ marginBottom: '1.5rem' }}>
        <PlusOutlined /> 장비 추가
      </Button>

      <List
        itemLayout="vertical"
        pagination={{
          pageSize: 3
        }}
        dataSource={data}
        renderItem={(equip) => (
          <EachEquip
            equip={equip}
            hasActions={true}
            onEdit={onEdit}
            handleDelete={handleDelete}
          />
        )}
      />
      <DrawerEquip
        mode={mode}
        equip={current}
        visible={visible}
        onClose={onClose}
        list={data}
      />
    </>
  );
};

export default EquipList;
