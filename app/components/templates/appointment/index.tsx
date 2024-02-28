import { APPOINTMENT_CREATED, APPOINTMENT_TYPE } from '@constant/appointment';
import { SERVICE } from '@constant/types';
import { disableLoader, enableLoader } from '@context/actions';
import { showError, showSuccess } from '@context/actions/alert';
import { replaceAppointmentServices, syncLocalStorageAppointment } from '@context/actions/appointment';
import Item from '@element/horizontalItem';
import SvgIcon from '@element/svgIcon';
import Backdrop from '@material-ui/core/Backdrop';
import UserRegistrationModal from '@module/userRegistration';
import { getStaffByTenantId } from '@storeData/staff';
import { updateUser } from '@storeData/user';
import { APISERVICE } from '@util/apiService/RestClient';
import { navigateTo } from '@util/routerService';
import { createSlots, getDateObj, getUpcommingDates } from '@util/utils';
import { windowRef } from '@util/window';
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from "react-cookie";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from 'react-redux';

function Appointment() {

    const imageRef = useRef<HTMLInputElement>(null);

    const [cookie, setCookie] = useCookies();
    const [userData, setUserCookie] = useState(cookie['user']);
    const store = useSelector((state: any) => state);
    const dispatch = useDispatch();
    const [itemToSearch, setitemToSearch] = useState('');
    const [expertQuery, setExpertQuery] = useState('');
    const appointmentItems = useSelector((state: any) => state.appointmentServices);
    const storeData = useSelector((state: any) => state.store ? state.store.storeData : null);
    const [storeSlot, setStoreSlot] = useState(createSlots(storeData.configData?.startTime, storeData.configData?.closureTime));
    const [expertData, setexpertData] = useState(null);
    const [allExpertsList, setAllExpertsList] = useState<any>([])
    const [selectedExpert, setSelectedExpert] = useState<any>();
    const availableDates = getUpcommingDates(15, storeData.configData);
    const [selectedMember, setSelectedMember] = useState<any>();
    const [selectedDate, setSelectedDate] = useState<any>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<any>('');
    const [showAppointmentConfirmation, setShowAppointmentConfirmation] = useState(false);
    const [appointmentInstruction, setAppointmentInstruction] = useState('');
    const [appointmentOrder, setAppointmentOrder] = useState<any>();
    const [showAppointmentSuccess, setShowAppointmentSuccess] = useState(false);
    const [showUserRegistration, setShowUserRegistration] = useState(false);
    const [activeInput, setActiveInput] = useState('');
    const [appointmentObj, setAppointmentObj] = useState<any>('');
    const [showTotalBreakdownPopup, setShowTotalBreakdownPopup] = useState(false);
    const { configData, keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);
    const { gupshupConfig } = configData?.storeConfig;
    const [familyMember, setFamilyMember] = useState<any>({ name: '', mobileNo: '' });
    const [showAddMemberModal, setShowAddMemberModal] = useState(false)
    const [error, seterror] = useState('');
    const itemSearchRef = useRef<HTMLInputElement>(null);
    const [selectedStoreLocation, setSelectedStoreLocation] = useState('');
    const [categoriesList, setCategoriesList] = useState<any[]>([]);
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);
    const whatsappTemplates = store.whatsappTemplates;
    const [instImages, setInstImages] = useState<string[]>([]);
    const [instrImgReset, setInstrImgReset] = useState<boolean>(false);
    const [instrImgError, setInstrImgError] = useState<boolean>(false);
    const [showInstrImageDelConfirmModal, setShowInstrImageDelConfirmModal] = useState<[boolean, number]>([false, 0]);

    useEffect(() => {
        if (windowRef) {
            dispatch(syncLocalStorageAppointment());
            window.scrollTo(0, 0);
        }
        getStaffByTenantId(storeData.tenantId)
            .then((expert: any) => {
                if (expert) {
                    setAllExpertsList(expert.filter((e: any) => e.active))
                    setexpertData(expert.filter((e: any) => e.active));
                }
            })
            .catch((e) => {
                dispatch(showError(e.error));
            })
    }, [windowRef])

    useEffect(() => {
        setUserCookie(cookie['user']);
    }, [cookie])

    useEffect(() => {
        if (windowRef && (showTotalBreakdownPopup || showAppointmentConfirmation)) {
            document.body.classList.add("o-h")
        } else {
            document.body.classList.remove("o-h")
        }
        return () => {
            document.body.classList.remove("o-h")
        }

    }, [windowRef, showTotalBreakdownPopup, showAppointmentConfirmation]);

    useEffect(() => {
        console.log(configData.storeConfig.storeLocations)
    }, [configData])


    useEffect(() => {
        if (allExpertsList.length != 0 && appointmentItems.length != 0) {
            let availableStaff = [];
            appointmentItems.map((service: any) => {
                if (service.experts) {
                    service.experts.map((expert: any) => {
                        let alreadyAdded = availableStaff.length != 0 ? availableStaff.filter((s) => s.id == expert.id) : [];
                        if (alreadyAdded.length == 0) {
                            let staffs = allExpertsList.filter((s) => s.id == expert.id);
                            staffs.length != 0 && availableStaff.push(staffs[0])
                        }
                    })
                }
            })
            let selectedExpertAvl = availableStaff.length != 0 ? availableStaff.filter((s) => s.id == selectedExpert?.id) : [];
            if (selectedExpertAvl.length == 0) setSelectedExpert(null)
            if (availableStaff.length != 0) setexpertData(availableStaff);
            else setexpertData(null);
        } else setexpertData(null);
    }, [allExpertsList, appointmentItems])

    useEffect(() => {
        if (appointmentItems.length != 0) {
            const appointmentCopy = { ...appointmentItems }
            let appliedTaxes: any[] = [];
            let subTotal = 0;
            let total = 0;
            appointmentItems.map((service: any, i: number) => {

                // her  variation price not considered because at the time of appointment booking it is set inside service object as price and salePrice
                let applicablePrice: any = parseFloat(service.salePrice) || parseFloat(service.price);
                subTotal += parseFloat(applicablePrice);
                total += parseFloat(applicablePrice);

                if (service.txchrgs) {
                    service.txchrgs.map((taxData: any) => {

                        let tDetails = configData?.txchConfig ? configData?.txchConfig?.filter((t: any) => t.name == taxData.name) : [];
                        taxData.isInclusive = tDetails[0].isInclusive;
                        //update global total
                        if (tDetails.length != 0) {
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
                            //overAll tax calculation
                            let isAVlinOverall = appliedTaxes.findIndex((at: any) => at.name == taxData.name);
                            if (isAVlinOverall != -1) {
                                appliedTaxes[isAVlinOverall].total = Number((appliedTaxes[isAVlinOverall].total + taxApplied).toFixed(2));
                            } else {
                                appliedTaxes.push({ name: tDetails[0].name, value: tDetails[0].value, total: taxApplied, isInclusive: tDetails[0].isInclusive })
                            }
                            //overAll tax calculation

                        }
                    })
                }
                if (i == appointmentItems.length - 1) {
                    appointmentCopy.total = total.toFixed();
                    appointmentCopy.subTotal = subTotal.toFixed();
                    appointmentCopy.txchrgs = appliedTaxes;
                    if (appointmentCopy.total != appointmentObj.total) {//check for total beacause of stopping rerendering on setting appointment
                        setAppointmentObj(appointmentCopy);
                    }
                    // console.log("appointmentCopy", appointmentCopy)
                }
            })
        } else {
            setAppointmentObj({ total: 0, subTotal: 0 });
        }
        setActiveInput('');
        setitemToSearch('');
    }, [appointmentItems]);

    useEffect(() => {
        if (storeSlot.length != 0) {
            if (getDateObj(new Date()).dateObj == getDateObj(selectedDate).dateObj) {// check for todays date create slot after current time
                let hrs = ((new Date().getHours().toString().length == 1) ? '0' + new Date().getHours() : new Date().getHours());
                let mins: any = ((new Date().getMinutes().toString().length == 1) ? '0' + new Date().getMinutes() : new Date().getMinutes());
                if (mins < 30) mins = '30';//for 00:27 set min to 30
                if (mins > 30) mins = '00';//for 00:37 set min to 00
                const startTime = hrs + ':' + mins;
                setStoreSlot(createSlots(startTime, configData?.closureTime))
            } else {
                setStoreSlot(createSlots(configData?.startTime, configData?.closureTime))
            }
        }
    }, [selectedDate]);

    const removeService = (index) => {
        const appointmentCopy = [...appointmentItems];
        appointmentCopy.splice(index, 1);
        dispatch(replaceAppointmentServices(appointmentCopy));
        dispatch(showSuccess('Service Removed', 2000));
    }

    const onSelectExpert = (expert) => {
        setSelectedExpert({ ...expert });
        setActiveInput('');
    }
    const onSelectMember = (member) => {
        setSelectedMember({ ...member });
        setActiveInput('');
    }

    const onSelectDate = (date) => {
        setActiveInput('');
        setSelectedDate(date);
    }
    const onSelectSlot = (slot) => {
        setActiveInput('');
        setSelectedSlot(slot);
    }

    const onLoginClose = (user) => {
        if (user) {
            onConfirmBookingClick(user);
        }
        setShowUserRegistration(false);
    }

    const onAppointmentConfirmation = () => {
        if (userData) submitAppointment(userData);
        else setShowUserRegistration(true);
    }

    const getServiceDuration = (duration, durationType) => {
        if (durationType?.includes('hrs')) {
            return (parseFloat(duration) * 60).toFixed(1);
        } else return parseFloat(duration);
    }

    const createIndividualExpertService = (serviceDetails: any) => {
        const { id, name, duration, durationType, categoryName, price, quantity, salePrice, categoryId, txchrgs, variations, consumables } = serviceDetails;
        const individualAppointmentObj = {
            "appointmentDay": selectedDate,
            "appointmentTime": selectedSlot,
            "duration": getServiceDuration(duration, durationType),
            "serviceCategory": categoryName,
            "service": name,
            "slot": '',
            "expertId": selectedExpert?.id,
            "expertName": selectedExpert ? (selectedExpert.lastName ? `${selectedExpert.firstName} ${selectedExpert.lastName}` : selectedExpert.firstName) : '',
            "price": price,
            "billingPrice": salePrice || price,
            "quantity": quantity || 1,
            "salePrice": salePrice,
            "serviceCategoryId": categoryId,
            "serviceId": id,
            "txchrgs": txchrgs,
            "variations": variations,
            "consumables": consumables
        }
        return individualAppointmentObj;
    }

    const dataUrlToFile = (data: string, name: string) => {
        let splitString = data.split(',');
        let byteString = atob(splitString[1]);
        let mimeString = splitString[0].split(":")[1].split(';')[0];

        let ia = new Uint8Array(new ArrayBuffer(byteString.length));

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new File([ia], name, { type: mimeString });
    }

    const uploadImage = async (imagePath: string, index: number) => {
        return new Promise<string>((res: Function) => {
            let formData: any = new FormData();
            formData.append("id", storeData.tenantId);
            formData.append("file", dataUrlToFile(imagePath, `instruction_${index}.png`));
            formData.append("type", "orders");
            APISERVICE.POST(process.env.NEXT_PUBLIC_GET_BASE_CATALOG_URL + "/s3/uploadwithtype", formData, { resoponseType: 'text' }).then((resp: any) => res(resp.data)).catch(() => res(null));

        })
    }

    const submitAppointment = async (user) => {
        setShowAppointmentConfirmation(false);
        if (user) {
            dispatch(enableLoader());
            const appointmentsList = [];
            appointmentItems.map((item) => {
                appointmentsList.push(createIndividualExpertService(item));
            })
            appointmentsList[0].slot = selectedSlot;
            let familyMember = null;
            if (selectedMember) {
                familyMember = selectedMember.mobileNo != userData.mobileNo ? selectedMember : null;
            }
            let imageList = [];
            let imageUploadFail = false;
            for (let i = 0; i < instImages.length; i++) {

                if (instImages[i].startsWith("data:image")) {
                    let f: string = await uploadImage(instImages[i], i);
                    if (f) imageList.push(f);
                    else {
                        imageUploadFail = true;
                        break
                    }
                }
                if (imageUploadFail) {
                    console.log("Error uploading images")
                    return;
                }
            }
            const appointmentObj = {
                "appointmentDay": appointmentsList[0].appointmentDay,
                "appointmentTime": appointmentsList[0].appointmentTime,
                "duration": appointmentsList[0].duration,
                "instruction": appointmentInstruction,
                "instrImages": imageList,
                "slot": appointmentsList[0].slot,
                "expertId": appointmentsList[0].expertId,
                "expertName": appointmentsList[0].expertName,
                "storeId": storeData.storeId,
                "tenantId": storeData.tenantId,
                "store": storeData.store,
                "tenant": storeData.tenant,
                "guestId": user.id,
                "guestName": user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName,
                "guestMobile": user.mobileNo,
                "guestEmail": user.email,
                "createdOn": new Date().toISOString(),
                "expertAppointments": appointmentsList,
                "noOfRemindersSent": '',
                "rescheduled": false,
                "feedbackLinkShared": false,
                "bookedFor": familyMember,
                "storeLocation": selectedStoreLocation,
                "type": APPOINTMENT_TYPE,
                "smsKeys": {
                    "appointmentConfirmed": false,
                    "appointmentCancelled": false,
                    "appointmentFeedback": false,
                    "smsForAppointments": true,
                    "combineFeedbackAndInvoice": false,
                },
                "status": [{
                    "status": APPOINTMENT_CREATED,
                    "staff": "",
                    "createdOn": new Date().toISOString()
                }]
            }

            console.log(appointmentObj);
            APISERVICE.POST(process.env.NEXT_PUBLIC_PLACE_APPOINTMENT, appointmentObj).then((res) => {
                setTimeout(() => {
                    // sendWhatsappMsg(user)
                    setAppointmentOrder(res.data)
                    setShowAppointmentSuccess(true);
                    dispatch(disableLoader());
                    dispatch(replaceAppointmentServices([]));
                    dispatch(showSuccess('Appointment booked successfully'))
                }, 1000)
            }).catch((error) => {
                console.log(error);
                dispatch(disableLoader());
                dispatch(showError('Appointment booking failed'))
            })
        }
    }

    const onConfirmBookingClick = (user) => {
        if (!appointmentItems || appointmentItems.length == 0) {
            dispatch(showError('Select any service'));
        } else if (!selectedDate) {
            dispatch(showError('Select preferred date'));
        } else if (!selectedExpert && configData?.storeConfig?.appointmentConfig?.showExpertAsSalon) {
            dispatch(showError('Select salon location'));
        } else if (!selectedStoreLocation && configData?.storeConfig?.storeLocations && configData?.storeConfig?.storeLocations?.length != 0) {
            dispatch(showError('Select store location'));
        } else if (!selectedSlot) {
            dispatch(showError('Select preferred slot'));
        } else {
            if (user) {
                setSelectedMember({ name: user?.firstName, mobileNo: user?.mobileNo });
                setShowAppointmentConfirmation(true);
            } else setShowUserRegistration(true);
        }
    }
    const onClickExpertInput = () => {
        searchItems('');
        setActiveInput(activeInput == 'expert' ? '' : 'expert');
    }

    const onClickStoreLocationInput = () => {
        searchItems('');
        setActiveInput(activeInput == 'store-location' ? '' : 'store-location');
    }

    const onChangeMemberValue = (from, value) => {
        seterror('')
        const familyMemberCopy = { ...familyMember };
        if (from == 'mobileNo') {
            if (value && value.length > 10) {
                setFamilyMember(familyMemberCopy)
            } else {
                familyMemberCopy[from] = value;
                setFamilyMember(familyMemberCopy)
            }
        } else {
            familyMemberCopy[from] = value;
            setFamilyMember(familyMemberCopy)
        }
    }

    const closeMemberForm = () => {
        setFamilyMember({ name: '', mobileNo: '' });
        setShowAddMemberModal(false)
    }

    const submitMemberForm = () => {
        if (!familyMember.name) {
            seterror('member-name')
        } else if (!familyMember.mobileNo) {
            seterror('member-mobileNo')
        } else {
            const userDataCopy = { ...userData }
            if (userDataCopy.familyMembers) userDataCopy.familyMembers.push(familyMember)
            else userDataCopy.familyMembers = [familyMember];
            dispatch(enableLoader());
            updateUser(userDataCopy)
                .then((res: any) => {
                    dispatch(disableLoader());
                    dispatch(showSuccess('Member Added', 2000));
                    setCookie("user", res.data, { //user registration fields
                        path: "/",
                        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                        sameSite: true,
                    })
                    setSelectedMember({ ...familyMember })
                }).catch(() => {
                    dispatch(disableLoader());
                    dispatch(showError('Something went wrong. please try again ', 2000));
                })
            setShowAddMemberModal(false);
            setFamilyMember({ name: '', mobileNo: '' });
            setActiveInput('');
        }
    }


    const filterCategory = async (category: any, searchQuery: any) => {
        return new Promise((res) => {
            if (category.showOnUi) {
                category.display = !category.hideFromCatalogue;
                if (category.name.toLowerCase().includes(searchQuery)) {
                    category.display = true;
                }
                if (category?.categoryList && category?.categoryList?.length != 0) {
                    category.categoryList?.map(async (subcat: any) => {
                        if (subcat.showOnUi) {
                            subcat = await filterCategory(subcat, category.display ? '' : searchQuery)
                        } else subcat.display = false;
                    })
                    let isAnyDisplaySubcat = category?.categoryList?.filter((cat: any) => cat.display);
                    category.display = isAnyDisplaySubcat?.length != 0 ? true : false;
                } else if (category?.itemList?.length != 0) {//3rd level itemslist
                    let filteredItems = category?.itemList;
                    if (searchQuery) filteredItems = category?.itemList.filter((item: any) => item.showOnUi && !item.hideFromCatalogue && item.name.toLowerCase().includes(category.display ? '' : searchQuery));
                    filteredItems.map((item: any) => {
                        item.serviceId = item.id;
                        item.duration = item.durationType ? ((item.durationType?.includes('hrs')) ? (parseFloat(item.duration) * 60).toFixed(1) : parseFloat(item.duration)) : 30;
                    })
                    category.itemList = filteredItems;
                    category.display = filteredItems.length != 0 ? true : false;
                } else category.display = false;
            } else category.display = false;
            res(category);
        })
    }

    const searchItems = async (searchQuery: any) => {
        searchQuery = searchQuery ? searchQuery.toLowerCase() : '';
        const { categories } = JSON.parse(JSON.stringify(storeData));
        const categoriesCopy = categories.filter((c: any) => c.type == keywords[SERVICE] && c.active);
        categoriesCopy.map(async (catData: any) => {//1st level category
            catData = await filterCategory(catData, searchQuery)
        })
        setCategoriesList(JSON.parse(JSON.stringify(categoriesCopy)));
        setitemToSearch(searchQuery);
    }

    const renderCategoryItemsView = (category: any) => {
        if (category && category.display && !category.hideFromCatalogue) {
            return <div className={`items-cat-wrap clearfix ${(category?.categoryList && category?.categoryList.length != 0) ? 'has-sub-category' : ''}`}>
                <div className={`cat-name ${(category?.categoryList && category?.categoryList.length != 0) ? 'has-sub-category' : ''}`}>
                    {category.name}
                </div>
                {((category?.categoryList && category?.categoryList.length != 0) && category?.categoryList?.length != 0) ? <>
                    {category?.categoryList?.map((category: any) => {
                        return <React.Fragment key={category.id}>
                            {renderCategoryItemsView(category)}
                        </React.Fragment>
                    })}
                </> : <>
                    {(category?.itemList && category?.itemList?.length != 0) ? <>
                        {renderItems(category.itemList)}
                    </> : <></>}
                </>}
            </div>

        } else return null;
    }

    const renderItems = (itemsList: any) => {
        if (itemsList && itemsList?.length != 0) {
            return <React.Fragment>
                {itemsList?.map((item: any) => {
                    return <React.Fragment key={Math.random()}>
                        {item.showOnUi && !item.hideFromCatalogue && <Item item={item} config={{ redirection: false, onClickAction: true }} />}
                    </React.Fragment>
                })}
            </React.Fragment>
        } else return null;
    }

    const redirectToCategories = () => {
        let activeCats = storeData.categories.filter((c: any) => c.active && c.type == keywords[SERVICE]);
        let itemUrl = activeCats[0].name.toLowerCase().split(" ").join("-");
        navigateTo(`${itemUrl}-srp`);
    }

    const openInstrFileInput = () => { imageRef.current.click(); }

    const resetInstrFileInput = () => { setInstrImgReset(!instrImgReset); }

    const addInstrImage = (el: HTMLInputElement) => {
        if (!el.files.length) return;

        let file = el.files[0];

        console.log(file.size);
        if (file.size > 2097152) {
            setInstrImgError(true);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result == 'string') {
                let flag = true;
                for (let i = 0; i < instImages.length; i++) {
                    if (reader.result === instImages[i]) {
                        flag = false;
                        break;
                    }
                }

                if (flag) setInstImages([...instImages, reader.result]);
            }
        }
        reader.readAsDataURL(file);
        setInstrImgError(false);

        resetInstrFileInput();
    }

    const deleteImage = (index: number) => {
        let imageList = [...instImages];
        imageList.splice(index, 1);
        setInstImages(imageList);
    }
    const openInstrImageDeleteConfirmModal = (index: number) => { setShowInstrImageDelConfirmModal([true, index]); }
    const closeInstrImageDeleteConfirmModal = () => { setShowInstrImageDelConfirmModal([false, 0]); }

    return (

        <>
            {!showAppointmentSuccess ?
                <div className="main-wrapper appointment-wrap">
                    {userData && <div className="card">
                        <div className="sub-heading">User Details</div>
                        <div className="username">{userData.firstName} {userData.lastName}
                        </div>
                        <div className="usernumber">{userData.mobileNo}</div>
                        <div className="usernumber">{userData.email}</div>

                    </div>}
                    <div className="selected-service-list-wrap card clearfix">
                        <div className="sub-heading">Selected Services</div>
                        {appointmentItems?.length != 0 && appointmentItems?.map((item, index) => {
                            return <div key={Math.random()} className="service-wrap">
                                <div className='service-details'>
                                    <div className='service-name'>{item.name} </div>
                                    {item.variations && item.variations.length != 0 && <div className='variations-wrap'>
                                        ({item.variations[0].name}
                                        {item.variations[0]?.variations?.length != 0 && <>-{item.variations[0]?.variations[0]?.name}</>}
                                        {item.variations[0]?.variations?.length != 0 && item.variations[0]?.variations[0]?.variations?.length != 0 && <>-{item.variations[0]?.variations[0]?.variations[0]?.name}</>})
                                    </div>}
                                </div>
                                <div className="service-cancel-icon" onClick={() => removeService(index)} >
                                    <SvgIcon icon="close" />
                                </div>
                            </div>
                        })}
                        <div className="btn-wrap fullwidth">
                            <div className='btn' onClick={redirectToCategories}>Add more services</div>
                        </div>
                    </div>

                    {expertData && <div className="input-wrap expert-list card">
                        {configData?.storeConfig.appointmentConfig?.showExpertAsSalon ? <div className="sub-heading">Salon</div> : <div className="sub-heading">Expert</div>}
                        {selectedExpert ? <div className="selected-service-list-wrap">
                            <div className="service-wrap">
                                <div className='service-details' onClick={onClickExpertInput}>
                                    <div className='service-name'>{selectedExpert?.firstName} {selectedExpert?.lastName} </div>
                                </div>
                                <div className="service-cancel-icon" onClick={() => { setSelectedExpert(null); onClickExpertInput() }}>
                                    <SvgIcon icon="close" />
                                </div>
                            </div>
                        </div> :
                            <>
                                <input className="inputbox" value={''}
                                    placeholder={`${selectedExpert ? `${selectedExpert?.firstName} ${selectedExpert?.lastName}` : configData.storeConfig?.appointmentConfig?.showExpertAsSalon ? 'Select salon location' : 'Select Expert'}`}
                                    readOnly onClick={onClickExpertInput} />
                                <span className={activeInput == 'expert' ? "input-icon active" : "input-icon"} onClick={onClickExpertInput}><SvgIcon icon="backArrow" /></span>
                            </>
                        }

                        <div className="searched-item-list-wrap"
                            style={{ height: activeInput == 'expert' ? `${expertData ? (expertData.length + 1) * 30 : 0}px` : '0' }} onClick={() => expertQuery ? {} : ''} >

                            <div className="items-list">
                                {expertData?.map((expert) => {
                                    return <React.Fragment key={Math.random()}>
                                        {!!expert.active && <div className="expert-details" onClick={() => onSelectExpert(expert)}>
                                            <div className="expert-name">{expert.firstName} {expert.lastName}</div>
                                        </div>}
                                    </React.Fragment>
                                })}
                            </div>
                        </div>
                    </div>}


                    {(configData?.storeConfig?.storeLocations && configData?.storeConfig?.storeLocations?.length != 0) && <div className="input-wrap expert-list card">
                        <div className="sub-heading">Location</div>
                        {selectedStoreLocation ? <div className="selected-service-list-wrap">
                            <div className="service-wrap">
                                <div className='service-details' onClick={onClickStoreLocationInput}>
                                    <div className='service-name'>{selectedStoreLocation} </div>
                                </div>
                                <div className="service-cancel-icon" onClick={() => { setSelectedStoreLocation(''); onClickStoreLocationInput() }}>
                                    <SvgIcon icon="close" />
                                </div>
                            </div>
                        </div> :
                            <>
                                <input className="inputbox" value={''}
                                    readOnly
                                    placeholder={`${selectedStoreLocation ? `${selectedStoreLocation}` : 'Select store location'}`}
                                    onClick={onClickStoreLocationInput} />
                                <div className={activeInput == 'store-location' ? "input-icon active" : "input-icon"} onClick={onClickStoreLocationInput} ><SvgIcon icon="backArrow" /></div>
                            </>
                        }

                        <div className="searched-item-list-wrap"
                            style={{ height: activeInput == 'store-location' ? `${configData?.storeConfig?.storeLocations ? (configData?.storeConfig?.storeLocations.length + 1) * 30 : 0}px` : '0' }}>

                            <div className="items-list">
                                {configData?.storeConfig?.storeLocations?.map((store) => {
                                    return <React.Fragment key={Math.random()}>
                                        <div className="expert-details" onClick={() => { setSelectedStoreLocation(store.name); setActiveInput('') }}>
                                            <div className="expert-name">{store.name}</div>
                                        </div>
                                    </React.Fragment>
                                })}
                            </div>
                        </div>
                    </div>}



                    <div className="date-wrap card">
                        <div className="sub-heading">Preferred Date</div>
                        <div className="input-wrap-with-label date-picker-wrap">
                            <DatePicker
                                selected={selectedDate ? new Date(selectedDate) : null}
                                onChange={(date) => onSelectDate(date)}
                                dateFormat="MMMM d"
                                inline
                                minDate={new Date()}
                            />
                        </div>
                    </div>

                    <div className="slot-time-outer card">
                        <div className="sub-heading">Preferred Time</div>
                        {configData && storeSlot.map((storeSlot) => {
                            return <div key={Math.random()} onClick={() => onSelectSlot(storeSlot)} className={selectedSlot == storeSlot ? 'slot-wrap active' : "slot-wrap"}>{storeSlot}</div>

                        })}
                    </div>

                    <div className="input-wrap card">
                        <div className="sub-heading">Instruction/Address</div>
                        <textarea className={"inputbox instr" + (!appointmentInstruction ? " instrShare" : "")} placeholder="Note" value={appointmentInstruction || ''} onChange={(e) => setAppointmentInstruction(e.target.value)} />
                        {instImages.length ? <div className="instrImgScrollContainer">
                            <div className="instrImgScroll">
                                {instImages.map((link: string, index: number) => <div key={link} className="instrImgContainer card">
                                    <div className="instrImageDelIcon" onClick={() => openInstrImageDeleteConfirmModal(index)} >
                                        <SvgIcon icon="close" />
                                    </div>
                                    <img className="instrImg" src={link} onClick={() => openInstrImageDeleteConfirmModal(index)} /></div>)}
                            </div>
                        </div> : null}
                        <div className="instrFileInputButton">
                            <button className="primary-btn border-btn" onClick={openInstrFileInput}>Add Image</button>
                            <div className={instrImgError ? " add-img-note error" : "add-img-note"}>(Max 2MB per image)</div>
                            <input key={instrImgReset ? "y" : "n"} type="file" ref={imageRef} onChange={(e) => addInstrImage(e.target)} className="hide" accept="image/jfif,image/png,image/jpeg,image/webp" />
                        </div>
                    </div>

                    {!(!appointmentObj.total) && <div className="book-wrap">
                        <div className='total-wrap d-f-c'>
                            <div className='title'>Total : </div>
                            <div className='value' onClick={() => setShowTotalBreakdownPopup(true)}>{configData.currencySymbol} {appointmentObj.total}</div>
                            <div className='info d-f-c' onClick={() => setShowTotalBreakdownPopup(true)}><SvgIcon icon="info" /></div>
                        </div>
                        <button className="primary-btn rounded-btn" onClick={() => onConfirmBookingClick(userData)}>Confirm Booking</button>
                    </div>}

                    <Backdrop
                        className="backdrop-modal-wrapper instrImageDelConfirmModal"
                        open={showInstrImageDelConfirmModal[0]}
                        title="Are you sure you want to delete this?"
                    >
                        <div className='backdrop-modal-content' style={{ height: showInstrImageDelConfirmModal[0] ? 445 : 0 }}>
                            <div className="heading">Are you sure you want to delete this?</div>
                            <div className="imageHeightLimiter">
                                <img src={showInstrImageDelConfirmModal[0] ? instImages[showInstrImageDelConfirmModal[1]] : ""} />
                            </div>
                            <div className="buttonContainer">
                                <button onClick={closeInstrImageDeleteConfirmModal} className='primary-btn border-btn'>No</button>
                                <button onClick={() => { deleteImage(showInstrImageDelConfirmModal[1]); closeInstrImageDeleteConfirmModal(); }} className='primary-btn'>Yes</button>
                            </div>
                        </div>
                    </Backdrop>

                    <Backdrop
                        className="backdrop-modal-wrapper appointment-checkout-wrapper"
                        open={showAppointmentConfirmation ? true : false}
                        title={'Appointment confirmation'}

                    >

                        <div className="backdrop-modal-content" style={{ height: `${showAppointmentConfirmation ? '580px' : '0'}` }}>
                            <div className="modal-close" onClick={() => setShowAppointmentConfirmation(false)}>
                                <SvgIcon icon="close" />
                            </div>
                            <div className='appointment-checkout-content'>
                                <div className="heading">Appointment details</div>
                                <div className="date-time card">
                                    <div className='sub-heading'>Date & Time</div>
                                    <div className="date">{getDateObj(selectedDate).dateObj}, {selectedSlot}</div>
                                </div>
                                <div className="services-list-wrap card">
                                    <div className="sub-heading">Services</div>
                                    {appointmentItems?.map((item) => {
                                        return <div className="service-name" key={Math.random()}>{item.name}</div>
                                    })}
                                </div>
                                {selectedExpert && <div className="services-list-wrap card">
                                    {configData.storeConfig?.appointmentConfig?.showExpertAsSalon ? <div className="sub-heading">Salon</div> : <div className="sub-heading">Expert</div>}
                                    <div className="service-name">{selectedExpert?.firstName} {selectedExpert?.lastName}</div>
                                </div>}

                                <div className="appt-for-wrap card">
                                    <div className="sub-heading">Appointment For</div>
                                    <div className='selected-profile'>
                                        <div className='name'>{selectedMember?.name}, {selectedMember?.mobileNo}</div>
                                    </div>
                                    <div className='profile-list'>
                                        <div className={`profile ${selectedMember?.name == userData?.firstName ? 'active' : ''}`} onClick={() => onSelectMember({ name: userData?.firstName, mobileNo: userData?.mobileNo })}  >Self</div>
                                        {userData?.familyMembers?.map((member) => {
                                            return <div key={Math.random()} onClick={() => onSelectMember(member)} className={`profile ${selectedMember?.name == member.name ? 'active' : ''}`}>{member.name}</div>
                                        })}
                                    </div>
                                    <div className='add-profile'>
                                        <div onClick={() => { setShowAddMemberModal(true); setActiveInput('') }} >Add Member +</div>
                                    </div>
                                </div>

                                <Backdrop
                                    className="backdrop-modal-wrapper"
                                    open={showAddMemberModal ? true : false}
                                >
                                    <div className="backdrop-modal-content"
                                        style={{ height: showAddMemberModal ? '250px' : '0px' }}
                                    >
                                        <div className="modal-close" onClick={closeMemberForm}>
                                            <SvgIcon icon="close" />
                                        </div>
                                        <div className="member-modal">
                                            <div className='heading'>Add Member</div>
                                            <div className="member-form">
                                                <div className='input-wrap'>
                                                    <span className="label">Name*</span>
                                                    <input className={error == 'member-name' ? 'input error' : 'input'}
                                                        autoComplete="off"
                                                        placeholder='Profile name'
                                                        value={familyMember.name || ''}
                                                        onChange={(e) => onChangeMemberValue('name', e.target.value)} />
                                                    {error == 'member-name' && <div className="error">Please enter name</div>}
                                                </div>
                                                <div className='input-wrap'>
                                                    <span className="label">mobileNo*</span>
                                                    <input className={error == 'member-mobileNo' ? 'input error' : 'input'}
                                                        autoComplete="off"
                                                        placeholder='Profile number'
                                                        minLength={10}
                                                        maxLength={10}
                                                        type="number"
                                                        value={familyMember.mobileNo || ''}
                                                        onChange={(e) => onChangeMemberValue('mobileNo', e.target.value)} />
                                                    {error == 'member-mobileNo' && <div className="error">Please enter phone number</div>}
                                                </div>
                                            </div>
                                            <div className="form-btn-wrap">
                                                <button className="primary-btn rounded-btn border-btn without-border-btn" onClick={closeMemberForm}>Cancel</button>
                                                <button className="primary-btn rounded-btn" onClick={submitMemberForm}>Add</button>
                                            </div>
                                        </div>
                                    </div>
                                </Backdrop>
                                <div className='confirm-btn-wrap'>
                                    <button className="primary-btn rounded-btn" onClick={onAppointmentConfirmation}>Confirm</button>
                                </div>
                            </div>
                        </div>
                    </Backdrop>

                    {showUserRegistration && <UserRegistrationModal
                        handleResponse={(e) => onLoginClose(e)}
                        isApppGrpChangeOnUserGdrChange={true}
                        open={true}
                        fromPage={'APPOINTMENT'}
                        heading={'Login for appointment booking'}
                    />}

                    <Backdrop
                        className="backdrop-modal-wrapper"
                        open={showTotalBreakdownPopup ? true : false}
                        onClick={() => setShowTotalBreakdownPopup(false)}
                    >
                        <div className="backdrop-modal-content"
                            style={{ height: `${showTotalBreakdownPopup ? `${140 + (appointmentObj?.txchrgs?.length * 30)}px` : '0'}` }}
                        >
                            <div className="heading" >Pricing Details</div>
                            <div className="modal-close" onClick={() => setShowTotalBreakdownPopup(false)}>
                                <SvgIcon icon="close" />
                            </div>
                            <div className='pricing-details-wrap d-f-c'>
                                <div className='heading'>
                                    <div className='title'>SubTotal</div>
                                    {appointmentObj.txchrgs?.map((taxData: any) => {
                                        return <div className='title' key={Math.random()}>{taxData.name}{taxData.isInclusive ? "(Inclusive)" : ''}({taxData.value}%)</div>
                                    })}
                                    <div className='title grand-total'>Grand Total</div>
                                </div>
                                <div className='details'>
                                    <div className='value'>{configData.currencySymbol} {appointmentObj.subTotal}</div>
                                    {appointmentObj.txchrgs?.map((taxData: any) => {
                                        return <div className='value' key={Math.random()}>{configData.currencySymbol} {taxData.total}</div>
                                    })}
                                    <div className='value grand-total'>{configData.currencySymbol} {appointmentObj.total}</div>
                                </div>
                            </div>
                        </div>
                    </Backdrop>
                </div >
                : <>
                    {appointmentOrder && <div className="main-wrapper appointment-wrap" style={{ background: 'transparent' }}>
                        <div className='appointment-checkout-content'>
                            <div className="username instruction">Hi {userData?.firstName} your appointment has been initiated for the below services.</div>
                            <div className="date-time card">
                                <div className='sub-heading'>Date & Time</div>
                                <div className="date">{getDateObj(selectedDate).dateObj}, {selectedSlot}</div>
                            </div>
                            {appointmentOrder.expertAppointments.length != 0 && <div className="services-list-wrap card">
                                <div className="sub-heading">Services</div>
                                {appointmentOrder.expertAppointments?.map((item) => {
                                    return <div className="service-name" key={Math.random()}>{item.service}</div>
                                })}
                            </div>}
                            {selectedExpert && <div className="services-list-wrap card">
                                {configData.storeConfig?.appointmentConfig?.showExpertAsSalon ? <div className="sub-heading">Salon</div> : <div className="sub-heading">Expert</div>}
                                <div className="service-name">{selectedExpert?.firstName} {selectedExpert?.lastName}</div>
                            </div>}

                            <div className="appt-for-wrap card">
                                <div className="sub-heading">Appointment For</div>
                                <div className='selected-profile'>
                                    <div className='name'>{selectedMember?.name}, {selectedMember?.mobileNo}</div>
                                </div>
                            </div>
                            <div className="username instruction">We have received your appointment details. Kindly wait for our confirmation.</div>

                            <div className='confirm-btn-wrap book-wrap alignment'>
                                <button className="primary-btn rounded-btn" onClick={() => navigateTo('home')}>Explore More</button>
                            </div>
                        </div>
                    </div>}
                </>
            }
        </>
    )
}

export default Appointment
