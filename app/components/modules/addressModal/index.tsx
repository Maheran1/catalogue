import { disableLoader, enableLoader } from '@context/actions';
import SvgIcon from '@element/svgIcon';
import Backdrop from '@material-ui/core/Backdrop';
import { updateUserAddress } from '@storeData/user';
import { showError, showSuccess } from 'app/redux/actions/alert';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

function AddressModal({ open, handleClose, addressToEdit, userId }) {

    const dispatch = useDispatch();
    const [error, seterror] = useState('');
    const [addressObj, setAddressObj] = useState({ id: null, line: '', landmark: '', city: '', area: '', code: '', type: 'Home' });

    useEffect(() => {
        if (addressToEdit) setAddressObj({ ...addressObj, ...addressToEdit })
        else setAddressObj({ id: null, line: '', landmark: '', city: '', area: '', code: '', type: 'Home' });
    }, [addressToEdit])

    const closeModal = () => {
        handleClose(null);
    }

    const onSaveClick = () => {
        if (!addressObj.line) {
            seterror('address');
        } else if (!addressObj.area) {
            seterror('area');
        } else if (!addressObj.city) {
            seterror('city');
        } else {
            dispatch(enableLoader());
            updateUserAddress(addressObj, userId)
                .then((user: any) => {
                    let updatedAdd = user.addressList.filter((a: any) => a.type == addressObj.type);
                    dispatch(disableLoader());
                    if (addressObj.id) dispatch(showSuccess('Address Updated', 2000));
                    else dispatch(showSuccess('Address Added', 2000));
                    handleClose(updatedAdd[0]);
                }).catch((error) => {
                    dispatch(disableLoader());
                    dispatch(showError('Something went wrong. please try again ', 2000));
                })
        }
    }

    return (
        <div className="address-modal-wrap">

            <Backdrop
                className="backdrop-modal-wrapper"
                open={open ? true : false}
            >
                <div className="backdrop-modal-content"
                    style={{ height: open ? '310px' : '0px' }}
                >
                    <div className="modal-close" onClick={closeModal}>
                        <SvgIcon icon="closeLarge" />
                    </div>
                    <div className="address-modal">
                        {addressToEdit?.id ? <div className='heading'>Update {addressToEdit?.type} Address</div> : <div className='heading'>Add {addressToEdit?.type} Address</div>}
                        <div className="address-form">
                            <div className="input-wrap">
                                <span className="label">Address*</span>
                                <input className={error == 'address' ? 'input invalidInput' : 'input'} autoComplete="off"
                                    value={addressObj.line}
                                    onChange={(e) => { setAddressObj({ ...addressObj, line: e.target.value }); seterror('') }} />
                                {error == 'address' && <div className="error">Please enter address</div>}
                            </div>
                            <div className="address-wrapper" >
                                <div className='input-wrap'>
                                    <span className="label">Area*</span>
                                    <input className={error == 'area' ? 'input invalidInput' : 'input'} autoComplete="off"
                                        value={addressObj.area}
                                        onChange={(e) => { setAddressObj({ ...addressObj, area: e.target.value }); seterror('') }} />
                                    {error == 'area' && <div className="error">Please enter area</div>}
                                </div>
                                <div className='input-wrap'>
                                    <span className="label">City*</span>
                                    <input className={error == 'city' ? 'input invalidInput' : 'input'} autoComplete="off"
                                        value={addressObj.city}
                                        onChange={(e) => { setAddressObj({ ...addressObj, city: e.target.value }); seterror('') }} />
                                </div>
                            </div>
                            <div className="address-wrapper">
                                <div className='input-wrap'>
                                    <span className="label">Landmark</span>
                                    <input className={error == 'landmark' ? 'input invalidInput' : 'input'} autoComplete="off"
                                        value={addressObj.landmark}
                                        onChange={(e) => { setAddressObj({ ...addressObj, landmark: e.target.value }); seterror('') }} />
                                    {error == 'landmark' && <div className="error">Please enter landmark</div>}
                                </div>
                                <div className='input-wrap'>
                                    <span className="label">Pincode</span>
                                    <input className={error == 'pincode' ? 'input invalidInput' : 'input'} autoComplete="off"
                                        value={addressObj.code}
                                        onChange={(e) => { setAddressObj({ ...addressObj, code: e.target.value }); seterror('') }} />
                                </div>
                            </div>
                        </div>
                        <div className="save-add-btn">
                            <div className='primary-btn border-btn' onClick={closeModal}>Cancel</div>
                            <div className='primary-btn' onClick={onSaveClick}>Save</div>
                        </div>
                    </div>
                </div>
            </Backdrop>
        </div>
    );
}

export default AddressModal;