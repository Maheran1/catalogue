import Default from '@layout/Default';
import CategoryPage from '@template/categories/categories';
// import CategoryPage from '@template/categories/verticalCategoryPage';
import { PRODUCT, SERVICE } from '@constant/types';
import { showError } from '@context/actions';
import { syncLocalStorageAppointment } from '@context/actions/appointment';
import HeadMeata from "@module/headMetaTags";
import PdpPage from "@module/pdp/pdp";
import ServicePdpModal from '@module/servicePdpModal';
import { getPromotionByCode, getStoreConfigs, getTenantDataByTenantId } from '@storeData/store';
import Home from '@template/Home';
import Appointment from '@template/appointment';
import CartPage from '@template/cartPage';
import AllCategoryPage from '@template/categories/allCategories';
import CheckoutPage from '@template/checkout';
import FeedbackPage from '@template/feedback';
import InvoicePage from '@template/invoice';
import MembershipInvoicePage from '@template/membershipInvoice';
import OrderHistoryPage from '@template/myorders';
import OrderConfirmation from '@template/orderConfirmation';
import Privacy from '@template/privacy';
import ProfilePage from '@template/profile';
import StoreLocator from '@template/storeLocator';
import Terms from '@template/terms';
import { getMetaTagsData } from '@util/metaTagsService';
import { hex2rgb, parseCookies } from "@util/utils";
import { windowRef } from "@util/window";
import { updateCurrentPage, updateErrorStatus, updateGroupStatus } from "app/redux/actions/common";
import { syncLocalStorageOrder } from "app/redux/actions/order";
import { updateStore } from "app/redux/actions/store";
import { updateUserData } from 'app/redux/actions/user';
import { wrapper } from 'app/redux/store/store';
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { connect, useDispatch } from 'react-redux';

export const getServerSideProps = wrapper.getServerSideProps(async ({ store, req, res, query }) => {
  // console.log(req.headers)
  // const appLink: any = req.headers.referer;
  // const appLink: any = req.headers.referer || `${req.headers.host}${baseRouteUrl}`;
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )
  const host = req.headers.host;
  const storeState = store.getState();
  if (query.store == "images" || query.tenant == "assets") {//when route is inactive store then query is { pagepath: ['bg.png'] ,store: "images" ,tenant: "assets"} 
    const tenantStoreData = { storeMetaData: {}, baseRouteUrl: '', storeData: { configData: {}, categories: [], curatedGroups: [], sliders: [] }, validPagepath: false, validStore: true };
    store.dispatch(updateStore({ ...tenantStoreData }));
    return { props: { storeData: { configData: {}, categories: [], curatedGroups: [], sliders: [] }, activeGroup: '', metaTags: {} } }
  }
  let metaTags: any = null;
  let storeData: any = null;
  let serverError: any = null;
  const tenantQuery: any = query.tenant;
  let tenantId = null;
  if (tenantQuery.includes('-')) {
    const tenantIdArray = tenantQuery.split('-');
    tenantId = tenantIdArray[tenantIdArray.length - 1];
  } else {
    tenantId = tenantQuery.split('-');
    tenantId = tenantQuery[tenantQuery.length - 1];
  }
  const storeQuery: any = query.store;
  const [storeName, storeId = ''] = storeQuery.split('-');
  const baseRouteUrl = `/${tenantQuery}/${storeQuery}/`; //current base url for routing
  // res.setHeader('Set-Cookie', [`baseRouteUrl=${baseRouteUrl}`]);
  const baseApiUrl = `/tenants/stores/tenantstorename/${tenantId}/${storeName}`; //current base url for routing
  const tenantData: any = await getTenantDataByTenantId(tenantId);

  if (tenantData && 'validLicence' in tenantData ? Boolean(tenantData?.validLicence) : true) {
    // get gender from client cookie start
    let groupFromCookie: any = parseCookies(req);
    if (groupFromCookie && groupFromCookie.grp) {
      groupFromCookie = groupFromCookie.grp;
    } else {
      let groups: any = tenantData.groups || 'both';
      groups = groups.split(',');
      groupFromCookie = groups[0];
    }
    // get gender from client cookie end

    //get storedata from api start
    const configBaseApiUrl = `/tenant/${tenantId}/storename/${storeName}`
    if (storeState && !storeState?.storeData && !storeState?.storeData?.storeId) {
      await getStoreConfigs(configBaseApiUrl, baseApiUrl, groupFromCookie).then(async (response: any) => {
        if (response && response.storeData) {
          if ('validLicence' in response.storeMetaData ? Boolean(response?.storeMetaData?.validLicence) : true) {
            if (response.storeData && (response?.configData?.storeConfig?.basicConfig?.catalogue ? true : (Boolean(query?.pagepath?.includes('invoice')) || Boolean(query?.pagepath?.includes('membershipinvoice')) || Boolean(query?.pagepath?.includes('feedback'))))) {
              storeData = response.storeData;
              let { storeMetaData } = response;
              if (!storeMetaData) storeMetaData = {};
              storeData.description = storeMetaData.description;
              storeData.name = storeMetaData.name;
              storeData.host = host;
              storeData.url = storeMetaData.sUrl || '/';
              storeData.baseRouteUrl = baseRouteUrl;
              storeData.configData = response.configData;
              storeData.keywords = tenantData.keywords;
              // storeData.languages = await getLanguages(tenantId, storeData.storeId);
              // console.log("storeData.languages", storeData.languages)
              if (storeData.configData && storeData.configData?.genderConfig == 'both') {
                if (!groupFromCookie) {
                  let groups: any = tenantData.groups || 'both';
                  groups = groups.split(',');
                  groupFromCookie = groups[0];
                }
                storeData.configData.genderConfig = tenantData.groups;
              }
              store.dispatch(updateGroupStatus(groupFromCookie));
              const tenantStoreData = { storeMetaData, baseRouteUrl, storeData, validPagepath: false, validStore: true };

              if (req?.url?.includes('?id')) {
                const promotionData: any = await getPromotionByCode(req.url.split('?id=')[1]);

                if (promotionData) {
                  metaTags = {
                    title: promotionData.title,
                    description: promotionData.description,
                    image: promotionData.image
                  }
                }
              } else {
                if (query.pagepath && query.pagepath.length != 0) {
                  metaTags = await getMetaTagsData(storeMetaData, storeData, query, groupFromCookie);
                  // if (!query.pagepath.includes('feedback')) {
                  // }
                } else {
                  metaTags = await getMetaTagsData(storeMetaData, storeData, query, groupFromCookie);
                }
              }
              if (metaTags && metaTags.title) {
                tenantStoreData.validPagepath = true;
              }
              store.dispatch(updateStore({ ...tenantStoreData }));
            }
          } else {
            serverError = { err: `Invalid Licence` };
            store.dispatch(updateErrorStatus(serverError))
          }
        } else {
          serverError = { err: `getStoreConfigs(${configBaseApiUrl}, ${baseApiUrl}, ${groupFromCookie}) (response && response.storeData) condition failed` };
          store.dispatch(updateErrorStatus(serverError))
        }
      }).catch((err) => {
        serverError = err;
        store.dispatch(updateErrorStatus(serverError))
        console.log(err)
      });

      const propsMetaTags = {
        title: metaTags?.title || '',
        description: metaTags?.description || '',
        image: metaTags?.image || '',
        siteName: metaTags?.siteName || '',
      }
      if (storeData) {
        return {
          props: { storeData, activeGroup: groupFromCookie, metaTags: propsMetaTags },
        };
      } else {
        return {
          redirect: {
            permanent: false,
            destination: "/404"
          }
        }
      }
    }
    //get storedata from api end
  } else {
    return {
      redirect: {
        permanent: false,
        destination: "/404"
      }
    }
  }
})

const PagePath = ({ storeData, store, activeGroup, metaTags }) => {
  return <>
    <HeadMeata {...metaTags} />
    {Boolean(storeData) && <ComponentRenderer storeData={storeData} activeGroup={activeGroup} metaTags={metaTags} />}
  </>
}

const ComponentRenderer = ({ storeData, activeGroup, metaTags }) => {
  const dispatch = useDispatch();
  const [cookie, setCookie] = useCookies();
  const [url_Segment, setUrl_Segment] = useState(null);
  const router = useRouter();
  const [currentPage, setcurrentPage] = useState(null);
  const [currentCategoryType, setCurrentCategoryType] = useState(null);
  const [enableDefaultLayout, setEnableDefaultLayout] = useState(true);//if you dont need default header navigation layout then set enableDefaultLayout to false (refer feedback page case)

  useEffect(() => {
    //detect route change
    if (storeData && storeData.storeId) {
      setEnableDefaultLayout(true);
      if (router.query.pagepath) {
        const isSubSubCat = router.asPath.includes("/sub/");
        let current_page_url: any = router.query.pagepath[0];  //single folder routing
        if (router.query.pagepath?.length && !isSubSubCat) current_page_url = (router.query.pagepath.includes('feedback') || router.query.pagepath.includes('invoice') || router.query.pagepath.includes('membershipinvoice')) ? router.query.pagepath[0] : router.query.pagepath[router.query.pagepath.length - 1];//if appointmentid present then page is feedback
        if (current_page_url.includes('-grp') || current_page_url.includes('home')) { // http://localhost:3000/dev-3/pune/home
          setcurrentPage('home');
        } else if (current_page_url.includes('-pdp')) { // http://localhost:3000/dev-3/pune/cat-m-srp/cat-m-pdp  product or service pdp page
          current_page_url = current_page_url.split('-pdp')[0];
          setcurrentPage('pdp');
          // current_page_url = router.query.pagepath[0]
        } else if (current_page_url.includes('-prp')) { // http://localhost:3000/dev-3/pune/cat-m-prp == product page url
          current_page_url = current_page_url.split('-prp')[0];
          setcurrentPage('all-Categories');
          setCurrentCategoryType(storeData?.keywords[PRODUCT]);
        } else if (current_page_url.includes('-srp')) { // http://localhost:3000/dev-3/pune/cat-m-srp == service page url
          current_page_url = current_page_url.split('-srp')[0];
          setCurrentCategoryType(storeData?.keywords[SERVICE]);
          setcurrentPage('all-Categories');
        } else if (current_page_url.includes('cart')) { // http://localhost:3000/dev-3/pune/cart == cart page url
          current_page_url = current_page_url.split('-srp')[0];
          setEnableDefaultLayout(false);
          setcurrentPage('cart');
        } else if (current_page_url.includes('checkout')) { // http://localhost:3000/dev-3/pune/cart/checkout == checkout page url
          setEnableDefaultLayout(false);
          setcurrentPage('checkout');
        } else if (current_page_url.includes('myorders')) { // http://localhost:3000/dev-3/pune/myorder == myorder page url
          setcurrentPage('myorders');
        } else if (current_page_url.includes('profile')) { // http://localhost:3000/dev-3/pune/profile == profile page url
          setcurrentPage('profile');
        } else if (current_page_url.includes('orderconfirmation')) { // http://localhost:3000/dev-3/pune/orderconfirmation == orderconfirmation page url
          if (router.query.status !== 'paid') {
            dispatch(showError('Your payment has been failed.', 5000));
            setcurrentPage('checkout');  // http://localhost:3000/dev-3/pune/checkout == if payment fail stay to checkout page
          } else {
            setcurrentPage('orderconfirmation');  // http://localhost:3000/dev-3/pune/orderconfirmation == if payment paid redirect to orderConfirmation
          }
        } else if (current_page_url.includes('feedback')) { // http://localhost:3000/dev-3/pune/feedback?id=12345 == feedback page url
          setEnableDefaultLayout(false);
          setcurrentPage('feedback');
        } else if (current_page_url.includes('membershipinvoice')) { // http://localhost:3000/dev-3/pune/membershipinvoice?id=12345 == membershipinvoice page url
          setEnableDefaultLayout(false);
          setcurrentPage('membershipinvoice');
        } else if (current_page_url.includes('invoice')) { // http://localhost:3000/dev-3/pune/invoice?id=12345 == invoice page url
          setEnableDefaultLayout(false);
          setcurrentPage('invoice');
        } else if (current_page_url.includes('privacy')) { // http://localhost:3000/dev-3/pune/privacy == privacy page url
          setcurrentPage('privacy');
        } else if (current_page_url.includes('terms')) { // http://localhost:3000/dev-3/pune/terms == terms page url
          setcurrentPage('terms');
        } else if (current_page_url.includes('search')) { // http://localhost:3000/dev-3/pune/search == search page url
          setcurrentPage('search');
        } else if (current_page_url.includes('appointment')) { // http://localhost:3000/dev-3/pune/appointment == appointment page url
          setEnableDefaultLayout(false);
          setcurrentPage('appointment');
        } else if (current_page_url.includes('store-locator')) { // http://localhost:3000/dev-3/pune/store-locator == appointment page url
          setcurrentPage('storelocator');
        } else {
          setcurrentPage('category'); // http://localhost:3000/dev-3/pune/home == home page url
        }
        current_page_url = current_page_url.split("-").join(" ");
        setUrl_Segment(current_page_url);
      } else { // http://localhost:3000/dev-3/pune/ 
        setcurrentPage('home');
        setUrl_Segment('/');
      }
    }
  }, [router.asPath]);

  useEffect(() => {
    dispatch(updateCurrentPage(currentPage));
  }, [currentPage])

  useEffect(() => {
    if (windowRef) {
      dispatch(syncLocalStorageAppointment());
      dispatch(syncLocalStorageOrder());
      localStorage.setItem(`decimalPlaces`, storeData.configData.decimalPlaces)
      localStorage.setItem(`currencySymbol`, storeData.configData.currencySymbol)
      let color = storeData.configData?.storeConfig?.sparkConfig?.color[activeGroup] || '#fea1c2';
      let textColor = storeData.configData?.storeConfig?.sparkConfig?.textColor ? storeData.configData?.storeConfig?.sparkConfig?.textColor[activeGroup] : '#282828';
      document.documentElement.style.setProperty('--primary-color', hex2rgb(color, ''), 'important');
      document.documentElement.style.setProperty('--primary-text-color', hex2rgb(textColor, ''), 'important');
      document.documentElement.style.setProperty('--primary-color-alpha', hex2rgb(color, 30), 'important');
      document.body.dataset.theme = activeGroup;
    }
  }, [windowRef, storeData])

  useEffect(() => {
    if (cookie['user']) {
      dispatch(updateUserData(cookie['user']));
    }
  }, [cookie])
  return <Default enableDefaultLayout={enableDefaultLayout} currentPage={currentPage}>
    {(storeData && storeData?.storeId) && url_Segment &&
      currentPage == 'home' ? <Home />
      :
      currentPage === 'category' ? <CategoryPage metaTags={metaTags} url_Segment={url_Segment} storeData={storeData} activeGroup={activeGroup} />
        :
        currentPage === 'pdp' ? <PdpPage url_Segment={url_Segment} metaTags={metaTags} storeData={storeData} />
          :
          currentPage === 'all-Categories' ? <AllCategoryPage metaTags={metaTags} url_Segment={url_Segment} storeData={storeData} activeGroup={activeGroup} type={currentCategoryType} />
            :
            currentPage == 'orderconfirmation' ? <OrderConfirmation />
              :
              currentPage == 'privacy' ? <Privacy />
                :
                currentPage == 'myorders' ? <OrderHistoryPage />
                  :
                  currentPage == 'profile' ? <ProfilePage />
                    :
                    currentPage == 'terms' ? <Terms />
                      :
                      currentPage == 'storelocator' ? <StoreLocator storeData={storeData} />
                        :
                        currentPage == 'cart' ? <CartPage />
                          :
                          currentPage == 'checkout' ? <CheckoutPage />
                            :
                            currentPage == 'feedback' ? <FeedbackPage storeData={storeData} metaTags={metaTags} />
                              :
                              currentPage == 'appointment' ?
                                <>
                                  <ServicePdpModal />
                                  <Appointment />
                                </> :
                                currentPage == 'invoice' ? <InvoicePage /> :
                                  currentPage == 'membershipinvoice' ? <MembershipInvoicePage />
                                    : null

    }
  </Default>
}

const mapStateToProps = (state) => {
  return {
    activeGroup: state.activeGroup,
    store: state?.store,
    storeData: state?.store?.storeData
  }
}
export default connect(mapStateToProps)(PagePath);