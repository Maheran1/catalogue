import React, { useEffect } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import SvgIcon from '@element/svgIcon';
import router from 'next/router';

function SwitchStoreModal({ storeData, openModal, handleClose, storesList = [] }) {

    const keywords = storeData.keywords;

    useEffect(() => {
        if (openModal) document.body.classList.add("o-h")
        else document.body.classList.remove("o-h")
        return () => document.body.classList.remove("o-h")
    }, [openModal]);

    const onSelectStore = (store) => {
        const url = `/${storeData.tenant}-${storeData.tenantId}/${store.name}`
        router.push({ pathname: url }, '', { shallow: true });
        setTimeout(() => router.reload());
        handleClose(false)
    }

    return (
        <Backdrop
            className="backdrop-modal-wrapper"
            open={openModal ? true : false}
        >
            <div className="backdrop-modal-content  store-switch-wrap-content" style={{ height: openModal ? 'auto' : '0px' }}>
                <div className="heading">Select {Boolean(keywords?.branch) || "Store"}</div>
                <div className="modal-close" onClick={() => handleClose(false)}>
                    <SvgIcon icon="closeLarge" />
                </div>
                <div className="store-switch-wrap">
                    {storesList?.map((storeDetails: any, i) => {
                        return <button className={`store-btn ${storeData.storeId == storeDetails.id ? "active" : ""}`} onClick={() => onSelectStore(storeDetails)}>
                            <div className='name'>{storeDetails.name}</div>
                            <div className='address'>{storeDetails.address}, {storeDetails.area}, {storeDetails.city}, {storeDetails.state}, {storeDetails.pincode}</div>
                            {storeData.storeId == storeDetails.id && <div className='note'>Currently you're seeing this {Boolean(keywords?.branch) || "store"}</div>}
                        </button>
                    })}
                </div>
            </div>
        </Backdrop>
    );
}

export default SwitchStoreModal;