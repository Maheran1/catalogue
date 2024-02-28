/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { wrapper } from '@context/store/store';
import { getPromotionByCode, getTenantAndStoresBySubdomain } from '@storeData/store';
import Head from "next/head";
import Link from 'next/link';
import React, { Fragment } from 'react';
import Custom404 from './404';

const TenantPage = ({ tenantData, metaTags }) => {
    console.log(tenantData)
    if (tenantData && tenantData.id) {
        const titleTagData = metaTags.title || '';
        const descriptionTagData = metaTags.description || '';
        const imageTagData = metaTags.image || '';
        return <React.Fragment>
            <Head>
                {/* Coomon meta tags */}
                <title>{titleTagData}</title>
                <meta name="title" key="title" content={titleTagData} />
                <meta name="description" key="description" content={descriptionTagData} />

                <meta property="og:site_name" content={titleTagData} key="ogsitename" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={titleTagData} key="ogtitle" />
                <meta property="og:description" content={descriptionTagData} key="ogdesc" />
                <meta property="og:image" content={imageTagData} key="ogimage" />

                {/* Twitter meta Tags */}
                <meta name="twitter:title" content={titleTagData} key="twittertitle" />
                <meta name="twitter:description" content={descriptionTagData} key="twitterdesc" />
                <meta name="twitter:image" content={imageTagData} key="twitterimage" />
                <meta name="twitter:creator" content="Respark" />
                {/* application meta tags */}
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
                <link rel="shortcut icon" type="image/png" href="/favicon.ico" />
            </Head>

            <div className='tenant-page-wrap stores-list-wrap d-f-c'>
                <div className="logo-wrap glass-card d-f-c">
                    <img src={tenantData?.logo} />
                </div>
                <div className="heading d-f-c cap-text">Welcome to <div> {tenantData.name}</div></div>
                <div className="sub-heading">Please select {Boolean(tenantData?.keywords?.branch) ? tenantData?.keywords?.branch : "store"} you want to visit</div>
                <div className='stores-list-wrap'>
                    {tenantData?.stores.map((store: any, i: number) => {
                        return <Fragment key={i}>
                            <Link href={`/${tenantData.name.toLowerCase().split(" ").join("-")}-${tenantData.id}/${store.name.toLowerCase().split(" ").join("-")}`}>
                                <div className="store-details glass-card cap-text" key={i}>
                                    {store.name}
                                </div>
                            </Link>
                        </Fragment>
                    })}
                </div>
            </div>
        </React.Fragment>
    } else return <Custom404 />
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ req }) => {
    const subdomain = req.headers.host.includes('localhost') ? 'respark' : req.headers.host.split('.')[0];
    let promoCode = '';
    const tenantData: any = await getTenantAndStoresBySubdomain(subdomain);
    const metaTags = {
        title: tenantData.name || '',
        description: tenantData.description || '',
        image: tenantData.logo || ''
    }
    //if promotion presents
    if (req.url.includes('/?id')) {
        const promotionData: any = await getPromotionByCode(req.url.split('/?id=')[1]);
        promoCode = req.url.split('/?id=')[1];
        if (promotionData) {
            metaTags.title = promotionData.title || '';
            metaTags.description = promotionData.description || '';
            metaTags.image = promotionData.image || '';
        }
    }

    // console.log("tenant data", tenantData)
    if (tenantData && tenantData?.stores && tenantData?.stores?.length != 0) {
        if (tenantData.stores?.length == 1) {
            const url = `/${tenantData.name.toLowerCase().split(" ").join("-")}-${tenantData.id}/${tenantData.stores[0].name.toLowerCase().split(" ").join("-")}${promoCode ? '?id=' + promoCode : ''}`
            return {
                redirect: {
                    permanent: false,
                    destination: url
                }
            }
        } else {
            return {
                props: { tenantData, metaTags },
            };
        }
    } else {
        return {
            redirect: {
                permanent: false,
                destination: "/404"
            }
        }
    }
})

export default TenantPage;