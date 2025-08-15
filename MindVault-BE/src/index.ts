import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ContentModel, linkModel, userModel } from './db';
import dotenv from 'dotenv';
import { JWT_PASSWORD } from './conf';

dotenv.config();
import { userMiddleware } from './middleware';
import { random } from './utils';
import authRoutes from "./auth"
import cors from "cors";
import path from "path";
import passport from 'passport';
import session from 'express-session';
import { configurePassport } from './passport';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

// Session setup for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
  
  // Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Auth routes
app.use('/api/v1/auth', authRoutes);

app.post('/api/v1/content', userMiddleware, async (req, res) => {
    const type = req.body.type;
    const link = req.body.link;
    await ContentModel.create({
        link,
        type,
        title:req.body.title,
        //@ts-ignore
        userId: req.userId,
        tags: [],
    })

    res.json({
        message: 'Content created successfully',
    });

});

app.get('/api/v1/content', userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId,
    }).populate("userId", "username")
    res.json({
        content
    });
});

//  "title":"talk about the trump",
//    "link":"google.com/cnw.pdf"

app.delete('/api/v1/content', async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId,
    })

    res.json({
        message: 'Content deleted successfully',
    });
});

app.post('/api/v1/brain/share', userMiddleware, async (req, res) => {
    const share = req.body.share;

    if (share) {
        const existingLink = await linkModel.findOne({
            //@ts-ignore
            userId: req.userId,
        });

        if (existingLink) {
            res.json({
                hash: existingLink.hash,
            })
            return;
        }

        const hash = random(10);
        await linkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash,
        })
        res.json({
            hash,
        })
    } else {
        await linkModel.deleteOne({
            //@ts-ignore
            userId: req.userId,
        });

        res.json({
            message: "Removed Link",
        });
    }

});

app.get('/api/v1/brain/:shareLink', async (req, res) => {
    const hash = req.params.shareLink;
    const link = await linkModel.findOne({
        hash,
    })

    if (!link) {
        res.status(404).json({
            message: 'Link not found',
        });
        return;
    }

    const content = await ContentModel.find({
        userId: link.userId,
    })

    const user = await userModel.findOne({
        _id: link.userId
    });

    if (!user) {
        res.status(404).json    ({
            message: 'User not found',
        });
        return;
    }
    res.json({
        username: user.username,
        content: content,
    })
});

app.delete('/api/v1/content/:id', userMiddleware, async (req, res) => {
  const contentId = req.params.id;
  try {
    await ContentModel.deleteOne({
      _id: contentId,
      // @ts-ignore
      userId: req.userId
    });
    res.json({ message: 'Content deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete content' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.get('/ping', (req, res) => {
  res.send({ status: 'ok' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');

});
