import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Backdrop, Box, ClickAwayListener } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { useCookies } from "react-cookie";
import { enableLoader, disableLoader, updateGenericImages } from "app/redux/actions/common";
import { showSuccess, showError } from 'app/redux/actions/alert';
import { updateUserData } from 'app/redux/actions/user';
import { getUserByTenantAndMobile, getUserSources, updateUser } from '@storeData/user';
import { getGenericImages } from '@util/utils';
import DatePicker from "react-datepicker";
import { GoogleLogin, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
import jwt_decode from "jwt-decode";
import SvgIcon from '@element/svgIcon';


function BsPersonFill(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 16 16" height="1em" width="1em" {...props}><path fillRule="evenodd" d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
}

function FaPhone(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M21 16.42v3.536a1 1 0 0 1-.93.998c-.437.03-.794.046-1.07.046-8.837 0-16-7.163-16-16 0-.276.015-.633.046-1.07A1 1 0 0 1 4.044 3H7.58a.5.5 0 0 1 .498.45c.023.23.044.413.064.552A13.901 13.901 0 0 0 9.35 8.003c.095.2.033.439-.147.567l-2.158 1.542a13.047 13.047 0 0 0 6.844 6.844l1.54-2.154a.462.462 0 0 1 .573-.149 13.901 13.901 0 0 0 4 1.205c.139.02.322.042.55.064a.5.5 0 0 1 .449.498z"></path></g></svg>;
}

function MdEmail(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>;
}

function FaCalendarAlt(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 448 512" height="1em" width="1em" {...props}><path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z" /></svg>;
}

function BiCalendarHeart(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M8.648,14.711L11.997,18l3.35-3.289c0.871-0.854,0.871-2.21,0-3.069c-0.875-0.855-2.255-0.855-3.126,0l-0.224,0.219 l-0.224-0.219c-0.87-0.855-2.25-0.855-3.125,0C7.777,12.501,7.777,13.856,8.648,14.711z" /><path d="M19,4h-2V2h-2v2H9V2H7v2H5C3.897,4,3,4.897,3,6v2v12c0,1.103,0.897,2,2,2h14c1.103,0,2-0.897,2-2V8V6 C21,4.897,20.103,4,19,4z M19.002,20H5V8h14L19.002,20z" /></svg>;
}

function FaTransgender(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 384 512" height="1em" width="1em" {...props}><path d="M372 0h-79c-10.7 0-16 12.9-8.5 20.5l16.9 16.9-80.7 80.7C198.5 104.1 172.2 96 144 96 64.5 96 0 160.5 0 240c0 68.5 47.9 125.9 112 140.4V408H76c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h36v28c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-28h36c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12h-36v-27.6c64.1-14.6 112-71.9 112-140.4 0-28.2-8.1-54.5-22.1-76.7l80.7-80.7 16.9 16.9c7.6 7.6 20.5 2.2 20.5-8.5V12c0-6.6-5.4-12-12-12zM144 320c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" /></svg>;
}

function ImLocation(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 16 16" height="1em" width="1em" {...props}><path d="M8 0c-2.761 0-5 2.239-5 5 0 5 5 11 5 11s5-6 5-11c0-2.761-2.239-5-5-5zM8 8c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" /></svg>;
}

function VscSourceControl(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M21.007 8.222A3.738 3.738 0 0 0 15.045 5.2a3.737 3.737 0 0 0 1.156 6.583 2.988 2.988 0 0 1-2.668 1.67h-2.99a4.456 4.456 0 0 0-2.989 1.165V7.4a3.737 3.737 0 1 0-1.494 0v9.117a3.776 3.776 0 1 0 1.816.099 2.99 2.99 0 0 1 2.668-1.667h2.99a4.484 4.484 0 0 0 4.223-3.039 3.736 3.736 0 0 0 3.25-3.687zM4.565 3.738a2.242 2.242 0 1 1 4.484 0 2.242 2.242 0 0 1-4.484 0zm4.484 16.441a2.242 2.242 0 1 1-4.484 0 2.242 2.242 0 0 1 4.484 0zm8.221-9.715a2.242 2.242 0 1 1 0-4.485 2.242 2.242 0 0 1 0 4.485z" /></svg>;
}

function UserRegistrationModal({ fromPage = '', handleResponse, isApppGrpChangeOnUserGdrChange, open, heading }) {
    const dispatch = useDispatch();
    const [cookie, setCookie] = useCookies();
    const [error, setError] = useState({ id: '', text: '' });
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const storeData = useSelector((state: any) => state.store ? state.store.storeData : null);
    const activeGroup = useSelector((state: any) => state.activeGroup);
    const [userFromCookies, setUserCookie] = useState(cookie['user']);
    const [showRegistrationScreen, setShowRegistrationScreen] = useState(false);
    const [showWellcomeScreen, setShowWellcomeScreen] = useState(false);
    const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null);
    const userConfig = configData?.storeConfig?.sparkConfig?.userConfig;
    const [showSignInPage, setShowSignInPage] = useState(fromPage != 'PROFILE' ? true : false)
    const [pageheight, setpageheight] = useState<any>('370px');
    const [showSigninInputs, setShowSigninInputs] = useState((fromPage == 'INITIAL_LOAD') ? false : true);
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [sourcesList, setSourcesList] = useState([])
    useEffect(() => {
        // if (open) document.body.classList.add("o-h")
        // else document.body.classList.remove("o-h")
        if (fromPage == 'INITIAL_LOAD') setShowSigninInputs(false);
    }, [open])

    const DatePickerInput = forwardRef((props: any, ref: any) => <button className="date-picker-button" onClick={props.onClick} ref={ref}>
        {props.value ? <>
            {props.from == 'Birth date' ? 'Birth date: ' : 'Anniversary date: '} {props.value}

        </> : <>
            {props.from == 'Birth date' ? 'Birth date' : 'Anniversary date'}
        </>}
    </button>);

    const modalRef = useRef(null);
    const modalWrapRef = useRef(null);
    const loginNumberInput = useRef<HTMLInputElement>(null);
    const signUpFormRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setpageheight(`${modalWrapRef.current.clientHeight + 10}px`);
    }, [showSignInPage, showSigninInputs, error, open])

    useEffect(() => {
        const ele: any = document.getElementById('sign-in-phone')
        if (showSigninInputs && ele && showSignInPage) {
            setTimeout(() => {
                ele.focus();
            }, 600);
        }
    }, [showSigninInputs, showSignInPage])

    const [userData, setUserData] = useState({
        mobileNo: '',
        firstName: '',
        lastName: '',
        email: '',
        area: '',
        gender: '',
        dob: '',
        source: '',
        anniversaryDate: '',
        addressList: [],
        storeId: storeData?.storeId ? storeData?.storeId : '',
        tenantId: storeData?.tenantId ? storeData?.tenantId : ''
    })

    useEffect(() => {
        if (error.id) {
            if (window?.navigator && window?.navigator?.vibrate) {
                window?.navigator?.vibrate([200, 100, 200])
            }
            let element = document.getElementById(error.id)
            if (element) {
                element.classList.add("shaker")
                setTimeout(() => {
                    element.classList.remove("shaker")
                }, 1000);
            }
        }
    }, [error])

    useEffect(() => {
        if (userConfig?.showAddress) {
            setUserData({
                ...userData, addressList: [{
                    area: '',
                    city: '',
                    code: '',
                    landmark: '',
                    latitude: null,
                    line: '',
                    longitude: null,
                    type: 'Home',
                }]
            })
        }
        if (userConfig.showSource) {
            getUserSources(storeData?.tenantId, storeData?.storeId).then((res: any) => {
                if (res.data) {
                    setSourcesList(res.data.filter((d: any) => d.active));
                }
            })
        }
    }, [])


    useEffect(() => {
        if (fromPage == 'INITIAL_LOAD') {
            setCookie("baseRouteUrl", baseRouteUrl, {
                path: "/",
                expires: new Date(new Date(2147483647 * 1000).toUTCString()),
                sameSite: true,
            })
            const wellcomeScreenTime = cookie['wst'];
            const registrationScreenTime = cookie['rst'];
            if (!userFromCookies && !registrationScreenTime) {
                // console.log('time expiry registrationScreenTime');
                setShowWellcomeScreen(false);
                setShowRegistrationScreen(true);
                setCookie("rst", new Date(), { //registration-screen-time
                    path: "/",
                    expires: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
                    sameSite: true,
                })
            } else if (userFromCookies && !wellcomeScreenTime) {
                // console.log('time expiry wellcomeScreenTime');
                setShowRegistrationScreen(false);
                setShowWellcomeScreen(true);
                setCookie("wst", new Date(), { //wellcome-screen-time
                    path: "/",
                    expires: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
                    sameSite: true,
                })
            } else if (!userFromCookies && !registrationScreenTime && (userConfig?.userRegPopupReq)) {
                setShowRegistrationScreen(true);
            } else {
                handleClose();
            }
        } else {
            setShowRegistrationScreen(true);
            setCookie("rst", new Date(), { //registration-screen-time
                path: "/",
                expires: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
                sameSite: true,
            })
        }
    }, [fromPage])

    useEffect(() => {
        if (cookie['user'] && cookie['user']?.mobileNo) {
            setUserData(cookie['user']);
        } else setUserData({
            mobileNo: '',
            firstName: '',
            lastName: '',
            email: '',
            area: '',
            gender: '',
            dob: '',
            source: '',
            anniversaryDate: '',
            addressList: [],
            storeId: storeData?.storeId ? storeData?.storeId : '',
            tenantId: storeData?.tenantId ? storeData?.tenantId : ''
        })
    }, [userFromCookies, open])

    useEffect(() => {
        if (configData && configData.genericImages) {
            dispatch(updateGenericImages(getGenericImages(configData, activeGroup)));
        }
    }, [activeGroup, configData])

    const handleClose = (user = null) => {
        if (user && user.firstName) handleResponse(user);
        else handleResponse();
        setError({ id: '', text: '' });
        setShowSignInPage(true);
    };

    const wrongEmail = () => {
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(userData.email)) return false;
        else return true;
    }

    const validateLoginForm = () => {
        if (!userData || !userData.mobileNo || !validateNumber(userData.mobileNo)) {
            setError({ id: 'phone', text: '' });
            return false;
        } else if (!userData.firstName) {
            setError({ id: 'firstName', text: '' });
            return false;
        } else if (!userData.email && userConfig?.emailMandatory && userConfig?.showEmail) {
            setError({ id: 'email', text: '' });
            return false;
        } else if (userConfig?.addressMandatory && (userConfig?.showAddress && (userData.addressList.length == 0 || userData.addressList[0].line))) {
            setError({ id: 'line', text: '' });
            return false;
        } else if (userConfig.showGender && userConfig?.genderSelectionMandatory && !userData.gender) {
            setError({ id: 'gender', text: '' });
            return false;
        } else {
            return true;
        }
    }
    const proceed = () => {

        if (validateLoginForm()) {
            if (userData.email && wrongEmail()) {
                setError({ id: 'email', text: '' });
                return;
            }
            setError({ id: '', text: '' });
            if (userData?.mobileNo && validateNumber(userData?.mobileNo) && userData?.firstName) {
                dispatch(enableLoader());
                let userDetails = { ...userData };
                updateUser(userDetails).then((res: any) => {
                    dispatch(disableLoader());
                    if ('id' in userDetails) {
                        dispatch(showSuccess('User updated successfully'));
                    } else {
                        dispatch(showSuccess('User registered successfully'));
                    }
                    userDetails = res.data;
                    setCookie("user", userDetails, { //user registration fields
                        path: "/",
                        expires: new Date(new Date().setSeconds(new Date().getFullYear() + 1)),
                        sameSite: true,
                    })
                    setCookie("wst", new Date(), { //wellcome-screen-time
                        path: "/",
                        expires: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
                        sameSite: true,
                    })
                    setUserCookie(userDetails)
                    dispatch(updateUserData(userDetails))
                    handleClose(userDetails);
                }).catch(() => {
                    dispatch(disableLoader());
                    handleClose();
                    dispatch(showError('User registration failed'))
                })
            }

        }
    }

    const getUserDetailsByPhone = (mobileNo) => {
        dispatch(enableLoader());
        return new Promise((res, rej) => {
            getUserByTenantAndMobile(storeData?.tenantId, storeData?.storeId, mobileNo).then((response) => {
                dispatch(disableLoader());
                res(response);
            }).catch(function (error) {
                dispatch(disableLoader());
                dispatch(showError('Something went wrong.Try after some time.'))
                rej(error);
                console.log("error");
            });
        });
    }

    const validateNumber = (num: any) => {
        if (num && (!storeMetaData?.countryCode || storeMetaData?.countryCode?.includes('91')) ? num?.length == 10 : num?.length > 5) return true;
        else return false;
    }

    const onPhoneChange = (mobileNo, fetchUser) => {
        setError({ id: '', text: '' });
        const num = mobileNo.charAt(mobileNo?.length - 1).replace(".", '');
        if (((num && num != ' ') && !isNaN(num))) {
            setUserData({ ...userData, mobileNo: mobileNo });
            if (validateNumber(mobileNo) && fetchUser) {
                getUserDetailsByPhone(mobileNo).then((data: any) => {
                    if (data && data?.mobileNo) {
                        const user = data;
                        setCookie("user", user, { //user registration fields
                            path: "/",
                            expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                            sameSite: true,
                        })
                        setCookie("wst", new Date(), { //wellcome-screen-time
                            path: "/",
                            expires: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
                            sameSite: true,
                        })
                        setUserCookie(user)
                        dispatch(updateUserData(user))
                        if (isApppGrpChangeOnUserGdrChange) {
                            // dispatch(updateGroupStatus(user.gender ? user.gender : 'all'));
                            // setCookie("grp", user.gender, {
                            //     path: "/",
                            //     expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expires after 1hr
                            //     sameSite: true,
                            // })
                            // //theme changes effect
                            // document.body.dataset.theme = user.gender;
                            // let defaultWrapper = document.getElementById('default-wrapper');
                            // defaultWrapper.style.backgroundImage = `url("/assets/images/${user.gender}/bg.png")`;
                        }
                        // if (fromPage == 'INITIAL_LOAD') {
                        //     setShowRegistrationScreen(false);
                        //     setShowWellcomeScreen(true);
                        // } else {
                        // handleClose(user);
                        // }
                        handleClose(user);
                        dispatch(disableLoader());
                    } else
                        setError({ id: 'not-registered', text: "Looks like you dont have any account, try using other mobile number or click on sign up" })
                }).catch((e) => console.log(e))
            }
        }
    }


    const onInputChange = (from, value) => {
        const userDataCopy = { ...userData }
        userDataCopy[from] = value;
        setUserData(userDataCopy)
        setError({ id: '', text: '' });
    }

    const onAddressChange = (e: any) => {
        setError({ id: '', text: '' });
        let userCopy: any = JSON.parse(JSON.stringify(userData));
        if (userCopy.addressList.length == 0) {
            userCopy = {
                ...userCopy,
                mobileNo: '',
                firstName: '',
                lastName: '',
                email: '',
                area: '',
                gender: '',
                dob: '',
                anniversaryDate: '',
                addressList: [],
                tenantId: storeData?.tenantId ? storeData?.tenantId : ''
            }
        }
        switch (e.target.id) {
            case 'line':
                userCopy.addressList[0].line = e.target.value;
                break;
            case 'area':
                userCopy.addressList[0].area = e.target.value;
                break;
            case 'city':
                userCopy.addressList[0].city = e.target.value;
                break;
            default:
                break;
        }
        setUserData(userCopy)
    }

    const onBackdropOutsideClick = (event: any) => {
        if ((!userConfig?.userRegMandatory || fromPage != 'INITIAL_LOAD') && modalRef.current && !modalRef.current.contains(event.target)) {
            handleClose();
        }
    }

    const onSelectSource = (source) => {
        setUserData({ ...userData, source })
        setAnchorEl(null);
    }

    const renderSourceList = () => {
        return <div className="sources-list-wrapper">
            <ClickAwayListener onClickAway={(e: any) => {
                setAnchorEl(null);
            }}>
                <Box>
                    {sourcesList.map((sourceDetails: any, i: number) => {
                        return <React.Fragment key={i}>
                            <div className={`item-details ${userData.source == sourceDetails.name ? "active" : ''}`} onClick={() => onSelectSource(sourceDetails.name)}>{sourceDetails.name}</div>
                        </React.Fragment>
                    })}
                </Box>
            </ClickAwayListener>
        </div>
    }
    return (
        <div className="user-reg-modal">
            <div className='cart-page-login-wrap'>
                <Backdrop
                    className={`backdrop-modal-wrapper ${(open && (fromPage == 'INITIAL_LOAD' ? (showRegistrationScreen || showWellcomeScreen) : true)) ? 'active' : ''}`}
                    open={(open && (fromPage == 'INITIAL_LOAD' ? (showRegistrationScreen || showWellcomeScreen) : true)) ? true : false}
                    onClick={onBackdropOutsideClick}
                >
                    <div className={`backdrop-modal-content half-page-flow ${!showSignInPage ? 'signup' : 'signin'}`} ref={modalRef}
                        style={{ height: `${open ? `${pageheight}` : '0'}` }}
                    >
                        <div className='modal-wrap' ref={modalWrapRef}>
                            {showSignInPage ? <>
                                {showSigninInputs ? <>
                                    <div className="heading logo-header" >Sign In  {(!userConfig?.userRegMandatory) &&
                                        <div className="modal-close" onClick={() => handleClose()}>
                                            <SvgIcon icon="closeLarge" />
                                        </div>}
                                    </div>
                                    <div className="sub-heading" >{heading}. Enter mobile number to sign in or click sign up</div>
                                    {showSigninInputs && <div className='page-contain'>
                                        <div className='form-wrap'>
                                            <div id="cart-phone" className={`input-wrap-with-label phone-number-input glass-card ${error.id == 'cart-phone' ? 'error' : ''}`}>
                                                <div className="input-icon"><FaPhone /></div>
                                                {storeMetaData?.countryCode && <div className="country-code">+{storeMetaData?.countryCode}</div>}
                                                <input className="input"
                                                    autoComplete="off"
                                                    type='tel'
                                                    id="sign-in-phone"
                                                    ref={loginNumberInput}
                                                    value={userData.mobileNo || ''}
                                                    onChange={(e) => onPhoneChange(e.target.value, true)}
                                                    maxLength={10}
                                                    placeholder="Enter phone number"
                                                    readOnly={'id' in userData ? true : false} />
                                            </div>
                                            <div className=' signup-note'>
                                                <span>OR</span>
                                                <span onClick={() => setShowSignInPage(false)} className="btn">Sign Up</span>
                                            </div>
                                        </div>
                                        {error.id == 'not-registered' && < div className='not-registered note'>
                                            <span className=''>{error.text}</span>
                                        </div>}
                                    </div>}
                                </> : <div className='initial-toast'>
                                    <div className="sub-heading" onClick={() => setShowSigninInputs(true)}>Tap here to sign in</div>
                                    {(!userConfig?.userRegMandatory) && <div className="modal-close" onClick={() => handleClose()}>
                                        <SvgIcon icon="closeLarge" />
                                    </div>}
                                </div>}
                            </> : <>
                                <div className="heading logo-header" >Sign Up  {(!userConfig?.userRegMandatory || fromPage != 'INITIAL_LOAD') && <div className="modal-close" onClick={() => handleClose()}>
                                    <SvgIcon icon="closeLarge" />
                                </div>}
                                </div>
                                <div className="sub-heading" >{heading}</div>
                                <div className='page-contain'>
                                    <div className='form-wrap clearfix' ref={signUpFormRef}>
                                        <div id="phone" className={`input-wrap-with-label phone-number-input ${error.id == 'phone' ? 'error' : ''}`}>
                                            <div className="label"><span className="mandatory">*</span></div>
                                            <div className="input-icon"><FaPhone /></div>
                                            {storeMetaData?.countryCode && <div className="country-code">+{storeMetaData?.countryCode}</div>}
                                            <input className={error.id == 'phone' ? 'input invalidInput' : 'input'}
                                                autoComplete="off"
                                                type='tel'
                                                value={userData.mobileNo || ''}
                                                onChange={(e) => onPhoneChange(e.target.value, true)}
                                                maxLength={10}
                                                placeholder="Mobile Number"
                                                readOnly={'id' in userData ? true : false} />
                                        </div>
                                        <div id="firstName" className={`input-wrap-with-label ${error.id == 'firstName' ? 'error' : ''}`}>
                                            <div className="label"><span className="mandatory">*</span></div>
                                            <div className="input-icon"><BsPersonFill /></div>
                                            <input className={error.id == 'firstName' ? 'input invalidInput' : 'input'}
                                                autoComplete="off"
                                                value={userData.firstName || ''}
                                                onChange={(e) => onInputChange('firstName', e.target.value)}
                                                placeholder="Name" />
                                        </div>
                                        {(userConfig?.showEmail) && <div id="email" className={`input-wrap-with-label ${error.id == 'email' ? 'error' : ''}`}>
                                            {userConfig?.emailMandatory && <div className="label"><span className="mandatory">*</span></div>}
                                            <div className="input-icon"><MdEmail /></div>
                                            <input className={error.id == 'email' ? 'input invalidInput' : 'input'}
                                                autoComplete="off"
                                                type="email"
                                                value={userData.email || ''}
                                                onChange={(e) => onInputChange('email', e.target.value)}
                                                placeholder="Email" />
                                        </div>}
                                        {(userConfig?.showDob) && <div className="input-wrap-with-label date-picker-wrap">
                                            <div className="input-icon"><FaCalendarAlt /></div>
                                            <DatePicker
                                                selected={userData.dob ? new Date(userData.dob) : null}
                                                onChange={(date) => onInputChange('dob', date)}
                                                customInput={<DatePickerInput from={"Birth date"} />}
                                                peekNextMonth
                                                showMonthDropdown
                                                showYearPicker={false}
                                                showYearDropdown={false}
                                                dropdownMode="select"
                                                dateFormat="MMMM d"
                                            // maxDate={new Date()}
                                            />
                                        </div>}
                                        {(userConfig?.showAnniversaryDate) && <div className="input-wrap-with-label date-picker-wrap">
                                            <div className="input-icon"><BiCalendarHeart /></div>
                                            <DatePicker
                                                selected={userData.anniversaryDate ? new Date(userData.anniversaryDate) : null}
                                                onChange={(date) => onInputChange('anniversaryDate', date)}
                                                customInput={<DatePickerInput from={"Anniversary Date"} />}
                                                peekNextMonth
                                                showMonthDropdown
                                                showYearPicker={false}
                                                showYearDropdown={false}
                                                dropdownMode="select"
                                                dateFormat="MMMM d"
                                            // maxDate={new Date()}
                                            />
                                        </div>}
                                        {(userConfig?.showAddress) && <>
                                            <div className={`input-wrap-with-label ${error.id == 'line' ? 'error' : ''}`} id="line">
                                                {userConfig?.addressMandatory && <div className="label"><span className="mandatory">*</span></div>}
                                                <div className="input-icon"><ImLocation /></div>
                                                <input className={error.id == 'line' ? 'input invalidInput' : 'input'}
                                                    id="line"
                                                    autoComplete="off"
                                                    value={userData?.addressList && userData?.addressList[0]?.line || ''}
                                                    onChange={(e) => onAddressChange(e)}
                                                    placeholder={userConfig?.addressMandatory ? 'Address*' : 'Address'}
                                                />
                                            </div>
                                        </>}
                                        {(userConfig?.showGender) && <div id="gender" className={`input-wrap-with-label ${error.id == 'gender' ? 'error' : ''}`}>
                                            <div className="label"><span className="mandatory">*</span></div>
                                            <div className="input-icon"><FaTransgender /></div>
                                            <div className="radio-input-wrapper">
                                                <div className="radio-input-wrap">
                                                    <input type="radio" id='male' name="gender" checked={userData.gender == 'male'} value={userData.gender || ''} onChange={() => onInputChange('gender', 'male')} />
                                                    <label htmlFor="male" className="cap-text">Male</label>
                                                </div>
                                                <div className="radio-input-wrap">
                                                    <input type="radio" id='female' name="gender" checked={userData.gender == 'female'} value={userData.gender || ''} onChange={() => onInputChange('gender', 'female')} />
                                                    <label htmlFor="female" className="cap-text">Female</label>
                                                </div>
                                            </div>
                                        </div>}

                                        {Boolean(sourcesList.length != 0 && userConfig.showSource) && <div id="source" className={`input-wrap-with-label ${error.id == 'source' ? 'error' : ''}`}>
                                            {/* <div className="label"><span className="mandatory">*</span></div> */}
                                            <div className="input-icon"><VscSourceControl /></div>
                                            <div className="source-input-wrapper">
                                                <div className='input' onClick={(e) => setAnchorEl(e.currentTarget)}>{userData.source ? `Source: ${userData.source}` : 'Select source'}</div>
                                                {Boolean(anchorEl) && renderSourceList()}
                                            </div>
                                        </div>}

                                        <div className='btn-wrap'>
                                            <div className='primary-btn' onClick={proceed}>{fromPage == 'PROFILE' ? 'Update' : 'Sign Up'}</div>
                                        </div>
                                    </div>
                                    {fromPage != 'PROFILE' && <div className='note '>
                                        <span className='signup-note'>Already have an account? <span onClick={() => setShowSignInPage(true)}>Sign in</span></span>
                                    </div>}
                                </div>
                            </>}
                        </div>
                    </div>
                </Backdrop>
            </div>
        </div >
    );
}

export default UserRegistrationModal;

{/* <div className='icon-btn  glass-card'>
    <FacebookLogin
        appId="481057589408437"
        autoLoad={false}
        textButton="Facebook"
        fields="name,email,picture"
        callback={responseFacebook}
        cssClass="facebook-login-btn"
        icon={<FacebookIcon />}
    />
</div>  */}