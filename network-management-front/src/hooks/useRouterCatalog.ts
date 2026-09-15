import { useRouterMutations, useRoutersQuery } from "@/hooks/useRouters";

/** Router catalog from API — replaces localStorage store. */
export function useRouterCatalog() {
  const { data: items = [], isLoading, isFetching } = useRoutersQuery();
  const { createMutation, updateMutation, deleteMutation } = useRouterMutations();

  return {
    items,
    isLoading: isLoading || isFetching,
    upsert: async (input: { id?: number; name: string; imageFile?: File }) => {
      const trimmed = input.name.trim();
      if (input.id) {
        return updateMutation.mutateAsync({
          id: input.id,
          name: trimmed,
          imageFile: input.imageFile,
        });
      }
      return createMutation.mutateAsync({
        name: trimmed,
        imageFile: input.imageFile,
      });
    },
    remove: (id: number) => deleteMutation.mutateAsync(id),
  };
}
