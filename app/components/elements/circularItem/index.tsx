import { CIRCLE_NO_IMAGE } from '@constant/noImage';
import ImageGalleryModal from '@template/imageGalleryModal';
import Link from 'next/link';
import React, { useState } from 'react'
import { useSelector } from 'react-redux';

function circularItem({ item, config, handleClick }) {
    const itemUrl = item.name.toLowerCase().split(" ").join("-");
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);

    const [activeModalConfig, setactiveModalConfig] = useState<any>({ active: false, itemList: [], config: {}, noImage: CIRCLE_NO_IMAGE });

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
            {item.entityType === 'images' ? <>
                {/* //open images modal */}
                <div className="roundthreetile" {...config} onClick={() => onImageItemClick(item)}>
                    <div className="roundthreepic">
                        <img src={item.imagePath} alt={item.name} />
                    </div>
                    <div className="roundthreename">{item.name}</div>
                </div>
            </> :
                <Link href={baseRouteUrl + itemUrl} shallow={true}>
                    <div className="roundthreetile" {...config}>
                        <div className="roundthreepic">
                            <img src={item.imagePath} alt={item.name} />
                        </div>
                        <div className="roundthreename">{item.name}</div>
                    </div>
                </Link>
            }

            {activeModalConfig.active && <ImageGalleryModal
                itemsList={activeModalConfig.itemList}
                config={activeModalConfig.config}
                no_image={activeModalConfig.noImage}
                handleClick={() => setactiveModalConfig({ active: false, itemList: [], config: {}, noImage: CIRCLE_NO_IMAGE })} />}
        </>
    )


}

export default circularItem;