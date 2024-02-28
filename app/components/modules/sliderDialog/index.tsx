import React, { useEffect, useState, SyntheticEvent, MouseEvent } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { useSelector } from 'react-redux';
import Slide, { SlideProps } from '@material-ui/core/Slide';
type TransitionProps = Omit<SlideProps, 'direction'>;


function TransitionRightToLeft(props: TransitionProps) {
    return <Slide {...props} direction="up" />;
}

function SliderDialog() {
    const { storeData } = useSelector((state: any) => state.store ? state.store : null);
    const [displayDialog, setDisplayDialog] = useState(false);

    const handleClose = (event: SyntheticEvent | MouseEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setDisplayDialog(false);
    };

    useEffect(() => {
        if (storeData?.configData?.readOnlyMenu || storeData?.configData?.storeOff) setDisplayDialog(true);
        else setDisplayDialog(false);
    }, [storeData?.configData])

    return (
        <>
            {displayDialog ? <div className="alert-wrap slider-dialog-wrapper">
                <Snackbar open={displayDialog}
                    className="bottom-slider"
                    autoHideDuration={null}
                    TransitionComponent={TransitionRightToLeft}
                    // message="Salon is not operational today."
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    key='topright'
                >
                    <div>We are currently un-serviceable. We will be back soon.</div>
                </Snackbar>
            </div> : null}
        </>
    )
}

export default SliderDialog;
