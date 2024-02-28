import React, { useState, useEffect } from 'react'
import { useCookies } from "react-cookie";
import { getAppointmentById } from '@storeData/appointment';
import { APISERVICE } from '@util/apiService/RestClient';
import { useSelector, useDispatch } from 'react-redux';
import { showError } from '@context/actions';
import router from "next/router";
import { getFeedbackByAppointmentId } from '@storeData/feedback';
import { navigateTo } from '@util/routerService';

function FeedbackPage({ storeData, metaTags }) {
    const dispatch = useDispatch();
    const baseRouteUrl = useSelector((state: any) => state.store.baseRouteUrl);
    const activeGroup = useSelector((state: any) => state.activeGroup);
    const { configData } = storeData;
    const [appointmentData, setappointmentData] = useState(null)
    const [showFeedbackConfirmation, setShowFeedbackConfirmation] = useState(false);
    const [feedbackAlreadySubmitted, setFeedbackAlreadySubmitted] = useState(false);
    const [servicesList, setServicesList] = useState([]);
    const appointmentId = router.query.pagepath ? router.query.pagepath[1] : '';

    useEffect(() => {
        if (appointmentId) {
            getAppointmentById(appointmentId).then((appointmentDetails: any) => {
                if (appointmentDetails.guestName)
                    setappointmentData(appointmentDetails);
                getFeedbackByAppointmentId(appointmentId).then((feedbackDetails: any) => {
                    if (feedbackDetails) {
                        setFeedbackAlreadySubmitted(true);
                    }
                }).catch((error) => {
                    // console.log(error);
                })
            }).catch((error) => {
                console.log(error);
                setappointmentData('');
                // setappointmentData('Appointment data unavailable');
            })
        }
    }, [appointmentId])

    useEffect(() => {
        if (appointmentId && appointmentData && appointmentData.id) {
            const doneServicesList = appointmentData.expertAppointments;
            if (doneServicesList) {
                doneServicesList.map((service) => {
                    service.feedbackConfig = configData.storeConfig?.feedbackConfig;
                })
                setServicesList(doneServicesList);
            }
        }

    }, [storeData, appointmentData])

    const setActiveFeedbackOption = (serviceIndex, feedbackTypeIndex, typeOtionIndex) => {
        const servicesListCopy = JSON.parse(JSON.stringify(servicesList));
        servicesListCopy[serviceIndex].feedbackConfig.typeList[feedbackTypeIndex].typeOptions.map((option, oIndex) => {
            option.isSelected = false;
            if (oIndex <= typeOtionIndex) {
                option.isSelected = true;
            }
        })
        setServicesList(servicesListCopy);
    }

    const setCommentFeedback = (serviceIndex, value, feedbackTypeIndex) => {
        const servicesListCopy = JSON.parse(JSON.stringify(servicesList));
        servicesListCopy[serviceIndex].feedbackConfig.typeList[feedbackTypeIndex].remark = value;
        setServicesList(servicesListCopy);
    }

    const submitFeedback = () => {
        let isAnyError = false;
        const postFeedbackObj = {
            appointmentId: appointmentData.id,
            storeId: appointmentData.storeId,
            tenantId: appointmentData.tenantId,
            guestName: appointmentData.guestName,
            tenant: appointmentData.tenant,
            store: appointmentData.store,
            guestId: appointmentData.guestId,
            guestMobile: appointmentData.guestMobile,
            guestEmail: appointmentData.guestEmail,
            appointmentInstruction: appointmentData.instruction,
            expertName: appointmentData.expertName,
            expertId: appointmentData.expertId,
            feedbackList: [],
            expertFeedbackList: []
        }

        servicesList.map((service, serviceIndex) => {
            const feedbackList = [];
            service.feedbackConfig.typeList.map((typeData, typeDataIndex) => {
                if (typeData.active && !isAnyError) {
                    if (!typeData.canComment) {
                        const selectedValue = typeData.typeOptions.filter((data) => data.isSelected);
                        if (typeData.mandatory && selectedValue.length == 0) {
                            isAnyError = true;
                            dispatch(showError(`Please rate ${typeData.name} for ${service.expertName}`))
                        }
                        if (selectedValue.length !== 0) {
                            const feedbackType = {
                                entity: typeData.entity,
                                type: typeData.name,
                                value: selectedValue[selectedValue.length - 1].value,
                                remark: '',
                            }
                            feedbackList.push(feedbackType);
                        }
                    } else {
                        if (typeData.mandatory && !typeData.remark) {
                            isAnyError = true;
                            dispatch(showError(`Please enter ${typeData.name} for ${service.expertName}`))
                            return;
                        }
                        const feedbackType = {
                            entity: typeData.entity,
                            type: typeData.name,
                            value: '',
                            remark: typeData.remark,
                        }
                        feedbackList.push(feedbackType);
                    }
                }
                if (typeDataIndex == service.feedbackConfig.typeList.length - 1 && !isAnyError) {
                    postFeedbackObj.expertFeedbackList.push({
                        expertId: service.expertId,
                        category: service.serviceCategory,
                        service: service.service,
                        expertName: service.expertName,
                        feedbackList
                    })
                }
            })
            if (servicesList.length - 1 === serviceIndex && !isAnyError) {
                console.log('postFeedbackObj', postFeedbackObj)
                APISERVICE.POST(process.env.NEXT_PUBLIC_FEEDBACK, postFeedbackObj).then((res) => {
                    setShowFeedbackConfirmation(true);
                })
            }
        })
    }

    const redirectToHome = () => {
        navigateTo('home');
    }

    return (
        <div className="background-wrapper">
            <div className="background-image">
            </div>
            <div className="feedback-container">
                <div className="feedback-page-wrap">
                    {configData?.storeConfig?.feedbackConfig?.active ?
                        <>
                            {feedbackAlreadySubmitted ? <>
                                <div className="feedback-c-main-wrap">
                                    <div className="feedback-c-wrap">
                                        <div><img className="submit-logo" src={`/assets/images/${activeGroup}/order_confirm.png`} alt="Respark" style={{ width: '70%' }} /></div>
                                        <div className="submit-status">{appointmentData?.guestName}</div>
                                        <div className="submit-subtext">&#128151; Feedback is already submitted. &#128151;</div>
                                        {Boolean(configData?.storeConfig?.basicConfig?.catalogue) && <div><button className="submit-button" onClick={() => redirectToHome()}>Explore More Services</button></div>}
                                    </div>
                                </div>
                            </> :
                                <>
                                    {!appointmentData ? <div className="feedback-c-main-wrap">
                                        <div className="feedback-c-wrap">
                                            <div className="invalid-link">Appointment data unavailable</div>
                                            {storeData && storeData.storeId && Boolean(configData?.storeConfig?.basicConfig?.catalogue) && <button className="submit-button" onClick={() => redirectToHome()}>Explore More Services</button>}
                                        </div>
                                    </div> :
                                        <>
                                            {showFeedbackConfirmation ?
                                                <div className="feedback-c-main-wrap">
                                                    <div className="feedback-c-wrap">
                                                        <div><img className="submit-logo" alt="Respark" src={`/assets/images/${activeGroup}/order_confirm.png`} style={{ width: '70%' }} /></div>
                                                        <div className="submit-status">{appointmentData?.guestName}</div>
                                                        <div className="submit-subtext">&#128151; Thank you for giving your valuable time. &#128151;</div>
                                                        <div className="submit-subtext">Your feedback improves the quality of our service.</div>
                                                        {Boolean(configData?.storeConfig?.basicConfig?.catalogue) && <div><button className="submit-button" onClick={() => redirectToHome()}>Explore More Services</button></div>}
                                                    </div>
                                                </div> :
                                                <div className="feedback-wrap">
                                                    <img src="/assets/images/feedback/thank-you.png" alt="Respark" />
                                                    <div className="subtext"><strong>{appointmentData?.guestName}</strong> for visiting us.</div>
                                                    <div className="requestMsg">Please submit your feedback for</div>
                                                    {servicesList.length != 0 && servicesList.map((serviceData: any, serviceIndex: number) => {
                                                        return <div key={serviceIndex} className="feedback-wrap-outer">
                                                            <div className="expert-service-name-wrap">
                                                                <div className="expert-name">{serviceData?.expertName}</div>
                                                                <div className="service-name"><div className="service-category">{serviceData?.serviceCategory}</div> - {serviceData?.service}</div>
                                                            </div>
                                                            {serviceData.feedbackConfig?.typeList ?
                                                                <>
                                                                    {serviceData.feedbackConfig.typeList.map((feedbackType: any, feedbackTypeIndex: number) => {
                                                                        return <div key={feedbackTypeIndex}>
                                                                            {feedbackType.entity == "expert" && feedbackType.active && feedbackType.optional &&
                                                                                <div className="content-wrap">
                                                                                    <div className="criteria">{feedbackType.name}</div>
                                                                                    {feedbackType.typeOptions.map((typeOtion: any, typeOtionIndex: number) => {
                                                                                        return <div key={typeOtionIndex}>
                                                                                            <div onClick={(e) => setActiveFeedbackOption(serviceIndex, feedbackTypeIndex, typeOtionIndex)}>
                                                                                                {typeOtion.isSelected == true && <div><img src="/assets/images/feedback/star_sel.png" alt="Respark" /></div>}
                                                                                                {(!typeOtion.isSelected || typeOtion.isSelected == false) && <div><img src="/assets/images/feedback/star.png" alt="Respark" /></div>}
                                                                                            </div>
                                                                                        </div>
                                                                                    })}
                                                                                </div>
                                                                            }
                                                                            {feedbackType.entity == "store" && feedbackType.active && feedbackType.canComment &&
                                                                                <div> <div className="remarkTitle">Remark {!feedbackType.mandatory && <span className="font-ifAny">(if any)</span>}</div>
                                                                                    <textarea className="remark" value={feedbackType.remark} onChange={(e) => setCommentFeedback(serviceIndex, e.target.value, feedbackTypeIndex)}></textarea></div>
                                                                            }
                                                                        </div>

                                                                    })}
                                                                </>
                                                                :
                                                                null}
                                                        </div>
                                                    })}
                                                </div>
                                            }
                                        </>}
                                </>
                            }

                        </>
                        :
                        //feedback is disabled
                        <div className="feedback-c-main-wrap">
                            <div className="feedback-c-wrap">
                                <div className="invalid-link">Feedback data unavailable</div>
                                {storeData && storeData.storeId && Boolean(configData?.storeConfig?.basicConfig?.catalogue) && <button className="submit-button" onClick={() => redirectToHome()}>Explore More Services</button>}
                            </div>
                        </div>
                    }
                </div>
                {!showFeedbackConfirmation && !feedbackAlreadySubmitted && appointmentData && <div className="feedback-submit">
                    {Boolean(configData?.storeConfig?.basicConfig?.catalogue) && <button className='skip' onClick={redirectToHome}>Skip for now</button>}
                    <button onClick={submitFeedback}>Submit</button>
                </div>}
            </div>
        </div>
    )
}

export default FeedbackPage