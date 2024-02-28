import AddressModal from '@module/addressModal';
import UserRegistrationModal from '@module/userRegistration';
import { getUserByTenantAndMobile } from '@storeData/user';
import { useEffect, useState } from 'react';
import { useCookies } from "react-cookie";
import { useSelector } from 'react-redux';

function MdEditLocation(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm-1.56 10H9v-1.44l3.35-3.34 1.43 1.43L10.44 12zm4.45-4.45l-.7.7-1.44-1.44.7-.7c.15-.15.39-.15.54 0l.9.9c.15.15.15.39 0 .54z" /></svg>;
}

function MdAddLocation(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm4 8h-3v3h-2v-3H8V8h3V5h2v3h3v2z" /></svg>;
}

function CgWorkAlt(props) {
    return <svg stroke="currentColor" fill="none" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path fillRule="evenodd" clipRule="evenodd" d="M17 7C17 5.34315 15.6569 4 14 4H10C8.34315 4 7 5.34315 7 7H6C4.34315 7 3 8.34315 3 10V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V10C21 8.34315 19.6569 7 18 7H17ZM14 6H10C9.44772 6 9 6.44772 9 7H15C15 6.44772 14.5523 6 14 6ZM6 9H18C18.5523 9 19 9.44772 19 10V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V10C5 9.44772 5.44772 9 6 9Z" fill="currentColor" /></svg>;
}

function AiOutlineHome(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 1024 1024" height="1em" width="1em" {...props}><path d="M946.5 505L560.1 118.8l-25.9-25.9a31.5 31.5 0 0 0-44.4 0L77.5 505a63.9 63.9 0 0 0-18.8 46c.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8a63.6 63.6 0 0 0 18.7-45.3c0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204zm217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z" /></svg>;
}

function GrLocation(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><path fill="none" stroke="#000" strokeWidth={2} d="M12,22 C12,22 4,16 4,10 C4,5 8,2 12,2 C16,2 20,5 20,10 C20,16 12,22 12,22 Z M12,13 C13.657,13 15,11.657 15,10 C15,8.343 13.657,7 12,7 C10.343,7 9,8.343 9,10 C9,11.657 10.343,13 12,13 L12,13 Z" /></svg>;
}

function FaUserEdit(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 640 512" height="1em" width="1em" {...props}><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h274.9c-2.4-6.8-3.4-14-2.6-21.3l6.8-60.9 1.2-11.1 7.9-7.9 77.3-77.3c-24.5-27.7-60-45.5-99.9-45.5zm45.3 145.3l-6.8 61c-1.1 10.2 7.5 18.8 17.6 17.6l60.9-6.8 137.9-137.9-71.7-71.7-137.9 137.8zM633 268.9L595.1 231c-9.3-9.3-24.5-9.3-33.8 0l-37.8 37.8-4.1 4.1 71.8 71.7 41.8-41.8c9.3-9.4 9.3-24.5 0-33.9z" /></svg>;
}

function ProfilePage() {

    const [openUserUpdationModal, setOpenUserUpdationModal] = useState(false);
    const [cookie, setCookie] = useCookies();
    const [userData, setUserData] = useState(cookie['user']);
    const [openAddressModal, setOpenAddressModal] = useState(false);
    const [selectedAddressToEdit, setSelectedAddressToEdit] = useState(null);
    const storeData: any = useSelector((state: any) => state.store.storeData);
    const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null);
    const [userAddresses, setUserAddresses] = useState([
        { type: 'Home', value: null, isNew: false, isEdited: false, icon: <AiOutlineHome /> },
        { type: 'Work', value: null, isNew: false, isEdited: false, icon: <CgWorkAlt /> },
        { type: 'Other', value: null, isNew: false, isEdited: false, icon: <GrLocation /> },
    ])

    useEffect(() => {
        if (cookie['user']) {
            const { tenantId, storeId, mobileNo } = cookie['user']
            getUserByTenantAndMobile(tenantId, storeId, mobileNo).then((res: any) => {
                if (res) {
                    setUserData(res);
                }
            })
        }
    }, [cookie])

    useEffect(() => {
        if (userData) {
            console.log("userData", userData)
            if (userData?.addressList) {
                const userAddressesCopy = [...userAddresses];
                userAddressesCopy.map((userAdd) => {
                    userData.addressList.map((data) => {
                        if (userAdd.type == data.type) {
                            userAdd.value = data;
                        }
                    })
                })
                setUserAddresses(userAddressesCopy);
            }
        }
    }, [userData])

    const handleAddressModalResponse = (address) => {
        if (address) {
            console.log(address)
            const newAddress = { ...address };
            const userAddressesCopy = [...userAddresses];
            userAddressesCopy.map((userAdd) => {
                if (userAdd.type == newAddress.type) {
                    userAdd.value = address;
                }
            })
            setUserAddresses(userAddressesCopy);
        }
        setSelectedAddressToEdit(null);
        setOpenAddressModal(false)
    }


    const editAddress = (address) => {
        setSelectedAddressToEdit(address);
        setOpenAddressModal(true);
    }

    const getDatesDiffInDays = (date1: any, date2: any) => {
        date1 = new Date(date1);
        date2 = new Date(date2);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        console.log(diffTime + " milliseconds");
        console.log(diffDays + " days");
        return diffDays;
    }

    const isMembershipAvailable = (membershipDetails: any) => {
        let isAvailable = false;
        if (membershipDetails) {
            if (membershipDetails.balanceAmount) isAvailable = true;
            if (membershipDetails.discount) isAvailable = true;
            if (membershipDetails.guestMembershipDiscount) isAvailable = Boolean(membershipDetails.guestMembershipDiscount[(new Date().toLocaleDateString('en-IN', { weekday: 'short' })).toLowerCase()]);
        }
        return isAvailable;
    }

    return (
        <div className="profile-page-wrap checkout-page-wrap">
            {userData && <div className="guest-details-wrap glass-card">
                <div className='sub-heading'>Guest Details</div>
                <div className="username">{userData.firstName} {userData.lastName}</div>
                <div className="usernumber">{userData.mobileNo}</div>
                <div className="usernumber">{userData.email}</div>
                <div className="edit-user-icon d-f-c" onClick={() => setOpenUserUpdationModal(true)}><FaUserEdit /></div>
            </div>}

            {(Boolean(userData?.loyalty) && Boolean(configData?.storeConfig?.basicConfig?.loyalty)) && Boolean(userData?.loyalty?.availablePointsProduct)
                && Boolean(userData?.loyalty?.availablePointsService) &&
                <div className="guest-details-wrap glass-card">
                    {Boolean(userData?.loyalty?.availablePointsAll) ? <div className='sub-heading'>Available Loyalty Points : {userData?.loyalty?.availablePointsAll} </div> : <>
                        {Boolean(userData?.loyalty?.availablePointsProduct) && <div className='sub-heading'>Available Product Loyalty Points : {userData?.loyalty?.availablePointsProduct} </div>}
                        {Boolean(userData?.loyalty?.availablePointsService) && <div className='sub-heading'>Available Service Loyalty Points : {userData?.loyalty?.availablePointsService} </div>}
                    </>}
                </div>}

            {(userData?.membership && Boolean(userData?.membership?.membershipCode) && configData?.storeConfig?.basicConfig?.membership) && <div className="guest-details-wrap glass-card">
                <div className='sub-heading'>Membership Details</div>
                <div className="username">{userData?.membership?.membershipName} Membership</div>
                {Boolean(userData?.membership?.membershipCode) && <div className="usernumber">Membership Id :{userData?.membership?.membershipCode}</div>}
                {userData?.membership?.typeId === 1 && <div className="usernumber">Available Balance: {storeData?.configData?.currencySymbol} {userData?.membership?.balanceAmount}</div>}
                {userData?.membership?.typeId === 3 && <div className="usernumber"> Available Hours: {(userData?.membership?.balanceMinutes / 60).toFixed(2)}hrs</div>}
                {userData?.membership?.toDate && <>
                    {(getDatesDiffInDays(new Date(userData?.membership?.toDate), new Date()) <= 10) && <>
                        <div className="usernumber error">{`Exprires in ${getDatesDiffInDays(new Date(userData?.membership?.toDate), new Date())} days`}</div>
                    </>}
                </>}
            </div>}

            {((!!userData?.advanceAmount || !!userData?.balAmount) && configData?.storeConfig?.basicConfig?.advance_and_balance) && <div className="guest-details-wrap glass-card">
                <div className='sub-heading'>Advances & Balances</div>
                {!!userData?.advanceAmount && <div className="usernumber">Advance Paid: {storeData?.configData?.currencySymbol} {userData?.advanceAmount}</div>}
                {!!userData?.balAmount && <div className="usernumber">Due Balance: {storeData?.configData?.currencySymbol} {userData?.balAmount}</div>}
            </div>}

            <div className="address-wrap glass-card">
                <div className="sub-heading">Delivery Address</div>
                {userAddresses.map((address) => {
                    return <div className={`add-type-details glass-card`} key={Math.random()} >
                        <div className="type-icon-wrap">
                            <div className="icon-wrap d-f-c">{address.icon}</div>
                            <div className="type-name">{address.type}</div>
                        </div>
                        {address.value && address.value.line ? <div className="address-details">
                            <div className="line">{address.value.line}</div>
                            <div className="line">
                                {address.value.area && <>{address.value.area},</>}
                                {address.value.city && <>{address.value.city},</>}
                                {address.value.code && <>{address.value.code}</>}
                            </div>
                            <div className="edit-address-icon d-f-c" onClick={() => editAddress(address.value)}><MdEditLocation /></div>
                        </div> :
                            <div className="address-details">
                                <div className="line">No address saved yet</div>
                                <div className="edit-address-icon d-f-c" onClick={() => setOpenAddressModal(true)}><MdAddLocation /></div>
                            </div>
                        }
                    </div>
                })}
            </div>

            {openUserUpdationModal && <UserRegistrationModal
                handleResponse={() => setOpenUserUpdationModal(false)}
                isApppGrpChangeOnUserGdrChange={true}
                open={true}
                fromPage="PROFILE"
                heading={'Update Profile Details'}
            />}
            <AddressModal
                open={openAddressModal}
                handleClose={(res) => handleAddressModalResponse(res)}
                addressToEdit={selectedAddressToEdit}
                userId={userData?.id}
            />
        </div>
    )
}


export default ProfilePage;