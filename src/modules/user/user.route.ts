import { Router } from 'express'
import { UserController } from './user.controller.js'

const router = Router()

router.post('/register', UserController.register)
router.get('/me', UserController.getMyProfile)

export const userRoutes: Router = router
