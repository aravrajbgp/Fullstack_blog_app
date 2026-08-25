require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();

const PORT = 5001;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing from .env");
    process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

let usersCollection;
let blogsCollection;

// Middleware
app.use(cors());
app.use(express.json());


// ================================
// Health Route
// ================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "InkFlow backend is running!"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "InkFlow API is working!"
    });
});


// ================================
// Register
// ================================

app.post("/api/auth/register", async (req, res) => {

    try {

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

        const existingUser = await usersCollection.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const newUser = {
            name: name,
            email: email.toLowerCase(),
            password: hashedPassword,
            createdAt: new Date()
        };

        const result =
            await usersCollection.insertOne(newUser);

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                id: result.insertedId,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {

        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during registration."
        });

    }

});


// ================================
// Login
// ================================

app.post("/api/auth/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user =
            await usersCollection.findOne({
                email: email.toLowerCase()
            });

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
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login."
        });

    }

});


// ================================
// Create Blog
// ================================

app.post("/api/blogs", async (req, res) => {

    try {

        const {
            title,
            category,
            readTime,
            excerpt,
            content
        } = req.body;

        if (
            !title ||
            !category ||
            !readTime ||
            !excerpt ||
            !content
        ) {

            return res.status(400).json({
                success: false,
                message: "All blog fields are required."
            });

        }

        const newBlog = {
            title: title,
            category: category,
            readTime: Number(readTime),
            excerpt: excerpt,
            content: content,
            createdAt: new Date()
        };

        const result =
            await blogsCollection.insertOne(newBlog);

        res.status(201).json({
            success: true,
            message: "Blog created successfully.",
            blog: {
                id: result.insertedId,
                ...newBlog
            }
        });

    } catch (error) {

        console.error("Create blog error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating blog."
        });

    }

});


// ================================
// Get All Blogs
// ================================

app.get("/api/blogs", async (req, res) => {

    try {

        const blogs =
            await blogsCollection
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

        res.json({
            success: true,
            count: blogs.length,
            blogs: blogs
        });

    } catch (error) {

        console.error("Get blogs error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while retrieving blogs."
        });

    }

});


// ================================
// Get Single Blog
// ================================

app.get("/api/blogs/:id", async (req, res) => {

    try {

        const blog =
            await blogsCollection.findOne({
                _id: new ObjectId(req.params.id)
            });

        if (!blog) {

            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });

        }

        res.json({
            success: true,
            blog: blog
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: "Invalid blog ID."
        });

    }

});


// ================================
// Connect MongoDB + Start Server
// ================================

async function startServer() {

    try {

        await client.connect();

        const database =
            client.db("inkflow");

        usersCollection =
            database.collection("users");

        blogsCollection =
            database.collection("blogs");

        console.log("MongoDB connected successfully.");

        app.listen(PORT, () => {

            console.log(
                `InkFlow server running on http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);

    }

}

startServer();