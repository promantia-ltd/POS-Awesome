# POS Awesome Architecture

## System Architecture Overview

POS Awesome follows a modern three-tier architecture pattern integrated with the Frappe/ERPNext framework:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│         Vue.js 3 + Vuetify 3 + Event Bus (Mitt)         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│          Python APIs (@frappe.whitelist)                 │
│              Business Logic & Validation                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│     Frappe DocTypes + MariaDB + Redis Cache             │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
posawesome/
├── posawesome/                    # Main application module
│   ├── posawesome/               # Core business logic
│   │   ├── api/                  # Backend API endpoints
│   │   │   ├── posapp.py        # Main POS API
│   │   │   ├── invoice.py       # Invoice operations
│   │   │   ├── customer.py      # Customer management
│   │   │   ├── payment_entry.py # Payment processing
│   │   │   └── m_pesa.py        # M-Pesa integration
│   │   ├── doctype/              # Custom DocTypes
│   │   │   ├── pos_closing_shift/
│   │   │   ├── pos_coupon/
│   │   │   ├── pos_offer/
│   │   │   ├── pos_opening_shift/
│   │   │   ├── delivery_charges/
│   │   │   └── referral_code/
│   │   ├── page/                 # Custom pages
│   │   │   └── posapp/          # Main POS page
│   │   └── workspace/            # Workspace definitions
│   ├── public/                   # Frontend assets
│   │   ├── js/
│   │   │   └── posapp/          # Vue.js application
│   │   │       ├── components/  # Vue components
│   │   │       ├── plugins/     # Vue plugins
│   │   │       └── posapp.js   # App entry point
│   │   └── css/                 # Stylesheets
│   ├── config/                   # Configuration files
│   ├── fixtures/                 # Data fixtures
│   │   ├── custom_field.json   # Custom field definitions
│   │   └── property_setter.json # Property customizations
│   └── templates/                # Print templates
└── hooks.py                      # App integration hooks
```

## Frontend Architecture

### Technology Stack
- **Vue.js 3**: Composition API for reactive components
- **Vuetify 3**: Material Design component library
- **Mitt**: Lightweight event emitter for component communication
- **Lodash**: Utility functions for data manipulation

### Component Hierarchy

```
Home.vue (Root Component)
├── OpeningDialog.vue (Shift Management)
├── Pos.vue (Main POS Interface)
│   ├── ItemsSelector.vue
│   │   ├── ItemCard.vue
│   │   └── ItemsList.vue
│   ├── Invoice.vue (Cart Management)
│   │   ├── InvoiceItems.vue
│   │   ├── Customer.vue
│   │   └── Totals.vue
│   ├── Payments.vue
│   │   ├── Pay.vue
│   │   └── PaymentMethods.vue
│   ├── PosOffers.vue
│   └── PosCoupons.vue
├── ClosingDialog.vue (End of Shift)
└── Settings.vue
```

### State Management
- Component-level state using Vue 3 Composition API
- Global event bus for cross-component communication
- Local storage for offline capability
- Server state synchronization via API calls

### Event Communication Pattern
```javascript
// Event emission
evntBus.emit('add-item-to-cart', itemData)

// Event listening
evntBus.on('add-item-to-cart', (itemData) => {
  // Handle item addition
})
```

## Backend Architecture

### API Layer Design

#### Core API Module (`api/posapp.py`)
Primary interface for POS operations with 40+ endpoints:

```python
# Session Management
@frappe.whitelist()
def get_opening_dialog_data()
def create_opening_voucher()
def check_opening_shift()
def close_shift_operations()

# Item Operations
@frappe.whitelist()
def get_items()           # Cached item fetching
def get_items_details()   # Detailed item info
def get_item_groups()     # Category management
def get_item_stock()      # Real-time inventory

# Transaction Processing
@frappe.whitelist()
def submit_invoice()      # Complete sale
def save_draft_invoice()  # Save as draft
def return_invoice()      # Process returns
def get_draft_invoices()  # Retrieve drafts

# Customer Management
@frappe.whitelist()
def get_customer_info()
def create_customer()
def update_customer()
def get_loyalty_points()
```

### Data Models (DocTypes)

#### POS Opening Shift
```python
{
    "doctype": "POS Opening Shift",
    "fields": [
        {"fieldname": "pos_profile", "fieldtype": "Link"},
        {"fieldname": "user", "fieldtype": "Link"},
        {"fieldname": "company", "fieldtype": "Link"},
        {"fieldname": "period_start_date", "fieldtype": "Datetime"},
        {"fieldname": "balance_details", "fieldtype": "Table"}
    ]
}
```

#### POS Closing Shift
```python
{
    "doctype": "POS Closing Shift",
    "fields": [
        {"fieldname": "pos_opening_shift", "fieldtype": "Link"},
        {"fieldname": "period_end_date", "fieldtype": "Datetime"},
        {"fieldname": "grand_total", "fieldtype": "Currency"},
        {"fieldname": "net_total", "fieldtype": "Currency"},
        {"fieldname": "total_quantity", "fieldtype": "Float"},
        {"fieldname": "taxes", "fieldtype": "Table"}
    ]
}
```

### Caching Strategy

#### Multi-Level Cache Architecture
```
Request → Local Storage → Redis Cache → Database
    ↓          ↓              ↓            ↓
  Instant    < 50ms        < 200ms      > 200ms
```

#### Cache Implementation
```python
def get_items(pos_profile):
    cache_key = f"pos_items_{pos_profile}"
    
    # Check Redis cache
    cached_data = frappe.cache().get_value(cache_key)
    if cached_data:
        return cached_data
    
    # Fetch from database
    items = fetch_items_from_db()
    
    # Store in cache with TTL
    frappe.cache().set_value(cache_key, items, expires_in_sec=300)
    return items
```

## Data Flow Patterns

### Sale Transaction Flow
```
1. Item Selection
   └── Search/Scan → Cache Check → Stock Validation → Price Calculation
   
2. Cart Management
   └── Add to Cart → Apply Discounts → Calculate Taxes → Update Totals
   
3. Customer Selection
   └── Search Customer → Load Credit/Points → Apply Discounts
   
4. Payment Processing
   └── Select Methods → Validate Amounts → Process Payment → Create Journal
   
5. Invoice Generation
   └── Create Invoice → Apply Offers → Submit Document → Print Receipt
```

### Inventory Update Flow
```
Submit Invoice → Update Stock Ledger → Refresh Cache → Broadcast Updates
```

## Integration Points

### ERPNext Integration
- Extends Sales Invoice with 15+ custom fields
- Enhances POS Profile with advanced settings
- Integrates with Customer, Item, and Payment DocTypes
- Hooks into document lifecycle events

### Custom Field Extensions
```javascript
// Sales Invoice Extensions
posa_pos_opening_shift    // Link to shift
posa_offers               // Applied offers
posa_coupons             // Used coupons
posa_delivery_charges    // Delivery fees

// POS Profile Extensions
posa_allow_delete        // Permission control
posa_display_items_in_stock  // Stock display
posa_max_discount_allowed    // Discount limits
```

## Security Architecture

### Authentication & Authorization
- Frappe session-based authentication
- Role-based access control (RBAC)
- User-specific POS profiles
- Field-level permissions

### API Security
```python
@frappe.whitelist()  # Exposes API endpoint
def sensitive_operation():
    # Permission checks
    if not frappe.has_permission("Sales Invoice", "write"):
        frappe.throw("Insufficient permissions")
    
    # Input validation
    validate_input_data()
    
    # Business logic
    process_operation()
```

### Data Validation
- Server-side validation hooks
- Client-side input sanitization
- SQL injection prevention via ORM
- XSS protection through framework

## Performance Optimizations

### Frontend Optimizations
- Component lazy loading
- Virtual scrolling for large lists
- Debounced search inputs
- Image lazy loading
- Local storage caching

### Backend Optimizations
- Redis caching with TTL
- Database query optimization
- Batch operations for bulk updates
- Indexed searches
- Connection pooling

### Network Optimizations
- Request batching
- Response compression
- CDN for static assets
- WebSocket for real-time updates

## Deployment Architecture

### Development Environment
```
bench start
├── Web Server (Port 8000)
├── Socketio Server (Port 9000)
├── Worker Processes
├── Scheduler
└── Redis (Cache & Queue)
```

### Production Environment
```
Nginx (Reverse Proxy)
├── Gunicorn (Web Server)
├── Supervisor (Process Manager)
│   ├── Web Workers
│   ├── Background Workers
│   └── Scheduler
├── Redis Cluster
│   ├── Cache Instance
│   └── Queue Instance
└── MariaDB (Primary Database)
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session storage in Redis
- Load balancer compatible
- Database read replicas support

### Vertical Scaling
- Configurable worker processes
- Memory-efficient caching
- Optimized database queries
- Resource pooling

## Monitoring & Debugging

### Logging Strategy
```python
# API logging
frappe.logger().debug(f"Processing invoice: {invoice_name}")
frappe.logger().error(f"Payment failed: {error_message}")
```

### Performance Monitoring
- API response time tracking
- Database query profiling
- Cache hit/miss ratios
- Error rate monitoring

## Best Practices

### Frontend Development
1. Use Composition API for new components
2. Implement proper error boundaries
3. Optimize bundle size with code splitting
4. Use Vuetify components for consistency

### Backend Development
1. Always validate input data
2. Use database transactions for critical operations
3. Implement proper error handling
4. Cache expensive operations

### Testing Strategy
1. Unit tests for API endpoints
2. Component testing for Vue components
3. Integration tests for workflows
4. Performance testing for load scenarios