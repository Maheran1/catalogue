import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import router from "next/router";
import { ORDER_ACCEPTED, ORDER_COMPLETED, ORDER_FIX_DISCOUNT_TYPE, ORDER_PERCENTAGE_DISCOUNT_TYPE } from '@constant/order';
import { navigateTo } from '@util/routerService';
import { disableLoader, enableLoader } from '@context/actions';
import { getUserByGuestId, getUserByTenantAndMobile } from '@storeData/user';
import { formatTimeTo12Hr, getCurrencySymbol, getDateObj, getTofixValue } from '@util/utils';

function MembershipInvoiceModal({ handleClose, orderData }) {
    const { configData } = useSelector((state: any) => state.store.storeData);
    const orderId = router.query.pagepath ? router.query.pagepath[1] : '';
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);
    const [userDetails, setUserDetails] = useState(null);
    const dispatch = useDispatch();
    const [billingObj, setBillingObj] = useState({
        appliedTaxes: [],
        total: 0,
        taxesTotal: 0,
    })

    useEffect(() => {
        if (orderData) {
            dispatch(enableLoader());
            getUserByGuestId(orderData?.tenantId, orderData?.storeId, orderData.guestId).then((response) => {
                dispatch(disableLoader());
                setUserDetails(response)
            }).catch(function (error) {
                dispatch(disableLoader());
                console.log("error");
            });
            const applicablePrice = orderData.purchaseAmount;
            let total = 0;
            let taxesTotal = 0;
            let appliedTaxes = [];
            if (Boolean(orderData?.txchrgs?.length)) {
                orderData.txchrgs.map((taxData: any) => {
                    if (applicablePrice) {
                        let tDetails = configData?.txchConfig ? configData?.txchConfig?.filter((t: any) => t.name == taxData.name) : [];
                        taxData.isInclusive = tDetails[0].isInclusive;
                        //update global total
                        if (tDetails.length != 0) {
                            let taxApplied = getTofixValue((parseFloat(applicablePrice) / 100) * parseFloat(tDetails[0].value))
                            if (!taxData.isInclusive) total = getTofixValue(total + taxApplied);
                            if (taxData.isInclusive) {
                                // x = (price * 100) / (totalTxesApplied + 100) => [:(9% + 9% = (18 + 100))]
                                let totalTaxesApplied = orderData.txchrgs.reduce((a: any, b: any) => a + Number(configData?.txchConfig?.filter((t: any) => t.name == b.name)[0].value), 0);
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
                            let isAVlinOverall = appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                            if (isAVlinOverall != -1) {
                                appliedTaxes[isAVlinOverall].total = getTofixValue(appliedTaxes[isAVlinOverall].total + taxApplied);
                            } else {
                                appliedTaxes.push({ name: tDetails[0].name, value: tDetails[0].value, total: taxApplied, isInclusive: tDetails[0].isInclusive })
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
                setBillingObj({ appliedTaxes, total, taxesTotal })
            }
        }
    }, [orderData])


    return (
        <div className="invoice-wrapper membership-invoice-wrapper ">
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
                        <div className='name'>{userDetails?.firstName}</div>
                        <div className='phone'>{userDetails?.mobileNo} {userDetails?.email && <>{userDetails?.email}</>}</div>
                        {userDetails?.gstN && <div className='name'>GSTN: {userDetails?.gstN}</div>}
                        {(userDetails?.addressList && userDetails?.addressList.length != 0 && userDetails?.addressList[0].line) ?
                            <div className='user-address phone'>{userDetails?.addressList[0].line},&nbsp;
                                {userDetails?.addressList[0].area && <>{userDetails?.addressList[0].area}, </>}
                                {userDetails?.addressList[0].landmark && <>{userDetails?.addressList[0].landmark}, </>}
                                {userDetails?.addressList[0].city && <>{userDetails?.addressList[0].city}, </>}
                                {userDetails?.addressList[0].code && <>{userDetails?.addressList[0].code} </>}
                            </div> :
                            <></>}
                    </div>
                    <div className='date-wrap'>
                        <div className='subheading'>Invoice No: <div className='order-id'>{orderData?.invoiceNo}</div></div>
                        <div className='subheading'>Date: <div className='time'>{orderData?.createdOn?.substring(0, 10)}</div></div>
                        <div className='subheading'>Time: <div className='time'>{`${new Date(orderData?.createdOn).getHours()}:${new Date(orderData?.createdOn).getMinutes()}`}</div></div>
                        <div className='subheading'>Purchase Date: <div className='time'>{orderData?.fromDate?.substring(0, 10)}</div></div>
                        <div className='subheading'>Expiry Date: <div className='time'>{orderData?.toDate?.substring(0, 10)}</div></div>
                    </div>
                </div>

                <div className="bill-item-type-wrap">
                    <div className="heading cap-text">Membership Purchased Bill</div>
                    <div className='invoice-details-wrap order-invoice-details'>
                        <div className='services-list-wrap'>
                            <div className='heading-wrap d-f-c'>
                                <div className='name'>Name</div>
                                <div className='expert'>Expert</div>
                                <div className='qty'>Code</div>
                                <div className='amt'>Amt.</div>
                            </div>
                            <div className='details-wrap'>
                                <div className='width-100' >
                                    <div className='service-details d-f-c'>
                                        <div className='name'>{orderData.membershipName}</div>
                                        {orderData.staffName ? <div className='expert d-f-c'>{orderData.staffName}</div> :
                                            <div className='expert'>-</div>}
                                        <div className='qty'>{orderData.membershipCode}</div>
                                        <div className='amt'>{getTofixValue(orderData.purchaseAmount)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='invoice-total-details-wrap type-wise-order-invoice'>
                            <div className='total-details'>
                                {/* <div className='total-entity-wrap'>
                                    <div className='title'>SubTotal</div>
                                    <div className='value'>{getCurrencySymbol()}{orderData.purchaseAmount}</div>
                                </div>
                                {billingObj.appliedTaxes.map((taxData: any, i: number) => {
                                    return <div className="total-entity-wrap" key={i}>
                                        <div className='title' >{taxData.name}{taxData.isInclusive ? "(Inclusive)" : ''}({taxData.value}%)</div>
                                        <div className='value' >{getCurrencySymbol()}{getTofixValue(taxData.total, true)}</div>
                                    </div>
                                })} */}
                                <div className="total-entity-wrap">
                                    <div className='title'>Grand Total</div>
                                    <div className='value'>{getCurrencySymbol()}{orderData.purchaseAmount}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='payment-wrap'>
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
                </div>
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
        </div>
    )
}

export default MembershipInvoiceModal