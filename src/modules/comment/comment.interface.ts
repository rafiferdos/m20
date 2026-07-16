import type { CommentStatus } from '@/generated/prisma/enums.js'

export interface IComment {
	content: string
	authorId: string
	postId: string
	status?: CommentStatus
}

export interface ICommentCreate extends Omit<IComment, 'status'> {}
export interface ICommentUpdate extends Partial<IComment> {}

export interface ICommentStatusUpdate {
	status: CommentStatus
}
