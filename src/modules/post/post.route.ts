import { Role } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { PostController } from './post.controller.js'

const router = Router()

router.post(
	'/',
	auth(Role.ADMIN, Role.AUTHOR, Role.USER),
	PostController.create
)
router.get('/', PostController.getAll)
router.get('/:postId', PostController.getOne)

export const PostRoutes: Router = router
