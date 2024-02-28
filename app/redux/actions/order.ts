import { REPLACE_ORDER_ITEMS, SYNC_LOCAL_STORAGE_ORDER } from "@constant/order";

export const replaceOrderIitems = (payload) => {
    return { type: REPLACE_ORDER_ITEMS, payload };
}

export const syncLocalStorageOrder = () => {
    return { type: SYNC_LOCAL_STORAGE_ORDER, payload: '' };
}