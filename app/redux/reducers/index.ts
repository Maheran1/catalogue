import { combineReducers } from 'redux';
import { loader, activeGroup, currentPage, pdpItem, pdpItemStatus, isItemSearchActive, serverError, genericImages, whatsappTemplates, itemStock, showServicesCartModal, storesList } from '@reducer/common';
import { store } from '@reducer/store';
import { alert } from '@reducer/alert';
import { user } from '@reducer/user';
import { orderItems } from '@reducer/order';
import { appointmentServices } from '@reducer/appointment';

const rootReducer = combineReducers({
  store,
  activeGroup,
  loader,
  alert,
  currentPage,
  pdpItem,
  storesList,
  pdpItemStatus,
  isItemSearchActive,
  user,
  orderItems,
  appointmentServices,
  serverError,
  genericImages,
  whatsappTemplates,
  itemStock,
  showServicesCartModal
});

export default rootReducer;
