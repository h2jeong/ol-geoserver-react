import axios from 'axios';
import { config } from '../config';

const GET_JOURNEY_ONE = 'get_journey_one';
const GET_STATUS = 'get_status';

const CHANGE_MODE = 'change_mode';
const CREATE_JOURNEY = 'create_journey';
const UPDATE_JOURNEY = 'update_journey';
const UPDATE_ENABLE = 'update_enable';
const UPDATE_LINE = 'update_line';
const UPDATE_STATUS = 'update_status';

const UPDATE_PLAN = 'update_plan';
const UPDATE_RECORD = 'update_record';
const UPDATE_UPLOAD = 'update_upload';
const UPDATE_IE = 'update_ie';

const CREATE_PLAN = 'create_plan';
const CREATE_RECORD = 'create_record';
const CREATE_UPLOAD = 'create_upload';
const CREATE_IE = 'create_ie';

const CHANGE_VISIBLE = 'change_visible';
const SET_ALL_LIST = 'set_all_list';
const ADD_LIST = 'add_list';

export function getJourneyOne(id) {
  if (!id) return;
  const request = axios
    .get(`${config.twr_api}/api/worker/contents/journey`, {
      params: {
        id,
        bDraft: true,
        bDraftGeom: true,
        bRecordGeom: true,
        bPlanGeom: true
      }
    })
    .then((res) => {
      if (res.data.success) {
        const { journey } = res.data;
        return {
          ...journey,
          key: journey.id,
          projectName: journey.projects[0]?.name,
          projectId: journey.projects[0]?.id,
          drafts: journey.projects[0]?.drafts,
          vehicleName: journey.vehicle?.name,
          planDate: journey.planStep?.insertTime,
          plannerName: journey.planStep?.planner?.userName,
          recordDate: journey.recordStep?.insertTime,
          recorderName: journey.recordStep?.uploader?.userName,
          uploadDate: journey.uploadStep?.insertTime,
          uploaderName: journey.uploadStep?.uploader?.userName,
          isVisible: journey.isEnabled,
          status: journey.status
        };
      }
    });
  return { type: GET_JOURNEY_ONE, payload: request };
}

export function getStatus() {
  const request = axios
    .get(`${config.twr_api}/api/worker/contents/journey/status`)
    .then((res) => {
      if (res.data.success) return res.data.status;
    });
  return { type: GET_STATUS, payload: request };
}

export function changeMode(mode) {
  return { type: CHANGE_MODE, payload: mode };
}

export function createJourney(createData) {
  const { projectId, name, description } = createData;
  const request = axios
    .post(
      `${config.twr_api}/api/worker/contents/journey`,
      { name, description },
      {
        params: { projectId }
      }
    )
    .then((res) => {
      if (res.data.success) {
        const { journey } = res.data;
        return {
          ...journey,
          key: journey.id,
          projectName: journey.projects && journey.projects[0]?.name,
          projectId: projectId,
          vehicleName: journey.vehicle?.name,
          planDate: journey.planStep?.insertTime,
          plannerName: journey.planStep?.planner?.userName,
          recordDate: journey.recordStep?.insertTime,
          recorderName: journey.recordStep?.uploader?.userName,
          uploadDate: journey.uploadStep?.insertTime,
          uploaderName: journey.uploadStep?.uploader?.userName,
          isVisible: journey.isEnabled,
          status: journey.status
        };
      }
    });

  return { type: CREATE_JOURNEY, payload: request };
}

export function updateEnable(enable, journeyId) {
  const params = { id: journeyId, enable };
  const request = axios
    .delete(`${config.twr_api}/api/worker/contents/journey`, { params })
    .then((res) => {
      if (res.data.success) {
        return { enable, journeyId };
        // return { ...journey, isEnabled: enable };
      }
    });

  return { type: UPDATE_ENABLE, payload: request };
}

export function updateJourney(uuid, values, journey) {
  const { name, description } = values;

  const request = axios
    .patch(`${config.twr_api}/api/worker/contents/journey`, {
      uuid,
      name,
      description
    })
    .then((res) => {
      if (res.data.success) {
        return { ...journey, name, description };
      }
    });

  return { type: UPDATE_JOURNEY, payload: request };
}

export function updateLine(planLayer) {
  const { id, lineColor, lineWidth, isEnabled } = planLayer;
  const request = axios
    .patch(
      `${config.twr_api}/api/worker/contents/journey/one/plan/line`,
      {},
      { params: { id, lineColor, lineWidth, enable: isEnabled } }
    )
    .then((res) => {
      if (res.data.success) return planLayer;
    });

  return { type: UPDATE_LINE, payload: request };
}

export function updateStatus(updateData) {
  const request = axios
    .patch(`${config.twr_api}/api/worker/contents/journey`, updateData)
    .then((res) => res.data);

  return { type: UPDATE_STATUS, payload: request };
}
export function updatePlan(updateData) {
  const request = axios
    .patch(
      `${config.twr_api}/api/worker/contents/journey/one/plan`,
      updateData,
      {
        header: { 'content-type': 'multipart/form-data' }
      }
    )
    .then((res) => res.data);

  return { type: UPDATE_PLAN, payload: request };
}

export function updateRecord(updateData) {
  const request = axios
    .patch(
      `${config.twr_api}/api/worker/contents/journey/one/record`,
      updateData,
      {
        header: { 'content-type': 'multipart/form-data' }
      }
    )
    .then((res) => {
      if (res.data.success) return res.data;
      else return { success: res.data.success, message: res.data.message };
    });

  return { type: UPDATE_RECORD, payload: request };
}

export function updateUpload(updateData) {
  const request = axios
    .patch(
      `${config.twr_api}/api/worker/contents/journey/one/upload`,
      updateData
    )
    .then((res) => {
      if (res.data.success) return res.data;
      else return { success: res.data.success, message: res.data.message };
    });
  return { type: UPDATE_UPLOAD, payload: request };
}

export function updateIe(updateData) {
  const request = axios
    .patch(`${config.twr_api}/api/worker/contents/journey/one/ie`, updateData)
    .then((res) => {
      if (res.data.success) return res.data;
      else return { success: res.data.success, message: res.data.message };
    });
  return { type: UPDATE_IE, payload: request };
}

export function createRecord(createData) {
  const request = axios
    .post(
      `${config.twr_api}/api/worker/contents/journey/one/record`,
      createData,
      {
        header: { 'content-type': 'multipart/form-data' }
      }
    )
    .then((res) => {
      if (res.data.success) return res.data;
      else return { success: res.data.success, message: res.data.message };
    });

  return { type: CREATE_RECORD, payload: request };
}

export function createUpload(createData) {
  const request = axios
    .post(
      `${config.twr_api}/api/worker/contents/journey/one/upload`,
      createData
    )
    .then((res) => {
      if (res.data.success) return res.data;
      else return { success: res.data.success, message: res.data.message };
    });
  return { type: CREATE_UPLOAD, payload: request };
}

export function createIe(createData) {
  const request = axios
    .post(`${config.twr_api}/api/worker/contents/journey/one/ie`, createData)
    .then((res) => {
      if (res.data.success) return res.data;
      else return { success: res.data.success, message: res.data.message };
    });
  return { type: CREATE_IE, payload: request };
}

export function createPlan(createData) {
  const request = axios
    .post(
      `${config.twr_api}/api/worker/contents/journey/one/plan`,
      createData,
      {
        header: { 'content-type': 'multipart/form-data' }
      }
    )
    .then((res) => {
      if (res.data.success) return res.data;
      else return { success: res.data.success, message: res.data.message };
    });

  return { type: CREATE_PLAN, payload: request };
}

export function changeVisible(visible, journeyId) {
  const request = { visible, journeyId };

  return { type: CHANGE_VISIBLE, payload: request };
}

export function setAllList(list) {
  return { type: SET_ALL_LIST, payload: list };
}

export function addList(journeyList) {
  return { type: ADD_LIST, payload: journeyList };
}
const initialState = { mode: null };

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_JOURNEY_ONE:
      return {
        ...state,
        current: action.payload
      };
    case GET_STATUS:
      return { ...state, statusList: action.payload };
    case CHANGE_MODE:
      return { ...state, mode: action.payload };
    case CREATE_JOURNEY: {
      let list = [];
      if (action.payload) {
        if (state.list.length > 0) list = [action.payload, ...state.list];
        else list = [action.payload];
      } else list = state.list;
      return { ...state, list: list, current: action.payload };
    }
    case UPDATE_ENABLE: {
      const { enable, journeyId } = action.payload;

      return {
        ...state,
        list: state.list?.map((item) =>
          item.id === journeyId
            ? { ...item, isEnabled: enable, isVisible: enable }
            : item
        )
      };
    }
    case UPDATE_JOURNEY:
      console.log('UPDATE_JOURNEY', action.payload);
      return {
        ...state,
        list: state.list.map((item) => {
          if (item.id === action.payload.id) return action.payload;
          return item;
        }),
        current: action.payload
      };
    case UPDATE_LINE: {
      const updated = {
        ...state.current.planStep,
        planLayers: state.current.planStep.planLayers.map((item) =>
          item.id === action.payload.id ? action.payload : item
        )
      };
      return {
        ...state,
        current: { ...state.current, planStep: updated }
      };
    }
    case UPDATE_STATUS: {
      if (!action.payload.success) return state;
      const updated = {
        ...state.current,
        status: action.payload.journey.status
      };
      return {
        ...state,
        list: state.list.map((item) => {
          if (item.id === updated.id) return updated;
          return item;
        }),
        current: updated
      };
    }
    case UPDATE_PLAN: {
      console.log('UPDATE_PLAN', action.payload);
      // let response = JSON.parse(JSON.stringify(action.payload));
      if (action.payload.success) {
        console.log('update:', action.payload.planStep);
        const updated = {
          ...state.current,
          status: action.payload.status,
          planStep: action.payload.planStep,
          planDate: action.payload.updateTIme,
          plannerName: action.payload.planner?.userName
        };
        return {
          ...state,
          list: state.list.map((item) => {
            if (item.id === updated.id) return updated;
            return item;
          }),
          current: updated
        };
      } else return state;
    }
    case UPDATE_RECORD: {
      console.log('UPDATE_RECORD', action.payload);
      if (!action.payload.success) return state;
      const updated = {
        ...state.current,
        status: action.payload.status,
        recordStep: action.payload.recordStep,
        recordDate: action.payload.recordStep?.updateTIme,
        recorderName: action.payload.recordStep?.uploader?.userName
      };
      return {
        ...state,
        list: state.list.map((item) => {
          if (item.id === updated.id) return updated;
          return item;
        }),
        current: updated
      };
    }
    case UPDATE_UPLOAD: {
      console.log('UPDATE_UPLOAD', action.payload);
      if (!action.payload.success) return state;
      const updated = {
        ...state.current,
        status: action.payload.status,
        uploadStep: action.payload.uploadStep,
        uploadDate: action.payload.uploadStep?.updateTIme,
        uploaderName: action.payload.uploadStep?.uploader?.userName
      };

      return {
        ...state,
        list: state.list.map((item) => {
          if (item.id === updated.id) return updated;
          return item;
        }),
        current: updated
      };
    }
    case UPDATE_IE: {
      if (!action.payload.success) return state;
      const updated = {
        ...state.current,
        status: action.payload.status,
        ieStep: action.payload.ieStep
      };

      return {
        ...state,
        list: state.list.map((item) => {
          if (item.id === updated.id) return updated;
          return item;
        }),
        current: updated
      };
    }
    case CREATE_RECORD: {
      console.log('CREATE_RECORD', action.payload);
      if (!action.payload.success) return state;
      const updated = {
        ...state.current,
        status: action.payload.status,
        recordStep: action.payload.recordStep,
        recordDate: action.payload.recordStep?.insertTime,
        recorderName: action.payload.recordStep?.uploader?.userName
      };
      return {
        ...state,
        list: state.list.map((item) => {
          if (item.id === updated.id) return updated;
          return item;
        }),
        current: updated
      };
    }
    case CREATE_UPLOAD: {
      if (!action.payload.success) return state;
      const updated = {
        ...state.current,
        status: action.payload.status,
        uploadStep: action.payload.uploadStep,
        uploadDate: action.payload.uploadStep?.insertTime,
        uploaderName: action.payload.uploadStep?.uploader?.userName
      };

      return {
        ...state,
        list: state.list.map((item) => {
          if (item.id === updated.id) return updated;
          return item;
        }),
        current: updated
      };
    }
    case CREATE_IE: {
      if (!action.payload.success) return state;
      const updated = {
        ...state.current,
        status: action.payload.status,
        ieStep: action.payload.ieStep
      };

      return {
        ...state,
        list: state.list.map((item) => {
          if (item.id === updated.id) return updated;
          return item;
        }),
        current: updated
      };
    }
    case CREATE_PLAN: {
      console.log('CREATE_PLAN', action.payload);
      if (!action.payload.success) return state;
      const updated = {
        ...state.current,
        status: action.payload.status,
        planStep: action.payload.planStep,
        planDate: action.payload.planStep?.insertTime,
        plannerName: action.payload.planStep?.planner?.userName
      };
      return {
        ...state,
        list: state.list.map((item) => {
          if (item.id === updated.id) return updated;
          return item;
        }),

        current: updated
      };
    }
    case CHANGE_VISIBLE: {
      const { visible, journeyId } = action.payload;

      return {
        ...state,
        list: state.list.map((item) =>
          item.id === journeyId ? { ...item, isVisible: visible } : item
        )
      };
    }
    case SET_ALL_LIST:
      return { ...state, list: action.payload };
    case ADD_LIST:
      return { ...state, list: [...action.payload, ...state.list] };
    default:
      return state;
  }
}
