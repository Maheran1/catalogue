import { REPLACE_APPOINTMENT_SERVICES, SYNC_LOCAL_STORAGE_APPOINTMENT } from "@constant/appointment";

export const replaceAppointmentServices = (payload) => {
    return { type: REPLACE_APPOINTMENT_SERVICES, payload };
}

export const syncLocalStorageAppointment = () => {
    return { type: SYNC_LOCAL_STORAGE_APPOINTMENT, payload: '' };
}