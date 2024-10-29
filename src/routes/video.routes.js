import { Router } from "express";

const router = Router();

import {publishAVideo} from "../controllers/video.controller.js"

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.route("/").post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );