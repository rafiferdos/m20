import type { Application, Request, Response } from 'express'
import express from 'express'

const app: Application = express()

app.get('/', (_req: Request, res: Response) => {
	res.send('Hello World!')
})

export default app
