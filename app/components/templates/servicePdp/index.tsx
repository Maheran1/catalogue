/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { PDP_NO_IMAGE } from "@constant/noImage";
import ImageSlider from "@element/imageSlider";
import HeadMetaTags from "@module/headMetaTags";
import router from "next/router";
import { useSelector } from 'react-redux';
import SvgIcon from "@element/svgIcon";

function ServicePdp({ item, activeGroup }) {

  const [showLongDescription, setShowLongDescription] = useState(false);
  const shortDescription = item.description ? item.description?.substring(0, 110) : '';
  const alreadyShortDescription = item.description <= item?.description?.substring(0, 110);
  const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
  const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null);

  // let catName: any = ('pagepath' in router.query) ? router.query.pagepath[0].split("-") : '';
  // catName.pop();
  // catName = catName.join(" ")
  return (
    <div className="servicepdpcontainer">
      <div className="modal-close" onClick={() => router.back()}>
        <SvgIcon icon="close" />
      </div>
      <HeadMetaTags title={item.name} description={item.description} image="" siteName='' storeData='' />
      <div className="prodpdpbanner">
        <ImageSlider itemsList={item.imagePaths} config={{ redirection: false }} no_image={PDP_NO_IMAGE} />
      </div>
      <div className="serv-pdp-details">
        {/* <div className="serv-pdp-servname">{catName}</div> */}
        <div className="serv-pdp-servtype">
          <div className="serv-pdp-servtypename">{item.name}</div>
          {item.duration !== 0 && <div className="serv-pdp-servtypetime">
            <SvgIcon icon="timer" />
            {item.duration} {item.durationType}
          </div>}
        </div>
        {item.description && <>
          {alreadyShortDescription && <>
            <div className="serv-pdp-servtypedesc">{item.description}</div>
          </>}
          {!alreadyShortDescription && <>
            {showLongDescription && <div className="serv-pdp-servtypedesc" onClick={() => setShowLongDescription(false)}>
              {item.description}
              <span>Read Less</span>
            </div>}
            {!showLongDescription && <div className="serv-pdp-servtypedesc" onClick={() => setShowLongDescription(true)}>
              {shortDescription}...
              <span >Read More</span>
            </div>}
          </>}
        </>}
        {item.variations && item.variations?.length !== 0 ? <div className="variations-wrap">
          {item.variations?.map((variant, variantIndex) => {    //weekdays/weekends
            if (('showOnUi' in variant) ? variant.showOnUi : true) {
              return <div key={variantIndex}>
                <div className="serv-pdp-servoffertitle">On {variant.name}</div>
                {variant.price > 0 && <div className="serv-pdp-servofferforpr">{configData.currencySymbol} {variant.price}</div>}
                {variant.variations && variant.variations?.length !== 0 && variant.variations?.map((subVariant, subVariantIndex) => {    //male/female
                  if (('showOnUi' in subVariant) ? subVariant.showOnUi : true) {
                    return <div key={subVariantIndex}>
                      {activeGroup == 'both' && subVariant.price <= 0 && <div className="serv-pdp-servofferfor">
                        <div className="serv-pdp-servofferfornm highlight">{subVariant.name}</div>
                      </div>}
                      {subVariant.price > 0 && <div className="serv-pdp-servofferfor">
                        {subVariant.name && <div className="serv-pdp-servofferfornm">{subVariant.name}</div>}
                        <div className="serv-pdp-servofferforpr">{configData.currencySymbol} {subVariant.price}</div>
                      </div>}
                      {subVariant.variations && subVariant.variations?.length !== 0 && subVariant?.variations?.map((subSubVariant, subSubVariantIndex) => {    //adult/kid
                        if (('showOnUi' in subSubVariant) ? subSubVariant.showOnUi : true) {
                          return <div className="serv-pdp-servofferfor" key={subSubVariantIndex}>
                            {subSubVariant.name && <div className="serv-pdp-servofferfornm">{subSubVariant.name}</div>}
                            {subSubVariant.price && <div className="serv-pdp-servofferforpr">{configData.currencySymbol} {subSubVariant.price}</div>}
                          </div>
                        }
                      })}
                    </div>
                  }
                })}
              </div>
            }
          })}
        </div> :
          <div className="serv-pdp-servofferforpr">{configData.currencySymbol} {item.price}</div>
        }
        <div className="common-15height"></div>
        {/* <div className="common-grey-boder"></div>
        <div className="common-15height"></div> */}
        {/* <div className="serv-pdp-servcombotitle">
          Combo available with this service
        </div>
        <div className="serv-pdp-servcombofor">
          <div className="serv-pdp-servcombofornm">
            Blow Dry <span>Upto Shoulder</span> + Flat Iron
            <span> Upto Shoulder</span>
          </div>
          <div className="serv-pdp-servcomboforpr">700</div>
        </div>
        <div className="serv-pdp-servcombofor">
          <div className="serv-pdp-servcombofornm">
            Blow Dry <span>Upto Shoulder</span> + Flat Iron
            <span> Upto Shoulder</span>
          </div>
          <div className="serv-pdp-servcomboforpr">700</div>
        </div> */}
      </div>
    </div>
  );
}

export default ServicePdp;
