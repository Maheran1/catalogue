import React from 'react'
import Element from "@element/circularItem";
import { CIRCLE_NO_IMAGE } from "@constant/noImage";

function circularGrid({ items, config, handleClick }) {
    return (
        <>
            {items ? items?.map((item, index) => {
                if (item.active && item.showOnUi && !item.hideFromCatalogue) {
                    if (!item.imagePath) item.imagePath = CIRCLE_NO_IMAGE;
                    return <div key={Math.random()}>
                        <Element item={item} config={config} handleClick={handleClick} />
                    </div>
                }
            }) :
                null
            }
        </>
    )
}

export default circularGrid;
