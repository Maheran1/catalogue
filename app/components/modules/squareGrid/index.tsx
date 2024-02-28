import React from 'react'
import SquareItem from "@element/squareItem";
import { useCookies } from "react-cookie";

function SquareGrid({ items, config, handleClick, noImage }) {
    const [cookie, setCookie] = useCookies(["grp"])
    return (
        <>
            {items ? items?.map((item, index) => {
                if (item.showOnUi && !item.hideFromCatalogue) {
                    if ('icon' in item) item.imagePath = item.icon;
                    if (item.icons && item.icons.length != 0) {
                        let bothImg = item.icons.filter((i: any) => i.group?.toLowerCase() === 'both');
                        bothImg = bothImg.length != 0 ? bothImg[0].imagePath : noImage;
                        if (!cookie.grp || cookie.grp.toLowerCase() === 'both') {
                            item.imagePath = bothImg;
                        } else {
                            let grpImg = item.icons.filter((i: any) => i.group?.toLowerCase() === cookie.grp.toLowerCase());
                            item.imagePath = grpImg.length != 0 ? grpImg[0].imagePath : bothImg;
                        }
                    }
                    if (item.imagePaths && item.imagePaths?.length !== 0) {
                        item.imagePaths = item.imagePaths.filter((i: any) => !i.deleted)
                    }
                    if (!item.imagePath && (item.imagePaths && item.imagePaths?.length !== 0 && item.imagePaths[0] && item.imagePaths[0].active)) {
                        item.imagePath = item.imagePaths[0].imagePath;
                    }
                    if (!item.imagePath) item.imagePath = noImage;
                    if (config.from != "all") {
                        return <SquareItem item={item} config={config} key={Math.random()} handleClick={handleClick} />
                    } else {
                        if (item.type == config.type) {
                            return <SquareItem item={item} config={config} key={Math.random()} handleClick={handleClick} />
                        }
                    }
                }
            }) :
                null
            }
        </>
    )
}

export default SquareGrid;
