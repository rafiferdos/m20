import { Router } from 'express'
import { PostController } from './post.controller.js'

const router = Router()

router.post('/posts', PostController.create)

export const PostRoutes: Router = router
