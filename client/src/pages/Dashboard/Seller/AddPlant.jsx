import AddPlantForm from "../../../components/Form/AddPlantForm";
import { imageUpload } from "../../../api/utils";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { useState } from "react";
import toast from "react-hot-toast";

const AddPlant = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    const form = e.target;
    const name = form?.name?.value;
    const category = form?.category?.value;
    const description = form?.description?.value;
    const price = form?.price?.value;
    const quantity = form?.quantity?.value;
    const image = form?.image?.files[0];

    try {
      // image url response from imgbb
      const imageUrl = await imageUpload(image);

      // final all from data
      const plantData = {
        name,
        category,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        image: imageUrl,
        seller: {
          sellerName: user?.displayName,
          sellerEmail: user?.email,
          sellerImage: user?.photoURL,
        },
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/add-plant`,
        plantData
      );
      toast.success("Plant Added Successfully!");
      form.reset();
      setImagePreview(null);
      console.log(data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to add plant!");
    } finally {
      setIsUploading(false);
    }
  };

  // image change handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {/* Form */}
      <AddPlantForm
        handleFormSubmit={handleFormSubmit}
        isUploading={isUploading}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
      />
    </div>
  );
};

export default AddPlant;
