import { APISERVICE } from "@api/RestClient";

export const updateUser = (userDetails) => {
    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.NEXT_PUBLIC_CUSTOMERS}`, userDetails)
            .then((response) => {
                res(response);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_CUSTOMER}/updateaddress=>`, error);
            });
    })
}

export const updateUserAddress = (address, userId) => {
    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.NEXT_PUBLIC_CUSTOMER}/updateaddress/${userId}`, address)
            .then((response) => {
                res(response.data);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_CUSTOMER}/updateaddress/${userId}=>`, error);
            });
    })
}

export const getUserByTenantAndMobile = (tenantId, storeId, mobile) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_CUSTOMERS}/userbymobileno?tenantId=${tenantId}&storeId=${storeId}&mobileNo=${mobile}`)
            .then((response) => {
                res(response.data);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_CUSTOMER}/updateaddress/${tenantId}/${mobile}=>`, error);
            });
    })
}
// https://dev-respark.respark.in:8083/pcs-guest/v1/customers/userbyguestid?tenantId=15&storeId=19&guestId=6504377b96f829430e0ce267

export const getUserByGuestId = (tenantId, storeId, guestId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_CUSTOMERS}/userbyguestid?tenantId=${tenantId}&storeId=${storeId}&guestId=${guestId}`)
            .then((response) => {
                res(response.data);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_CUSTOMER}/updateaddress/${tenantId}/${guestId}=>`, error);
            });
    })
}

export const markUserOptInForWhatsapp = (tenantId, storeId, usersList) => {
    return new Promise((res, rej) => {
        APISERVICE.PUT(`${process.env.updateaddress}/optinmobnolist/?tenantId=${tenantId}&storeId=${storeId}`, usersList)
            .then((response) => {
                res(response);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_CUSTOMER}/updateaddress=>`, error);
            });
    })
}

export const updateUserVisitCount = (userId) => {
    return new Promise((res, rej) => {
        APISERVICE.PUT(`${process.env.NEXT_PUBLIC_CUSTOMER}/visitcount/${userId}`, {})
            .then((response) => {
                res(response);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_CUSTOMER}/updateaddress=>`, error);
            });
    })
}

export const getUserSources = (tenantId, storeId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_CUSTOMER}/sourceOfCustomer?tenantId=${tenantId}&storeId=${storeId}`)
            .then((response) => {
                res(response.data);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_CUSTOMER}/updateaddress/${tenantId}=>`, error);
            });
    })
}

export const submitUserQuery = (QueryData) => {
    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.NEXT_PUBLIC_CUSTOMER}/enquiries`, QueryData)
            .then((response) => {
                res(response.data);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_CUSTOMER}/enquiries=>`, error);
            });
    })
}
