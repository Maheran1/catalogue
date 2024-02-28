import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { windowRef } from "@util/window";
import { showError, showSuccess, updatePdpItem, updatePdpItemStatus } from "@context/actions";
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Slide from '@material-ui/core/Slide';
import { useRouter } from 'next/router';
import { replaceAppointmentServices } from "@context/actions/appointment";
import { SERVICE } from "@constant/types";
import SvgIcon from "@element/svgIcon";
import Backdrop from "@material-ui/core/Backdrop";
import { navigateTo } from '@util/routerService';
import { SERVICES_INDEX } from "@constant/common";
import { isActiveAtBinaryIndex } from "@util/utils";

function AiOutlineVideoCamera(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 1024 1024" height="1em" width="1em" {...props}>
        <path d="M912 302.3L784 376V224c0-35.3-28.7-64-64-64H128c-35.3 0-64 28.7-64 64v576c0 35.3 28.7 64 64 64h592c35.3 0 64-28.7 64-64V648l128 73.7c21.3 12.3 48-3.1 48-27.6V330c0-24.6-26.7-40-48-27.7zM712 792H136V232h576v560zm176-167l-104-59.8V458.9L888 399v226zM208 360h112c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H208c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z" /></svg>;
}

function FacebookIcon() {
    return <svg className="facebook" stroke="#4267b2" fill="#4267b2" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z"></path></svg>
}

function WhatsappIcon() {
    return <svg className="whatsapp" stroke="#25d366" fill="#25d366" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M260.062 32C138.605 32 40.134 129.701 40.134 250.232c0 41.23 11.532 79.79 31.559 112.687L32 480l121.764-38.682c31.508 17.285 67.745 27.146 106.298 27.146C381.535 468.464 480 370.749 480 250.232 480 129.701 381.535 32 260.062 32zm109.362 301.11c-5.174 12.827-28.574 24.533-38.899 25.072-10.314.547-10.608 7.994-66.84-16.434-56.225-24.434-90.052-83.844-92.719-87.67-2.669-3.812-21.78-31.047-20.749-58.455 1.038-27.413 16.047-40.346 21.404-45.725 5.351-5.387 11.486-6.352 15.232-6.413 4.428-.072 7.296-.132 10.573-.011 3.274.124 8.192-.685 12.45 10.639 4.256 11.323 14.443 39.153 15.746 41.989 1.302 2.839 2.108 6.126.102 9.771-2.012 3.653-3.042 5.935-5.961 9.083-2.935 3.148-6.174 7.042-8.792 9.449-2.92 2.665-5.97 5.572-2.9 11.269 3.068 5.693 13.653 24.356 29.779 39.736 20.725 19.771 38.598 26.329 44.098 29.317 5.515 3.004 8.806 2.67 12.226-.929 3.404-3.599 14.639-15.746 18.596-21.169 3.955-5.438 7.661-4.373 12.742-2.329 5.078 2.052 32.157 16.556 37.673 19.551 5.51 2.989 9.193 4.529 10.51 6.9 1.317 2.38.901 13.531-4.271 26.359z"></path></svg>
}

function CopyClipboardIcon(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>;
}

const shareIconList = [
    {
        name: 'Whatsapp',
        icon: <WhatsappIcon />
    },
    {
        name: 'Facebook',
        icon: <FacebookIcon />
    },
    {
        name: 'Copy Link',
        icon: <CopyClipboardIcon />
    },
    // {
    //     name: 'Telegram',
    //     icon: "/assets/Icons/social/telegram.png"
    // },
    // {
    //     name: 'Twitter',
    //     icon: "/assets/Icons/social/twitter.png"
    // },
    // {
    //     name: 'Instagram',
    //     icon: "/assets/Icons/social/instagram.png"
    // }, 
    // {
    //     name: 'Linkedin',
    //     icon: "/assets/Icons/social/linkedin.png"
    // },
]
function ServicePdpModal() {
    const router = useRouter();
    const dispatch = useDispatch();
    const cartItems = useSelector((state: any) => state.orderItems);
    const appointmentItems = useSelector((state: any) => state.appointmentServices);
    const item = useSelector((state: any) => state.pdpItem);
    const pdpItemStatus = useSelector((state: any) => state.pdpItemStatus);
    const [showLongDescription, setShowLongDescription] = useState(false);
    const shortDescription = item?.description ? item?.description?.substring(0, 110) : '';
    const alreadyShortDescription = item?.description <= item?.description?.substring(0, 110);
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const [isAlreadyAdded, setIsAlreadyAdded] = useState(false);
    const { configData, keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);
    const [availableWidth, setAvailableWidth] = useState(400);
    const [selectedVariationService, setSelectedVariationService] = useState<any>('');
    const [selectedVariation, setSelectedVariation] = useState<any>('');
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);
    const [descList, setDescList] = useState(item?.description ? item?.description?.split('||') : []);
    const [openShareModal, setOpenShareModal] = useState(false);
    const currentPage = useSelector((state: any) => state.currentPage);

    // if (item && !item?.categoryName) {
    //     let catName: any = ('pagepath' in router.query) ? router?.query?.pagepath[0].split("-") : '';
    //     catName.pop();
    //     catName = catName.join(" ");
    //     item.categoryName = catName;
    // }

    useEffect(() => {
        if (windowRef) {
            document.body.classList.add("o-h")
        }
        return () => {
            dispatch(updatePdpItem(null));
            document.body.classList.remove("o-h")
        }

    }, [windowRef]);

    useEffect(() => {
        if (item?.description?.includes('||')) {
            setDescList(item?.description?.split('||'))
        }
    }, [item])

    useEffect(() => {
        if (windowRef) {//set width for pdp modal depend on screen size
            setAvailableWidth(window?.screen?.availWidth > 480 ? 480 : window?.screen?.availWidth);
        }
    }, [item, windowRef]);


    useEffect(() => {
        if (appointmentItems.length && !selectedVariation) {//here selectedVariation check is for the first time page load
            const itemIndex: number = appointmentItems.findIndex((appointentItem) => (appointentItem.id == item?.id));
            if (itemIndex != -1) {
                let serviceCopy = { ...appointmentItems[itemIndex] }
                if (serviceCopy.variations?.length != 0) {
                    setSelectedVariation(getSelectedVariationObj(serviceCopy));
                    setSelectedVariationService({ ...serviceCopy });
                } else {
                    setIsAlreadyAdded(true);
                }
            }
        }
    }, [appointmentItems]);

    useEffect(() => {
        // check selected service variations already added to cart for respective variation
        if (selectedVariation && appointmentItems.length) {
            let isAlreadyAdded = false;
            appointmentItems.map((appointentItem) => {
                if (appointentItem.id == item?.id) {//get list of cart items having same service data as current pdp item
                    if (appointentItem.variations?.length != 0) {
                        const cartVariations = getSelectedVariationObj(appointentItem);
                        if (JSON.stringify(cartVariations) === JSON.stringify(selectedVariation)) {//check for item of same service and selected variations
                            isAlreadyAdded = true;
                        }
                    } else {
                        isAlreadyAdded = true;
                    }
                }
            })
            setIsAlreadyAdded(isAlreadyAdded);
        }
    }, [selectedVariation, appointmentItems]);


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

    const closePdpMOdal = (from = '') => {
        if (from != 'Click-Away') {
            document.body.classList.remove("o-h")
            // document.body.style.overflow = 'unset';
            // router.push(baseRouteUrl + 'home');
            dispatch(updatePdpItem(null));
            if (pdpItemStatus) {
                navigateTo('home');
                dispatch(updatePdpItemStatus(null));
            }
        }
    }
    const addToAppointment = () => {
        if (item?.variations?.length !== 0 && !selectedVariationService) {
            dispatch(showError('Select service variation', 3000));
            return;
        }
        const appointmentItemsCopy = appointmentItems ? [...appointmentItems] : [];
        const serviceCopy = { ...item };
        if (item?.variations?.length !== 0) {
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
        if (router?.query?.pagepath?.includes('appointment')) {//incase of appointment after adding item to appointment close modal
            closePdpMOdal();
        } else {
            navigateTo('appointment')
            dispatch(updatePdpItemStatus(null));
            document.body.classList.remove("o-h")
            dispatch(updatePdpItem(null));
        }
    }
    const removeFromAppointment = () => {
        const appointmentItemsCopy = appointmentItems ? [...appointmentItems] : [];
        let cartItemIndex = null;
        appointmentItems.map((appointentItem, i) => {
            if ((appointentItem.id == item?.id)) {//get list of cart items having same service data as current pdp item
                if (appointentItem.variations?.length != 0) {
                    const cartVariations = getSelectedVariationObj(appointentItem);
                    if (JSON.stringify(cartVariations) === JSON.stringify(selectedVariation)) {//check for item of same service and selected variations
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
        if (router?.query?.pagepath?.includes('appointment')) {//incase of appointment after adding item to appointment close modal
            closePdpMOdal();
        }
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
            const serviceCopy = { ...item };
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
    // const onSharePage = async () => {
    //     if (window.navigator.share) {
    //         try {
    //             const catUrl = item.categoryName.toLowerCase().split(" ").join("-") + '-prp/';
    //             const itemUrl = catUrl + item.name.toLowerCase().split(" ").join("-") + '-pdp';

    //             await window.navigator.share({ title: `${item.name}`, url: `${storeMetaData.sUrl}/${itemUrl}` });
    //             console.log("Data was shared successfully");
    //         } catch (err) {
    //             // setOpenShareModal(true)
    //             console.error("Share failed:", err.message);
    //         }
    //     } else setOpenShareModal(true)
    // }

    const onClickSocialIcon = (linkData) => {
        const itemUrl = window.location.href + '/' + item.name.toLowerCase().split(" ").join("-") + '-pdp';
        switch (linkData.name) {
            case 'Facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${itemUrl}`, '_blank');
                break;
            case 'Twitter':
                window.open(`https://twitter.com/intent/tweet?text=${item.pTitle || item.name}&url=${itemUrl}`, '_blank');
                break;
            case 'Whatsapp':
                window.open(`https://api.whatsapp.com/send?text=${item.pTitle || item.name} ${itemUrl}`, '_blank');
                break;
            case 'Instagram':
                window.open(`https://www.instagram.com/?url=${itemUrl}`, '_blank');
                break;
            case 'Linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${itemUrl}`, '_blank');
                break;
            case 'Telegram':
                window.open(`https://telegram.me/share/msg?url=${item.pTitle || item.name}&url=${itemUrl}`, '_blank');
                break;
            case 'Copy Link':
                window?.navigator?.clipboard?.writeText(decodeURIComponent(itemUrl));
                dispatch(showSuccess('Copied successfully'));
                setOpenShareModal(false);
                break;
            default:
                break;
        }
    }


    return (
        <>
            {(item && item.type == keywords[SERVICE]) ?
                <div className="service-pdp-modal-wrap" style={{ width: `${availableWidth}px` }}>
                    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                        <div className="pdp-cover">
                            <ClickAwayListener onClickAway={() => closePdpMOdal(currentPage == 'appointment' ? 'Click-Away' : '')}>
                                <div>
                                    <div className="modal-close" onClick={() => closePdpMOdal()}>
                                        <SvgIcon icon="close" />
                                    </div >
                                    {/* {windowRef() && window?.location?.protocol == 'https:' && <div className="modal-close modal-share" onClick={() => onSharePage()}>
                                        <SvgIcon icon="share" />
                                    </div>} */}
                                    {/* {item?.iTag && <div className="ribbon "><span>{item?.iTag}</span></div>} */}

                                    <Paper elevation={4} className="outer"
                                    // style={{ height: `${(appointmentItems && appointmentItems.length != 0) ? 'calc(100vh - 135px)' : 'calc(100vh - 100px)'}` }}
                                    >
                                        {/* <div className="prodpdpbanner">
                                            <ImageSlider itemsList={item?.imagePaths} config={{ redirection: false }} no_image={PDP_NO_IMAGE} />
                                        </div> */}
                                        <div className="service-pdp-details clearfix">
                                            <div className="serv-pdp-details-wrap clearfix">

                                                {item?.variations && item?.variations?.length !== 0 && <div className="serv-pdp-servtype">
                                                    <div className="serv-pdp-servtypename">{item?.name}</div>
                                                </div>}

                                                {item?.variations && item?.variations?.length !== 0 ?
                                                    <>
                                                        <div className="variations-wrap clearfix">
                                                            {item?.variations?.map((variant: any, variantIndex: any) => {    //weekdays/weekends
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
                                                        <div className="serv-pdp-servtype clearfix">
                                                            <div className="serv-pdp-servtypename">{item?.name}</div>
                                                            <div className="serv-pdp-servofferforpr">{configData.currencySymbol}
                                                                {item?.salePrice || item?.price}
                                                            </div>
                                                        </div>
                                                        {item?.iTag && <div className="itag"><span>( {item?.iTag} )</span></div>}
                                                    </>}
                                                <div className="serv-pdp-servtype clearfix">
                                                    {/* <div className="serv-pdp-servname">{item?.categoryName}</div> */}
                                                    {item?.duration !== 0 && <div className="serv-pdp-servtypetime d-f-s">
                                                        <SvgIcon icon="timer" />
                                                        {item?.duration} {item?.durationType}
                                                    </div>}
                                                </div>
                                                {item?.description && item?.description?.includes('||') ? <>
                                                    <div>Description</div>
                                                    {descList.map((desc: any, i: number) => {
                                                        return <div className="serv-pdp-servtypedesc serv-pdp-servtypedesc-list" key={Math.random()}><span>&#8226;</span>{desc} </div>
                                                    })}
                                                </> : <>
                                                    {item?.description && <>
                                                        {alreadyShortDescription && <>
                                                            <div className="serv-pdp-servtypedesc">{item?.description}</div>
                                                        </>}
                                                        {!alreadyShortDescription && <>
                                                            {showLongDescription && <div className="serv-pdp-servtypedesc" onClick={() => setShowLongDescription(false)}>
                                                                {item?.description}
                                                                <span>Read Less</span>
                                                            </div>}
                                                            {!showLongDescription && <div className="serv-pdp-servtypedesc" onClick={() => setShowLongDescription(true)}>
                                                                {shortDescription}...
                                                                <span >Read More</span>
                                                            </div>}
                                                        </>}
                                                    </>}
                                                </>}

                                                {configData.storeConfig?.appointmentConfig?.active ? <div className="btn-wrap">
                                                    {isAlreadyAdded ? <div className="btn added" onClick={removeFromAppointment}>Remove From Appointment</div>
                                                        : <div className="btn" onClick={addToAppointment}>Book Appointment</div>}
                                                </div> :
                                                    <div className="note">Call <a href={`tel:+${storeMetaData.countryCode} ${storeMetaData.phone1}`}> +{storeMetaData.countryCode} {storeMetaData.phone1}</a> for book appointment</div>
                                                }
                                            </div>
                                        </div>
                                    </Paper>
                                    <Backdrop
                                        className="backdrop-modal-wrapper"
                                        open={openShareModal ? true : false}
                                        onClick={() => setOpenShareModal(false)}
                                    >
                                        <div className="backdrop-modal-content social-sharing-modal"
                                            style={{ height: `${openShareModal ? `315px` : '0'}` }}
                                        >
                                            <div className="heading" >Share </div>
                                            <div className="modal-close" onClick={() => setOpenShareModal(false)}>
                                                <SvgIcon icon="closeLarge" />
                                            </div>
                                            <div className='pricing-details-wrap'>
                                                <div className="preview-wrap" onClick={() => onClickSocialIcon({ name: 'Copy Link' })}>
                                                    {!!(item?.pImage || (item?.imagePaths && item?.imagePaths?.length != 0 ? item?.imagePaths[0].imagePath : '')) && <div className="img-wrap">
                                                        <img src={item?.pImage || (item?.imagePaths && item?.imagePaths?.length != 0 ? item?.imagePaths[0].imagePath : '')} alt={item.name} />
                                                    </div>}
                                                    <div className="title-wrap">
                                                        <div className="title">{item?.pTitle || item?.name}</div>
                                                        <div className="desc">{item?.pDescription || item?.description}</div>
                                                    </div>
                                                </div>
                                                <div className="icons-list">
                                                    {shareIconList.map((shareData: any, index: number) => {
                                                        return <div className="icon-wrap" key={index} onClick={() => onClickSocialIcon(shareData)}>
                                                            <div className="icon">{shareData.icon}</div>
                                                            <div className="name">{shareData.name}</div>
                                                        </div>
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </Backdrop>
                                </div>
                            </ClickAwayListener>
                        </div>
                    </Slide>
                </div > : null
            }
        </>
    );
}

export default ServicePdpModal;
