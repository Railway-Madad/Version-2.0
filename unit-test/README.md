# Unit Test Suite

This folder contains isolated Jest + Supertest unit tests for backend APIs.

## Folder Structure

- `setup/`
- `setup/jest.setup.js`: Global test setup, mocked auth middleware states.
- `setup/authState.js`: Helpers to switch auth states (`valid`, `missing`, `malformed`, `expired`, `forbidden`).
- `setup/testApp.js`: In-memory Express app builder (no `app.listen`).
- `tests/routes/api-contract.test.js`: Route-level API contract tests for all backend API endpoints.
- `tests/controllers/*.test.js`: Focused unit tests for controller business logic and edge cases.

## Key Principles Used

- No real server startup.
- No real database calls.
- No real external service calls (Cloudinary and stream upload mocked).
- Mocked authentication middleware for valid/invalid/expired/forbidden flows.
- Explicit edge-case tests for 400, 401, 403, 404, and 500 outcomes.
- AAA (Arrange, Act, Assert) pattern in every test case.
