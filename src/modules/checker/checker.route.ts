import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { CheckerController } from './checker.controller.js'

const router = Router()

router.get('/check-role', auth(), CheckerController.checkRole)

export const CheckerRoute: Router = router
