import { UPDATE_WHATSAPP_TEMPLATES } from '@constant/common';
import { UPDATE_STORE_DATA, REMOVE_STORE_DATA, UPDATE_STORE_ITEMS_LIST, UPDATE_STORE } from '@constant/store';
const initialState = {
    tenantName: '',
    tenantId: '',
    storeName: '',
    storeId: '',
    baseRouteUrl: '',
    whatsappTemplates: [],
    storeData: null,
    validPagepath: false,
    validStore: false
}
export function store(state: any = {}, action) {
    switch (action.type) {
        case UPDATE_STORE_DATA:
            return { ...state, storeData: action.payload };
        case UPDATE_STORE:
            return { ...state, ...action.payload };
        case REMOVE_STORE_DATA:
            return { ...state, storeData: null };
        case UPDATE_STORE_ITEMS_LIST:
            return { ...state, storeData: { ...state.storeData, itemsList: action.payload } };
        default:
            return state;
    }
}
