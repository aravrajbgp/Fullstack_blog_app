require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();

const PORT = process.env.PORT || 5001;

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing from .env");
    process.exit(1);
}

if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing from .env");
    process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

let usersCollection;
let blogsCollection;


// ================================
// Middleware
// ================================

app.use(cors());
app.use(express.json());


// ================================
// JWT Authentication Middleware
// ================================

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token is required."
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(403).json({
            success: false,
            message: "Invalid or expired token."
        });

    }
}


// ================================
// Health Routes
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

        const {
            name,
            email,
            password
        } = req.body;


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


        const normalizedEmail =
            email.toLowerCase().trim();


        const existingUser =
            await usersCollection.findOne({
                email: normalizedEmail
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

            name: name.trim(),

            email: normalizedEmail,

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

        console.error(
            "Register error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error during registration."

        });

    }

});


// ================================
// Login
// ================================

app.post("/api/auth/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        const user =
            await usersCollection.findOne({

                email: normalizedEmail

            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

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

                message:
                    "Invalid email or password."

            });

        }


        // Create JWT token

        const token = jwt.sign(

            {
                id: user._id.toString(),

                name: user.name,

                email: user.email

            },

            JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        res.json({

            success: true,

            message:
                "Login successful.",

            token: token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error during login."

        });

    }

});


// ================================
// Get Current User
// Protected Route
// ================================

app.get(
    "/api/auth/me",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await usersCollection.findOne(
                    {
                        _id: new ObjectId(req.user.id)
                    },
                    {
                        projection: {
                            password: 0
                        }
                    }
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            res.json({

                success: true,

                user: user

            });

        } catch (error) {

            console.error(
                "Get current user error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error while retrieving user."

            });

        }

    }
);


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

                message:
                    "All blog fields are required."

            });

        }


        const newBlog = {

            title: title.trim(),

            category: category.trim(),

            readTime: Number(readTime),

            excerpt: excerpt.trim(),

            content: content.trim(),

            createdAt: new Date()

        };


        const result =
            await blogsCollection.insertOne(newBlog);


        res.status(201).json({

            success: true,

            message:
                "Blog created successfully.",

            blog: {

                id: result.insertedId,

                ...newBlog

            }

        });

    } catch (error) {

        console.error(
            "Create blog error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error while creating blog."

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
                .sort({
                    createdAt: -1
                })
                .toArray();


        res.json({

            success: true,

            count: blogs.length,

            blogs: blogs

        });

    } catch (error) {

        console.error(
            "Get blogs error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error while retrieving blogs."

        });

    }

});


// ================================
// Get Single Blog
// ================================

app.get("/api/blogs/:id", async (req, res) => {

    try {

        if (!ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid blog ID."

            });

        }


        const blog =
            await blogsCollection.findOne({

                _id: new ObjectId(
                    req.params.id
                )

            });


        if (!blog) {

            return res.status(404).json({

                success: false,

                message:
                    "Blog not found."

            });

        }


        res.json({

            success: true,

            blog: blog

        });

    } catch (error) {

        console.error(
            "Get single blog error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error while retrieving blog."

        });

    }

});


// ================================
// Update Blog
// ================================

app.put("/api/blogs/:id", async (req, res) => {

    try {

        if (!ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid blog ID."

            });

        }


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

                message:
                    "All blog fields are required."

            });

        }


        const updatedBlog = {

            title: title.trim(),

            category: category.trim(),

            readTime: Number(readTime),

            excerpt: excerpt.trim(),

            content: content.trim(),

            updatedAt: new Date()

        };


        const result =
            await blogsCollection.updateOne(

                {
                    _id: new ObjectId(
                        req.params.id
                    )
                },

                {
                    $set: updatedBlog
                }

            );


        if (result.matchedCount === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Blog not found."

            });

        }


        const blog =
            await blogsCollection.findOne({

                _id: new ObjectId(
                    req.params.id
                )

            });


        res.json({

            success: true,

            message:
                "Blog updated successfully.",

            blog: blog

        });

    } catch (error) {

        console.error(
            "Update blog error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error while updating blog."

        });

    }

});


// ================================
// Delete Blog
// ================================

app.delete("/api/blogs/:id", async (req, res) => {

    try {

        if (!ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid blog ID."

            });

        }


        const result =
            await blogsCollection.deleteOne({

                _id: new ObjectId(
                    req.params.id
                )

            });


        if (result.deletedCount === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Blog not found."

            });

        }


        res.json({

            success: true,

            message:
                "Blog deleted successfully."

        });

    } catch (error) {

        console.error(
            "Delete blog error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Server error while deleting blog."

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


        console.log(
            "MongoDB connected successfully."
        );


        app.listen(
            PORT,
            () => {

                console.log(
                    `InkFlow server running on http://localhost:${PORT}`
                );

            }
        );

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);

    }

}


startServer();