import { getPrisma } from '@/lib/prisma'

export async function getCategoryFilterIds(categoryId: string): Promise<string[]> {
  const prisma = getPrisma()
  const result = await prisma.$queryRaw<{ id: string }[]>`
    WITH RECURSIVE category_tree AS (
      SELECT id FROM product_categories WHERE id = ${categoryId}
      UNION
      SELECT c.id FROM product_categories c
      INNER JOIN category_tree ct ON c."parentId" = ct.id
    )
    SELECT id FROM category_tree
  `
  return result.map((r) => r.id)
}
