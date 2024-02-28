import { APISERVICE } from "@api/RestClient";
import { prepareStoreData } from "@util/dataFilterService";

const responseError: any = {
    file: 'app/dataFetching/store/index.ts',
    line: 0,
    errorMessage: {}
}
export const getStoreData = (activeGroup, baseApiUrl) => {
    return new Promise((res, rej) => {
        // enable for server data
        const response = {
            storeData: null,
            storeMetaData: null
        }
        APISERVICE.GET(`${process.env.BASE_PCS_URL}${baseApiUrl}`)  //get store details
            .then(async (tenantResponse) => {
                if (tenantResponse.status == 200) {
                    response.storeMetaData = tenantResponse.data;

                    if (response.storeMetaData && response.storeMetaData.active && !response.storeMetaData.terminate) {
                        await APISERVICE.GET(`${process.env.NEXT_PUBLIC_STORE}/getStoreByTenantAndStoreId?storeId=${response.storeMetaData.id}&tenantId=${response.storeMetaData.tenantId}`) // get store data
                            .then((storeResponse) => {
                                if (storeResponse.status == 200) {

                                    if (storeResponse.data && storeResponse.data.active) {
                                        prepareStoreData(storeResponse.data, activeGroup).then((filteredResponse) => {
                                            response.storeData = filteredResponse;
                                            res(response);
                                        })
                                    } else {
                                        console.log('*************Invalid Link*************')
                                        console.log('storeResponse.data && storeResponse.data.active')
                                        responseError.line = 35;
                                        responseError.errorMessage.error = '(storeResponse.data && storeResponse.data.active) condition failed';
                                        rej({ err: 'Inactive Store' });
                                    }
                                } else {
                                    console.log('*************Invalid Link*************')
                                    console.log('Session expired, re login into the system. storeResponse.status == 401');
                                    responseError.line = 43;
                                    responseError.errorMessage.error = `API=>${process.env.NEXT_PUBLIC_STORE}/${response.storeMetaData.id} storeResponse.status => ${storeResponse.status}`;
                                    rej({ error: 'Session expired, re login into the system.', status: storeResponse.status });
                                }
                            }).catch(function (e: any) {
                                console.log('*************Invalid Link*************')
                                responseError.line = 48;
                                responseError.errorMessage.error = e;
                                responseError.errorMessage.message = `API=>${process.env.NEXT_PUBLIC_STORE}/${response.storeMetaData.id} api failed`;
                                console.log("responseError", e);
                                rej(e);
                            });
                    } else {
                        console.log('*************Invalid Link*************')
                        console.log('response.storeMetaData && response.storeMetaData.active && !response.storeMetaData.terminate')
                        responseError.line = 56;
                        responseError.errorMessage = "(response.storeMetaData && response.storeMetaData.active && !response.storeMetaData.terminate) condition failed";
                        rej({ err: 'Inactive Store' });
                    }
                } else {
                    console.log('*************Invalid Link*************')
                    console.log('Session expired, re login into the system.', `${process.env.BASE_PCS_URL}${baseApiUrl} api failed`);
                    console.log(`${process.env.BASE_PCS_URL}${baseApiUrl} api failed tenantResponse.status == 401`)
                    responseError.line = 48;
                    responseError.errorMessage.error = `${process.env.BASE_PCS_URL}${baseApiUrl} api failed with tenantResponse.status ${tenantResponse.status}`;
                    rej({ error: 'Session expired, re login into the system.', status: tenantResponse.status });
                }
            }).catch(function (error) {
                console.log('*************Invalid Link*************')
                console.log("error", error);
                responseError.line = 48;
                responseError.errorMessage.error = error;
                responseError.errorMessage.message = `API => ${process.env.BASE_PCS_URL}${baseApiUrl} api failed`;
                rej(error);
            });


        //enable for local data

        // if (localData.active) {
        //     prepareStoreData(localData, activeGroup).then((localResponse) => {
        //         response.storeData = localResponse;
        //         res({ storeData: localResponse });
        //     }).catch(function (error) {
        //         rej(error);
        //         console.log("error", error);
        //     });
        // } else {
        //     rej({ err: 'Inactive Store' });
        // }
    })
};

export const getStoreConfigs = (configBaseApiUrl, baseApiUrl, groupFromCookie) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.BASE_STORE_CONFIGS_URL}${configBaseApiUrl}`)  //get store details
            .then(async (configResponse) => {
                if (configResponse.status == 200) {
                    const configData = configResponse.data;
                    if (configData) {
                        //create from time newDate
                        const storeFromTimeDate = new Date();
                        const [fhr, fmin] = configData.startTime.split(':');
                        storeFromTimeDate.setHours(fhr);
                        storeFromTimeDate.setMinutes(fmin);
                        //create to time newDate
                        const storeToTimeDate = new Date();
                        const [thr, tmin] = configData.closureTime.split(':');
                        storeToTimeDate.setHours(thr);
                        storeToTimeDate.setMinutes(tmin);
                        //check for store start and end time

                        //check for weekly off day start
                        configData.storeOff = false;
                        const currentday = new Date().toLocaleString('en-us', { weekday: 'long' }).substring(0, 3);
                        if (configData.weeklyOff?.includes(currentday)) {
                            configData.storeOff = true;
                        }
                        //check for weekly off day end
                        // if (!(new Date() <= storeToTimeDate && new Date() >= storeFromTimeDate)) {
                        //     configData.storeOff = true;
                        // }
                        //feedbackConfig sort by index start
                        if (configData.storeConfig.feedbackConfig && configData.storeConfig.feedbackConfig.typeList) {
                            configData.storeConfig.feedbackConfig.typeList = configData.storeConfig.feedbackConfig.typeList.sort((a, b) => (a.index > b.index) ? 1 : -1)
                            configData.storeConfig.feedbackConfig.typeList.map((config) => {
                                config.typeOptions = config.typeOptions.sort((a, b) => (a.index > b.index) ? 1 : -1)
                            })
                        }
                        //feedbackConfig sort by index end

                        getStoreData(groupFromCookie, baseApiUrl).then((response: any) => {
                            const resObj = {
                                ...response,
                                configData,
                            }
                            res(resObj)
                        }).catch(function (error) {
                            console.log('*************Invalid Link*************')
                            console.log("error == getStoreData failed", error);
                            responseError.line = 143;
                            responseError.errorMessage.error = error;
                            responseError.errorMessage.message = `API => getStoreData() api failed`;
                            rej({ responseError, err: 'Invalid Link' });
                        });
                    } else {
                        console.log('*************Invalid Link*************')
                        console.log("error == configData error , line-128, file-app/dataFetching/store/index.ts");
                        responseError.line = 151;
                        responseError.errorMessage.error = `configData unavailable`;
                        rej({ responseError, err: 'Invalid Link' });
                    }
                } else {
                    console.log('*************Invalid Link*************')
                    console.log('Session expired, re login into the system.');
                    responseError.line = 153;
                    responseError.errorMessage.error = `API => ${process.env.BASE_STORE_CONFIGS_URL}${configBaseApiUrl} api failed with status => ${configResponse.status}`;
                    rej({ responseError, err: 'Invalid Link' });
                }
            }).catch(function (error) {
                console.log('*************Invalid Link*************')
                console.log("error", error);
                responseError.line = 158;
                responseError.errorMessage.error = error;
                responseError.errorMessage.message = `API => ${process.env.BASE_STORE_CONFIGS_URL}${configBaseApiUrl} api failed`;
                rej({ responseError, err: 'Invalid Link' });
            });
    })
};

export const sessionLogin = () => {
    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.BASE_PCS_URL}/svlogin`, {}).then((response) => {
            res(response);
            // console.log("response", response);
        }).catch(function (error) {
            rej(error);
            console.log("error", error);
        });
    })
}

export const getTenantDataByTenantId = (tenantId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.BASE_PCS_URL}/tenants/id/${tenantId}`, {}).then((response) => {
            res(response.data);
            // console.log("response", response);
        }).catch(function (error) {
            rej(error);
            console.log("error", error);
        });
    })
}

export const getStoresByTenantId = (tenantId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_STORE}/tenant/${tenantId}`).then((response) => {
            if (response) res(response.data);
            else res([])
            // console.log("response", response);
        }).catch(function (error) {
            rej(error);
            console.log("error", error);
        });
    })
}

export const getStoresByTenantIdMysql = (tenantId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_TENANTS}/stores/tenant/${tenantId}`).then((response) => {
            if (response) res(response.data);
            else res([])
            // console.log("response", response);
        }).catch(function (error) {
            rej(error);
            console.log("error", error);
        });
    })
}

// 

export const getTenantAndStoresBySubdomain = (subdomain) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.BASE_PCS_URL}/tenantwithstoresbydomain/${subdomain}`, {}).then((response) => {
            res(response.data);
            // console.log("response", response);
        }).catch(function (error) {
            rej(error);
            console.log("error", error);
        });
    })
}

export const getPromotionByCode = (code) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_GET_BASE_CATALOG_URL}/promotions/getByCode?code=${code}`, {}).then((response) => {
            res(response.data);
            // console.log("response", response);
        }).catch(function (error) {
            rej(error);
            console.log("error", error);
        });
    })
}


export const markStoreOptInForWhatsapp = (tenantId) => {
    return new Promise((res, rej) => {
        APISERVICE.PUT(`${process.env.NEXT_PUBLIC_STORE}/optin/${tenantId}`, {})
            .then((response) => {
                res(response);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_STORE}/optin=>`, error);
            });
    })
}

//inventory
export const getItemStockByTenantAndStore = (tenantId, storeId) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_GET_INVENTORY_URL}/itemstock?tenantId=${tenantId}&storeId=${storeId}`, {}).then((response) => {
            res(response?.data?.data);
            // console.log("response", response);
        }).catch(function (error) {
            rej(error);
            console.log("error", error);
        });
    })
}

export const getItemStockByItemsId = (itemsList) => {
    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.NEXT_PUBLIC_GET_INVENTORY_URL}/itemstockbyitemid`, itemsList).then((response) => {
            if (response?.data?.data) {
                const stocks: any = response?.data?.data;
                Object.keys(stocks).map((stockDetailsId: any) => {
                    stocks[stockDetailsId] = stocks[stockDetailsId].stock;
                })
                res(stocks);
            }
            // console.log("response", response);
        }).catch(function (error) {
            rej(error);
            console.log("error", error);
        });
    })
}