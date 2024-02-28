import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { syncLocalStorageOrder } from "app/redux/actions/order";
import { windowRef } from '@util/window';

function StickyCart() {
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const currentPage = useSelector((state: any) => state.currentPage);
    const [total, setTotal] = useState(0);
    const dispatch = useDispatch();
    const cartItems = useSelector((state: any) => state.orderItems);
    const cartAppointment = useSelector((state: any) => state.appointmentServices);
    const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null);
    const [totalHrs, setTotalHrs] = useState<any>(0);

    useEffect(() => {
        if (windowRef) {
            // dispatch(syncLocalStorageOrder());
            document.body.style.overflow = 'unset';
        }
    }, [windowRef])

    useEffect(() => {
        // const defaultWrapperElement: any = document.getElementsByClassName('default-wrapper');
        if (cartItems && cartItems.length) {
            let totalCopy = 0;
            cartItems.map((cartItem) => {
                totalCopy += (cartItem.price * cartItem.quantity);
            })
            setTotal(totalCopy);
            // defaultWrapperElement[0].style.marginBottom = '60px'
        } else {
            // defaultWrapperElement[0].style.marginBottom = '0px'
            setTotal(0);
        }
    }, [cartItems])

    useEffect(() => {
        // const defaultWrapperElement: any = document.getElementsByClassName('default-wrapper');
        if (cartAppointment && cartAppointment.length) {

            let totalHrs: any = 0;
            cartAppointment.map((item) => {
                totalHrs += (item.durationType?.includes('min')) ? parseFloat(item.duration) / 60 : parseFloat(item.duration);
            })
            setTotalHrs(totalHrs.toFixed(2));
            // defaultWrapperElement[0].style.marginBottom = '60px'
        } else {
            // defaultWrapperElement[0].style.marginBottom = '0px'
            setTotalHrs(0);
        }
    }, [cartAppointment])

    return (
        <>
            {(configData.orderingOn && !configData.storeConfig?.appointmentConfig?.active && cartItems && cartItems?.length != 0 && currentPage != 'cart' && currentPage != 'checkout' && currentPage != 'appointment') ? <Link href={baseRouteUrl + 'cart'} shallow={true}>
                <div className="viewcartbar" >
                    <div className="vcbitem">
                        {cartItems.length > 1 ? <>{cartItems.length} Items</> : <>{cartItems.length} Item</>}
                    </div>
                    <div className="vcbprice">{configData.currencySymbol} {total}</div>
                    <div className="vcbtxt">View Cart</div>
                </div>
            </Link> : null}
            {(configData.storeConfig?.appointmentConfig?.active && cartAppointment?.length != 0 && currentPage != 'cart' && currentPage != 'checkout' && currentPage != 'appointment') ? <Link href={baseRouteUrl + 'appointment'} shallow={true}>
                <div className="viewcartbar" >
                    <div className="vcbitem">
                        {cartAppointment.length > 1 ? <>{cartAppointment.length} Services</> : <>{cartAppointment.length} Service</>}
                    </div>
                    {totalHrs != '0.0' && totalHrs != '0.00' && <>
                        <div className="vcbprice">
                            {totalHrs > 1 ? <>{totalHrs} Hrs</> : <>{totalHrs} Hr</>}
                        </div>
                    </>}
                    <div className="vcbtxt">Book Appointment</div>
                </div>
            </Link> : null
            }
        </>
    )
}

export default StickyCart;
