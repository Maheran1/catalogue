import { APISERVICE } from "@util/apiService/RestClient";

export const getCurrentReleaseVersion = () => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_BASE_PCS_URL}/buildVersions?project=dashboard`)
            .then((response) => {
                res(response.data);
            }).catch(function (error) {
                rej(error);
            });
    })
}

export const getBillPrintByOrder = (order: string, languageCode: string = 'en') => {
    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.NEXT_PUBLIC_PCS_TXN}/printBill?languageCode=${languageCode}&combinePrintBill=false`, order)
            .then((response) => {
                res(response.data);
            }).catch(function (error) {
                rej(error);
            });
    })
}

export const getLanguages = (tenantId: any, storeId: any) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_BASE_PCS_URL}/languageMappings/tenantId/storeId?tenantId=${tenantId}&storeId=${storeId}`)
            .then((response) => {
                // console.log("response?.data?.data", response?.data?.data)
                res(Boolean(response?.data?.data?.length) ? response?.data?.data : [{ "languageId": "en", "displayName": "English" }]);
            }).catch(function (error) {
                console.log("response?.data?.data   error", error)
                rej(error);
            });
    })
}