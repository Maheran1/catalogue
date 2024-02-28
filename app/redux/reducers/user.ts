import { UPDATE_USER_DATA, SYNC_COOKIE_USER_DATA, SYNC_COOKIE_REGISTRATION_SCREEN_TIME, UPDATE_WELCOME_SCREEN_TIME, SYNC_COOKIE_WELCOME_SCREEN_TIME, UPDATE_REGISTRATION_SCREEN_TIME } from "@constant/user";
import { getValueFromCookies, setValueInCookies } from "@util/webstorage";

/* eslint-disable no-case-declarations */
export function user(state: any = '', action) {// reduxState = {loader: action.payload}
    switch (action.type) {
        case UPDATE_USER_DATA:
            return (action.payload);
        case SYNC_COOKIE_USER_DATA:
            const persistedUser: any = getValueFromCookies('user');
            return persistedUser || null;
        case UPDATE_REGISTRATION_SCREEN_TIME:
            setValueInCookies('rst', action.payload, action.expDays);
            return state;
        case SYNC_COOKIE_REGISTRATION_SCREEN_TIME:
            // const persistedRSTime: any = getValueFromCookies('rst');
            return state;
        case UPDATE_WELCOME_SCREEN_TIME:
            setValueInCookies('wst', action.payload, action.expDays);
            return state;
        case SYNC_COOKIE_WELCOME_SCREEN_TIME:
            // const persistedWSTime: any = getValueFromCookies('wst');
            return state;
        default:
            return state;
    }
}
