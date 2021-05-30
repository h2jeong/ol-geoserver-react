import React from 'react';
import { Layout } from 'antd';
import MenuBar from '../menubar';

const { Content } = Layout;

const LayoutPage = ({ children, menu }) => {
  return (
    <Layout>
      <MenuBar menu={menu} />
      <Layout>
        <Content>
          <div className="site-layout-background">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
