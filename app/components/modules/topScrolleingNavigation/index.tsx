import Link from 'next/link';
import React from 'react'
import { IMAGES, SERVICE, PRODUCT } from "@constant/types";
import { useSelector } from 'react-redux';

function ScrollingNavigation({ items, config, handleClick, activeCategory }) {
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const { keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);

    return (
        <div className="cat-navbar-cover">
            <ul className="cat-navbar-inner">
                {items ? items?.map((item, index) => {
                    let itemUrl = item.name.toLowerCase().split(" ").join("-");
                    const endUrlSegment = (config.type == keywords[SERVICE]) ? 'srp' : (config.type == keywords[PRODUCT] ? 'prp' : '');
                    itemUrl = config.type ? `${itemUrl}-${endUrlSegment}` : itemUrl;
                    if (item.active && item.showOnUi && !item.hideFromCatalogue && item.entityType !== IMAGES && (config.type ? config.type == item.type : true)) {
                        return <Link href={baseRouteUrl + itemUrl} key={Math.random()} shallow={true}>
                            <li className={activeCategory && activeCategory.name == item.name ? 'cat-nav-link active' : 'cat-nav-link'} key={Math.random()} onClick={() => handleClick(item)}>{item.name}</li>
                        </Link>
                    }
                }) :
                    null
                }
            </ul>
        </div>
    )
}

export default ScrollingNavigation;
