import { Router } from 'express'
import { CommentController } from './comment.controller.js'
const router = Router()

router.get('/author/:authorId', CommentController.getAllByAuthorId)

export const CommentRoutes: Router = router
