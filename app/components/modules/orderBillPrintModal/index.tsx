import { disableLoader, enableLoader } from '@context/actions';
import { getBillPrintByOrder } from '@storeData/common'
import { getItemsList } from '@util/dataFilterService';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';


const arLang = { "languageId": "ar", "displayName": "Arabic" }
const enLang = { "languageId": "en", "displayName": "English" }

function OrderBillPrintModal({ orderData }) {

    const wrapperRTef = useRef<any>();
    const storeData = useSelector((state: any) => state.store ? state.store.storeData : null);
    const [languagesList, setLanguagesList] = useState([enLang])
    const [activeLaguage, setactiveLaguage] = useState(null);
    const [showList, setshowList] = useState(false)
    const dispatch = useDispatch();
    const [noOrderData, setnoOrderData] = useState(true)

    useEffect(() => {
        if (storeData.languages) {
            setLanguagesList(storeData.languages);
            setactiveLaguage(Boolean(storeData?.languages?.length) ? storeData.languages[0] : enLang)
        } else {
            setactiveLaguage(enLang)
        }
    }, [storeData])


    const getBillPrintData = (orderData, activeLaguage) => {
        getBillPrintByOrder(orderData, activeLaguage.languageId).then((res: any) => {
            if (res?.data) {
                wrapperRTef.current.innerHTML = res?.data
                // console.log(wrapperRTef.current.innerHTML)
                setTimeout(() => {
                    const billContentEle: any = document.getElementById("billContent")
                    var billBodyStyle: any = billContentEle.getElementsByTagName("style");

                    billBodyStyle[0].sheet.cssRules[0].style.width = 'inherit';
                    billBodyStyle[0].sheet.cssRules[0].style.background = 'white';
                    billBodyStyle[0].sheet.cssRules[0].style.padding = 'unset';

                    var logoImage: any = billContentEle.getElementsByTagName("img");
                    var midEle: any = document.getElementById("mid")
                    midEle.style.width = "100%"
                    var botEle: any = document.getElementById("bot")
                    botEle.style.width = "100%"
                    logoImage[0].style.width = '200px';
                    logoImage[0].style.height = 'auto';
                    setnoOrderData(false)
                });
            }
            dispatch(disableLoader())
        })
            .catch(() => {
                dispatch(disableLoader())
            })
    }

    const getLangWiseName = (item: any, type: string, activeLaguage: any) => {
        //type = category or name
        //data = languages data
        let name = '';
        if (item && activeLaguage) {
            name = item[type]
            if (item.languagesData && activeLaguage.languageId && item.languagesData[activeLaguage.languageId]) {
                name = item.languagesData[activeLaguage.languageId][type]
            }
        }
        return name;
    }

    useEffect(() => {
        if (activeLaguage) {
            dispatch(enableLoader())
            const orderDataCopy = { ...orderData }
            getItemsList(storeData.categories).then((itemsList: any) => {
                orderDataCopy.products.map((item: any) => {
                    const sitem = itemsList?.find((i) => i.name.toLowerCase() === item?.name.toLowerCase());
                    item.name = getLangWiseName(sitem, 'name', activeLaguage);
                    item.category = getLangWiseName(sitem, 'categoryName', activeLaguage);
                })
                getBillPrintData(orderDataCopy, activeLaguage)
            });
        }
    }, [activeLaguage])

    const onSelectLanguage = (e: any, languageData: any) => {
        setshowList(false)
        setactiveLaguage(languageData)
        e.stopPropagation()
        // getBillPrintData(orderData, languageData);
    }

    return (
        <div className='orderBillPrintModal' >
            {noOrderData ? <>
                Order data not found
            </> : <>
                {languagesList.length > 1 && <>
                    <div className='selected-language-wrap' onClick={() => setshowList(true)}>
                        <div className='selected-language'>
                            {activeLaguage.displayName}
                        </div>
                        <div className="searched-item-list-wrap"
                            style={{ height: showList ? 'auto' : '0', padding: showList ? '8px' : '0' }} onClick={() => { }} >
                            <div className="items-list">
                                {languagesList?.map((language) => {
                                    return <React.Fragment key={Math.random()}>
                                        <div className="expert-details hover" onClick={(e: any) => onSelectLanguage(e, language)}>
                                            <div className="expert-name">{language.displayName}</div>
                                        </div>
                                    </React.Fragment>
                                })}
                            </div>
                        </div>
                    </div>
                </>}
            </>}
            <div className='billContent' id="billContent" ref={wrapperRTef}></div>
        </div>
    )
}

export default OrderBillPrintModal