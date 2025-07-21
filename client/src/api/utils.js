import axios from "axios";

// upload image and return image url
export const imageUpload = async (imageData) => {
  // put raw image data in formdata
  const imageFormData = new FormData();
  imageFormData.append("image", imageData);

  // upload image to imgbb server using post request with axios
  const { data } = await axios.post(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
    imageFormData
  );
  // image url response from imgbb
  return data?.data?.display_url;
};
