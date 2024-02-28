import React, { useState, useEffect } from 'react';
import { useDispatch, useStore, connect } from 'react-redux';
import ScrollingNavigation from '@module/topScrolleingNavigation';
import Link from 'next/link';
// for Accordion starts
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Item from '@element/horizontalItem';
import SvgIcon from '@element/svgIcon';
// for Accordion ends
function VerticalCategoryPage({ url_Segment, storeData }) {

    const [activeGroup, setActiveGroup] = useState(null)
    const [activeCuratedCategory, setActiveCuratedCategory] = useState(null)

    useEffect(() => {
        storeData?.curatedGroups?.map((groupData) => {
            groupData?.curatedCategories?.map((categoryData) => {
                if (categoryData.name.toLowerCase() == url_Segment) {
                    categoryData.isSelected = true;
                    setActiveCuratedCategory(categoryData);
                    setActiveGroup({ ...groupData });
                }
            })
        })
    }, [url_Segment])

    const onClickTolScrollNav = (category) => {
        setActiveCuratedCategory(category);
        document.getElementById(category.name).scrollTop = 10;
    }

    return (
        <>
            {/* <div className="common-grey-boder"></div> */}
            {activeGroup ? <div className="categorypageContainer">
                {/* <ScrollingNavigation items={activeGroup.curatedCategories} config={{}} handleClick={(item) => onClickTolScrollNav(item)} activeCuratedCategory={activeCuratedCategory} /> */}
                {activeGroup.curatedCategories && activeGroup.curatedCategories?.map((curetedCategoryData, curatedCatIndex) => {
                    const categoryData = curetedCategoryData?.curatedItems && curetedCategoryData?.curatedItems[0]?.categoryDetails;
                    return <div className="category-data-wrap clearfix" key={curatedCatIndex}>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<SvgIcon icon="expand" />}
                                aria-controls=""
                                id={curetedCategoryData.name}>
                                <div className="category-name">{curetedCategoryData.name}</div>
                            </AccordionSummary>
                            <AccordionDetails>
                                {curetedCategoryData.entityType == 'category' ?
                                    <div className="fullwidth">
                                        {(categoryData?.categoryList && categoryData?.categoryList.length != 0) ?
                                            <div className="fullwidth">
                                                {categoryData?.categoryList?.map((subCategoryData, subCatIndex) => {
                                                    return <div key={subCatIndex} className="sub-cat-wrap">
                                                        <Accordion>
                                                            <AccordionSummary
                                                                expandIcon={<SvgIcon icon="expand" />}
                                                                aria-controls=""
                                                                id="">
                                                                <div className="category-name sub-category-name">{subCategoryData.name}</div>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                {(subCategoryData.categoryList && subCategoryData?.categoryList.length != 0) ? <div>
                                                                    {subCategoryData?.categoryList?.map((subSubCategoryData, subSubCatIndex) => {
                                                                        return <div key={subSubCatIndex}>
                                                                            <div className="category-name sub-category-name">{subSubCategoryData.name}</div>
                                                                            {(subSubCategoryData.categoryList && subSubCategoryData?.categoryList.length != 0) ? <div>
                                                                            </div> : <div className="list-block">
                                                                                {
                                                                                    subSubCategoryData?.itemList?.map((item, itemIndex) => {
                                                                                        return <div key={Math.random()}>
                                                                                            <Item item={item} config={{}} />
                                                                                        </div>
                                                                                    })
                                                                                }
                                                                            </div>}
                                                                        </div>
                                                                    })}
                                                                </div> : <div className="list-block">
                                                                    {
                                                                        subCategoryData?.itemList?.map((item, itemIndex) => {
                                                                            return <div key={Math.random()}>
                                                                                <Item item={item} config={{}} />
                                                                            </div>
                                                                        })
                                                                    }
                                                                </div>}
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </div>
                                                })}
                                            </div> :
                                            <div className="fullwidth  ">
                                                {
                                                    categoryData?.itemList?.map((item, itemIndex) => {
                                                        return <div key={Math.random()}>
                                                            <Item item={item} config={{}} />
                                                        </div>
                                                    })
                                                }
                                            </div>
                                        }
                                    </div>
                                    : <>
                                        {activeCuratedCategory.entityType === 'items' && <div className="content-wrap">
                                            {curetedCategoryData?.curatedItems?.map((item, itemIndex) => {
                                                return <div key={Math.random()}>
                                                    <Item item={item} config={{}} />
                                                </div>
                                            })}
                                        </div>}
                                        <div className="common-grey-boder"></div>
                                    </>}
                            </AccordionDetails>
                        </Accordion>
                    </div>
                })}
            </div> : null}
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        storeData: state?.store?.storeData
    }
}

export default connect(mapStateToProps)(VerticalCategoryPage);
