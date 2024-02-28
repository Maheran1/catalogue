import { ALERT_SUCCESS, ALERT_ERROR, ALERT_WARNING, ALERT_INFO, ALERT_CLEAR } from '@constant/alert';
import { DEFAULT_ALERT_TIME } from '@constant/defaultValues';

export function alert(state = { type: '', message: '', time: DEFAULT_ALERT_TIME }, action) {
  switch (action.type) {
    case ALERT_SUCCESS:
      return {
        type: action.type,
        message: action.payload.message,
        time: action.payload.time
      };
    case ALERT_ERROR:
      return {
        type: action.type,
        message: action.payload.message,
        time: action.payload.time
      };
    case ALERT_INFO:
      return {
        type: action.type,
        message: action.payload.message,
        time: action.payload.time
      };
    case ALERT_WARNING:
      return {
        type: action.type,
        message: action.payload.message,
        time: action.payload.time
      };
    case ALERT_CLEAR:
      return { type: '', message: '', time: DEFAULT_ALERT_TIME };
    default:
      return state;
  }
}
