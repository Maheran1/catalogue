import { disableLoader, enableLoader } from '@context/actions';
import { getStoresByTenantIdMysql } from '@storeData/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function FaPhone(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 512 512" height="1em" width="1em" {...props}><path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z" /></svg>;
}

function MdEmail(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>;
}

function ImLocation(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 16 16" height="1em" width="1em" {...props}><path d="M8 0c-2.761 0-5 2.239-5 5 0 5 5 11 5 11s5-6 5-11c0-2.761-2.239-5-5-5zM8 8c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" /></svg>;
}

const StoreLocator = ({ storeData }) => {

    const [storesList, setStoresList] = useState([])
    const dispatch = useDispatch();
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);

    useEffect(() => {
        if (storeData.tenantId) {
            dispatch(enableLoader());
            getStoresByTenantIdMysql(storeData.tenantId).then((res: any) => {
                dispatch(disableLoader());
                setStoresList(res);
            }).catch((err) => {
                dispatch(disableLoader());
                console.log(err)
            })
        }
    }, [storeData])

    const onClickType = (type: any, data: any = {}) => {
        switch (type) {
            case 'phone':
                window.open(`tel:${data.phone?.length == 10 ? `${storeMetaData.countryCode} ` : ''}${data.phone}`, '_self')
                break;
            case 'location':
                window.open(`${data.googleMapUrl ? data.googleMapUrl : `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`}`, '_blank')
                break;
            case 'email':
                window.open(`mailto:${data.email}`, '_self')
                break;

            default:
                break;
        }
    }

    return (
        <div className='store-locator-wrap'>
            {storesList && storesList.length != 0 && storesList.map((storeData: any, i: number) => {
                return <div key={Math.random()} className='store-details'>
                    <div className='name'>{storeData.store}</div>
                    <div className="information-wrap">
                        <div className="icon glass-card" onClick={() => onClickType('location', storeData)}>
                            <ImLocation />
                        </div>
                        <span className="containt" style={{ textTransform: 'capitalize' }}>
                            <a href={storeData.googleMapUrl} rel="noreferrer" target="_blank">
                                {storeData.address}, {storeData.area}, {storeData.city}, {storeData.state}, {storeData.pincode}
                            </a>
                        </span>
                    </div>
                    <div className="information-wrap">
                        <div className="icon glass-card" onClick={() => onClickType('phone', storeData)}>
                            <FaPhone />
                        </div>
                        <span className="containt">
                            {storeData.phone && <a href={`tel:${storeData.phone?.length == 10 ? `+${storeMetaData.countryCode} ` : ''}${storeData.phone}`}>
                                {storeData.phone?.length == 10 ? `+${storeMetaData.countryCode} ` : <>&nbsp;&nbsp;&nbsp;</>}{storeData.phone}
                            </a>}
                            {storeData.phone1 && <><br /><a style={{ paddingLeft: '10px' }} href={`tel:+${storeMetaData.countryCode} ${storeData.phone1}`}> +${storeMetaData.countryCode} {storeData.phone1}</a></>}
                        </span>
                    </div>
                    {storeData.email && <div className="information-wrap">

                        <div className="icon glass-card" onClick={() => onClickType('email', storeData)}>
                            <MdEmail />
                        </div>
                        {/* <a href={`mailto:${storeData.email}`} rel="noreferrer" target="_blank" className='icon glass-card'><MdEmail /></a> */}
                        <span className="containt"> <a href={`mailto:${storeData.email}`} rel="noreferrer" target="_blank">{storeData.email}</a></span>
                    </div>}
                </div>
            })}
        </div>
    )
}

export default StoreLocator