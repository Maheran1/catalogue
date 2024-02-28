import { APISERVICE } from "@api/RestClient";

export const getStaffByTenantId = (id) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_GET_STAFF}/${id}`)  //get staff details
            .then((staffData) => {
                if (staffData.status == 200) {
                    const staff = staffData.data;
                    if (staff) {
                        res(staff)
                    } else {
                        rej({ err: 'staff data unavailable' });
                    }
                } else if (staffData.status == 401) {
                    rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_GET_STAFF}/${id}`, status: staffData.status });
                }
            }).catch(function (error) {
                rej({ error: `API FAILED ==> ${process.env.NEXT_PUBLIC_GET_STAFF}/${id}`, status: error });
                console.error("error", error);
            });
    })
};