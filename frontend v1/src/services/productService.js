// src/services/productService.js - Add methods for editing products
import api from "./api";

export const productService = {
  // Existing methods...
  // This should be in your productService.js file
  // Make sure your getProducts function properly formats the URL parameters

  getProducts: async (params = {}) => {
    try {
      // Convert params object to URL query string - more explicit approach
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach((key) => {
        // Skip empty values
        if (
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ""
        ) {
          queryParams.append(key, params[key]);
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `/api/products/?${queryString}`
        : "/api/products/";

      const response = await api.get(url);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProductBySlug: async (slug) => {
    try {
      const response = await api.get(`/api/products/${slug}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a product
  createProduct: async (productData) => {
    try {
      const response = await api.post("/api/products/", productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a product
  updateProduct: async (slug, productData) => {
    try {
      const response = await api.put(`/api/products/${slug}/`, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (slug) => {
    try {
      const response = await api.delete(`/api/products/${slug}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a product variant
  createProductVariant: async (variantData) => {
    try {
      // Make a copy of the data to ensure we don't modify the original
      const dataToSend = { ...variantData };

      // Ensure we're using product_id as the field name
      if (dataToSend.product && !dataToSend.product_id) {
        dataToSend.product_id = dataToSend.product;
        delete dataToSend.product; // Remove the original product field
      }

      // Ensure product_id is a string
      if (dataToSend.product_id) {
        dataToSend.product_id = String(dataToSend.product_id);
      }

      // Ensure numeric fields are numbers, not strings
      if (dataToSend.price) dataToSend.price = Number(dataToSend.price);
      if (dataToSend.stock) dataToSend.stock = Number(dataToSend.stock);
      if (dataToSend.discount_price)
        dataToSend.discount_price = Number(dataToSend.discount_price);
      if (dataToSend.discount_percentage)
        dataToSend.discount_percentage = Number(dataToSend.discount_percentage);

      const response = await api.post("/api/product-variants/", dataToSend);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a product variant
  updateProductVariant: async (variantId, variantData, productId) => {
    try {
      // Format data similar to creation
      const dataToSend = { ...variantData };

      // Make sure product_id is included
      if (productId && !dataToSend.product_id) {
        dataToSend.product_id = productId;
      }

      // Convert numeric fields
      if (dataToSend.price) dataToSend.price = Number(dataToSend.price);
      if (dataToSend.stock) dataToSend.stock = Number(dataToSend.stock);
      if (dataToSend.discount_price)
        dataToSend.discount_price = Number(dataToSend.discount_price);
      if (dataToSend.discount_percentage)
        dataToSend.discount_percentage = Number(dataToSend.discount_percentage);

      const response = await api.put(
        `/api/product-variants/${variantId}/`,
        dataToSend,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a product variant
  deleteProductVariant: async (variantId) => {
    try {
      const response = await api.delete(`/api/product-variants/${variantId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload a product image
  uploadProductImage: async (productId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("product", productId);
      formData.append("image", imageFile);

      const response = await api.post("/api/product-images/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a product image
  deleteProductImage: async (imageId) => {
    try {
      const response = await api.delete(`/api/product-images/${imageId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete multi-step product creation
  createCompleteProduct: async (productData, variants, imageFiles) => {
    try {
      // Step 1: Create the base product

      const product = await productService.createProduct(productData);

      if (!product.id) {
        throw new Error("Created product is missing an ID field");
      }

      // Step 2: Create variants for the product
      const createdVariants = [];
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          try {
            // Create a clean variant object with the correct field name
            const variantData = {
              ...variant,
              product_id: product.id, // Use product_id instead of product
            };

            const createdVariant =
              await productService.createProductVariant(variantData);
            createdVariants.push(createdVariant);
          } catch (variantError) {
            // Continue with other variants even if one fails
          }
        }
      }

      // Step 3: Upload product images
      const uploadedImages = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          try {
            const uploadedImage = await productService.uploadProductImage(
              product.id,
              imageFile,
            );
            uploadedImages.push(uploadedImage);
          } catch (imageError) {
            // Continue with other images even if one fails
          }
        }
      }

      return {
        product,
        variants: createdVariants,
        images: uploadedImages,
      };
    } catch (error) {
      throw error;
    }
  },

  // Fetch variants for a product
  getProductVariants: async (slug) => {
    try {
      const response = await api.get(`/api/products/${slug}/variants/`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  getProductReviews: async (slug) => {
    try {
      const response = await api.get(`/api/products/${slug}/reviews/`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  addProductReview: async (slug, reviewData) => {
    try {
      const response = await api.post(
        `/api/products/${slug}/reviews/`,
        reviewData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get("/api/categories/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBrands: async () => {
    try {
      const response = await api.get("/api/brands/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Toggle product active status
  toggleProductStatus: async (slug) => {
    try {
      const response = await api.patch(`api/products/${slug}/toggle_status/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default productService;
