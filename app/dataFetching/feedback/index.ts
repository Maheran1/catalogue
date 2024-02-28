import { APISERVICE } from "@api/RestClient";

export const getFeedbackById = (appId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_FEEDBACK}/id/${appId}`)  //get store details
            .then(async (configResponse) => {
                if (configResponse.status == 200) {
                    const feedbackData = configResponse.data;
                    if (feedbackData) {
                        res(feedbackData)
                    } else {
                        rej({ err: 'feedback data unavailable' });
                    }
                } else if (configResponse.status == 401) {
                    rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_FEEDBACK}/id/${appId}`, status: configResponse.status });
                }
            }).catch(function (error) {
                rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_FEEDBACK}/id/${appId}`, status: error });
                console.error("error", error);
            });
    })
};

export const getFeedbackByOrderId = (appId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_FEEDBACK}/appointment/${appId}`)  //get store details
            .then(async (configResponse) => {
                if (configResponse.status == 200) {
                    const feedbackData = configResponse.data;
                    if (feedbackData) {
                        res(feedbackData)
                    } else {
                        rej({ err: 'feedback data unavailable' });
                    }
                } else if (configResponse.status == 401) {
                    rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_FEEDBACK}/appointment/${appId}`, status: configResponse.status });
                }
            }).catch(function (error) {
                rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_FEEDBACK}/appointment/${appId}`, status: error });
                console.error("error", error);
            });
    })
};


export const getFeedbackByAppointmentId = (appId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_FEEDBACK}/appointment/${appId}`)  //get store details
            .then(async (configResponse) => {
                if (configResponse.status == 200) {
                    const feedbackData = configResponse.data;
                    if (feedbackData) {
                        res(feedbackData)
                    } else {
                        rej({ err: 'feedback data unavailable' });
                    }
                } else if (configResponse.status == 401) {
                    rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_FEEDBACK}/appointment/${appId}`, status: configResponse.status });
                }
            }).catch(function (error) {
                rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_FEEDBACK}/appointment/${appId}`, status: error });
                console.error("error", error);
            });
    })
};