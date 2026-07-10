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
router.get(
	'/my-posts',
	auth(Role.USER, Role.ADMIN, Role.AUTHOR),
	PostController.myPosts
)
router.get('/get-post-stats', auth(Role.ADMIN), PostController.Stats)
router.get('/:postId', PostController.getOne)
router.patch(
	'/:postId',
	auth(Role.ADMIN, Role.AUTHOR, Role.USER),
	PostController.update
)
router.delete(
	'/:postId',
	auth(Role.ADMIN, Role.AUTHOR, Role.USER),
	PostController.delete
)

export const PostRoutes: Router = router
