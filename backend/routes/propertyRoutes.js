const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer memory storage for spreadsheet uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase();
    if (ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.csv') || file.mimetype.includes('sheet') || file.mimetype.includes('csv') || file.mimetype.includes('excel')) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx, .xls, and .csv spreadsheet files are permitted'));
    }
  }
});

const {
  getProperties,
  getPropertyById,
  getFeaturedProperties,
  getCities,
  createProperty,
  updateProperty,
  deleteProperty,
  addUnit,
  deleteUnit,
  bulkUploadProperties,
  downloadExcelTemplate
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/cities', getCities);
router.get('/excel-template', downloadExcelTemplate);
router.get('/:id', getPropertyById);

// Owner/Admin actions
router.post('/', protect, authorize('owner', 'admin'), createProperty);
router.post('/bulk-upload', protect, authorize('owner', 'admin'), upload.single('file'), bulkUploadProperties);
router.put('/:id', protect, authorize('owner', 'admin'), updateProperty);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteProperty);
router.post('/:id/units', protect, authorize('owner', 'admin'), addUnit);
router.delete('/units/:unitId', protect, authorize('owner', 'admin'), deleteUnit);

module.exports = router;
