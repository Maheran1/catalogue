import SvgIcon from '@element/svgIcon';
import React, { useEffect, useState } from 'react'

function GrFormNext(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><polyline fill="none" stroke="#000" strokeWidth={2} points="9 6 15 12 9 18" /></svg>;
}

function GrFormPrevious(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" height="1em" width="1em" {...props}><polyline fill="none" stroke="#000" strokeWidth={2} points="9 6 15 12 9 18" transform="matrix(-1 0 0 1 24 0)" /></svg>;
}

function CustomeImageSlider({ item }) {

    const [imageList, setImageList] = useState<any>(item?.imagePaths || [])
    const [showArrows, setShowArrows] = useState(false)
    const [index, setIndex] = useState<any>(0)

    useEffect(() => {
        setIndex(0)
        const images = item?.imagePaths ? item?.imagePaths.filter((i: any) => i.active) : [];
        let showArrow = false;
        setImageList(images);
        if (images.length > 1) showArrow = true;
        if (images.length && item.videoLink) showArrow = true;
        setShowArrows(showArrow)
    }, [item])

    const isIOSDevice = () => {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator?.platform)
            // iPad on iOS 13 detection
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    }

    return (
        <div className='custom-img-slider-wrap'>
            <div className='images-wrap' id="slider">
                {imageList?.map((imageData: any, i: number) => {
                    return <React.Fragment key={i}>
                        <div className="slide" style={{ display: index == i ? 'flex' : 'none' }}>
                            <img src={imageData.imagePath} />
                        </div>
                    </React.Fragment>
                })}
                {item?.videoLink && <div className="slide vdo-slide" style={{ display: index == imageList.length ? 'flex' : 'none' }}>
                    {(index == imageList.length) &&
                        <>
                            {isIOSDevice() ? <div className='vdo-wrap'>
                                <video autoPlay className="video-background " >
                                    <source src={`${item?.videoLink}?autoplay=1`} type="video/mp4" />
                                </video>
                            </div> : <iframe allowFullScreen className="vdo-frame" src={`${item?.videoLink}?autoplay=1`} allow="autoplay" width={window ? window.innerWidth : "680"} height={"420"}></iframe>}
                        </>
                    }
                </div>}
                {showArrows && <>
                    {index != 0 && <span className="controls" onClick={() => setIndex(index + -1)} id="left-arrow">
                        <GrFormPrevious />
                    </span>}
                    {(item?.videoLink ? (index != imageList.length) : (index != imageList.length - 1)) && <span className="controls" id="right-arrow" onClick={() => setIndex(index + 1)}>
                        <GrFormNext />
                    </span>}
                </>}
            </div>
            {(showArrows) && <div className='thumbnail-wrap' id="thumbnails">
                {imageList?.map((imageData: any, i: number) => {
                    return <React.Fragment key={i}>
                        <div className={`thumbnail ${index == i ? 'active' : ''}`} onClick={() => setIndex(i)}>
                            <img src={imageData.imagePath} />
                        </div>
                    </React.Fragment>
                })}
                {item?.videoLink && <div className={`thumbnail d-f-c ${index == imageList?.length ? 'active' : ''}`} onClick={() => setIndex(imageList.length)}>
                    <SvgIcon icon="camera" />
                </div>}
            </div>}
        </div >
    )
}

export default CustomeImageSlider