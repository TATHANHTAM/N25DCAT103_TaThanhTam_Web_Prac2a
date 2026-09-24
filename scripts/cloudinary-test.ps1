param(
  [string]$Gateway = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"

$products = Invoke-RestMethod -Method Get -Uri "$Gateway/api/products?page=1&limit=1"
if ($products.data.Count -lt 1) {
  throw "Không có sản phẩm để kiểm tra upload. Hãy chạy seed trước."
}

$productId = $products.data[0].id
$imagePath = (Resolve-Path (Join-Path $PSScriptRoot "..\postman\product-test.svg")).Path
$json = & curl.exe -sS -f -X POST -F "image=@$imagePath;type=image/svg+xml" "$Gateway/api/products/$productId/image"

if ($LASTEXITCODE -ne 0) {
  throw "Request upload thất bại"
}

$result = $json | ConvertFrom-Json
if (-not $result.success -or [string]::IsNullOrWhiteSpace($result.data.imageUrl)) {
  throw "Cloudinary không trả về URL ảnh"
}

Write-Host "CLOUDINARY UPLOAD PASS" -ForegroundColor Green
Write-Host "Product ID: $productId"
Write-Host "Image URL: $($result.data.imageUrl)"
