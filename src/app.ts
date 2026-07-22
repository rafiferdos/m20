import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Application, Request, Response } from 'express'
import express from 'express'
import config from './config/index.js'
import notFound from './middlewares/notFound.js'
import { AuthRoutes } from './modules/auth/auth.route.js'
import { CheckerRoute } from './modules/checker/checker.route.js'
import { CommentRoutes } from './modules/comment/comment.route.js'
import { PostRoutes } from './modules/post/post.route.js'
import { PremiumRoutes } from './modules/premium/premium.route.js'
import { SubscriptionRoute } from './modules/subscription/subscription.route.js'
import { userRoutes } from './modules/user/user.route.js'
import globalErrorHandler from './utils/globalErrorHandler.js'

const app: Application = express()

app.use(
	cors({
		origin: config.app_url,
		credentials: true
	})
)

app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (_req: Request, res: Response) => {
	res.send('Hello World!')
})

// user routes
app.use('/api/user', userRoutes)

// auth routes
app.use('/api/auth', AuthRoutes)

// post routes
app.use('/api/posts', PostRoutes)

// comment routes
app.use('/api/comments', CommentRoutes)

// subscription routes
app.use('/api/subscription', SubscriptionRoute)

// premium routes
app.use('/api/premium', PremiumRoutes)

// checker routes
app.use('/api/checker', CheckerRoute)

// handle 404 errors
app.use(notFound)

// handle errors globally
app.use(globalErrorHandler)

export default app
