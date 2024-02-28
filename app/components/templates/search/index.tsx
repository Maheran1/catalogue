import { PRODUCT, SERVICE } from '@constant/types';
import { updateSearchStatus } from '@context/actions';
import Item from '@element/horizontalItem';
import SvgIcon from '@element/svgIcon';
import HorizontalProductCard from '@module/horizontalProductCard';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

function SearchPage() {
    const [filteredList, setFilteredList] = useState({ filteredServices: [], filteredProducts: [] });
    const [itemToSearch, setitemToSearch] = useState('')
    const itemSearchRef = useRef<HTMLInputElement>(null);
    const storeData = useSelector((state: any) => state.store ? state.store.storeData : null);
    const keywords = storeData.keywords;
    const dispatch = useDispatch();

    useEffect(() => {
        document.body.classList.add("o-h")
        return () => {
            document.body.classList.remove("o-h")
        }
    }, []);

    useEffect(() => {
        if (!itemToSearch) itemSearchRef.current.focus();
    }, [itemToSearch])


    const filterCategory = async (category: any, searchQuery: any) => {
        return new Promise((res, rej) => {
            if (category.showOnUi) {
                category.display = false;
                if (category.name.toLowerCase().includes(searchQuery)) {
                    category.display = true;
                }
                if (category?.categoryList && category?.categoryList?.length != 0) {
                    category.categoryList?.map(async (subcat: any) => {
                        if (subcat.showOnUi) {
                            subcat = await filterCategory(subcat, category.display ? '' : searchQuery)
                        } else subcat.display = false;
                    })
                    let isAnyDisplaySubcat = category?.categoryList?.filter((cat: any) => cat.display);
                    category.display = isAnyDisplaySubcat?.length != 0 ? true : false;
                } else if (category?.itemList?.length != 0) {//3rd level itemslist
                    let filteredItems = category?.itemList;
                    if (searchQuery) filteredItems = category?.itemList.filter((item: any) => item.showOnUi && item.name.toLowerCase().includes(category.display ? '' : searchQuery));
                    filteredItems.map((item: any) => {
                        item.serviceId = item.id;
                        item.duration = item.durationType ? ((item.durationType?.includes('hrs')) ? (parseFloat(item.duration) * 60).toFixed(1) : parseFloat(item.duration)) : 30;
                    })
                    category.itemList = filteredItems;
                    category.display = filteredItems.length != 0 ? true : false;
                } else category.display = false;
            } else category.display = false;
            res(category);
        })
    }

    const searchItems = (searchQuery) => {
        let filteredListCopy = { filteredServices: [], filteredProducts: [] }
        setitemToSearch(searchQuery);
        if (searchQuery) {
            searchQuery = searchQuery ? searchQuery.toLowerCase() : '';
            const categoriesCopy = JSON.parse(JSON.stringify(storeData?.categories));
            categoriesCopy.map(async (catData: any, i: number) => {//1st level category
                let filteredCat: any = await filterCategory(catData, searchQuery);
                if (filteredCat.display) {
                    if (catData.type == keywords[PRODUCT]) {
                        filteredListCopy.filteredProducts.push(filteredCat);
                    } else if (catData.type == keywords[SERVICE]) {
                        filteredListCopy.filteredServices.push(filteredCat);
                    }
                }
                if (i == categoriesCopy.length - 1) {
                    setFilteredList({ ...filteredListCopy })
                }
            })
        } else setFilteredList({ ...filteredListCopy })
    }

    const renderCategoryItemsView = (category: any) => {
        if (category && category.display && !category.hideFromCatalogue) {
            return <div className={`items-cat-wrap clearfix ${(category?.categoryList && category?.categoryList.length != 0) ? 'has-sub-category' : ''}`}>
                <div className={`cat-name ${(category?.categoryList && category?.categoryList.length != 0) ? 'has-sub-category' : ''}`}>
                    {category.name}
                </div>
                {((category?.categoryList && category?.categoryList.length != 0) && category?.categoryList?.length != 0) ? <>
                    {category?.categoryList?.map((category: any) => {
                        return <React.Fragment key={category.id}>
                            {renderCategoryItemsView(category)}
                        </React.Fragment>
                    })}
                </> : <>
                    {(category?.itemList && category?.itemList?.length != 0) ? <>
                        {renderItems(category.itemList)}
                    </> : <></>}
                </>}
            </div>

        } else return null;
    }

    const renderItems = (itemsList: any) => {
        if (itemsList && itemsList?.length != 0) {
            return <React.Fragment>
                {itemsList?.map((item: any, itemIndex: number) => {
                    return <React.Fragment key={Math.random()}>
                        {item.showOnUi && !item.hideFromCatalogue && <Item item={item} config={{ redirection: false, onClickAction: true }} />}
                    </React.Fragment>
                })}
            </React.Fragment>
        } else return null;
    }


    const handleClose = () => {
        dispatch(updateSearchStatus(false));// update redux isItemSearchActive state to hide the search component
    }

    return (
        <div className="search-wrapper">
            <div className="mainheaderblock">
                <div className="searchwrap">
                    <span onClick={() => handleClose()} ><SvgIcon icon="backArrow" shape='circle' width={32} height={32} /></span>
                    <input ref={itemSearchRef} className="inputToSearch" value={itemToSearch} onChange={(e) => searchItems(e.target.value)} placeholder="Search service or product" />
                    {itemToSearch && <div onClick={() => searchItems('')} ><SvgIcon icon="close" /></div>}
                </div>
            </div>

            <div className="searched-item-list-wrap" style={{ backgroundColor: itemToSearch ? 'white' : '#9e9e9e70' }} onClick={() => itemToSearch ? {} : handleClose()} >

                {filteredList?.filteredServices.length != 0 && <div className="items-list">
                    <div className="heading">Services</div>
                    <>
                        {filteredList?.filteredServices.map((category: any, i: number) => {
                            return <React.Fragment key={Math.random()}>{renderCategoryItemsView(category)}</React.Fragment>
                        })}
                    </>
                </div>}

                {filteredList?.filteredProducts.length != 0 && <div className="items-list">
                    <div className="heading">Products</div>
                    <>
                        {filteredList?.filteredProducts.map((category: any, i: number) => {
                            return <React.Fragment key={Math.random()}>{renderCategoryItemsView(category)}</React.Fragment>
                        })}
                    </>
                </div>}
                {(filteredList?.filteredServices.length == 0 && filteredList?.filteredProducts.length == 0 && itemToSearch) && <div className="not-found">
                    Matching services/products not found
                </div>}
            </div>



        </div>
    )
}

export default SearchPage
