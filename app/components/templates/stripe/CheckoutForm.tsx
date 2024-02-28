import { CircularProgress } from "@material-ui/core";
import Loader from "@module/loader";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ConfirmPaymentData, StripeElements, StripeErrorType, StripePaymentElementOptions } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

export default function CheckoutForm({ stripeModalDetails }: any) {

  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      debugger
      switch (paymentIntent!.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      console.log("Stripe has not loaded yet.");
      return;
    }

    setIsLoading(true);

    let options: { elements: StripeElements, confirmParams: ConfirmPaymentData } = {
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${stripeModalDetails.redirectUrl + "?status=paid&id=" + stripeModalDetails.order.id}`,
        payment_method_data: {
          billing_details: {
            "address": {
              "city": stripeModalDetails.address.city,
              "country": stripeModalDetails.address.country,//need to fetch this
              "line1": stripeModalDetails.address.line,
              "line2": stripeModalDetails.address.area,
              "postal_code": stripeModalDetails.address.code,
              "state": stripeModalDetails.address.landmark,//need to add state options in user registration
            },
            "email": stripeModalDetails.user.email || "",
            "name": stripeModalDetails.user.firstName,
            "phone": stripeModalDetails.user.mobileNo
          }
        },
        payment_method: "pm_card_visa"
      },
    }

    const stripeResponse = await stripe.confirmPayment(options);
    console.log("stripeResponse", stripeResponse)
    const { error } = stripeResponse
    debugger

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    let f: StripeErrorType
    console.log("Payment Failed")
    console.log(error);
    if (error.type === "card_error" || error.type === "validation_error" || "payment_intent_authentication_failure") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    wallets: {
      googlePay: "auto",
      applePay: "auto",
    }
  }

  return (
    <form className="stripePaymentForm" onSubmit={handleSubmit}>
      <PaymentElement options={paymentElementOptions} />
      <button disabled={isLoading || !stripe || !elements} className="primary-btn stripeConfirmBtn">
        {isLoading ? <CircularProgress size={21} /> : "Proceed"}
      </button>
      {isLoading && <Loader />}
      {/* Show any error or success messages */}
      {message && <div className="error">{message}</div>}
    </form>
  );
}
// import React from 'react'

// function CheckoutForm() {
//   return (
//     <div>CheckoutForm</div>
//   )
// }

// export default CheckoutForm