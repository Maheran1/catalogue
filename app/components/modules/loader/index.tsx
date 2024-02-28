import React from 'react'
import { useSelector } from 'react-redux';

function Loader() {
    const loading = useSelector((state: any) => state.loader);
    return (
        <>
            {loading ? <div className="loaderbody">
                <div className="spinner">
                    <div className="bounce1"></div>
                    <div className="bounce2"></div>
                    <div className="bounce3"></div>
                </div>
            </div> : null}
        </>
    )
}

export default Loader;
