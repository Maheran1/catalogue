import { showServicesCart, showSuccess } from '@context/actions';
import { replaceAppointmentServices } from '@context/actions/appointment';
import SvgIcon from '@element/svgIcon';
import { navigateTo } from '@util/routerService';
import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';

function AiOutlineDelete(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 1024 1024" height="1em" width="1em" {...props}><path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z" /></svg>;
}

function ServicesCartModal() {
    const modalRef = useRef(null);
    const [modalHeight, setModalHeight] = useState<any>('300px');
    const dispatch = useDispatch();
    const appointmentItems = useSelector((state: any) => state.appointmentServices);

    const onOutsideClick = (event: any) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            closeModal();
        }
    }

    useEffect(() => {
        if (appointmentItems.length == 0) dispatch(showServicesCart(false));
    }, [appointmentItems])


    const closeModal = () => {
        dispatch(showServicesCart(false))
    }

    const getSelectedVariationObj = (service) => {
        const selectedVariations = { variant: '', subVariant: '', subSubVariant: '', }
        if (service.variations?.length != 0) {
            let vObj = service.variations[0];
            selectedVariations.variant = vObj.name;//weekdays or weekend
            if (vObj.variations?.length != 0) {
                vObj = vObj.variations[0]
                selectedVariations.subVariant = vObj.name;//male or female
            }
            if (vObj.variations?.length != 0) {
                vObj = vObj.variations[0]
                selectedVariations.subSubVariant = vObj.name;//adult or kids
            }
        }
        return { ...selectedVariations };
    }

    const removeFromAppointment = (item: any) => {
        const appointmentItemsCopy = appointmentItems ? [...appointmentItems] : [];
        let cartItemIndex = null;
        appointmentItems.map((appointentItem, i) => {
            if ((appointentItem.id == item?.id)) {//get list of cart items having same service data as current pdp item
                if (appointentItem.variations?.length != 0) {
                    const cartVariations = getSelectedVariationObj(appointentItem);
                    if (JSON.stringify(cartVariations) === JSON.stringify(item.variations)) {//check for item of same service and selected variations
                        cartItemIndex = i;
                    }
                } else {
                    cartItemIndex = i;
                }
            }
        })
        appointmentItemsCopy.splice(cartItemIndex, 1);
        dispatch(replaceAppointmentServices(appointmentItemsCopy));
        dispatch(showSuccess('Service Removed', 2000));
    }

    return (
        <div className='services-cart-modal-wrap backdrop-modal-wrapper'
            onClick={onOutsideClick}
            style={{
                height: `${(appointmentItems && appointmentItems.length != 0) ? 'calc(100vh - calc(100vh - 100%))' : 0}`,
                overflow: `${(appointmentItems && appointmentItems.length != 0) ? 'unset' : 'hidden'}`,
                maxHeight: `${(appointmentItems && appointmentItems.length != 0) ? 'calc(100vh - calc(100vh - 100%))' : 0}`,
                backgroundColor: '#0000001f'
            }}>
            <div className='services-cart-modal-details backdrop-modal-content' ref={modalRef}>
                <div className='heading'>
                    Selected Services
                </div>
                <div className="modal-close" onClick={closeModal}>
                    <SvgIcon icon="close" width={20} height={20} />
                </div>
                <div className='services-list-wrap'>
                    {appointmentItems?.map((service: any) => {
                        return <div className="service-details" key={Math.random()}>
                            <div className="service-name">{service.name}
                                {service.variations && service.variations[0] && <>
                                    &nbsp;- {service.variations[0]?.name}
                                </>}
                            </div>
                            <div className="remove-service" onClick={() => removeFromAppointment(service)}>Delete</div>
                        </div>
                    })}
                </div>
                <div className="btn-wrap">
                    <div className="primary-btn" onClick={closeModal}>Add more services</div>
                    <div className="primary-btn" onClick={() => { closeModal(); navigateTo('appointment') }}>Book Appointment</div>
                </div>
            </div>
        </div>
    )
}

export default ServicesCartModal