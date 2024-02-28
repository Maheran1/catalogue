import { ALERT_SUCCESS, ALERT_ERROR, ALERT_WARNING, ALERT_INFO, ALERT_CLEAR } from '@constant/alert';
import { DEFAULT_ALERT_TIME } from '@constant/defaultValues';

export const showSuccess = (message = '', time = DEFAULT_ALERT_TIME) => {
  return { type: ALERT_SUCCESS, payload: { message, time } };
}

export const showError = (message = '', time = DEFAULT_ALERT_TIME) => {
  return { type: ALERT_ERROR, payload: { message, time } };
}

export const showWarning = (message = '', time = DEFAULT_ALERT_TIME) => {
  return { type: ALERT_WARNING, payload: { message, time } };
}

export const showInfo = (message = '', time = DEFAULT_ALERT_TIME) => {
  return { type: ALERT_INFO, payload: { message, time } };
}


export const clearAlert = (message = '', time = DEFAULT_ALERT_TIME) => {
  return { type: ALERT_CLEAR, payload: { message, time } };
}