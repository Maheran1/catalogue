import { getValueFromCookies } from "@util/webstorage";
import { windowRef } from "@util/window";
import router from "next/router";

export function navigateTo(path: any, baseRouteUrl = "",) {
    baseRouteUrl = baseRouteUrl || getValueFromCookies('baseRouteUrl');
    router.push({ pathname: baseRouteUrl + path }, undefined, { scroll: false, shallow: true })
}


export function navigateToBack(baseRouteUrl = "") {
    baseRouteUrl = baseRouteUrl || getValueFromCookies('baseRouteUrl');
    if (window?.history?.length <= 2) router.push({ pathname: baseRouteUrl }, undefined, { scroll: false, shallow: true })
    else router.back();
}
