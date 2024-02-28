import { LARGE_SLIDER_NO_IMAGE } from '@constant/noImage';
import { PRODUCT, SERVICE } from '@constant/types';
import ImageGalleryModal from '@template/imageGalleryModal';
import Link from 'next/link';
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { windowRef } from '@util/window';

function squareItem({ item, config, handleClick }) {
    const router = useRouter()
    const { keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);
    if (item && item.name) {
        const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
        let itemUrl = item.name.toLowerCase().split(" ").join("-");
        const endUrlSegment = (config.type == keywords[SERVICE]) ? 'srp' : (config.type == keywords[PRODUCT] ? 'prp' : '');
        itemUrl = config.type ? `${itemUrl}-${endUrlSegment}` : itemUrl;
        const [activeModalConfig, setactiveModalConfig] = useState<any>({ active: false, itemList: [], config: {}, noImage: LARGE_SLIDER_NO_IMAGE });

        const onImageItemClick = (item: any) => {
            if (item.curatedItems && item.curatedItems.length != 0) {
                const modalConfig = {
                    active: true,
                    itemList: item.curatedItems,
                    config: {},
                }
                setactiveModalConfig(modalConfig)
            }
        }

        return (
            <>
                {item.entityType === 'images' ?
                    //open images modal
                    <div className="boxtile" onClick={() => onImageItemClick(item)}>
                        <div className={config.withShadow ? 'boxpic box-shadow' : 'boxpic'}>
                            <img src={item.imagePath} alt={item.name} />
                        </div>
                        <div className={`boxname ${windowRef()?.location?.host == 'jannez-beauty-salon.respark.in' && 'underline'}`}>
                            {item.name}
                        </div>
                    </div>
                    :
                    <>
                        {config.redirection ?
                            <Link href={baseRouteUrl + itemUrl} shallow={true}>
                                <div className="boxtile">
                                    <div className={config.withShadow ? 'boxpic box-shadow' : 'boxpic'}>
                                        <img src={item.imagePath} alt={item.name} />
                                    </div>
                                    <div className={`boxname ${windowRef()?.location?.host == 'jannez-beauty-salon.respark.in' && 'underline'}`}>
                                        {item.name}
                                    </div>
                                </div>
                            </Link>
                            :
                            <div
                                className='boxtile'
                                // className={item.isSelected ? "boxtile active" : "boxtile"}
                                id={itemUrl} onClick={() => handleClick(item)}>
                                <div className={config.withShadow ? 'boxpic box-shadow' : 'boxpic'}>
                                    <img src={item.imagePath} alt={item.name} />
                                </div>
                                <div className={`boxname ${windowRef()?.location?.host == 'jannez-beauty-salon.respark.in' && 'underline'}`}>
                                    {item.name}
                                </div>
                            </div>
                        }
                    </>
                }
                {activeModalConfig.active && <ImageGalleryModal
                    itemsList={activeModalConfig.itemList}
                    config={activeModalConfig.config}
                    no_image={activeModalConfig.noImage}
                    handleClick={() => setactiveModalConfig({ active: false, itemList: [], config: {}, noImage: LARGE_SLIDER_NO_IMAGE })} />}
            </>
        )
    } else return null;
}

export default squareItem;
