import { Router } from 'express'
import { auth } from '@/middlewares/auth.js'
import { CheckerController } from './checker.controller.js'

const router = Router()

router.post('/check-role', auth(), CheckerController.checkRole)

export const CheckerRoute: Router = router