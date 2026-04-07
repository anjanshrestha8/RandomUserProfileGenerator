import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Random User Generator API",
      version: "1.0.0",
      description: "API for generating and retrieving random user profiles",
    },
    servers: [{ url: "/api/v1" }],
    components: {
      schemas: {
        RandomUserProfile: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            first_name: { type: "string", example: "Jane" },
            last_name: { type: "string", example: "Doe" },
            email: { type: "string", example: "jane.doe@example.com" },
            gender: { type: "string", example: "female" },
            age: { type: "integer", example: 28 },
            street: { type: "string", example: "123 Main St" },
            city: { type: "string", example: "Springfield" },
            state: { type: "string", example: "IL" },
            zip: { type: "string", example: "62701" },
            profile_pic: {
              type: "string",
              example: "https://example.com/pic.jpg",
            },
            created_at: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            code: { type: "string", example: "NOT_FOUND" },
            message: { type: "string", example: "User with id 99 not found." },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "Server is healthy",
            },
          },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Get random users",
          parameters: [
            {
              in: "query",
              name: "count",
              schema: { type: "integer", minimum: 1, maximum: 50, default: 1 },
              description: "Number of random users to return (1–50)",
            },
          ],
          responses: {
            "200": {
              description: "A list of random user profiles",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      count: { type: "integer", example: 5 },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/RandomUserProfile",
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid count parameter",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get a user by ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer", minimum: 1 },
              description: "The user ID",
            },
          ],
          responses: {
            "200": {
              description: "User profile found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      data: { $ref: "#/components/schemas/RandomUserProfile" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid ID",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
