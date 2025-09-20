# FIDS Cashier Lite - User Manual

## Introduction

Welcome to FIDS Cashier Lite, a powerful and flexible point-of-sale (POS) and reporting system designed for events with multiple vendors (tenants). This application streamlines the sales process, provides real-time financial data, and simplifies revenue sharing calculations.

This manual is divided into two parts:
-   **Part 1: For the Administrator**: Covers setup, management, and reporting.
-   **Part 2: For the Cashier**: Covers daily sales operations.

---

## Part 1: For the Administrator

As an Administrator, you have full control over the setup and management of the event's sales infrastructure. Your primary responsibilities include managing events, tenants, products, cashiers, and permissions.

### 1.1 Logging In & Account Creation

-   **Sign In**: Navigate to the application's login page. Select the "Admin Login" tab, enter your email and password, and click "Sign In".
-   **Sign Up**: If you are a new administrator, select the "Sign Up" tab. Enter your email and choose a secure password (at least 6 characters). After signing up, you may need to verify your email address before you can log in.

### 1.2 The Admin Dashboard

The dashboard is your central hub for managing all aspects of the event. It is comprised of several management cards:

-   **Events**: Manage all event schedules.
-   **Tenants**: Manage all vendors or sales points.
-   **Products**: See an overview of all products in the system.
-   **Cashiers**: Manage all cashier accounts and their roles.
-   **Category Management**: Assign permissions for which cashier roles can see which product categories.
-   **Tenant Management Grid**: A visual grid of all tenants, providing a shortcut to manage their specific products.

### 1.3 Event Management

The system is designed to handle multiple events, but **only one event can be active at a time**. Cashiers can only log in if there is an active event.

1.  **Create an Event**:
    -   On the "Events" card, click "Create Event".
    -   Fill in the Event Name, Start Date, End Date, and other details.
    -   Click "Create Event" to save.
2.  **Set the Active Event**:
    -   On the "Events" card, click "View All Events".
    -   A list of all events will appear. Find the event you want to activate.
    -   Click the toggle switch next to the event's name to set it as active. The previously active event will be automatically deactivated.

### 1.4 Tenant Management

Tenants are the vendors or stalls whose products you will be selling (e.g., "Mama's Kitchen", "Main Bar").

1.  **Add a Tenant**:
    -   On the "Tenants" card, click "Add Tenant".
    -   Fill in the tenant's details, including their name, responsible party, contact info, and the agreed **Revenue Share %**. This percentage determines how much of the gross sales the tenant keeps.
    -   Click "Save Tenant".
2.  **Edit or Delete a Tenant**:
    -   From the "Tenant Management" grid at the bottom of the dashboard, hover over the tenant's card you wish to manage.
    -   Click the **Edit** (pencil) icon to update their details.
    -   Click the **Delete** (trash) icon to permanently remove them. **Warning**: Deleting a tenant will also delete all products associated with them.

### 1.5 Cashier Management & Roles

You can create accounts for each cashier and assign them specific roles to restrict their access to product categories.

1.  **Add a Cashier**:
    -   On the "Cashiers" card, click "Add Cashier".
    -   Enter the cashier's name and a unique 4-digit PIN.
    -   Assign them a **Role** from the dropdown:
        -   `Bar`: For cashiers selling beverages.
        -   `Entrance`: For cashiers selling tickets.
        -   `Other`: For cashiers selling merchandise or other specific items.
    -   Click "Save Cashier".
2.  **Edit a Cashier**:
    -   On the "Cashiers" card, click "View All Cashiers".
    -   Find the cashier in the list and click the **Edit** (pencil) icon to update their name, PIN, or role.

### 1.6 Product & Category Management

This is a two-step process: first, you define which roles can see which categories, and second, you add products to tenants and assign them to a category.

**Step 1: Assign Roles to Categories (Permissions)**

1.  Find the **Category Management** card on the dashboard.
2.  Click the "Manage Roles" button.
3.  A dialog will appear listing all product categories (e.g., "Beer", "Ticketing", "Food").
4.  For each category, check the boxes for the roles that should have access to it. For example, for the "Ticketing" category, you would check the `Entrance` box. For the "Beer" category, you would check the `Bar` box.
5.  Click "Save Changes". This permission structure is now active.

**Step 2: Add Products to a Tenant**

1.  From the "Tenant Management" grid, click on the tenant for whom you want to add a product.
2.  You will be taken to that tenant's product management page. Click "Add Product".
3.  Fill in the product details:
    -   **Product Name**: e.g., "Early Bird Ticket".
    -   **Product Type**: Select the appropriate category (e.g., "Ticketing"). This is crucial for the role permissions to work.
    -   **Buying Price & Selling Price**: For profit calculation.
    -   **Initial Stock**: The starting quantity available.
4.  Click "Save Product".

### 1.7 Viewing Reports

-   Navigate to the "Reports" tab from the header.
-   Here you can see an overall performance report, including Gross Revenue, Organizer's Share, and top-performing tenants.
-   Click "View All Tenants" to see a detailed breakdown of sales and revenue shares for every tenant. You can click on an individual tenant in this list to see their specific, detailed report.

---

## Part 2: For the Cashier

As a Cashier, your role is to handle sales transactions quickly and accurately. Your view of the products is customized based on the role assigned to you by the administrator.

### 2.1 Starting a Shift

1.  **Login**: On the login screen, ensure the "Cashier Login" tab is selected.
2.  **Select Name**: Choose your name from the "Cashier Name" dropdown list.
3.  **Enter PIN**: Enter your secret 4-digit PIN.
4.  **Declare Float**: Enter the amount of starting cash you have in your drawer (e.g., `2000`).
5.  **Start Shift**: Click "Start Shift & Login".

You can only log in if an Administrator has set an active event. If not, the login form will be disabled.

### 2.2 The Cashier Dashboard & Placing an Order

-   **Category View**: Your dashboard displays tiles for the product categories you are allowed to sell (e.g., "Beer", "Wine").
-   **Select a Category**: Click on a category tile.
-   **View Products**: You will see all available products within that category, grouped by tenant.
-   **Add to Order**: Click on a product tile to add it to the "Current Order" summary on the right. You can add products from multiple tenants to the same order.
-   **Adjust Quantity**: In the order summary, you can change the quantity of any item or remove it using the trash icon.
-   **Place Order**: Once the order is correct, click the "Place Order" button at the bottom of the summary.

### 2.3 Receipts

-   After clicking "Place Order", a receipt dialog will appear.
-   This dialog shows a **Customer Receipt** and a separate **Tenant Receipt** for each vendor included in the sale.
-   **Print**: Click the "Print Receipt" button to print all parts of the receipt.
-   **New Order**: Click "New Order" to close the receipt and begin a new transaction.

### 2.4 Offline Capability

The application is designed to work even if the internet connection is lost. All sales will be saved locally on your device and will be automatically synchronized with the central server once the connection is restored.

### 2.5 Ending Your Shift

1.  **Navigate to Reports**: Click on the "Reports" tab in the header.
2.  **Review Your Sales**: You will see a summary of your shift's performance, including total revenue and a list of all your recent transactions.
3.  **Confirm Reporting**: Once you have reviewed your sales and balanced your cash drawer, click the **"Reporting Done"** button. This is a crucial step that confirms you have completed your end-of-shift duties.
4.  **End Shift**: After confirming, the **"End Shift"** button will become active. Click it to log out securely.

### 2.6 Resetting Data for a New Day

-   If you are the first cashier to log in for a new shift or day, and there is old data from a previous session, a supervisor may ask you to clear it.
-   On the main login screen, click the **"Reset Previous Shift"** button. This can only be done after "Reporting Done" has been marked on the reports page.
-   This will clear all completed order data from the device, ensuring you start the new shift with a clean slate.