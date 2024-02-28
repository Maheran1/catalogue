import React, { useState, useEffect } from 'react';
import Header from '@module/header';
import StickyCart from '@module/stickyCart';
import PdpModal from '@module/pdpModal/pdpModal';
import { useSelector } from 'react-redux';
import Footer from '@module/footer';
import { useRouter } from 'next/router';
import ServicePdpModal from '@module/servicePdpModal';
import SliderDialog from '@module/sliderDialog';
import SearchPage from '@template/search';
import { PRODUCT } from '@constant/types';
import MiniHeader from '@module/miniHeader';
import ServicesCartModal from '@module/servicesCartModal';

type Props = {
  children: React.ReactNode,
  enableDefaultLayout: any,
  currentPage: any
};

const Default = ({ children, enableDefaultLayout, currentPage }: Props) => {
  const router = useRouter();
  const state = useSelector((state: any) => state);
  const [showFooter, setShowFooter] = useState(false);
  const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null);

  useEffect(() => {
    if (router) {
      router.beforePopState((state) => {
        state.options.scroll = false;
        return true;
      });
      const currentRouteSTring = ('pagepath' in router.query) ? router.query.pagepath[0] : '';
      setShowFooter(currentRouteSTring.includes('-grp') || (!currentRouteSTring || currentRouteSTring == 'home' || currentRouteSTring == 'orderconfirmation' || currentRouteSTring == 'profile' || currentRouteSTring == 'privacy' || currentRouteSTring == 'terms' || currentRouteSTring == 'myorders' || currentRouteSTring == 'checkout'));
    }
  }, [router])

  useEffect(() => {
    // console.log("Current redux State : ", state)
    if (state.showServicesCartModal) document.body.classList.add("o-h");
    else document.body.classList.remove("o-h")
  }, [state])

  useEffect(() => {
    //set font style
    const currentFont = configData?.storeConfig?.sparkConfig?.fontStyle || "poppins";
    document.body.dataset.font = currentFont;
    document.documentElement.style.setProperty('--primary-font', currentFont, 'important');
  }, [configData])

  return (
    <div className="default clearfix" id="default-wrapper">
      <SliderDialog />
      <ServicePdpModal />
      <PdpModal />
      {state.isItemSearchActive && <SearchPage />}
      {state.showServicesCartModal && <ServicesCartModal />}
      <div className="content clearfix default-wrapper">{children}</div>
      {enableDefaultLayout ? <Header /> : <MiniHeader currentPage={currentPage} />}
      <StickyCart />
      {showFooter && <Footer />}
    </div>
  )
};

export default Default;
