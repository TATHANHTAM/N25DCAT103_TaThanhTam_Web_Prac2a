const swaggerJsdoc = require("swagger-jsdoc");

module.exports = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Auth Service API", version: "1.0.0", description: "JWT authentication cho Lab 2a" },
    servers: [
      { url: "http://localhost:3003", description: "Auth Service" },
      { url: "http://localhost:3000", description: "API Gateway" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Nguyễn Văn A" },
            email: { type: "string", format: "email", example: "student@example.com" },
            password: { type: "string", format: "password", example: "Student123" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
});

