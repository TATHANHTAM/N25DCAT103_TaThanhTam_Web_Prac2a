$ErrorActionPreference = "Stop"

$gateway = "http://localhost:3000"
$email = "lab-$([guid]::NewGuid().ToString('N').Substring(0, 8))@example.com"
$password = "Student123"

Write-Host "1/17 Kiểm tra health của 4 service"
foreach ($uri in @("$gateway/health", "http://localhost:3001/health", "http://localhost:3002/health", "http://localhost:3003/health")) {
  $health = Invoke-RestMethod -Method Get -Uri $uri
  if ($health.status -ne "ok") { throw "Service không healthy: $uri" }
}

Write-Host "2/17 Kiểm tra OpenAPI/Swagger"
foreach ($uri in @("http://localhost:3001/api-docs.json", "http://localhost:3002/api-docs.json", "http://localhost:3003/api-docs.json")) {
  $spec = Invoke-RestMethod -Method Get -Uri $uri
  if (-not $spec.openapi.StartsWith("3.0")) { throw "OpenAPI spec không hợp lệ: $uri" }
}

Write-Host "3/17 Đăng ký"
$registerBody = @{ name = "Lab Student"; email = $email; password = $password } | ConvertTo-Json
$registered = Invoke-RestMethod -Method Post -Uri "$gateway/api/auth/register" -ContentType "application/json" -Body $registerBody

Write-Host "4/17 Đăng nhập"
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$gateway/api/auth/login" -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.data.accessToken)" }

Write-Host "5/17 Kiểm tra /me"
$me = Invoke-RestMethod -Method Get -Uri "$gateway/api/auth/me" -Headers $headers
if ($me.data.email -ne $email) { throw "/me trả sai người dùng" }

Write-Host "6/17 Làm mới token"
$refreshBody = @{ refreshToken = $login.data.refreshToken } | ConvertTo-Json
$refreshed = Invoke-RestMethod -Method Post -Uri "$gateway/api/auth/refresh" -ContentType "application/json" -Body $refreshBody
if ([string]::IsNullOrWhiteSpace($refreshed.data.accessToken)) { throw "Không nhận được access token mới" }
$headers = @{ Authorization = "Bearer $($refreshed.data.accessToken)" }

Write-Host "7/17 Tạo sản phẩm"
$productBody = @{
  name = "Smoke Product $([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
  price = 100000
  stock = 10
} | ConvertTo-Json
$product = Invoke-RestMethod -Method Post -Uri "$gateway/api/products" -ContentType "application/json" -Body $productBody

Write-Host "8/17 Kiểm tra pagination, filter và sort"
$products = Invoke-RestMethod -Method Get -Uri "$gateway/api/products?page=1&limit=5&search=Smoke&minPrice=1&maxPrice=200000&sortBy=price&order=desc"
if ($null -eq $products.pagination) { throw "Product API thiếu pagination" }

Write-Host "9/17 Kiểm tra Redis cache"
$cacheKey = [guid]::NewGuid().ToString("N")
$null = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$gateway/api/products?search=$cacheKey"
$cachedResponse = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$gateway/api/products?search=$cacheKey"
if ($cachedResponse.Headers["X-Cache"] -ne "HIT") { throw "Redis cache không trả X-Cache: HIT" }

Write-Host "10/17 Kiểm tra validation 422"
try {
  Invoke-RestMethod -Method Post -Uri "$gateway/api/products" -ContentType "application/json" -Body '{"name":"","price":-1}'
  throw "Validation không trả lỗi"
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 422) { throw }
}

Write-Host "11/17 Kiểm tra sản phẩm không tồn tại trả 404"
try {
  Invoke-RestMethod -Method Get -Uri "$gateway/api/products/999999999"
  throw "Product API không trả 404"
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
}

Write-Host "12/17 Kiểm tra Order API yêu cầu JWT"
try {
  Invoke-RestMethod -Method Get -Uri "$gateway/api/orders/customer/$($registered.data.id)"
  throw "Order API không chặn request thiếu token"
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw }
}

Write-Host "13/17 Tạo đơn hàng"
$orderBody = @{
  customerName = "Lab Student"
  customerEmail = $email
  items = @(@{ productId = $product.data.id; quantity = 2 })
  shippingAddress = @{ street = "1 Nguyen Hue"; city = "TP.HCM"; district = "Quan 1" }
} | ConvertTo-Json -Depth 5
$order = Invoke-RestMethod -Method Post -Uri "$gateway/api/orders" -Headers $headers -ContentType "application/json" -Body $orderBody

Write-Host "14/17 Lấy đơn hàng theo khách hàng"
$orders = Invoke-RestMethod -Method Get -Uri "$gateway/api/orders/customer/$($registered.data.id)?page=1&limit=5" -Headers $headers
if ($orders.data.Count -lt 1) { throw "Không tìm thấy đơn hàng vừa tạo" }

Write-Host "15/17 Cập nhật trạng thái đơn"
$statusBody = @{ status = "confirmed" } | ConvertTo-Json
$updated = Invoke-RestMethod -Method Patch -Uri "$gateway/api/orders/$($order.data._id)/status" -Headers $headers -ContentType "application/json" -Body $statusBody
if ($updated.data.status -ne "confirmed") { throw "Cập nhật trạng thái thất bại" }

Write-Host "16/17 Soft delete sản phẩm"
$deleted = Invoke-RestMethod -Method Delete -Uri "$gateway/api/products/$($product.data.id)"
if (-not $deleted.success) { throw "Soft delete thất bại" }

Write-Host "17/17 Xác nhận sản phẩm đã bị ẩn"
try {
  Invoke-RestMethod -Method Get -Uri "$gateway/api/products/$($product.data.id)"
  throw "Sản phẩm soft delete vẫn còn truy cập được"
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
}

Write-Host "SMOKE TEST PASS" -ForegroundColor Green
Write-Host "User ID: $($registered.data.id), Product ID: $($product.data.id), Order ID: $($order.data._id)"
