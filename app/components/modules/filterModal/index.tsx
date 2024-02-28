import React, { useEffect, useRef, useState } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import Slider from '@material-ui/core/Slider';
import { filterCategory, getItemsList } from '@util/dataFilterService/itemDataService';
import { useSelector } from 'react-redux';
import SvgIcon from '@element/svgIcon';

function FilterModal({ frompage, filterConfig, activeFilters, openModal, handleClose, type }) {
    const [priceRange, setPriceRangeValue] = React.useState<number[]>([1, 100]);
    const [rsValue, setrsValue] = useState(1);
    const [sortingFilters, setSortingFilters] = useState([]);
    const { storeData } = useSelector((state: any) => state.store ? state.store : null);
    const { configData } = storeData;
    const [itemCount, setItemCount] = useState(0)
    const [pageheight, setpageheight] = useState<any>('400px');
    const modalRef = useRef(null);

    useEffect(() => {
        setpageheight(`${modalRef.current.clientHeight}px`);
    }, [openModal])

    useEffect(() => {
        let sortingFilter: any = []
        if (filterConfig?.sortingConfig?.active) {
            if (filterConfig?.sortingConfig?.discount) {
                sortingFilter.push({ name: 'Discount', value: activeFilters?.discount || false, key: 'discount' })
            } if (filterConfig?.sortingConfig?.latest) {
                sortingFilter.push({ name: 'Latest', value: activeFilters?.latest || false, key: 'latest' })
            } if (filterConfig?.sortingConfig?.oldest) {
                sortingFilter.push({ name: 'Oldest', value: activeFilters?.oldest || false, key: 'oldest' })
            } if (filterConfig?.sortingConfig?.highPrice) {
                sortingFilter.push({ name: 'High Price', value: activeFilters?.highPrice || false, key: 'highPrice' })
            } if (filterConfig?.sortingConfig?.lowPrice) {
                sortingFilter.push({ name: 'Low Price', value: activeFilters?.lowPrice || false, key: 'lowPrice' })
            }
            setSortingFilters(sortingFilter);
        }
    }, [filterConfig])

    useEffect(() => {
        if (priceRange && filterConfig && frompage == 'All-Categories') {
            const storeCat = JSON.parse(JSON.stringify(storeData.categories))
            const avlActiveCat = storeCat?.filter((cat) => cat.type == type);
            let filterCopy: any = {}
            filterCopy.minPrice = priceRange[0];
            filterCopy.maxPrice = priceRange[1];
            avlActiveCat.map((cat: any, cati: number) => {
                if (cat.showOnUi) {
                    cat = filterCategory(cat, filterCopy, filterConfig);
                }
                if (cati == avlActiveCat.length - 1) {
                    let allItemsList: any = [];
                    avlActiveCat.map((cat: any, i: number) => {
                        allItemsList = getItemsList(allItemsList, cat);
                    })
                    setItemCount(allItemsList.length)
                }
            })
        }
    }, [priceRange])

    useEffect(() => {
        if (openModal) {
            document.body.classList.add("o-h");
            let rs = Number((filterConfig.maxPrice / 100).toFixed(1))
            setrsValue(rs);
            setPriceRangeValue([activeFilters.minPrice, activeFilters.maxPrice])
        } else document.body.classList.remove("o-h")
        return () => document.body.classList.remove("o-h")
    }, [openModal]);

    const handleChange = (event: Event, newValue: number | number[]) => {
        let [min, max]: any = newValue;
        // if (min <= 0) min = 1;
        setPriceRangeValue([min, max]);
        // console.log(newValue as number[])
    };

    const handleSortValue = (from) => {
        const sortingFiltersCopy = [...sortingFilters]
        sortingFiltersCopy.map((f: any) => f.value = false)
        sortingFiltersCopy[from].value = true;
        setSortingFilters([...sortingFiltersCopy])
    }

    const onApplyFilters = () => {
        const filtesCopy = { ...activeFilters }
        filtesCopy.minPrice = priceRange[0];
        filtesCopy.maxPrice = priceRange[1];
        filtesCopy.active = true;
        sortingFilters.map((f: any) => filtesCopy[f.key] = f.value)
        handleClose(filtesCopy);
    }

    const onResetFilter = () => {
        const filtesCopy = { ...activeFilters }
        filtesCopy.minPrice = 0;
        filtesCopy.maxPrice = 100;
        filtesCopy.active = true;
        const sortingFiltersCopy = [...sortingFilters]
        sortingFiltersCopy.map((f: any) => {
            filtesCopy[f.key] = false;
            f.value = false;
        })
        setSortingFilters([...sortingFiltersCopy])
        handleClose(filtesCopy);
    }

    return (

        <div className="confirmation-modal-wrap">
            <Backdrop
                className="backdrop-modal-wrapper confirmation-modal-wrap"
                open={openModal ? true : false}
            >
                <div className="backdrop-modal-content confirmation-modal" style={{ height: openModal ? 'auto' : '0' }} ref={modalRef}>
                    <div className="modal-close" onClick={() => handleClose()}>
                        <SvgIcon icon="closeLarge" />
                    </div>
                    <div className="member-modal">
                        <div className='filter-modal-content-wrap'>
                            <div className='modal-heading'>Filters
                                {frompage == 'All-Categories' && <div className="sub-heading">
                                    ({itemCount} {type}s)
                                </div>}
                            </div>
                            {filterConfig?.priceRange && <div className='filter-wrap'>
                                <div className='heading'>Price range ({configData.currencySymbol}{(priceRange[0] * rsValue).toFixed()} - {configData.currencySymbol}{(priceRange[1] * rsValue).toFixed()})</div>                                <div className='filter-content'>
                                    <div className='price-range-slider-wrap'>
                                        {openModal && <Slider
                                            getAriaLabel={() => 'Price range'}
                                            value={priceRange}
                                            onChange={(e: any, number: any) => handleChange(e, number)}
                                        // valueLabelDisplay="auto"
                                        // valueLabelFormat={(value: any) => `${configData.currencySymbol}${value * rsValue}`}
                                        />}
                                    </div>
                                    <div className='price-range-filter'>
                                        <div className='range-value'>{configData.currencySymbol} {filterConfig?.minPrice}</div>
                                        <div className='range-value'>{configData.currencySymbol} {filterConfig?.maxPrice}</div>
                                    </div>
                                </div>
                            </div>}
                            {filterConfig?.sortingConfig?.active && <div className='filter-wrap'>
                                <div className='heading'>Sort by</div>
                                <div className='filter-content'>
                                    {sortingFilters.map((sortFilter: any, index: number) => {
                                        return <div key={Math.random()} className={`filter-type ${sortFilter.value ? 'active' : ''}`} onClick={() => handleSortValue(index)}>
                                            <div className='filter-icon'>
                                                <div className='icon'></div>
                                            </div>
                                            <div className='filter-text'>{sortFilter.name}</div>
                                        </div>
                                    })}
                                </div>
                            </div>}
                        </div>
                        <div className="form-btn-wrap">
                            <button className="primary-btn rounded-btn" onClick={onApplyFilters}>Apply</button>
                            <button className="primary-btn rounded-btn border-btn without-border-btn" onClick={onResetFilter}>Reset</button>
                        </div>
                    </div>
                </div>
            </Backdrop>
        </div>
    );
}

export default FilterModal;