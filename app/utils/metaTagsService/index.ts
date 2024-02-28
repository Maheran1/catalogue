
export const getMetaTagsData = async (storeMetaData, storeData, urlQuery, activeGroup) => {
    return new Promise((res, rej) => {
        const setDefaultStoreMetaTags = () => {
            let metaTagsFromUrlQuery = { title: '', description: '', image: '', siteName: '' };
            metaTagsFromUrlQuery.title = storeData.tenant.toUpperCase() + ', ' + storeMetaData?.name;
            metaTagsFromUrlQuery.siteName = storeMetaData?.sUrl || null;
            metaTagsFromUrlQuery.description = storeMetaData?.description;
            metaTagsFromUrlQuery.image = storeMetaData?.logoPath || storeData?.logo;
            return metaTagsFromUrlQuery;
        }
        let metaTagsFromUrlQuery: any = setDefaultStoreMetaTags();
        //get meta tags data
        let current_page_url: any = urlQuery.pagepath && urlQuery.pagepath.length != 0 ? urlQuery.pagepath[0] : [];  //single folder routing /category
        if (urlQuery.pagepath?.length == 2 && !urlQuery.pagepath.includes('feedback') && !urlQuery.pagepath.includes('invoice') && !urlQuery.pagepath.includes('membershipinvoice')) current_page_url = urlQuery.pagepath[1]; //multi folder routing /category/product
        if (current_page_url.length == 0 || current_page_url.includes('home') || current_page_url.includes('feedback') && !urlQuery.pagepath.includes('invoice') && !urlQuery.pagepath.includes('membershipinvoice')) { //for all pdp urls
            metaTagsFromUrlQuery = setDefaultStoreMetaTags();
        } else if (current_page_url.includes('-grp')) { //for all pdp urls
            current_page_url = current_page_url.split('-grp')[0];
            current_page_url = current_page_url.split("-").join(" ");
            if (storeData.curatedGroups) {
                const groupData = storeData?.curatedGroups?.filter((group) => group.name.toLowerCase() === current_page_url);
                if (groupData && groupData?.length) {
                    metaTagsFromUrlQuery = { title: '', description: '', image: '', siteName: '' };
                    metaTagsFromUrlQuery.title = groupData[0].pTitle || groupData[0].name;
                    metaTagsFromUrlQuery.siteName = groupData[0].siteName || null;
                    metaTagsFromUrlQuery.description = groupData[0].pDescription || groupData[0].description;
                    metaTagsFromUrlQuery.image = groupData[0].pImage || (groupData[0].imagePaths && groupData[0]?.imagePaths?.length != 0 ? groupData[0].imagePaths[0].imagePath : '');
                } else {
                    metaTagsFromUrlQuery = getCuratedCategoryPromotion(storeData, current_page_url, metaTagsFromUrlQuery);
                }
            }
        } else if (current_page_url.includes('-pdp')) { //for all pdp urls
            current_page_url = current_page_url.split('-pdp')[0];
            current_page_url = current_page_url.split("-").join(" ");
            let catName = urlQuery.pagepath['0'];
            catName = catName.split('-srp')[0];
            catName = catName.split('-prp')[0];
            catName = catName.split("-").join(" ");
            const catData = storeData.categories.filter((cat) => cat.name.toLowerCase() == catName);
            let item = [];
            if (catData.length != 0) {
                if (catData[0] && catData[0].categoryList && catData[0]?.categoryList?.length != 0) {
                    catData[0].categoryList.map((c) => {
                        if (c && c.categoryList && c?.categoryList?.length != 0) {
                            c.categoryList.map((sc) => {
                                if (item.length == 0) item = sc.itemList.filter((i) => i.name.toLowerCase() == current_page_url);
                            })
                        } else {
                            if (item.length == 0) item = c.itemList.filter((i) => i.name.toLowerCase() == current_page_url);
                        }
                    })
                } else {
                    if (item.length == 0) item = catData[0].itemList.filter((i) => i.name.toLowerCase() == current_page_url);
                }
            }
            // const item = storeData?.itemsList?.filter((storeItem) => storeItem.name.toLowerCase() === current_page_url);
            if (item && item?.length) {
                metaTagsFromUrlQuery = { title: '', description: '', image: '', siteName: '' };
                metaTagsFromUrlQuery.title = item[0].pTitle || item[0].name;
                metaTagsFromUrlQuery.siteName = item[0].siteName || null;
                metaTagsFromUrlQuery.description = item[0].pDescription || item[0].description;
                metaTagsFromUrlQuery.image = item[0].pImage || (item[0].imagePaths && item[0]?.imagePaths?.length != 0 ? item[0].imagePaths[0].imagePath : '');
            }
        } else if (current_page_url.includes('-prp') || current_page_url.includes('-srp')) {

            // for all/our services and all/our products urls
            current_page_url = current_page_url.split('-prp')[0];
            if (current_page_url.includes('-srp')) current_page_url = current_page_url.split('-srp')[0];
            current_page_url = current_page_url.split("-").join(" ");
            const category = storeData?.categories?.filter((storeCategory) => storeCategory.name.toLowerCase() === current_page_url);
            if (category && category?.length) {
                const item = category[0];
                metaTagsFromUrlQuery = { title: '', description: '', image: '', siteName: '' };
                metaTagsFromUrlQuery.title = item.pTitle || item.name;
                metaTagsFromUrlQuery.siteName = item.siteName || null;
                metaTagsFromUrlQuery.description = item.pDescription || item.description;
                if ('icon' in item) metaTagsFromUrlQuery.image = item.icon || '';
                if (metaTagsFromUrlQuery.image && item.icons && item.icons.length != 0 && item.icons[0].active) {
                    if (activeGroup && item.icons[0].group == 'both' ? true : activeGroup == item.icons[0].group) metaTagsFromUrlQuery.image = item.icons[0].imagePath || '';
                }
                if (metaTagsFromUrlQuery.image && (item.imagePaths && item.imagePaths?.length !== 0 && item.imagePaths[0] && item.imagePaths[0].active)) {
                    metaTagsFromUrlQuery.image = item.imagePaths[0].imagePath || '';
                }
            }
        } else {
            current_page_url = current_page_url.split("-").join(" ");
            //for curated category urls
            metaTagsFromUrlQuery = getCuratedCategoryPromotion(storeData, current_page_url, metaTagsFromUrlQuery);
        }
        setTimeout(() => {
            if (!metaTagsFromUrlQuery.title) {
                metaTagsFromUrlQuery.title = storeData.tenant.toUpperCase() + ', ' + storeMetaData?.name;
            }
            if (!metaTagsFromUrlQuery.description) {
                metaTagsFromUrlQuery.description = storeMetaData?.description;
            }
            if (!metaTagsFromUrlQuery.siteName) {
                metaTagsFromUrlQuery.siteName = storeMetaData?.sUrl || null;
            }
            if (!metaTagsFromUrlQuery.image) {
                metaTagsFromUrlQuery.image = storeMetaData?.logoPath || storeData?.logo;
            }
            res(metaTagsFromUrlQuery)
        });
    })

}

const getCuratedCategoryPromotion = (storeData: any, current_page_url: any, metaTagsFromUrlQuery) => {
    let categoryDataFromUrl = null;
    let categoryGroupDataFromUrl = null;
    storeData?.curatedGroups?.map((groupData, groupDataIndex) => {
        if (!categoryDataFromUrl) {
            groupData?.curatedCategories?.map((categoryData) => {
                if (!categoryDataFromUrl) {
                    if (categoryData.name.toLowerCase() == current_page_url) {
                        categoryGroupDataFromUrl = groupData;
                        categoryDataFromUrl = categoryData;
                    }
                }
            })
        }
        if (groupDataIndex == storeData.curatedGroups?.length - 1 || categoryDataFromUrl) {
            if (categoryDataFromUrl) {
                const category = categoryDataFromUrl;
                if (category) {
                    metaTagsFromUrlQuery = { title: '', description: '', image: '', siteName: '' };
                    metaTagsFromUrlQuery.title = category.pTitle || category.name;
                    metaTagsFromUrlQuery.siteName = category.siteName || null;
                    metaTagsFromUrlQuery.description = category.pDescription || category.description;
                    metaTagsFromUrlQuery.image = category.pImage || (category.icon ? category.icon : category.imagePath);
                }
            } else {
                // active category not found by url name
                if (categoryGroupDataFromUrl) {
                    const avlActiveCat = categoryGroupDataFromUrl.curatedCategories?.filter((cat) => cat.showOnUi);
                    if (avlActiveCat?.length != 0) {
                        const category = avlActiveCat[0];
                        if (category) {
                            metaTagsFromUrlQuery = { title: '', description: '', image: '', siteName: '' };
                            metaTagsFromUrlQuery.title = category.pTitle || category.name;
                            metaTagsFromUrlQuery.siteName = category.siteName || null;
                            metaTagsFromUrlQuery.description = category.pDescription || category.description;
                            metaTagsFromUrlQuery.image = category.pImage || (category.icon ? category.icon : category.imagePath);
                        }
                    }
                }
            }
        }
    })
    return metaTagsFromUrlQuery
}

export const getItemMetaTags = (item) => {
    const metaTags = { title: '', description: '', image: '', siteName: '' }
    if (item) {
        metaTags.title = item.pTitle || item.name;
        metaTags.siteName = item.siteName || null;
        metaTags.description = item.pDescription || item.description;
        metaTags.image = item.pImage || (item.icon ? item.icon : item.imagePaths && item?.imagePaths?.length != 0 ? item.imagePaths[0].imagePath : '');
    }
    return metaTags;
}