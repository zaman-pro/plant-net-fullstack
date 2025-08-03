import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../Form/CheckoutForm";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK_KEY);

const PurchaseModal = ({ closeModal, isOpen, plant }) => {
  const { user } = useAuth();
  const { _id, name, category, price, quantity, image, seller } = plant || {};

  // Total Price Calculation
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(price);
  const [orderData, setOrderData] = useState({
    seller,
    plantId: _id,
    quantity: 1,
    price: price,
    plantName: name,
    plantCategory: category,
    plantImage: image,
  });

  useEffect(() => {
    if (user) {
      setOrderData((prev) => {
        return {
          ...prev,
          customer: {
            name: user?.displayName,
            email: user?.email,
            image: user?.photoURL,
          },
        };
      });
    }
  }, [user]);

  const handleQuantity = (value) => {
    const totalQuantity = parseInt(value);

    if (totalQuantity > quantity) return toast.error("Not enough items!");

    const calculatedPrice = totalQuantity * price;

    setSelectedQuantity(totalQuantity);
    setTotalPrice(calculatedPrice);
    setOrderData((prev) => {
      return {
        ...prev,
        price: calculatedPrice,
        quantity: totalQuantity,
      };
    });
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none "
      onClose={closeModal}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 shadow-xl rounded-2xl"
          >
            <DialogTitle
              as="h3"
              className="text-lg font-medium text-center leading-6 text-gray-900"
            >
              Review Info Before Purchase
            </DialogTitle>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Plant: {name}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Category: {category}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Customer: {user?.displayName}
              </p>
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-500">Price: $ {price}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Available Quantity: {quantity}
              </p>
            </div>
            {/* order info */}
            <hr className="my-2 border-lime-300" />
            <div className="mt-2">
              <h2 htmlFor="quantity" className="block text-sm text-gray-500">
                Purchase Info
              </h2>
              <input
                value={selectedQuantity}
                onChange={(e) => handleQuantity(e.target.value)}
                type="number"
                min={1}
                // max={quantity}
                className="px-4 w-1/4 py-3 border border-lime-300 focus:outline-lime-500 rounded-md bg-white text-sm text-gray-500 mt-2"
              />
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Purchase Quantity: {selectedQuantity}
              </p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Total Price: $ {totalPrice}
              </p>
            </div>
            {/* stripe checkout form */}
            <Elements stripe={stripePromise}>
              <CheckoutForm totalPrice={totalPrice} orderData={orderData} />
            </Elements>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default PurchaseModal;
