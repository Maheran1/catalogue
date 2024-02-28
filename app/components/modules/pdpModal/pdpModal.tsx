import React, { useState, useEffect, useRef } from "react";
// for Accordion starts
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
// for Accordion ends
import { PDP_NO_IMAGE } from "@constant/noImage";
import ImageSlider from "@element/imageSlider";
import { useSelector, useDispatch } from 'react-redux';
import { replaceOrderIitems } from "app/redux/actions/order";
import { windowRef } from "@util/window";
import { disableLoader, enableLoader, showError, showSuccess, updatePdpItem, updatePdpItemStatus, updateStore, updateWhatsappTemplates } from "@context/actions";
import { useRouter } from 'next/router';
import Backdrop from '@material-ui/core/Backdrop';
import { PRODUCT } from "@constant/types";
import { getAllTemplates, markUserOptIn, sendWhatsappMsgMessage } from "@storeData/whatsapp";
import { useCookies } from "react-cookie";
import { markUserOptInForWhatsapp } from "@storeData/user";
import { markStoreOptInForWhatsapp } from "@storeData/store";
import UserRegistrationModal from "@module/userRegistration";
import { QUOTE_REQUEST_TO_OWNER, QUOTE_REQUEST_TO_USER } from "@constant/whatsappTemplates";
import { APISERVICE } from "@util/apiService/RestClient";
import SvgIcon from "@element/svgIcon";
import { navigateTo, navigateToBack } from '@util/routerService';
import CustomeImageSlider from "@element/customeImageSlider";
import { PRODUCTS_INDEX } from "@constant/common";
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

function PdpModal() {
    const router = useRouter();
    const [quantity, setQuantity] = useState(0);
    const [total, setTotal] = useState(0);
    const store = useSelector((state: any) => state);
    const dispatch = useDispatch();
    const whatsappTemplates = store.whatsappTemplates;
    const cartItems = useSelector((state: any) => state.orderItems);
    const item = store.pdpItem;
    const pdpItemStatus = useSelector((state: any) => state.pdpItemStatus);
    const itemStock = useSelector((state: any) => state.itemStock);
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const [activeVariation, setActiveVariation] = useState((item?.variations && item?.variations?.length !== 0) ? item?.variations[0] : null);
    const { configData, keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);
    const gupshupConfig = configData?.storeConfig?.gupshupConfig;
    const [availableWidth, setAvailableWidth] = useState(400);
    const [showLongDescription, setShowLongDescription] = useState(false);
    const alreadyShortDescription = item?.description <= item?.description?.substring(0, 90);
    const shortDescription = item?.description ? item?.description?.substring(0, 90) : '';
    const [showVdoModal, setShowVdoModal] = useState(false)
    const [descList, setDescList] = useState(item?.description ? item?.description?.split('||') : []);
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);
    const [cookie, setCookie] = useCookies();
    const [userData, setUserData] = useState(cookie['user']);
    const [quoteReqSubmitted, setquoteReqSubmitted] = useState(false);
    const [showUserRegistrationModal, setShowUserRegistrationModal] = useState(false)
    const [cartItemQuantity, setCartItemQuantity] = useState(0);
    const [openShareModal, setOpenShareModal] = useState(false);
    const modalRef = useRef(null);
    const [currentStock, setCurrentStock] = useState<any>(0)

    router?.events?.on('routeChangeStart', (newRoute) => {
        if (!newRoute.includes('-pdp')) {//if on browser back click remove pdp element// here check is added because we cant get previous url 
            closePdpModal()
        }
    });

    useEffect(() => {
        if (cartItems && cartItems.length && windowRef) {
            let qty = 0;
            cartItems.map((cartItem) => qty += cartItem.quantity)
            if (cartItemQuantity != qty) {
                setCartItemQuantity(qty);
                let element = document.getElementById('cart-item-count-pdp')
                if (element) {
                    element.classList.add("shake")
                    setTimeout(() => {
                        element.classList.remove("shake")
                    }, 1000);
                }
            }
        } else setCartItemQuantity(0);
    }, [cartItems])

    useEffect(() => {
        if (cookie['user']) {
            setUserData(cookie['user'])
        }
    }, [cookie])

    useEffect(() => {
        if (windowRef && item) {
            if (item && cookie[item.id] == item.id) setquoteReqSubmitted(true)
            else setquoteReqSubmitted(false)
            if (!configData?.storeConfig?.sparkConfig?.showThumbnailsOnPDP) {
                document.getElementById("prod-img").style.width = "100%";
                windowRef.availWidth = window?.screen?.availWidth
            }
            setTimeout(() => {
                const defaultWrapperElement: any = document.getElementsByClassName('default-wrapper');
                const mainheaderblock: any = document.getElementsByClassName('mainheaderblock');
                if (item) {
                    document.body.classList.add("o-h")
                    if (item.type == keywords.product) {
                        mainheaderblock[0]?.classList?.add("hide")
                        defaultWrapperElement[0]?.classList?.add("hide")
                    }
                } else {
                    closePdpModal()
                }
            }, 0);
            setAvailableWidth(window?.screen?.availWidth > 480 ? 480 : window?.screen?.availWidth);
            setActiveVariation((item?.variations && item?.variations?.length !== 0) ? item?.variations[0] : null)
            if (item?.description?.includes('||')) {
                setDescList(item?.description?.split('||'))
            }
            if (item.type == 'product') {
                let itemUrl = item?.itemUrl;
                if (!itemUrl) {
                    itemUrl = item.name.toLowerCase().split(" ").join("-") + '-pdp';
                    const pagepath = ('pagepath' in router.query) ? router.query.pagepath[0] : 'home'
                    itemUrl = pagepath + "/" + itemUrl;
                }
                router.push(baseRouteUrl + itemUrl, '', { shallow: true })
            }
        }
    }, [item, windowRef]);

    useEffect(() => {
        if (item && configData?.storeConfig?.basicConfig?.inventory && !router.asPath.includes('cart')) {
            let stock = 0;
            if (activeVariation) {
                stock = itemStock[`${item.id}${activeVariation.id}`] || 0;
            } else {
                stock = itemStock[item.id] || 0;
            }
            setCurrentStock(stock)
        }
    }, [item, activeVariation, itemStock])


    useEffect(() => {
        let totalcopy = 0;
        let quantityCopy = 0;
        if (cartItems && cartItems.length && item) {
            const itemIndex: number = cartItems.findIndex((cartItem) => (cartItem.name == item?.name && cartItem.categoryName == item?.categoryName) && ((cartItem.variations) ? (cartItem.variations[0].name == activeVariation?.name) : true));
            if (itemIndex != -1) {
                totalcopy = cartItems[itemIndex].quantity * (cartItems[itemIndex].salePrice || cartItems[itemIndex].price);
                quantityCopy = cartItems[itemIndex].quantity;
            }
        }
        setTotal(totalcopy);
        setQuantity(quantityCopy);
    }, [cartItems, activeVariation, item])


    const closePdpModal = () => {
        const defaultWrapperElement: any = document.getElementsByClassName('default-wrapper');
        const mainheaderblock: any = document.getElementsByClassName('mainheaderblock');
        document.body.classList.remove("o-h")
        mainheaderblock[0]?.classList?.remove("hide")
        defaultWrapperElement[0]?.classList?.remove("hide")
        dispatch(updatePdpItem(null));
        dispatch(updatePdpItemStatus(null));
    }

    const onSharePage = async () => {
        if (window.navigator.share) {
            try {
                const catUrl = item.categoryName.toLowerCase().split(" ").join("-") + '-prp/';
                const itemUrl = catUrl + item.name.toLowerCase().split(" ").join("-") + '-pdp';

                await window.navigator.share({ title: `${item.name}`, url: `${storeMetaData.sUrl}/${itemUrl}` });
                console.log("Data was shared successfully");
            } catch (err) {
                // setOpenShareModal(true)
                console.error("Share failed:", err.message);
            }
        } else setOpenShareModal(true)
    }


    const calculateTaxes = (taxebalePrice: any, quantity: number) => {
        let txchrgs: any[] = [];
        if (configData.txchConfig && configData.txchConfig.length != 0 && item) {
            configData.txchConfig.map((taxData: any) => {
                if (taxData.active) {
                    if (isActiveAtBinaryIndex(taxData.applyOn, PRODUCTS_INDEX) && !taxData.charge) {
                        let taxApplied = parseFloat((((parseFloat(taxebalePrice) / 100) * parseFloat(taxData.value)) * quantity).toFixed(2));
                        if (taxData.isInclusive) {
                            // x = (price * 100) / (tax + 100)
                            let itemActualPrice = ((taxebalePrice * 100) / (100 + taxData.value));
                            let actualTax = ((itemActualPrice * taxData.value) / 100) * quantity;
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

    const addQuantity = () => {
        const cartItemsCopy = cartItems ? [...cartItems] : [];
        const itemIndex: number = cartItemsCopy.findIndex((cartItem) => (cartItem.name == item?.name && cartItem.categoryName == item?.categoryName) && ((cartItem.variations) ? (cartItem.variations[0].name == activeVariation?.name) : true));
        if (cartItemsCopy[itemIndex].quantity == currentStock) {
            const element: any = document.getElementById('current-stock-wrap');
            if (element) {
                element.classList.add("shake")
                setTimeout(() => {
                    element.classList.remove("shake")
                }, 500);
            }
        } else {
            cartItemsCopy[itemIndex].quantity = cartItemsCopy[itemIndex].quantity + 1;
            cartItemsCopy[itemIndex].txchrgs = calculateTaxes((cartItemsCopy[itemIndex].salePrice || cartItemsCopy[itemIndex].price), cartItemsCopy[itemIndex].quantity)
            dispatch(replaceOrderIitems(cartItemsCopy));
            dispatch(showSuccess('Product Added', 2000));
        }
    }

    const removeQuantity = () => {
        const cartItemsCopy = cartItems ? [...cartItems] : [];
        if (quantity == 1) {
            const itemIndex: number = cartItemsCopy.findIndex((cartItem) => (cartItem.name == item?.name && cartItem.categoryName == item?.categoryName) && ((cartItem.variations) ? (cartItem.variations[0].name == activeVariation?.name) : true));
            cartItemsCopy.splice(itemIndex, 1);
            dispatch(replaceOrderIitems(cartItemsCopy));
        } else {
            const itemIndex: number = cartItemsCopy.findIndex((cartItem) => (cartItem.name == item?.name && cartItem.categoryName == item?.categoryName) && ((cartItem.variations) ? (cartItem.variations[0].name == activeVariation?.name) : true));
            cartItemsCopy[itemIndex].quantity = cartItemsCopy[itemIndex].quantity - 1;
            cartItemsCopy[itemIndex].txchrgs = calculateTaxes((cartItemsCopy[itemIndex].salePrice || cartItemsCopy[itemIndex].price), cartItemsCopy[itemIndex].quantity)
            dispatch(replaceOrderIitems(cartItemsCopy));
        }
        dispatch(showSuccess('Product Removed', 2000));
    }

    const addItemToCart = () => {
        const cartItemsCopy = cartItems ? [...cartItems] : [];
        if (activeVariation) {
            const cartItem = {
                "name": item?.name,
                "id": item?.id,
                "category": item?.categoryName,
                "categoryId": item.categoryId,
                "price": activeVariation?.price,
                "salePrice": activeVariation?.salePrice,
                "quantity": 1,
                "remark": null,
                "imagePaths": item?.imagePaths,
                "txchrgs": [],
                "variations": [{
                    "id": activeVariation?.id,
                    "name": activeVariation?.name,
                    "price": activeVariation?.price,
                    "salePrice": activeVariation?.salePrice
                }]
            }
            cartItem.txchrgs = calculateTaxes((cartItem.salePrice || cartItem.price), cartItem.quantity)
            cartItemsCopy.push(cartItem);
            dispatch(replaceOrderIitems(cartItemsCopy));
            dispatch(showSuccess('Product Added', 2000));
        } else {
            const cartItem = {
                "name": item?.name,
                "id": item?.id,
                "categoryName": item?.categoryName,
                "price": item?.price,
                "salePrice": item?.salePrice,
                "quantity": 1,
                "remark": null,
                "imagePaths": item?.imagePaths,
                "variations": null,
                "txchrgs": []
            }
            cartItem.txchrgs = calculateTaxes((cartItem.salePrice || cartItem.price), cartItem.quantity)
            cartItemsCopy.push(cartItem);
            dispatch(replaceOrderIitems(cartItemsCopy));
            dispatch(showSuccess('Product Added', 2000));
        }
    }

    const zoom = (status) => {
        const zoomPer = 20;
        var element = document.getElementById("prod-img");
        const percent: any = (element.clientWidth / document.body.clientWidth * 100);
        const width: any = percent.toFixed() / 10;
        const currentPerWidth: any = Number(parseInt(width, 10) * 10);
        if (status == 'in' && (currentPerWidth <= 160)) document.getElementById("prod-img").style.width = (currentPerWidth + zoomPer) + "%";
        else if (status == 'out') {
            if (currentPerWidth >= 100) {
                document.getElementById("prod-img").style.width = (currentPerWidth - zoomPer) + "%";
            }
            if (currentPerWidth - zoomPer < 100) document.getElementById("prod-img").style.width = "100%";
        }
    }
    function BiZoomIn() {
        return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em"><path d="M11 6L9 6 9 9 6 9 6 11 9 11 9 14 11 14 11 11 14 11 14 9 11 9z" /><path d="M10,2c-4.411,0-8,3.589-8,8s3.589,8,8,8c1.846,0,3.543-0.635,4.897-1.688l4.396,4.396l1.414-1.414l-4.396-4.396 C17.365,13.543,18,11.846,18,10C18,5.589,14.411,2,10,2z M10,16c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S13.309,16,10,16z" /></svg>;
    }

    function BiZoomOut() {
        return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em"><path d="M6 9H14V11H6z" /><path d="M10,18c1.846,0,3.543-0.635,4.897-1.688l4.396,4.396l1.414-1.414l-4.396-4.396C17.365,13.543,18,11.846,18,10 c0-4.411-3.589-8-8-8s-8,3.589-8,8S5.589,18,10,18z M10,4c3.309,0,6,2.691,6,6s-2.691,6-6,6s-6-2.691-6-6S6.691,4,10,4z" /></svg>;
    }

    const checkForOptIn = (type: any, typeDetails: any) => {
        return new Promise((res, rej) => {
            if (type.optInForWapp) res(true)
            else {
                markUserOptIn(gupshupConfig, type.number).then(() => {
                    //update in db
                    if (type.from == 'user') {
                        markUserOptInForWhatsapp(storeMetaData.tenantId, storeMetaData.id, [type.number]).then(() => {
                            const userDeta = { ...typeDetails, optInForWapp: true }
                            setCookie("user", userDeta, { //user registration fields
                                path: "/",
                                expires: new Date(new Date().setSeconds(new Date().getFullYear() + 1)),
                                sameSite: true,
                            })
                        })
                    } else {
                        markStoreOptInForWhatsapp(storeMetaData.tenantId).then(() => {
                            const storeCopy = { ...store }
                            storeCopy.storeMetaData.optInForWapp = true;
                            dispatch(updateStore({ ...storeCopy }));
                        })
                    }
                    res(true);
                })
            }
        })
    }

    const sendReqMessageToUser = (templates: any[], user: any) => {
        const template = templates.filter((t: any) => t.elementName == QUOTE_REQUEST_TO_USER);
        const catUrl = item.categoryName.toLowerCase().split(" ").join("-") + '-prp/';
        const itemUrl = catUrl + item.name.toLowerCase().split(" ").join("-") + '-pdp';
        let itemmsg = `${item.categoryName}- ${item.name}`;
        // if (activeVariation) {
        //     itemmsg = `${item.categoryName} - ${item.name}, price ${activeVariation.salePrice || activeVariation.price}, ${activeVariation.name} `
        // }
        const templObj: any = {
            id: template[0].id,
            params: [user.firstName, (storeMetaData.name + storeMetaData.businessType ? (" " + storeMetaData.businessType) : ""), `${itemmsg}`, storeMetaData.phone, `${storeMetaData.sUrl}/${itemUrl}`]
        }
        const body = {
            template: JSON.stringify(templObj),
            source: 91 + gupshupConfig.number,
            destination: 91 + user.mobileNo,
        }
        sendWhatsappMsgMessage(gupshupConfig, body).then(() => {
            // dispatch(showSuccess('Quote request send successfully', 2000));
        }).catch((err) => {
            // dispatch(showError('Quote request sending failed'))
            console.log(err)
        })
    }

    const sendReqMessageToOwner = (templates: any[], user: any) => {
        const template = templates.filter((t: any) => t.elementName == QUOTE_REQUEST_TO_OWNER);
        const catUrl = item.categoryName.toLowerCase().split(" ").join("-") + '-prp/';
        const itemUrl = catUrl + item.name.toLowerCase().split(" ").join("-") + '-pdp';
        let itemmsg = `${item.categoryName}- ${item.name}`;
        // if (activeVariation) {
        //     itemmsg = `${item.categoryName} - ${item.name}, price ${activeVariation.salePrice || activeVariation.price}, ${activeVariation.name} `
        // }
        const templObj: any = {
            id: template[0].id,
            params: [(storeMetaData.name + storeMetaData.businessType ? (" " + storeMetaData.businessType) : ""), user.firstName, user.mobileNo, `${itemmsg}`, `${storeMetaData.sUrl}/${itemUrl}`]
        }
        const body = {
            template: JSON.stringify(templObj),
            source: 91 + gupshupConfig.number,
            destination: 91 + storeMetaData.phone1
            // destination: 91 + user.mobileNo,
        }
        dispatch(enableLoader());
        checkForOptIn({ from: 'store', number: storeMetaData.phone, optInForWapp: storeMetaData.optInForWapp }, storeMetaData).then(() => {
            sendWhatsappMsgMessage(gupshupConfig, body).then(() => {
                dispatch(showSuccess('Quote request send successfully', 2000));
                setCookie(`${item.id}`, item.id, {
                    path: "/",
                    expires: new Date(new Date().setHours(new Date().getHours() + 30)),
                    sameSite: true,
                })
                setquoteReqSubmitted(true)
                checkForOptIn({ from: 'user', number: user.mobileNo, optInForWapp: user.optInForWapp }, user).then(() => {
                    sendReqMessageToUser(templates, user);
                })
                dispatch(disableLoader());
            }).catch((err) => {
                dispatch(showError('Quote request sending failed'))
                console.log(err)
                dispatch(disableLoader());
            })
        })
    }

    const checkForUser = () => {
        if (userData && userData.firstName) {
            sendQuoteRequest(userData);
        } else {
            setShowUserRegistrationModal(true);
        }
    }

    const sendQuoteRequest = (user: any) => {
        if (gupshupConfig.active) {
            if (whatsappTemplates && whatsappTemplates?.length != 0) {
                sendReqMessageToOwner(whatsappTemplates, user)
            } else {
                getAllTemplates(gupshupConfig)
                    .then((res: any) => {
                        if (res) {
                            console.log(res)
                            dispatch(updateWhatsappTemplates(res));
                            sendReqMessageToOwner(res, user)
                        }
                        else {
                            dispatch(showError('Quote request sending failed'))
                            dispatch(disableLoader());
                        }
                    })
                    .catch((err: any) => {
                        dispatch(showError('Quote request sending failed'))
                        dispatch(disableLoader());
                        console.log(err)
                    })
            }
        } else {
            dispatch(enableLoader());
            const catUrl = item.categoryName.toLowerCase().split(" ").join("-") + '-prp/';
            const itemUrl = catUrl + item.name.toLowerCase().split(" ").join("-") + '-pdp';
            const apiBody = {
                shopName: store?.store?.storeData?.tenant + storeMetaData.name,
                custName: user.firstName,
                custNumber: user.mobileNo,
                itemName: `${item.categoryName}- ${item.name}`,
                storeName: storeMetaData.name,
                storeNumber: storeMetaData.phone1,
                storeId: storeMetaData.id,
                tenantId: storeMetaData.tenantId,
                itemUrl: `${storeMetaData.sUrl}/${itemUrl}`,
                shopUrl: `${storeMetaData.sUrl}`
            }
            APISERVICE.POST(`${process.env.NEXT_PUBLIC_PCS_TXN}/quotation/customer/owner`, apiBody).then((res) => {
                dispatch(showSuccess('Quote request send successfully', 2000));
                setCookie(`${item.id}`, item.id, {
                    path: "/",
                    expires: new Date(new Date().setHours(new Date().getHours() + 30)),
                    sameSite: true,
                })
                setquoteReqSubmitted(true)
                dispatch(disableLoader());
            }).catch((err) => {
                dispatch(showError('Quote request send failed, please try after some time.', 2000));
                console.log(err)
                dispatch(disableLoader());
            })
        }
    }

    const onLoginClose = (user) => {
        if (user) {
            setUserData(user);
            sendQuoteRequest(user);
        }
        setShowUserRegistrationModal(false);
    }

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

    const onOutsideClick = (event: any) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            closePdpModal();
        }
    }

    return (
        <>
            <div className="pdp-modal-wrap "
                onClick={onOutsideClick}
                style={{
                    height: `${(item && item.type == keywords[PRODUCT]) ? 'calc(100vh - calc(100vh - 100%))' : 0}`,
                    overflow: `${(item && item.type == keywords[PRODUCT]) ? 'unset' : 'hidden'}`,
                    maxHeight: `${(item && item.type == keywords[PRODUCT]) ? 'calc(100vh - calc(100vh - 100%))' : 0}`,
                    backgroundColor: '#0000001f'
                }}>
                <div className="pdp-page-content" ref={modalRef} >
                    <div className="action-btn-wrap">
                        <div className="modal-close" onClick={() => { navigateToBack(baseRouteUrl); closePdpModal() }}>
                            <SvgIcon icon="close" />
                        </div>
                        <div className="secondary-action">
                            {(configData?.orderingOn && !configData?.storeOff && !configData?.readOnlyMenu && !!cartItemQuantity) && <div className="modal-close modal-cart" id="cart-item-count-pdp" onClick={() => navigateTo('cart')}>
                                <div className="cart-item-count">{cartItemQuantity}</div>
                                <SvgIcon icon="cart" />
                            </div>}
                            {/* {windowRef() && window?.location?.protocol == 'https:'
                                && <div className="modal-close modal-share" onClick={() => onSharePage()}>
                                    <SvgIcon icon="share" />
                                </div>} */}
                            {item?.videoLink && !(configData?.storeConfig?.sparkConfig?.showThumbnailsOnPDP) && <div className="modal-close vdo-icon" onClick={() => setShowVdoModal(true)}>
                                <SvgIcon icon="camera" />
                            </div>}
                        </div>

                    </div>
                    <div className="prodpdpbanner">
                        {/* <div className="modal-close zoom-out" onClick={() => zoom('out')}>{BiZoomOut()}</div>
                            <div className="modal-close zoom-in" onClick={() => zoom('in')}>{BiZoomIn()}</div> */}
                        {configData?.storeConfig?.sparkConfig?.showThumbnailsOnPDP ? <>
                            <CustomeImageSlider item={item} />
                        </> : <div className="slider-wrap">
                            <div className="zoom-div" id="prod-img" style={{ width: '100%' }}>
                                <ImageSlider itemsList={item?.imagePaths} config={{ redirection: false }} no_image={PDP_NO_IMAGE} />
                            </div>
                        </div>}

                    </div>
                    <div className="prod-pdp-details clearfix">
                        {/* <div className="prod-pdp-off">15% OFF</div> */}
                        <div className="prod-pdp-nameprice clearfix">
                            {/* <div className="prod-pdp-cat-name">{item?.categoryName}</div> */}
                            <div className="prod-pdp-name">{item?.name}</div>
                            <div className="prod-pdp-price">
                                {item?.variations?.length != 0 ? <>
                                    <>
                                        {activeVariation?.salePrice == 0 ?
                                            <div className="prod-sale-price">
                                                {configData.currencySymbol} {activeVariation?.price}
                                            </div> :
                                            <div className="prod-sale-price">
                                                <span>{configData.currencySymbol} {activeVariation?.price}</span>
                                                {configData.currencySymbol} {activeVariation?.salePrice}
                                            </div>
                                        }
                                    </>
                                </> :
                                    <>
                                        {item?.salePrice == 0 ?
                                            <div className="prod-sale-price">
                                                {configData.currencySymbol} {item?.price}
                                            </div> :
                                            <div className="prod-sale-price">
                                                <span>{configData.currencySymbol} {item?.price}</span>{configData.currencySymbol} {item?.salePrice}
                                            </div>
                                        }
                                    </>
                                }
                            </div>
                        </div>
                        {item?.description && item?.description?.includes('||') ? <>
                            {descList.map((desc: any, i: number) => {
                                return <div className="serv-pdp-servtypedesc serv-pdp-servtypedesc-list" key={Math.random()}><span>&#8226;</span>{desc} </div>
                            })
                            }
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
                                        <span>Read More</span>
                                    </div>}
                                </>}
                            </>}
                        </>}

                        {(item?.variations && item?.variations?.length !== 0) && <div className="prod-pdp-size">
                            {item?.variations?.map((variant, variantIndex) => {
                                return <div key={variantIndex}>
                                    <span className={activeVariation?.name === variant.name ? 'active' : ''} onClick={() => setActiveVariation(variant)}>{variant.name}</span>
                                </div>
                            })}
                        </div>}

                        {/* <div className="prod-pdp-sizetitle">Size</div> */}
                        {(item?.benefits || item?.howToUse || item?.ingredients) && <div className="fullwidth">
                            {item?.benefits && <Accordion>
                                <AccordionSummary
                                    expandIcon={<SvgIcon icon="expand" />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header">
                                    <div className="accor-title">Features & Benefits</div>
                                </AccordionSummary>
                                <AccordionDetails className="description">
                                    {item?.benefits}
                                </AccordionDetails>
                            </Accordion>}

                            {item?.ingredients && <Accordion>
                                <AccordionSummary
                                    expandIcon={<SvgIcon icon="expand" />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header">
                                    <div className="accor-title">Ingredients</div>
                                </AccordionSummary>
                                <AccordionDetails className="description">
                                    {item?.ingredients}
                                </AccordionDetails>
                            </Accordion>}

                            {item?.howToUse && <Accordion>
                                <AccordionSummary
                                    expandIcon={<SvgIcon icon="expand" />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header">
                                    <div className="accor-title">How To Use</div>
                                </AccordionSummary>
                                <AccordionDetails className="description">
                                    {item?.howToUse}
                                </AccordionDetails>
                            </Accordion>}
                            <div className="common-15height"></div>
                        </div>}
                    </div>
                    {(configData?.orderingOn && !configData?.storeOff && !configData?.readOnlyMenu) ? <div className="itemcounter">
                        {(configData?.storeConfig?.basicConfig?.inventory ? true : false) ? <>
                            {(configData?.storeConfig?.basicConfig?.inventory && currentStock != 0) && <div className="current-stock-wrap" id="current-stock-wrap">
                                {currentStock <= 10 ? <>Only {currentStock} left in stock order soon!</> : <>
                                    {currentStock <= 15 ? <>Only Few Left!</> : <></>}
                                </>}
                            </div>}
                            {quantity == 0 ?
                                <>
                                    {currentStock ?
                                        <><div className="addtocartbtn" onClick={addItemToCart}>Add to cart</div>
                                        </> : <div className="addtocartbtn stock-unavailable">Currently unavailable</div>}
                                </>
                                :
                                <div className="itemcounterinner">
                                    <div className="counterbuttons">
                                        <button className="countclick"
                                            onClick={removeQuantity}>-</button>
                                        <div className="countnum">
                                            {quantity}
                                        </div>
                                        <button className="countclick"
                                            onClick={addQuantity}>+</button>
                                    </div>
                                </div>}
                        </> : <>
                            {quantity == 0 ?
                                <div className="addtocartbtn" onClick={addItemToCart}>Add to cart</div>
                                :
                                <div className="itemcounterinner">
                                    <div className="counterbuttons">
                                        <button className="countclick"
                                            onClick={removeQuantity}>-</button>
                                        <div className="countnum">
                                            {quantity}
                                        </div>
                                        <button className="countclick"
                                            onClick={addQuantity}>+</button>
                                    </div>
                                </div>}
                        </>}
                        <>
                            {configData?.storeConfig?.sparkConfig?.quoteRequest && <div className={`request-quote-btn addtocartbtn ${quoteReqSubmitted ? 'disabled' : ''}`} onClick={checkForUser}>{quoteReqSubmitted ? 'Quote request send' : 'Get Quote'}</div>}
                        </>
                    </div> : <>
                        {configData?.storeConfig?.sparkConfig?.quoteRequest && <div className="itemcounter">
                            <div className={`addtocartbtn ${quoteReqSubmitted ? 'disabled' : ''}`} onClick={checkForUser}>{quoteReqSubmitted ? 'Quote request send' : 'Get Quote'}</div>
                        </div>}
                    </>}
                </div>
            </div>
            <Backdrop
                className="backdrop-modal-wrapper"
                open={showVdoModal ? true : false}
            >
                <div className="vdo-details-backdrop-wrap backdrop-modal-content"
                    style={{ height: `${showVdoModal ? '480px' : '0'}` }}
                >
                    <div className="modal-close" onClick={() => setShowVdoModal(false)}>
                        <SvgIcon icon="closeLarge" />
                    </div>
                    <div className='d-f-c vdo-details-frame'>
                        {showVdoModal && <iframe className="vdo-frame" src={item?.videoLink} width="640" height="480" allow="autoplay"></iframe>}
                        {/* {showVdoModal && <iframe className="vdo-frame" src={item?.videoLink} width="640" height="480" allow="autoplay"></iframe>} */}
                    </div>
                </div>
            </Backdrop>
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
                            <div >
                            </div>
                        </div>
                    </div>
                </div>
            </Backdrop>
            {showUserRegistrationModal && <UserRegistrationModal
                fromPage={'PDP'}
                handleResponse={(e) => onLoginClose(e)}
                isApppGrpChangeOnUserGdrChange={showUserRegistrationModal ? true : false}
                open={true}
                heading={'Login to send quote request'} />}
        </>

    );
}

export default PdpModal;