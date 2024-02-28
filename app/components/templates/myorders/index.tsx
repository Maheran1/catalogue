import React, { useState, useEffect } from 'react'
import { useCookies } from "react-cookie";
import { useSelector, useDispatch } from 'react-redux';
import { getOrderByTenantIdAndGuestId } from '@storeData/order';
import OrderDetailModel from '@module/orderDetailModal';
import { disableLoader, enableLoader, showError } from '@context/actions';
import { windowRef } from '@util/window';
import { formatTimeTo12Hr } from '@util/utils';
import SvgIcon from '@element/svgIcon';
import { Backdrop } from '@material-ui/core';
import OrderBillPrintModal from '@module/orderBillPrintModal';

function OrderHistoryPage() {
    const dispatch = useDispatch();
    const [cookie, setCookie] = useCookies();
    const [userData, setUserCookie] = useState(cookie['user']);
    const store = useSelector((state: any) => state.store);
    const [orderHistoryData, setOrderHistoryData] = useState(null);
    const [activeOrder, setactiveOrder] = useState(null);
    const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null);

    useEffect(() => {
        dispatch(enableLoader());
        getOrderByTenantIdAndGuestId(userData.id, userData.tenantId)
            .then((order: any) => {
                if (order) {
                    // order = order.filter((o) => !o.appointmentId);
                    order.sort(function (a: any, b: any) {
                        var dateA: any = new Date(a.orderDay).getTime();
                        var dateB: any = new Date(b.orderDay).getTime();
                        return dateA < dateB ? 1 : -1; // ? -1 : 1 for ascending/increasing order
                    });
                    setOrderHistoryData(order);
                    dispatch(disableLoader());
                }
            })
            .catch((e) => {
                dispatch(disableLoader());
                dispatch(showError(e.error));
            })
    }, [])

    return (
        <>
            {orderHistoryData ?
                <div className="order-history-outer">
                    <p className="heading">Order History</p>
                    {orderHistoryData?.map((item, index) => {
                        return <div className="order-card" key={Math.random()} onClick={() => setactiveOrder(item)}>
                            <span>order #{item.orderId}</span>
                            <span className="right-align">{configData.currencySymbol} {item.total}</span>
                            <div>
                                <span className="order-type">{item.type}</span>
                                <span className="right-align order-type color">
                                    {new Date(item.orderDay).toLocaleString().split(", ")[0].split("/").join("-")} {formatTimeTo12Hr(`${new Date(item.createdOn).getHours()}:${new Date(item.createdOn).getMinutes()}`)}</span>
                            </div>
                            <div>
                                <span className="action-button">View Bill</span>
                                {/* <span className="action-button">Re Order</span> */}
                            </div>
                        </div>
                    })}
                    {activeOrder &&
                        <Backdrop
                            className="backdrop-modal-wrapper ordrer-backdrop-modal-wrapper"
                            open={activeOrder ? true : false}
                            style={{
                                zIndex: 20
                            }}
                        >
                            <div className="backdrop-modal-content"
                                style={{ height: `${activeOrder ? '100vh' : '0'}` }}
                            >
                                <div className="heading" >Order Details</div>
                                <div className="modal-close" onClick={() => setactiveOrder(false)}>
                                    <SvgIcon icon="close" />
                                </div>
                                <div className='pricing-details-wrap d-f-c'>
                                    {activeOrder ? <OrderBillPrintModal orderData={activeOrder} /> : <>
                                        Order not found
                                    </>}
                                    {/* <OrderDetailModel
                                        orderData={activeOrder}
                                        handleClose={() => setactiveOrder(null)} /> */}
                                </div>
                            </div>
                        </Backdrop>
                    }
                </div> :
                <div className='orders-unavailable d-f-c'>
                    Orders Unavailable
                </div>}
        </>
    )
}

export default OrderHistoryPage;
