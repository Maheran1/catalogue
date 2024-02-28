import React, { useEffect, useState } from 'react'
import ProductPdp from "@template/productPdp";
import StaffPdp from "@template/staffPdp";
import ServicePdp from "@template/servicePdp";
import HeadMetaTags from "@module/headMetaTags";
import { getItemMetaTags } from '@util/metaTagsService';
import Home from '@template/Home';
import { useDispatch } from 'react-redux';
import { updatePdpItem, updatePdpItemStatus } from '@context/actions';
import { PRODUCT, SERVICE } from '@constant/types';
import { getItemsList } from '@util/dataFilterService';

function PdpPage({ url_Segment, storeData, metaTags }) {
    const { keywords } = storeData;
    const dispatch = useDispatch();
    const [pdpType, setPdpType] = useState('product');
    const [activeItem, setActiveItem] = useState(null);
    const [activeMmetaTags, setmetaTags] = useState(metaTags);

    useEffect(() => {
        if (url_Segment && storeData?.storeId) {
            getItemsList(storeData.categories).then((itemsList: any) => {
                const item = itemsList?.filter((storeItem) => storeItem.name.toLowerCase() === url_Segment);
                setmetaTags(getItemMetaTags(item[0]));
                if (item?.length) {
                    setActiveItem(item[0]);
                    dispatch(updatePdpItemStatus('fromSocialLink'));
                    dispatch(updatePdpItem(item[0]));
                    if (item[0].type === keywords[SERVICE]) {
                        setPdpType(keywords[SERVICE]);
                    } else if (item[0].type === keywords[PRODUCT]) {

                        setPdpType(keywords[PRODUCT]);
                    } else if (item[0].type === 'staff') {
                        setPdpType('staff');
                    }
                } else setPdpType('Item-Not-Found');
            });

        }
    }, [storeData, url_Segment])

    return (
        <div className="pdp-wrapper">
            {/* <HeadMetaTags title={activeMmetaTags.title} siteName={activeMmetaTags.siteName} description={activeMmetaTags.description} image={activeMmetaTags.image} /> */}
            {(pdpType === keywords[PRODUCT] || pdpType === keywords[SERVICE]) && <Home />}
            {/* {(pdpType === keywords[PRODUCT] || pdpType === keywords[SERVICE]) && activeItem && <Home />}
            {pdpType === 'staff' && activeItem && <StaffPdp item={activeItem} />} */}
            {pdpType === 'Item-Not-Found' && <div>Item Not Found</div>}
        </div>
    )
}
const mapStateToProps = (state) => {
    return {
        storeData: state?.store?.storeData
    }
}
// export default connect(mapStateToProps)(PdpPage);
export default PdpPage;