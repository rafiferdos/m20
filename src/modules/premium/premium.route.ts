import { Router } from 'express'
import { PremiumController } from './premium.controller.js'

const router = Router()

router.get('/', PremiumController.premium)

export const PremiumRoutes: Router = router
