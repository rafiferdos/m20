import { prisma } from "@/lib/prisma.js"
import { AppError } from "@/utils/appError.js"
import status from "http-status"

const checkRoleFromDB = async (userId: string, role: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    select: {
      role: true
    }
  })

  if (user.role !== role) {
    throw new AppError(status.FORBIDDEN, 'Insufficient permissions')
  }
}