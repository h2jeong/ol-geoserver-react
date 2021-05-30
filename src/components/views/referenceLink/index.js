import React from 'react';
import LayoutPage from '../layout/LayoutPage';
import { withRouter } from 'react-router';
import { Typography, Space } from 'antd';

const { Link, Title } = Typography;

const ReferenceLinkPage = () => {
  return (
    <LayoutPage menu="7">
      <div className="inner-container">
        <Title level={4}>촬영 이력 목록</Title>
        <br />
        <Space direction="vertical">
          <Title level={5}>geojson 그리는 곳</Title>
          <Link href="https://geoman.io/" target="_blank">
            https://geoman.io/
          </Link>
          <Link href="https://geojson.io/" target="_blank">
            https://geojson.io/
          </Link>
          <Link href="https://cloud.maptiler.com/" target="_blank">
            https://cloud.maptiler.com/
          </Link>
          <br />
          <Title level={5}>wkt 지도에올려보는사이트</Title>
          <Link
            href="https://clydedacruz.github.io/openstreetmap-wkt-playground/"
            target="_blank">
            https://clydedacruz.github.io/openstreetmap-wkt-playground/
          </Link>
        </Space>
      </div>
    </LayoutPage>
  );
};

export default withRouter(ReferenceLinkPage);
