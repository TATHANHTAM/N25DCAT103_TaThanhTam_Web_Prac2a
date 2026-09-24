const swaggerJsdoc = require("swagger-jsdoc");

module.exports = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Product Service API",
      version: "1.0.0",
      description: "REST API quản lý sản phẩm cho Lab 2a",
    },
    servers: [
      { url: "http://localhost:3001", description: "Product Service" },
      { url: "http://localhost:3000", description: "API Gateway" },
    ],
    components: {
      parameters: {
        ProductId: {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "integer", minimum: 1 },
        },
      },
      responses: {
        ValidationError: {
          description: "Dữ liệu không hợp lệ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string" },
                  errors: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
      },
      schemas: {
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Điện thoại" },
            slug: { type: "string", example: "mobile" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "iPhone 15 Pro" },
            slug: { type: "string", example: "iphone-15-pro" },
            price: { type: "number", example: 27990000 },
            stock: { type: "integer", example: 50 },
            description: { type: "string", nullable: true },
            imageUrl: { type: "string", nullable: true },
            isActive: { type: "boolean", example: true },
            category: { $ref: "#/components/schemas/Category" },
          },
        },
        ProductInput: {
          type: "object",
          required: ["name", "price"],
          properties: {
            name: { type: "string", example: "iPhone 15 Pro" },
            price: { type: "number", minimum: 0, example: 27990000 },
            stock: { type: "integer", minimum: 0, example: 50 },
            description: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
            categoryId: { type: "integer", nullable: true },
          },
        },
        PaginatedProducts: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
            pagination: {
              type: "object",
              properties: {
                total: { type: "integer" },
                page: { type: "integer" },
                limit: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
});

