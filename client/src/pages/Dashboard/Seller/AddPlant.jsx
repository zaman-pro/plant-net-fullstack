import AddPlantForm from "../../../components/Form/AddPlantForm";
import { imageUpload } from "../../../api/utils";

const AddPlant = () => {
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const name = form?.name?.value;
    const category = form?.category?.value;
    const description = form?.description?.value;
    const price = form?.price?.value;
    const quantity = form?.quantity?.value;
    const image = form?.image?.files[0];

    // image url response from imgbb
    const imageUrl = await imageUpload(image);

    // final all from data
    const plantData = {
      name,
      category,
      description,
      price,
      quantity,
      image: imageUrl,
    };

    console.table(plantData);
  };

  return (
    <div>
      {/* Form */}
      <AddPlantForm handleFormSubmit={handleFormSubmit} />
    </div>
  );
};

export default AddPlant;
