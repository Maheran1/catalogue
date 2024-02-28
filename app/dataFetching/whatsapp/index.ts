import { APISERVICE } from "@api/RestClient";
import * as qs from 'qs';

//Get all user opt-ins for an app
export const getAllTemplates = (gupshupConfig) => {
    return new Promise((res, rej) => {
        APISERVICE.GET(`${process.env.NEXT_PUBLIC_GUPSHUP_BASE_URL}template/list/${gupshupConfig.name}`, { apikey: gupshupConfig.key })
            .then((response) => {
                if (response) res(response.data.templates);
                else res([])
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_GUPSHUP_BASE_URL}/template/list=>`, error);
            });
    })
    // const headers = new HttpHeaders().set('apikey', this.gupshupConfig.key)

    // return this.httpClient.get(environment.gupshupBaseUri + `template/list/${appName}`, { 'headers': headers });
}

//     //Mark a user as opted-in
//     public markUserOptin(number: string) {

//     const headers = new HttpHeaders()
//         .set('apikey', this.gupshupConfig.key).set('Content-Type', 'application/x-www-form-urlencoded')

//     return this.httpClient.post(environment.gupshupBaseUri + `app/opt/in/${appName}`, qs.stringify({ user: number }), { headers: headers });
// }

export const markUserOptIn = (gupshupConfig: any, number: any) => {

    const headers = {
        'apikey': gupshupConfig.key,
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.NEXT_PUBLIC_GUPSHUP_BASE_URL}app/opt/in/${gupshupConfig.name}`, qs.stringify({ user: number }), headers)
            .then((response) => {
                res(response);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_GUPSHUP_BASE_URL}}=>`, error);
            });
    })
}


//     //Send messages
export const sendWhatsappMsgMessage = (gupshupConfig: any, body: any) => {

    // const headers = new HttpHeaders()
    //     .set('apikey', this.gupshupConfig.key)
    //     .set('Content-Type', 'application/x-www-form-urlencoded')

    const headers = {
        'apikey': gupshupConfig.key,
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    return new Promise((res, rej) => {
        APISERVICE.POST(`${process.env.NEXT_PUBLIC_GUPSHUP_BASE_URL}template/msg`, qs.stringify(body), headers)
            .then((response) => {
                res(response);
            }).catch(function (error) {
                rej(error);
                console.log(`Error = ${process.env.NEXT_PUBLIC_GUPSHUP_BASE_URL}}=>`, error);
            });
    })
}