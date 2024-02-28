/* eslint-disable no-case-declarations */
import { REPLACE_ORDER_ITEMS, SYNC_LOCAL_STORAGE_ORDER } from "@constant/order";
import { setValueInLocalStorage, getValueFromLocalStorage } from "@util/webstorage";

const initialState = []
export function orderItems(state = initialState, action) {
    switch (action.type) {
        case REPLACE_ORDER_ITEMS:
            setValueInLocalStorage('orderItems', action.payload);
            return (action.payload);
        case SYNC_LOCAL_STORAGE_ORDER:
            const persistedOrder: any = getValueFromLocalStorage('orderItems');
            return persistedOrder || initialState;
        default:
            return state;
    }
}