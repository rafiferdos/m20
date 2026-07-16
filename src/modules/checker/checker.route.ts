import { Router } from 'express'
import { CheckerController } from './checker.controller.js'

const router = Router()

router.get('/check-role', CheckerController.checkRole)

export const CheckerRoute: Router = router
