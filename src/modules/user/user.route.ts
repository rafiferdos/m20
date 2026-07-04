import { Role } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { UserController } from './user.controller.js'

const router = Router()

router.post('/register', UserController.register)
router.get('/me', auth(Role.AUTHOR, Role.USER), UserController.getMyProfile)

export const userRoutes: Router = router
