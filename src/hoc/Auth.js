import { message } from 'antd';
import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { authUser } from '../store/user';

/** 유저 권한 체크 HOC */
export default function (WrapedComponent, reload, adminRoute = null) {
  function AuthenticatonCheck(props) {
    const user = useSelector(
      ({ user }) => ({
        isAuth: user.isAuth,
        isAdmin: user.isAdmin,
        isError: user.isError,
        loginSuccess: user.loginSuccess,
        userData: user.userData
      }),
      shallowEqual
    );
    const dispatch = useDispatch();

    useEffect(() => {
      if (user.loginSuccess) dispatch(authUser());
    }, [user.loginSuccess]);

    useEffect(() => {
      if (user.loginSuccess) {
        if (user.isError) {
          if (reload !== false) {
            props.history.push('/login');
          }
        } else {
          if (user.isAuth) {
            if (adminRoute && !user.isAdmin) {
              message.info('해당 페이지에 접근 권한이 없습니다.');
              props.history.push('/');
            } else {
              if (reload === false) props.history.push('/');
            }
          } else {
            props.history.push('/login');
          }
        }
      } else {
        if (reload) props.history.push('/login');
      }
    }, [props.history, user]);

    return <WrapedComponent {...props} />;
  }
  return AuthenticatonCheck;
}
