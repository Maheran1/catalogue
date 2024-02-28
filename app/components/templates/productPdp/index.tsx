import React, { useState, useEffect } from "react";
// for Accordion starts
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
// for Accordion ends
import { PDP_NO_IMAGE } from "@constant/noImage";
import ImageSlider from "@element/imageSlider";
import router from "next/router";
import { useSelector, useDispatch } from 'react-redux';
import { replaceOrderIitems, syncLocalStorageOrder } from "app/redux/actions/order";
import { windowRef } from "@util/window";
import { showSuccess } from "@context/actions";
import SvgIcon from "@element/svgIcon";

function ProductPdp({ item, activeGroup }) {
  const [activeVariation, setActiveVariation] = useState((item.variations && item.variations?.length !== 0) ? item.variations[0] : null);
  const [quantity, setQuantity] = useState(0);
  const [total, setTotal] = useState(0);
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.order.items);
  const categoryName = ('pagepath' in router.query) ? router.query.pagepath[0].split("-").join(" ") : '';
  const { configData } = useSelector((state: any) => state.store ? state.store.storeData : null);

  useEffect(() => {
    if (windowRef) {
      // dispatch(syncLocalStorageOrder());
    }
  }, [windowRef])

  useEffect(() => {
    let totalcopy = 0;
    let quantityCopy = 0;
    if (cartItems && cartItems.length) {
      const itemIndex: number = cartItems.findIndex((cartItem) => (cartItem.name == item.name && cartItem.categoryName == categoryName) && ((cartItem.variations) ? (cartItem.variations[0].name == activeVariation.name) : true));
      if (itemIndex != -1) {
        totalcopy = cartItems[itemIndex].quantity * cartItems[itemIndex].price;
        quantityCopy = cartItems[itemIndex].quantity;
      }
    }
    setTotal(totalcopy);
    setQuantity(quantityCopy);
  }, [cartItems, activeVariation])

  const addQuantity = () => {
    const cartItemsCopy = cartItems ? [...cartItems] : [];
    const itemIndex: number = cartItemsCopy.findIndex((cartItem) => (cartItem.name == item.name && cartItem.categoryName == categoryName) && ((cartItem.variations) ? (cartItem.variations[0].name == activeVariation.name) : true));
    cartItemsCopy[itemIndex].quantity = cartItemsCopy[itemIndex].quantity + 1;
    dispatch(replaceOrderIitems(cartItemsCopy));
    dispatch(showSuccess('Product Added', 2000));
  }

  const removeQuantity = () => {
    const cartItemsCopy = cartItems ? [...cartItems] : [];
    if (quantity == 1) {
      const itemIndex: number = cartItemsCopy.findIndex((cartItem) => (cartItem.name == item.name && cartItem.categoryName == categoryName) && ((cartItem.variations) ? (cartItem.variations[0].name == activeVariation.name) : true));
      cartItemsCopy.splice(itemIndex, 1);
      dispatch(replaceOrderIitems(cartItemsCopy));
    } else {
      const itemIndex: number = cartItemsCopy.findIndex((cartItem) => (cartItem.name == item.name && cartItem.categoryName == categoryName) && ((cartItem.variations) ? (cartItem.variations[0].name == activeVariation.name) : true));
      cartItemsCopy[itemIndex].quantity = cartItemsCopy[itemIndex].quantity - 1;
      dispatch(replaceOrderIitems(cartItemsCopy));
    }
    dispatch(showSuccess('Product Removed', 2000));
  }

  const addItemToCart = () => {
    const cartItemsCopy = cartItems ? [...cartItems] : [];
    if (activeVariation) {
      const cartItem = {
        "name": item.name,
        "categoryName": categoryName,
        "originalPrice": activeVariation.price ? activeVariation.price : item.price,
        "price": (activeVariation.salePrice ? activeVariation.salePrice : item.salePrice) || item.price,
        "quantity": 1,
        "remark": null,
        "imagePaths": item.imagePaths,
        "variations": [{
          "name": activeVariation.name,
          "price": activeVariation.price,
          "salePrice": activeVariation.salePrice
        }]
      }
      cartItemsCopy.push(cartItem);
      dispatch(replaceOrderIitems(cartItemsCopy));
      dispatch(showSuccess('Product Added', 2000));
    } else {
      const cartItem = {
        "name": item.name,
        "categoryName": categoryName,
        "originalPrice": 0,
        "price": item.salePrice || item.price,
        "quantity": 1,
        "remark": null,
        "imagePaths": item.imagePaths,
        "variations": null
      }
      cartItemsCopy.push(cartItem);
      dispatch(replaceOrderIitems(cartItemsCopy));
      dispatch(showSuccess('Product Added', 2000));
    }
  }

  return (
    <div className="prodpdpcontainer">
      <div className="modal-close" onClick={() => router.back()}>
        <SvgIcon icon="close" />
      </div>
      <div className="prodpdpbanner">
        <ImageSlider itemsList={item.imagePaths} config={{ redirection: false }} no_image={PDP_NO_IMAGE} />
      </div>
      <div className="prod-pdp-details" style={{ marginBottom: (cartItems && cartItems.length) != 0 ? '35px' : '0' }}>
        {/* <div className="prod-pdp-off">15% OFF</div> */}
        <div className="prod-pdp-nameprice">
          <div className="prod-pdp-name">{item.name}</div>
          <div className="prod-pdp-price">
            {item.variations.length != 0 ? <>
              <div className="prod-sale-price">
                <span>{configData.currencySymbol} {activeVariation.price != 0 ? activeVariation.price : item.price}</span>
                {activeVariation.salePrice != 0 && <>{configData.currencySymbol} {activeVariation.salePrice}</>}
              </div>
            </> :
              <>
                {item.salePrice == 0 ?
                  <div className="prod-sale-price">
                    {configData.currencySymbol} {item.price}
                  </div> :
                  <div className="prod-sale-price">
                    <span>{configData.currencySymbol} {item.price}</span>
                    {configData.currencySymbol} {item.salePrice}
                  </div>
                }
              </>
            }
          </div>
        </div>
        <div className="itemcounter">
          {quantity == 0 ?
            <div className="addtocartbtn" onClick={addItemToCart}>Add to cart</div>
            :
            <div className="itemcounterinner">
              <div className="counterbuttons">
                <div className="countclick"
                  onClick={removeQuantity}>-</div>
                <div className="countnum">
                  {quantity}
                </div>
                <div className="countclick"
                  onClick={addQuantity}>+</div>
              </div>
            </div>
          }

        </div>
        {/* <div className="prod-pdp-sizetitle">Size</div> */}
        <div className="prod-pdp-size">
          {item.variations && item.variations?.length !== 0 && item.variations?.map((variant, variantIndex) => {
            return <div key={variantIndex}>
              <span className={activeVariation.name === variant.name ? 'active' : ''} onClick={() => setActiveVariation(variant)}>{variant.name}</span>
            </div>
          })}
        </div>
        <div className="fullwidth">

          {item.description && <Accordion>
            <AccordionSummary
              expandIcon={<SvgIcon icon="timer" />}
              aria-controls="panel1a-content"
              id="panel1a-header">
              <div className="accor-title">Description</div>
            </AccordionSummary>
            <AccordionDetails>
              {item.description}
            </AccordionDetails>
          </Accordion>}

          {item.benefits && <Accordion>
            <AccordionSummary
              expandIcon={<SvgIcon icon="timer" />}
              aria-controls="panel1a-content"
              id="panel1a-header">
              <div className="accor-title">Features & Benefits</div>
            </AccordionSummary>
            <AccordionDetails>
              {item.benefits}
            </AccordionDetails>
          </Accordion>}

          {item.ingredients && <Accordion>
            <AccordionSummary
              expandIcon={<SvgIcon icon="timer" />}
              aria-controls="panel1a-content"
              id="panel1a-header">
              <div className="accor-title">Ingredients</div>
            </AccordionSummary>
            <AccordionDetails>
              {item.ingredients}
            </AccordionDetails>
          </Accordion>}

          {item.howToUse && <Accordion>
            <AccordionSummary
              expandIcon={<SvgIcon icon="timer" />}
              aria-controls="panel1a-content"
              id="panel1a-header">
              <div className="accor-title">How To Use</div>
            </AccordionSummary>
            <AccordionDetails>
              {item.howToUse}
            </AccordionDetails>
          </Accordion>}
          <div className="common-15height"></div>
        </div>
      </div>
    </div>
  );
}

export default ProductPdp;
