import express from 'express';
import multer from 'multer';
import { 
  createSpecialOffer, 
  getSpecialOffers, 
  getSpecialOffer, 
  updateSpecialOffer, 
  deleteSpecialOffer, 
  toggleSpecialOfferStatus,
  getActiveSpecialOffers 
} from '../controllers/specialOfferController.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';

const specialOfferRouter = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Public routes (for frontend)
specialOfferRouter.get('/active', getActiveSpecialOffers);

// Admin routes (protected)
specialOfferRouter.post('/', adminAuthMiddleware, upload.single('image'), createSpecialOffer);
specialOfferRouter.get('/', adminAuthMiddleware, getSpecialOffers);
specialOfferRouter.get('/:id', adminAuthMiddleware, getSpecialOffer);
specialOfferRouter.put('/:id', adminAuthMiddleware, upload.single('image'), updateSpecialOffer);
specialOfferRouter.delete('/:id', adminAuthMiddleware, deleteSpecialOffer);
specialOfferRouter.patch('/:id/toggle', adminAuthMiddleware, toggleSpecialOfferStatus);

export default specialOfferRouter;
