const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/diary').then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Schemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: String,
    quote: String,
    writingTime: String,
    goal: String,
    createdAt: { type: Date, default: Date.now }
});

const entrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    dateFormatted: String, // Keep this for frontend display consistency
    mood: String
});

const User = mongoose.model('User', userSchema);
const Entry = mongoose.model('Entry', entrySchema);

// Routes - Authentication
app.post('/api/signup', async (req, res) => {
    try {
        console.log('Signup request body:', req.body);
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: { _id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Simple password check (plaintext as per current implementation, can upgrade to bcrypt later)
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                quote: user.quote,
                writingTime: user.writingTime,
                goal: user.goal
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

app.put('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = await User.findByIdAndUpdate(id, updates, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error updating user' });
    }
});


// Routes - Diary Entries
app.post('/api/entries', async (req, res) => {
    try {
        const { userId, content, date, dateFormatted, mood } = req.body;

        if (!userId || !content) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newEntry = new Entry({
            userId,
            content,
            date: date || new Date(),
            dateFormatted,
            mood
        });

        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        console.error('Create entry error:', error);
        res.status(500).json({ message: 'Server error creating entry' });
    }
});

app.get('/api/entries', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'userId query parameter is required' });
        }

        const entries = await Entry.find({ userId }).sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        console.error('Get entries error:', error);
        res.status(500).json({ message: 'Server error fetching entries' });
    }
});

app.put('/api/entries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, dateFormatted } = req.body;

        const entry = await Entry.findByIdAndUpdate(
            id,
            { content, dateFormatted },
            { new: true }
        );

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.json(entry);
    } catch (error) {
        console.error('Update entry error:', error);
        res.status(500).json({ message: 'Server error updating entry' });
    }
});

app.delete('/api/entries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Entry.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        console.error('Delete entry error:', error);
        res.status(500).json({ message: 'Server error deleting entry' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
