import { ref, type Ref } from 'vue'
import {
  getProduct,
  listProducts,
  type BackendCategory,
  type ProductDetailResponse,
  type ProductImageResponse,
} from '@/api/catalog'
import type { Product } from '@/data/products'
import { useCategoryStore } from '@/stores/categories'
import { toDetailProduct, toProduct } from './mappers'

export interface DetailViewModel {
  product: Ref<Product | null>
  description: Ref<string>
  images: Ref<ProductImageResponse[]>
  related: Ref<Product[]>
  loading: Ref<boolean>
  errorMessage: Ref<string>
  notFound: Ref<boolean>
  load: (id: string) => Promise<void>
}

export function useDetailViewModel(): DetailViewModel {
  const categoryStore = useCategoryStore()
  const product = ref<Product | null>(null)
  const description = ref('')
  const images = ref<ProductImageResponse[]>([])
  const related = ref<Product[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  const notFound = ref(false)

  async function load(id: string) {
    const numericId = Number(id)
    if (!Number.isFinite(numericId)) {
      notFound.value = true
      return
    }
    loading.value = true
    errorMessage.value = ''
    notFound.value = false
    try {
      const [detail] = await Promise.all([
        getProduct(numericId),
        categoryStore.load(),
      ])
      applyDetail(detail)
      void loadRelated(detail.category, numericId)
    } catch (err) {
      const e = err as { status?: number; message?: string }
      if (e.status === 404) {
        notFound.value = true
      } else {
        errorMessage.value = e.message ?? '상품을 불러오지 못했어요.'
      }
    } finally {
      loading.value = false
    }
  }

  function applyDetail(detail: ProductDetailResponse) {
    product.value = toDetailProduct(detail)
    description.value = detail.description
    images.value = detail.images
  }

  async function loadRelated(category: BackendCategory, currentId: number) {
    try {
      const res = await listProducts({ category, size: 5 })
      related.value = res.items
        .filter((p) => p.id !== currentId)
        .slice(0, 4)
        .map(toProduct)
    } catch {
      related.value = []
    }
  }

  return { product, description, images, related, loading, errorMessage, notFound, load }
}
