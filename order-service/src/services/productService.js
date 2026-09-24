function serviceError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function getProduct(productId) {
  const baseUrl = process.env.PRODUCT_SERVICE_URL || "http://localhost:3001";
  let response;

  try {
    response = await fetch(`${baseUrl}/api/products/${productId}`, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw serviceError(503, `Product Service không khả dụng: ${error.message}`);
  }

  if (response.status === 404) {
    throw serviceError(422, `Sản phẩm ${productId} không tồn tại`);
  }
  if (!response.ok) {
    throw serviceError(503, `Không thể xác thực sản phẩm ${productId}`);
  }

  const body = await response.json();
  return body.data;
}

async function hydrateOrderItems(items) {
  if (process.env.VALIDATE_PRODUCTS === "false") return items;

  const products = await Promise.all(items.map((item) => getProduct(item.productId)));

  return items.map((item, index) => {
    const product = products[index];
    if (product.stock < item.quantity) {
      throw serviceError(422, `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm`);
    }

    return {
      productId: product.id,
      productName: product.name,
      price: Number(product.price),
      quantity: Number(item.quantity),
    };
  });
}

module.exports = { hydrateOrderItems };

