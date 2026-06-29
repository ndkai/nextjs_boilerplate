# Hướng dẫn chạy dự án

Tài liệu này mô tả cách cài đặt, chạy local, build và start theo từng môi trường (UAT / beta / production), cùng các lệnh kiểm tra chất lượng và xử lý sự cố thường gặp.

> Liên quan: kiến trúc tổng thể xem [architecture.md](./architecture.md). Cấu hình môi trường nằm gọn trong thư mục [env/](../env), mẫu xem [env/example.env](../env/example.env).

## 1. Yêu cầu môi trường

| Thành phần | Phiên bản |
| --- | --- |
| Node.js | >= 20.12 (khuyến nghị 22+). Dự án dùng `process.loadEnvFile`, có từ 20.12. |
| Package manager | npm (repo dùng `package-lock.json`) |
| OS | macOS / Linux / Windows |

Kiểm tra:

```bash
node -v
```

## 2. Cài đặt

```bash
npm install
```

Sau khi cài, copy file mẫu để chạy local:

```bash
cp env/example.env .env.local
```

Mở `.env.local`, điền `API_UPSTREAM` trỏ tới backend muốn dùng khi dev (thường là UAT). Để trống `NEXT_PUBLIC_API_BASE_URL` (xem mục 3).

## 3. Mô hình biến môi trường

Ứng dụng chỉ cần **một biến** để phân biệt môi trường: `API_UPSTREAM`.

| Biến | Phạm vi | Vai trò |
| --- | --- | --- |
| `API_UPSTREAM` | Server (runtime) | Backend đích. Mọi request `/api/*` được proxy tới `${API_UPSTREAM}/api/*` qua rewrite trong [next.config.ts](../next.config.ts). Không có trailing slash, không có hậu tố `/api`. |
| `NEXT_PUBLIC_API_BASE_URL` | Client (build-time) | **Để trống.** Khi trống, browser gọi `/api/*` tương đối và đi qua proxy server. Nhờ vậy **một bản build dùng được cho cả 3 môi trường**. Chỉ set khi muốn gọi backend trực tiếp từ browser (giá trị sẽ bị "đóng băng" lúc build). |

Giá trị `API_UPSTREAM` theo môi trường được gom trong thư mục `env/` (committed, không chứa secret):

| Môi trường | File | `API_UPSTREAM` |
| --- | --- | --- |
| UAT | [env/uat.env](../env/uat.env) | `https://sca-api-uat.concung.vn` |
| Beta | [env/beta.env](../env/beta.env) | `https://sca-api-uat.concung.vn` (cùng upstream UAT) |
| Production | [env/production.env](../env/production.env) | `https://sca-api.concung.com` |

> Secret riêng cho từng môi trường (nếu sau này có) đặt vào `env/<env>.local.env` — các file `env/*.local.env` luôn bị gitignore. Khuyến nghị inject secret bằng biến môi trường thật ở CI/deploy.

## 4. Chạy local (development)

Chạy với `.env.local` của bạn:

```bash
npm run dev
```

Hoặc dev với cấu hình của một môi trường cụ thể:

```bash
npm run dev:uat
npm run dev:beta
npm run dev:prod
```

Mặc định mở tại http://localhost:3000.

Khi phát triển local, có thể truyền token qua URL: `http://localhost:3000/?token=TEST`.

## 5. Build & start theo môi trường

Mỗi môi trường có cặp lệnh `build:*` và `start:*`:

```bash
# UAT
npm run build:uat
npm run start:uat

# Beta
npm run build:beta
npm run start:beta

# Production
npm run build:prod
npm run start:prod
```

> Lưu ý: file env đã chuyển vào `env/` nên `npm run build` / `npm run start` (không hậu tố) **không** còn tự nạp upstream nào — luôn dùng lệnh có hậu tố môi trường (`build:prod`, ...) hoặc tự set `API_UPSTREAM` khi chạy.

### Cơ chế nạp env

Các script `*:uat` / `*:beta` / `*:prod` chạy qua [scripts/with-env.mjs](../scripts/with-env.mjs):

1. Nạp file `env/<env>.env` tương ứng vào `process.env` bằng `process.loadEnvFile`.
2. Spawn `next` như một tiến trình con bình thường (kế thừa env).

Vì giá trị được nạp vào `process.env` trước khi Next chạy, nó có ưu tiên cao nhất trong thứ tự nạp env của Next.

> Lưu ý: không dùng `node --env-file=...` trực tiếp với Next 16 (Turbopack), vì Next sao chép `--env-file` vào `NODE_OPTIONS` của worker và Node sẽ báo lỗi `ERR_WORKER_INVALID_EXEC_ARGV`. Đó là lý do dùng wrapper.

## 6. Chạy bản standalone (deploy)

[next.config.ts](../next.config.ts) bật `output: "standalone"`, build ra server tự đóng gói tại `.next/standalone/server.js`. Vì `API_UPSTREAM` đọc lúc server khởi động (không phải `NEXT_PUBLIC_`), bạn có thể **build một lần** rồi inject upstream khi chạy:

```bash
# Build một lần
npm run build

# Chạy cùng artifact với upstream khác nhau theo môi trường
API_UPSTREAM=https://sca-api-uat.concung.vn node .next/standalone/server.js   # UAT/Beta
API_UPSTREAM=https://sca-api.concung.com   node .next/standalone/server.js   # Production
```

Đây là cách khuyến nghị cho container/CI: một image, đổi biến môi trường lúc deploy.

## 7. Kiểm tra chất lượng

```bash
npm run lint                      # ESLint (kèm rule cấm import chéo feature)
./node_modules/.bin/tsc --noEmit  # TypeScript typecheck
npm test                          # Vitest
npm run build                     # Next production build
```

Chi tiết chiến lược test xem [architecture.md](./architecture.md) mục 10.

## 8. Xử lý sự cố

### Lỗi native binding (`Cannot find native binding` / `*.darwin-arm64.node`)

Triệu chứng: `npm test` hoặc `npm run build` báo thiếu module như `@rolldown/binding-darwin-arm64` hoặc `lightningcss.darwin-arm64.node`.

Nguyên nhân: bug đã biết của npm với optional dependencies ([npm/cli#4828](https://github.com/npm/cli/issues/4828)) — cài nhầm binding khác kiến trúc CPU (ví dụ cài x64 trên máy arm64).

Khắc phục:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Request `/api/*` trả 404 hoặc gọi sai backend

- Kiểm tra `API_UPSTREAM` đã được set cho môi trường đang chạy.
- Đảm bảo giá trị **không có** trailing slash và **không có** hậu tố `/api` (next.config.ts đã tự cắt trailing slash để phòng hờ).
- Nếu lỡ set `NEXT_PUBLIC_API_BASE_URL`, browser sẽ bỏ qua proxy — để trống nếu muốn đi qua proxy server.

### Đổi `API_UPSTREAM` nhưng không thấy tác dụng sau khi build

- `API_UPSTREAM` áp dụng lúc server khởi động: khởi động lại `start`/standalone server sau khi đổi.
- `NEXT_PUBLIC_*` bị inline lúc build: phải build lại nếu thay đổi.
