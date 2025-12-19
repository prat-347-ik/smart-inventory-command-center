import fs from 'fs';
import csv from 'csv-parser';
import Product from '../models/Product.model.js';

/**
 * Reads a CSV file path, parses it, and bulk inserts into MongoDB.
 * Returns a Promise that resolves with the number of inserted docs.
 */
export const processCsvUpload = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('error', (error) => {
        reject(error);
      })
      .on('end', async () => {
        try {
          // 1. Transform CSV data to match Mongoose Schema
          // Assumes headers: sku, name, category, price, current_stock
          const products = results.map(row => ({
            sku: row.sku,
            name: row.name,
            category: row.category,
            price: parseFloat(row.price),
            current_stock: parseInt(row.current_stock),
            low_stock_threshold: parseInt(row.low_stock_threshold || 10)
          }));

          // 2. Bulk Insert
          if (products.length > 0) {
            await Product.insertMany(products);
          }

          // 3. Clean up the file from the server
          fs.unlinkSync(filePath);

          resolve(products.length);
        } catch (error) {
          // If insert fails, still try to delete file
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          reject(error);
        }
      });
  });
};