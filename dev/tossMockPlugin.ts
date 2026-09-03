import type { Connect, Plugin, ProxyOptions } from 'vite'

/**
 * 로컬 결제 테스트용 Vite 개발 플러그인.
 *
 * 백엔드에 토스 결제 엔드포인트(`/payments/init`, `/payments/confirm`)가 아직 없거나
 * 백엔드를 안 띄우고 프론트만 검증하고 싶을 때 사용합니다.
 *
 * - `TOSS_TEST_SECRET_KEY`(VITE_ 접두어 없음 → 브라우저 번들에 안 들어감)가 있을 때만 활성화
 * - `/api/v1/payments/init`  → 백엔드에서 주문 금액만 조회해 응답 형태로 돌려줌
 * - `/api/v1/payments/confirm` → 토스 `/v1/payments/confirm` 을 **서버(Node)에서** 시크릿 키로 호출
 * - 그 외 `/api/v1/*` 요청은 `server.proxy` 가 실제 백엔드로 전달 (vite.config 에서 설정)
 *
 * 실서비스에서는 절대 쓰지 않습니다. 프로덕션 빌드에는 포함되지 않습니다(dev 전용 훅).
 */

interface Options {
  /** test_gsk_* — 토스 테스트 시크릿 키 */
  secretKey: string
  /** 실제 백엔드 base URL (주문 금액 조회용) */
  backendBaseUrl: string
  /** 조회 실패 시 사용할 대체 금액 */
  fallbackAmount?: number
}

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm'

/** 토스 issuerCode → 카드사명 (자주 쓰는 것만) */
const ISSUER: Record<string, string> = {
  '11': 'KB국민카드', '61': '현대카드', '31': 'BC카드', '51': '삼성카드',
  '41': '신한카드', '71': '롯데카드', '21': '하나카드', '33': '우리카드',
  W1: '우리카드', '91': 'NH농협카드', '34': '광주은행', '35': '전북은행',
  '42': '제주은행', '15': '우체국', '3A': '케이뱅크', '24': '토스뱅크',
  '36': '씨티카드', '38': '새마을금고', '3K': '기업BC', '46': '광주카드',
}

export function tossMockPlugin(opts: Options): Plugin {
  const { secretKey, backendBaseUrl, fallbackAmount = 1000 } = opts
  const auth = 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64')

  return {
    name: 'toss-mock-payments',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        if (req.method !== 'POST' || !url.startsWith('/api/v1/payments/')) return next()

        const isInit = url.endsWith('/payments/init')
        const isConfirm = url.endsWith('/payments/confirm')
        if (!isInit && !isConfirm) return next()

        try {
          const body = await readJson(req)

          if (isInit) {
            const amount = await lookupOrderAmount(
              backendBaseUrl,
              String(body.order_number),
              req.headers.authorization,
              fallbackAmount,
            )
            return json(res, 201, {
              payment_id: Date.now(),
              order_number: body.order_number,
              amount,
              customer_name: '테스트 결제',
            })
          }

          // confirm — 시크릿 키로 토스에 승인 요청 (서버 사이드)
          const tossRes = await fetch(TOSS_CONFIRM_URL, {
            method: 'POST',
            headers: { Authorization: auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentKey: body.payment_key,
              orderId: body.order_id,
              amount: body.amount,
            }),
          })
          const data = (await tossRes.json()) as TossPayment & { code?: string; message?: string }

          if (!tossRes.ok) {
            const status = tossRes.status >= 500 ? 502 : 422
            return json(res, status, {
              code: data.code ?? (status === 502 ? 'PAYMENT_GATEWAY_UNKNOWN' : 'PAYMENT_FAILED'),
              message: data.message ?? '결제 승인에 실패했어요.',
            })
          }

          return json(res, 200, mapConfirm(data))
        } catch (err) {
          console.error('[toss-mock]', err)
          return json(res, 502, {
            code: 'PAYMENT_GATEWAY_UNKNOWN',
            message: '결제 결과 확인 중 오류가 발생했어요. (mock)',
          })
        }
      })
    },
  }
}

/** vite.config 에서 함께 쓸 프록시 설정 — payments 외 모든 /api/v1/* 를 실제 백엔드로 */
export function backendProxy(target: string): Record<string, ProxyOptions> {
  return { '/api/v1': { target, changeOrigin: true } }
}

async function lookupOrderAmount(
  baseUrl: string,
  orderNumber: string,
  authHeader: string | undefined,
  fallback: number,
): Promise<number> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/orders/${orderNumber}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    })
    if (!res.ok) return fallback
    const order = (await res.json()) as { total_amount?: number }
    return typeof order.total_amount === 'number' ? order.total_amount : fallback
  } catch {
    return fallback
  }
}

function mapConfirm(p: TossPayment) {
  const card = p.card ?? {}
  const digits = (card.number ?? '').replace(/\D/g, '')
  return {
    order_number: p.orderId,
    status: p.status === 'DONE' ? 'PAID' : p.status,
    paid_at: p.approvedAt ?? null,
    card_company: card.issuerCode ? (ISSUER[card.issuerCode] ?? '카드') : (p.easyPay?.provider ?? null),
    card_last4: digits.slice(-4) || null,
    installment_months: card.installmentPlanMonths ?? 0,
  }
}

interface TossPayment {
  orderId: string
  status: string
  approvedAt?: string | null
  card?: { number?: string; issuerCode?: string; installmentPlanMonths?: number }
  easyPay?: { provider?: string } | null
}

function readJson(req: Connect.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function json(res: import('http').ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}
