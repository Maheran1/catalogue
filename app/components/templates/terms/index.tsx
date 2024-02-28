import React, { useEffect } from 'react'
import { APISERVICE } from '@util/apiService/RestClient';
import { windowRef } from '@util/window';
import { useSelector } from 'react-redux';

function Terms() {
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);
    const termsRef = React.createRef<HTMLDivElement>();
    const [terms, setTerms] = React.useState('');
    useEffect(() => {
        APISERVICE.GET(process.env.NEXT_PUBLIC_GET_BASE_CATALOG_URL + `/staticdata?storeId=${storeMetaData.id}&tenantId=${storeMetaData.tenantId}&type=terms`)
            .then((resp) => {
                if (resp?.data?.data) {
                    setTerms(resp?.data?.data?.terms);
                }
            }).catch((err) => {
                console.log(err);
            })
    }, [])
    useEffect(() => {
        termsRef.current!.innerHTML = terms;
    }, [terms])

    useEffect(() => {
        if (windowRef) window.scrollTo(0, 0);
    }, [windowRef])

    return (
        <div className="privacy-wrap" ref={termsRef}></div>
    )
}

export default Terms