/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link';
import HorizontalProductCard from '@module/horizontalProductCard';
import router from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { showError, showServicesCart, showSuccess, updatePdpItem } from '@context/actions';
import { PRODUCT, SERVICE } from '@constant/types';
import SvgIcon from '@element/svgIcon';
import { replaceAppointmentServices } from '@context/actions/appointment';
import { Backdrop } from '@material-ui/core';
import { SERVICES_INDEX } from '@constant/common';
import { isActiveAtBinaryIndex } from '@util/utils';
import { getItemsList } from '@util/dataFilterService';

function MdNavigateNext(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>;
}

function Item({ item, config, type = '' }) {
    const { configData, keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);
    const dispatch = useDispatch();
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);
    const [selectedVariationService, setSelectedVariationService] = useState<any>('');
    const [selectedVariation, setSelectedVariation] = useState<any>('');
    const appointmentItems = useSelector((state: any) => state.appointmentServices);
    const [isAlreadyAdded, setIsAlreadyAdded] = useState(false);
    const [isAlreadyAddedVariation, setIsAlreadyAddedVariation] = useState(false);
    const [showVariationSelectionModal, setShowVariationSelectionModal] = useState(false)
    const modalRef = useRef(null);
    const [modalHeight, setModalHeight] = useState<any>('300px');
    const [showLongDescription, setShowLongDescription] = useState(false);
    let description = item?.description;
    if (item?.description?.includes('||')) {
        // description = item?.description?.replaceAll('||', ', ');
    }
    const alreadyShortDescription = description <= description?.substring(0, 90);
    const shortDescription = description ? description?.substring(0, 90) : '';


    const storeData = useSelector((state: any) => state.store ? state.store.storeData : null);
    const [originalItem, setOriginalItem] = useState(item)
    useEffect(() => {
        if (item && !('price' in item)) {
            getItemsList(storeData.categories).then((itemsList: any) => {
                const sitem = itemsList?.find((i) => i.name.toLowerCase() === item?.name.toLowerCase());
                // sitem && (itemData = { ...itemData, sitem })
                sitem.showOnUi = true;
                if (sitem) {
                    setOriginalItem({ ...item, ...sitem })
                }
            });
        }
    }, [item])

    useEffect(() => {
        if (showVariationSelectionModal) {
            setModalHeight(`${modalRef?.current?.clientHeight + 60}px`);
        } else setModalHeight(0)
    }, [showVariationSelectionModal])

    useEffect(() => {
        setIsAlreadyAddedVariation(false);
        if (selectedVariation) {
            appointmentItems.map((appointentItem, i) => {
                if ((appointentItem.id == originalItem?.id)) {//get list of cart items having same service data as current pdp originalItem
                    if (appointentItem.variations?.length != 0) {
                        const cartVariations = getSelectedVariationObj(appointentItem);
                        if (JSON.stringify(cartVariations) === JSON.stringify(selectedVariation)) {//check for originalItem of same service and selected variations
                            setIsAlreadyAddedVariation(true);
                        }
                    }
                }
            })
        }
    }, [selectedVariation])

    const onBackdropOutsideClick = (event: any) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setShowVariationSelectionModal(false);
        }
    }

    useEffect(() => {
        setSelectedVariation(null);
        setSelectedVariationService(null);
        setIsAlreadyAddedVariation(false);
        if (appointmentItems.length) {//here selectedVariation check is for the first time page load
            const itemIndex: number = appointmentItems.findIndex((appointentItem) => (appointentItem.id == originalItem?.id));
            if (itemIndex != -1) {
                let serviceCopy = { ...appointmentItems[itemIndex] }
                if (serviceCopy.variations?.length != 0) {
                    setSelectedVariation(getSelectedVariationObj(serviceCopy));
                    setSelectedVariationService({ ...serviceCopy });
                }
                setIsAlreadyAdded(true);
            } else setIsAlreadyAdded(false)
        } else setIsAlreadyAdded(false)
    }, [appointmentItems]);


    let openPdp = false;
    if (originalItem.type == keywords[SERVICE]) {
        openPdp = configData.showServicesPdp;
    } else if (originalItem.type == keywords[PRODUCT]) {
        openPdp = configData.showProductPdp;
    }

    const addToAppointment = () => {
        if (originalItem?.variations?.length !== 0 && !selectedVariationService) {
            dispatch(showError('Select service variation', 3000));
            return;
        }
        const appointmentItemsCopy = appointmentItems ? [...appointmentItems] : [];
        const serviceCopy = { ...originalItem };
        if (originalItem?.variations?.length !== 0) {
            appointmentItemsCopy.push(selectedVariationService);
        } else {
            serviceCopy.txchrgs = [];
            let price: any = parseFloat(serviceCopy.price);
            let salePrice: any = parseFloat(serviceCopy.salePrice);
            serviceCopy.price = price;
            serviceCopy.salePrice = salePrice;
            serviceCopy.txchrgs = calculateTaxes(salePrice || price);
            appointmentItemsCopy.push(serviceCopy);
        }
        dispatch(replaceAppointmentServices(appointmentItemsCopy));
        dispatch(showSuccess('Service Added', 2000));
        setShowVariationSelectionModal(false);
        dispatch(showServicesCart(true));
    }
    const removeFromAppointment = () => {
        const appointmentItemsCopy = appointmentItems ? [...appointmentItems] : [];
        let cartItemIndex = null;
        appointmentItems.map((appointentItem, i) => {
            if ((appointentItem.id == originalItem?.id)) {//get list of cart items having same service data as current pdp originalItem
                if (appointentItem.variations?.length != 0) {
                    const cartVariations = getSelectedVariationObj(appointentItem);
                    if (JSON.stringify(cartVariations) === JSON.stringify(selectedVariation)) {//check for originalItem of same service and selected variations
                        cartItemIndex = i;
                    }
                } else {
                    cartItemIndex = i;
                }
            }
        })
        appointmentItemsCopy.splice(cartItemIndex, 1);
        dispatch(replaceAppointmentServices(appointmentItemsCopy));
        dispatch(showSuccess('Service Removed', 2000));
        setIsAlreadyAdded(false);
        setShowVariationSelectionModal(false);
    }

    const calculateTaxes = (taxebalePrice: any) => {
        let txchrgs: any[] = [];
        if (configData.txchConfig && configData.txchConfig.length != 0) {
            configData.txchConfig.map((taxData: any) => {
                if (taxData.active) {
                    if (isActiveAtBinaryIndex(taxData.applyOn, SERVICES_INDEX) && !taxData.charge) {
                        let taxApplied = parseFloat(((parseFloat(taxebalePrice) / 100) * parseFloat(taxData.value)).toFixed(2));
                        if (taxData.isInclusive) {
                            // x = (price * 100) / (tax + 100)
                            let itemActualPrice = ((taxebalePrice * 100) / (100 + taxData.value));
                            let actualTax = (itemActualPrice * taxData.value) / 100;
                            taxApplied = Number((actualTax).toFixed(2));
                            // tax = x * (tax / 100)
                        }
                        const taxObj = {
                            id: taxData.id,
                            name: taxData.name,
                            type: taxData.type,
                            isInclusive: taxData.isInclusive,
                            value: parseFloat((taxApplied).toFixed(2)),
                        }
                        txchrgs.push(taxObj);
                    }
                }
            })
        }
        return txchrgs;
    }
    const onSelectVariation = (variantIndex: any, subVariantIndex: any, subSubVariantIndex: any, clickedVariant: any) => {
        if (clickedVariant.price) {
            const serviceCopy = { ...originalItem };
            serviceCopy.txchrgs = [];
            let price: any = parseFloat(serviceCopy.price);
            let salePrice: any = parseFloat(serviceCopy.salePrice);
            let vObj = serviceCopy.variations[variantIndex];
            if (variantIndex != null) {
                serviceCopy.variations = [{
                    "id": vObj.id,
                    "name": vObj.name,
                    "price": vObj.price,
                    "salePrice": vObj.salePrice,
                    "variations": []
                }]
                price = parseFloat(vObj.price);
                salePrice = parseFloat(vObj.salePrice);
                if (subVariantIndex != null) {
                    vObj = vObj.variations[subVariantIndex]
                    serviceCopy.variations[0].variations = [{
                        "id": vObj.id,
                        "name": vObj.name,
                        "price": vObj.price,
                        "salePrice": vObj.salePrice,
                        "variations": []
                    }]
                    price = parseFloat(vObj.price);
                    salePrice = parseFloat(vObj.salePrice);
                }
                if (subSubVariantIndex != null) {
                    vObj = vObj.variations[subSubVariantIndex]
                    serviceCopy.variations[0].variations[0].variations = [{
                        "id": vObj.id,
                        "name": vObj.name,
                        "price": vObj.price,
                        "salePrice": vObj.salePrice,
                        "variations": []
                    }]
                    price = parseFloat(vObj.price);
                    salePrice = parseFloat(vObj.salePrice);
                }
            }
            serviceCopy.price = price;
            serviceCopy.salePrice = salePrice;
            serviceCopy.txchrgs = calculateTaxes(salePrice || price);
            setSelectedVariation(getSelectedVariationObj(serviceCopy));
            setSelectedVariationService({ ...serviceCopy });
        }
    }

    const getSelectedVariationObj = (service) => {
        const selectedVariations = { variant: '', subVariant: '', subSubVariant: '', }
        if (service.variations?.length != 0) {
            let vObj = service.variations[0];
            selectedVariations.variant = vObj.name;//weekdays or weekend
            if (vObj.variations?.length != 0) {
                vObj = vObj.variations[0]
                selectedVariations.subVariant = vObj.name;//male or female
            }
            if (vObj.variations?.length != 0) {
                vObj = vObj.variations[0]
                selectedVariations.subSubVariant = vObj.name;//adult or kids
            }
        }
        return { ...selectedVariations };
    }

    const onClickItem = (originalItem: any) => {
        if (!configData.showServicesPdp) {
            if (configData.storeConfig?.appointmentConfig?.active) {
                if (isAlreadyAdded && !(originalItem.variations && originalItem.variations.length != 0)) {
                    dispatch(showServicesCart(true));
                } else {
                    // if (openPdp) {
                    if (originalItem.variations && originalItem.variations.length != 0) {
                        setShowVariationSelectionModal(true)
                    } else {
                        addToAppointment();
                    }
                    // }
                }
            }
        } else {
            dispatch(updatePdpItem(originalItem));
        }
    }

    const renderItem = (salePrice: number, price: number) => {

        return <React.Fragment>

            <div className="name-price-wrap">
                <div className="service-name">{originalItem.name} {originalItem.discount ? <span className='originalItem-discount-value'>({originalItem.discount}% off)</span> : null}</div>
                <div className='price-select-wrap'>
                    {(salePrice || price) ? <div className="service-price">
                        {salePrice == 0 ?
                            <div className="prod-sale-price">
                                {configData.currencySymbol} {price}
                            </div> :
                            <div className="prod-sale-price">
                                <span>{configData.currencySymbol} {price}</span>
                                {configData.currencySymbol} {salePrice}
                            </div>
                        }
                    </div> : <div className="prod-sale-price p-on-req">
                        Price on request
                    </div>}
                    {originalItem.iTag && <div className="itag">{originalItem.iTag}</div>}
                </div>
            </div>

            {!configData.showServicesPdp &&
                <>
                    {description && <>
                        {alreadyShortDescription ? <>
                            <div className="description">{description}</div>
                        </> : <>
                            {showLongDescription ? <div className="description" onClick={(e) => { setShowLongDescription(false); e.stopPropagation() }}>
                                {description}
                                <span>Read Less</span>
                            </div> : <div className="description" onClick={(e) => { setShowLongDescription(true); e.stopPropagation() }}>
                                {shortDescription}...
                                <span>Read More</span>
                            </div>}
                        </>}
                    </>}
                </>
            }

            <div className='duration-select-wrap'>
                {originalItem?.duration !== 0 ? <div className="serv-pdp-servtypetime d-f-c">
                    <SvgIcon icon="timer" width={20} height={20} />
                    <div className='duration'>{originalItem?.duration} {originalItem?.durationType}</div>
                </div> : <div className='duration'></div>}
                {configData.storeConfig?.appointmentConfig?.active && <>
                    {isAlreadyAdded ? <div className='select-btn selected'>Selected</div> : <div className="select-btn">Select</div>}
                </>}
            </div>

            {/* {originalItem.iTag ? <div className="service-arrow-icon onward">(On.)</div> :
                    <div className="service-arrow-icon">
                        <MdNavigateNext />
                    </div>} */}
        </React.Fragment>
    }

    if (originalItem?.showOnUi) {
        let itemUrl = originalItem.itemUrl;
        if (!itemUrl) {
            itemUrl = originalItem.name.toLowerCase().split(" ").join("-") + '-pdp';
            itemUrl = ('pagepath' in router.query) ? router.query.pagepath[0] + "/" + itemUrl : `/${itemUrl}`;
        }
        let price = originalItem.price;
        let salePrice = originalItem.salePrice;
        if (originalItem.variations && originalItem.variations.length != 0) {
            if (originalItem.variations[0].variations && originalItem.variations[0].variations.length != 0) {
                if (originalItem.variations[0].variations[0].variations && originalItem.variations[0].variations[0].variations.length != 0) {
                    if (originalItem.variations[0].variations[0].variations[0].variations && originalItem.variations[0].variations[0].variations[0].variations.length != 0) {
                        price = originalItem.variations[0].variations[0].variations[0].variations[0].price;
                        salePrice = originalItem.variations[0].variations[0].variations[0].variations[0].salePrice;
                    } else {
                        price = originalItem.variations[0].variations[0].variations[0].price;
                        salePrice = originalItem.variations[0].variations[0].variations[0].salePrice;
                    }
                } else {
                    price = originalItem.variations[0].variations[0].price;
                    salePrice = originalItem.variations[0].variations[0].salePrice;
                }
            } else {
                price = originalItem.variations[0].price;
                salePrice = originalItem.variations[0].salePrice;
            }
        }
        if (originalItem.type == keywords[SERVICE] || type == keywords[SERVICE]) {
            return (
                <>
                    {config.redirection ? <Link href={baseRouteUrl + itemUrl} shallow={true}>
                        <div className={`service-cover`}>
                            {/* <div className={`service-cover ${((!configData.storeConfig?.appointmentConfig?.active && configData.showServicesPdp) || (!configData.storeConfig?.appointmentConfig?.active && !configData.showServicesPdp)) ? "service-pdp-flow" : ""}`}> */}
                            {renderItem(salePrice, price)}
                        </div>
                    </Link> :
                        <div className={`service-cover`} onClick={() => onClickItem(originalItem)}>
                            {/* <div className={`service-cover ${((!configData.storeConfig?.appointmentConfig?.active && configData.showServicesPdp) || (!configData.storeConfig?.appointmentConfig?.active && !configData.showServicesPdp)) ? "service-pdp-flow" : ""}`} onClick={() => onClickItem(originalItem)}> */}
                            {renderItem(salePrice, price)}
                        </div>
                    }

                    <Backdrop
                        className="backdrop-modal-wrapper"
                        open={showVariationSelectionModal ? true : false}
                        onClick={onBackdropOutsideClick}
                    >
                        <div className="backdrop-modal-content variation-selection-modal"
                            style={{ height: modalHeight }}
                        >
                            <div className="heading" >Select variation for service</div>
                            <div className="modal-close" onClick={() => setShowVariationSelectionModal(false)}>
                                <SvgIcon icon="close" />
                            </div>
                            <div className="service-pdp-details clearfix" ref={modalRef}>
                                <div className="serv-pdp-details-wrap clearfix">
                                    {originalItem?.variations && originalItem?.variations?.length !== 0 ?
                                        <>
                                            <div className="variations-wrap clearfix">
                                                {originalItem?.variations?.map((variant: any, variantIndex: any) => {    //weekdays/weekends
                                                    if (('showOnUi' in variant) ? variant.showOnUi : true) {
                                                        return <React.Fragment key={variantIndex}>
                                                            <div className={`variation-name variant1 clearfix ${(!variant.variations || variant.variations.length == 0) && 'variation-wrap'} ${(selectedVariation?.variant == variant.name) && 'active'}`}
                                                                onClick={() => onSelectVariation(variantIndex, null, null, variant)}
                                                            >
                                                                <div className='service-name'>{variant.name} </div>
                                                                {variant.price > 0 && <div className="service-price">{configData.currencySymbol} {variant.salePrice || variant.price}</div>}
                                                            </div>
                                                            {variant.variations && variant.variations?.length !== 0 && variant.variations?.map((subVariant: any, subVariantIndex: any) => {    //male/female
                                                                if (('showOnUi' in subVariant) ? subVariant.showOnUi : true) {
                                                                    return <React.Fragment key={subVariantIndex}>
                                                                        {(subVariant.variations && subVariant.variations?.length !== 0) ?
                                                                            <>
                                                                                {subVariant?.variations?.map((subSubVariant: any, subSubVariantIndex: any) => {    //adult/kid
                                                                                    if (('showOnUi' in subSubVariant) ? subSubVariant.showOnUi : true) {
                                                                                        return <div key={subSubVariantIndex}
                                                                                            className={`variation-wrap variant3 clearfix ${(selectedVariation?.variant == variant.name && selectedVariation?.subVariant == subVariant.name && selectedVariation?.subSubVariant == subSubVariant.name) && 'active'}`}
                                                                                            onClick={() => onSelectVariation(variantIndex, subVariantIndex, subSubVariantIndex, subSubVariant)}>
                                                                                            {subSubVariant.name && <div className="variation-name">{subSubVariant.name}</div>}
                                                                                            {subSubVariant.price && <div className="variation-price">{configData.currencySymbol} {subSubVariant.salePrice || subSubVariant.price}</div>}
                                                                                        </div>
                                                                                    }
                                                                                })}
                                                                            </> :
                                                                            <>
                                                                                {subVariant.price <= 0 ?
                                                                                    <div className="variation-name variant2">{subVariant.name}</div> :
                                                                                    <div className={`variation-wrap clearfix ${(selectedVariation?.variant == variant.name && selectedVariation?.subVariant == subVariant.name) && 'active'}`}
                                                                                        onClick={() => onSelectVariation(variantIndex, subVariantIndex, null, subVariant)}>
                                                                                        {subVariant.name && <div className="variation-name">{subVariant.name}</div>}
                                                                                        <div className="variation-price">{configData.currencySymbol} {subVariant.salePrice || subVariant.price}</div>
                                                                                    </div>}
                                                                            </>
                                                                        }
                                                                    </React.Fragment>
                                                                }
                                                            })}
                                                        </React.Fragment>
                                                    }
                                                })}
                                            </div>
                                        </>
                                        :
                                        <>
                                        </>
                                    }
                                    {configData.storeConfig?.appointmentConfig?.active ? <div className="btn-wrap">
                                        {isAlreadyAddedVariation ? <div className="btn added" onClick={removeFromAppointment}>Remove From Appointment</div>
                                            : <div className="btn" onClick={addToAppointment}>Select</div>}
                                    </div> :
                                        <div className="note">Call <a href={`tel:+${storeMetaData.countryCode} ${storeMetaData.phone1}`}> +{storeMetaData.countryCode} {storeMetaData.phone1}</a> for book appointment</div>
                                    }
                                </div>
                            </div>
                        </div>
                    </Backdrop>
                </>
            )
        } else if (originalItem.type == keywords[PRODUCT] || type == keywords[PRODUCT]) {
            return <HorizontalProductCard item={originalItem} handleClick={() => { }} config={config} />
        } else return null;
    } else return null;
}

export default Item
