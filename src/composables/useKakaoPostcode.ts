import { nextTick, ref } from 'vue'

const SCRIPT_URL = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

export interface PostcodeResult {
  zipcode: string
  address: string
}

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null // allow retry
      reject(new Error('카카오 우편번호 서비스를 불러오지 못했어요.'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

// Promise resolves when the user selects an address (not on widget mount)
function mountWidget(container: HTMLElement): Promise<PostcodeResult> {
  return new Promise<PostcodeResult>((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (window as any).daum.Postcode({
      oncomplete(data: any) {
        resolve({
          zipcode: data.zonecode as string,
          address: (data.roadAddress || data.jibunAddress) as string,
        })
      },
      width: '100%',
      height: '100%',
    }).embed(container, { autoClose: false })
  })
}

export function useKakaoPostcode() {
  const searching = ref(false)
  const sdkLoading = ref(false)
  const container = ref<HTMLElement | null>(null)

  async function openSearch(onSelect: (result: PostcodeResult) => void): Promise<void> {
    searching.value = true
    sdkLoading.value = true
    await nextTick()
    try {
      if (!container.value) return
      await loadScript()
      sdkLoading.value = false
      const result = await mountWidget(container.value)
      onSelect(result)
    } catch {
      // SDK 로드 실패 시 위젯만 닫힘
    } finally {
      searching.value = false
      sdkLoading.value = false
    }
  }

  return { searching, sdkLoading, container, openSearch }
}
