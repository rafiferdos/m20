import type { CommentStatus } from '@/generated/prisma/enums.js'

export interface IComment {
	content: string
	authorId: string
	postId: string
	status?: CommentStatus
}

export interface ICommentCreate extends Omit<IComment, 'authorId' | 'status'> { }
