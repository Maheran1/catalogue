import { createStore, applyMiddleware, combineReducers } from 'redux'
import logger from "redux-logger";
import rootReducer from "app/redux/reducers/index";
import { composeWithDevTools } from "redux-devtools-extension";
import { MakeStore, HYDRATE, createWrapper, Context } from "next-redux-wrapper";
import { windowRef } from '@util/window';


const bindMiddleware = (middleware) => {
    if (process.env.NODE_ENV !== 'production') {
        return composeWithDevTools(applyMiddleware(...middleware))
    }
    return applyMiddleware(...middleware)
}

const reducer = (state, action) => {
    if (action.type === HYDRATE) {
        const nextState = {
            ...state, // use previous state
            ...action.payload, // apply delta from hydration
        }
        // if (state.store) nextState.store = state.store // preserve count value on client side navigation
        if (state.store.storeData) nextState.store.storeData = state.store.storeData // preserve count value on client side navigation
        if (state.activeGroup) nextState.activeGroup = state.activeGroup // preserve count value on client side navigation
        if (windowRef && windowRef?.document && windowRef?.document?.cookie) windowRef.document.cookie = `grp=${state.activeGroup}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
        return nextState
    } else {
        return rootReducer(state, action)
    }
}

// const initStore = () => {
//     return createStore(reducer, bindMiddleware([logger]))
// }

// export const wrapper = createWrapper(initStore)


export const makeStore = (context: Context) =>
    createStore(reducer, bindMiddleware([]));

export const wrapper = createWrapper(makeStore, { debug: false });
