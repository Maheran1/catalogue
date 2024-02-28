/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useState } from 'react';
import { SQUARE_GRID, CIRCULAR_GRID, HORIZONTAL_SQUARE, LARGE_BANNER, SAMLL_BANNER, SQUARE_BANNER } from "@constant/layout";
import { BANNER_NO_IMAGE, SMALL_SLIDER_NO_IMAGE, LARGE_SLIDER_NO_IMAGE, SUB_CAT_NO_IMAGE } from '@constant/noImage';
import ImageSlider from "@element/imageSlider";
import CircularGrid from "@module/circularGrid";
import SquareGrid from "@module/squareGrid";
import HorizontalSquareGrid from '@module/horizontalSquareGrid';
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateStoreData, updateGroupStatus, showSuccess, updateGenericImages } from "app/redux/actions";
import { prepareStoreData } from "@util/dataFilterService";
import { useSelector } from 'react-redux';
import { useCookies } from "react-cookie";
import ProductsWithCategory from '@module/productsWithCategory';
import { PRODUCT, SERVICE } from '@constant/types';
import Link from 'next/link';
import { getGenericImages, hex2rgb } from '@util/utils';
import { windowRef } from '@util/window';
import { navigateTo } from '@util/routerService';

function BiMaleSign(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M20,11V4h-7l2.793,2.793l-4.322,4.322C10.49,10.416,9.294,10,8,10c-3.309,0-6,2.691-6,6s2.691,6,6,6s6-2.691,6-6 c0-1.294-0.416-2.49-1.115-3.471l4.322-4.322L20,11z M8,20c-2.206,0-4-1.794-4-4s1.794-4,4-4s4,1.794,4,4S10.206,20,8,20z" /></svg>;
}
function BiFemaleSign(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M12,2C8.691,2,6,4.691,6,8c0,2.967,2.167,5.432,5,5.91V17H8v2h3v2.988h2V19h3v-2h-3v-3.09c2.833-0.479,5-2.943,5-5.91 C18,4.691,15.309,2,12,2z M12,12c-2.206,0-4-1.794-4-4s1.794-4,4-4c2.206,0,4,1.794,4,4S14.206,12,12,12z" /></svg>;
}

function HomePage({ storeData, activeGroup, storeMetaData }) {
  const [cookie, setCookie] = useCookies(['grp'])
  const dispatch = useDispatch();
  let availableGroups = storeData?.configData?.genderConfig || '';
  availableGroups = availableGroups.split(',');
  const { configData, keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);
  const currentPage = useSelector((state: any) => state.currentPage);
  const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
  const cartAppointment = useSelector((state: any) => state.appointmentServices);
  const [isAnyProductAvailable, setIsAnyProductAvailable] = useState(false)
  const [isAnyServiceAvailable, setIsAnyServiceAvailable] = useState(false)
  const onClickCategory = (cat) => {
    // console.log(cat)
  }

  const [smallBanners, setSmallBanners] = useState<any>();

  useEffect(() => {
    windowRef && document.body.classList.remove("o-h")
  }, [windowRef])

  useEffect(() => {
    if (storeData && storeData.categories) {
      if (storeData.curatedGroups) {
        const smallBannerGroup: any[] = storeData.curatedGroups.filter((curetedGroup) => curetedGroup.curatedLayout == SAMLL_BANNER && curetedGroup.type == keywords[PRODUCT] && curetedGroup.showOnUi);
        if (smallBannerGroup.length != 0) setSmallBanners(smallBannerGroup[0]);
      }
      let isAnyProductAvl = storeData.categories.filter((cat) => cat.type == keywords[PRODUCT] && cat.active && !cat.hideFromCatalogue);
      if (isAnyProductAvl.length != 0) setIsAnyProductAvailable(true);
      let isAnyServiceAvl = storeData.categories.filter((cat) => cat.type == keywords[SERVICE] && cat.active && !cat.hideFromCatalogue);
      if (isAnyServiceAvl.length != 0) setIsAnyServiceAvailable(true);
    }
  }, [storeData]);

  useEffect(() => {
    if (availableGroups.length === 1 && activeGroup !== availableGroups[0]) {
      updateGroupStatus(availableGroups[0]);
      changeGroupWiseTheme(availableGroups[0]);
      setCookie('grp', availableGroups[0], {
        path: "/",
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expires after 1hr
        sameSite: true,
      })
    }
  }, [availableGroups])

  useEffect(() => {

    changeGroupWiseTheme(activeGroup);
    if (availableGroups.length === 1 && activeGroup !== availableGroups[0]) {
      updateGroupStatus(availableGroups[0]);
      changeGroupWiseTheme(availableGroups[0]);
      setCookie('grp', availableGroups[0], {
        path: "/",
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expires after 1hr
        sameSite: true,
      })
      if (storeData && storeData.storeId && availableGroups[0]) {
        if (storeData.categories) {
          // eslint-disable-next-line @typescript-eslint/ban-types
          prepareStoreData(storeData, availableGroups[0]).then((response: {}) => {
            setTimeout(() => {
              dispatch(updateStoreData({ ...response }));
            }, 100);
          })
        }
      }
    } else {
      if (storeData && storeData.storeId && activeGroup) {
        if (storeData.categories) {
          // eslint-disable-next-line @typescript-eslint/ban-types
          prepareStoreData(storeData, activeGroup).then((response: {}) => {
            setTimeout(() => {
              dispatch(updateStoreData({ ...response }));
            }, 100);
          })
        }
      }
    }
  }, [activeGroup])

  const changeGroupWiseTheme = (activeGroup) => {
    //theme changes effect
    let color = configData?.storeConfig?.sparkConfig?.color[activeGroup] || '#fea1c2';
    let textColor = configData?.storeConfig?.sparkConfig?.textColor ? configData?.storeConfig?.sparkConfig?.textColor[activeGroup] : '#282828';
    document.documentElement.style.setProperty('--primary-color', hex2rgb(color, ''), 'important');
    document.documentElement.style.setProperty('--primary-text-color', hex2rgb(textColor, ''), 'important');
    document.documentElement.style.setProperty('--primary-color-alpha', hex2rgb(color, 30), 'important');
    document.body.dataset.theme = activeGroup;
    if (baseRouteUrl && windowRef && windowRef().location) {
      const themeMetaElement = document.getElementById("theme-color");
      themeMetaElement?.setAttribute("content", color);
      // updateManifestFile(storeData);
    }
    dispatch(updateGenericImages(getGenericImages(configData, activeGroup)));
    // let defaultWrapper = document.getElementById('default-wrapper');
    // defaultWrapper.style.backgroundImage = `url("/assets/images/${activeGroup}/bg.png")`;
  }

  const onChangeGroup = (value) => {

    dispatch(updateGroupStatus(value));
    dispatch(showSuccess('Filter applied successfully'))
    setCookie('grp', value, {
      path: "/",
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expires after 1hr
      sameSite: true,
    })
  };

  const redirectToCategories = () => {
    let activeCats = storeData.categories.filter((c: any) => c.active && c.type == keywords[SERVICE]);
    let itemUrl = activeCats[0].name.toLowerCase().split(" ").join("-");
    navigateTo(`${itemUrl}-srp`);
  }
  return (
    <>
      <div className="homepageContainer">
        {storeData && storeData.curatedGroups ? <div className="fullwidth">
          {storeData.sliders?.length != 0 && <div className="herobanner spacing-banner">
            <ImageSlider itemsList={storeData.sliders} config={{}} no_image={BANNER_NO_IMAGE} />
          </div>}
          {availableGroups?.length > 1 &&
            <div className="gender-wrap-outer">
              {availableGroups.map((group: any, index: any) => {
                return <div key={Math.random()} className={`selmalefemale ${activeGroup == group ? 'active' : ''}`} onClick={() => onChangeGroup(group)}>
                  <div className='name cap-text'>{group}</div>
                </div>
              })}
            </div>

            // <div className="gender-wrap-outer">
            //   <div className={`selmalefemale ${activeGroup == 'female' ? 'active' : ''}`} onClick={() => onChangeGroup('female')}>
            //     {windowRef()?.location?.host == 'little-more-salon.respark.in' ? <>
            //       <div className='name'>Basic Courses</div>
            //     </> : <>
            //       <div className='icon' >
            //         <BiMaleSign />
            //       </div>
            //       <div className='name'>Female</div>
            //     </>}
            //   </div>
            //   <div className={`selmalefemale ${activeGroup == 'male' ? 'active' : ''}`} onClick={() => onChangeGroup('male')}>
            //     {windowRef()?.location?.host == 'little-more-salon.respark.in' ? <>
            //       <div className='name'>Advance Courses</div>
            //     </> : <>
            //       <div className='icon' >
            //         <BiFemaleSign />
            //       </div>
            //       <div className='name'>Male</div>
            //     </>}
            //   </div>
            // </div>
          }
          {storeData.curatedGroups?.map((curetedGroup, index) => {
            return <div className="fullwidth" key={Math.random()}>
              {curetedGroup.showOnUi && curetedGroup.curatedCategories && curetedGroup.curatedCategories?.length != 0 && <>
                {curetedGroup.name && (curetedGroup.curatedLayout == SAMLL_BANNER ? curetedGroup.type != keywords[PRODUCT] : true) && <div className="common-section-title common-lr-padd">{curetedGroup.name}</div>}
                {curetedGroup.curatedLayout == CIRCULAR_GRID &&
                  <>
                    <div className="roundthreelayout">
                      <CircularGrid items={curetedGroup.curatedCategories} config={{}} handleClick={(category) => onClickCategory(category)} />
                    </div>
                  </>
                }
                {curetedGroup.curatedLayout == SAMLL_BANNER && curetedGroup.type != keywords[PRODUCT] &&
                  <>
                    {/* <div className="common-grey-boder"></div> */}
                    <div className="midbanner spacing-banner small-banner">
                      <ImageSlider itemsList={curetedGroup.curatedCategories} config={{ redirection: true }} no_image={SMALL_SLIDER_NO_IMAGE} />
                    </div>
                    {/* <div className="common-grey-boder"></div> */}
                  </>
                }
                {curetedGroup.curatedLayout == HORIZONTAL_SQUARE &&
                  <>
                    <div className="skilledsection">
                      <HorizontalSquareGrid items={curetedGroup.curatedCategories} config={{}} />
                    </div>
                    {/* <div className="common-grey-boder"></div> */}
                  </>
                }
                {curetedGroup.curatedLayout == LARGE_BANNER &&
                  <>
                    <div className="packageoffer spacing-banner">
                      <ImageSlider itemsList={curetedGroup.curatedCategories} config={{ redirection: true }} no_image={LARGE_SLIDER_NO_IMAGE} />
                    </div>
                    <div className="common-10height"></div>
                  </>
                }
                {curetedGroup.curatedLayout == SQUARE_BANNER &&
                  <>
                    <div className="packageoffer spacing-banner">
                      <ImageSlider itemsList={curetedGroup.curatedCategories} config={{ redirection: true }} no_image={LARGE_SLIDER_NO_IMAGE} />
                    </div>
                    <div className="common-10height"></div>
                  </>
                }
                {curetedGroup.curatedLayout == SQUARE_GRID &&
                  <>
                    <div className="boxlayout curated-square-grid">
                      <SquareGrid items={curetedGroup.curatedCategories} config={{ redirection: true, withShadow: false }} handleClick={() => { }} noImage={SUB_CAT_NO_IMAGE} />
                    </div>
                  </>
                }
                {/* <div className="common-10height"></div> */}
              </>}
            </div>
          })}
          {storeData.categories &&
            <>
              {configData?.storeConfig?.basicConfig?.services && isAnyServiceAvailable && <div className="fullwidth">
                <div className="common-section-title common-lr-padd">{configData.serviceListHeading || 'Our Services'}</div>
                <div className="boxlayout category-square-grid">
                  <SquareGrid items={storeData.categories} config={{ redirection: true, withShadow: false, from: 'all', type: keywords[SERVICE] }} handleClick={() => { }} noImage={SUB_CAT_NO_IMAGE} />
                </div>
              </div>}

              {smallBanners &&
                <>
                  <div className="common-section-title common-lr-padd">{smallBanners.name}</div>
                  <div className="midbanner spacing-banner small-banner">
                    <ImageSlider itemsList={smallBanners.curatedCategories} config={{ redirection: true }} no_image={SMALL_SLIDER_NO_IMAGE} />
                  </div>
                </>
              }

              {configData?.storeConfig?.basicConfig?.products && isAnyProductAvailable && <div className="fullwidth" >
                {!smallBanners && <div className="common-section-title common-lr-padd">{configData.productListHeading || 'Our Products'}</div>}
                {configData?.showProductCategoryGridView ? <div className="boxlayout category-square-grid product-list-wrap" id="product-list-wrap">
                  <SquareGrid items={storeData.categories} config={{ redirection: true, withShadow: false, from: 'all', type: keywords[PRODUCT] }} handleClick={() => { }} noImage={SUB_CAT_NO_IMAGE} />
                </div> : <div className="boxlayout product-list-outer product-list-wrap" id="product-list-wrap">
                  <ProductsWithCategory categories={storeData.categories} />
                </div>}
              </div>}
            </>
          }
        </div> : null}
      </div>
      {(configData.storeConfig?.appointmentConfig?.active && currentPage != 'cart' && currentPage != 'checkout' && currentPage != 'appointment' && !cartAppointment.length) ?
        <div className="appointment-wrapper" onClick={redirectToCategories}>
          <div className="appointment-button"> Book Appointment </div>
        </div>
        : <></>}
    </>
  );
}
const mapStateToProps = (state) => {
  return {
    storeData: state?.store?.storeData,
    activeGroup: state?.activeGroup,
    storeMetaData: state?.store?.storeMetaData
  }
}

export default connect(mapStateToProps)(HomePage);
