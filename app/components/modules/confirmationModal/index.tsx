import React, { useEffect, useState } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import SvgIcon from '@element/svgIcon';

function ConfirmationModal({ openModal, title, message, buttonText, handleClose, secondaryButtonText = '' }) {

    useEffect(() => {
        if (openModal) document.body.classList.add("o-h")
        else document.body.classList.remove("o-h")
        return () => document.body.classList.remove("o-h")
    }, [openModal]);

    return (

        <div className="confirmation-modal-wrap">
            <Backdrop
                className="backdrop-modal-wrapper confirmation-modal-wrap"
                open={openModal ? true : false}
            // onClick={() => handleClose(false)}
            >
                <div className="backdrop-modal-content confirmation-modal" style={{ height: openModal ? '200px' : '0px' }}>
                    <div className="heading">{title}</div>
                    <div className="modal-close" onClick={() => handleClose(false)}>
                        <SvgIcon icon="closeLarge" />
                    </div>
                    <div className="member-modal">
                        <div className='body-text'>{message}</div>
                        <div className="form-btn-wrap">
                            <button className="primary-btn rounded-btn" onClick={() => handleClose(false)}>{buttonText}</button>
                            {secondaryButtonText && <button className="primary-btn rounded-btn border-btn without-border-btn" onClick={() => handleClose(true)}>{secondaryButtonText}</button>}
                        </div>
                    </div>
                </div>
            </Backdrop>
        </div>
    );
}

export default ConfirmationModal;