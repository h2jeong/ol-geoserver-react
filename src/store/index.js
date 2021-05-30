import { combineReducers } from 'redux';
import user from './user';
import project from './project';
import equipment from './equipment';
import journey from './journey';

const RESET_STORE = 'reset_store';

const appReducer = combineReducers({
  user,
  project,
  equipment,
  journey
});

export function resetStore() {
  return {
    type: RESET_STORE
  };
}

const rootReducer = (state, action) => {
  if (action.type === RESET_STORE) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
