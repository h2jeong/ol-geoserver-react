import React, { useState, useCallback } from 'react';
import { Button, Popconfirm } from 'antd';
import { DraggableModal } from 'ant-design-draggable-modal';
import 'ant-design-draggable-modal/dist/index.css';
import {
  LineOutlined,
  FullscreenOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';

const ModalDragResize = ({ title, initialWidth, initialHeight, children }) => {
  const [visible, setVisible] = useState(true);
  const [collapse, setCollapase] = useState(false);

  const onOk = useCallback(() => {
    setCollapase(false);
    setVisible(true);
    setCollapase(true);
  }, [collapse]);

  const onCancel = useCallback(() => setVisible(false), []);
  const onCollapse = useCallback(() => {
    setCollapase(!collapse);
  }, [collapse]);

  /* modal footer buttons */
  const defaultFooter = [
    <Popconfirm
      title="The filter is initialized. Sure to close? "
      onConfirm={onCancel}
      key="1">
      <Button size="small">
        <LineOutlined />
      </Button>
    </Popconfirm>,
    <Button key="2" onClick={onCollapse} size="small">
      {collapse ? <DownOutlined /> : <UpOutlined />}
    </Button>
  ];

  return (
    <>
      {!visible && (
        <Button
          size="large"
          onClick={onOk}
          className="customized-modal-button"
          type="primary">
          {title}
          <FullscreenOutlined className="iconExpand" />
        </Button>
      )}
      <DraggableModal
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        title={title}
        footer={defaultFooter}
        initialWidth={collapse ? 300 : initialWidth}
        initialHeight={collapse ? 39 : initialHeight}
        className="customized-modal">
        {children}
      </DraggableModal>
    </>
  );
};

export default ModalDragResize;
