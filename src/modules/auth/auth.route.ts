import { Router } from 'express'
import { AuthControllers } from './auth.controller.js'

const router = Router()

router.post('/login', AuthControllers.login)
router.get('/me', AuthControllers.getMyProfile)

export const AuthRoutes: Router = router
