import axios from 'axios';
import { config } from '../config';

const GET_PROJECT_ALL = 'get_project_all';
const GET_PROJECT_ONE = 'get_project_one';
const DELETE_PROJECT = 'delete_project';
const SET_CURRENT_PROJECT = 'set_current_project';
const UPDATE_PROJECT = 'update_project';
const CREATE_PROJECT = 'create_project';
const ADD_GEOM = 'add_geom';
const EDIT_MODE = 'edit_mode';
const GET_JOURNEY_FOR_PROJECT = 'get_journey_for_project';
const GET_JOURNEY_FOR_PROJECTS = 'get_journey_for_projects';

export function getProjectAll() {
  const params = { bDraftGeom: false, enable: true };
  const request = axios
    .get(`${config.twr_api}/api/worker/contents/project/all`, { params })
    .then((res) => {
      if (res.data.success) {
        return res.data.projects.map((item) => ({ ...item, key: item.id }));
      }
    });
  return { type: GET_PROJECT_ALL, payload: request };
}

export function getProjectOne(id) {
  const params = { id, bUser: true, bDraft: true, bDraftGeom: false };
  const request = axios
    .get(`${config.twr_api}/api/worker/contents/project`, { params })
    .then((res) => {
      if (res.data.success) {
        if (res.data.project?.isEnabled)
          return { ...res.data.project, key: res.data.project.id };
      }
    });
  return { type: GET_PROJECT_ONE, payload: request };
}

export function deleteProject(id, list) {
  const request = axios
    .delete(`${config.twr_api}/api/worker/contents/project`, {
      params: { id, enable: 0 }
    })
    .then((res) => {
      if (res.data.success) {
        return list.filter((item) => item.id !== id);
      } else return res.data;
    });

  return { type: DELETE_PROJECT, payload: request };
}

export function setCurrentProject(id) {
  // TODO: geoserver workspace layers 정리되면 수정하기 drafts
  return { type: SET_CURRENT_PROJECT, payload: id };
}

export function updateProject(updateData) {
  const request = axios
    .patch(`${config.twr_api}/api/worker/contents/project`, updateData)
    .then((res) => {
      // console.log('res:', res.data);
      return res.data;
    });

  return { type: UPDATE_PROJECT, payload: request };
}

export function createProject(newData) {
  const request = axios
    .post(`${config.twr_api}/api/worker/contents/project`, newData)
    .then((res) => res.data);

  return { type: CREATE_PROJECT, payload: request };
}

export function addGeom(formData) {
  const request = axios
    .patch(`${config.twr_api}/api/worker/contents/project/geom`, formData, {
      header: { 'content-type': 'multipart/form-data' }
    })
    .then((res) => {
      return res.data;
    })
    .catch((error) => console.error('Error:', error))
    .then((response) => {
      if (!JSON.stringify(response)) alert('upload failed.');
      return response;
    });

  return { type: ADD_GEOM, payload: request };
}

export function editMode(edit) {
  return { type: EDIT_MODE, payload: edit };
}

export function getJourneyForProject(projectId) {
  const request = axios
    .get(`${config.twr_api}/api/worker/contents/journey/all`, {
      params: {
        projectId,
        bDraftGeom: false,
        bRecordGeom: false,
        bPlanGeom: false
      }
    })
    .then((res) => {
      if (res.data.success) {
        let journeyList = res.data.journeys.map((item) => ({
          ...item,
          key: item.id,
          missions: item.planStep?.planLayers,
          records: item.recordStep?.recordLayers,
          uploads: item.uploadStep?.recordLayers,
          isVisible: item.isEnabled,
          status: item.status,
          projectName: item.projects[0].name,
          projectId: projectId,
          vehicleName: item.vehicle?.name,
          planDate: item.planStep?.insertTime,
          plannerName: item.planStep?.planner?.userName,
          recordDate: item.recordStep?.insertTime,
          recorderName: item.recordStep?.uploader?.userName,
          uploadDate: item.uploadStep?.insertTime,
          uploaderName: item.uploadStep?.uploader?.userName
        }));
        return { projectId, journeyList };
      } else {
        return [];
      }
    });

  return {
    type: GET_JOURNEY_FOR_PROJECT,
    payload: request
  };
}

export function getJourneyForProjects(projectIds) {
  const request = axios
    .post(
      `${config.twr_api}/api/worker/contents/journey/all`,
      { projectIds },
      {
        params: {
          bDraftGeom: false,
          bRecordGeom: false,
          bPlanGeom: false
        }
      }
    )
    .then((res) => {
      if (res.data.success) {
        let journeyList = res.data.journeys.map((item) => ({
          ...item,
          key: item.id,
          missions: item.planStep?.planLayers,
          records: item.recordStep?.recordLayers,
          uploads: item.uploadStep?.recordLayers,
          isVisible: item.isEnabled,
          status: item.status,
          projectName: item.projects[0].name,
          projectId: item.projects[0].id,
          vehicleName: item.vehicle?.name,
          planDate: item.planStep?.insertTime,
          plannerName: item.planStep?.planner?.userName,
          recordDate: item.recordStep?.insertTime,
          recorderName: item.recordStep?.uploader?.userName,
          uploadDate: item.uploadStep?.insertTime,
          uploaderName: item.uploadStep?.uploader?.userName
        }));
        return journeyList;
      } else {
        return [];
      }
    });
  return { type: GET_JOURNEY_FOR_PROJECTS, payload: request };
}

export default function reducer(state = {}, action) {
  switch (action.type) {
    case GET_PROJECT_ALL:
      return {
        ...state,
        edit: false,
        list: action.payload
      };
    case GET_PROJECT_ONE: {
      if (!action.payload) return state;
      const { id } = action.payload;
      let newList = [];
      if (state.list) {
        const isExist = state.list.find((item) => item.id === id);
        if (isExist) {
          newList = state.list?.map((item) =>
            item.id === id ? action.payload : item
          );
        } else {
          newList = [...state.list, action.payload];
        }
      } else newList = [action.payload];
      return {
        ...state,
        list: newList
      };
    }
    case GET_JOURNEY_FOR_PROJECT: {
      if (!action.payload) return state;
      const { projectId, journeyList } = action.payload;
      const newList = state.list.map((item) =>
        item.id === projectId ? { ...item, journeyList } : item
      );
      return { ...state, list: newList };
    }
    case GET_JOURNEY_FOR_PROJECTS: {
      if (!action.payload) return state;

      const newList = state.list.map((project) => {
        const journey = action.payload?.filter(
          (item) => item.projectId === project.id
        );
        if (journey) return { ...project, journeyList: journey };
        else return project;
      });
      return { ...state, list: newList };
    }
    case DELETE_PROJECT:
      return { ...state, list: action.payload };
    case SET_CURRENT_PROJECT:
      return {
        ...state,
        current: action.payload
      };
    case CREATE_PROJECT: {
      const { project, success } = action.payload;
      let projects = [];
      let newProject = null;
      if (success) {
        newProject = { ...project, key: project.id };
        if (state.list) projects = [newProject, ...state.list];
        else projects = [newProject];
      } else projects = state.list;

      return { ...state, list: projects, current: newProject.id };
    }
    case EDIT_MODE:
      return { ...state, edit: action.payload };
    default:
      return state;
  }
}
