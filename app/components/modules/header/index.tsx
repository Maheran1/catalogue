import { GENERIC_IMAGE_APP_KEY } from "@constant/common";
import { updateUserData } from "@context/actions/user";
import SvgIcon from "@element/svgIcon";
import { Backdrop } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ConfirmationModal from "@module/confirmationModal";
import PWAPrompt from "@module/pwa";
import SwitchStoreModal from "@module/switchStoreModal";
import UserQueryModal from "@module/userQueryModal";
import UserRegistrationModal from "@module/userRegistration";
import { googleLogout } from "@react-oauth/google";
import { getCurrentReleaseVersion } from "@storeData/common";
import { getItemStockByTenantAndStore } from "@storeData/store";
import { updateUserVisitCount } from "@storeData/user";
import { navigateTo } from "@util/routerService";
import { getMobileOperatingSystem } from "@util/utils";
import { getValueFromCookies } from "@util/webstorage";
import { windowRef } from "@util/window";
import { showSuccess, updateItemStock, updateSearchStatus } from "app/redux/actions";
import Link from "next/link";
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { connect, useDispatch, useSelector } from 'react-redux';

const useStyles = makeStyles({
  list: {
    width: '100%',
  },
  fullList: {
    width: "auto",
  },
});


function FaQuestion(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12,2C6.486,2,2,6.486,2,12v0.714V16v0.143C2,17.167,2.897,18,4,18h1c0.553,0,1-0.448,1-1v-5.143c0-0.552-0.447-1-1-1 H4.092C4.648,6.987,7.978,4,12,4s7.352,2.987,7.908,6.857H19c-0.553,0-1,0.448-1,1V16v1v1c0,1.103-0.897,2-2,2h-2v-1h-4v3h2h2h2 c2.206,0,4-1.794,4-4c1.103,0,2-0.833,2-1.857V16v-3.286V12C22,6.486,17.514,2,12,2z"></path></svg>
}

function BiHomeSmile(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M3,13h1v2v5c0,1.103,0.897,2,2,2h12c1.103,0,2-0.897,2-2v-5v-2h1c0.404,0,0.77-0.244,0.924-0.617 c0.155-0.374,0.069-0.804-0.217-1.09l-9-9c-0.391-0.391-1.023-0.391-1.414,0l-9,9c-0.286,0.286-0.372,0.716-0.217,1.09 C2.23,12.756,2.596,13,3,13z M12,4.414l6,6V15l0,0l0.001,5H6v-5v-3v-1.586L12,4.414z" /><path d="M12,18c3.703,0,4.901-3.539,4.95-3.689l-1.9-0.621C15.042,13.713,14.269,16,12,16c-2.238,0-3.02-2.221-3.051-2.316 L7.05,14.311C7.099,14.461,8.297,18,12,18z" /></svg>;
}

function FaTasks(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 600 600" height="1em" width="1em" {...props}><path d="M139.61 35.5a12 12 0 0 0-17 0L58.93 98.81l-22.7-22.12a12 12 0 0 0-17 0L3.53 92.41a12 12 0 0 0 0 17l47.59 47.4a12.78 12.78 0 0 0 17.61 0l15.59-15.62L156.52 69a12.09 12.09 0 0 0 .09-17zm0 159.19a12 12 0 0 0-17 0l-63.68 63.72-22.7-22.1a12 12 0 0 0-17 0L3.53 252a12 12 0 0 0 0 17L51 316.5a12.77 12.77 0 0 0 17.6 0l15.7-15.69 72.2-72.22a12 12 0 0 0 .09-16.9zM64 368c-26.49 0-48.59 21.5-48.59 48S37.53 464 64 464a48 48 0 0 0 0-96zm432 16H208a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H208a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H208a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h288a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z" /></svg>;
}

function BsPerson(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0.4} viewBox="0 0 16 16" height="1em" width="1em" {...props}><path fillRule="evenodd" d="M13 14s1 0 1-1-1-4-6-4-6 3-6 4 1 1 1 1h10zm-9.995-.944v-.002.002zM3.022 13h9.956a.274.274 0 00.014-.002l.008-.002c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664a1.05 1.05 0 00.022.004zm9.974.056v-.002.002zM8 7a2 2 0 100-4 2 2 0 000 4zm3-2a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" /></svg>;
}

function BiTask(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M5,22h14c1.103,0,2-0.897,2-2V5c0-1.103-0.897-2-2-2h-2c0-0.553-0.447-1-1-1H8C7.447,2,7,2.447,7,3H5C3.897,3,3,3.897,3,5 v15C3,21.103,3.897,22,5,22z M5,5h2v2h10V5h2v15H5V5z" /><path d="M11 13.586L9.207 11.793 7.793 13.207 11 16.414 16.207 11.207 14.793 9.793z" /></svg>;
}

function BiLogIn(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M13 16L18 12 13 8 13 11 4 11 4 13 13 13z" /><path d="M20,3h-9C9.897,3,9,3.897,9,5v4h2V5h9v14h-9v-4H9v4c0,1.103,0.897,2,2,2h9c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z" /></svg>;
}

function BiCookie(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M21.598,11.064c-0.243-0.184-0.557-0.247-0.854-0.172C20.458,10.966,20.222,11,20,11c-1.654,0-3-1.346-3.003-2.937 c0.005-0.034,0.016-0.136,0.017-0.17c0.013-0.317-0.126-0.621-0.373-0.819c-0.248-0.199-0.575-0.271-0.881-0.187 C15.467,6.964,15.226,7,15,7c-1.654,0-3-1.346-3-3c0-0.217,0.031-0.444,0.099-0.716c0.078-0.315-0.002-0.648-0.214-0.894 c-0.211-0.245-0.518-0.369-0.853-0.342C5.883,2.544,2,6.822,2,12c0,5.514,4.486,10,10,10s10-4.486,10-10 c0-0.049-0.003-0.097-0.007-0.16C21.986,11.535,21.841,11.249,21.598,11.064z M12,20c-4.411,0-8-3.589-8-8 c0-3.723,2.509-6.864,6.006-7.75C10.137,6.892,12.327,9,15,9c0.033,0,0.066,0,0.101-0.001c0.46,2.26,2.449,3.971,4.837,4 C19.444,16.941,16.073,20,12,20z" /><circle cx={12.5} cy={11.5} r={1.5} /><circle cx={8.5} cy={8.5} r={1.5} /><circle cx={7.5} cy={12.5} r={1.5} /><circle cx={15.5} cy={15.5} r={1.5} /><circle cx={10.5} cy={16.5} r={1.5} /></svg>;
}

function BiListCheck(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 19 19" height="1em" width="1em" {...props}><path d="M4 7H15V9H4zM4 11H15V13H4zM4 15H11V17H4zM19.299 12.292L14.999 16.583 13.707 15.292 12.293 16.707 14.999 19.411 20.711 13.708z" /></svg>;
}

function GoLocation(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0.4} viewBox="0 0 12 16" height="1em" width="1em" {...props}><path d="M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6 0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56 1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z" /></svg>;
}

function BiLogOut(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M16 13L16 11 7 11 7 8 2 12 7 16 7 13z" /><path d="M20,3h-9C9.897,3,9,3.897,9,5v4h2V5h9v14h-9v-4H9v4c0,1.103,0.897,2,2,2h9c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z" /></svg>;
}

function BiDownload(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M12 16L16 11 13 11 13 4 11 4 11 11 8 11z" /><path d="M20,18H4v-7H2v7c0,1.103,0.897,2,2,2h16c1.103,0,2-0.897,2-2v-7h-2V18z" /></svg>;
}

function GrContact(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path fill="none" stroke="#000" strokeWidth={2} d="M1,2 L22,2 L22,18 L14,18 L6,22 L6,18 L1,18 L1,2 Z M6,10 L7,10 L7,11 L6,11 L6,10 Z M11,10 L12,10 L12,11 L11,11 L11,10 Z M16,10 L17,10 L17,11 L16,11 L16,10 Z" /></svg>;
}

function BsExclamationSquare(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 16 16" height="1em" width="1em" {...props}><path fillRule="evenodd" d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z" clipRule="evenodd" /><path d="M7.002 11a1 1 0 112 0 1 1 0 01-2 0zM7.1 4.995a.905.905 0 111.8 0l-.35 3.507a.552.552 0 01-1.1 0L7.1 4.995z" /></svg>;
}

function BiSearchAlt(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M10,18c1.846,0,3.543-0.635,4.897-1.688l4.396,4.396l1.414-1.414l-4.396-4.396C17.365,13.543,18,11.846,18,10 c0-4.411-3.589-8-8-8s-8,3.589-8,8S5.589,18,10,18z M10,4c3.309,0,6,2.691,6,6s-2.691,6-6,6s-6-2.691-6-6S6.691,4,10,4z" /><path d="M11.412,8.586C11.791,8.966,12,9.468,12,10h2c0-1.065-0.416-2.069-1.174-2.828c-1.514-1.512-4.139-1.512-5.652,0 l1.412,1.416C9.346,7.83,10.656,7.832,11.412,8.586z" /></svg>;
}

function BiPhone(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M17.707,12.293c-0.391-0.391-1.023-0.391-1.414,0l-1.594,1.594c-0.739-0.22-2.118-0.72-2.992-1.594 s-1.374-2.253-1.594-2.992l1.594-1.594c0.391-0.391,0.391-1.023,0-1.414l-4-4c-0.391-0.391-1.023-0.391-1.414,0L3.581,5.005 c-0.38,0.38-0.594,0.902-0.586,1.435c0.023,1.424,0.4,6.37,4.298,10.268s8.844,4.274,10.269,4.298c0.005,0,0.023,0,0.028,0 c0.528,0,1.027-0.208,1.405-0.586l2.712-2.712c0.391-0.391,0.391-1.023,0-1.414L17.707,12.293z M17.58,19.005 c-1.248-0.021-5.518-0.356-8.873-3.712c-3.366-3.366-3.692-7.651-3.712-8.874L7,4.414L9.586,7L8.293,8.293 C8.054,8.531,7.952,8.875,8.021,9.205c0.024,0.115,0.611,2.842,2.271,4.502s4.387,2.247,4.502,2.271 c0.333,0.071,0.674-0.032,0.912-0.271L17,14.414L19.586,17L17.58,19.005z" /></svg>;
}

function CgMenuRightAlt(props) {
  return <svg stroke="currentColor" fill="none" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M4 6C4 5.44772 4.44772 5 5 5H19C19.5523 5 20 5.44772 20 6C20 6.55228 19.5523 7 19 7H5C4.44772 7 4 6.55228 4 6Z" fill="currentColor" /><path d="M4 18C4 17.4477 4.44772 17 5 17H19C19.5523 17 20 17.4477 20 18C20 18.5523 19.5523 19 19 19H5C4.44772 19 4 18.5523 4 18Z" fill="currentColor" /><path d="M11 11C10.4477 11 10 11.4477 10 12C10 12.5523 10.4477 13 11 13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H11Z" fill="currentColor" /></svg>;
}

function HiSwitchHorizontal(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 20 20" height="1em" width="1em" {...props}><path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" /></svg>;
}

function MainHeader({ storeData, storeMetaData }) {
  const [cookie, setCookie] = useCookies()
  const [openDrawer, setOpenDrawer] = useState(false);
  const dispatch = useDispatch();
  const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
  const pdpItem = useSelector((state: any) => state.pdpItem);
  const storesList = useSelector((state: any) => state.storesList);
  const router = useRouter();
  const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null);
  const [showUserRegModalOnFirstLoad, setShowUserRegModalOnFirstLoad] = useState(configData?.storeConfig?.sparkConfig?.userConfig?.userRegPopupReq);
  const [openUserRegistrationModalOnBtnClick, setOpenUserRegistrationModalOnBtnClick] = useState(true);
  const [userData, setUserData] = useState(cookie['user']);
  const [showlogoutPopup, setShowLogoutPopup] = useState(false);
  const cartItems = useSelector((state: any) => state.orderItems);
  const [cartItemQuantity, setCartItemQuantity] = useState(0);
  const genericImages = useSelector((state: any) => state.genericImages);
  const [currentPageName, setCurrentPageName] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [installAppModal, setInstallAppModal] = useState<any>({ isInstalled: true, promptEvent: null })
  const drawerRef = useRef(null);
  const [currentReleaseVersion, setcurrentReleaseVersion] = useState<any>({})
  const [queryModal, setQueryModal] = useState(false)
  const [switchStoreModal, setSwitchStoreModal] = useState(false)
  const keywords = storeData.keywords;

  // Router.events.on('routeChangeComplete', () => {
  //   if (pdpItem) {
  //     document.body.classList.remove("o-h")
  //     dispatch(updatePdpItem(null));//remove pdp from ui after back button press transition done
  //   }
  // });

  useEffect(() => {
    if (openDrawer) document.body.classList.add("o-h")
    else document.body.classList.remove("o-h")
  }, [openDrawer])

  const onOutsideClick = (event: any) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      toggleDrawer();
    }
  }

  const toggleDrawer = () => {
    if (!openDrawer) {
      setOpenUserRegistrationModalOnBtnClick(false);
      setShowUserRegModalOnFirstLoad(false);
    }
    setOpenDrawer(openDrawer ? false : true);
  };

  const onClickNavItem = (navItem: any) => {
    switch (navItem.route) {
      case 'login':
        setOpenUserRegistrationModalOnBtnClick(true);
        break;
      case 'logout':
        setShowLogoutPopup(true)
        break;
      case 'install-app':
        if (installAppModal.promptEvent) {
          handlePromptClose(true);
        } else setShowPrompt(true);
        break;
      case 'phone':
        window.open(`tel:+${storeMetaData?.countryCode} ${storeMetaData?.phone1}`, '_blanck')
        break;
      default:
        navigateTo(navItem.route);
        // router.push({ pathname: baseRouteUrl + navItem.route }, '', { shallow: true })
        break;
    }
    setOpenDrawer(false);
  }

  const renderNav = () => {
    const NAV_LIST = [
      {
        title: 'Home',
        route: 'home',
        icon: <BiHomeSmile />,
        isVisible: true
      },
      {
        title: 'Order History',
        route: 'myorders',
        icon: <FaTasks />,
        isVisible: userData ? true : false
      },
      {
        title: 'Profile',
        route: 'profile',
        icon: <BsPerson />,
        isVisible: userData ? true : false
      },
      {
        title: 'Privacy Policy',
        route: 'privacy',
        icon: <BiTask />,
        isVisible: !(configData?.storeConfig?.sparkConfig?.hidePrivacyPage)
      },
      {
        title: 'Terms & conditions',
        route: 'terms',
        icon: <BiListCheck />,
        isVisible: !(configData?.storeConfig?.sparkConfig?.hideTermsPage)
      }, {
        title: 'Cookie policy',
        route: 'cookie-policy',
        icon: <BiCookie />,
        isVisible: false
      }, {
        title: 'Contact Us',
        route: 'contact-us',
        icon: <GrContact />,
        isVisible: false
      }, {
        title: 'About Us',
        route: 'about-us',
        icon: <BsExclamationSquare />,
        isVisible: false
      }, {
        title: 'Store Locator',
        route: 'store-locator',
        icon: <GoLocation />,
        isVisible: configData.showStoreLocator || false
      }, {
        title: 'Install App',
        route: 'install-app',
        icon: <BiDownload />,
        isVisible: !installAppModal.isInstalled && storeData?.configData?.storeConfig?.manifestConfig
      }, {
        title: 'Login',
        route: 'login',
        icon: <BiLogIn />,
        isVisible: !userData
      }, {
        title: 'Logout',
        route: 'logout',
        icon: <BiLogOut />,
        isVisible: !!userData
      }
    ];
    return (<div>
      {NAV_LIST.map((navItem) => (
        <React.Fragment key={Math.random()}>
          {navItem.isVisible &&
            <div key={Math.random()} className="nav-wrap" onClick={() => onClickNavItem(navItem)}>
              <div className="nav-icon">{navItem.icon}</div>
              <div className="nav-text">{navItem.title}</div>
            </div>}
        </React.Fragment>
      ))}
      <React.Fragment key={Math.random()}>
        {(storesList.length > 1 && Boolean(configData?.storeConfig?.sparkConfig?.showBranchSelection)) &&
          <div key={Math.random()} className="nav-wrap" onClick={() => setSwitchStoreModal(true)}>
            <div className="nav-icon"> <HiSwitchHorizontal /></div>
            <div className="nav-text cap-text">Change {Boolean(keywords?.branch) || "Store"}</div>
          </div>}
      </React.Fragment>
    </div >)

  }

  useEffect(() => {
    if (windowRef) {
      console.log('beforeinstallprompt')
      window.addEventListener('beforeinstallprompt', (event: any) => {
        if (!installAppModal.promptEvent) {
          console.log('inside beforeinstallprompt')
          event.preventDefault();
          setInstallAppModal({ ...installAppModal, promptEvent: event, isInstalled: false });
          console.log('android display')
        }
      });
    }
    // if (baseRouteUrl && windowRef && windowRef().location) {
    // updateManifestFile(storeData);
    // }
  }, [baseRouteUrl, windowRef]);


  useEffect(() => {
    if (windowRef) {
      // enable pwa
      // if (getMobileOperatingSystem() == 'IOS') {
      //   const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator['standalone']);
      //   if (!isInStandaloneMode) {
      //     console.log('IOS display', getMobileOperatingSystem())
      //     setInstallAppModal({ ...installAppModal, isInstalled: false })
      //   }
      // }
      // window.addEventListener('appinstalled', () => {
      //   disableInstallation();
      //   console.log('PWA was installed');
      // });
      // if (window && window.navigator && window.navigator['standalone']) {
      //   disableInstallation();
      //   console.log("Launched: Installed (IOS)")
      // } else if (window.matchMedia("(display-mode: standalone)").matches) {
      //   disableInstallation();
      //   console.log("Launched: Installed")
      // } else {
      //   console.log("Launched: Browser Tab")
      // }
      // enable pwa

      //get current release version details
      getCurrentReleaseVersion().then((res: any) => setcurrentReleaseVersion(res.data)).catch(() => { })

      if (configData?.orderingOn && !configData?.storeOff && !configData?.readOnlyMenu && configData?.storeConfig?.basicConfig?.inventory) {
        getItemStockByTenantAndStore(storeData.tenantId, storeData.storeId).then((itemStockRes) => {
          if (itemStockRes) dispatch(updateItemStock(itemStockRes));
        })
      }
    }

  }, [windowRef])

  const handlePromptClose = async (status: any) => {
    if (status && installAppModal.promptEvent) {
      // Show the install prompt
      installAppModal.promptEvent.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await installAppModal.promptEvent.userChoice;
      installAppModal.promptEvent.preventDefault();
      setShowPrompt(false);
      if (outcome == 'accepted') setInstallAppModal({ ...installAppModal, isInstalled: true })
      // Optionally, send analytics event with outcome of user choice
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
    }
    setShowPrompt(false);
  }


  useEffect(() => {
    setTimeout(() => {
      if ((!installAppModal.isInstalled || installAppModal.promptEvent) || getMobileOperatingSystem() == 'IOS') {
        if ((window && window.navigator && window.navigator['standalone']) || (window.matchMedia("(display-mode: standalone)").matches)) {
          setInstallAppModal({ ...installAppModal, isInstalled: true });
        } else {
          setInstallAppModal({ ...installAppModal, isInstalled: false });
        }
        // setShowPrompt(true);
      } else {
        // navigator.serviceWorker.getRegistration(window.location.origin).then((registrations) => {
        //   console.log(registrations)
        // });
        setInstallAppModal({ ...installAppModal, isInstalled: false });
      }
    }, 50000);
  }, [])

  useEffect(() => {
    if (cookie['grp']) {
      document.body.dataset.theme = cookie['grp'];
    }
  }, [])

  useEffect(() => {
    if (cookie['user'] && cookie['user'].mobileNo) {
      setUserData(cookie['user'])
    } else setUserData(null)
  }, [cookie, openDrawer])

  useEffect(() => {
    let currentRouteSTring = ('pagepath' in router.query) ? router.query.pagepath[0] : '';
    if (currentRouteSTring.includes('grp')) currentRouteSTring = 'home';
    if (!currentRouteSTring || currentRouteSTring == 'home' || currentRouteSTring == 'orderconfirmation' || currentRouteSTring == 'profile' || currentRouteSTring == 'privacy' || currentRouteSTring == 'terms' || currentRouteSTring == 'myorders' || currentRouteSTring == 'checkout') {
      setCurrentPageName(currentRouteSTring)
    } else setCurrentPageName('categories')
    setUserCount();
  }, [router])


  useEffect(() => {
    if (cartItems && cartItems.length && windowRef) {
      let qty = 0;
      cartItems.map((cartItem) => qty += cartItem.quantity)
      if (cartItemQuantity != qty) {
        setCartItemQuantity(qty);
        let element = document.getElementById('cart-item-count')
        if (element) {
          element.classList.add("shake")
          setTimeout(() => {
            element.classList.remove("shake")
          }, 1000);
        }
      }
    }
  }, [cartItems])

  useEffect(() => {
    //set app bg when gender change (so genericImages changes)
    let defaultWrapper = document.getElementById('default-wrapper');
    defaultWrapper && genericImages[GENERIC_IMAGE_APP_KEY] && (defaultWrapper.style.backgroundImage = `url(/assets/${genericImages[GENERIC_IMAGE_APP_KEY]})`)
  }, [genericImages])

  const onLoginClose = (user) => {
    setUserData(user);
    setOpenUserRegistrationModalOnBtnClick(false);
    setShowUserRegModalOnFirstLoad(false);
    setUserCount();
    (user && openUserRegistrationModalOnBtnClick) && dispatch(showSuccess('Login successfully'))
  }

  const handleLogoutModalResponse = (status) => {
    if (status) {
      setCookie("user", {}, { //user registration fields
        path: "/",
        expires: new Date(new Date().setSeconds(1)),
        sameSite: true,
      })
      setCookie('lvt', new Date(), { //registration-screen-time
        path: '/',
        expires: new Date(),
        sameSite: true,
      })
      setUserData(null);
      dispatch(updateUserData(null));
      dispatch(showSuccess('Logout successfully'));
      googleLogout();
      navigateTo('home')
    }
    setShowLogoutPopup(false);
  }

  const openSearchPage = () => {
    dispatch(updateSearchStatus(true));
  }

  const setUserCount = () => {
    let user: any = getValueFromCookies("user");
    if (user) {
      const lastVisitTime = getValueFromCookies("lvt");
      if (!lastVisitTime) {
        user = JSON.parse(user);
        updateUserVisitCount(user.id).then(() => {
          setCookie("lvt", new Date(), { //registration-screen-time
            path: "/",
            expires: new Date(new Date().setMinutes(new Date().getMinutes() + 5)),
            sameSite: true,
          })
        }).catch(function (error) {
          console.log(`Error = ${process.env.NEXT_PUBLIC_CUSTOMER}/updateaddress=>`, error);
        });
      }
    }
  }

  const toggleQueryModal = () => {
    setQueryModal(!queryModal)
  }

  return (
    <>
      <div className="mainheaderblock">
        {currentPageName != 'categories' ? <div className="logo">
          <Link href={baseRouteUrl + 'home'} shallow={true}>
            <img
              src={storeMetaData ? storeMetaData?.logoPath : 'https://pcs-s3.s3.ap-south-1.amazonaws.com/2/logo/2022-09-16T10%3A06%3A23.774113_slider.png'}
              title="logo"
              alt="logo"
            />
          </Link>
        </div> :
          <>
            <div className="logo back-navigation">
              <div className="" onClick={() => router.back()}>
                <SvgIcon icon="backArrow" shape="circle" width={40} height={40} padding="8px" />
              </div>
              <Link href={baseRouteUrl + 'home'} shallow={true}>
                <div className="">
                  <SvgIcon icon="home" shape="circle" width={40} height={40} padding="8px" margin="0 0 0 8px" />
                </div>
              </Link>
            </div>
          </>
        }

        <div className="header-nav-wrap">

          {configData?.storeConfig?.sparkConfig?.showEnquiry && <div className="icon-wrap" onClick={toggleQueryModal}>
            <div className="icon " style={{ padding: 4 }}><FaQuestion /></div>
          </div>}

          <div className="icon-wrap" onClick={openSearchPage}>
            <div className="icon "><BiSearchAlt /></div>
          </div>

          <div className="icon-wrap" >
            <a href={`tel:+${storeMetaData?.countryCode} ${storeMetaData?.phone1}`}>
              <div className="icon "><BiPhone /></div>
            </a>
          </div>

          {(configData?.orderingOn && !configData?.storeOff && !configData?.readOnlyMenu) &&
            <div className="icon-wrap cart-icon" onClick={() => onClickNavItem({ route: 'cart' })}>
              {(cartItems && cartItems.length != 0) && <div className="cart-item-count" id="cart-item-count">{cartItemQuantity}</div>}
              <div className="icon "><SvgIcon icon="cart" color="#3d3838" /></div>
            </div>}

          <div className="icon-wrap" onClick={toggleDrawer}>
            <div className="icon "><CgMenuRightAlt /></div>
          </div>
        </div>

        {openDrawer && <Backdrop
          className=" navigation-drawer-backdrop-modal-wrapper"
          style={{ height: '100vh', width: `${openDrawer ? '100%' : '0'}` }}
          onClick={onOutsideClick}
          open={openDrawer ? true : false}
        >
          <div className="navigation-drawer-backdrop backdrop-modal-content"
            style={{ width: `${openDrawer ? '70%' : '0'}` }}
            ref={drawerRef}
          >
            <section className="drawer-wrap">
              <div className="drawclose" onClick={toggleDrawer}>
                <SvgIcon icon="closeLarge" />
              </div>
              <div className="drawgraphic">
                <div className="drawer-display-img">
                  <img src={storeMetaData ? storeMetaData?.logoPath : 'https://pcs-s3.s3.ap-south-1.amazonaws.com/2/logo/2022-09-16T10%3A06%3A23.774113_slider.png'} />
                </div>
              </div>
              <div>
                {userData &&
                  <div className="user-details">
                    <div className="name">{userData.firstName}</div>
                    <div className="number">{userData ? userData.mobileNo : ''}</div>
                  </div>}

                <div className="drawmenu"> {renderNav()}</div>
                <div className="powered-by" onClick={() => window.open('https://respark.in/', '_blank')}>
                  {Boolean(currentReleaseVersion?.version) && <span>You're on Version <span>{currentReleaseVersion?.version}</span></span>}
                  <span>Powered by <span>Respark</span></span>
                </div>
              </div>
            </section>
          </div>
        </Backdrop>}
      </div >
      <SwitchStoreModal storeData={storeData} openModal={switchStoreModal} handleClose={() => setSwitchStoreModal(false)} storesList={storesList} />

      <UserRegistrationModal
        fromPage={(!userData?.mobileNo && (openUserRegistrationModalOnBtnClick || showUserRegModalOnFirstLoad) && windowRef && !pdpItem) ? showUserRegModalOnFirstLoad ? "INITIAL_LOAD" : 'HOME' : ''}
        handleResponse={(e) => onLoginClose(e)}
        isApppGrpChangeOnUserGdrChange={showUserRegModalOnFirstLoad ? true : false}
        open={userData?.mobileNo ? false : (openUserRegistrationModalOnBtnClick || showUserRegModalOnFirstLoad) && (windowRef && !pdpItem)}
        heading={configData?.storeConfig?.sparkConfig?.userConfig?.popupHeading ? (configData?.storeConfig?.sparkConfig?.userConfig?.popupHeading) : 'We will use your information to send offers and promotions'} />

      <ConfirmationModal
        openModal={showlogoutPopup}
        title={'Logout confirmation'}
        message={'Are you sure you want to logout?'}
        buttonText={'No'}
        secondaryButtonText={'Yes'}
        handleClose={(status) => handleLogoutModalResponse(status)}
      />
      <PWAPrompt
        promptEvent={installAppModal.promptEvent}
        type={getMobileOperatingSystem()}
        showPrompt={showPrompt}
        handlePromptClose={(e: any) => handlePromptClose(e)} />

      <UserQueryModal
        openModal={queryModal}
        handleClose={() => toggleQueryModal()}
      />
    </>
  );
}
const mapStateToProps = (state) => {
  return {
    storeData: state?.store?.storeData,
    storeMetaData: state?.store?.storeMetaData
  }
}

export default connect(mapStateToProps)(MainHeader);
