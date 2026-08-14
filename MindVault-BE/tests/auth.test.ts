import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Auth API Endpoints', () => {
    const testUser = {
        username: 'testuser_' + Date.now(),
        password: 'testpassword123',
        email: `test_${Date.now()}@example.com`
    };

    it('should successfully create a new user on /api/v1/auth/signup', async () => {
        const response = await request(app)
            .post('/api/v1/auth/signup')
            .send(testUser);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.message).toBe('User created successfully');
    });

    it('should prevent duplicate user registration', async () => {
        // Create user first
        await request(app).post('/api/v1/auth/signup').send(testUser);
        
        const response = await request(app)
            .post('/api/v1/auth/signup')
            .send(testUser);
        
        expect(response.status).toBe(411);
        expect(response.body.message).toBe('User already exists');
    });

    it('should successfully authenticate user on /api/v1/auth/signin', async () => {
        // Create user first
        await request(app).post('/api/v1/auth/signup').send(testUser);

        const response = await request(app)
            .post('/api/v1/auth/signin')
            .send({
                username: testUser.username,
                password: testUser.password
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.username).toBe(testUser.username);
    });

    it('should reject signin with incorrect password', async () => {
        // Create user first
        await request(app).post('/api/v1/auth/signup').send(testUser);

        const response = await request(app)
            .post('/api/v1/auth/signin')
            .send({
                username: testUser.username,
                password: 'wrongpassword'
            });
        
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid username or password');
    });

    it('should reject signin with non-existent user', async () => {
        const response = await request(app)
            .post('/api/v1/auth/signin')
            .send({
                username: 'nonexistentuser_' + Date.now(),
                password: 'password123'
            });
        
        expect(response.status).toBe(401);
    });

    it('should fetch current user data on /api/v1/auth/me', async () => {
        // Create user first
        const signupRes = await request(app).post('/api/v1/auth/signup').send(testUser);
        const token = signupRes.body.token;

        const response = await request(app)
            .get('/api/v1/auth/me')
            .set('Authorization', token);
        
        expect(response.status).toBe(200);
        expect(response.body.username).toBe(testUser.username);
        expect(response.body.email).toBe(testUser.email);
    });
});
