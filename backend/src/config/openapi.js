/**
 * Specyfikacja OpenAPI 3.0 serwowana przez Swagger UI pod /api-docs.
 * Stanowi dokumentacje API (wymaganie techniczne) oraz klienta testowego.
 */
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'System Aukcyjny REST API',
    version: '1.0.0',
    description:
      'REST API rozproszonego systemu aukcyjnego. Projekt z przedmiotu "Tworzenie uslug sieciowych REST". ' +
      'Architektura warstwowa: Controller -> Service -> Repository -> Model (SQLite).',
  },
  servers: [{ url: '/', description: 'Biezacy serwer' }],
  tags: [
    { name: 'Auth', description: 'Rejestracja i logowanie (JWT)' },
    { name: 'Users', description: 'Zarzadzanie uzytkownikami' },
    { name: 'Auctions', description: 'Zarzadzanie aukcjami' },
    { name: 'Bids', description: 'Licytacja' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
      Credentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jan@example.com' },
          password: { type: 'string', example: 'tajneHaslo1' },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', example: 'jan_kowalski' },
          email: { type: 'string', format: 'email', example: 'jan@example.com' },
          password: { type: 'string', minLength: 6, example: 'tajneHaslo1' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string' },
          email: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', description: 'JWT do naglowka Authorization: Bearer' },
        },
      },
      AuctionInput: {
        type: 'object',
        required: ['title', 'category', 'startingPrice', 'startDate', 'endDate'],
        properties: {
          title: { type: 'string', example: 'Rower gorski' },
          description: { type: 'string', example: 'Stan idealny, rama 19"' },
          category: { type: 'string', example: 'Sport' },
          startingPrice: { type: 'number', example: 500 },
          startDate: { type: 'string', format: 'date-time', example: '2026-06-21T10:00:00Z' },
          endDate: { type: 'string', format: 'date-time', example: '2026-06-28T10:00:00Z' },
        },
      },
      Auction: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          startingPrice: { type: 'number' },
          currentPrice: { type: 'number' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          ownerId: { type: 'integer' },
          status: { type: 'string', enum: ['scheduled', 'active', 'ended'] },
          createdAt: { type: 'string' },
        },
      },
      AuctionPage: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Auction' } },
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      BidInput: {
        type: 'object',
        required: ['amount'],
        properties: { amount: { type: 'number', example: 550 } },
      },
      Bid: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          auctionId: { type: 'integer' },
          bidderId: { type: 'integer' },
          bidderUsername: { type: 'string' },
          amount: { type: 'number' },
          createdAt: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Rejestracja uzytkownika',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } },
        },
        responses: {
          201: { description: 'Utworzono', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Bledy walidacji', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email/username zajety' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Logowanie (zwraca JWT)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } },
        },
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          401: { description: 'Bledne dane logowania' },
        },
      },
    },
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Dodanie uzytkownika (alias rejestracji)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
        responses: { 201: { description: 'Utworzono', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } } },
      },
      get: {
        tags: ['Users'],
        summary: 'Lista uzytkownikow',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Pobranie uzytkownika',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          404: { description: 'Nie znaleziono' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Edycja uzytkownika (tylko wlasciciel)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, email: { type: 'string' } } } } } },
        responses: { 200: { description: 'OK' }, 401: { description: 'Brak autoryzacji' }, 403: { description: 'Brak uprawnien' }, 404: { description: 'Nie znaleziono' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Usuniecie uzytkownika (tylko wlasciciel)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Usunieto' }, 401: { description: 'Brak autoryzacji' }, 403: { description: 'Brak uprawnien' }, 404: { description: 'Nie znaleziono' } },
      },
    },
    '/auctions': {
      get: {
        tags: ['Auctions'],
        summary: 'Lista aukcji (filtrowanie, sortowanie, paginacja)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'ended', 'scheduled'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['created_at', 'end_date', 'current_price', 'title'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuctionPage' } } } } },
      },
      post: {
        tags: ['Auctions'],
        summary: 'Utworzenie aukcji',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuctionInput' } } } },
        responses: { 201: { description: 'Utworzono', content: { 'application/json': { schema: { $ref: '#/components/schemas/Auction' } } } }, 400: { description: 'Bledy walidacji' }, 401: { description: 'Brak autoryzacji' } },
      },
    },
    '/auctions/{id}': {
      get: {
        tags: ['Auctions'],
        summary: 'Pobranie aukcji',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Auction' } } } }, 404: { description: 'Nie znaleziono' } },
      },
      put: {
        tags: ['Auctions'],
        summary: 'Edycja aukcji (tylko wlasciciel)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuctionInput' } } } },
        responses: { 200: { description: 'OK' }, 401: { description: 'Brak autoryzacji' }, 403: { description: 'Brak uprawnien' }, 404: { description: 'Nie znaleziono' } },
      },
      delete: {
        tags: ['Auctions'],
        summary: 'Usuniecie aukcji (tylko wlasciciel)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Usunieto' }, 401: { description: 'Brak autoryzacji' }, 403: { description: 'Brak uprawnien' }, 404: { description: 'Nie znaleziono' } },
      },
    },
    '/auctions/{id}/bids': {
      get: {
        tags: ['Bids'],
        summary: 'Historia ofert aukcji',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Bid' } } } } }, 404: { description: 'Nie znaleziono' } },
      },
      post: {
        tags: ['Bids'],
        summary: 'Zlozenie oferty (licytacja)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BidInput' } } } },
        responses: {
          201: { description: 'Oferta przyjeta', content: { 'application/json': { schema: { $ref: '#/components/schemas/Bid' } } } },
          400: { description: 'Oferta za niska / aukcja zakonczona' },
          401: { description: 'Brak autoryzacji' },
          403: { description: 'Nie mozna licytowac wlasnej aukcji' },
          404: { description: 'Nie znaleziono' },
        },
      },
    },
  },
};
