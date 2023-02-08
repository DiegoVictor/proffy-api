interface PageLinks {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
}
export default (
  page: number,
  pagesTotal: number,
  resourceUrl: string,
): PageLinks => {
  const url = `${resourceUrl}?page=`;
  const links: PageLinks = {};

  if (page < pagesTotal) {
    links.last = url + pagesTotal;
    links.next = url + (page + 1);
  }

  if (page > 1) {
    links.first = `${url}1`;
    links.prev = url + (page - 1);
  }

  return links;
};
