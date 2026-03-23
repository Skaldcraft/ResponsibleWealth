import { BasketPageContent } from "@/components/basket-page-content";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sort?: string; order?: string }> }) {
  const { sort, order } = await searchParams;
  return (
    <BasketPageContent 
      sortBy={sort === "name" || sort === "price" ? sort : undefined} 
      order={order === "asc" || order === "desc" ? order : undefined} 
    />
  );
}
