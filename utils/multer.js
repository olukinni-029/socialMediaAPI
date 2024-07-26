import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png'&& ext !== '.mp3'&& ext !== '.mp4') {
    return cb(new Error('File type is not supported'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 50 }, });
  
  export { upload };
