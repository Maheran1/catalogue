import React, { useEffect, useState, SyntheticEvent, MouseEvent } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { useSelector } from 'react-redux';
import Slide, { SlideProps } from '@material-ui/core/Slide';
type TransitionProps = Omit<SlideProps, 'direction'>;


function TransitionRightToLeft(props: TransitionProps) {
    return <Slide {...props} direction="down" />;
}

function AlertNotification() {

    const alert = useSelector((state: any) => state.alert);
    const [displayAlert, setDisplayAlert] = useState(false);
    const handleClose = (event: SyntheticEvent | MouseEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setDisplayAlert(false);
    };

    useEffect(() => {
        if (alert.type && !displayAlert) {
            setDisplayAlert(true);
            setTimeout(() => {
                setDisplayAlert(false);
            }, alert.time)
        }
    }, [alert])

    return (
        <>
            {displayAlert && alert.message ? <div className="alert-wrap">
                <Snackbar open={displayAlert}
                    className={`${alert.type} alert-msg-wrap`}
                    autoHideDuration={alert.duration}
                    TransitionComponent={TransitionRightToLeft}
                    // message={alert.message}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    key='topright'
                >
                    <Alert
                        // onClose={handleClose}
                        severity={alert.type}
                    // action={
                    //     <IconButton
                    //         aria-label="close"
                    //         color="inherit"
                    //         size="small"
                    //         onClick={() => {
                    //             setDisplayAlert(false);
                    //         }}
                    //     >
                    // <SvgIcon icon="closeLarge" />
                    //     </IconButton>
                    // }
                    >{alert.message}</Alert>
                </Snackbar>
            </div> : null}
        </>
    )
}

export default AlertNotification;
