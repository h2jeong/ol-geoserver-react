import axios from 'axios';
import { config } from '../config';

const LOGIN_USER = 'login_user';
const LOGOUT_USER = 'logout_user';
const AUTH_USER = 'auth_user';
const UPDATE_AUTH = 'update_auth';
const GET_USER_ONE = 'get_user_one';
const GET_USER_ALL = 'get_user_all';
const MANAGE_USER = 'manage_user';
const GET_USERS_FOR_PROJECT = 'get_users_for_project';
const UPDATE_USER_ENABLE = 'update_enable_enable';

export function loginUser(loginData) {
  const request = axios
    .post(`${config.twr_api}/api/account/login`, loginData)
    .then((res) => res.data);
  return { type: LOGIN_USER, payload: request };
}

export function logoutUser() {
  const request = axios
    .get(`${config.twr_api}/api/account/logout`)
    .then((res) => res.data);
  return { type: LOGOUT_USER, payload: request };
}

export function authUser() {
  const request = axios
    .get(`${config.twr_api}/api/worker/account`)
    .then((res) => res.data);

  return { type: AUTH_USER, payload: request };
}

export function updateAuth(id, auth) {
  const params = { id, auth };
  const request = axios
    .patch(`${config.twr_api}/api/admin/account/one`, {}, { params })
    .then((res) => {
      if (res.data.success) return params;
    });
  return { type: UPDATE_AUTH, payload: request };
}

export function getUserOne(id) {
  return { type: GET_USER_ONE, payload: id };
}

export function getUserAll() {
  const request = axios
    .get(`${config.twr_api}/api/admin/account/all`)
    .then((res) => {
      if (res.data.success)
        return res.data.users.map((item) => ({ ...item, key: item.id }));
    });
  return { type: GET_USER_ALL, payload: request };
}

export function manageUser(uuids, projectId, user, list) {
  const request = axios
    .patch(
      `${config.twr_api}/api/worker/contents/project/manage`,
      { uuids },
      {
        params: { projectId }
      }
    )
    .then((res) => {
      if (res.data.success) {
        if (res.data.nRes <= list?.length) {
          return list.filter((item) => item.id !== user.id);
        } else {
          if (list) list.push({ ...user, key: user.id });
          else list = [{ ...user, key: user.id }];
          return list;
        }
      }
    });
  return { type: MANAGE_USER, payload: request };
}

export function getUsersForProject(projectId) {
  const request = axios
    .get(`${config.twr_api}/api/admin/account/all`, {
      params: { projectId }
    })
    .then((res) => {
      if (res.data.success) {
        return res.data.users.map((item) => ({ ...item, key: item.id }));
      } else return null;
    });
  return { type: GET_USERS_FOR_PROJECT, payload: request };
}

export function updateUserEnable(id, enable, list) {
  const params = { id, enable };
  const request = axios
    .delete(`${config.twr_api}/api/admin/account/one`, { params })
    .then((res) => {
      if (res.data.success) {
        return list.map((item) => {
          return item.id === id ? { ...item, isEnabled: enable } : item;
        });
      }
    });
  return { type: UPDATE_USER_ENABLE, payload: request };
}

export default function reducer(state = {}, action) {
  switch (action.type) {
    case LOGIN_USER: {
      return {
        ...state,
        loginSuccess: action.payload.user?.isEnabled && action.payload.success
      };
    }
    case LOGOUT_USER:
      return { loginSuccess: false };
    case AUTH_USER: {
      let response = JSON.parse(JSON.stringify(action.payload));
      // console.log('auth:', response);
      let isAuth = false;
      let isAdmin = false;
      let isError = false;
      let loginSuccess = state.loginSuccess;
      if (response.success) {
        isAuth = true;
        if (response.user.role === 'ROLE_ADMIN') isAdmin = true;
      }
      if (response.name === 'Error') {
        console.log('name:', response.name);
        isError = true;
        loginSuccess = false;
      }
      return loginSuccess
        ? {
            ...state,
            isAuth,
            isAdmin,
            isError,
            loginSuccess,
            userData: response.user
          }
        : { isError, loginSuccess };
    }
    case UPDATE_AUTH: {
      if (action.payload) {
        const { id, auth } = action.payload;
        return {
          ...state,
          list: state.list.map((item) =>
            item.id === id ? { ...item, role: auth } : item
          ),
          projectUsers: state.projectUsers.map((item) =>
            item.id === id ? { ...item, role: auth } : item
          )
        };
      } else return state;
    }
    case GET_USER_ONE:
      return state;
    case GET_USER_ALL:
      return {
        ...state,
        list: action.payload !== null ? action.payload : state.list
      };
    case MANAGE_USER:
      return {
        ...state,
        projectUsers:
          action.payload !== null ? action.payload : state.projectUsers
      };
    case GET_USERS_FOR_PROJECT:
      return {
        ...state,
        projectUsers:
          action.payload !== null ? action.payload : state.projectUsers
      };
    case UPDATE_USER_ENABLE:
      return {
        ...state,
        list: action.payload !== null ? action.payload : state.list
      };
    default:
      return state;
  }
}
