const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

const PORT = 5001;

const users = [];
const blogs = [];

// Middleware
app.use(cors());
app.use(express.json());


// =========================================
// Test Route
// =========================================

app.get("/", (req, res) => {
    res.json({
        message: "InkFlow backend is running!"
    });
});


// =========================================
// API Health Route
// =========================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "InkFlow API is working!"
    });
});


// =========================================
// Register API
// =========================================

app.post("/api/auth/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            success: false,
            message: "Name, email and password are required."
        });

    }

    if (password.length < 6) {

        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long."
        });

    }

    const existingUser = users.find(
        user => user.email === email
    );

    if (existingUser) {

        return res.status(409).json({
            success: false,
            message: "An account with this email already exists."
        });

    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const newUser = {

        id: users.length + 1,

        name,

        email,

        password: hashedPassword

    };

    users.push(newUser);

    res.status(201).json({

        success: true,

        message: "User registered successfully.",

        user: {

            id: newUser.id,

            name: newUser.name,

            email: newUser.email

        }

    });

});


// =========================================
// Login API
// =========================================

app.post("/api/auth/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({

            success: false,

            message: "Email and password are required."

        });

    }

    const user = users.find(
        user => user.email === email
    );

    if (!user) {

        return res.status(401).json({

            success: false,

            message: "Invalid email or password."

        });

    }

    const passwordMatch =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!passwordMatch) {

        return res.status(401).json({

            success: false,

            message: "Invalid email or password."

        });

    }

    res.json({

        success: true,

        message: "Login successful.",

        user: {

            id: user.id,

            name: user.name,

            email: user.email

        }

    });

});


// =========================================
// Create Blog API
// =========================================

app.post("/api/blogs", (req, res) => {

    const {
        title,
        category,
        readTime,
        excerpt,
        content
    } = req.body;


    // Validate required fields

    if (
        !title ||
        !category ||
        !readTime ||
        !excerpt ||
        !content
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Title, category, reading time, excerpt and content are required."

        });

    }


    // Create blog object

    const newBlog = {

        id: blogs.length + 1,

        title,

        category,

        readTime,

        excerpt,

        content,

        createdAt: new Date().toISOString()

    };


    // Store blog

    blogs.push(newBlog);


    // Send response

    res.status(201).json({

        success: true,

        message: "Blog created successfully.",

        blog: newBlog

    });

});


// =========================================
// Get All Blogs API
// =========================================

app.get("/api/blogs", (req, res) => {

    res.json({

        success: true,

        count: blogs.length,

        blogs

    });

});


// =========================================
// Start Server
// =========================================

app.listen(PORT, () => {

    console.log(
        `InkFlow server running on http://localhost:${PORT}`
    );

});