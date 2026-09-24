# Lab 2a - Backend với Node.js Microservices

Project hoàn chỉnh theo nội dung Lab 2a:

- Product Service: Express, Prisma, PostgreSQL, CRUD, validation, Swagger, Redis cache và Cloudinary.
- Order Service: Express, Mongoose, MongoDB, tính tổng tiền, pagination và Swagger Bearer Auth.
- Auth Service: đăng ký, đăng nhập, access token 15 phút, refresh token 7 ngày và `/me`.
- API Gateway: proxy các service, rate limit và xác thực JWT cho Order API.
- Docker Compose: PostgreSQL, MongoDB, Redis và toàn bộ application services.
- Postman Collection và PowerShell smoke test.

## 1. Yêu cầu

- Node.js 18 trở lên.
- Docker Desktop 24 trở lên, đang ở trạng thái Running.
- Postman hoặc Thunder Client.

## 2. Chạy toàn bộ hệ thống

Tại thư mục này:

```powershell
Copy-Item .env.example .env
docker compose up -d --build
docker compose ps
```

Migration được chạy tự động khi Product Service và Auth Service khởi động.

Seed dữ liệu Product Service:

```powershell
docker compose exec product-service npx prisma db seed
```

Kiểm tra logs nếu service chưa healthy:

```powershell
docker compose logs -f product-service
docker compose logs -f order-service
docker compose logs -f auth-service
docker compose logs -f api-gateway
```

## 3. URLs

| Thành phần | URL |
|---|---|
| API Gateway | `http://localhost:3000` |
| Product Service | `http://localhost:3001` |
| Product Swagger | `http://localhost:3001/api-docs` |
| Order Service | `http://localhost:3002` |
| Order Swagger | `http://localhost:3002/api-docs` |
| Auth Service | `http://localhost:3003` |
| Auth Swagger | `http://localhost:3003/api-docs` |

Gateway routes:

```text
/api/products/* -> Product Service
/api/orders/*   -> Order Service (cần Bearer access token)
/api/auth/*     -> Auth Service
```

## 4. Chạy test

Unit tests:

```powershell
npm test
```

Sau khi Docker Compose đã healthy, chạy kiểm thử end-to-end:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

Hoặc import file sau vào Postman:

```text
postman/Lab2.postman_collection.json
```

Khi chạy toàn Collection, thứ tự đã được sắp sẵn: Health -> Auth -> Products -> Orders -> Cleanup. Request upload ảnh cần chọn file thủ công và cấu hình Cloudinary.

## 5. Product API

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/products` | Pagination, search, category, price, stock và sorting |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| POST | `/api/products` | Tạo sản phẩm |
| PUT | `/api/products/:id` | Cập nhật sản phẩm |
| DELETE | `/api/products/:id` | Soft delete |
| POST | `/api/products/:id/image` | Upload ảnh lên Cloudinary |

Redis cache các GET Product trong 5 phút và tự xóa cache sau POST, PUT, DELETE hoặc upload ảnh.

## 6. Auth API

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký, bcrypt hash mật khẩu |
| POST | `/api/auth/login` | Trả access token và refresh token |
| POST | `/api/auth/refresh` | Rotate refresh token và cấp token mới |
| GET | `/api/auth/me` | Thông tin người dùng hiện tại |

Mật khẩu mẫu hợp lệ: `Student123`.

## 7. Order API

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/orders` | Tạo đơn; lấy tên, giá và tồn kho từ Product Service |
| GET | `/api/orders/customer/:customerId` | Danh sách đơn theo customer, pagination và status |
| PATCH | `/api/orders/:id/status` | Cập nhật trạng thái đơn |

Khi gọi qua Gateway, `customerId` được lấy từ JWT. Không gửi giá từ client; Order Service lấy snapshot giá từ Product Service.

## 8. Cấu hình Cloudinary

Tạo tài khoản Cloudinary, sau đó điền vào file `.env` ở thư mục gốc:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Recreate Product Service:

```powershell
docker compose up -d --build product-service
```

Nếu chưa cấu hình, các chức năng khác vẫn hoạt động; riêng endpoint upload trả `503`.

## 9. Reset dữ liệu

Dừng nhưng giữ dữ liệu:

```powershell
docker compose down
```

Xóa toàn bộ database local và tạo lại từ đầu:

```powershell
docker compose down -v
docker compose up -d --build
docker compose exec product-service npx prisma db seed
```

Lệnh `down -v` xóa dữ liệu PostgreSQL, MongoDB và Redis local.

## 10. Deploy một service

Phần code đã sẵn sàng bằng Dockerfile. Để đạt tiêu chí deploy của lab, cần tài khoản bên ngoài và connection string thật.

Product Service cần:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<Supabase PostgreSQL connection string>
REDIS_URL=<Redis production URL, có thể bỏ nếu chưa dùng cache>
ALLOWED_ORIGINS=<frontend hoặc gateway domain>
```

Các bước theo lab:

1. Đẩy repository lên GitHub.
2. Tạo project Railway hoặc Render từ repository.
3. Chọn thư mục gốc `product-service`.
4. Thêm các environment variables phía trên.
5. Deploy và chạy `npx prisma migrate deploy`.
6. Bật public domain và kiểm tra `/health`, `/api-docs`.

Không commit `.env`, database password, JWT secret hay Cloudinary secret.

## 11. Checklist chấm điểm

- [x] Product Service và Prisma schema.
- [x] Migration và seed.
- [x] CRUD GET/POST/PUT/DELETE.
- [x] Pagination, filtering và sorting.
- [x] Validation và error handler.
- [x] Swagger cho Product, Order và Auth.
- [x] Order Service với MongoDB.
- [x] Docker Compose toàn hệ thống.
- [x] Auth Service và JWT Gateway.
- [x] Cloudinary upload.
- [x] Redis cache.
- [ ] Deploy public: cần tài khoản và secret của sinh viên.
