import React, { useState, useEffect } from 'react'
import { useCookies } from "react-cookie";
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { replaceOrderIitems } from '@context/actions/order';
import { disableLoader, showSuccess } from '@context/actions';
import { getOrderByOrderId } from '@storeData/order';
import { store } from '@context/reducers/store';
import { navigateTo } from '@util/routerService';

function OrderConfirmation() {
    const [cookie, setCookie] = useCookies();
    const [userData, setUserCookie] = useState(cookie['user']);
    const store = useSelector((state: any) => state.store);
    const activeGroup = useSelector((state: any) => state.activeGroup);
    const dispatch = useDispatch();
    const router = useRouter()
    const [orderSuccess, setOrderSuccess] = useState(false);
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const [orderData, setOrderData] = useState(null);
    const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null)

    useEffect(() => {
        dispatch(disableLoader());
        if (router.query.pagepath.includes("orderconfirmation")) {
            if (router.query.status == 'paid') {
                dispatch(replaceOrderIitems([]));
                setOrderSuccess(true);
                getOrderByOrderId(router.query.id).then((order: any) => {
                    if (order) {
                        setOrderData(order);
                    }
                })
            } else {
                setOrderSuccess(false);
                dispatch(showSuccess('Your payment has been failed.', 5000));
                navigateTo('cart')
            }
        }
    }, [router])

    return (
        <>
            {orderSuccess ?
                <div className="con-main-wrap clearfix">
                    {(orderData && orderData.type == 'delivery') ? <div className="con-wrap">
                        <div><img className="cart-logo" alt="Respark" src={`/assets/images/${activeGroup}/order_confirm.png`} style={{ width: '50%' }} /></div>
                        <div className="cart-status">{userData.firstName}</div>
                        <div className="cart-subtext">Thank you for your purchase.</div>
                        <div className="cart-subtext">{configData.deliveryDisclaimer}</div>
                    </div> :
                        <div className="con-wrap">
                            <div><img className="cart-logo" alt="Respark" src={`/assets/images/${activeGroup}/order_confirm.png`} style={{ width: '50%' }} /></div>
                            <div className="cart-status">{userData.firstName}</div>
                            <div className="cart-subtext">Thank you for your purchase.</div>
                            <div className="cart-subtext">{configData.pickupDisclaimer}</div>
                        </div>
                    }
                    <div className="order-details-wrap">
                        <div className="heading">Order Details:</div>
                        <div className="cartWrapper">
                            {orderData?.products?.map((item, index) => {
                                return <div className="item-wrap clearfix" key={Math.random()}>
                                    <div className="name">{item.name}({item.quantity})</div>
                                    <div className="price">
                                        <>
                                            {item.salePrice == 0 ?
                                                <div className="prod-sale-price">
                                                    {configData.currencySymbol} {item.price * item.quantity}
                                                </div> :
                                                <div className="prod-sale-price">
                                                    {configData.currencySymbol} {item.salePrice * item.quantity}
                                                </div>
                                            }
                                        </>
                                    </div>
                                    {item.variations && item.variations.length !== 0 && <div className="variation-wrap">
                                        <div className="name">{item.variations[0].name}</div>
                                    </div>}
                                </div>
                            })}
                        </div>
                        <div className="order-total">Total: {configData.currencySymbol}{orderData?.total}</div>
                        <div className="cart-button-wrap">
                            <button className="cart-button" onClick={() => navigateTo('home')}>Explore More</button>
                        </div>
                    </div>
                </div>
                :
                <div className="con-main-wrap">
                    <div className="con-wrap">
                        <div><img className="cart-logo" alt="Respark" src={`/assets/images/${activeGroup}/order_confirm.png`} style={{ width: '70%' }} /></div>
                        <div className="cart-status">{userData.firstName}</div>
                        <div className="cart-subtext">Ohh! Your payment has been failed.</div>
                        {/* <div className="cart-subtext">Your item is ready for pickup, kindly collect it from frontdesk.</div> */}
                        <div><button className="cart-button" onClick={() => navigateTo('home')}>Explore More</button></div>
                    </div>
                </div>}
        </>
    )
}

export default OrderConfirmation;
