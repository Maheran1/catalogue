import React, { useState } from 'react'
import { SKILLED_STAFF_NO_IMAGE } from "@constant/noImage";
import Link from 'next/link';
import ImageGalleryModal from '@template/imageGalleryModal';
import { showError, updatePdpItem } from '@context/actions';
import { useSelector, useDispatch } from 'react-redux';
import router from 'next/router';
import { CATEGORY, IMAGES, ITEMS } from '@constant/types';
import { windowRef } from '@util/window';
import { navigateTo } from '@util/routerService';
import { getItemsList } from '@util/dataFilterService';

function HorizontalSquareGrid({ items, config }) {
    const dispatch = useDispatch();
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const [activeModalConfig, setactiveModalConfig] = useState<any>({ active: false, itemList: [], config: {}, noImage: SKILLED_STAFF_NO_IMAGE });
    const storeData = useSelector((state: any) => state.store ? state.store.storeData : null);

    const onItemClick = (item: any) => {

        if (item.entityType === ITEMS) {
            if (item.curatedItems && item.curatedItems.length == 1) {
                let itemData = item?.curatedItems[0]?.item || {};
                itemData = { ...item, ...itemData }
                getItemsList(storeData.categories).then((itemsList: any) => {
                    const sitem = itemsList?.find((i) => i.name.toLowerCase() === item?.curatedItems[0].name.toLowerCase());
                    // sitem && (itemData = { ...itemData, sitem })
                    if (sitem) {
                        dispatch(updatePdpItem(sitem));
                    } else {
                        dispatch(showError(`${item.type} not available`));
                    }
                });
            } else {
                let itemUrl = item.name.toLowerCase().split(" ").join("-");
                if (item.type == 'staff') itemUrl = itemUrl + '-pdp'
                navigateTo(itemUrl);
            }
        } else {
            if (item.curatedItems && item.curatedItems.length != 0) {
                const modalConfig = {
                    active: true,
                    itemList: item.curatedItems,
                    config: {},
                }
                setactiveModalConfig(modalConfig)
            }
        }
    }
    return (
        <>
            {items && items?.map((item, index) => {
                let itemUrl = item.name.toLowerCase().split(" ").join("-");
                if (item.type == 'staff') itemUrl = itemUrl + '-pdp'
                if (item.active && item.showOnUi && !item.hideFromCatalogue) {
                    if (!item.imagePath) item.imagePath = SKILLED_STAFF_NO_IMAGE;
                    if (item.entityType === IMAGES || item.entityType === ITEMS) {
                        //open images modal
                        return <div className="skilled-tile clearfix" key={Math.random()} {...config} onClick={() => onItemClick(item)}>
                            <div className="skilled-tile-pic">
                                <img src={item.imagePath} alt={item.name} />
                            </div>
                            <div className="skilled-tile-name">
                                <div className='cat-name' style={{ borderBottom: windowRef()?.location?.host == 'jannez-beauty-salon.respark.in' ? '1px solid gray' : 'unset' }}>{item.name}</div>
                            </div>
                        </div>
                    } else {
                        return <Link href={baseRouteUrl + itemUrl} shallow={true} key={Math.random()}>
                            <div className="skilled-tile clearfix" key={Math.random()} {...config}>
                                <div className="skilled-tile-pic">
                                    <img src={item.imagePath} alt={item.name} />
                                </div>
                                <div className="skilled-tile-name">
                                    <div className='cat-name' style={{ borderBottom: windowRef()?.location?.host == 'jannez-beauty-salon.respark.in' ? '1px solid gray' : 'unset' }}>{item.name}</div>
                                </div>
                            </div>
                        </Link>
                    }
                }
            })}
            {activeModalConfig.active && <ImageGalleryModal
                itemsList={activeModalConfig.itemList}
                config={activeModalConfig.config}
                no_image={activeModalConfig.noImage}
                handleClick={() => setactiveModalConfig({ active: false, itemList: [], config: {}, noImage: SKILLED_STAFF_NO_IMAGE })} />}
        </>
    )
}

export default HorizontalSquareGrid;
