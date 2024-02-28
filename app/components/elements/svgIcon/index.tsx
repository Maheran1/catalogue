/* eslint-disable max-len */
import { FC } from "react";

import close from "./close.svg";
import cart from "./cart.svg";
import closeLarge from "./clear.svg";
import share from "./share.svg";
import camera from "./camera.svg";
import expand from "./expand.svg";
import timer from "./timer.svg";
import info from "./info.svg";
import backArrow from "./backArrow.svg";
import instagram from "./instagram.svg";
import backNavigation from "./backNavigation.svg";
import next from "./next.svg";
import home from "./home.svg";

const icons: any = {
    cart: cart,
    close: close,
    backArrow: backArrow,
    instagram: instagram,
    next: next,
    backNavigation: backNavigation,
    info: info,
    timer: timer,
    expand: expand,
    camera: camera,
    share: share,
    closeLarge: closeLarge,
    home: home,
};

type Props = {
    icon: any;
    alt?: string;
    color?: string;
    width?: number;
    height?: number;
    style?: any;
    background?: string;
    margin?: string;
    padding?: string;
    shape?: string; //circle or square
};
const getIcon = (icon: any) => icons[icon];

const SvgIcon: FC<Props> = ({ icon, color = 'inherit', width = 24, height = 24, shape = "", background = "unset", padding = "", margin = "", style }: Props) => {
    const CurrentIcon = getIcon(icon);

    const shapeCss = shape ? {
        background: '#dee1ec',
        borderRadius: shape == 'circle' ? '50%' : '6px',
        padding: padding || '5px',
        margin: margin || 'unset'
    } : {};

    return (
        <span className="svg-icon-wrap d-f-c" style={
            {
                'color': color,
                'width': `${width}px`,
                'height': `${height}px`,
                'background': background,
                ...shapeCss,
                ...style
            }}>
            <CurrentIcon />
        </span>
    );
}

export default SvgIcon;
