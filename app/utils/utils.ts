// This file will export the basic utitlity function to use globally.
import moment from 'moment';
import cookie from "cookie"
import { APPOINTMENT_SLOT_GAP_IN_MINS } from '@constant/appointment';
import { updateGenericImages } from '@context/actions';
import { windowRef } from './window';

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
export function getMobileOperatingSystem() {
  var userAgent = windowRef()?.navigator?.userAgent || windowRef()?.navigator?.vendor || windowRef()?.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return "Windows Phone";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !windowRef().MSStream) {
    return "IOS";
  }

  return "unknown";
}

export function parseCookies(req) {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie)
}

export function timeDiffCalc(dateFuture, dateNow, status) {
  let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

  // calculate days
  const days = Math.floor(diffInMilliSeconds / 86400);
  diffInMilliSeconds -= days * 86400;
  console.log('calculated days', days);

  // calculate hours
  const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
  diffInMilliSeconds -= hours * 3600;
  console.log('calculated hours', hours);

  // calculate minutes
  const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
  diffInMilliSeconds -= minutes * 60;
  console.log('minutes', minutes);

  let difference: any = '';
  switch (status) {
    case 'Days':
      difference = days;
      break;
    case 'Hours':
      difference = hours;
      break;
    case 'Minutes':
      difference = minutes;
      break;
    case 'Fulldate':
      if (days > 0) {
        difference += (days === 1) ? `${days} day, ` : `${days} days, `;
      }

      difference += (hours === 0 || hours === 1) ? `${hours} hour, ` : `${hours} hours, `;

      difference += (minutes === 0 || hours === 1) ? `${minutes} minutes` : `${minutes} minutes`;
      break;
  }

  return difference;
}

/**
 * This utility function will truncate the long text
 * with the chars provided, for example if chars = 32 then it will
 * truancate the text till 32th character and return the new text.
 * @param {*} desc 
 * @param {*} chars 
 */
export const TruncateText = (desc, chars) => {
  if (desc && desc?.length > chars) {
    return desc.substring(0, chars) + '';
  } else {
    return desc
  }
}
/**
 * Will return time/days spent from now
 * @param {*} date 
 */
export const TimeFromNow = (date) => {
  let timeFromNow = '';
  if (moment(date).fromNow(true) === 'a few seconds') {
    timeFromNow = 'few seconds';
  } else if (moment(date).fromNow(true) === 'a month') {
    timeFromNow = '1 month';
  } else if (moment(date).fromNow(true).includes('minutes')) {
    const timenow = moment(date).fromNow(true);
    timeFromNow = timenow.replace('minutes', 'mins');
  } else if (moment(date).fromNow(true).includes('minute')) {
    const timenow = moment(date).fromNow(true);
    timeFromNow = timenow.replace('minute', 'min');
  } else {
    timeFromNow = moment(date).fromNow(true);
  }
  return timeFromNow;
}

/**
   * Will return the formated date
   * @param {*} date 
   */
export const GetDateValue = (date) => {
  const today = moment().endOf('day');
  const yesterday = moment().subtract(1, 'day').endOf('day');

  if (date <= today && date > yesterday) {
    return 'Today'
  } else if (date < today && date >= yesterday) {
    return 'Yesterday';
  } else {
    // return <DateTime what="date" value={date} />
  }
}

// import { pluralize, underscore } from 'inflected'
let pluralize: any;
let underscore: any;
export function buildRelationshipData(type, ids) {
  let data = []

  if (ids === null || ids?.length === 0) return data

  if (typeof ids === 'string') {
    const obj = { type: underscore(type), id: ids }

    return [obj]
  }

  if (Array.isArray(ids)) {
    data = ids?.map(id => ({
      type: underscore(type),
      id
    }))
  }

  return data
}

export function formatUrlResource(type) {
  if (type === 'main-image') return type

  return pluralize(type)
}

export function createCartIdentifier() {
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  )
}

export function cartIdentifier(storage) {
  const cartId = createCartIdentifier()

  if (storage.get('mcart') !== null) {
    return storage.get('mcart')
  }

  storage.set('mcart', cartId)

  return cartId
}

export function parseJSON(response) {
  return new Promise(resolve => {
    response.text().then(body => {
      resolve({
        status: response.status,
        ok: response.ok,
        json: body !== '' ? JSON.parse(body) : '{}'
      })
    })
  })
}

function formatFilterString(type, filter) {
  const filterStringArray = Object.keys(filter)?.map(key => {
    const value = filter[key]
    let queryString: any = `${key},${value}`

    if (typeof value === 'object')
      queryString = Object.keys(value)?.map(
        attr => `${key}.${attr},${value[attr]}`
      )

    return `${type}(${queryString})`
  })

  return filterStringArray.join(':')
}

function formatQueryString(key, value) {
  if (key === 'limit' || key === 'offset') {
    return `page${value}`
  }

  if (key === 'filter') {
    const filterValues = Object.keys(value)?.map(filter =>
      formatFilterString(filter, value[filter])
    )

    return `${key}=${filterValues.join(':')}`
  }

  return `${key}=${value}`
}

function buildQueryParams({ includes, sort, limit, offset, filter }) {
  const query: any = {}

  if (includes) {
    query.include = includes
  }

  if (sort) {
    query.sort = `${sort}`
  }

  if (limit) {
    query.limit = `[limit]=${limit}`
  }

  if (offset) {
    query.offset = `[offset]=${offset}`
  }

  if (filter) {
    query.filter = filter
  }

  return Object.keys(query)
    ?.map(k => formatQueryString(k, query[k]))
    .join('&')
}

export function buildURL(endpoint, params) {
  if (
    params.includes ||
    params.sort ||
    params.limit ||
    params.offset ||
    params.filter
  ) {
    const paramsString = buildQueryParams(params)

    return `${endpoint}?${paramsString}`
  }

  return endpoint
}

export function buildRequestBody(body) {
  let parsedBody
  if (body) {
    if (body.options) {
      parsedBody = `{
        "data": ${JSON.stringify(body.data)},
        "options" : ${JSON.stringify(body.options)}
      }`
    } else {
      parsedBody = `{
        "data": ${JSON.stringify(body)}
      }`
    }
  }

  return parsedBody
}

export function buildCartItemData(
  id,
  quantity = null,
  type = 'cart_item',
  flows,
  isSku = false
) {
  const payload = {
    type,
    ...flows
  }

  if (type === 'cart_item') {
    if (isSku)
      Object.assign(payload, {
        sku: id,
        quantity: parseInt(quantity, 10)
      })
    else
      Object.assign(payload, {
        id,
        quantity: parseInt(quantity, 10)
      })
  }

  if (type === 'promotion_item') {
    Object.assign(payload, {
      code: id
    })
  }

  return payload
}

export function buildCartCheckoutData(
  customer,
  billing_address,
  shipping_address
) {
  let parsedCustomer = customer

  if (typeof customer === 'string') parsedCustomer = { id: customer }

  return {
    customer: parsedCustomer,
    billing_address,
    shipping_address
  }
}

export function resetProps(instance) {
  const inst = instance
    ;['includes', 'sort', 'limit', 'offset', 'filter'].forEach(
      e => delete inst[e]
    )
}

export function getCredentials(storage) {
  return JSON.parse(storage.get('moltinCredentials'))
}

export function tokenInvalid(config) {
  const credentials = getCredentials(config.storage)

  return (
    !credentials ||
    !credentials.access_token ||
    credentials.client_id !== config.client_id ||
    Math.floor(Date.now() / 1000) >= credentials.expires
  )
}

export function formatTimeTo12Hr(time) {
  if (time) {
    let timeNewDateString = time.split(":");
    let timeNewDate = new Date();
    timeNewDate.setHours(parseInt(timeNewDateString[0]));
    timeNewDate.setMinutes(parseInt(timeNewDateString[1]));
    const hour24 = timeNewDate.getHours();
    let minutes: any = (timeNewDate.getMinutes() === 0) ? '00' : timeNewDate.getMinutes();
    minutes = (minutes > 0 && minutes < 10) ? `0${minutes}` : minutes;
    const ampm = (hour24 >= 12) ? 'PM' : 'AM';
    let hour: any = hour24 % 12 || 12;
    //append zero is hour is single digit
    if (hour < 10) {
      hour = `0${hour}`;
    }
    return `${hour}:${minutes} ${ampm}`;
  } else return '';
};


export function getUpcommingDates(number: number = 15, storeConfigData: any = null) {
  var actualDate = new Date();
  var dateArray = [];

  for (var i = 0; i < number; i++) {
    let upcommingDate = new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate() + i);
    const month = (upcommingDate.getMonth() + 1).toString().length == 1 ? `0${upcommingDate.getMonth() + 1}` : upcommingDate.getMonth() + 1;
    const date = upcommingDate.getDate().toString().length == 1 ? `0${upcommingDate.getDate()}` : upcommingDate.getDate();
    const currentday = upcommingDate.toLocaleString('en-us', { weekday: 'long' }).substring(0, 3);
    if (!storeConfigData.weeklyOff?.includes(currentday)) {
      const dateObj = {
        displayDate: date,
        displayDay: upcommingDate.toLocaleString('en-us', { weekday: 'long' }).substring(0, 3),
        newDate: upcommingDate,
        dateObj: `${upcommingDate.getFullYear()}-${month}-${date}`,
        active: true
      }
      if (storeConfigData) {
        //validation for weeklyOff
        if (('weeklyOff' in storeConfigData) && storeConfigData.weeklyOff) {
          if (storeConfigData.weeklyOff.toLowerCase() == 'all') dateObj.active = false;
          else if (storeConfigData.weeklyOff.includes(dateObj.displayDay)) dateObj.active = false;
        } else dateObj.active = true;
      }
      if (dateObj.active) dateArray.push(dateObj);
    }
  }
  return dateArray;
}

export function createSlotsWithRange(starttime: any, endtime: any, interval: any = APPOINTMENT_SLOT_GAP_IN_MINS) {
  function addMinutes(time: any, minutes: any) {
    var date = new Date(new Date('01/01/2015 ' + time).getTime() + minutes * 60000);
    var tempTime = ((date.getHours().toString().length == 1) ? '0' + date.getHours() : date.getHours()) + ':' +
      ((date.getMinutes().toString().length == 1) ? '0' + date.getMinutes() : date.getMinutes())
    // + ':' + ((date.getSeconds().toString().length == 1) ? '0' + date.getSeconds() : date.getSeconds());
    return tempTime;
  }
  var timeslots = [starttime];

  while (starttime != endtime && starttime <= endtime) {
    starttime = addMinutes(starttime, interval);
    timeslots.push(starttime);
  }
  const slotWithRange: { slot: string, range: any, nextSlot: any }[] = [];
  timeslots.map((slot: string, index: number) => {
    const slotData = {
      slot,
      range: timeslots[index + 1] ? `${slot} - ${timeslots[index + 1]}` : null,
      nextSlot: timeslots[index + 1] ? timeslots[index + 1] : null
    }
    slotWithRange.push(slotData);
  })
  // console.log("slotWithRange", slotWithRange)
  return slotWithRange;
}

export function createSlots(starttime: any, endtime: any, interval: any = APPOINTMENT_SLOT_GAP_IN_MINS) {
  function addMinutes(time: any, minutes: any) {
    var date = new Date(new Date('01/01/2015 ' + time).getTime() + minutes * 60000);
    var tempTime = ((date.getHours().toString().length == 1) ? '0' + date.getHours() : date.getHours()) + ':' +
      ((date.getMinutes().toString().length == 1) ? '0' + date.getMinutes() : date.getMinutes())
    // + ':' + ((date.getSeconds().toString().length == 1) ? '0' + date.getSeconds() : date.getSeconds());
    return tempTime;
  }
  var timeslots = [starttime];

  while (starttime != endtime && starttime <= endtime) {
    starttime = addMinutes(starttime, interval);
    timeslots.push(starttime);
  }
  return timeslots;
}

export function createSlotsObjList(starttime: any, endtime: any, interval: any = APPOINTMENT_SLOT_GAP_IN_MINS) {
  function addMinutes(time: any, minutes: any) {
    var date = new Date(new Date('01/01/2015 ' + time).getTime() + minutes * 60000);
    var tempTime = ((date.getHours().toString().length == 1) ? '0' + date.getHours() : date.getHours()) + ':' +
      ((date.getMinutes().toString().length == 1) ? '0' + date.getMinutes() : date.getMinutes())
    // + ':' + ((date.getSeconds().toString().length == 1) ? '0' + date.getSeconds() : date.getSeconds());
    return tempTime;
  }
  var timeslots = [{ slot: starttime, active: true, disabled: false }];

  while (starttime != endtime && starttime <= endtime) {
    starttime = addMinutes(starttime, interval);
    timeslots.push({ slot: starttime, active: true, disabled: false });
  }
  return timeslots;
}


const getImage = (configData, activeGroup, forImg) => {
  if (configData?.genericImages[forImg]) {
    let img = configData?.genericImages[forImg].filter((i: any) => (!i.group || i.group.toLowerCase() === 'both') ? true : i.group.toLowerCase() == activeGroup);
    return img && img[0] && img[0].path;
  } else return '';
}

export function getGenericImages(configData, activeGroup) {
  if (configData?.genericImages) {
    let appBg = getImage(configData, activeGroup, 'appBg');
    let footerBg = getImage(configData, activeGroup, 'footerBg');
    let loginScreenBg = getImage(configData, activeGroup, 'loginScreenBg');
    let hamburgerBg = getImage(configData, activeGroup, 'hamburgerBg');
    return { appBg, footerBg, loginScreenBg, hamburgerBg }
  }
}

export function hex2rgb(colour, alpha) {
  var r, g, b;
  if (colour.charAt(0) == "#") {
    colour = colour.substr(1);
  }

  r = colour.charAt(0) + '' + colour.charAt(1);
  g = colour.charAt(2) + '' + colour.charAt(3);
  b = colour.charAt(4) + '' + colour.charAt(5);

  r = parseInt(r, 16);
  g = parseInt(g, 16);
  b = parseInt(b, 16);
  return alpha ? `rgb(${r},${g},${b},${alpha}%)` : `rgb(${r},${g},${b})`;
}

export function dynamicSort(property: any, order: number) {
  var sortOrder = order;
  if (property == 'lastVisitedOn') {
    return function (a: any, b: any) {
      var result = (new Date(a[property]).getTime() < new Date(b[property]).getTime()) ? -1 : (new Date(a[property]).getTime() > new Date(b[property]).getTime()) ? 1 : 0;
      return result * sortOrder;
    }
  } else {
    return function (a: any, b: any) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }
}

export function updateManifestFile(storeData: any) {
  const theme_color = document.getElementById("theme-color").getAttribute("content");
  const manifestConfig = storeData.configData.storeConfig.manifestConfig;
  const manifestString = JSON.stringify({
    ...{
      "name": `${storeData.tenant}, ${storeData.name}` || 'Respark',
      "short_name": `${storeData.tenant}` || 'Respark',
      "start_url": storeData.url || '/',
      "display": "standalone",
      "background_color": theme_color || "#dee1ec",
      "theme_color": theme_color || "#dee1ec",
      "orientation": "standalone",
      "description": storeData.description,
      "id": storeData.tenantId,
      "icons": [
        {
          "src": manifestConfig.icons['180'],
          "type": "image/png",
          "sizes": "180x180"
        },
        {
          "src": manifestConfig.icons['192'],
          "type": "image/png",
          "sizes": "192x192"
        },
        {
          "src": manifestConfig.icons['384'],
          "type": "image/png",
          "sizes": "384x384"
        },
        {
          "src": manifestConfig.icons['512'],
          "type": "image/png",
          "sizes": "512x512"
        },
        {
          "src": manifestConfig.icons['1024'],
          "type": "image/png",
          "sizes": "1024x1024"
        }
      ]
    },
  });
  console.log(manifestString)
  const manifestElement = document.getElementById("manifest");
  manifestElement?.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(manifestString));
}

export function getDateObj(startDate: any = new Date()) {
  let dateObj = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const month = (dateObj.getMonth() + 1).toString().length == 1 ? `0${dateObj.getMonth() + 1}` : dateObj.getMonth() + 1;
  const date = dateObj.getDate().toString().length == 1 ? `0${dateObj.getDate()}` : dateObj.getDate();
  return {
    displayDate: date,
    displayDay: dateObj.toLocaleString('en-us', { weekday: 'long' }).substring(0, 3),
    newDate: dateObj,
    dateObj: `${dateObj.getFullYear()}-${month}-${date}`
  }
}
export function getTofixValue(value: any = 0, isDisplayValue: boolean = false, roundValue: any = 2) {
  const decimalPlaces = localStorage.getItem('decimalPlaces');
  if (decimalPlaces) roundValue = decimalPlaces;
  if (!value) value = 0;
  value = Number(value).toFixed(roundValue)
  return isDisplayValue ? value : Number(value);
}


export const getCurrencySymbol = () => {
  const currencySymbol = localStorage.getItem('currencySymbol');
  return currencySymbol ? currencySymbol : '₹';
}

export const isActiveAtBinaryIndex = (value: any, index: any) => {
  return Boolean((value >> index) % 2)
}