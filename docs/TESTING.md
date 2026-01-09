# Testing Guide

This guide covers testing strategies and best practices for Mango Social.

## Table of Contents
- [Overview](#overview)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Manual Testing](#manual-testing)

## Overview

Mango Social uses the following testing tools:

### Frontend
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking

### Backend
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **pg-mem** - In-memory PostgreSQL for testing

## Running Tests

### Frontend Tests
```bash
cd client
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Backend Tests
```bash
cd server
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Run All Tests
```bash
# From root directory
npm test
```

## Writing Tests

### Frontend Component Tests

**Example: Testing a Button Component**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

**Example: Testing a Page with API Calls**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import HomePage from './HomePage';

const server = setupServer(
  rest.get('/api/posts/feed', (req, res, ctx) => {
    return res(ctx.json({
      posts: [
        { id: 1, content: 'Test post', author: 'John' }
      ]
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('HomePage', () => {
  it('displays posts from API', async () => {
    render(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test post')).toBeInTheDocument();
    });
  });
});
```

### Backend API Tests

**Example: Testing an Auth Endpoint**
```typescript
import request from 'supertest';
import app from '../app';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        fullName: 'Test User'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
```

**Example: Testing Protected Endpoints**
```typescript
describe('GET /api/users/profile', () => {
  let authToken: string;

  beforeEach(async () => {
    // Create a test user and get token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      });
    
    authToken = response.body.token;
  });

  it('should return user profile when authenticated', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .get('/api/users/profile');

    expect(response.status).toBe(401);
  });
});
```

## Test Coverage

### Viewing Coverage Reports

**Frontend:**
```bash
cd client
npm run test:coverage
# Open coverage/index.html in browser
```

**Backend:**
```bash
cd server
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### What to Test

**High Priority:**
- Authentication and authorization
- Data validation
- API endpoints
- Critical user flows (registration, login, posting)
- Payment processing (if applicable)

**Medium Priority:**
- UI components
- Utility functions
- Error handling
- Edge cases

**Low Priority:**
- Styling
- Static content
- Third-party integrations (mock these)

## Manual Testing

### Test Checklist

#### Authentication
- [ ] User can register with valid credentials
- [ ] User cannot register with invalid email
- [ ] User cannot register with weak password
- [ ] User can login with correct credentials
- [ ] User cannot login with incorrect credentials
- [ ] User stays logged in after page refresh
- [ ] User can logout

#### Posts/Stories
- [ ] User can create a post
- [ ] User can upload an image with post
- [ ] User can like a post
- [ ] User can unlike a post
- [ ] User can comment on a post
- [ ] User can repost
- [ ] User can bookmark a post
- [ ] User can delete their own post

#### Profile
- [ ] User can view their profile
- [ ] User can edit their profile
- [ ] User can upload avatar
- [ ] User can upload banner
- [ ] User can follow another user
- [ ] User can unfollow a user

#### Jobs
- [ ] User can view job listings
- [ ] User can filter jobs by visa sponsorship
- [ ] User can save a job
- [ ] User can create a job posting
- [ ] User can edit their job posting
- [ ] User can delete their job posting

#### App Preferences
- [ ] User can enable/disable apps
- [ ] Apps widget updates when preferences change
- [ ] Quick Actions widget updates when preferences change
- [ ] Preferences persist after logout/login

#### Admin
- [ ] Admin can view all users
- [ ] Admin can change user roles
- [ ] Admin can delete users
- [ ] Admin can view platform statistics

### Browser Testing

Test on the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Testing

Test on the following screen sizes:
- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [ ] Desktop (769px - 1024px)
- [ ] Large Desktop (1025px+)

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Every push to `main` branch
- Every pull request
- Scheduled daily runs

### Pre-commit Hooks

Set up pre-commit hooks to run tests before committing:

```bash
npm install --save-dev husky lint-staged

# Add to package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "npm test -- --bail --findRelatedTests"
    ]
  }
}
```

## Debugging Tests

### Frontend
```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching pattern
npm test -- --grep "should render"
```

### Backend
```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest

# Run specific test file
npm test -- auth.test.ts

# Run tests with verbose output
npm test -- --verbose
```

## Best Practices

1. **Write tests first** (TDD approach when possible)
2. **Keep tests simple and focused** - One assertion per test when possible
3. **Use descriptive test names** - Should read like documentation
4. **Mock external dependencies** - Don't make real API calls or database queries
5. **Clean up after tests** - Reset state, clear mocks
6. **Test edge cases** - Empty arrays, null values, errors
7. **Don't test implementation details** - Test behavior, not internals
8. **Keep tests fast** - Slow tests won't be run
9. **Maintain tests** - Update tests when code changes
10. **Review test coverage** - But don't chase 100% coverage

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)


