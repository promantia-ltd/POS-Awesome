# POS Awesome API Reference

## Overview
POS Awesome provides a comprehensive REST API for point-of-sale operations. All endpoints are secured using Frappe's authentication system and require appropriate permissions.

## Authentication
All API requests must include valid Frappe session cookies or API keys.

```javascript
// Using Frappe's built-in call method
frappe.call({
    method: 'posawesome.posawesome.api.posapp.get_items',
    args: {
        pos_profile: 'Main POS'
    },
    callback: function(response) {
        console.log(response.message);
    }
});
```

## Core API Endpoints

### Session Management

#### `get_opening_dialog_data()`
Retrieves initial data for opening a POS shift.

**Returns:**
```javascript
{
    pos_profile: {},
    payment_methods: [],
    company: "Company Name",
    pos_opening_shift: null || {}
}
```

#### `create_opening_voucher(pos_profile, company, balance_details)`
Creates a new POS opening shift.

**Parameters:**
- `pos_profile` (string): POS Profile name
- `company` (string): Company name
- `balance_details` (array): Opening balance details

**Returns:**
```javascript
{
    name: "POSA-OS-2024-0001",
    status: "Open"
}
```

#### `check_opening_shift(user)`
Checks if user has an open shift.

**Parameters:**
- `user` (string): Username

**Returns:**
```javascript
{
    name: "POSA-OS-2024-0001",
    pos_profile: "Main POS",
    period_start_date: "2024-01-01 09:00:00"
}
```

### Item Management

#### `get_items(pos_profile, price_list=None)`
Fetches all items available for the POS profile.

**Parameters:**
- `pos_profile` (string): POS Profile name
- `price_list` (string, optional): Price list to use

**Returns:**
```javascript
{
    items: [
        {
            item_code: "ITEM-001",
            item_name: "Product Name",
            item_group: "Category",
            price_list_rate: 100.00,
            actual_qty: 50,
            has_variants: 0,
            variant_of: null,
            attributes: [],
            uom: "Nos",
            image: "/files/item.jpg"
        }
    ],
    cache_key: "pos_items_main_pos"
}
```

#### `get_items_details(pos_profile, items_data)`
Gets detailed information for specific items.

**Parameters:**
- `pos_profile` (string): POS Profile name
- `items_data` (array): Array of item codes with quantities

**Example:**
```javascript
items_data = [
    {
        item_code: "ITEM-001",
        qty: 2,
        uom: "Nos",
        batch_no: null,
        serial_no: null
    }
]
```

**Returns:**
```javascript
[
    {
        item_code: "ITEM-001",
        item_name: "Product Name",
        price_list_rate: 100.00,
        discount_percentage: 0,
        actual_qty: 50,
        tax_rate: 18,
        has_batch_no: 0,
        has_serial_no: 0
    }
]
```

#### `get_item_groups()`
Returns all item groups (categories).

**Returns:**
```javascript
[
    {
        name: "Electronics",
        lft: 1,
        rgt: 10,
        parent_item_group: "All Item Groups"
    }
]
```

#### `get_item_stock(item_code, warehouse=None)`
Gets real-time stock information.

**Parameters:**
- `item_code` (string): Item code
- `warehouse` (string, optional): Specific warehouse

**Returns:**
```javascript
{
    actual_qty: 50,
    reserved_qty: 5,
    available_qty: 45
}
```

### Customer Management

#### `get_customer_info(customer)`
Retrieves detailed customer information.

**Parameters:**
- `customer` (string): Customer name

**Returns:**
```javascript
{
    customer_name: "John Doe",
    customer_group: "Retail",
    territory: "Local",
    mobile_no: "+1234567890",
    email_id: "john@example.com",
    primary_address: {},
    loyalty_points: 150,
    outstanding_amount: 0,
    credit_limit: 5000,
    posa_discount: 10,
    posa_referral_code: "REF123"
}
```

#### `create_customer(customer_name, tax_id=None, mobile_no=None, email_id=None)`
Creates a new customer.

**Parameters:**
- `customer_name` (string): Customer name
- `tax_id` (string, optional): Tax identification number
- `mobile_no` (string, optional): Mobile number
- `email_id` (string, optional): Email address

**Returns:**
```javascript
{
    name: "CUST-00001",
    customer_name: "John Doe"
}
```

#### `search_customer(search_value)`
Searches for customers by name, mobile, or email.

**Parameters:**
- `search_value` (string): Search term

**Returns:**
```javascript
[
    {
        name: "CUST-00001",
        customer_name: "John Doe",
        mobile_no: "+1234567890"
    }
]
```

### Invoice Operations

#### `submit_invoice(invoice_data)`
Submits a sales invoice.

**Parameters:**
- `invoice_data` (object): Complete invoice object

**Invoice Data Structure:**
```javascript
{
    naming_series: "ACC-SINV-.YYYY.-",
    company: "Company Name",
    pos_profile: "Main POS",
    customer: "CUST-00001",
    items: [
        {
            item_code: "ITEM-001",
            item_name: "Product Name",
            qty: 2,
            rate: 100,
            uom: "Nos",
            warehouse: "Main Store"
        }
    ],
    payments: [
        {
            mode_of_payment: "Cash",
            amount: 200
        }
    ],
    taxes: [],
    discount_amount: 0,
    apply_discount_on: "Grand Total",
    posa_pos_opening_shift: "POSA-OS-2024-0001"
}
```

**Returns:**
```javascript
{
    name: "ACC-SINV-2024-00001",
    status: "Paid",
    grand_total: 200,
    outstanding_amount: 0
}
```

#### `save_draft_invoice(invoice_data)`
Saves invoice as draft.

**Parameters:**
- `invoice_data` (object): Invoice object (same as submit_invoice)

**Returns:**
```javascript
{
    name: "ACC-SINV-2024-00001",
    docstatus: 0
}
```

#### `get_draft_invoices(pos_opening_shift)`
Retrieves all draft invoices for a shift.

**Parameters:**
- `pos_opening_shift` (string): Opening shift name

**Returns:**
```javascript
[
    {
        name: "ACC-SINV-2024-00001",
        customer: "John Doe",
        grand_total: 200,
        creation: "2024-01-01 10:00:00"
    }
]
```

#### `delete_invoice(invoice_name)`
Deletes a draft invoice.

**Parameters:**
- `invoice_name` (string): Invoice name

**Returns:**
```javascript
{
    success: true,
    message: "Invoice deleted successfully"
}
```

### Payment Processing

#### `get_payment_methods()`
Returns available payment methods.

**Returns:**
```javascript
[
    {
        name: "Cash",
        type: "Cash",
        default: 1,
        default_account: "Cash - Company"
    },
    {
        name: "Credit Card",
        type: "Bank",
        default: 0,
        default_account: "Bank - Company"
    }
]
```

#### `process_payment(payment_data)`
Processes a payment transaction.

**Parameters:**
- `payment_data` (object): Payment details

**Payment Data Structure:**
```javascript
{
    invoice: "ACC-SINV-2024-00001",
    amount: 200,
    mode_of_payment: "Cash",
    reference_no: "REF123",
    reference_date: "2024-01-01"
}
```

#### `create_payment_entry(payment_entry_data)`
Creates a payment entry for reconciliation.

**Parameters:**
- `payment_entry_data` (object): Payment entry details

**Returns:**
```javascript
{
    name: "PE-2024-00001",
    paid_amount: 200,
    received_amount: 200
}
```

### Loyalty Program

#### `get_loyalty_points(customer)`
Gets customer's loyalty points balance.

**Parameters:**
- `customer` (string): Customer name

**Returns:**
```javascript
{
    loyalty_points: 150,
    loyalty_program: "Standard Program",
    tier: "Silver"
}
```

#### `redeem_loyalty_points(customer, points, invoice)`
Redeems loyalty points.

**Parameters:**
- `customer` (string): Customer name
- `points` (number): Points to redeem
- `invoice` (string): Invoice reference

**Returns:**
```javascript
{
    success: true,
    remaining_points: 50,
    redemption_amount: 100
}
```

### Offers and Coupons

#### `get_offers(profile, customer=None, items=None)`
Gets applicable offers.

**Parameters:**
- `profile` (string): POS Profile
- `customer` (string, optional): Customer name
- `items` (array, optional): Item list

**Returns:**
```javascript
[
    {
        name: "OFFER-001",
        offer_name: "Buy 2 Get 1 Free",
        offer_type: "Product",
        applicable_items: ["ITEM-001"],
        min_qty: 2,
        free_qty: 1
    }
]
```

#### `validate_coupon(coupon_code, customer, invoice_amount)`
Validates a coupon code.

**Parameters:**
- `coupon_code` (string): Coupon code
- `customer` (string): Customer name
- `invoice_amount` (number): Invoice total

**Returns:**
```javascript
{
    valid: true,
    discount_type: "Percentage",
    discount_value: 10,
    maximum_discount: 100
}
```

#### `apply_coupon(invoice, coupon_code)`
Applies coupon to invoice.

**Parameters:**
- `invoice` (string): Invoice name
- `coupon_code` (string): Coupon code

**Returns:**
```javascript
{
    success: true,
    discount_amount: 50,
    new_total: 150
}
```

### Returns Management

#### `get_invoice_for_return(invoice_no)`
Gets invoice details for return.

**Parameters:**
- `invoice_no` (string): Original invoice number

**Returns:**
```javascript
{
    invoice: {},
    items: [],
    payments: [],
    can_return: true
}
```

#### `process_return(return_data)`
Processes a return transaction.

**Parameters:**
- `return_data` (object): Return details

**Return Data Structure:**
```javascript
{
    original_invoice: "ACC-SINV-2024-00001",
    items: [
        {
            item_code: "ITEM-001",
            qty: -1,
            rate: 100
        }
    ],
    payment_method: "Cash",
    reason: "Defective product"
}
```

### Shift Management

#### `get_shift_details(shift_name)`
Gets detailed shift information.

**Parameters:**
- `shift_name` (string): Shift name

**Returns:**
```javascript
{
    name: "POSA-OS-2024-0001",
    total_sales: 5000,
    total_returns: 200,
    net_total: 4800,
    payment_reconciliation: []
}
```

#### `close_shift(shift_name, closing_details)`
Closes a POS shift.

**Parameters:**
- `shift_name` (string): Shift name
- `closing_details` (object): Closing balance details

**Returns:**
```javascript
{
    closing_shift: "POSA-CS-2024-0001",
    difference: 0,
    status: "Closed"
}
```

### M-Pesa Integration

#### `initiate_mpesa_payment(phone_number, amount, invoice)`
Initiates M-Pesa payment.

**Parameters:**
- `phone_number` (string): Customer phone number
- `amount` (number): Payment amount
- `invoice` (string): Invoice reference

**Returns:**
```javascript
{
    request_id: "REQ123",
    merchant_request_id: "MERCH123",
    checkout_request_id: "CHECK123",
    status: "Pending"
}
```

#### `check_mpesa_status(request_id)`
Checks M-Pesa payment status.

**Parameters:**
- `request_id` (string): Request ID

**Returns:**
```javascript
{
    status: "Completed",
    transaction_id: "TRANS123",
    amount: 200,
    receipt_number: "REC123"
}
```

### Utility Functions

#### `get_pos_profiles()`
Returns available POS profiles for user.

**Returns:**
```javascript
[
    {
        name: "Main POS",
        company: "Company Name",
        warehouse: "Main Store",
        currency: "USD"
    }
]
```

#### `get_currencies()`
Returns available currencies.

**Returns:**
```javascript
[
    {
        name: "USD",
        symbol: "$",
        fraction: "Cents"
    }
]
```

#### `update_cache(cache_key)`
Forces cache refresh.

**Parameters:**
- `cache_key` (string): Cache key to refresh

**Returns:**
```javascript
{
    success: true,
    message: "Cache updated"
}
```

## Error Handling

All API endpoints return standardized error responses:

```javascript
{
    exc_type: "ValidationError",
    exception: "Error message",
    _server_messages: [
        {
            message: "Detailed error description",
            indicator: "red"
        }
    ]
}
```

## Rate Limiting

API endpoints are subject to rate limiting:
- 100 requests per minute per user
- 1000 requests per hour per user

## Webhooks

POS Awesome supports webhooks for real-time notifications:

```javascript
// Invoice submitted
{
    event: "invoice_submitted",
    data: {
        invoice: "ACC-SINV-2024-00001",
        amount: 200,
        customer: "CUST-00001"
    }
}

// Payment received
{
    event: "payment_received",
    data: {
        payment: "PE-2024-00001",
        amount: 200,
        method: "Cash"
    }
}
```

## Best Practices

1. **Always handle errors gracefully**
```javascript
frappe.call({
    method: 'posawesome.api.submit_invoice',
    args: { invoice_data: data },
    callback: function(r) {
        // Handle success
    },
    error: function(r) {
        frappe.msgprint(__('Error: ') + r.message);
    }
});
```

2. **Use batch operations when possible**
```javascript
// Instead of multiple calls
items.forEach(item => getItemDetails(item));

// Use single batch call
getItemsDetails(items);
```

3. **Implement proper caching**
```javascript
// Check local cache first
const cached = localStorage.getItem('items_cache');
if (cached && !isExpired(cached)) {
    return JSON.parse(cached);
}
```

4. **Validate data client-side**
```javascript
// Validate before API call
if (!validateInvoiceData(data)) {
    return showError('Invalid invoice data');
}
submitInvoice(data);
```