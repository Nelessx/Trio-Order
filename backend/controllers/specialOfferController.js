import specialOfferModel from "../models/specialOfferModel.js";
import itemModel from "../models/itemModel.js";

// Create Special Offer
export const createSpecialOffer = async (req, res, next) => {
  try {
    console.log('Creating special offer with data:', req.body);
    const { 
      title, 
      description, 
      itemId, 
      originalPrice, 
      discountedPrice, 
      discountPercentage,
      validUntil,
      priority,
      tags 
    } = req.body;

    // Validate that the item exists
    const item = await itemModel.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Validate prices - Allow small discounts (minimum 1% discount)
    if (discountedPrice >= originalPrice) {
      return res.status(400).json({ 
        message: 'Discounted price must be less than original price. Please provide a valid discount.' 
      });
    }

    // Check if discount is too small (less than 1%)
    const discountAmount = originalPrice - discountedPrice;
    const calculatedDiscountPercentage = (discountAmount / originalPrice) * 100;
    
    if (calculatedDiscountPercentage < 1) {
      return res.status(400).json({ 
        message: 'Discount must be at least 1%. Please provide a meaningful discount.' 
      });
    }

    // Calculate discount percentage if not provided
    const finalDiscountPercentage = discountPercentage || Math.round(calculatedDiscountPercentage);

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newSpecialOffer = new specialOfferModel({
      title,
      description,
      item: itemId,
      originalPrice,
      discountedPrice,
      discountPercentage: finalDiscountPercentage,
      validUntil: new Date(validUntil),
      priority: priority || 0,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      imageUrl,
    });

    const saved = await newSpecialOffer.save();
    
    // Populate the item details
    await saved.populate('item');
    
    console.log('Special offer created successfully:', saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating special offer:', err);
    next(err);
  }
};

// Get all special offers
export const getSpecialOffers = async (req, res, next) => {
  try {
    console.log('Fetching special offers...');
    const { active, expired } = req.query;
    let query = {};
    
    // Filter by active status
    if (active === 'true') {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    } else if (active === 'false') {
      query.isActive = false;
    }
    
    // Filter by expired status
    if (expired === 'true') {
      query.validUntil = { $lt: new Date() };
    } else if (expired === 'false') {
      query.validUntil = { $gte: new Date() };
    }

    const specialOffers = await specialOfferModel
      .find(query)
      .populate('item')
      .sort({ priority: -1, createdAt: -1 });

    console.log('Found special offers:', specialOffers.length);

    const host = `${req.protocol}://${req.get('host')}`;

    const withFullUrl = specialOffers.map(offer => ({
      ...offer.toObject(),
      imageUrl: offer.imageUrl ? host + offer.imageUrl : '',
      item: offer.item ? {
        ...offer.item.toObject(),
        imageUrl: offer.item.imageUrl ? host + offer.item.imageUrl : ''
      } : null
    }));

    res.json(withFullUrl);
  } catch (err) {
    console.error('Error fetching special offers:', err);
    next(err);
  }
};

// Get single special offer
export const getSpecialOffer = async (req, res, next) => {
  try {
    const specialOffer = await specialOfferModel
      .findById(req.params.id)
      .populate('item');

    if (!specialOffer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const result = {
      ...specialOffer.toObject(),
      imageUrl: specialOffer.imageUrl ? host + specialOffer.imageUrl : '',
      item: specialOffer.item ? {
        ...specialOffer.item.toObject(),
        imageUrl: specialOffer.item.imageUrl ? host + specialOffer.item.imageUrl : ''
      } : null
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Update special offer
export const updateSpecialOffer = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      itemId, 
      originalPrice, 
      discountedPrice, 
      discountPercentage,
      validUntil,
      priority,
      tags,
      isActive 
    } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (itemId) {
      // Validate that the item exists
      const item = await itemModel.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      updateData.item = itemId;
    }
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (discountedPrice !== undefined) updateData.discountedPrice = discountedPrice;
    if (discountPercentage !== undefined) updateData.discountPercentage = discountPercentage;
    if (validUntil) updateData.validUntil = new Date(validUntil);
    if (priority !== undefined) updateData.priority = priority;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle image upload
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Validate prices if both are provided - Allow small discounts (minimum 1% discount)
    if (updateData.originalPrice && updateData.discountedPrice) {
      if (updateData.discountedPrice >= updateData.originalPrice) {
        return res.status(400).json({ 
          message: 'Discounted price must be less than original price. Please provide a valid discount.' 
        });
      }

      // Check if discount is too small (less than 1%)
      const discountAmount = updateData.originalPrice - updateData.discountedPrice;
      const calculatedDiscountPercentage = (discountAmount / updateData.originalPrice) * 100;
      
      if (calculatedDiscountPercentage < 1) {
        return res.status(400).json({ 
          message: 'Discount must be at least 1%. Please provide a meaningful discount.' 
        });
      }
    }

    const updated = await specialOfferModel
      .findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('item');

    if (!updated) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const result = {
      ...updated.toObject(),
      imageUrl: updated.imageUrl ? host + updated.imageUrl : '',
      item: updated.item ? {
        ...updated.item.toObject(),
        imageUrl: updated.item.imageUrl ? host + updated.item.imageUrl : ''
      } : null
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Delete special offer
export const deleteSpecialOffer = async (req, res, next) => {
  try {
    const removed = await specialOfferModel.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: "Special offer not found" });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Toggle active status
export const toggleSpecialOfferStatus = async (req, res, next) => {
  try {
    const specialOffer = await specialOfferModel.findById(req.params.id);

    if (!specialOffer) {
      return res.status(404).json({ message: 'Special offer not found' });
    }

    specialOffer.isActive = !specialOffer.isActive;
    await specialOffer.save();

    await specialOffer.populate('item');

    const host = `${req.protocol}://${req.get('host')}`;
    const result = {
      ...specialOffer.toObject(),
      imageUrl: specialOffer.imageUrl ? host + specialOffer.imageUrl : '',
      item: specialOffer.item ? {
        ...specialOffer.item.toObject(),
        imageUrl: specialOffer.item.imageUrl ? host + specialOffer.item.imageUrl : ''
      } : null
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Get active special offers for frontend
export const getActiveSpecialOffers = async (req, res, next) => {
  try {
    const specialOffers = await specialOfferModel
      .find({ 
        isActive: true, 
        validUntil: { $gte: new Date() } 
      })
      .populate('item')
      .sort({ priority: -1, createdAt: -1 });

    const host = `${req.protocol}://${req.get('host')}`;

    const withFullUrl = specialOffers.map(offer => ({
      ...offer.toObject(),
      imageUrl: offer.imageUrl ? host + offer.imageUrl : '',
      item: offer.item ? {
        ...offer.item.toObject(),
        imageUrl: offer.item.imageUrl ? host + offer.item.imageUrl : ''
      } : null
    }));

    res.json(withFullUrl);
  } catch (err) {
    next(err);
  }
};
