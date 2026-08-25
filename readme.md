# Day 5 - Backend Development

## Overview

Day 5 focused on building the backend foundation for the InkFlow full-stack blog application using Node.js and Express.js.

## Technologies Used

- Node.js
- Express.js
- JavaScript
- CORS
- bcryptjs
- REST APIs

## Backend Features

### Server

Created an Express.js server running on port 5001.

### API Health Check

Created:

`GET /api/health`

Used to verify that the backend API is running.

### User Registration

Created:

`POST /api/auth/register`

Features:

- Name validation
- Email validation
- Password validation
- Duplicate email detection
- Password hashing using bcrypt

### User Login

Created:

`POST /api/auth/login`

Features:

- Email validation
- Password validation
- User lookup
- Password verification using bcrypt

### Blog Creation

Created:

`POST /api/blogs`

Features:

- Blog title
- Category
- Reading time
- Excerpt
- Content
- Input validation

### Retrieve Blogs

Created:

`GET /api/blogs`

Used to retrieve the blogs currently stored by the backend.

## Frontend Integration

Connected the frontend pages to the Express backend using JavaScript `fetch()`.

Connected:

- Registration page
- Login page
- Dashboard
- Create Blog page

## What I Learned

- How Node.js runs JavaScript on the server
- How Express.js creates backend servers
- How REST APIs work
- HTTP GET and POST requests
- JSON request and response data
- Request body handling
- HTTP status codes
- Password hashing with bcrypt
- Frontend-to-backend communication
- Basic API validation
- Debugging a port conflict

## Current Storage

Users and blogs are currently stored temporarily in JavaScript arrays.

This means the data is lost when the backend server restarts.

Persistent database storage will be implemented in a later stage.

## Day 5 Status

Completed successfully.