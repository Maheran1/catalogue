import React, { useState, useEffect, useRef } from 'react';
// for Accordion starts
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
// for Accordion ends
import ScrollingNavigation from '@module/topScrolleingNavigation';
import SquareGrid from "@module/squareGrid";
import { SUB_CAT_NO_IMAGE } from "@constant/noImage";
import { useRouter } from 'next/router';
import Item from "@element/horizontalItem";
import HeadMetaTags from "@module/headMetaTags";
import ImageGallery from 'react-image-gallery';
import { getItemMetaTags } from '@util/metaTagsService';
import { filterCategory, getCurrentFilters, getItemPrice, getItemsList } from '@util/dataFilterService/itemDataService';
import { dynamicSort } from '@util/utils';
import FilterModal from '@module/filterModal';
import { showSuccess } from '@context/actions';
import { useSelector, useDispatch } from 'react-redux';
import { navigateTo } from '@util/routerService';
import { windowRef } from '@util/window';

function BiFilterAlt(props) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M21,3H5C4.447,3,4,3.447,4,4v2.59c0,0.523,0.213,1.037,0.583,1.407L10,13.414V21c0,0.347,0.18,0.668,0.475,0.851 C10.635,21.95,10.817,22,11,22c0.153,0,0.306-0.035,0.447-0.105l4-2C15.786,19.725,16,19.379,16,19v-5.586l5.417-5.417 C21.787,7.627,22,7.113,22,6.59V4C22,3.447,21.553,3,21,3z M14.293,12.293C14.105,12.48,14,12.734,14,13v5.382l-2,1V13 c0-0.266-0.105-0.52-0.293-0.707L6,6.59V5h14.001l0.002,1.583L14.293,12.293z" /></svg>;
}

function CategoryPage({ url_Segment, storeData, activeGroup, metaTags }) {

  const router = useRouter()
  const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
  const [activeCuratedGroup, setActiveCuratedGroup] = useState(null)
  const [activeCuratedCategory, setActiveCuratedCategory] = useState(null)
  const [mappedCategories, setMappedCategories] = useState(null);
  const [itemsWithoutCategoryList, setItemsWithoutCategoryList] = useState([]);
  const [baseSubCategories, setBaseSubCategories] = useState(null);
  const [categoriesWithItems, setCategoriesWithItems] = useState(null);
  const [categoriesPromotionBanner, setCategoriesPromotionBanner] = useState(null);
  const [subCuratedCategories, setSubCuratedCategories] = useState(null);
  const [activeBaseCategory, setActiveBaseCategory] = useState(null);
  const [activeSubCuratedCategory, setActiveSubCuratedCategory] = useState(null);
  const [curatedItemsList, setCuratedItemsList] = useState(null);
  const [activeMmetaTags, setmetaTags] = useState(metaTags);
  const { configData, keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>()
  const [filterConfig, setFilterConfig] = useState<any>();
  const dispatch = useDispatch();

  const settings = {
    showThumbnails: false,
    showPlayButton: false,
    showBullets: (categoriesPromotionBanner && categoriesPromotionBanner?.length) > 1 ? true : false,
    autoPlay: true,
    slideDuration: configData?.storeConfig?.sparkConfig?.sliderDuration || 2000,
    slideInterval: configData?.storeConfig?.sparkConfig?.sliderInterval || 5000,
    startIndex: 0,
    showNav: false,
    showFullscreenButton: false
  }

  useEffect(() => {
    if (windowRef && activeCuratedCategory) window.scrollTo(0, 0);
  }, [windowRef, activeCuratedCategory])

  const scrollToList = () => {
    const element: any = document.getElementById('scroll-to-wrap');
    if (element && (subCuratedCategories || baseSubCategories || activeBaseCategory || activeCuratedCategory || activeSubCuratedCategory)) {
      const yOffset = -130;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      setTimeout(() => {
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 100);
    }
  }

  useEffect(() => {
    scrollToList()
  }, [subCuratedCategories, baseSubCategories, activeBaseCategory, activeCuratedCategory, activeSubCuratedCategory])


  useEffect(() => {
    if (activeFilters && activeFilters.active) {
      getCategoryData();
    }
  }, [activeFilters])

  const setActiveCuratedGroupData = (groupData, categoryData) => {
    let allItemsList: any = []
    // const [filterObj, filterConfigs] = getCurrentFilters(configData, groupData.type); 
    // groupData.curatedCategories.map((curatedCat: any, curatedCatIndex: number) => {
    //   if (curatedCat.entityType == "category") {
    //     curatedCat.curatedItems.map((curatedItem: any, curatedItemIndex: number) => {
    //       curatedItem = { ...curatedItem, ...curatedItem.categoryDetails }
    //       allItemsList = getItemsList(allItemsList, curatedItem);
    //     })
    //   } else if (curatedCat.entityType == 'items') {

    //   }
    //   if (curatedCatIndex == groupData.curatedCategories.length -1){
    //     if (allItemsList.length != 0) {
    //       console.log(allItemsList)
    //       allItemsList.map((item: any) => {
    //         let [price, salePrice] = getItemPrice(item);
    //         item.billPrice = salePrice || price;
    //         item.price = price;
    //         item.salePrice = salePrice;
    //  item.discount = salePrice ? Number((((price - salePrice) / price) * 100).toFixed(1)) : 0;
    //         console.log(item.billPrice)
    //       })
    //       allItemsList = allItemsList.sort(dynamicSort("billPrice", 1)); //1 == 0 1 2 3  || -1 == 3 2 1 0
    //       allItemsList.map((item: any) => {
    //         console.log(item.billPrice)
    //       })
    //       filterConfigs.maxPrice = allItemsList[allItemsList.length - 1].billPrice;
    //       filterConfigs.minPrice = 0;
    //       setFilterConfig({ ...filterConfigs });
    //       setActiveFilters({ ...filterObj, minPrice: 0, maxPrice: 100 });
    //     }
    //   }
    // })

    setActiveCuratedCategory({ ...categoryData });
    setActiveCuratedGroup({ ...groupData });
  }
  const getCategoryData = () => {
    let categoryDataFromUrl = null;
    let categoryGroupDataFromUrl = null;
    storeData?.curatedGroups?.map((groupData, groupDataIndex) => {
      if (!categoryDataFromUrl) {
        groupData?.curatedCategories?.map((categoryData) => {
          if (!categoryDataFromUrl) {
            if (categoryData.name.toLowerCase() == url_Segment) {
              categoryData.showOnUi && (categoryData.isSelected = true);
              categoryGroupDataFromUrl = groupData;
              categoryDataFromUrl = categoryData;
            }
          }
        })
      }
      if (groupDataIndex == storeData.curatedGroups?.length - 1) {
        if (categoryDataFromUrl && categoryDataFromUrl.showOnUi) {
          categoryGroupDataFromUrl?.curatedCategories?.map((data) => (data.name == categoryDataFromUrl.name) && (data.isSelected = true));
          setActiveCuratedGroupData(categoryGroupDataFromUrl, categoryDataFromUrl)
        } else {
          // active category not found by url name
          // console.log('category not found');
          if (categoryGroupDataFromUrl) {
            const avlActiveCat = categoryGroupDataFromUrl.curatedCategories?.filter((cat) => cat.showOnUi);
            if (avlActiveCat?.length != 0) {
              // console.log('first category set');
              categoryGroupDataFromUrl?.curatedCategories?.map((data) => (data.name == avlActiveCat[0].name) && (data.isSelected = true));
              setActiveCuratedGroupData(categoryGroupDataFromUrl, avlActiveCat[0])
            }
            // else router.push('/');
          }
          else navigateTo('home');
        }
      }
    })
  }

  useEffect(() => {
    const element = document.getElementById('scrolling-div');
    window.scrollTo(0, element?.offsetTop);
  }, [categoriesPromotionBanner])

  useEffect(() => {
    getCategoryData();
  }, [url_Segment, activeGroup, storeData])

  useEffect(() => {
    if (configData && activeCuratedCategory && mappedCategories && mappedCategories?.length != 0 && !(activeFilters?.active)) {
      const [filterObj, filterConfigs] = getCurrentFilters(configData, mappedCategories[0].type);
      if (filterConfigs && filterConfigs.active) {
        if (filterConfigs.priceRange) {
          if (activeCuratedCategory.entityType === 'category') {
            let allItemsList: any = [];
            mappedCategories.map((catData, catI) => {
              allItemsList = getItemsList(allItemsList, catData);
              if (mappedCategories.length - 1 == catI && allItemsList.length != 0) {
                // console.log(allItemsList)
                allItemsList.map((item: any) => {
                  let [price, salePrice] = getItemPrice(item);
                  item.billPrice = salePrice || price;
                  item.price = price;
                  item.salePrice = salePrice;
                  item.discount = salePrice ? Number((((price - salePrice) / price) * 100).toFixed(1)) : 0;
                  // console.log(item.billPrice)
                })
                allItemsList = allItemsList.sort(dynamicSort("billPrice", 1)); //1 == 0 1 2 3  || -1 == 3 2 1 0
                allItemsList.map((item: any) => {
                  // console.log(item.billPrice)
                })
                filterConfigs.maxPrice = allItemsList[allItemsList.length - 1].billPrice;
                filterConfigs.minPrice = 0;
                setFilterConfig({ ...filterConfigs });
                setActiveFilters({ ...filterObj, minPrice: 0, maxPrice: 100 });
              }
            })

          } else if (activeCuratedCategory.entityType === 'items') {
            if (activeCuratedCategory.curatedItems.length !== 0) {
              let itemsList = activeCuratedCategory.curatedItems;
              itemsList.map((item, index) => {
                item = { ...item, ...item.item }
                let [price, salePrice] = getItemPrice(item);
                item.billPrice = salePrice || price;
                item.price = price;
                item.salePrice = salePrice;
                item.discount = salePrice ? Number((((price - salePrice) / price) * 100).toFixed(1)) : 0;
                itemsList = itemsList.sort(dynamicSort("billPrice", 1)); //1 == 0 1 2 3  || -1 == 3 2 1 0
                // itemsList.map((item: any) => {
                //   console.log(item.billPrice)
                // })
                filterConfigs.maxPrice = itemsList[itemsList.length - 1].billPrice;
                filterConfigs.minPrice = 0;
                setFilterConfig({ ...filterConfigs });
                setActiveFilters({ ...filterObj, minPrice: 0, maxPrice: 100 });
              })
            }
          }
        } else {
          setFilterConfig({ ...filterConfigs });
          setActiveFilters({ ...filterObj });
        }
      }
    }
  }, [activeCuratedCategory, configData, mappedCategories])

  useEffect(() => {
    if (activeCuratedCategory && activeCuratedCategory.name) {
      setmetaTags(getItemMetaTags(activeCuratedCategory));
      prepareDataForRendering();
    }
  }, [activeCuratedCategory])

  useEffect(() => {
    if (mappedCategories && mappedCategories?.length == 1) {
      prepareActiveCategoryData(mappedCategories[0], 'Base', 'first-load');
    } else {
      setSubCuratedCategories(mappedCategories);
    }
  }, [mappedCategories]);


  const prepareDataForRendering = () => {
    setmetaTags(getItemMetaTags(activeCuratedCategory));
    if (activeCuratedCategory.entityType === 'category') {
      setMappedCategories(null);
      setItemsWithoutCategoryList([]);
      setCategoriesPromotionBanner(null);
      setCategoriesWithItems(null);
      setSubCuratedCategories(null);
      setActiveBaseCategory(null);
      setActiveSubCuratedCategory(null);
      const mappedCategories = activeCuratedCategory.curatedItems;
      mappedCategories?.map((mappedCategory) => {
        storeData?.categories?.map((storeCategory) => {
          if (storeCategory.name === mappedCategory.name) {
            mappedCategory.categoryDetails = storeCategory;
          } else {
            if ((storeCategory?.categoryList && storeCategory?.categoryList.length != 0) && storeCategory.categoryList.length != 0) {
              storeCategory.categoryList?.map((subCategory) => {
                if (subCategory.name === mappedCategory.name) {
                  mappedCategory.categoryDetails = subCategory;
                } else {
                  if ((subCategory?.categoryList && subCategory?.categoryList.length != 0) && subCategory.categoryList.length != 0) {
                    subCategory.categoryList?.map((subSubCategory) => {
                      if (subSubCategory.name === mappedCategory.name) {
                        mappedCategory.categoryDetails = subSubCategory;
                      }
                    })
                  }
                }
              })
            }
          }
        })
      })
      setTimeout(() => {
        let categoryList = [];
        mappedCategories?.map((catData, catI) => {
          let category = { ...catData.categoryDetails, ...catData };
          delete category.categoryDetails;
          if (activeFilters && activeFilters.active) {
            if (category.showOnUi) {
              category = filterCategory(category, activeFilters, filterConfig);
            }
          }
          categoryList.push(category);
        })
        setMappedCategories(categoryList);
      }, 100);
    } else if (activeCuratedCategory.entityType === 'items') {
      if (activeCuratedCategory.curatedItems.length !== 0) {
        const itemsList = activeCuratedCategory.curatedItems;
        const categoriesPromotionBannerArray = [];
        itemsList.map((item, index) => {
          item = { ...item, ...item.item }
          //get prices
          let [price, salePrice] = getItemPrice(item);
          item.billPrice = salePrice || price;
          item.price = price;
          item.salePrice = salePrice;
          item.discount = salePrice ? Number((((price - salePrice) / price) * 100).toFixed(1)) : 0;
          // console.log(item.billPrice)

          //get banners
          item?.imagePaths?.map((imagObj) => {
            imagObj.imagePath && !imagObj.deleted && categoriesPromotionBannerArray.push({ original: imagObj.imagePath, thumbnail: imagObj.imagePath, alt: 'Promotional', bulletClass: 'slider-bullet' })
          })

          if (index == itemsList.length - 1) {
            if (activeFilters && activeFilters.active) {
              let filteredItem = itemsList.filter((i: any) => i.billPrice >= (activeFilters.minPrice * (filterConfig.maxPrice / 100)) && i.billPrice <= (activeFilters.maxPrice * (filterConfig.maxPrice / 100)))
              setCuratedItemsList(filteredItem);
            } else {
              setCategoriesPromotionBanner(categoriesPromotionBannerArray);
              setCuratedItemsList(itemsList);
            }

          }
        })
      }
    }
  }
  const getPromotionalBanner = (category) => {
    let imagePathsArray = [];

    if (category && category.imagePaths && category.imagePaths != null && category.imagePaths.length != 0) {
      category.imagePaths = category.imagePaths.filter((i: any) => !i.deleted)
      imagePathsArray = [...imagePathsArray, ...category.imagePaths];
    }
    if (category && (category?.categoryList && category?.categoryList.length != 0) && category.categoryList.length != 0) {
      category.categoryList?.map((catData, catIndex) => {
        catData.imagePaths = (catData && catData.imagePaths && catData.imagePaths != null && catData.imagePaths.length != 0) ? catData.imagePaths : []
        catData.imagePaths = catData.imagePaths.filter((i: any) => !i.deleted)
        imagePathsArray = [...imagePathsArray, ...catData.imagePaths];
      })
    }
    if (category && category.itemList) {
      category.itemList?.map((itemData, catIndex) => {
        if (itemData.imagePaths && itemData.imagePaths?.length != 0) {
          itemData.imagePaths = itemData.imagePaths.filter((i: any) => !i.deleted)
          imagePathsArray = [...imagePathsArray, ...itemData.imagePaths];
        }
      })
    }
    const categoriesPromotionBannerArray = [];
    imagePathsArray?.map((imagObj) => {
      (imagObj.active && imagObj.imagePath) && categoriesPromotionBannerArray.push({ original: imagObj.imagePath, thumbnail: imagObj.imagePath, alt: 'Promotional', bulletClass: 'slider-bullet' })
    })
    setCategoriesPromotionBanner(categoriesPromotionBannerArray);
  }

  const prepareActiveCategoryData = (category, from, status = null) => {
    // setAccordianExpanded(false);
    scrollToList()
    if (!status) {
      let catUrl = category.name.toLowerCase().split(" ").join("-");
      let url = router.query.pagepath[0] + "/sub/" + catUrl;
      navigateTo(url)
    }
    setCategoriesWithItems(null);
    if ((category?.categoryList && category?.categoryList.length != 0) && category.categoryList.length != 0) {
      const isAnySubSubCategoryAvl = category.categoryList?.filter((catData) => (catData?.categoryList && catData?.categoryList.length != 0));
      if (isAnySubSubCategoryAvl?.length) {
        setBaseSubCategories(category.categoryList);
        setItemsWithoutCategoryList([]);
        setCategoriesPromotionBanner(null);
        // setCategoriesWithItems(null);
      } else {
        setItemsWithoutCategoryList([]);
        getPromotionalBanner(category);
        setCategoriesWithItems(category.categoryList);
      }
    } else {
      //direct items list
      if (from === 'Curated') {
        setBaseSubCategories(null);
        setActiveBaseCategory(null);
      }
      if (category.itemList) {
        getPromotionalBanner(category);
      }
      setItemsWithoutCategoryList(category.itemList || []);
    }
    if (from === 'Curated') {
      setActiveSubCuratedCategory(category);
      subCuratedCategories && subCuratedCategories?.map((cat) => {
        if (cat.name === category.name) cat.isSelected = true;
        else cat.isSelected = false;
      })
      baseSubCategories && baseSubCategories?.map((cat) => cat.isSelected = false)
    } else {
      status !== 'first-load' && setActiveBaseCategory(category);
      baseSubCategories && baseSubCategories?.map((cat) => {
        if (cat.name === category.name) cat.isSelected = true;
        else cat.isSelected = false;
      })
    }
  }

  const handleFilterModalRes = (filters: any) => {
    if (filters) {
      setActiveFilters(filters);
      dispatch(showSuccess("Filter applied successfully"))
    }
    setShowFilter(false)
  }

  return (
    <>
      {activeCuratedGroup ? <div className="categorypageContainer curation-wrapper">
        {filterConfig && filterConfig.active ? <>
          <div className='filter-nav-wrap'>
            <ScrollingNavigation items={activeCuratedGroup.curatedCategories} config={{}} handleClick={(item) => setActiveCuratedCategory(item)} activeCategory={activeCuratedCategory} />
            <div className='filter-icon-wrap'>
              <div className='filter-icon' onClick={() => setShowFilter(true)}>
                <BiFilterAlt />
              </div>
            </div>
          </div>
        </> : <>
          <ScrollingNavigation items={activeCuratedGroup.curatedCategories} config={{}} handleClick={(item) => setActiveCuratedCategory(item)} activeCategory={activeCuratedCategory} />
        </>}

        <HeadMetaTags title={activeMmetaTags.title} siteName={activeMmetaTags.siteName} description={activeMmetaTags.description} image={activeMmetaTags.image} storeData={storeData} />
        {activeCuratedCategory?.entityType === 'category' && <div className="content-wrap clearfix">
          <>
            {subCuratedCategories && <div className="fullwidth accordian-wrap">
              <div className="boxlayout">
                <SquareGrid noImage={SUB_CAT_NO_IMAGE} items={subCuratedCategories} config={{ withShadow: false }} handleClick={(category) => prepareActiveCategoryData(category, 'Curated')} />
              </div>
            </div>}
          </>

          <>
            {/* {((subCuratedCategories ? activeSubCuratedCategory : true) && baseSubCategories) && <div className="fullwidth"> */}
            {baseSubCategories && <div className="fullwidth">
              {activeBaseCategory ? <div className="subcat-cover clearfix">
                <div className="boxlayout">
                  <SquareGrid noImage={SUB_CAT_NO_IMAGE} items={baseSubCategories} config={{ withShadow: false }} handleClick={(category) => prepareActiveCategoryData(category, 'Base')} />
                </div>
              </div> : null}
            </div>}
          </>

          <div className='fullwidth' id="scroll-to-wrap"></div>
          {/* categoriesPromotionBanner */}
          {categoriesPromotionBanner &&
            <div className="promotional-banner spacing-banner" id="promotional-banner">
              <ImageGallery items={categoriesPromotionBanner} {...settings} />
            </div>}
          {/* categoriesWithItems */}
          {categoriesWithItems && <div className={`services-list-wrapper ${Object.keys(keywords).filter(function (key) { return keywords[key] === categoriesWithItems[0]?.type })[0]}-list-wrapper ${configData?.showProductInGridView ? 'grid-view' : ''}`}>
            {
              categoriesWithItems?.map((category, catIndex) => {
                return <div key={Math.random()} className="subsub-items">
                  {category.showOnUi && category.active ? <>
                    {<div className="service-list-cover">
                      <div className="ser-list-title">{category.name}</div>
                      {
                        category.itemList && category.itemList?.map((item, itemIndex) => {
                          return <React.Fragment key={Math.random()}>
                            {item.showOnUi && !item.hideFromCatalogue && <Item item={item} config={{ onClickAction: configData.showServicesPdp }} type={category.type} />}
                          </React.Fragment>
                        })
                      }
                    </div>}
                  </> : null}
                </div>
              })
            }
          </div>}

          {/* itemsWithoutCategoryList */}
          <div className={`services-list-wrapper ${Object.keys(keywords).filter(function (key) { return keywords[key] === itemsWithoutCategoryList[0]?.type })[0]}-list-wrapper ${configData?.showProductInGridView ? 'grid-view' : ''}`}>
            {itemsWithoutCategoryList.length != 0 && <>
              {itemsWithoutCategoryList?.map((item, itemIndex) => {
                return <div className={`service-list-cover  ${Object.keys(keywords).filter(function (key) { return keywords[key] === item.type })[0]}`} key={Math.random()}>
                  {item.showOnUi && !item.hideFromCatalogue && <Item item={item} config={{ onClickAction: configData.showServicesPdp }} type={activeCuratedCategory.type} />}
                </div>
              })
              }
            </>}
          </div>

          {!(itemsWithoutCategoryList?.length) && (!categoriesWithItems && !categoriesWithItems?.length) && (!subCuratedCategories || subCuratedCategories?.length == 0) && (!curatedItemsList || curatedItemsList?.length == 0) &&
            <div className='unavailable-data'>
              <div className='heading'>Whoops ...</div>
              <div className=''>We're unable to find the data that you're looking for</div>
            </div>}
        </div>}

        {activeCuratedCategory.entityType === 'items' && <div className="content-wrap">
          {/* categoriesPromotionBanner */}
          {categoriesPromotionBanner &&
            <div className="promotional-banner spacing-banner " id="promotional-banner">
              <ImageGallery items={categoriesPromotionBanner} {...settings} />
            </div>}
          <div className={`services-list-wrapper ${Object.keys(keywords).filter(function (key) { return curatedItemsList && keywords[key] === curatedItemsList[0]?.type })[0]}-list-wrapper ${configData?.showProductInGridView ? 'grid-view' : ''}`}>
            {curatedItemsList?.map((item, itemIndex) => {
              item = { ...item, ...item.item }
              return <div className={`service-list-cover ${item.type}`} key={Math.random()}>
                {item.showOnUi && !item.hideFromCatalogue && <Item item={item} config={{ onClickAction: configData.showServicesPdp }} type={activeCuratedCategory.type} />}
              </div>
            })}
          </div>
        </div>}
      </div> : null}
      <FilterModal
        frompage="Curations"
        type={activeCuratedGroup?.type || 'Items'}
        filterConfig={filterConfig}
        openModal={showFilter}
        activeFilters={activeFilters}
        handleClose={(filters: any) => handleFilterModalRes(filters)}
      />
    </>
  );
}
export default CategoryPage;