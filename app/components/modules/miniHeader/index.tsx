import React, { } from "react";
import { connect } from 'react-redux';
import router from 'next/router';
import SvgIcon from "@element/svgIcon";
import { useSelector } from 'react-redux';
import { navigateTo } from "@util/routerService";

function MiniHeader({ currentPage }) {
  const currentPageStatus = useSelector((state: any) => state.currentPage);
  const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
  const { configData } = useSelector((state: any) => state.store.storeData);

  const onBackClick = () => {
    if (currentPageStatus == 'orderconfirmation' || currentPageStatus == "invoice" || currentPageStatus == "membershipinvoice") navigateTo('home')
    else router.back();
  }
  return (
    <>
      <div className="mainheaderblock mini-header-wrap">
        {Boolean(configData?.storeConfig?.basicConfig?.catalogue) && <div onClick={onBackClick} className="logo back-navigation">
          <SvgIcon icon="backArrow" shape="circle" width={32} height={32} margin="0 0 0 5px" />
        </div>}
        <div className="heading">
          {currentPage == 'cart' ? "Cart Details" :
            currentPage == 'checkout' ? "Order details" :
              currentPage == 'invoice' ? "Order Invoice" :
                currentPage == 'membershipinvoice' ? "Membership Invoice" :
                  currentPage == 'appointment' ? "Appointment Details" :
                    ''}
        </div>
      </div>
    </>
  );
}

export default MiniHeader;
