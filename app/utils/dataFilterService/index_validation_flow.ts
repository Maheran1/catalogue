const validate_Item_Day_Date_Time_Group = (activeGroup, item, status = false) => {
    const currentDate = new Date();
    const currentday = currentDate.toLocaleString('en-us', { weekday: 'long' }).substring(0, 3);
    let isValidtiming = false;
    let isValidDate = false;
    let isValidDay = false;
    let isValidGroup = false;
    if (item) {
        try {
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

            //validation for activeGroup
            if (('group' in item) && item.group) {
                isValidGroup = (item.group.toLowerCase() === 'both' || activeGroup.toLowerCase() === 'both') ? true : (item.group.toLowerCase() === activeGroup.toLowerCase());
            } else isValidGroup = true;

            //check all validation
            return new Promise((res, rej) => {
                if (!Boolean(item.hideFromCatalogue) && isValidDate && isValidDay && isValidtiming && isValidGroup && item.active) res(true);
                else res(false);
            })
        } catch (error: any) {
            return new Promise((res, rej) => {
                res(false);
            })
        }
    } else {
        return new Promise((res, rej) => {
            res(false);
        })
    }
}

const filterVariation = (activeGroup: any, variation: any) => {
    return new Promise(async (res, rej) => {
        variation.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, variation);
        if (variation.variations && variation.showOnUi && variation.variations.length != 0) {
            variation.variations?.map(async (subVariant: any) => {
                subVariant = await filterVariation(activeGroup, subVariant)
            })
            const isAnySubSubVariantAvl = variation.variations?.filter((variantItem: any) => variantItem.showOnUi);
            if (isAnySubSubVariantAvl?.length == 0) variation.showOnUi = false;
            else variation.showOnUi = true;
        }
        res(variation);
    })
}

const filterItemsList = (activeGroup: any, itemsList: any, categoryCheck: any, categoryDetails: any) => {
    return new Promise((res, rej) => {
        if (itemsList?.length != 0) {
            itemsList = itemsList?.sort((a: any, b: any) => (a.index > b.index) ? 1 : -1)
            itemsList?.map(async (item: any, itemIndex: any) => {
                item.categoryName = categoryDetails.name;
                item.categoryId = categoryDetails.id;
                item.imagePaths = item.imagePaths ? item.imagePaths : [];
                item.variations = item.variations ? item.variations : [];
                item.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, item);
                if (item.active && item.showOnUi && categoryCheck) {
                    if (item.variations.length != 0) {
                        item.variations.map(async (variant: any, variantIndex: any) => {
                            variant = await filterVariation(activeGroup, variant);
                            if (variantIndex == item.variations?.length - 1) {
                                const isAnyVariantAvl = item.variations?.filter((variantItem: any) => variantItem.showOnUi);
                                if (isAnyVariantAvl?.length == 0) item.showOnUi = false;
                                else item.showOnUi = true;
                            }
                        })
                    } else {
                        //if variations not presents then do not apply activeGroup filter
                        item.showOnUi = true;
                    }
                } else {
                    //if item inactive then do not show it on UI
                    item.showOnUi = false;
                }
                if (itemIndex == itemsList?.length - 1) {
                    const isAnyItemAvl = itemsList?.filter((itemData: any) => itemData.showOnUi);
                    if (isAnyItemAvl?.length == 0) res([]);
                    else res(itemsList);
                }
            })
        } else res([]) //if item not present in category
    })
}

const filterIndevidualCategory = async (activeGroup: any, category: any) => {
    return new Promise(async (res, rej) => {
        category.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, category);
        if (category.showOnUi) {
            category.imagePaths = category.imagePaths || [];
            category.imagePaths = category.imagePaths.filter((i: any) => !i.deleted)
            category.imagePaths.map(async (imageObj) => {
                imageObj.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, imageObj);
            })
            category.categoryList = category.categoryList || [];
            category.itemList = category.itemList || [];
            if (category?.categoryList && category?.categoryList?.length != 0) {
                category.categoryList?.map(async (subcat: any) => {
                    subcat = await filterIndevidualCategory(activeGroup, subcat)
                })
                let isAnyDisplaySubcat = category?.categoryList?.filter((cat: any) => cat.showOnUi);
                category.showOnUi = isAnyDisplaySubcat?.length != 0 ? true : false;
            } else if (category?.itemList && category?.itemList?.length != 0) {//3rd level itemslist
                filterItemsList(activeGroup, category?.itemList, category.showOnUi, category).then((filteredItems: any) => {
                    category.itemList = filteredItems || [];
                    category.showOnUi = filteredItems?.length != 0 ? true : false;
                })
            } else category.showOnUi = false;
        } else category.showOnUi = false;
        console.log('filterIndevidualCategory call res')
        res(category);
    })
}

const filterCategoriesList = async (activeGroup, storeData) => {
    return new Promise((res, rej) => {
        const storeCategoriesCopy = storeData.categories ? storeData.categories?.sort((a, b) => (a.index > b.index) ? 1 : -1) : [];
        storeCategoriesCopy?.map(async (storeCategory, storeCategoryIndex) => {
            console.log('filterCategoriesList call')
            storeCategory = await filterIndevidualCategory(activeGroup, storeCategory);
            if (storeCategoryIndex == storeCategoriesCopy?.length - 1) res(storeCategoriesCopy);
        })
    })
}

const getCategoryDetails = (filteredCategories, curatedItemData, activeGroup) => {
    return new Promise((res, rej) => {
        filteredCategories?.map(async (storeCategory) => {
            if (storeCategory.name === curatedItemData.name) {
                curatedItemData.categoryDetails = storeCategory;
                curatedItemData.showOnUi = storeCategory.showOnUi;
                res(curatedItemData);
            } else {
                if (storeCategory.hasSubcategory) {
                    storeCategory?.categoryList?.map(async (subCategory) => {
                        if (subCategory.name === curatedItemData.name) {
                            curatedItemData.categoryDetails = subCategory;
                            curatedItemData.showOnUi = subCategory.showOnUi;
                            res(curatedItemData);
                        } else {
                            if (subCategory.hasSubcategory) {
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

const getItemsList = (filteredCategories) => {
    let itemsList = [];
    filteredCategories?.map((category) => {
        if (category.hasSubcategory && category?.categoryList.length != 0) {
            category?.categoryList?.map((subCategory) => {
                if (subCategory.hasSubcategory && subCategory?.categoryList.length != 0) {
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
    return itemsList;
}

//filter curated group on the basis of activeGroup
export const prepareStoreData = (storeData, activeGroup) => {
    return new Promise((res, rej) => {
        if (storeData && storeData.storeId && activeGroup) {
            //category and items validations
            const storeCopy = storeData;
            filterCategoriesList(activeGroup, storeCopy).then((filteredCategories) => {
                storeCopy.categories = filteredCategories;
                storeCopy.categories = storeCopy.categories.sort((a, b) => (a.index > b.index) ? 1 : -1)
                storeCopy.itemsList = getItemsList(filteredCategories);
                storeCopy.curatedGroups && storeCopy.curatedGroups?.map(async (curatedGroupData, curatedGroupDataIndex) => {
                    curatedGroupData.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, curatedGroupData);
                    if (curatedGroupData.showOnUi && curatedGroupData.curatedCategories && curatedGroupData.curatedCategories?.length != 0) {
                        curatedGroupData.curatedCategories = curatedGroupData.curatedCategories ? curatedGroupData.curatedCategories : [];
                        curatedGroupData.curatedCategories = curatedGroupData.curatedCategories.sort((a, b) => (a.index > b.index) ? 1 : -1)
                        curatedGroupData.curatedCategories && curatedGroupData.curatedCategories?.map(async (curatedCategoryData, curatedCategoryDataIndex) => {
                            curatedCategoryData.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, curatedCategoryData);
                            // if (curatedCategoryData.curatedItems && curatedCategoryData.curatedItems?.length != 0 && curatedCategoryData.showOnUi) {
                            //     curatedCategoryData.curatedItems = curatedCategoryData.curatedItems?.sort((a, b) => (a.index > b.index) ? 1 : -1)
                            //     curatedCategoryData.curatedItems && curatedCategoryData.curatedItems?.map(async (curatedItemData, curatedItemDataIndex) => {
                            //         curatedItemData.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, curatedItemData);
                            //         if (curatedCategoryData.entityType === 'category') {
                            //             getCategoryDetails(filteredCategories, curatedItemData, activeGroup).then((data) => {
                            //                 curatedItemData = data;
                            //                 if (curatedItemData?.categoryDetails?.hasSubcategory && curatedItemData.categoryDetails.categoryList.length != 0) {
                            //                     curatedItemData.categoryDetails.categoryList?.map((subCategory) => {          //subCategory curatedItemData.categoryDetails 2nd level
                            //                         if (subCategory.hasSubcategory && subCategory.categoryList.length != 0) {
                            //                             subCategory.categoryList?.map((subSubCategory) => {          //subsubCategory curatedItemData.categoryDetails 3rd level
                            //                                 if (subSubCategory.hasSubcategory) {
                            //                                     // console.log()
                            //                                 } else {
                            //                                     if (curatedGroupData.showOnUi && curatedCategoryData.showOnUi && curatedItemData.categoryDetails.showOnUi && subCategory.showOnUi && subSubCategory.showOnUi) {
                            //                                         curatedGroupData.showOnUi = curatedCategoryData.showOnUi = curatedItemData.categoryDetails.showOnUi = subCategory.showOnUi = subSubCategory.showOnUi;
                            //                                     }
                            //                                 }
                            //                             })
                            //                         } else {
                            //                             if (curatedGroupData.showOnUi && curatedCategoryData.showOnUi && curatedItemData.categoryDetails.showOnUi && subCategory.showOnUi) {
                            //                                 curatedGroupData.showOnUi = curatedGroupData.showOnUi || (curatedCategoryData.showOnUi = curatedItemData.categoryDetails.showOnUi = subCategory.showOnUi);
                            //                             }
                            //                         }
                            //                     })
                            //                 } else {
                            //                     if (curatedGroupData.showOnUi && curatedCategoryData.showOnUi && curatedItemData.categoryDetails.showOnUi) {
                            //                         curatedGroupData.showOnUi = curatedCategoryData.showOnUi = curatedItemData.categoryDetails.showOnUi;
                            //                     }
                            //                 }
                            //             })
                            //         } else if (curatedCategoryData.entityType === 'items') {
                            //             const itemDataFromFilterItems = storeCopy.itemsList?.filter((filterItem) => filterItem.name == curatedItemData.name);
                            //             curatedItemData.showOnUi = itemDataFromFilterItems?.length != 0 ? itemDataFromFilterItems[0].showOnUi : false;
                            //         } else if (curatedCategoryData.entityType === 'images') {
                            //             curatedItemData.showOnUi = curatedCategoryData.showOnUi;
                            //             curatedItemData.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, curatedItemData);
                            //             // curatedCategoryData.showOnUi = true;
                            //         }
                            //         if (curatedItemDataIndex == curatedCategoryData.curatedItems?.length - 1) {
                            //             // const isAnyCuratedItemAvl = curatedCategoryData.curatedItems && curatedCategoryData.curatedItems?.filter((curatedItem) => curatedItem.showOnUi);
                            //             // if (isAnyCuratedItemAvl && isAnyCuratedItemAvl?.length != 0) curatedCategoryData.showOnUi = true;
                            //             // else curatedCategoryData.showOnUi = false;
                            //         }
                            //     })
                            // } else {
                            //     curatedCategoryData.curatedItems = [];
                            // }
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
                sliderData.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, sliderData);
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
                            curatedGroupData.showOnUi = await validate_Item_Day_Date_Time_Group(activeGroup, curatedGroupData);
                            curatedGroupData.showOnUi = (curatedGroupData.group.toLowerCase() === 'all' || activeGroup.toLowerCase() === 'all' || curatedGroupData.group.toLowerCase() === 'both' || activeGroup.toLowerCase() === 'both') ?
                                true : (curatedGroupData.group.toLowerCase() === activeGroup.toLowerCase());
                        }
                        curatedGroupData.curatedCategories?.map(async (categoryData, curatedCategoryDataIndex) => {
                            if (categoryData.showOnUi && ('group' in categoryData) && categoryData.group) {
                                categoryData.showOnUi = (categoryData.group.toLowerCase() === 'all' || activeGroup.toLowerCase() === 'all' || categoryData.group.toLowerCase() === 'both' || activeGroup.toLowerCase() === 'both') ?
                                    true : (categoryData.group.toLowerCase() === activeGroup.toLowerCase());
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
                } else res({ ...storeCopy });
            });
        }
    })
}
