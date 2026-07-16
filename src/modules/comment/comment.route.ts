import { Role } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { CommentController } from './comment.controller.js'
const router = Router()

router.get('/author/:authorId', CommentController.getAllByAuthorId)
router.post('/', auth(Role.USER, Role.ADMIN), CommentController.create)
router.get('/post/:postId', CommentController.getAllByPostId)
router.patch(
	'/:commentId',
	auth(Role.USER, Role.ADMIN),
	CommentController.update
)
router.delete(
	'/:commentId',
	auth(Role.USER, Role.ADMIN),
	CommentController.delete
)
router.patch(
	'/:commentId/moderate',
	auth(Role.ADMIN),
	CommentController.moderate
)

export const CommentRoutes: Router = router
