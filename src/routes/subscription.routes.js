import { Router } from 'express';


import {
    getUserChannelSubscribers,
    getSubscribedChannels,
    toggleSubscription

} 
from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); 

router
    .route("/channel/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);
router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router