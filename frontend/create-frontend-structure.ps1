# ============================================
# Project Material & Supply Management System
# Frontend Structure
# ============================================

Write-Host "Creating frontend folder structure..." -ForegroundColor Cyan

# -----------------------------
# Components
# -----------------------------

New-Item -ItemType Directory -Force -Path "src\components\layout"
New-Item -ItemType Directory -Force -Path "src\components\dashboard"
New-Item -ItemType Directory -Force -Path "src\components\common"

# Layout components
New-Item -ItemType File -Force -Path "src\components\layout\Sidebar.tsx"
New-Item -ItemType File -Force -Path "src\components\layout\Navbar.tsx"
New-Item -ItemType File -Force -Path "src\components\layout\DashboardLayout.tsx"

# Dashboard components
New-Item -ItemType File -Force -Path "src\components\dashboard\StatCard.tsx"
New-Item -ItemType File -Force -Path "src\components\dashboard\RecentActivity.tsx"
New-Item -ItemType File -Force -Path "src\components\dashboard\LowStockTable.tsx"
New-Item -ItemType File -Force -Path "src\components\dashboard\StatusChart.tsx"

# Common components
New-Item -ItemType File -Force -Path "src\components\common\PageHeader.tsx"


# -----------------------------
# Pages
# -----------------------------

New-Item -ItemType Directory -Force -Path "src\pages\auth"
New-Item -ItemType Directory -Force -Path "src\pages\dashboard"

# Auth
New-Item -ItemType File -Force -Path "src\pages\auth\Login.tsx"

# Dashboard
New-Item -ItemType File -Force -Path "src\pages\dashboard\Dashboard.tsx"
New-Item -ItemType File -Force -Path "src\pages\dashboard\AdminDashboard.tsx"
New-Item -ItemType File -Force -Path "src\pages\dashboard\ProjectManagerDashboard.tsx"
New-Item -ItemType File -Force -Path "src\pages\dashboard\SupplyManagerDashboard.tsx"

# Main prototype pages
New-Item -ItemType File -Force -Path "src\pages\Projects.tsx"
New-Item -ItemType File -Force -Path "src\pages\Materials.tsx"
New-Item -ItemType File -Force -Path "src\pages\Requirements.tsx"
New-Item -ItemType File -Force -Path "src\pages\Suppliers.tsx"
New-Item -ItemType File -Force -Path "src\pages\Orders.tsx"
New-Item -ItemType File -Force -Path "src\pages\Dispatches.tsx"
New-Item -ItemType File -Force -Path "src\pages\Users.tsx"


# -----------------------------
# Services
# -----------------------------

New-Item -ItemType Directory -Force -Path "src\services"

New-Item -ItemType File -Force -Path "src\services\api.ts"
New-Item -ItemType File -Force -Path "src\services\authService.ts"
New-Item -ItemType File -Force -Path "src\services\dashboardService.ts"


# -----------------------------
# Context
# -----------------------------

New-Item -ItemType Directory -Force -Path "src\context"

New-Item -ItemType File -Force -Path "src\context\AuthContext.tsx"


# -----------------------------
# Routes
# -----------------------------

New-Item -ItemType Directory -Force -Path "src\routes"

New-Item -ItemType File -Force -Path "src\routes\AppRoutes.tsx"


# -----------------------------
# Utils
# -----------------------------

New-Item -ItemType Directory -Force -Path "src\utils"

New-Item -ItemType File -Force -Path "src\utils\constants.ts"


# -----------------------------
# Environment
# -----------------------------

if (-not (Test-Path ".env")) {
    New-Item -ItemType File -Force -Path ".env"

    @"
VITE_API_URL=http://localhost:5555/api
"@ | Set-Content ".env"

    Write-Host ".env created." -ForegroundColor Green
}
else {
    Write-Host ".env already exists - skipped." -ForegroundColor Yellow
}


# -----------------------------
# Finish
# -----------------------------

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Frontend structure created successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Structure:" -ForegroundColor Cyan

tree /F src

Write-Host ""
Write-Host "Done!" -ForegroundColor Green