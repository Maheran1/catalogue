import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import router from "next/router";
import { getMembershipOrderByOrderId } from '@storeData/order';
import { ORDER_COMPLETED, ORDER_REJECTED } from '@constant/order';
import { disableLoader, enableLoader } from '@context/actions';
import OrderDetailModel from '@module/orderDetailModal';
import { navigateTo } from '@util/routerService';
import MembershipInvoiceModal from './membershipInvoiceModal';

function MembershipInvoicePage() {
    const dispatch = useDispatch();
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const [orderData, setOrderData] = useState(null)
    const orderId = router.query.pagepath ? router.query.pagepath[1] : '';
    const { configData } = useSelector((state: any) => state.store.storeData);

    useEffect(() => {
        if (orderId) {
            dispatch(enableLoader());
            getMembershipOrderByOrderId(orderId).then((order: any) => {
                dispatch(disableLoader());
                if (order) {
                    setOrderData(order);
                }
            }).catch((error) => {
                dispatch(disableLoader());
                console.log(error);
                setOrderData('');
            })
        }
    }, [orderId])

    const redirectToHome = () => {
        navigateTo('home');
    }

    return (
        <div className="invoice-wrapper">
            <MembershipInvoiceModal
                orderData={orderData}
                handleClose={() => { }} />
            {Boolean(configData?.storeConfig?.basicConfig?.catalogue) && <div className="footer-btn-wrap">
                <button className='primary-btn' onClick={redirectToHome}>Explore More Services & Products</button>
            </div>}
        </div>
    )
}

export default MembershipInvoicePage