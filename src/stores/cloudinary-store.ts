
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './cloudinary.config';

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      return {
        folder: 'avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
       transformation: [
  { quality: 'auto:best', fetch_format: 'auto' } // giữ chất lượng tốt
]
      };
    },
  });
  
export default storage;