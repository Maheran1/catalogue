import { showError, showSuccess } from '@context/actions';
import SvgIcon from '@element/svgIcon'
import { Backdrop } from '@material-ui/core'
import { submitUserQuery } from '@storeData/user';
import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';

function UserQueryModal({ openModal, handleClose }) {

    const [error, setError] = useState({ id: '', text: '' });
    const storeData = useSelector((state: any) => state.store ? state.store.storeData : null);
    const dispatch = useDispatch();
    const [cookie, setCookie] = useCookies();
    const [userData, setUserCookie] = useState(cookie['user']);
    const storeMetaData = useSelector((state: any) => state.store ? state.store.storeMetaData : null);

    const emptyQueryObj = {
        "mobileNo": Boolean(userData) ? userData?.mobileNo : "",
        "name": Boolean(userData) ? `${userData?.firstName} ${userData?.lastName}` : "",
        "email": Boolean(userData) ? userData?.email : "",
        "service": "",
        "description": "",
        "tenantId": storeData.tenantId,
        "storeId": storeData.storeId,
    };
    const [userQueryDetails, setuserQueryDetails] = useState(emptyQueryObj);

    useEffect(() => {
        setuserQueryDetails(emptyQueryObj)
    }, [openModal])


    const onInputChange = (from, value, e = null) => {
        if (from == "mobileNo") {
            if (e.which === 38 || e.which === 40) {
                e.preventDefault();
                return
            }
        }
        const userQueryDetailsCopy = { ...userQueryDetails }
        userQueryDetailsCopy[from] = value;
        setuserQueryDetails(userQueryDetailsCopy)
        setError({ id: '', text: '' });
    }

    const isValidEmail = () => {
        if (!userQueryDetails.email) return false
        if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(userQueryDetails.email))) return false;
        else return true;
    }

    const isValidNumber = () => {
        if (!userQueryDetails.mobileNo) return false
        if (!(userQueryDetails.mobileNo && (!storeMetaData?.countryCode || storeMetaData?.countryCode?.includes('91')) ? userQueryDetails.mobileNo?.length == 10 : userQueryDetails.mobileNo?.length > 5)) return false;
        else return true;
    }

    const validateForm = () => {
        if (!userQueryDetails.name) {
            setError({ id: 'name', text: '' });
            dispatch(showError('Please  enter name'));
            return false;
        } else if (!isValidNumber()) {
            setError({ id: 'mobileNo', text: '' });
            dispatch(showError('Please  enter mobileNo'));
            return false;
        } else if (!isValidEmail()) {
            setError({ id: 'email', text: '' });
            dispatch(showError('Please enter valid email'));
            return false;
        } else if (!userQueryDetails.service) {
            setError({ id: 'service', text: '' });
            dispatch(showError('Please  enter service'));
            return false;
        } else return true
    }
    const onSubmitQuery = () => {
        if (validateForm()) {
            submitUserQuery(userQueryDetails).then(() => {
                dispatch(showSuccess('Enquiry submitted successfully'));
                handleClose();
            })
        }
    }

    return (
        <div className="confirmation-modal-wrap">
            <Backdrop
                className="backdrop-modal-wrapper confirmation-modal-wrap"
                open={openModal ? true : false}
            // onClick={() => handleClose(false)}
            >
                <div className="backdrop-modal-content query-modal-wrap" style={{ height: openModal ? 'auto' : '0px' }}>
                    {/* <div className="heading"></div> */}
                    <div className="modal-close" onClick={() => handleClose(false)}>
                        <SvgIcon icon="closeLarge" />
                    </div>
                    <div className="member-modal">
                        <div className='body-text'>Please complete the form below and a member of staff will be in touch  shortly</div>
                        <div className='body'>
                            <div id="name" className={`input-wrap-with-label ${Boolean(userQueryDetails.name) ? 'active' : ''} ${error.id == 'name' ? 'error' : ''}`}>
                                <div className="label"><span className="mandatory">*</span></div>
                                <div className={'form-label'}>First name & Last name</div>
                                <input className={error.id == 'name' ? 'input invalidInput' : 'input'}
                                    autoComplete="off"
                                    value={userQueryDetails.name || ''}
                                    onChange={(e) => onInputChange('name', e.target.value)}
                                    placeholder="First name & Last name" />
                            </div>
                            <div id="mobileNo" className={`input-wrap-with-label ${Boolean(userQueryDetails.mobileNo) ? 'active' : ''} ${error.id == 'mobileNo' ? 'error' : ''}`}>
                                <div className="label"><span className="mandatory">*</span></div>
                                <div className={'form-label'}>Mobile Number</div>
                                <input className={error.id == 'mobileNo' ? 'input invalidInput' : 'input'}
                                    autoComplete="off"
                                    type='number'
                                    value={userQueryDetails.mobileNo || ''}
                                    onChange={(e) => onInputChange('mobileNo', e.target.value, e)}
                                    placeholder="Mobile Number" />
                            </div>
                            <div id="email" className={`input-wrap-with-label ${Boolean(userQueryDetails.email) ? 'active' : ''} ${error.id == 'email' ? 'error' : ''}`}>
                                <div className="label"><span className="mandatory">*</span></div>
                                <div className={'form-label'}>Email</div>
                                <input className={error.id == 'email' ? 'input invalidInput' : 'input'}
                                    autoComplete="off"
                                    value={userQueryDetails.email || ''}
                                    onChange={(e) => onInputChange('email', e.target.value)}
                                    placeholder="Email" />
                            </div>
                            <div id="service" className={`input-wrap-with-label ${Boolean(userQueryDetails.service) ? 'active' : ''} ${error.id == 'service' ? 'error' : ''}`}>
                                <div className="label"><span className="mandatory">*</span></div>
                                <div className={'form-label'}>Service Interested In</div>
                                <input className={error.id == 'service' ? 'input invalidInput' : 'input'}
                                    autoComplete="off"
                                    value={userQueryDetails.service || ''}
                                    onChange={(e) => onInputChange('service', e.target.value)}
                                    placeholder="Service Interested In" />
                            </div>
                            <div id="description" className={`input-wrap-with-label ${Boolean(userQueryDetails.description) ? 'active' : ''} ${error.id == 'description' ? 'error' : ''}`}>
                                <div className="label"></div>
                                <div className={'form-label'}>Description</div>
                                <textarea
                                    className={error.id == 'description' ? 'input invalidInput' : 'input'}
                                    autoComplete="off"
                                    value={userQueryDetails.description || ''}
                                    onChange={(e) => onInputChange('description', e.target.value)}
                                    placeholder="Description"
                                >
                                    {userQueryDetails.description || ''}
                                </textarea>
                            </div>
                        </div>
                        <div className='contact-note'>
                            For more details, call us on
                            {storeMetaData?.phone1 && <a href={`tel:${storeMetaData?.phone1?.length == 10 ? `+${storeMetaData?.countryCode} ` : ''}${storeMetaData?.phone1}`}>
                                {storeMetaData?.phone1?.length == 10 ? `+${storeMetaData?.countryCode} ` : <>&nbsp;&nbsp;&nbsp;</>}{storeMetaData?.phone1}
                            </a>}
                        </div>
                        <div className="form-btn-wrap  clearfix">
                            <button className="primary-btn rounded-btn border-btn without-border-btn" onClick={() => handleClose(true)}>Cancel</button>
                            <button className="primary-btn rounded-btn" onClick={onSubmitQuery}>Submit</button>
                        </div>
                    </div>
                </div>
            </Backdrop>
        </div>
    )
}

export default UserQueryModal