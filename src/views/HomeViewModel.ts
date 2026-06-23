import { ref, type Ref } from 'vue'
import { getFeaturedProducts } from '@/api/catalog'
import type { Product } from '@/data/products'
import { useCategoryStore } from '@/stores/categories'
import { toProduct } from './products/mappers'

export interface HomeViewModel {
  featured: Ref<Product[]>
  loading: Ref<boolean>
  errorMessage: Ref<string>
  load: () => Promise<void>
}

export function useHomeViewModel(): HomeViewModel {
  const categoryStore = useCategoryStore()
  const featured = ref<Product[]>([])
  const loading = ref(false)
  const errorMessage = ref('')

  async function load() {
    if (loading.value) return
    loading.value = true
    errorMessage.value = ''
    try {
      const [items] = await Promise.all([
        getFeaturedProducts(8),
        categoryStore.load(),
      ])
      featured.value = items.map(toProduct)
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : '상품을 불러오지 못했어요.'
    } finally {
      loading.value = false
    }
  }

  return { featured, loading, errorMessage, load }
}
