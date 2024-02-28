/* eslint-disable no-case-declarations */
import { UPDATE_GROUP_STATUS, UPDATE_LOADER_STATUS, UPDATE_CURRENT_PAGE, UPDATE_PDP_ITEM, UPDATE_PDP_ITEM_STATUS, UPDATE_SEARCH_STATUS, UPDATE_ERROR_STATUS, UPDATE_GENERIC_IMAGES, UPDATE_WHATSAPP_TEMPLATES, UPDATE_ITEM_STOCK, UPDATE_SHOW_SERVICES_CART, UPDATE_STORES_LIST } from '@constant/common';
import { setValueInCookies } from '@util/webstorage';

//this reducer will create new key inside redux store as function name and map this in reducers/index
export function activeGroup(state: any = '', action) { // reduxState = {activeGroup: action.payload}
    switch (action.type) {
        case UPDATE_GROUP_STATUS:
            // setValueInCookies('grp', action.payload, action.expDays);
            return (action.payload);
        default:
            return state;
    }
}

export function currentPage(state: any = '', action) { // reduxState = {currentPage: action.payload}
    switch (action.type) {
        case UPDATE_CURRENT_PAGE:
            return (action.payload);
        default:
            return state;
    }
}

export function loader(state: any = '', action) {// reduxState = {loader: action.payload}
    switch (action.type) {
        case UPDATE_LOADER_STATUS:
            return (action.payload);
        default:
            return state;
    }
}

export function pdpItem(state: any = '', action) {// reduxState = {pdpItem: action.payload}
    switch (action.type) {
        case UPDATE_PDP_ITEM:
            return (action.payload);
        default:
            return state;
    }
}

export function pdpItemStatus(state: any = '', action) {// reduxState = {pdpItem: action.payload}
    switch (action.type) {
        case UPDATE_PDP_ITEM_STATUS:
            return (action.payload);
        default:
            return state;
    }
}

export function isItemSearchActive(state: boolean = false, action) { // reduxState = {isItemSearchActive: action.payload}
    switch (action.type) {
        case UPDATE_SEARCH_STATUS:
            return (action.payload);
        default:
            return state;
    }
}

export function serverError(state: any = '', action) {// reduxState = {serverError: action.payload}
    switch (action.type) {
        case UPDATE_ERROR_STATUS:
            return (action.payload);
        default:
            return state;
    }
}

export function genericImages(state: any = {}, action) { // reduxState = {genericImages: action.payload}
    switch (action.type) {
        case UPDATE_GENERIC_IMAGES:
            return { ...action.payload };
        default:
            return state;
    }
}

export function whatsappTemplates(state: any = [], action) { // reduxState = {whatsappTemplates: action.payload}
    switch (action.type) {
        case UPDATE_WHATSAPP_TEMPLATES:
            return [...action.payload];
        default:
            return state;
    }
}

export function itemStock(state: any = {}, action) {// reduxState = {itemStock: action.payload}
    switch (action.type) {
        case UPDATE_ITEM_STOCK:
            return (action.payload);
            break;
        default:
            return state;
    }
}

export function showServicesCartModal(state = false, action) {// reduxState = {pdpItem: action.payload}
    switch (action.type) {
        case UPDATE_SHOW_SERVICES_CART:
            return (action.payload);
        default:
            return state;
    }
}

export function storesList(state = [], action) {// reduxState = {pdpItem: action.payload}
    switch (action.type) {
        case UPDATE_STORES_LIST:
            return (action.payload);
        default:
            return state;
    }
}
