import { Result } from 'antd';
import React, { useEffect } from 'react';
import LayoutPage from '../layout/LayoutPage';
import { SmileOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getUserAll } from '../../../store/user';
import { withRouter } from 'react-router';
import { getStatus } from '../../../store/journey';
import { getProjectAll, getProjectOne } from '../../../store/project';
import { getEquipAll } from '../../../store/equipment';

/**
 * 로그인 후 초기 화면
 */
const DashboardPage = () => {
  const user = useSelector(
    ({ user }) => ({
      isAuth: user.isAuth,
      isAdmin: user.isAdmin,
      loginSuccess: user.loginSuccess,
      userData: user.userData
    }),
    shallowEqual
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user.loginSuccess) return;

    if (user.isAuth) {
      dispatch(getStatus());
      dispatch(getEquipAll());

      if (user.isAdmin) {
        dispatch(getUserAll());
        dispatch(getProjectAll()).then((res) => {
          const projectIds = res.payload.map((item) => item.id);
          for (let i = 0; i < projectIds.length; i += 1) {
            dispatch(getProjectOne(projectIds[i]));
          }
        });
      } else {
        const projects = user.userData.projects;
        const projectIds = projects.map((item) => item.id);

        for (let i = 0; i < projectIds.length; i += 1) {
          dispatch(getProjectOne(projectIds[i]));
        }
      }
    }
  }, [user.isAdmin, user.isAuth]);

  return (
    <LayoutPage>
      <div className="inner-container">
        <Result
          icon={<SmileOutlined />}
          title="Welcome to Dashboard!"
          style={{ padding: '25vh 0' }}
        />
      </div>
    </LayoutPage>
  );
};

export default withRouter(DashboardPage);
