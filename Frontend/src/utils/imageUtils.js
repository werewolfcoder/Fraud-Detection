import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_BASE_URL;

export const fetchImage = async (imageUrl) => {
  try {
    const response = await axios.get(`${BACKEND_URL}${imageUrl}`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};
