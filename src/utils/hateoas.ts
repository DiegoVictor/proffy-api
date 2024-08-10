export const hateoas = (
  resource: string,
  { url, id }: Partial<Record<string, string | number>>,
) => {
  if (id) {
    return `${url}/v1/${resource}/${id}`;
  }
  return undefined;
};
