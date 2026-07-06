import { Router } from "express";

const router: Router = Router()

router.post('/posts', PostController.create)

export default router