function calculateOrder(items) {
  const processedItems = items.map((item) => {
    const price = Number(item.price);
    const quantity = Number.parseInt(item.quantity, 10);
    return {
      ...item,
      price,
      quantity,
      subtotal: price * quantity,
    };
  });

  const totalAmount = processedItems.reduce((sum, item) => sum + item.subtotal, 0);
  return { processedItems, totalAmount };
}

function createOrderCode(now = new Date(), random = Math.random()) {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(random * 1000000).toString().padStart(6, "0");
  return `ORD-${date}-${suffix}`;
}

module.exports = { calculateOrder, createOrderCode };

