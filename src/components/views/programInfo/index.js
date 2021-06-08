import React, { useEffect, useState } from 'react';
import LayoutPage from '../layout/LayoutPage';
import { List, Typography, Divider } from 'antd';
import axios from 'axios';
import { config } from '../../../config';

/** program Info 화면 */
const ProgramInfoPage = () => {
  const [info, setInfo] = useState([]);

  useEffect(() => {
    axios
      .get(`${config.twr_api}/api/worker/contents/info/version`)
      .then((res) => {
        if (res.data.success) {
          let datas = Object.entries(res.data.version);
          setInfo(datas);
        }
      });
    return () => {
      setInfo([]);
    };
  }, []);

  return (
    <LayoutPage menu="5">
      <div className="inner-container">
        <Divider orientation="left">버전 정보</Divider>
        <List
          header={<div>WM3 TOWER</div>}
          bordered
          dataSource={info}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text mark>[{item[0]}]</Typography.Text> {item[1]}
            </List.Item>
          )}
        />
        <Divider orientation="left">관리서버 고객정보</Divider>
        <List
          size="large"
          header={<div>Header</div>}
          footer={<div>Footer</div>}
          bordered
          dataSource={[]}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text mark>[{item[0]}]</Typography.Text> {item[1]}
            </List.Item>
          )}
        />
      </div>
    </LayoutPage>
  );
};

export default ProgramInfoPage;
