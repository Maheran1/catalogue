import { dynamicSort } from "@util/utils";
import { getValueFromCookies } from "@util/webstorage";

export function validate_Item_Day_Date_Time_Group(item) {
    const activeGroup = getValueFromCookies('grp');
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

    //validation for activeGroup
    if (('group' in item) && item.group) {
        isValidGroup = (item.group.toLowerCase() === 'both' || activeGroup.toLowerCase() === 'both') ? true : (item.group.toLowerCase() === activeGroup.toLowerCase());
    } else isValidGroup = true;

    return item;
    //check all validation
    if (isValidDate && isValidDay && isValidtiming && isValidGroup && item.active) return item;
    else return null;

}

export function getItemsList(allItemsList, category: any) {
    if (category.categoryList && category.categoryList.length != 0) {
        category.categoryList.map((cat: any) => {
            cat.showOnUi && (allItemsList = getItemsList(allItemsList, cat));
        })
    } else if (category.showOnUi && category.itemList && category.itemList?.length != 0) {
        allItemsList = [...allItemsList, ...(category.itemList.filter((i: any) => i.showOnUi))]
    }
    return allItemsList;
}

export function getItemPrice(item: any) {
    let price = item.price;
    let salePrice = item.salePrice;
    if (item.variations && item.variations.length != 0) {
        if (item.variations[0].variations && item.variations[0].variations.length != 0) {
            if (item.variations[0].variations[0].variations && item.variations[0].variations[0].variations.length != 0) {
                if (item.variations[0].variations[0].variations[0].variations && item.variations[0].variations[0].variations[0].variations.length != 0) {
                    price = item.variations[0].variations[0].variations[0].variations[0].price;
                    salePrice = item.variations[0].variations[0].variations[0].variations[0].salePrice;
                } else {
                    price = item.variations[0].variations[0].variations[0].price;
                    salePrice = item.variations[0].variations[0].variations[0].salePrice;
                }
            } else {
                price = item.variations[0].variations[0].price;
                salePrice = item.variations[0].variations[0].salePrice;
            }
        } else {
            price = item.variations[0].price;
            salePrice = item.variations[0].salePrice;
        }
    }
    return [price, salePrice];
}

export function getCurrentFilters(configData: any, type: any) {
    const filterObj: any = {}
    const filterConfigs = configData.storeConfig?.sparkConfig?.filterConfig ? configData.storeConfig?.sparkConfig?.filterConfig[type] : null;
    if (filterConfigs && filterConfigs.active) {
        if (filterConfigs.priceRange) {
            filterObj.minPrice = 0;
            filterObj.maxPrice = 0;
        }
        if (filterConfigs?.sortingConfig?.active) {
            if (filterConfigs?.sortingConfig.highPrice) filterObj.highPrice = false;
            if (filterConfigs?.sortingConfig.lowPrice) filterObj.lowPrice = false;
            if (filterConfigs?.sortingConfig.latest) filterObj.latest = false;
            if (filterConfigs?.sortingConfig.oldest) filterObj.oldest = false;
            if (filterConfigs?.sortingConfig.discount) filterObj.discount = false;
        }
    }
    return [filterObj, filterConfigs]
}

export function getFilters(configData: any, type: any) {
    const filterObj: any = {}
    const filterConfigs = configData.storeConfig?.sparkConfig?.filterConfig ? configData.storeConfig?.sparkConfig?.filterConfig[type] : null;
    if (filterConfigs && filterConfigs.active) {
        if (filterConfigs.priceRange) {
            filterObj.minPrice = 0;
            filterObj.maxPrice = 0;
        }
    }
    return filterObj;
}

export function getSortingFilters(configData: any, type: any) {
    const filterObj: any = {}
    const filterConfigs = configData.storeConfig?.sparkConfig?.filterConfig ? configData.storeConfig?.sparkConfig?.filterConfig[type] : null;
    if (filterConfigs && filterConfigs.active) {
        if (filterConfigs?.sortingConfig?.active) {
            if (filterConfigs?.sortingConfig.highPrice) filterObj.highPrice = false;
            if (filterConfigs?.sortingConfig.lowPrice) filterObj.lowPrice = false;
            if (filterConfigs?.sortingConfig.latest) filterObj.latest = false;
            if (filterConfigs?.sortingConfig.oldest) filterObj.oldest = false;
            if (filterConfigs?.sortingConfig.discount) filterObj.discount = false;
        }
    }
    return filterObj;
}

export function filterCategory(category, activeFilters, filterConfig) {
    if (category.categoryList && category.categoryList.length != 0) {
        category.categoryList.map((cat: any, catI: number) => {
            cat = filterCategory(cat, activeFilters, filterConfig);
            if (category.categoryList.length - 1 == catI) {
                let filteredCat = category.categoryList.filter((c: any) => c.showOnUi);
                category.categoryList = filteredCat;
                category.showOnUi = filteredCat.length != 0 ? true : false;
            }
        })
    } else if (category.itemList && category.itemList.length != 0) {
        category.itemList.map((item: any) => {
            let [price, salePrice] = getItemPrice(item);
            item.billPrice = salePrice || price;
            item.price = price;
            item.salePrice = salePrice;
            item.discount = salePrice ? Number((((price - salePrice) / price) * 100).toFixed(1)) : 0;
        })
        let filteredItem = category.itemList;
        if (filterConfig.priceRange) {
            filteredItem = category.itemList.filter((i: any) => i.billPrice >= (activeFilters.minPrice * (filterConfig.maxPrice / 100)) && i.billPrice <= (activeFilters.maxPrice * (filterConfig.maxPrice / 100)))
        }
        if (filteredItem.length != 0) {
            category.showOnUi = true;
            if (activeFilters.discount) filteredItem = filteredItem.sort(dynamicSort("discount", -1)); //1 == 0 1 2 3  || -1 == 3 2 1 0
            if (activeFilters.highPrice) filteredItem = filteredItem.sort(dynamicSort("billPrice", -1)); //1 == 0 1 2 3  || -1 == 3 2 1 0
            if (activeFilters.lowPrice) filteredItem = filteredItem.sort(dynamicSort("billPrice", 1)); //1 == 0 1 2 3  || -1 == 3 2 1 0
            if (activeFilters.latest) {
                let availableItems = [];
                category.itemList.map((i: any) => {
                    let item = filteredItem.filter((f: any) => f.id == i.id)
                    if (item.length != 0) availableItems.push(item[0]);
                })
                availableItems.reverse();
                filteredItem = availableItems;
            }
            if (activeFilters.oldest) {
                let availableItems = [];
                category.itemList.map((i: any) => {
                    let item = filteredItem.filter((f: any) => f.id == i.id)
                    if (item.length != 0) availableItems.push(item[0]);
                })
                filteredItem = availableItems;
            }
            category.itemList = filteredItem;

        } else {
            category.itemList = [];
            category.showOnUi = false;
        }
    }
    return category;
}