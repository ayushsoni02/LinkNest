import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ContentModel, linkModel, userModel } from './db';

import { JWT_PASSWORD } from './conf';
import { userMiddleware } from './middleware';
import { random } from './utils';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/v1/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        await userModel.create({
            username: username,
            password: password,
        })
        res.json({
            message: 'User created successfully',
        })
    } catch (e) {
        res.status(411).json({
            message: 'User already exists',
        })
    }
});


app.post('/api/v1/signin', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await userModel.findOne({
        username,
        password
    });
    if (existingUser) {
        const token = jwt.sign({
            id: existingUser._id,
        }, JWT_PASSWORD);
        res.json({
            token,
        });
    } else {
        res.status(401).json({
            message: 'Invalid username or password',
        });
    }
});


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
        res.status(404).json({
            message: 'User not found',
        });
        return;
    }
    res.json({
        username: user.username,
        content: content,
    })
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');

});
