# POS Awesome Developer Guide

## Development Environment Setup

### Prerequisites
```bash
# Required versions
Node.js 18+
Python 3.10+
MariaDB 10.3+
Redis 5+

# Frappe bench installed
pip install frappe-bench
```

### Local Development Setup
```bash
# Create new bench
bench init frappe-bench --frappe-branch version-15

# Navigate to bench
cd frappe-bench

# Get ERPNext
bench get-app erpnext --branch version-15

# Get POS Awesome
bench get-app branch version-14 https://github.com/yrestom/POS-Awesome.git

# Create site
bench new-site pos.local

# Install apps
bench --site pos.local install-app erpnext
bench --site pos.local install-app posawesome

# Start development server
bench start
```

## Project Structure

### Backend Structure
```
posawesome/
├── posawesome/
│   ├── api/                    # API endpoints
│   │   ├── posapp.py          # Main POS API
│   │   ├── invoice.py         # Invoice operations
│   │   ├── customer.py        # Customer management
│   │   └── payment_entry.py   # Payment processing
│   ├── doctype/                # Custom DocTypes
│   │   └── [doctype_name]/
│   │       ├── [doctype].json # DocType definition
│   │       ├── [doctype].py   # Python controller
│   │       └── [doctype].js   # Client-side controller
│   └── hooks.py                # App hooks configuration
```

### Frontend Structure
```
posawesome/public/
├── js/
│   └── posapp/
│       ├── components/         # Vue components
│       │   ├── pos/           # POS interface components
│       │   └── management/    # Management components
│       ├── plugins/            # Vue plugins
│       │   ├── bus.js        # Event bus
│       │   └── format.js     # Formatting utilities
│       └── posapp.js          # Vue app entry point
└── css/
    └── posawesome.css          # Custom styles
```

## Creating New Features

### 1. Adding a New API Endpoint

Create new endpoint in `api/posapp.py`:

```python
import frappe
from frappe import _

@frappe.whitelist()
def custom_operation(param1, param2=None):
    """
    Custom API endpoint for new feature
    
    Args:
        param1: Required parameter
        param2: Optional parameter
        
    Returns:
        dict: Operation result
    """
    # Permission check
    if not frappe.has_permission("Sales Invoice", "read"):
        frappe.throw(_("Insufficient permissions"))
    
    # Input validation
    if not param1:
        frappe.throw(_("Parameter 1 is required"))
    
    # Business logic
    try:
        result = process_operation(param1, param2)
        
        # Return response
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Custom Operation Error")
        frappe.throw(_("Operation failed: {0}").format(str(e)))
```

### 2. Creating a Vue Component

Create new component in `public/js/posapp/components/`:

```vue
<!-- CustomFeature.vue -->
<template>
  <v-card class="custom-feature">
    <v-card-title>
      {{ title }}
    </v-card-title>
    
    <v-card-text>
      <v-text-field
        v-model="inputValue"
        :label="label"
        @input="handleInput"
      />
      
      <v-btn
        @click="processFeature"
        :loading="loading"
        color="primary"
      >
        Process
      </v-btn>
    </v-card-text>
    
    <v-alert
      v-if="error"
      type="error"
      dismissible
    >
      {{ error }}
    </v-alert>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { evntBus } from '../../plugins/bus'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'Custom Feature'
  },
  label: {
    type: String,
    default: 'Enter value'
  }
})

// State
const inputValue = ref('')
const loading = ref(false)
const error = ref(null)

// Methods
const handleInput = (value) => {
  // Input handling logic
  error.value = null
}

const processFeature = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await frappe.call({
      method: 'posawesome.posawesome.api.posapp.custom_operation',
      args: {
        param1: inputValue.value
      }
    })
    
    if (response.message.success) {
      // Handle success
      evntBus.emit('feature-processed', response.message.data)
      inputValue.value = ''
    }
  } catch (err) {
    error.value = err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Component initialization
  loadInitialData()
})

const loadInitialData = async () => {
  // Load any required initial data
}
</script>

<style scoped>
.custom-feature {
  margin: 16px;
}
</style>
```

### 3. Creating a New DocType

#### Define DocType JSON
Create `doctype/pos_custom_feature/pos_custom_feature.json`:

```json
{
  "doctype": "DocType",
  "name": "POS Custom Feature",
  "module": "POSAwesome",
  "naming": "POSCF-.YYYY.-.#####",
  "fields": [
    {
      "fieldname": "feature_name",
      "fieldtype": "Data",
      "label": "Feature Name",
      "reqd": 1
    },
    {
      "fieldname": "value",
      "fieldtype": "Currency",
      "label": "Value"
    },
    {
      "fieldname": "status",
      "fieldtype": "Select",
      "label": "Status",
      "options": "Active\nInactive",
      "default": "Active"
    }
  ],
  "permissions": [
    {
      "role": "System Manager",
      "read": 1,
      "write": 1,
      "create": 1,
      "delete": 1
    }
  ]
}
```

#### Create Python Controller
Create `doctype/pos_custom_feature/pos_custom_feature.py`:

```python
import frappe
from frappe.model.document import Document

class POSCustomFeature(Document):
    def validate(self):
        """Validate document before saving"""
        self.validate_value()
        self.set_defaults()
    
    def validate_value(self):
        """Custom validation logic"""
        if self.value and self.value < 0:
            frappe.throw("Value cannot be negative")
    
    def set_defaults(self):
        """Set default values"""
        if not self.status:
            self.status = "Active"
    
    def on_submit(self):
        """Actions on document submit"""
        self.update_related_records()
    
    def update_related_records(self):
        """Update related records"""
        pass
```

### 4. Extending Existing DocTypes

Add custom fields via fixtures in `fixtures/custom_field.json`:

```json
[
  {
    "doctype": "Custom Field",
    "dt": "Sales Invoice",
    "fieldname": "posa_custom_feature",
    "fieldtype": "Link",
    "label": "Custom Feature",
    "options": "POS Custom Feature",
    "insert_after": "customer"
  }
]
```

## Event Hooks

### Backend Hooks

Configure in `hooks.py`:

```python
# Document Events
doc_events = {
    "Sales Invoice": {
        "validate": "posawesome.custom.validate_invoice",
        "on_submit": "posawesome.custom.on_submit_invoice",
        "on_cancel": "posawesome.custom.on_cancel_invoice"
    }
}

# Scheduled Tasks
scheduler_events = {
    "hourly": [
        "posawesome.tasks.hourly_cleanup"
    ],
    "daily": [
        "posawesome.tasks.daily_report"
    ]
}

# Override Whitelisted Methods
override_whitelisted_methods = {
    "frappe.desk.search.search_link": "posawesome.custom.custom_search"
}
```

### Frontend Event Bus

Using the event bus in components:

```javascript
// Emit event
import { evntBus } from '@/plugins/bus'

evntBus.emit('custom-event', {
  data: 'payload'
})

// Listen to event
onMounted(() => {
  evntBus.on('custom-event', handleCustomEvent)
})

onUnmounted(() => {
  evntBus.off('custom-event', handleCustomEvent)
})

const handleCustomEvent = (payload) => {
  console.log('Event received:', payload)
}
```

## API Development

### RESTful Endpoint Pattern

```python
@frappe.whitelist()
def resource_endpoint(action, resource_id=None, **kwargs):
    """
    RESTful-style endpoint
    
    Args:
        action: CRUD action (create, read, update, delete)
        resource_id: Resource identifier
        **kwargs: Additional parameters
    """
    actions = {
        'create': create_resource,
        'read': read_resource,
        'update': update_resource,
        'delete': delete_resource
    }
    
    if action not in actions:
        frappe.throw("Invalid action")
    
    return actions[action](resource_id, **kwargs)
```

### Error Handling

```python
class POSError(Exception):
    """Custom POS exception class"""
    pass

def api_wrapper(func):
    """Decorator for consistent error handling"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except POSError as e:
            frappe.throw(str(e))
        except Exception as e:
            frappe.log_error(frappe.get_traceback(), func.__name__)
            frappe.throw("An error occurred. Please try again.")
    return wrapper

@frappe.whitelist()
@api_wrapper
def safe_operation():
    """Operation with error handling"""
    if not validate_condition():
        raise POSError("Validation failed")
    return process()
```

## Testing

### Backend Testing

Create test file `test_pos_custom_feature.py`:

```python
import unittest
import frappe
from frappe.tests.utils import FrappeTestCase

class TestPOSCustomFeature(FrappeTestCase):
    def setUp(self):
        """Set up test data"""
        self.test_customer = create_test_customer()
        self.test_item = create_test_item()
    
    def test_custom_operation(self):
        """Test custom operation"""
        from posawesome.api.posapp import custom_operation
        
        result = custom_operation("test_param")
        self.assertTrue(result['success'])
        self.assertIsNotNone(result['data'])
    
    def test_validation(self):
        """Test validation logic"""
        doc = frappe.new_doc("POS Custom Feature")
        doc.feature_name = "Test"
        doc.value = -100
        
        with self.assertRaises(frappe.ValidationError):
            doc.save()
    
    def tearDown(self):
        """Clean up test data"""
        frappe.db.rollback()
```

### Frontend Testing

Using Vue Test Utils:

```javascript
import { mount } from '@vue/test-utils'
import CustomFeature from '@/components/CustomFeature.vue'

describe('CustomFeature', () => {
  it('renders properly', () => {
    const wrapper = mount(CustomFeature, {
      props: {
        title: 'Test Feature'
      }
    })
    
    expect(wrapper.find('.custom-feature').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Feature')
  })
  
  it('handles input correctly', async () => {
    const wrapper = mount(CustomFeature)
    const input = wrapper.find('input')
    
    await input.setValue('test value')
    expect(wrapper.vm.inputValue).toBe('test value')
  })
  
  it('processes feature on button click', async () => {
    const wrapper = mount(CustomFeature)
    const button = wrapper.find('button')
    
    await button.trigger('click')
    // Assert API call and response handling
  })
})
```

## Performance Optimization

### Backend Optimization

```python
# Use database queries efficiently
def get_items_optimized(pos_profile):
    """Optimized item fetching with single query"""
    return frappe.db.sql("""
        SELECT 
            i.item_code,
            i.item_name,
            ip.price_list_rate,
            b.actual_qty
        FROM `tabItem` i
        LEFT JOIN `tabItem Price` ip ON i.name = ip.item_code
        LEFT JOIN `tabBin` b ON i.name = b.item_code
        WHERE i.disabled = 0
        AND i.has_variants = 0
        LIMIT 1000
    """, as_dict=True)

# Use caching
@frappe.whitelist()
def get_cached_data(key):
    """Get data with caching"""
    cache_key = f"pos_data_{key}"
    
    # Try cache first
    cached = frappe.cache().get_value(cache_key)
    if cached:
        return cached
    
    # Fetch from database
    data = fetch_from_database(key)
    
    # Store in cache
    frappe.cache().set_value(cache_key, data, expires_in_sec=300)
    
    return data
```

### Frontend Optimization

```javascript
// Use computed properties for derived state
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  
  return items.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Debounce expensive operations
import { debounce } from 'lodash'

const searchItems = debounce(async (query) => {
  const results = await performSearch(query)
  items.value = results
}, 300)

// Lazy load components
const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
)
```

## Debugging

### Backend Debugging

```python
# Enable debug logging
import frappe

def debug_operation():
    frappe.logger().debug(f"Starting operation with user: {frappe.session.user}")
    
    try:
        result = perform_operation()
        frappe.logger().debug(f"Operation successful: {result}")
    except Exception as e:
        frappe.logger().error(f"Operation failed: {str(e)}")
        frappe.log_error(frappe.get_traceback(), "Debug Operation")
        raise

# Use frappe console for debugging
# bench --site [site] console
# >>> frappe.get_doc("Sales Invoice", "ACC-SINV-00001")
```

### Frontend Debugging

```javascript
// Use Vue DevTools
// Install browser extension for Vue.js devtools

// Console logging with context
const debugLog = (message, data = null) => {
  if (import.meta.env.DEV) {
    console.group(`[POS] ${message}`)
    if (data) console.log(data)
    console.trace()
    console.groupEnd()
  }
}

// Component debugging
onMounted(() => {
  debugLog('Component mounted', {
    props: props,
    state: state.value
  })
})
```

## Deployment

### Building for Production

```bash
# Build frontend assets
bench build --app posawesome

# Minify and optimize
NODE_ENV=production bench build --app posawesome

# Clear cache
bench clear-cache

# Restart workers
bench restart
```

### Production Checklist

- [ ] Remove all console.log statements
- [ ] Disable debug mode
- [ ] Configure proper caching
- [ ] Set up error monitoring
- [ ] Configure backup strategy
- [ ] Test payment integrations
- [ ] Verify print formats
- [ ] Check permissions and security
- [ ] Performance testing
- [ ] Documentation updated

## Best Practices

### Code Organization
1. Keep components small and focused
2. Use composition API for new features
3. Follow Frappe's naming conventions
4. Document all API endpoints
5. Write unit tests for critical functions

### Security
1. Always validate input data
2. Use `@frappe.whitelist()` for exposed methods
3. Check permissions before operations
4. Sanitize user inputs
5. Use parameterized queries

### Performance
1. Implement proper caching strategies
2. Optimize database queries
3. Use lazy loading for components
4. Batch API requests when possible
5. Monitor and profile performance

### Error Handling
1. Provide meaningful error messages
2. Log errors for debugging
3. Handle edge cases gracefully
4. Implement retry mechanisms
5. Show user-friendly error messages