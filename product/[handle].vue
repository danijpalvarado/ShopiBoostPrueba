<script setup>
definePageMeta({
    layout: "main-layout",
});
import { getProduct, getProduct2, getProductQuery2} from '~/graphql/queries/product';
import { isCombinationByProduct, createUrl, getPossibleParameters } from '@/lib/helpers/product/variants'
function setDefaultCombination() {
    if (isCombination) {
        return getVariant(product, combinations);
    } else {
        return combinations[0];
    }
}
function getVariant(product, combinations, clientParameters = false) {
    var possibleParameters = getPossibleParameters(product);
    if (!possibleParameters) {
        return false;
    }
    if (clientParameters) {
        var actualParameters = clientParameters;
    } else {
        var actualParameters = route.query;
    }

    var selectedProductParameters = {};
    for (var key in actualParameters) {
        if (possibleParameters.includes(key)) {
            selectedProductParameters[key] = actualParameters[key];
        }
    }
    if (Object.keys(selectedProductParameters).length > 0) {
        var selectedCombination = combinations.find(comb => {
            for (const key in selectedProductParameters) {
                if (!(key in comb) || comb[key] !== selectedProductParameters[key]) {
                    return false;
                }
            }
            return true;
        });
        if (selectedCombination) {
            return selectedCombination;
        }
    }

    var firstCombinationOnSale = combinations.find(comb => {
        if (!comb.availableForSale) {
            return false;
        }
        return true;
    });

    if (firstCombinationOnSale) {
        selectCombination(firstCombinationOnSale, possibleParameters)
        return firstCombinationOnSale;
    } else {
        selectCombination(combinations[0], possibleParameters)
        return combinations[0];
    }

}
function selectCombination(selectedProductVariant, possibleOptions) {
    const route = useRoute();
    const optionSearchParams = new URLSearchParams(route.query);
    Object.keys(selectedProductVariant).forEach(propiedad => {
        if (possibleOptions.includes(propiedad)) {
            optionSearchParams.set(propiedad, selectedProductVariant[propiedad]);
        }
    });
    var url = createUrl(route.path, optionSearchParams);
    if (url != route.fullPath) {
        navigateTo(url);
    }
}

const route = useRoute();
const handle = route.params.handle;
var cartStore = useCartStore();
var product = await getProduct(handle);

const { result, loading } = useQuery(getProductQuery2, {handle : handle});
var product2 = computed(() => result.value?.product ?? [])
// const product2 : any = useResult(result, null, (data) => data.product)

console.log(product);
if (!product) {
    navigateTo('/404');
} else {
    useSeoMeta({
        title: product?.seo?.title ? product?.seo.title : product.title,
        ogTitle: product?.seo?.title ? product?.seo.title : product.title,
        description: product.seo.description ? product.seo.description : product.description,
        ogDescription: product.seo.description ? product?.seo?.description : product.description
    });
}
var isCombination = isCombinationByProduct(product);
var combinations = product.variants.map((variant) => ({
    id: variant.id,
    title: variant.title,
    price: variant.price,
    image: variant.image,
    availableForSale: variant.availableForSale,
    ...variant.selectedOptions.reduce((accumulator, option) => ({ ...accumulator, [option.name.toLowerCase()]: option.value }), {})
}));

var selectedProductVariant = ref(false);


onMounted(() => {
    selectedProductVariant.value = setDefaultCombination();
    
})
onUpdated(() => {
    console.log('onUpdated')
    selectedProductVariant.value = setDefaultCombination();
    console.log(selectedProductVariant);
    
});


</script>

<template>
   <!-- <p v-if="loading">Loading...</p> -->
   <!-- <div v-if="product">Loading...</div> -->
    <div class="container flex flex-col w-full">
        <div class="flex md:flex-row flex-col gap-5 md:gap-0">
            <div class="flex flex-col w-full md:w-5/12 md:pr-2">
                <ProductPageGallery :firstImage="selectedProductVariant?.image" :images="product.images">
                </ProductPageGallery>
            </div>
            <div class="flex flex-col w-full md:w-7/12 md:pl-2 gap-5 h-fit sticky top-5">
                <div class="flex flex-col">
                    <h1 class="text-2xl font-semibold">{{ product.title }}</h1>
                    <div class="flex gap-1 mt-5 items-baseline">
                        <span class="text-3xl font-semibold ">{{ selectedProductVariant?.price?.amount }}€</span>
                        <span v-if="selectedProductVariant?.compareAtPrice" class="line-through">{{
                            selectedProductVariant?.compareAtPrice?.amount }}€</span>
                    </div>
                    <span class="text-muted-foreground mt-2">{{ product.description }}</span>
                </div>
                <ProductPageVariants v-if="isCombination" :productOptions="product.options"
                    :selectedProductVariant="selectedProductVariant" :combinations="combinations" />
                <div
                    class="flex flex-col items-center md:items-start fixed w-full md:relative bottom-0 left-0 container md:p-0 z-10 py-2 md:py-0">
                    <UiButton @click="cartStore.cartLinesAdd(selectedProductVariant.id)"
                        :disabled="!selectedProductVariant?.availableForSale || !product.availableForSale"
                        class="w-[500px] max-w-full">Añadir al carro
                    </UiButton>
                </div>
            </div>
        </div>
    </div>

    <br>
    <br>
    <br>

    <p v-if="loading">Loading...</p>
   <div v-else-if="product2"  class="container flex flex-col w-full">
        <div class="flex md:flex-row flex-col gap-5 md:gap-0">
            <div class="flex flex-col w-full md:w-5/12 md:pr-2">
                <ProductPageGallery :firstImage="product2?.image" :images="product2.images">
                </ProductPageGallery>
            </div>
            <div class="flex flex-col w-full md:w-7/12 md:pl-2 gap-5 h-fit sticky top-5">
                <div class="flex flex-col">
                    <h1 class="text-2xl font-semibold">{{ product2.title }}</h1>
                    <!-- <div class="flex gap-1 mt-5 items-baseline">
                        <span class="text-3xl font-semibold ">{{ selectedProductVariant?.price?.amount }}€</span>
                        <span v-if="selectedProductVariant?.compareAtPrice" class="line-through">{{
                            selectedProductVariant?.compareAtPrice?.amount }}€</span>
                    </div> -->
                    <span class="text-muted-foreground mt-2">{{ product2.description }}</span>
                </div>
                <!-- <ProductPageVariants v-if="isCombination" :productOptions="product2.options"
                    :selectedProductVariant="selectedProductVariant" :combinations="combinations" /> -->
                <!-- <div
                    class="flex flex-col items-center md:items-start fixed w-full md:relative bottom-0 left-0 container md:p-0 z-10 py-2 md:py-0">
                    <UiButton @click="cartStore.cartLinesAdd(selectedProductVariant.id)"
                        :disabled="!selectedProductVariant?.availableForSale || !product2.availableForSale"
                        class="w-[500px] max-w-full">Añadir al carro
                    </UiButton>
                </div> -->
            </div>
        </div>
    </div>
</template>
<style>
.snap-x {
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
}

.snap-start {
    scroll-snap-align: start;
}
</style>
