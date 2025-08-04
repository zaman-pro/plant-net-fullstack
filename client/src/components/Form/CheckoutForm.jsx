import React, { useEffect, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import "./checkoutForm.css";
import { ClipLoader } from "react-spinners";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const CheckoutForm = ({ totalPrice, orderData, refetch }) => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const stripe = useStripe();
  const elements = useElements();

  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const getClientSecret = async () => {
      // server req
      const { data } = await axiosSecure.post("/create-payment-intent", {
        quantity: orderData?.quantity,
        plantId: orderData?.plantId,
      });
      setClientSecret(data?.clientSecret);
      console.log(data?.clientSecret);
    };
    getClientSecret();
  }, [axiosSecure, orderData]);

  const handleSubmit = async (event) => {
    setProcessing(true);
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("[error]", error);
      setCardError(error.message);
      return setProcessing(false);
    } else {
      console.log("[PaymentMethod]", paymentMethod);
      setCardError(null);
    }

    // payment transaction
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: user?.displayName,
          email: user?.email,
        },
      },
    });
    if (result?.error) {
      return setCardError(result?.error?.message);
    }

    if (result?.paymentIntent?.status === "succeeded") {
      // save order data in db

      orderData.transactionId = result?.paymentIntent?.id;

      try {
        const { data } = await axiosSecure.post("/order", orderData);
        if (data?.insertedId) {
          toast.success("Order Placed Successfully!");
        }
        const { data: result } = await axiosSecure.patch(
          `/quantity-update/${orderData?.plantId}`,
          { quantityToUpdate: orderData?.quantity, status: "decrease" }
        );
        refetch();
        console.log(result);
      } catch (error) {
        console.log(error);
      } finally {
        setCardError(null);
        setProcessing(false);
      }

      // update item quantity in db from item collection
    }
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      {cardError && <p className="text-red-500 mb-5">{cardError}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="relative disabled:opacity-70 disabled:cursor-not-allowed rounded-lg hover:opacity-80 transition px-4 w-full text-white bg-lime-500 py-1 font-semibold"
      >
        {processing ? (
          <ClipLoader size={24} className="mt-2" />
        ) : (
          `Pay $${totalPrice}`
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;
