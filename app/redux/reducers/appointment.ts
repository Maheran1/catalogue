import { REPLACE_APPOINTMENT_SERVICES, SYNC_LOCAL_STORAGE_APPOINTMENT } from "@constant/appointment";
import { setValueInLocalStorage, getValueFromLocalStorage } from "@util/webstorage";

const initialState = []
export function appointmentServices(state = initialState, action) {
    switch (action.type) {
        case REPLACE_APPOINTMENT_SERVICES:
            setValueInLocalStorage('appointmentServices', action.payload);
            return (action.payload);
        case SYNC_LOCAL_STORAGE_APPOINTMENT:
            const persistedAppoitment: any = getValueFromLocalStorage('appointmentServices');
            return persistedAppoitment || initialState;
        default:
            return state;
    }
}