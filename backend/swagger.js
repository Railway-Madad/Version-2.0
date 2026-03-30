const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Railway Madad API',
      version: '1.0.0',
      description: 'API documentation for the Railway Madad Backend',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js', './index.js'],
};

function jsonBody(schema, required = true) {
  return {
    required,
    content: {
      'application/json': {
        schema,
      },
    },
  };
}

function multipartBody(schema, required = true) {
  return {
    required,
    content: {
      'multipart/form-data': {
        schema,
      },
    },
  };
}

const NO_BODY_OPERATIONS = new Set([
  'POST /admin/logout',
  'POST /staff/logout',
  'POST /user/logout',
]);

// Endpoint-specific request bodies so Swagger UI shows concrete input fields.
const REQUEST_BODIES = {
  'POST /admin/register': jsonBody({
    type: 'object',
    required: ['name', 'username', 'email', 'password'],
    properties: {
      name: { type: 'string', example: 'Admin User' },
      username: { type: 'string', example: 'admin01' },
      email: { type: 'string', format: 'email', example: 'admin@railway.com' },
      password: { type: 'string', example: 'StrongPassword123' },
      trainNo: { type: 'string', example: '12951' },
    },
  }),
  'POST /admin/login': jsonBody({
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', example: 'admin01' },
      password: { type: 'string', example: 'StrongPassword123' },
    },
  }),
  'POST /admin/commands': jsonBody({
    type: 'object',
    required: ['title', 'description', 'targetRole'],
    properties: {
      title: { type: 'string', example: 'Urgent cleaning needed' },
      description: { type: 'string', example: 'Please clean coach S1 immediately.' },
      targetRole: { type: 'string', example: 'Cleaning' },
      priority: { type: 'string', example: 'high' },
    },
  }),
  'POST /admin/trains': jsonBody({
    type: 'object',
    required: ['trainNumber'],
    properties: {
      trainNumber: { type: 'string', example: '12951' },
    },
  }),
  'PUT /admin/staff/{id}': jsonBody({
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Updated Staff Name' },
      role: { type: 'string', example: 'Catering' },
      email: { type: 'string', format: 'email', example: 'staff@railway.com' },
      phone: { type: 'string', example: '9876543210' },
    },
  }, false),
  'PUT /admin/lostnfound/{id}/status': jsonBody({
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', example: 'resolved' },
    },
  }),

  'POST /staff/register': jsonBody({
    type: 'object',
    required: ['name', 'role', 'email', 'password', 'phone'],
    properties: {
      name: { type: 'string', example: 'John Staff' },
      role: { type: 'string', example: 'Catering' },
      email: { type: 'string', format: 'email', example: 'john.staff@railway.com' },
      password: { type: 'string', example: 'Staff@123' },
      phone: { type: 'string', example: '9876543210' },
    },
  }),
  'POST /staff/login': jsonBody({
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'john.staff@railway.com' },
      password: { type: 'string', example: 'Staff@123' },
    },
  }),
  'PUT /staff/complaints/{id}/resolve': jsonBody({
    type: 'object',
    required: ['resolutionDetails'],
    properties: {
      resolutionDetails: { type: 'string', example: 'Issue resolved by replacing equipment.' },
      resolutionCategory: { type: 'string', example: 'Resolved' },
    },
  }),
  'PUT /staff/commands/{id}/read': jsonBody({
    type: 'object',
    properties: {
      read: { type: 'boolean', example: true },
    },
  }, false),

  'POST /catering/order': jsonBody({
    type: 'object',
    required: ['items', 'deliveryAddress'],
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['foodItem', 'quantity'],
          properties: {
            foodItem: { type: 'string', example: '64f1ac9ab19d4e0012345678' },
            quantity: { type: 'number', example: 2 },
          },
        },
      },
      deliveryAddress: { type: 'string', example: 'Coach S1, Seat 45' },
      notes: { type: 'string', example: 'Less spicy please' },
    },
  }),
  'PUT /catering/{id}/status': jsonBody({
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', example: 'preparing' },
    },
  }),

  'POST /complaint/submit-complaint': multipartBody({
    type: 'object',
    required: ['username', 'pnr', 'trainNumber', 'bogieNumber', 'seatNumber', 'description', 'issueDomain'],
    properties: {
      username: { type: 'string', example: 'passenger01' },
      pnr: { type: 'string', example: '1234567890' },
      trainNumber: { type: 'string', example: '12951' },
      bogieNumber: { type: 'string', example: 'S1' },
      seatNumber: { type: 'string', example: '45' },
      description: { type: 'string', example: 'AC not working in my coach.' },
      issueDomain: { type: 'string', example: 'Cleaning' },
      image: { type: 'string', format: 'binary' },
    },
  }),
  'PUT /complaint/api/complaints/resolve/{id}': jsonBody({
    type: 'object',
    properties: {
      resolutionDetails: { type: 'string', example: 'Issue verified and resolved.' },
      resolutionCategory: { type: 'string', example: 'Resolved' },
    },
  }, false),
  'PUT /complaint/api/complaints/{id}/satisfaction': jsonBody({
    type: 'object',
    required: ['satisfied'],
    properties: {
      satisfied: { type: 'boolean', example: true },
      feedback: { type: 'string', example: 'Resolved quickly. Thank you.' },
    },
  }),

  'POST /emergency/postEmg': jsonBody({
    type: 'object',
    required: ['username', 'seatNumber'],
    properties: {
      username: { type: 'string', example: 'passenger01' },
      trainNumber: { type: 'string', example: '12951' },
      seatNumber: { type: 'string', example: 'S1-45' },
    },
  }),
  'PUT /emergency/{id}/inprocess': jsonBody({
    type: 'object',
    properties: {
      status: { type: 'string', example: 'inprocess' },
    },
  }, false),
  'PUT /emergency/{id}/resolve': jsonBody({
    type: 'object',
    properties: {
      status: { type: 'string', example: 'resolved' },
      remarks: { type: 'string', example: 'Emergency handled by onboard staff.' },
    },
  }, false),

  'POST /feedback': jsonBody({
    type: 'object',
    required: ['name', 'email', 'rating', 'comment'],
    properties: {
      name: { type: 'string', example: 'Rahul' },
      email: { type: 'string', format: 'email', example: 'rahul@example.com' },
      rating: { type: 'number', example: 5 },
      comment: { type: 'string', example: 'Great service!' },
    },
  }),

  'POST /food': multipartBody({
    type: 'object',
    required: ['name', 'description', 'price', 'category'],
    properties: {
      name: { type: 'string', example: 'Paneer Tikka Wrap' },
      description: { type: 'string', example: 'Fresh wrap served hot.' },
      price: { type: 'number', example: 120 },
      category: { type: 'string', example: 'Veg' },
      image: { type: 'string', format: 'binary' },
    },
  }),
  'PUT /food/{id}': jsonBody({
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Paneer Tikka Wrap' },
      description: { type: 'string', example: 'Updated description' },
      price: { type: 'number', example: 130 },
      category: { type: 'string', example: 'Veg' },
      isAvailable: { type: 'boolean', example: true },
    },
  }, false),

  'POST /lostnfound': multipartBody({
    type: 'object',
    required: ['title', 'description', 'category', 'location'],
    properties: {
      title: { type: 'string', example: 'Black wallet' },
      description: { type: 'string', example: 'Lost near coach S2.' },
      category: { type: 'string', example: 'Lost' },
      date: { type: 'string', example: '2026-03-30' },
      location: { type: 'string', example: 'Coach S2' },
      image: { type: 'string', format: 'binary' },
    },
  }),
  'PUT /lostnfound/{id}/resolve': jsonBody({
    type: 'object',
    properties: {
      status: { type: 'string', example: 'resolved' },
    },
  }, false),

  'POST /news': multipartBody({
    type: 'object',
    required: ['title', 'description'],
    properties: {
      title: { type: 'string', example: 'Train delayed by 20 minutes' },
      description: { type: 'string', example: 'Due to operational reasons.' },
      image: { type: 'string', format: 'binary' },
    },
  }),
};

function applyFallbackRequestBodies(spec) {
  const paths = spec.paths || {};

  for (const [path, operations] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(operations)) {
      const normalizedMethod = method.toUpperCase();
      if (!['POST', 'PUT', 'PATCH'].includes(normalizedMethod)) {
        continue;
      }

      const operationKey = `${normalizedMethod} ${path}`;
      if (NO_BODY_OPERATIONS.has(operationKey)) {
        continue;
      }

      if (operation.requestBody) {
        continue;
      }

      operation.requestBody = REQUEST_BODIES[operationKey] || jsonBody(
        {
          type: 'object',
          description: 'Request payload',
          additionalProperties: true,
        },
        false
      );
    }
  }

  return spec;
}

const swaggerSpec = applyFallbackRequestBodies(swaggerJsdoc(options));

module.exports = swaggerSpec;
