const swaggerJsdoc = require("swagger-jsdoc");

module.exports = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description: "API quản lý đơn hàng cho Lab 2a",
    },
    servers: [
      { url: "http://localhost:3002", description: "Order Service" },
      { url: "http://localhost:3000", description: "API Gateway" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        OrderItemInput: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "integer", example: 1 },
            quantity: { type: "integer", minimum: 1, example: 2 },
          },
        },
        OrderInput: {
          type: "object",
          required: ["customerName", "customerEmail", "items"],
          properties: {
            customerId: { type: "integer", description: "Không bắt buộc khi gọi qua Gateway" },
            customerName: { type: "string", example: "Nguyễn Văn A" },
            customerEmail: { type: "string", format: "email", example: "student@example.com" },
            items: { type: "array", minItems: 1, items: { $ref: "#/components/schemas/OrderItemInput" } },
            shippingAddress: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                district: { type: "string" },
              },
            },
            note: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
});

