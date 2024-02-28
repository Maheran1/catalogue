import { UPDATE_GROUP_STATUS, UPDATE_LOADER_STATUS, UPDATE_CURRENT_PAGE, UPDATE_PDP_ITEM, UPDATE_PDP_ITEM_STATUS, UPDATE_SEARCH_STATUS, UPDATE_ERROR_STATUS, UPDATE_GENERIC_IMAGES, UPDATE_WHATSAPP_TEMPLATES, UPDATE_ITEM_STOCK, UPDATE_SHOW_SERVICES_CART, UPDATE_STORES_LIST } from "@constant/common";

export const updateGroupStatus = (payload) => {
    return { type: UPDATE_GROUP_STATUS, payload };
}

export const updateGenericImages = (payload) => {
    return { type: UPDATE_GENERIC_IMAGES, payload };
}

export const updateCurrentPage = (payload) => {
    return { type: UPDATE_CURRENT_PAGE, payload };
}

export const updatePdpItem = (payload) => {
    return { type: UPDATE_PDP_ITEM, payload };
}

export const updatePdpItemStatus = (payload) => {
    return { type: UPDATE_PDP_ITEM_STATUS, payload };
}

export const enableLoader = (payload = true) => {
    return { type: UPDATE_LOADER_STATUS, payload };
}

export const disableLoader = (payload = false) => {
    return { type: UPDATE_LOADER_STATUS, payload };
}

export const updateSearchStatus = (payload) => {
    return { type: UPDATE_SEARCH_STATUS, payload };
}

export const updateErrorStatus = (payload) => {
    return { type: UPDATE_ERROR_STATUS, payload };
}

export const updateWhatsappTemplates = (payload) => {
    return { type: UPDATE_WHATSAPP_TEMPLATES, payload };
}

export const updateItemStock = (payload) => {
    return { type: UPDATE_ITEM_STOCK, payload };
}

export const showServicesCart = (payload) => {
    return { type: UPDATE_SHOW_SERVICES_CART, payload };
}

export const updateStoresList = (payload) => {
    return { type: UPDATE_STORES_LIST, payload };
}