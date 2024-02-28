import Footer from '@module/footer'
import { APISERVICE } from '@util/apiService/RestClient';
import { windowRef } from '@util/window';
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';

function Privacy() {
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);
    const privacyPolicyRef = React.createRef<HTMLDivElement>();
    const [privacyPolicy, setPrivacyPolicy] = React.useState('');
    useEffect(() => {
        APISERVICE.GET(process.env.NEXT_PUBLIC_GET_BASE_CATALOG_URL + `/staticdata?storeId=${storeMetaData.id}&tenantId=${storeMetaData.tenantId}&type=privacyPolicy`)
            .then((resp) => {
                if (resp?.data?.data) {
                    setPrivacyPolicy(resp?.data?.data?.privacyPolicy);
                }
            }).catch((err) => {
                console.log(err);
            })
    }, [])
    useEffect(() => {
        privacyPolicyRef.current!.innerHTML = privacyPolicy;
    }, [privacyPolicy])

    useEffect(() => {
        if (windowRef) window.scrollTo(0, 0);
    }, [windowRef])

    return (
        <div className="privacy-wrap" ref={privacyPolicyRef}></div>
    )
}
export default Privacy