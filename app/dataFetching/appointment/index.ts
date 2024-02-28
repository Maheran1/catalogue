import { APISERVICE } from "@api/RestClient";

export const getAppointmentById = (appId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_GET_APPOINTMENT_BY_ID}/${appId}`)  //get store details
            .then(async (configResponse) => {
                if (configResponse.status == 200) {
                    const appointmentData = configResponse.data;
                    if (appointmentData) {
                        res(appointmentData)
                    } else {
                        rej({ err: 'Appointment data unavailable' });
                    }
                } else if (configResponse.status == 401) {
                    rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_GET_APPOINTMENT_BY_ID}/${appId}`, status: configResponse.status });
                }
            }).catch(function (error) {
                rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_GET_APPOINTMENT_BY_ID}/${appId}`, status: error });
                console.error("error", error);
            });
    })
};