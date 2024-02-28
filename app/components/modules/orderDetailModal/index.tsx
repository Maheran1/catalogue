import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import router from "next/router";
import { ORDER_ACCEPTED, ORDER_COMPLETED, ORDER_FIX_DISCOUNT_TYPE, ORDER_PERCENTAGE_DISCOUNT_TYPE } from '@constant/order';
import { navigateTo } from '@util/routerService';
import { disableLoader, enableLoader } from '@context/actions';
import { getUserByTenantAndMobile } from '@storeData/user';
import { formatTimeTo12Hr, getCurrencySymbol, getDateObj, getTofixValue } from '@util/utils';

function OrderDetailModel({ handleClose, orderData }) {
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const { configData } = useSelector((state: any) => state.store.storeData);
    const orderId = router.query.pagepath ? router.query.pagepath[1] : '';
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);
    const [orderStatus, setOrderStatus] = useState('')
    const [billingObj, setBillingObj] = useState<any>({
        service: { items: [], discount: null, appliedTaxes: [], subtotal: 0, total: 0, taxesTotal: 0 },
        product: { items: [], discount: null, appliedTaxes: [], subtotal: 0, total: 0, taxesTotal: 0 },
        overAll: { items: [], discount: null, appliedTaxes: [], subtotal: 0, total: 0, taxesTotal: 0 },
        payment: { payMode: '', payments: [] }
    })
    const [availableTypes, setAvailableTypes] = useState<any>(['product', 'service']);
    const [userDetails, setUserDetails] = useState(null);
    const dispatch = useDispatch();


    const getOrderItemApplicablePrice = (item: any) => {
        // here variation price not considered because at the time of order booking it is set inside products object as price and salePrice
        let applicablePrice: any = (('billingPrice' in item) ? parseFloat(item.billingPrice) : (parseFloat(item.salePrice) || parseFloat(item.price))) * item.quantity;
        if ((item.complementary?.remark)) {//if item is complimentary do not calculate price
            applicablePrice = 0;
        }
        if (item.fromPackage) {//if item is complimentary do not calculate price
            applicablePrice = 0;
        }
        if (Number(item.membershipPrice)) {//if item is complimentary do not calculate price
            applicablePrice = item.billingPrice - Number(item.membershipPrice);
        }
        return applicablePrice;
    }

    useEffect(() => {
        if (orderData) {
            dispatch(enableLoader());
            getUserByTenantAndMobile(orderData?.tenantId, orderData?.storeId, orderData.phone).then((response) => {
                dispatch(disableLoader());
                setUserDetails(response)
            }).catch(function (error) {
                dispatch(disableLoader());
                console.log("error");
            });
            setOrderStatus(orderData?.statuses[orderData?.statuses?.length - 1]?.state);
            const orderCopy = { ...orderData };
            const availableTypesFromOrder = Array.from(new Set(orderCopy.products.map((p: any) => p.type)));
            availableTypesFromOrder.map((type: any) => {
                const billingObjCopy = { ...billingObj };
                billingObjCopy[type].items = orderCopy.products.filter((i: any) => i.type == type);

                if (orderCopy.discount) {
                    if (Object.prototype.toString.call(orderCopy.discount) === '[object Array]') {
                        //type wise discount
                        let appliedDiscount = orderCopy.discount.filter((d: any) => d.onType == type);
                        billingObjCopy[type].discount = appliedDiscount.length != 0 ? appliedDiscount[0] : null;
                    } else {
                        //common discount
                        billingObjCopy[type].discount = orderCopy.discount;
                    }
                }
                setAvailableTypes(availableTypesFromOrder);
                setBillingObj({ ...billingObjCopy });
            })
        }
    }, [orderData])

    const getItemPriceForBilling = (item: any) => {
        let applicablePrice: any = (parseFloat(item.billingPrice) || parseFloat(item.salePrice) || parseFloat(item.price)) * item.quantity;
        if ((item.complementary?.remark)) {//if item is complimentary do not calculate price
            applicablePrice = 0;
        }
        if (item.fromPackage) {//if item is complimentary do not calculate price
            applicablePrice = 0;
        }
        return applicablePrice;
    }

    useEffect(() => {
        //for products calculations
        const billingObjCopy = { ...billingObj };
        billingObjCopy.overAll = { items: [], discount: null, appliedTaxes: [], subtotal: 0, total: 0, taxesTotal: 0 };
        availableTypes.map((type: any, typeIndex: number) => {
            let appliedTaxes: any[] = [];
            let subtotal: any = 0;
            let total: any = 0;
            let taxesTotal: any = 0;
            let totalPriceableItems = billingObjCopy[type].items.filter((product: any) => getItemPriceForBilling(product) ? true : false);
            let isItemWiseDiscount = billingObjCopy[type].items.filter((product: any) => product.discount);
            billingObjCopy[type].items.map((product: any, i: number) => {
                let applicablePrice: any = getOrderItemApplicablePrice(product);
                product.discount = product.discount || '';

                subtotal += parseFloat(applicablePrice);
                //if discount apply
                if (((billingObjCopy[type].discount && billingObjCopy[type].discount?.value) || isItemWiseDiscount.length != 0) && applicablePrice) {
                    let discountValue: any = 0;
                    if (!billingObjCopy[type].discount) billingObjCopy[type].discount = { type: '', value: 0, total: 0 }
                    if (isItemWiseDiscount.length != 0) {
                        discountValue = Number(((product.discount) * (applicablePrice)) / 100);
                    } else {
                        if (billingObjCopy[type].discount.type == ORDER_FIX_DISCOUNT_TYPE) {
                            discountValue = parseFloat(billingObjCopy[type].discount.value) / totalPriceableItems.length;
                        } else {
                            discountValue = Number(((billingObjCopy[type].discount.value || 0) * (applicablePrice)) / 100)
                        }
                    }
                    discountValue = getTofixValue(discountValue);
                    applicablePrice = Number(parseFloat(applicablePrice) - discountValue);
                    billingObjCopy[type].discount.total = getTofixValue(Number(billingObjCopy[type].discount.total || 0) + discountValue);
                    // overAll discount calculations
                    billingObjCopy.overAll.discount = getTofixValue(Number(billingObjCopy.overAll.discount) + Number(discountValue));
                }

                total += parseFloat(applicablePrice);
                if (product.txchrgs) {
                    if (product.txchrgs) {
                        product.txchrgs.map((taxData: any) => {
                            if (applicablePrice) {
                                let tDetails = configData?.txchConfig ? configData?.txchConfig?.filter((t: any) => t.name == taxData.name) : [];
                                taxData.isInclusive = tDetails[0].isInclusive;
                                //update global total
                                if (tDetails.length != 0) {
                                    let taxApplied = getTofixValue((parseFloat(applicablePrice) / 100) * parseFloat(tDetails[0].value))
                                    if (!taxData.isInclusive) total = getTofixValue(total + taxApplied);
                                    if (taxData.isInclusive) {
                                        // x = (price * 100) / (totalTxesApplied + 100) => [:(9% + 9% = (18 + 100))]
                                        let totalTaxesApplied = product.txchrgs.reduce((a: any, b: any) => a + Number(configData?.txchConfig?.filter((t: any) => t.name == b.name)[0].value), 0);
                                        let itemActualPrice = ((applicablePrice * 100) / (100 + totalTaxesApplied));
                                        let actualTax = (itemActualPrice * tDetails[0].value) / 100;
                                        taxApplied = getTofixValue(actualTax);
                                        // tax = x * (tax / 100)
                                    }
                                    taxData.value = taxApplied;
                                    //update global applied taxes total
                                    let isAVl = appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                                    if (isAVl != -1) {
                                        appliedTaxes[isAVl].total = getTofixValue(appliedTaxes[isAVl].total + taxApplied);
                                    } else {
                                        appliedTaxes.push({ name: tDetails[0].name, value: tDetails[0].value, total: taxApplied, isInclusive: tDetails[0].isInclusive })
                                    }
                                    taxesTotal = getTofixValue(taxesTotal + taxApplied);
                                    //update global applied taxes total

                                    //overAll tax calculation
                                    let isAVlinOverall = billingObjCopy.overAll.appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                                    if (isAVlinOverall != -1) {
                                        billingObjCopy.overAll.appliedTaxes[isAVlinOverall].total = getTofixValue(billingObjCopy.overAll.appliedTaxes[isAVlinOverall].total + taxApplied);
                                    } else {
                                        billingObjCopy.overAll.appliedTaxes.push({ name: tDetails[0].name, value: tDetails[0].value, total: taxApplied, isInclusive: tDetails[0].isInclusive })
                                    }
                                    //overAll tax calculation

                                }
                            } else {
                                let isAVl = appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                                if (isAVl != -1) {
                                    appliedTaxes[isAVl].total = getTofixValue(appliedTaxes[isAVl].total + 0);
                                } else {
                                    appliedTaxes.push({ name: taxData.name, value: taxData.taxRate, total: 0, isInclusive: taxData.isInclusive })
                                }
                            }
                        })
                    }
                }
                if (i == billingObjCopy[type].items.length - 1) {
                    //update type wise charges on evry product iteration
                    billingObjCopy[type].appliedTaxes = appliedTaxes;
                    billingObjCopy[type].taxesTotal = taxesTotal;
                    billingObjCopy[type].subtotal = subtotal;
                    billingObjCopy[type].total = total;
                }
            })

            //update overAll charges when all products loop ends
            billingObjCopy.overAll.taxesTotal = Number(billingObjCopy.overAll.taxesTotal + parseFloat(taxesTotal));
            billingObjCopy.overAll.subtotal = Number(billingObjCopy.overAll.subtotal + parseFloat(subtotal));
            billingObjCopy.overAll.total = Number(billingObjCopy.overAll.total + parseFloat(total));
            console.log("billingObjCopy", billingObjCopy)
            if (typeIndex == availableTypes.length - 1) {
                if (billingObj.overAll.total != billingObjCopy.overAll.total) {
                    setBillingObj(billingObjCopy);
                }
            }
        })
    }, [billingObj])

    const priceValue = (item: any) => {
        let value: any = item.billingPrice;
        let offerApplied = false;
        let tooltip = `Single ${item.type} price`
        if (item.fromPackage) {
            value = 0;
            tooltip = 'Package applied'
            offerApplied = true;
        } else if (item.membershipPrice) {
            value = getTofixValue(item.billingPrice - item.membershipPrice)
            tooltip = `Membership of ${configData.currencySymbol + item.membershipPrice} applied, Original ${item.type} price: ${configData.currencySymbol}${item.billingPrice}`
            offerApplied = true;
        } else if (item.complementary?.remark) {
            tooltip = `${item.type} marked as complimentary`
            value = getTofixValue(item.billingPrice, true);
            offerApplied = true;
        } else if (item.discount) {
            value = getTofixValue((item?.discount ? Number((item?.discount * (getTofixValue(item.billingPrice - item.membershipPrice) * item.quantity)) / 100) : 0))
            tooltip = `Discount applied of ${item.discount}% (${getTofixValue(item?.discount ? Number((item?.discount * (item.billingPrice - item.membershipPrice)) / 100) : 0)}), Original ${item.type} price: ${configData.currencySymbol}${item.billingPrice}`
            offerApplied = true;
        }
        return [value, tooltip, offerApplied]
    }

    return (
        <div className="invoice-wrapper">
            {/* <div className='page-heading'>Order Invoice</div> */}
            {orderData ? <div className="invoice-page-wrap">
                <div className='salon-details-wrap'>
                    <div className='logo-wrap'>
                        <img src={storeMetaData.logoPath} alt="Respark" />
                    </div>
                    <div className='salon-details'>
                        <div className='name'>{configData?.tenant}</div>
                        <div className='address s-detail'>{storeMetaData?.address}, {storeMetaData?.area}, {storeMetaData?.city}, {storeMetaData?.state}
                            {storeMetaData?.pincode && <>, {storeMetaData?.pincode}</>}
                        </div>
                        <div className='phone s-detail'>{storeMetaData?.phone}
                            {storeMetaData?.phone1 && storeMetaData?.phone && <>, </>}
                            {storeMetaData?.phone1 && <>{storeMetaData?.phone1}</>}
                        </div>
                        <div className='email s-detail'>{storeMetaData?.email}</div>
                        {storeMetaData?.gstn && <div className='gstn s-detail'>GSTN: {storeMetaData?.gstn}</div>}
                    </div>
                </div>
                <div className='user-details-wrap'>
                    <div className='user-details'>
                        <div className='subheading'>Bill to:</div>
                        <div className='name'>{orderData?.guest}</div>
                        <div className='phone'>{orderData?.phone} {orderData?.email && <>{orderData?.email}</>}</div>
                        <div className='name'>GSTN: {orderData?.guestGSTN}</div>
                        {/* {(userDetails?.addressList && userDetails?.addressList.length != 0 && userDetails?.addressList[0].line) ?
                            <div className='user-address phone'>{userDetails?.addressList[0].line},&nbsp;
                                {userDetails?.addressList[0].area && <>{userDetails?.addressList[0].area}, </>}
                                {userDetails?.addressList[0].landmark && <>{userDetails?.addressList[0].landmark}, </>}
                                {userDetails?.addressList[0].city && <>{userDetails?.addressList[0].city}, </>}
                                {userDetails?.addressList[0].code && <>{userDetails?.addressList[0].code} </>}
                            </div> :
                            <></>} */}
                        {Boolean(userDetails?.loyalty?.availablePointsAll) && <div className="time"><span>Loyalty Points : </span>{userDetails?.loyalty?.availablePointsAll}</div>}
                        {Boolean(userDetails?.loyalty?.availablePointsService) && <div className="time"><span>Loyalty Points Services : </span> {userDetails?.loyalty?.availablePointsService}</div>}
                        {Boolean(userDetails?.loyalty?.availablePointsProduct) && <div className="time"><span>Loyalty Points Products : </span> {userDetails?.loyalty?.availablePointsProduct}</div>}
                        {/* {Boolean(userDetails?.loyalty?.pointsEarnedAll) && <div className="time"><span>Loyalty Earned : </span> {orderData?.loyalty?.pointsEarnedAll}</div>} */}
                        {Boolean(userDetails?.membership?.balanceAmount?.membership?.balanceAmount) && <div className='phone'><span>Membership Balance : </span>{getCurrencySymbol()} {userDetails?.membership?.balanceAmount}</div>}
                        {/* {(userDetails?.membership?.balanceAmount?.membership?.typeId !== 2) && Boolean(userDetails?.membership?.balanceAmount?.membership?.balanceAmount) && <div className='phone'><span>Membership Balance : </span>{getCurrencySymbol()} {userDetails?.membership?.balanceAmount}</div>} */}
                    </div>
                    <div className='date-wrap'>
                        {/* <div className='date'><span>Created On: </span>{orderData?.createdOn?.substring(0, 10)} {`${new Date(orderData?.createdOn).getHours()}:${new Date(orderData?.createdOn).getMinutes()}`}</div>
                        <div className='time'><span>Order Date: </span>{new Date(orderData?.orderDay).toLocaleDateString()}, {new Date(orderData?.orderDay).toLocaleTimeString()}</div> */}
                        <div className='subheading'>Invoice No: <div className='order-id'>{orderData?.orderId}</div></div>
                        <div className='subheading'>Date: <div className='time'>{orderData?.orderDay?.substring(0, 10)}</div></div>
                        <div className='subheading'>Time: <div className='time'>{`${new Date(orderData?.createdOn).getHours()}:${new Date(orderData?.createdOn).getMinutes()}`}</div></div>

                    </div>
                </div>

                {availableTypes.map((type: any, ti: number) => {
                    return <React.Fragment key={ti}>
                        {billingObj[type].items.length != 0 && <div className="bill-item-type-wrap">
                            <div className="heading cap-text">{type} Bill</div>
                            <div className='invoice-details-wrap order-invoice-details'>
                                <div className='services-list-wrap'>
                                    <div className='heading-wrap d-f-c'>
                                        <div className='srnumber'>Sr.</div>
                                        <div className='name'>Item</div>
                                        <div className='expert'>Expert</div>
                                        <div className='qty'>Qty.</div>
                                        <div className='amt'>Rate</div>
                                        <div className='amt'>Amt.</div>
                                    </div>
                                    <div className='details-wrap'>
                                        {billingObj[type].items.map((itemDetails: any, i: number) => {
                                            return <div className='width-100' key={i} >
                                                <div className='service-details d-f-c'>
                                                    <div className='srnumber'>{i + 1}</div>
                                                    <div className='name'>{itemDetails.name}
                                                        {/* <div className='name'><span>{itemDetails.category}</span> - {itemDetails.name} */}
                                                        {itemDetails.variations && itemDetails.variations.length != 0 && <div className='variations-wrap'>
                                                            ({itemDetails.variations[0].name}
                                                            {itemDetails.variations.length != 0 && itemDetails.variations[0]?.variations && itemDetails.variations[0]?.variations?.length != 0 &&
                                                                <>-{itemDetails.variations[0]?.variations[0]?.name}</>}
                                                            {itemDetails.variations.length != 0 && itemDetails.variations[0]?.variations && itemDetails.variations[0]?.variations?.length != 0 && itemDetails.variations[0]?.variations[0]?.variations?.length != 0 &&
                                                                <>-{itemDetails.variations[0]?.variations[0]?.variations[0]?.name}</>})
                                                        </div>}
                                                    </div>
                                                    {itemDetails.staff ? <div className='expert d-f-c'>{itemDetails.staff}</div> :
                                                        <div className='expert'>-</div>}
                                                    <div className='qty'>{itemDetails.quantity}</div>
                                                    <div className='amt'>{getTofixValue(itemDetails.billingPrice)}</div>
                                                    {itemDetails.complementary?.remark ? <div className='amt'>0</div> :
                                                        <div className='amt'>
                                                            {getTofixValue(priceValue(itemDetails)[0] * itemDetails.quantity)}
                                                        </div>}
                                                </div>
                                                <div className='applied-data'>
                                                    {Boolean(itemDetails.complementary?.remark) && <>Complimentary applied</>}
                                                    {Boolean(itemDetails.fromPackage) && <>Package applied</>}
                                                    {Boolean(itemDetails.discount) && <>Discount applied of {itemDetails.discount}%</>}
                                                    {Boolean(itemDetails.membershipPrice) && <>Membership applied of {getCurrencySymbol()} {getTofixValue(itemDetails.membershipPrice, true)}</>}
                                                </div>
                                            </div>

                                        })}
                                    </div>
                                </div>
                                <div className='invoice-total-details-wrap type-wise-order-invoice'>
                                    <div className='total-details'>
                                        <div className='total-entity-wrap'>
                                            <div className='title'>SubTotal</div>
                                            <div className='value'>{getCurrencySymbol()}{getTofixValue(billingObj[type]?.subtotal, true)}</div>
                                        </div>
                                        {billingObj[type].taxesTotal != 0 && billingObj[type].appliedTaxes.map((taxData: any, i: number) => {
                                            return <div className="total-entity-wrap" key={i}>
                                                <div className='title' >{taxData.name}{taxData.isInclusive ? "(Inclusive)" : ''}({taxData.value}%)</div>
                                                <div className='value' >{getCurrencySymbol()}{getTofixValue(taxData.total, true)}</div>
                                            </div>
                                        })}
                                        {billingObj[type].discount && <div className="total-entity-wrap">
                                            {<div className='title'>Discount{billingObj[type].discount?.type == ORDER_PERCENTAGE_DISCOUNT_TYPE && <>({billingObj[type].discount?.value}%)</>}</div>}
                                            {billingObj[type].discount?.type == ORDER_FIX_DISCOUNT_TYPE ? <>
                                                <div className='value'>{getCurrencySymbol()}{getTofixValue(billingObj[type].discount?.value, true)} </div>
                                            </> : <>
                                                <div className='value'>{getCurrencySymbol()}{getTofixValue(billingObj[type].discount?.value * (Number(billingObj[type].taxesTotal) + Number(billingObj[type].subtotal)) / 100, true)}</div>
                                            </>}
                                        </div>}
                                        <div className="total-entity-wrap">
                                            <div className='title'>Grand Total</div>
                                            <div className='value'>{getCurrencySymbol()}{getTofixValue(billingObj[type].total, true)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    </React.Fragment>
                })}

                <div className="bill-item-type-wrap">
                    {availableTypes.length > 1 && <>
                        <div className="heading cap-text">Combine bill total (Services + Products)</div>
                        <div className='invoice-total-details-wrap type-wise-order-invoice'>
                            <div className='total-details overall-total-wrap'>
                                <div className='total-entity-wrap'>
                                    <div className='title'>SubTotal</div>
                                    <div className='value'>{getCurrencySymbol()} {getTofixValue(billingObj.overAll?.subtotal, true)}</div>
                                </div>
                                {billingObj.overAll.taxesTotal != 0 && billingObj.overAll.appliedTaxes.map((taxData: any, i: number) => {
                                    return <div className="total-entity-wrap" key={i}>
                                        <div className='title' >{taxData.name}{taxData.isInclusive ? "(Inclusive)" : ''}({taxData.value}%)</div>
                                        <div className='value' >{getCurrencySymbol()} {getTofixValue(taxData.total, true)}</div>
                                    </div>
                                })}
                                {!!billingObj.overAll.discount && <div className="total-entity-wrap">
                                    <div className='title'>Discount</div>
                                    <div className='value'>{getCurrencySymbol()} {getTofixValue(billingObj.overAll.discount, true)} </div>
                                </div>}
                                <div className="total-entity-wrap">
                                    <div className='title'>Grand Total</div>
                                    <div className='value'>{getCurrencySymbol()} {getTofixValue(billingObj.overAll.total, true)}</div>
                                </div>
                            </div>
                        </div>
                    </>}
                </div>
                {(orderStatus == ORDER_COMPLETED || orderStatus == ORDER_ACCEPTED) && <div className='payment-wrap'>
                    <div className='payment-by d-f-c'>
                        <div className='paid-via'>
                            <span>Paid Via : </span>
                            {orderData?.payments?.length != 0 && orderData?.payments.map((paymode: any, pIndex: number) => {
                                return <React.Fragment key={pIndex}>
                                    {paymode?.name} - {getTofixValue(paymode?.payment, true)} {(orderData?.payments?.length != 0 && pIndex != orderData?.payments?.length - 1) && <>, </>}
                                </React.Fragment>
                            })}
                        </div>
                    </div>
                </div>}
                <div className='note'>
                    Thank you for choosing us
                </div>
            </div> : <>
                {orderId ? <div className='no-data card'>
                    The invoice you are looking for is not available
                </div> : <div className='no-data card'>
                    Invalid link
                </div>}
            </>}
            {/* <div className="footer-btn-wrap">
                <button className='primary-btn' onClick={redirectToHome}>Explore More Services & Products</button>
            </div> */}
        </div>
    )
}

export default OrderDetailModel