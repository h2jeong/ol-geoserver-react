import axios from 'axios';
import { config } from '../config';

const CREATE_EQUIP = 'create_equip';
const GET_EQUIP_ALL = 'get_equip_all';
const GET_EQUIP_ONE = 'get_equip_one';
const UPDATE_EQUIP = 'update_equip';
const DELETE_EQUIP = 'delete_equip';

export function createEquip(newData) {
  const request = axios
    .post(`${config.twr_api}/api/worker/contents/vehicle`, newData)
    .then((res) => {
      if (res.data.success) {
        res.data.vehicle.key = res.data.vehicle.id;
        return res.data;
      }
    });
  return { type: CREATE_EQUIP, payload: request };
}

export function getEquipAll() {
  const request = axios
    .get(`${config.twr_api}/api/worker/contents/vehicle/all`)
    .then((res) => {
      if (res.data.success) {
        return res.data.vehicles
          .filter((item) => item.isEnabled)
          .map((item) => ({ ...item, key: item.id }));
      }
    });

  return { type: GET_EQUIP_ALL, payload: request };
}

export function getEquipOne(id) {
  const params = { id: id };
  const request = axios
    .get(`${config.twr_api}/api/worker/contents/vehicle`, { params })
    .then((res) => res.data);

  return { type: GET_EQUIP_ONE, payload: request };
}

export function updateEquip(updateData, list) {
  const request = axios
    .patch(`${config.twr_api}/api/worker/contents/vehicle`, updateData)
    .then((res) => {
      if (res.data.success) {
        return list.map((item) =>
          item.id === updateData.uuid
            ? { ...res.data.vehicle, key: item.id }
            : item
        );
      }
    });
  return { type: UPDATE_EQUIP, payload: request };
}

export function deleteEquip(id, data) {
  const request = axios
    .delete(`${config.twr_api}/api/worker/contents/vehicle`, {
      params: { id, enable: false }
    })
    .then((res) => {
      if (res.data.success) {
        return data.filter((item) => item.id !== id);
      }
    });
  return { type: DELETE_EQUIP, payload: request };
}

export default function reducer(state = {}, action) {
  switch (action.type) {
    case CREATE_EQUIP: {
      let equips = [];
      if (action.payload.success) {
        if (state.list) equips = [action.payload.vehicle, ...state.list];
        else equips = [action.payload.vehicle];
      } else equips = state.list;
      return { ...state, list: equips };
    }
    case GET_EQUIP_ALL:
      return { ...state, list: action.payload };
    case GET_EQUIP_ONE:
      return state;
    case UPDATE_EQUIP:
      return { ...state, list: action.payload };
    case DELETE_EQUIP:
      return { ...state, list: action.payload };
    default:
      return state;
  }
}
