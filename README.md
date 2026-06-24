# Frontend Documentation / Handover Guide

## Overview

This frontend is a React + Vite admin dashboard for an e-commerce/order-management platform.
It provides the UI for managing:

* authentication
* dashboard analytics
* orders
* clients
* products
* delivery companies / carriers
* shipments
* team members
* settings and integrations

The frontend communicates with a Laravel backend through `/api` endpoints.

---

# Tech Stack

## Core

* React
* Vite
* React Router DOM
* Axios
* React Hook Form
* date-fns
* lucide-react

## Installed but usage should be verified in code

* Zustand
* React Query

## Styling

* Global custom CSS
* Light / dark theme using CSS variables

---

# Project Purpose

The app is meant to help admins and staff manage the operational side of an e-commerce business, especially:

* order follow-up
* customer management
* product catalog management
* shipping / carrier integrations
* shipment tracking
* internal team configuration

---

# Main Frontend Structure

## Core structure

* `main.jsx` → frontend entry point
* `AppRoutes.jsx` → application routes
* `ProtectedRoute.jsx` → auth guard for private routes
* `DashboardLayout.jsx` → dashboard shell
* `Sidebar.jsx` / `Navbar.jsx` → main navigation UI

## Global contexts

* `AuthContext.jsx` → authentication state
* `ThemeContext.jsx` → dark/light mode
* `LanguageContext.jsx` → language handling
* `ShopContext.jsx` → current shop context (to verify depending on usage)

## API layer

* `api/axios.js` → shared Axios client
* `authService.js`
* `teamService.js`
* `companiesService.js`
* `shipmentsService.js`

---

# Routing Overview

## Public routes

* `/` → Login
* `/forgot-password`
* `/reset-password`
* `/auth/callback`

## Protected routes

* `/dashboard`
* `/commandes`
* `/commandes/toutes`
* `/commandes/abandonnees`
* `/clients`
* `/products`
* `/companies`
* `/companies/:id`
* `/status`
* `/team`
* `/affilies`
* `/integrations/shopify`
* `/sources/google-sheets`
* `/apps/whatsapp`
* `/settings`
* `/help`

> Note: shipment pages exist in the codebase but do not currently appear in the main route config and should be verified.

---

# Main Functional Modules

## 1. Authentication

Files:

* `Login.jsx`
* `ForgotPassword.jsx`
* `ResetPassword.jsx`
* `AuthCallback.jsx`
* `AuthContext.jsx`
* `authService.js`

Responsibilities:

* login/logout
* social auth callback
* forgot/reset password
* profile and password update
* 2FA toggle

---

## 2. Dashboard

File:

* `Dashboard.jsx`

Responsibilities:

* KPIs
* order analytics
* revenue overview
* abandoned orders insights
* date filtering

---

## 3. Orders

Files:

* `Orders.jsx`
* `OrderDetails.jsx`
* `AdminOrders.jsx`
* `AgentOrders.jsx`
* `AbandonedOrders.jsx`

Responsibilities:

* orders list
* order details
* status updates
* pricing / totals
* customer and product details
* order history / timeline

### Important note

There are multiple order-related pages/components.
Before modifying the orders module, verify which file is the current source of truth in production.

---

## 4. Clients

File:

* `ClientsPage.jsx`

Responsibilities:

* client listing
* search and sorting
* metrics (orders, revenue, etc.)

---

## 5. Products

Files:

* `Products.jsx`
* `ProductForm.jsx`

Responsibilities:

* product listing
* grid/table views
* product CRUD
* variants handling
* sync-related product fields

---

## 6. Companies / Carriers

Files:

* `CompaniesPage.jsx`
* `CompanyDetailsPage.jsx`
* `ConnectCompanyModal.jsx`
* `CompanyConnectionStatus.jsx`
* `companiesService.js`

Responsibilities:

* carrier/company listing
* connect/disconnect carriers
* test connection
* action configuration
* webhook setup

---

## 7. Shipments

Files:

* `ShipmentsPage.jsx`
* `ShipmentDetailsPage.jsx`
* `ShipmentStatusBadge.jsx`
* `TrackingTimeline.jsx`
* `shipmentsService.js`

Responsibilities:

* shipment list
* shipment details
* tracking
* shipment status UI

---

## 8. Team

File:

* `Team.jsx`

Responsibilities:

* team members CRUD
* team settings
* impersonation
* product assignment
* dispatch / commission settings

---

## 9. Settings

File:

* `Parametre.jsx`

Responsibilities:

* user profile settings
* password update
* 2FA
* business settings like order prefix / country / exchange rate

---

## 10. Integrations

Files:

* `ShopifyIntegrationPage.jsx`
* `GoogleIntegrationPage.jsx`

Responsibilities:

* Shopify integration flow
* external source integration pages

---

# API Layer

## Shared Axios client

The shared API client:

* uses `/api`
* adds `Authorization: Bearer <token>` from `localStorage`
* is the main HTTP layer for most pages

## Services currently identified

### `authService.js`

* login
* forgot/reset password
* current user
* logout
* profile update
* password update
* 2FA toggle

### `teamService.js`

* get team data
* add/update/delete team members
* save team settings
* impersonate user

### `companiesService.js`

* get companies / company details
* connect / disconnect
* test connection
* enable / disable updates
* get carrier actions
* save action config
* test action
* register webhook

### `shipmentsService.js`

* list shipments
* shipment details
* create / update / cancel shipment
* get tracking
* get shipments by order

---

# Theme / Styling

The frontend relies heavily on `index.css`:

* layout tokens
* theme colors
* sidebar/navbar styles
* cards / badges / tables
* auth styles
* products page styles
* dashboard and shared UI variables

Dark mode is implemented by toggling `body.dark-theme`.

---

# Known Structural Issues / Risks

## 1. Mixed API access patterns

The codebase currently mixes:

* shared services
* direct Axios usage in pages
* local `fetch()` usage in some integration pages

This should eventually be normalized.

## 2. Large page components

Some pages appear to contain too much UI + business logic:

* Dashboard
* Orders
* OrderDetails
* Team
* Products

These pages should be refactored carefully if they keep growing.

## 3. Multiple order page variants

There are several order-related files, which may cause confusion during maintenance.

## 4. Some existing pages are not wired in routes

Shipments are the clearest example and should be verified.

## 5. Inconsistent naming

Examples:

* `Parametre.jsx`
* `status.jsx`
* mixed French/English naming

---

# Recommended Reading Order for a New Developer

## Step 1 — Understand the shell

1. `main.jsx`
2. `AppRoutes.jsx`
3. `ProtectedRoute.jsx`
4. `DashboardLayout.jsx`
5. `Sidebar.jsx`
6. `Navbar.jsx`

## Step 2 — Understand auth

1. `AuthContext.jsx`
2. `authService.js`
3. `Login.jsx`
4. `ForgotPassword.jsx`
5. `ResetPassword.jsx`
6. `AuthCallback.jsx`

## Step 3 — Understand the API layer

1. `api/axios.js`
2. `teamService.js`
3. `companiesService.js`
4. `shipmentsService.js`

## Step 4 — Understand business modules

1. `Dashboard.jsx`
2. `Orders.jsx`
3. `OrderDetails.jsx`
4. `ClientsPage.jsx`
5. `Products.jsx`
6. `CompaniesPage.jsx`
7. `Team.jsx`
8. `Parametre.jsx`
9. `ShopifyIntegrationPage.jsx`

---

# Priority Areas to Verify After Cloning

A new developer should verify these first:

1. Which order page(s) are actively used
2. Whether shipments are routed or only partially integrated
3. Whether Zustand / React Query are actually used or just installed
4. Which integrations are production-ready vs placeholder
5. Whether company details logic is mostly inside a missing integration-builder component

---

# Next Documentation To Add

This README should later be completed with:

* a page-by-page frontend table
* a reusable components inventory
* a known bugs / TODO section
* backend documentation and API endpoint mapping
