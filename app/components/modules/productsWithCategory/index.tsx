import { PRODUCT } from '@constant/types'
import Item from '@element/horizontalItem'
import React from 'react'
import { useSelector } from 'react-redux';

function ProductsWithCategory({ categories }) {
    const { keywords } = useSelector((state: any) => state.store ? state.store.storeData : null);
    const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null);

    return (
        <div className="products-category-wrap">
            {categories.map((category: any, catIndex: number) => {
                return <div className="cat-item-wrap" key={Math.random()}>
                    {category.type == keywords[PRODUCT] && category.showOnUi ? <>
                        <div className="cat-wrap clearfix">
                            <div className="cat-name">{category.name}</div>
                            {(category?.categoryList && category?.categoryList.length != 0) ? <div>
                                {category?.categoryList?.map((category, subCatIndex) => {
                                    return <div className="cat-item-wrap" key={Math.random()}>
                                        {category.type == keywords[PRODUCT] && category.showOnUi ? <>
                                            <div className="cat-wrap clearfix">
                                                <div className="cat-name">{category.name}</div>
                                                <div className="fullwidth  ">
                                                    <div className={`services-list-wrapper clearfix ${Object.keys(keywords).filter(function (key) { return keywords[key] === category.type })[0]}-list-wrapper  ${configData?.showProductInGridView ? 'grid-view' : ''}`}>
                                                        {category?.itemList?.map((item, itemIndex) => {
                                                            const catUrl = category.name.toLowerCase().split(" ").join("-") + '-prp/';
                                                            const itemUrl = catUrl + item.name.toLowerCase().split(" ").join("-") + '-pdp';
                                                            item.catUrl = catUrl;
                                                            item.itemUrl = itemUrl;
                                                            return <div key={Math.random()} className="service-list-cover product">
                                                                {item.showOnUi && !item.hideFromCatalogue && <Item item={item} config={{ redirection: false, onClickAction: true }} />}
                                                            </div>
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                            : null}
                                    </div>
                                })}
                            </div> :
                                <div className="fullwidth  ">
                                    <div className={`services-list-wrapper clearfix ${Object.keys(keywords).filter(function (key) { return keywords[key] === category.type })[0]}-list-wrapper  ${configData?.showProductInGridView ? 'grid-view' : ''}`}>
                                        {category?.itemList?.map((item, itemIndex) => {
                                            const catUrl = category.name.toLowerCase().split(" ").join("-") + '-prp/';
                                            const itemUrl = catUrl + item.name.toLowerCase().split(" ").join("-") + '-pdp';
                                            item.catUrl = catUrl;
                                            item.itemUrl = itemUrl;
                                            return <div key={Math.random()} className="service-list-cover">
                                                {item.showOnUi && !item.hideFromCatalogue && <Item item={item} config={{ redirection: false, onClickAction: true }} />}
                                            </div>
                                        })}
                                    </div>
                                </div>
                            }
                        </div>
                    </>
                        : null}
                </div>
            })}
        </div>
    )
}

export default ProductsWithCategory