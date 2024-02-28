import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import ImageGallery from 'react-image-gallery';
import Dialog from '@material-ui/core/Dialog';
import { useSelector } from 'react-redux';

function ImageGalleryModal({ itemsList, config, no_image, handleClick }) {
    const router = useRouter();
    const [openModal, setopenModal] = useState(true);
    const { configData, keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);

    const handleClose = () => {
        setopenModal(false);
        handleClick(false);
    };

    const [itemList, setItemList] = useState([{ original: no_image, thumbnail: no_image }]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    useEffect(() => {
        const itemsImageArray = [];
        if (itemsList && itemsList?.length != 0) {
            itemsList?.map((item, index) => {
                if (item.active && (('showOnUi' in item) ? item.showOnUi : true)) {
                    const src = item.imagePath ? item.imagePath : no_image;
                    src && itemsImageArray.push({ original: src, thumbnail: src, alt: item.name, itemIndex: index, bulletClass: 'slider-bullet' })
                }
            })
            setItemList([...itemsImageArray]);
        } else handleClose();
    }, [itemsList])

    const onImageChange = (index) => {
        setCurrentSlideIndex(index);
    }

    const onImageClick = () => {
        if (config && config.redirection) {
            const currentClickedSlide: any = itemsList[currentSlideIndex];
            // if (currentClickedSlide.entityType !== 'images') {
            //     router.push(currentClickedSlide.name.toLowerCase().split(" ").join("-"));
            // } else {
            //     // open images modal
            // }
        }
    }

    const settings = {
        showThumbnails: false,
        showPlayButton: false,
        // showBullets: (itemsList && itemsList?.length) > 1 ? true : false,
        showBullets: false,
        autoPlay: true,
        slideDuration: configData?.storeConfig?.sparkConfig?.sliderDuration || 2000,
        slideInterval: configData?.storeConfig?.sparkConfig?.sliderInterval || 5000,
        startIndex: 0,
        fullscreen: true,
        showNav: true,
        onSlide: onImageChange,
        onClick: onImageClick,
        showFullscreenButton: false
    }

    return (

        <div className="gallery-modal-wrap fullscreen">
            <Dialog onClose={handleClose} className="gallery-modal-wrap" aria-labelledby="simple-dialog-title" open={openModal}>
                {/* <DialogTitle id="simple-dialog-title">Images</DialogTitle> */}
                <div className="fullwidth gallery-wrap">
                    <ImageGallery items={itemList} {...settings} />
                </div>
            </Dialog>
        </div>
    )
}

export default ImageGalleryModal
