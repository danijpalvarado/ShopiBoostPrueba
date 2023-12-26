import { removeEdgesAndNodes, sorting, HIDDEN_PRODUCT_TAG } from "../utils";
import { productPageFragment } from "../fragments/product/page";


export const getProductQuery = gql`
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${productPageFragment}
`;

export const getProductQuery2 = gql`
  query getProduct1($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${productPageFragment}
`;

const reshapeProduct = (product, filterHiddenProducts = true) => {
  if (!product || (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants)
  };
};

const reshapeImages = (images, productTitle) => {
  const flattened = removeEdgesAndNodes(images);
  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`
    };
  });
};

export async function getProduct(handle) {
  const { data } = await useAsyncQuery(getProductQuery, { handle: handle })
  return reshapeProduct(data.value.product);
}

//Ejemplo Tarea Hernan

// export async function getProduct1(handle) {
//     const { data } = await useAsyncQuery(getProductQuery2, { handle: handle })
//     return reshapeProduct(data.value.product);
// }

export function getProduct2(handle) {
  const { result, loading, error } = useQuery(getProductQuery2, { handle: handle })
  return reshapeProduct(result.value.product);
}

