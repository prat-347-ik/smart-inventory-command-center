import logger from '../utils/logger.js';

export const inventorySocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

// Helper function to emit events from anywhere in the app
export const notifyStockUpdate = (io, product) => {
  if (!io) return;
  io.emit('INVENTORY_UPDATE', {
    sku: product.sku,
    newStock: product.current_stock
  });
  logger.info(`Emitted INVENTORY_UPDATE for ${product.sku}`);
};