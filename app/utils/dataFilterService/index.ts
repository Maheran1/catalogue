const validate_Item_Day_Date_Time_Group = (group, item, status = false) => {

    if (!item) {
        return new Promise((res, rej) => res(false))
    }
    const currentDate = new Date();
    const currentday = currentDate.toLocaleString('en-us', { weekday: 'long' }).substring(0, 3);
    let isValidtiming = true;
    let isValidDate = true;
    let isValidDay = true;
    let isValidGroup = true;

    //validation for from and to time
    if (('fromTime' in item) && ('toTime' in item) && item.fromTime && item.toTime && (item.fromTime != '00:00' && item.toTime != '00:00')) {
        //create from time newDate
        const itemFromTimeDate = new Date();
        const [fhr, fmin] = item.fromTime.split(':');
        itemFromTimeDate.setHours(fhr);
        itemFromTimeDate.setMinutes(fmin);
        //create to time newDate
        const itemToTimeDate = new Date();
        const [thr, tmin] = item.toTime.split(':');
        itemToTimeDate.setHours(thr);
        itemToTimeDate.setMinutes(tmin);

        if (itemFromTimeDate <= new Date() && new Date() <= itemToTimeDate) {
            isValidtiming = true;
        }
    } else isValidtiming = true;

    //validation for from and to date
    if (('fromDate' in item) && ('toDate' in item) && item.fromDate && item.toDate) {
        //re parse from and to date as newDate
        const itemFromDate = new Date(item.fromDate);
        const itemToDate = new Date(item.toDate);
        if (itemFromDate <= new Date() && new Date() <= itemToDate) {
            isValidDate = true;
        }
    } else isValidDate = true;

    //validation for days
    if (('days' in item) && item.days) {
        if (item.days.toLowerCase() == 'all') isValidDay = true;
        else if (item.days.includes(currentday)) isValidDay = true;
    } else isValidDay = true;

    //validation for group
    if (('group' in item) && item.group) {
        isValidGroup = (item.group.toLowerCase() === 'both' || group.toLowerCase() === 'both') ? true : (item.group.toLowerCase() === group.toLowerCase());
    } else isValidGroup = true;

    //check all validation
    return new Promise((res, rej) => {
        if (isValidDate && isValidDay && isValidtiming && isValidGroup && item.active) res(true);
        else res(false);
    })
}

const filterItemsList = (itemsList, categoryCheck, group, categoryDetails) => {
    return new Promise((res, rej) => {
        if (itemsList?.length != 0) {
            itemsList = itemsList?.sort((a, b) => ((a.salePrice || a.price) > (b.salePrice || b.price)) ? 1 : -1)
            itemsList = itemsList?.sort((a, b) => (a.index > b.index) ? 1 : -1)
            itemsList?.map(async (item, itemIndex) => {
                item.categoryName = categoryDetails.name;
                item.categoryId = categoryDetails.id;
                // item.categoryDetails = categoryDetails;
                if (item.imagePaths && item.imagePaths.length != 0) {
                    item.imagePaths = item.imagePaths.filter((i: any) => !i.deleted)
                    item.imagePaths.map(async (imageObj) => {
                        imageObj.showOnUi = await validate_Item_Day_Date_Time_Group(group, imageObj);
                    })
                } else item.imagePaths = [];
                item.variations = item.variations ? item.variations : [];
                item.showOnUi = await validate_Item_Day_Date_Time_Group(group, item);
                if (item.active && item.showOnUi && categoryCheck) {
                    if (item.variations.length != 0) {
                        item.variations.map(async (variant, variantIndex) => {
                            item.variations[variantIndex].showOnUi = await validate_Item_Day_Date_Time_Group(group, variant);
                            if (variant.variations && variant.variations.length != 0 && !variant.group) {

                                variant.variations?.map(async (subVariant) => {
                                    subVariant.showOnUi = await validate_Item_Day_Date_Time_Group(group, subVariant);

                                    if (subVariant.variations && !subVariant.group) {
                                        subVariant.variations?.map(async (subSubVariant) => {
                                            subSubVariant.showOnUi = await validate_Item_Day_Date_Time_Group(group, subSubVariant);
                                        })
                                        const isAnySubSubVariantAvl = subVariant.variations?.filter((variantItem) => variantItem.showOnUi);
                                        if (isAnySubSubVariantAvl?.length == 0) subVariant.showOnUi = false;
                                        else subVariant.showOnUi = true;
                                    }
                                })
                                const isAnySubVariantAvl = variant.variations?.filter((variantItem) => variantItem.showOnUi);
                                if (isAnySubVariantAvl?.length == 0) variant.showOnUi = false;
                                else variant.showOnUi = true;
                            }
                            if (variantIndex == item.variations?.length - 1) {
                                const isAnyVariantAvl = item.variations?.filter((variantItem) => variantItem.showOnUi);
                                if (isAnyVariantAvl?.length == 0) item.showOnUi = false;
                                else item.showOnUi = true;
                            }
                        })
                    } else {
                        //if variations not presents then do not apply group filter
                        item.showOnUi = true;
                    }
                } else {
                    //if item inactive then do not show it on UI
                    item.showOnUi = false;
                }
                if (itemIndex == itemsList?.length - 1) {
                    const isAnyItemAvl = itemsList?.filter((itemData) => itemData.showOnUi);
                    if (isAnyItemAvl?.length == 0) res(false);
                    else res(true);
                }
            })
        } else res(true) //if item not present in category
    })
}

const filterCategoriesList = async (storeData, group) => {
    return new Promise((res, rej) => {
        const storeCategoriesCopy = storeData.categories ? storeData.categories?.sort((a, b) => (a.index > b.index) ? 1 : -1) : [];
        storeCategoriesCopy?.map(async (storeCategory, storeCategoryIndex) => {
            storeCategory.imagePaths = storeCategory.imagePaths ? storeCategory.imagePaths : [];
            if (storeCategory.imagePaths && storeCategory.imagePaths?.length != 0) {
                storeCategory.imagePaths = storeCategory.imagePaths.filter((i: any) => !i.deleted)
                storeCategory.imagePaths.map(async (imageObj) => {
                    imageObj.showOnUi = await validate_Item_Day_Date_Time_Group(group, imageObj);
                })
            } else storeCategory.imagePaths = [];
            storeCategory.categoryList = storeCategory.categoryList ? storeCategory.categoryList : [];
            storeCategory.itemList = storeCategory.itemList ? storeCategory.itemList : [];
            storeCategory.showOnUi = storeCategory.active ? true : false;
            storeCategory.showOnUi = !storeCategory.hideFromCatalogue && await validate_Item_Day_Date_Time_Group(group, storeCategory);
            if (storeCategory?.categoryList && (storeCategory?.categoryList.length != 0)) {
                const subCategoryCopy = storeCategory?.categoryList ? storeCategory?.categoryList?.sort((a, b) => (a.index > b.index) ? 1 : -1) : [];
                subCategoryCopy?.map(async (subCategory, subCategoryIndex) => {
                    subCategory.showOnUi = (subCategory.active && storeCategory.showOnUi) ? true : false;
                    subCategory.showOnUi = !subCategory.hideFromCatalogue && subCategory.showOnUi ? await validate_Item_Day_Date_Time_Group(group, subCategory) : false;
                    if (subCategory.categoryList && subCategory?.categoryList.length != 0) {
                        const subSubCategoryCopy = subCategory?.categoryList ? subCategory?.categoryList?.sort((a, b) => (a.index > b.index) ? 1 : -1) : [];
                        subSubCategoryCopy.map(async (subSubCategory, subSubCategoryIndex) => {
                            //if any parent category is inactive
                            subSubCategory.showOnUi = (subSubCategory.active && subCategory.showOnUi && storeCategory.showOnUi && storeCategory.active) ? true : false;
                            subSubCategory.showOnUi = !subSubCategory.hideFromCatalogue && subSubCategory.showOnUi ? await validate_Item_Day_Date_Time_Group(group, subSubCategory) : false;
                            filterItemsList(subSubCategory.itemList, subSubCategory.showOnUi, group, subSubCategory).then((result) => {
                                subSubCategory.showOnUi = (subSubCategory.showOnUi && storeCategory.showOnUi && storeCategory.active) ? result : false;
                                if (subSubCategoryIndex == subCategory.categoryList?.length - 1) {
                                    const isAnySubSubCategoryAvl = subCategory.categoryList?.filter((categoryItem) => categoryItem.showOnUi);
                                    if (isAnySubSubCategoryAvl?.length == 0 && storeCategory.showOnUi) subCategory.showOnUi = false;
                                    else if (subCategory.showOnUi && storeCategory.showOnUi) subCategory.showOnUi = true;

                                    const isAnySubCategoryAvl = storeCategory.categoryList?.filter((categoryItem) => categoryItem.showOnUi);
                                    if (isAnySubCategoryAvl?.length == 0 && storeCategory.showOnUi) storeCategory.showOnUi = false;
                                    else if (storeCategory.showOnUi && storeCategory.active) storeCategory.showOnUi = true;
                                }
                            })
                        })
                    } else {
                        filterItemsList(subCategory.itemList, subCategory.showOnUi, group, subCategory).then((result) => {
                            subCategory.showOnUi = (subCategory.showOnUi && storeCategory.showOnUi) ? result : false;
                            if (subCategoryIndex == storeCategory.categoryList?.length - 1) {
                                const isAnySubCategoryAvl = storeCategory.categoryList?.filter((categoryItem) => categoryItem.showOnUi);
                                if (isAnySubCategoryAvl?.length == 0) storeCategory.showOnUi = false;
                                else if (storeCategory.showOnUi) storeCategory.showOnUi = true;
                            }
                        })
                    }
                })
            } else {
                if (storeCategory.itemList.length == 0) {
                    storeCategory.showOnUi = false;
                } else {
                    filterItemsList(storeCategory.itemList, storeCategory.showOnUi, group, storeCategory).then((result) => {
                        storeCategory.showOnUi = (result && storeCategory.active) ? storeCategory.showOnUi : false;
                    })
                }
            }
            if (storeCategoryIndex == storeCategoriesCopy?.length - 1) res(storeCategoriesCopy);
        })
    })
}

const getCategoryDetails = (filteredCategories, curatedItemData, group) => {
    return new Promise((res, rej) => {
        filteredCategories?.map(async (storeCategory) => {
            if (storeCategory.name === curatedItemData.name) {
                curatedItemData.categoryDetails = storeCategory;
                curatedItemData.showOnUi = storeCategory.showOnUi;
                res(curatedItemData);
            } else {
                if (storeCategory.categoryList && storeCategory.categoryList?.length != 0) {
                    storeCategory?.categoryList?.map(async (subCategory) => {
                        if (subCategory.name === curatedItemData.name) {
                            curatedItemData.categoryDetails = subCategory;
                            curatedItemData.showOnUi = subCategory.showOnUi;
                            res(curatedItemData);
                        } else {
                            if (subCategory.categoryList && subCategory.categoryList?.length != 0) {
                                subCategory?.categoryList?.map(async (subSubCategory) => {
                                    if (subSubCategory.name === curatedItemData.name) {
                                        curatedItemData.categoryDetails = subSubCategory;
                                        curatedItemData.showOnUi = subSubCategory.showOnUi;
                                        res(curatedItemData);
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    })
}

export const getItemsList = (filteredCategories) => {
    return new Promise((res, rej) => {
        let itemsList = [];
        filteredCategories?.map((category) => {
            if (category.categoryList && category?.categoryList.length != 0) {
                category?.categoryList?.map((subCategory) => {
                    if (subCategory.categoryList && subCategory?.categoryList.length != 0) {
                        subCategory?.categoryList?.map((subSubCategory) => {
                            if (subSubCategory.itemList) {
                                // subSubCategory.itemList.map((item) => {
                                //     item.categoryName = subSubCategory.name;
                                // })
                                itemsList = [...itemsList, ...subSubCategory.itemList];
                            }
                        })
                    } else {
                        if (subCategory.itemList) {
                            // subCategory.itemList.map((item) => {
                            //     item.categoryName = subCategory.name;
                            // })
                            itemsList = [...itemsList, ...subCategory.itemList];
                        }
                    }
                })
            } else {
                if (category.itemList) {
                    // category.itemList.map((item) => {
                    //     item.categoryName = category.name;
                    // })
                    itemsList = [...itemsList, ...category.itemList];
                }
            }
        })
        itemsList = itemsList.sort((a, b) => (a.index > b.index) ? 1 : -1)
        res(itemsList);
    })
}

//filter curated group on the basis of group
export const prepareStoreData = (storeData, group) => {
    return new Promise((res, rej) => {
        if (storeData && storeData.storeId && group) {
            //category and items validations
            const storeCopy = storeData;
            filterCategoriesList(storeCopy, group).then((filteredCategories) => {
                storeCopy.categories = filteredCategories;
                storeCopy.categories = storeCopy.categories.sort((a, b) => (a.index > b.index) ? 1 : -1)
                storeCopy.curatedGroups && storeCopy.curatedGroups?.map(async (curatedGroupData, curatedGroupDataIndex) => {
                    curatedGroupData.showOnUi = await validate_Item_Day_Date_Time_Group(group, curatedGroupData);
                    curatedGroupData.curatedCategories = curatedGroupData.curatedCategories ? curatedGroupData.curatedCategories : [];
                    if (curatedGroupData.curatedCategories.length != 0 && curatedGroupData.showOnUi) {
                        curatedGroupData.curatedCategories = curatedGroupData.curatedCategories.sort((a, b) => (a.index > b.index) ? 1 : -1)
                        curatedGroupData.curatedCategories && curatedGroupData.curatedCategories?.map(async (curatedCategoryData, curatedCategoryDataIndex) => {
                            curatedCategoryData.showOnUi = await validate_Item_Day_Date_Time_Group(group, curatedCategoryData);
                            if (curatedCategoryData.curatedItems && curatedCategoryData.showOnUi) {
                                curatedCategoryData.curatedItems = curatedCategoryData.curatedItems.sort((a, b) => (a.index > b.index) ? 1 : -1)
                                curatedCategoryData.curatedItems && curatedCategoryData.curatedItems?.map(async (curatedItemData, curatedItemDataIndex) => {
                                    curatedItemData.showOnUi = await validate_Item_Day_Date_Time_Group(group, curatedItemData);
                                    if (curatedCategoryData.entityType === 'category') {
                                        getCategoryDetails(filteredCategories, curatedItemData, group).then((data) => {
                                            curatedItemData = data;
                                            if (curatedItemData?.categoryDetails?.categoryList && curatedItemData.categoryDetails.categoryList.length != 0) {
                                                curatedItemData.categoryDetails.categoryList?.map((subCategory) => {          //subCategory curatedItemData.categoryDetails 2nd level
                                                    if (subCategory.categoryList && subCategory.categoryList.length != 0) {
                                                        subCategory.categoryList?.map((subSubCategory) => {          //subsubCategory curatedItemData.categoryDetails 3rd level
                                                            if (subSubCategory.categoryList && subSubCategory.categoryList?.length != 0) {
                                                                // console.log()
                                                            } else {
                                                                if (curatedGroupData.showOnUi && curatedCategoryData.showOnUi && curatedItemData.categoryDetails.showOnUi && subCategory.showOnUi && subSubCategory.showOnUi) {
                                                                    curatedGroupData.showOnUi = curatedCategoryData.showOnUi = curatedItemData.categoryDetails.showOnUi = subCategory.showOnUi = subSubCategory.showOnUi;
                                                                }
                                                            }
                                                        })
                                                    } else {
                                                        if (curatedGroupData.showOnUi && curatedCategoryData.showOnUi && curatedItemData.categoryDetails.showOnUi && subCategory.showOnUi) {
                                                            curatedGroupData.showOnUi = curatedGroupData.showOnUi || (curatedCategoryData.showOnUi = curatedItemData.categoryDetails.showOnUi = subCategory.showOnUi);
                                                        }
                                                    }
                                                })
                                            } else {
                                                if (curatedGroupData.showOnUi && curatedCategoryData.showOnUi && curatedItemData.categoryDetails.showOnUi) {
                                                    curatedGroupData.showOnUi = curatedCategoryData.showOnUi = curatedItemData.categoryDetails.showOnUi;
                                                }
                                            }
                                        })
                                    } else if (curatedCategoryData.entityType === 'items') {
                                        curatedItemData = { ...curatedItemData, ...curatedItemData.item }
                                        curatedItemData.showOnUi = await validate_Item_Day_Date_Time_Group(curatedItemData.group || 'both', curatedItemData.item);
                                    } else if (curatedCategoryData.entityType === 'images') {
                                        curatedItemData.showOnUi = curatedCategoryData.showOnUi;
                                        curatedItemData.showOnUi = await validate_Item_Day_Date_Time_Group(group, curatedItemData);
                                        // curatedCategoryData.showOnUi = true;
                                    }
                                    if (curatedItemDataIndex == curatedCategoryData.curatedItems?.length - 1) {
                                        const isAnyCuratedItemAvl = curatedCategoryData.curatedItems && curatedCategoryData.curatedItems?.filter((curatedItem) => curatedItem.showOnUi);
                                        if (isAnyCuratedItemAvl && isAnyCuratedItemAvl?.length != 0) curatedCategoryData.showOnUi = true;
                                        else curatedCategoryData.showOnUi = false;
                                    }
                                })
                            }
                            if (curatedCategoryDataIndex == curatedGroupData.curatedCategories?.length - 1) {
                                const isAnyCuratedCatAvl = curatedGroupData.curatedCategories?.filter((curatedCat) => curatedCat.showOnUi);
                                if (isAnyCuratedCatAvl && isAnyCuratedCatAvl?.length != 0) curatedGroupData.showOnUi = true;
                                else curatedGroupData.showOnUi = false;
                            }
                        })
                    }
                })
            })

            //sliders validations
            storeCopy.sliders && storeCopy.sliders?.map(async (sliderData) => {
                sliderData.showOnUi = await validate_Item_Day_Date_Time_Group(group, sliderData);
            })
            storeCopy.curatedGroups = storeCopy.curatedGroups.sort((a, b) => (a.index > b.index) ? 1 : -1)
            if (storeCopy.sliders) {
                storeCopy.sliders = storeCopy.sliders?.filter((data) => data.active);
                storeCopy.sliders = storeCopy.sliders?.sort((a, b) => (a.index > b.index) ? 1 : -1)
            } else {
                storeCopy.sliders = [];
            }

            setTimeout(() => {
                if (storeCopy.curatedGroups && storeCopy.curatedGroups.length) {
                    storeCopy.curatedGroups && storeCopy.curatedGroups?.map(async (curatedGroupData, index) => {
                        if (curatedGroupData.showOnUi && ('group' in curatedGroupData) && curatedGroupData.group) {
                            curatedGroupData.showOnUi = await validate_Item_Day_Date_Time_Group(group, curatedGroupData);
                            curatedGroupData.showOnUi = (curatedGroupData.group.toLowerCase() === 'all' || group.toLowerCase() === 'all' || curatedGroupData.group.toLowerCase() === 'both' || group.toLowerCase() === 'both') ?
                                true : (curatedGroupData.group.toLowerCase() === group.toLowerCase());
                        }
                        curatedGroupData.curatedCategories.map(async (categoryData, curatedCategoryDataIndex) => {
                            if (categoryData.showOnUi && ('group' in categoryData) && categoryData.group) {
                                categoryData.showOnUi = (categoryData.group.toLowerCase() === 'all' || group.toLowerCase() === 'all' || categoryData.group.toLowerCase() === 'both' || group.toLowerCase() === 'both') ?
                                    true : (categoryData.group.toLowerCase() === group.toLowerCase());
                            }

                            if (curatedCategoryDataIndex == curatedGroupData.curatedCategories?.length - 1) {
                                const isAnyCuratedCatAvl = curatedGroupData.curatedCategories?.filter((curatedCat) => curatedCat.showOnUi);
                                if (isAnyCuratedCatAvl && isAnyCuratedCatAvl?.length != 0 && curatedGroupData.showOnUi) curatedGroupData.showOnUi = true;
                                else curatedGroupData.showOnUi = false;
                            }
                        })
                        if (index == storeCopy.curatedGroups.length - 1) {
                            res(storeCopy)
                        }
                    })
                } else {
                    res({ ...storeCopy });
                }
            });
        }
    })
}
