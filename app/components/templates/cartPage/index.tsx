/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/no-unescaped-entities */
import { updateUserData } from '@context/actions/user';
import SvgIcon from '@element/svgIcon';
import Backdrop from '@material-ui/core/Backdrop';
import ConfirmationModal from '@module/confirmationModal';
import HorizontalProductCard from '@module/horizontalProductCard';
import UserRegistrationModal from '@module/userRegistration';
import { getItemStockByItemsId } from '@storeData/store';
import { navigateTo } from '@util/routerService';
import { windowRef } from '@util/window';
import { showError, updatePdpItem, updateSearchStatus } from 'app/redux/actions';
import React, { useEffect, useState } from 'react';
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from 'react-redux';

function BiArrowBack(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M21 11L6.414 11 11.707 5.707 10.293 4.293 2.586 12 10.293 19.707 11.707 18.293 6.414 13 21 13z" /></svg>;
}

function GrFormNextLink(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 512 512" height="1em" width="1em" {...props}><path d="M295.6 163.7c-5.1 5-5.1 13.3-.1 18.4l60.8 60.9H124.9c-7.1 0-12.9 5.8-12.9 13s5.8 13 12.9 13h231.3l-60.8 60.9c-5 5.1-4.9 13.3.1 18.4 5.1 5 13.2 5 18.3-.1l82.4-83c1.1-1.2 2-2.5 2.7-4.1.7-1.6 1-3.3 1-5 0-3.4-1.3-6.6-3.7-9.1l-82.4-83c-4.9-5.2-13.1-5.3-18.2-.3z" /></svg>;
}

function CgShoppingBag(props) {
    return <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>;
}

function CartPage() {
    const [pricingBreakdown, setpricingBreakdown] = useState({ total: 0, subTotal: 0, appliedTaxes: [] });
    const dispatch = useDispatch();
    const cartItems = useSelector((state: any) => state.orderItems);
    const storeData = useSelector((state: any) => state.store.storeData);
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const activeGroup = useSelector((state: any) => state.activeGroup);
    const itemStock = useSelector((state: any) => state.itemStock);
    const [cookie, setCookie] = useCookies();
    const [userData, setUserCookie] = useState(cookie['user']);
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const { configData } = storeData;
    const [showOrderingOff, setShowOrderingOff] = useState(false);
    const [showTotalBreakdownPopup, setShowTotalBreakdownPopup] = useState(false);
    const [currentStock, setCurrentStock] = useState<any>(null);

    useEffect(() => {
        if (windowRef) {
            dispatch(updateSearchStatus(false));// update redux isItemSearchActive state to hide the search component
            // dispatch(syncLocalStorageOrder());
            dispatch(updatePdpItem(null));
            // if (configData?.orderingOn && !configData?.storeOff && !configData?.readOnlyMenu && configData?.storeConfig?.basicConfig?.inventory) {
            //     getItemStockByTenantAndStore(storeData.tenantId, storeData.storeId).then((itemStockRes) => {
            //         if (itemStockRes) dispatch(updateItemStock(itemStockRes));
            //     })
            // }
        }
    }, [windowRef])

    useEffect(() => {
        if (cookie['user']) {
            setUserCookie(cookie['user'])
            cookie && dispatch(updateUserData(cookie['user']));
        }
    }, [cookie]);

    useEffect(() => {
        //check for item stock
        if (cartItems && cartItems.length != 0) {
            if (configData?.storeConfig?.basicConfig?.inventory && configData?.orderingOn && !configData?.storeOff && !configData?.readOnlyMenu) {
                checkForItemsStock().then(() => { console.log("s") }).catch(() => { console.log("e") })
            }
        }
        //check for item stock
    }, [])

    useEffect(() => {
        if (cartItems && cartItems.length) {
            let total: any = 0;
            let subTotal: any = 0;
            let appliedTaxes: any[] = [];
            cartItems.map((cartItem) => {

                let applicablePrice: any = (cartItem.salePrice || cartItem.price) * cartItem.quantity;
                subTotal += parseFloat(applicablePrice);
                total += parseFloat(applicablePrice);

                if (cartItem.txchrgs) {
                    cartItem.txchrgs.map((taxData: any) => {

                        let tDetails = configData?.txchConfig ? configData?.txchConfig?.filter((t: any) => t.name == taxData.name) : [];
                        //update global total
                        if (tDetails && tDetails.length != 0) {
                            taxData.isInclusive = tDetails[0].isInclusive;
                            let taxApplied = Number(((parseFloat(applicablePrice) / 100) * parseFloat(tDetails[0].value)).toFixed(2))
                            if (!taxData.isInclusive) total = Number((total + taxApplied).toFixed(2));
                            if (taxData.isInclusive) {
                                // x = (price * 100) / (tax + 100)
                                let itemActualPrice = ((applicablePrice * 100) / (100 + tDetails[0].value));
                                let actualTax = (itemActualPrice * tDetails[0].value) / 100;
                                taxApplied = Number((actualTax).toFixed(2));
                                // tax = x * (tax / 100)
                            }
                            //update global applied taxes total
                            let isAVl = appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                            if (isAVl != -1) {
                                appliedTaxes[isAVl].total = Number((appliedTaxes[isAVl].total + taxApplied).toFixed(2));
                            } else {
                                appliedTaxes.push({ name: tDetails[0].name, value: tDetails[0].value, total: taxApplied, isInclusive: tDetails[0].isInclusive })
                            }
                            taxData.value = taxApplied;
                        }
                    })
                }

            })
            setpricingBreakdown({ total, subTotal, appliedTaxes });
        }
    }, [cartItems])

    const onLoginClose = (user) => {
        if (user && user.firstName) {
            navigateTo('cart/checkout')
        }
        setOpenLoginModal(false);
    }

    const checkForItemsStock = () => {
        return new Promise((res, rej) => {
            if (configData?.storeConfig?.basicConfig?.inventory) {
                const { tenantId, storeId } = storeData;
                let itemsForStockCheck = cartItems.map((i: any) => {
                    if (i.variations && i.variations?.length) return { itemId: i.id, variationId: i.variations[0].id, tenantId, storeId }
                    else return { itemId: i.id, tenantId, storeId }
                })
                getItemStockByItemsId(itemsForStockCheck).then((stockRes: any) => {
                    let anyOutOfStock = false;
                    console.log("itemsForStockCheck", itemsForStockCheck)
                    console.log("stockRes", stockRes)
                    setCurrentStock(stockRes);
                    cartItems.map((i: any) => {

                        if (!anyOutOfStock) {
                            if (i.variations && i.variations.length != 0) {
                                console.log(`current item stock for :${i.name} - ${i.variations[0].name}`, stockRes[`${i.id}${i.variations[0].id}`])
                                anyOutOfStock = !(i.quantity <= stockRes[`${i.id}${i.variations[0].id}`]);
                            } else {
                                console.log(`current item stock for :${i.name}`, stockRes[i.id])
                                anyOutOfStock = !(i.quantity <= stockRes[i.id]);
                            }
                        }
                    })
                    anyOutOfStock ? rej() : res('');
                }).catch((e) => {
                    console.log(e)
                })
            } else {
                res('');
            }
        })
    }

    const checkout = () => {
        if (configData?.orderingOn && !configData?.storeOff && !configData?.readOnlyMenu) {
            checkForItemsStock().then(() => {
                if (configData?.minOrderValue) {
                    if (pricingBreakdown.total < configData?.minOrderValue) {
                        dispatch(showError('Minimum order amount is ' + configData.currencySymbol + configData?.minOrderValue));
                        return;
                    }
                }
                if (userData) {
                    navigateTo('cart/checkout')
                } else {
                    setOpenLoginModal(true);
                }
            }).catch(() => {
                dispatch(showError('Some items are unavailable!'))
            })
        } else {
            setShowOrderingOff(true);
        }
    }
    return (
        <div className="cart-page-wrap main-wrapper">
            {cartItems && cartItems.length != 0 ?
                <>
                    {/* <div className="page-heading">
                        <div className='icon' onClick={() => router.back()}><BiArrowBack /></div>
                        {cartItems && cartItems.length} items in cart</div> */}
                    <div className="itemslistcover">
                        {cartItems.map((cartItem) => {
                            const stock = currentStock ? currentStock[`${cartItem.id}${(cartItem.variations && cartItem.variations.length != 0) ? cartItem?.variations[0].id : ''}`] : null;
                            return <React.Fragment key={Math.random()}>
                                <HorizontalProductCard item={cartItem} handleClick={() => { }} config={{}} fromPage="cart" currentStock={stock} />
                            </React.Fragment>
                        })}
                    </div>
                    <div className="checkout-btn-wrap">
                        <div className='total-wrap d-f-c'>
                            <div className='title'>Total : </div>
                            <div className='value' onClick={() => setShowTotalBreakdownPopup(true)}> {configData.currencySymbol}{pricingBreakdown.total}</div>
                            <div className='icon d-f-c' onClick={() => setShowTotalBreakdownPopup(true)}><SvgIcon icon="info" /></div>
                        </div>
                        <div className='icon-wrap' onClick={checkout}>
                            <>Checkout</>
                            <div className='icon'><GrFormNextLink /></div>
                        </div>
                    </div>
                </>
                :
                // CART IS EMPTY
                <div className="emptyCart-main-wrap">
                    <div className="emptyCart-wrap">
                        <div className='cart-logo d-f-c'>
                            <span className="line1"></span>
                            <span className="line2"></span>
                            <span className="line3"></span>
                            <CgShoppingBag />
                        </div>
                        <div className="cart-status">CART IS EMPTY</div>
                        <div className="cart-subtext">Looks like you haven't added anything to your cart yet</div>
                        <button className="cart-button empty-cart-btn" onClick={() => navigateTo('home')}>Explore More</button>
                    </div>
                </div>
            }

            <UserRegistrationModal
                handleResponse={(e) => onLoginClose(e)}
                isApppGrpChangeOnUserGdrChange={true}
                open={openLoginModal}
                fromPage="CART_PAGE"
                heading={'Login for placing order'}
            />
            <ConfirmationModal
                openModal={showOrderingOff}
                title={'Ordering confirmation'}
                message={'Currently we are unserviceable'}
                buttonText={'OK'}
                handleClose={() => setShowOrderingOff(false)}
            />

            <Backdrop
                className="backdrop-modal-wrapper"
                open={showTotalBreakdownPopup ? true : false}
                onClick={() => setShowTotalBreakdownPopup(false)}
            >
                <div className="backdrop-modal-content"
                    style={{ height: `${showTotalBreakdownPopup ? `${140 + (pricingBreakdown?.appliedTaxes?.length * 30)}px` : '0'}` }}
                >
                    <div className="heading" >Pricing Details</div>
                    <div className="modal-close" onClick={() => setShowTotalBreakdownPopup(false)}>
                        <SvgIcon icon="close" />
                    </div>
                    <div className='pricing-details-wrap d-f-c'>
                        <div className='heading'>
                            <div className='title'>SubTotal</div>
                            {pricingBreakdown.appliedTaxes?.map((taxData: any, i: number) => {
                                return <div className='title' key={Math.random()}>{taxData.name}{taxData.isInclusive ? "(Inclusive)" : ''}({taxData.value}%)</div>
                            })}
                            <div className='title grand-total'>Grand Total</div>
                        </div>
                        <div className='details'>
                            <div className='value'>{configData.currencySymbol} {pricingBreakdown.subTotal}</div>
                            {pricingBreakdown.appliedTaxes?.map((taxData: any, i: number) => {
                                return <div className='value' key={Math.random()}>{configData.currencySymbol} {taxData.total}</div>
                            })}
                            <div className='value grand-total'>{configData.currencySymbol} {pricingBreakdown.total}</div>
                        </div>
                    </div>
                </div>
            </Backdrop>
        </div>
    )
}

export default CartPage
