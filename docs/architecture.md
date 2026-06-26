# Kiến trúc dự án

Tài liệu này mô tả cách tổ chức code, luồng dữ liệu, ranh giới trách nhiệm và quy tắc mở rộng cho frontend SCA. Mục tiêu là để người mới đọc nhanh vẫn hiểu được nên đặt code ở đâu, luồng nghiệp vụ đi qua những lớp nào, và khi feature lớn dần thì cần tách logic theo hướng nào.

## 1. Tổng quan

Ứng dụng là frontend cho nghiệp vụ nhập trả hàng SCA, chạy trên Next.js App Router với React 19 và TypeScript strict.

Tài liệu này dùng `app/inputsale` làm ví dụ chính cho cách tổ chức feature:

- `app/inputsale`: tạo phiếu nhập trả.

Kiến trúc hiện tại dùng hướng feature-first:

```text
UI
  -> hook orchestration
    -> use case
      -> repository
        -> API factory
          -> shared apiClient
            -> backend
```

Các nguyên tắc chính:

- Code thuộc feature nào nằm trong `app/<feature>`.
- Code dùng chung toàn app nằm trong `lib/`.
- Không import trực tiếp giữa hai feature.
- API request không được viết trong component UI.
- Business logic phức tạp phải tách khỏi JSX và hook.
- Use case/hook gọi repository thay vì gọi API request layer trực tiếp.

## 2. Tech stack

Source tham chiếu: [package.json](/Users/habuiduc/Downloads/nextjs_boilerplate-main/package.json:1)

| Nhóm | Công nghệ |
| --- | --- |
| Framework | Next.js `16.2.9` App Router |
| UI | React `19.2.4` |
| Language | TypeScript strict |
| Lint | ESLint 9 |
| Test | Vitest + jsdom |

Lưu ý quan trọng: repo này có rule riêng cho Next.js. Trước khi sửa file conventions, layout, route behavior hoặc client/server boundary, phải đọc guide liên quan trong `node_modules/next/dist/docs/`.

## 3. Cấu trúc thư mục

```text
app/
  layout.tsx
  page.tsx

  inputsale/
    page.tsx
    layout.tsx
    inputsale.css
    _components/
    _hooks/
    _lib/
      api.ts
      repository.ts
      types.ts
      cache/
      domain/
      formatters/
      mappers/
      use-cases/
    __tests__/

lib/
  api/
  app/
  auth/
  di/
  format.ts
  utils.ts
```

Ranh giới ownership:

| Khu vực | Trách nhiệm |
| --- | --- |
| `app/<feature>/page.tsx` | Compose màn hình, gọi hook, nối callback vào component |
| `app/<feature>/_components/` | Component render UI, nhận props, phát callback |
| `app/<feature>/_hooks/` | State màn hình, side effects, event handlers, orchestration |
| `app/<feature>/_lib/` | API, repository, types, domain rules, mappers, use cases |
| `app/<feature>/__tests__/` | Unit tests gần feature |
| `lib/` | Infrastructure/shared code dùng nhiều feature |

Rule chống import chéo feature được enforce trong [eslint.config.mjs](/Users/habuiduc/Downloads/nextjs_boilerplate-main/eslint.config.mjs:1).

## 4. Runtime và DI

Root layout là Server Component, chỉ gắn global CSS, metadata và app providers.

Source:

- [app/layout.tsx](/Users/habuiduc/Downloads/nextjs_boilerplate-main/app/layout.tsx:1)
- [lib/app/app-providers.tsx](/Users/habuiduc/Downloads/nextjs_boilerplate-main/lib/app/app-providers.tsx:1)

Runtime provider tree:

```text
RootLayout
  -> AppProviders
    -> TokenProvider
      -> AppRuntimeProvider
        -> AuthGate
          -> Feature pages
```

`AppRuntimeProvider` expose shared runtime:

- `auth`
- `apiClient`

Source:

- [lib/di/app-runtime.tsx](/Users/habuiduc/Downloads/nextjs_boilerplate-main/lib/di/app-runtime.tsx:1)
- [lib/api/create-api-client.ts](/Users/habuiduc/Downloads/nextjs_boilerplate-main/lib/api/create-api-client.ts:1)

Project không dùng class-based IoC container. DI được tổ chức bằng typed context, pure factory function và hook wrapper.

## 5. Auth và API client

Token được quản lý ở [lib/auth/token-provider.tsx](/Users/habuiduc/Downloads/nextjs_boilerplate-main/lib/auth/token-provider.tsx:1).

Nguồn token được thử theo thứ tự:

1. `sessionStorage`
2. `window.__POS_TOKEN__`
3. query param `?token=`
4. `window.postMessage`
5. `chrome.webview.message`

Auth state:

- `loading`
- `authenticated`
- `unauthenticated`
- `expired`

`createApiClient()` chịu trách nhiệm:

- gắn bearer token vào request
- parse JSON/text response
- clear token khi backend trả `401`
- đẩy app về trạng thái expired thông qua auth runtime

Auth-aware flow:

```text
feature repository
  -> feature api
    -> shared apiClient
      -> backend
        -> 401
          -> clearToken()
            -> AuthGate hiển thị expired screen
```

## 6. Feature layer

Mỗi feature nên theo cấu trúc chuẩn:

```text
app/<feature>/
  page.tsx
  layout.tsx
  <feature>.css
  _components/
  _hooks/
  _lib/
  __tests__/
```

### 6.1 `page.tsx`

`page.tsx` là nơi assemble màn hình. File này được phép gọi hook của feature và truyền dữ liệu/callback xuống component.

Không đặt ở đây:

- API request mapping
- validation dài
- tính toán nghiệp vụ phức tạp
- flow nhiều bước như validate, init, create, refresh

Ví dụ:

- [app/inputsale/page.tsx](/Users/habuiduc/Downloads/nextjs_boilerplate-main/app/inputsale/page.tsx:1)

### 6.2 `_components/`

Component chỉ nên render UI theo props.

Được phép:

- hiển thị dữ liệu
- gọi callback được truyền vào
- quản lý UI-only state nhỏ nếu thật sự cục bộ

Không nên:

- tự gọi API
- import repository/use case
- chứa business rule lớn

### 6.3 `_hooks/`

Hook là orchestration layer của màn hình.

Trách nhiệm:

- giữ state của màn hình
- xử lý event handler
- chạy side effect
- gọi repository hoặc use case
- map kết quả nghiệp vụ thành loading/error/info/UI state

Ví dụ:

- [app/inputsale/_hooks/use-return-form.ts](/Users/habuiduc/Downloads/nextjs_boilerplate-main/app/inputsale/_hooks/use-return-form.ts:1)

### 6.4 `_lib/`

`_lib` chứa code kỹ thuật và nghiệp vụ của riêng feature. Với feature lớn, không đặt mọi file ngang hàng ở root `_lib`; gom theo vai trò.

```text
_lib/
  api.ts
  repository.ts
  types.ts
  cache/
  domain/
  formatters/
  mappers/
  use-cases/
```

Quy ước:

| Path | Trách nhiệm |
| --- | --- |
| `api.ts` | Map endpoint, method, request/response contract |
| `repository.ts` | API nói theo ngôn ngữ nghiệp vụ, nằm giữa hook/use case và API layer |
| `types.ts` | DTO, request, response, domain-facing type của feature |
| `domain/` | Pure business rules, calculations, validation |
| `mappers/` | Build payload/map domain state sang backend DTO |
| `cache/` | Cache helper cục bộ của feature |
| `formatters/` | Formatter hoặc feature-local re-export formatter |
| `use-cases/` | Flow nghiệp vụ nhiều bước |

Ví dụ trong `inputsale`:

- [app/inputsale/_lib/api.ts](/Users/habuiduc/Downloads/nextjs_boilerplate-main/app/inputsale/_lib/api.ts:1)
- [app/inputsale/_lib/repository.ts](/Users/habuiduc/Downloads/nextjs_boilerplate-main/app/inputsale/_lib/repository.ts:1)
- [app/inputsale/_lib/domain/return-calculations.ts](/Users/habuiduc/Downloads/nextjs_boilerplate-main/app/inputsale/_lib/domain/return-calculations.ts:1)
- [app/inputsale/_lib/domain/return-validation.ts](/Users/habuiduc/Downloads/nextjs_boilerplate-main/app/inputsale/_lib/domain/return-validation.ts:1)
- [app/inputsale/_lib/mappers/build-create-payload.ts](/Users/habuiduc/Downloads/nextjs_boilerplate-main/app/inputsale/_lib/mappers/build-create-payload.ts:1)
- [app/inputsale/_lib/use-cases/create-return-receipt.ts](/Users/habuiduc/Downloads/nextjs_boilerplate-main/app/inputsale/_lib/use-cases/create-return-receipt.ts:1)

## 7. Data flow

### 7.1 Flow chuẩn

```text
Component
  -> Hook
    -> Use case nếu nghiệp vụ nhiều bước
      -> Repository
        -> API factory
          -> shared apiClient
            -> Backend
```

Nếu nghiệp vụ đơn giản, hook có thể gọi repository trực tiếp. Nếu handler bắt đầu có nhiều bước, tách use case.

### 7.2 Tạo phiếu nhập trả

```text
FooterBar.onCreate
  -> useReturnForm.handleCreate
    -> createReturnReceipt
      -> validateReturnSelection
      -> repository.initReceipt
      -> buildCreateReturnPayload
      -> repository.createReceipt
        -> api.create
          -> POST /api/InputSales/Create
```

Các phần chính:

1. Hook giữ UI state `creating/error/info`.
2. Use case validate selection.
3. Use case gọi repository để init mã phiếu.
4. Mapper build `InputSaleInsertReq`.
5. Use case gọi repository để tạo phiếu.
6. Hook nhận kết quả và cập nhật UI.

## 8. Nơi đặt business logic

| Loại logic | Đặt ở đâu |
| --- | --- |
| State màn hình, loading/error/info, side effects | `_hooks/` |
| Pure calculation | `_lib/domain/*-calculations.ts` |
| Validation/rule nghiệp vụ | `_lib/domain/*-validation.ts` |
| Mapping request/payload | `_lib/mappers/` |
| Flow nhiều bước | `_lib/use-cases/` |
| Truy cập dữ liệu theo ngôn ngữ nghiệp vụ | `_lib/repository.ts` |
| Endpoint/method/body raw API | `_lib/api.ts` |
| Cache cục bộ feature | `_lib/cache/` |
| Formatter cục bộ feature | `_lib/formatters/` |
| Shared helper dùng nhiều feature | `lib/` |

Nguyên tắc tách logic:

1. Component chỉ render.
2. Hook chỉ orchestration UI.
3. Calculation và validation phải là pure function để test dễ.
4. Use case điều phối flow nghiệp vụ nhiều bước.
5. Repository là boundary giữa nghiệp vụ frontend và API request layer.
6. API layer không chứa rule nghiệp vụ; chỉ biết endpoint và contract.

## 9. Quy tắc mở rộng feature

Khi thêm feature mới:

```text
app/<feature>/
  page.tsx
  layout.tsx
  <feature>.css
  _components/
  _hooks/
  _lib/
    api.ts
    repository.ts
    types.ts
  __tests__/
```

Thứ tự implement khuyến nghị:

1. `types.ts`
2. `api.ts`
3. `repository.ts`
4. `domain/` nếu có rule/tính toán
5. `mappers/` nếu cần build payload
6. `use-cases/` nếu flow có nhiều bước
7. `_hooks/`
8. `_components/`
9. `page.tsx`
10. CSS
11. tests

Khi feature A cần ảnh hưởng dữ liệu của feature B:

- Không import hoặc sửa state nội bộ của feature B.
- Ghi thay đổi qua backend/shared source of truth.
- Để feature B tự refetch/refresh theo source of truth.
- Nếu cần type/helper dùng chung, move vào `lib/`.

## 10. Testing và quality gate

Test đặt gần feature trong `__tests__`. Dữ liệu mẫu cho test đặt trong `__tests__/fixtures.ts`; không đặt dữ liệu mẫu runtime trong `_lib`.

Các nhóm test nên có:

- pure domain helper tests
- mapper/payload builder tests
- API factory tests
- repository factory tests
- use case tests
- shared infrastructure tests

Lệnh verify chuẩn:

```bash
npm test
npm run lint
./node_modules/.bin/tsc --noEmit
npm run build
```

Quality bar:

- Test business rules bằng pure function.
- Test payload mapping bằng mapper.
- Test flow nghiệp vụ bằng use case.
- Test endpoint mapping bằng API factory.
- Test repository mapping bằng repository factory.
- Lint pass để giữ boundary.
- TypeScript pass để giữ contract.
- Next production build pass.

## 11. Tóm tắt quyết định kiến trúc

Kiến trúc hiện tại ưu tiên tốc độ phát triển nhưng vẫn giữ ranh giới rõ:

- Feature-first trong `app/<feature>`.
- Shared runtime/auth/http trong `lib/`.
- DI nhẹ bằng context + factory + hook wrapper.
- Repository nằm giữa use case/hook và API layer.
- Business logic phức tạp đi vào `domain/`, `mappers/`, `use-cases/`.
- Component không gọi API và không giữ business flow lớn.
- Không import chéo giữa các feature.

Nếu nghiệp vụ sau này phức tạp hơn nữa, vẫn giữ hướng này và mở rộng bên trong `_lib`: thêm `services/`, chia nhỏ `domain/`, hoặc tách nhiều use case nhỏ theo từng flow. Không đưa logic ngược trở lại component/hook chỉ để xử lý nhanh.
