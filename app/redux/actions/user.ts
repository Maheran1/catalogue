import { UPDATE_USER_DATA, SYNC_COOKIE_USER_DATA, UPDATE_REGISTRATION_SCREEN_TIME, UPDATE_WELCOME_SCREEN_TIME, SYNC_COOKIE_WELCOME_SCREEN_TIME, SYNC_COOKIE_REGISTRATION_SCREEN_TIME } from "@constant/user";

export const updateUserData = (payload) => {
    return { type: UPDATE_USER_DATA, payload };
}

export const syncCookieUserData = () => {
    return { type: SYNC_COOKIE_USER_DATA, payload: '' };
}

export const updateRegistrationScreenTime = (payload, expDays) => {
    return { type: UPDATE_REGISTRATION_SCREEN_TIME, payload, expDays };
}

export const syncCookieRegistrationScreenTimeData = () => {
    return { type: SYNC_COOKIE_REGISTRATION_SCREEN_TIME, payload: '' };
}

export const updateWelcomeScreenTime = (payload, expDays) => {
    return { type: UPDATE_WELCOME_SCREEN_TIME, payload, expDays };
}

export const syncCookieWelcomeScreenTimeData = () => {
    return { type: SYNC_COOKIE_WELCOME_SCREEN_TIME, payload: '' };
}