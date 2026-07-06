import { Router } from 'express'
import { PostController } from './post.controller.js'

const router: Router = Router()

router.post('/posts', PostController.create)

export default router
