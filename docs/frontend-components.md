# Frontend Components Documentation

## Overview
POS Awesome uses Vue.js 3 with Composition API and Vuetify 3 for UI components. The application follows a component-based architecture with event-driven communication.

## Component Architecture

### Root Component

#### `Home.vue`
Main application wrapper that manages navigation and component switching.

**Props:** None

**Data:**
- `page`: Current page/component to display
- `pos_profile`: Active POS profile
- `isOpeningDialogOpen`: Opening dialog visibility

**Methods:**
- `change_page(page_name)`: Switches between components
- `closeOpeningDialog()`: Handles opening dialog closure

**Events:**
- Emits: `page-changed`
- Listens: `open-closing-dialog`, `show-returns`

## POS Interface Components

### `Pos.vue`
Central POS interface that coordinates all POS operations.

**Props:**
- `pos_profile`: POS profile configuration

**Composition:**
```javascript
const invoiceData = ref({
  items: [],
  customer: null,
  payments: [],
  taxes: []
})

const itemsView = ref('cards') // 'cards' or 'list'
const currentView = ref('items') // 'items', 'payments', 'offers', 'coupons'
```

**Key Features:**
- Responsive column layout
- View switching (items/payments/offers)
- Real-time totals calculation
- Keyboard shortcuts support

### `ItemsSelector.vue`
Product catalog display with search and filtering.

**Props:**
- `pos_profile`: POS profile configuration
- `items`: Array of available items

**Features:**
```vue
<template>
  <!-- Search Bar -->
  <v-text-field
    v-model="searchQuery"
    @input="debouncedSearch"
    append-icon="mdi-barcode-scan"
    @click:append="scanBarcode"
  />
  
  <!-- View Toggle -->
  <v-btn-toggle v-model="viewMode">
    <v-btn value="cards">Cards</v-btn>
    <v-btn value="list">List</v-btn>
  </v-btn-toggle>
  
  <!-- Items Display -->
  <component :is="currentViewComponent" 
    :items="filteredItems"
    @item-selected="addToCart"
  />
</template>
```

**Methods:**
- `searchItems(query)`: Search by name/barcode/serial
- `filterByGroup(group)`: Filter by category
- `addToCart(item)`: Add item to invoice
- `scanBarcode()`: Barcode scanner integration

### `Invoice.vue`
Shopping cart and invoice management.

**Props:**
- `invoice`: Current invoice object
- `editable`: Enable/disable editing

**Structure:**
```vue
<template>
  <v-card>
    <!-- Customer Section -->
    <customer-selector 
      v-model="invoice.customer"
      @change="updateCustomerDetails"
    />
    
    <!-- Items List -->
    <invoice-items 
      :items="invoice.items"
      @update="updateItem"
      @remove="removeItem"
    />
    
    <!-- Totals Section -->
    <invoice-totals 
      :subtotal="subtotal"
      :taxes="taxes"
      :discount="discount"
      :total="grandTotal"
    />
  </v-card>
</template>
```

**Computed Properties:**
- `subtotal`: Sum of all items
- `taxAmount`: Calculated taxes
- `grandTotal`: Final amount after taxes/discounts

## Payment Components

### `Payments.vue`
Payment method selection and processing.

**Props:**
- `invoice`: Invoice to process
- `paymentMethods`: Available payment methods

**Template:**
```vue
<template>
  <v-dialog v-model="dialog" max-width="800">
    <!-- Payment Methods -->
    <v-row>
      <v-col v-for="method in paymentMethods">
        <v-card @click="selectMethod(method)">
          <v-card-title>{{ method.name }}</v-card-title>
          <v-text-field 
            v-model="method.amount"
            type="number"
            :label="currency"
          />
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Summary -->
    <payment-summary 
      :total="invoiceTotal"
      :paid="paidAmount"
      :balance="balance"
    />
    
    <!-- Actions -->
    <v-btn @click="processPayment" 
      :disabled="!isValid">
      Complete Payment
    </v-btn>
  </v-dialog>
</template>
```

### `Pay.vue`
Individual payment processing interface.

**Props:**
- `method`: Payment method object
- `amount`: Amount to pay
- `currency`: Currency symbol

**Features:**
- Amount validation
- Reference number input
- Change calculation
- Payment confirmation

## Customer Components

### `Customer.vue`
Customer selection and management.

**Props:**
- `value`: Selected customer
- `editable`: Enable selection

**Template:**
```vue
<template>
  <v-autocomplete
    v-model="selectedCustomer"
    :items="customers"
    :search-input.sync="search"
    item-text="customer_name"
    item-value="name"
    label="Customer"
    clearable
    @change="onCustomerChange"
  >
    <template v-slot:append-outer>
      <v-btn icon @click="createNewCustomer">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>
    
    <template v-slot:item="{ item }">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>{{ item.customer_name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ item.mobile_no }} | Points: {{ item.loyalty_points }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>
```

**Methods:**
- `searchCustomers()`: Search customers
- `createNewCustomer()`: Quick customer creation
- `loadCustomerDetails()`: Fetch full customer info

## Shift Management Components

### `OpeningDialog.vue`
POS shift opening interface.

**Props:**
- `pos_profile`: POS profile to open

**Data Structure:**
```javascript
const openingData = ref({
  pos_profile: '',
  company: '',
  balance_details: [
    {
      mode_of_payment: 'Cash',
      opening_amount: 0
    }
  ]
})
```

**Validation:**
```javascript
const canOpen = computed(() => {
  return openingData.value.pos_profile && 
         openingData.value.balance_details.every(d => 
           d.opening_amount >= 0
         )
})
```

### `ClosingDialog.vue`
End of shift reconciliation.

**Props:**
- `shift`: Current shift to close

**Features:**
```vue
<template>
  <v-dialog fullscreen>
    <!-- Sales Summary -->
    <shift-summary 
      :sales="shiftSales"
      :returns="shiftReturns"
      :net="netAmount"
    />
    
    <!-- Payment Reconciliation -->
    <payment-reconciliation
      v-for="payment in payments"
      :expected="payment.expected"
      :counted="payment.counted"
      :difference="payment.difference"
    />
    
    <!-- Closing Notes -->
    <v-textarea
      v-model="closingNotes"
      label="Closing Notes"
    />
    
    <v-btn @click="closeShift">
      Close Shift
    </v-btn>
  </v-dialog>
</template>
```

## Specialized Components

### `Returns.vue`
Return/refund processing interface.

**Props:**
- `pos_profile`: Active POS profile

**Process Flow:**
```javascript
// 1. Search original invoice
const searchInvoice = async (invoiceNo) => {
  const invoice = await getInvoice(invoiceNo)
  validateReturnEligibility(invoice)
}

// 2. Select items to return
const selectReturnItems = (items) => {
  return items.map(item => ({
    ...item,
    qty: -Math.abs(item.qty),
    is_return: true
  }))
}

// 3. Process return
const processReturn = async () => {
  const returnInvoice = createReturnInvoice()
  await submitInvoice(returnInvoice)
}
```

### `Drafts.vue`
Draft invoice management.

**Features:**
- List saved drafts
- Resume draft editing
- Delete drafts
- Auto-save functionality

### `PosOffers.vue`
Promotional offers interface.

**Props:**
- `invoice`: Current invoice
- `offers`: Available offers

**Offer Types:**
```javascript
const offerTypes = {
  QUANTITY: 'Buy X Get Y',
  AMOUNT: 'Spend X Save Y',
  PERCENTAGE: 'X% Off',
  REPLACEMENT: 'Product Swap'
}
```

### `PosCoupons.vue`
Coupon validation and application.

**Template:**
```vue
<template>
  <v-card>
    <v-card-title>Apply Coupon</v-card-title>
    
    <v-text-field
      v-model="couponCode"
      label="Coupon Code"
      @keyup.enter="validateCoupon"
    />
    
    <v-alert v-if="couponDetails" type="success">
      {{ couponDetails.description }}
      Discount: {{ couponDetails.discount }}
    </v-alert>
    
    <v-btn @click="applyCoupon" 
      :disabled="!couponValid">
      Apply Coupon
    </v-btn>
  </v-card>
</template>
```

## Utility Components

### `ItemCard.vue`
Product card display component.

**Props:**
- `item`: Item object
- `showImage`: Display product image
- `showStock`: Display stock quantity

**Template:**
```vue
<template>
  <v-card @click="$emit('select', item)">
    <v-img v-if="showImage" :src="item.image" height="150" />
    
    <v-card-title>{{ item.item_name }}</v-card-title>
    
    <v-card-subtitle>
      {{ item.item_code }} | {{ formatCurrency(item.rate) }}
    </v-card-subtitle>
    
    <v-chip v-if="showStock" :color="stockColor">
      Stock: {{ item.actual_qty }}
    </v-chip>
  </v-card>
</template>
```

### `NumPad.vue`
Numeric keypad for touch interfaces.

**Props:**
- `value`: Current value
- `decimal`: Allow decimal input

**Events:**
- `input`: Value changed
- `enter`: Enter pressed
- `clear`: Clear pressed

### `VariantSelector.vue`
Product variant selection dialog.

**Props:**
- `item`: Parent item
- `variants`: Available variants

**Features:**
- Attribute-based filtering
- Matrix view for combinations
- Stock availability display

## Event Communication

### Event Bus Pattern
All components communicate through a central event bus:

```javascript
// Emitting events
import { evntBus } from '@/plugins/bus'

evntBus.emit('add-item', { item, qty: 1 })

// Listening to events
onMounted(() => {
  evntBus.on('add-item', handleAddItem)
})

onUnmounted(() => {
  evntBus.off('add-item', handleAddItem)
})
```

### Common Events

| Event Name | Description | Payload |
|------------|-------------|---------|
| `add-item` | Add item to cart | `{ item, qty }` |
| `remove-item` | Remove from cart | `{ index }` |
| `update-customer` | Customer changed | `{ customer }` |
| `open-payments` | Show payment dialog | `{ invoice }` |
| `process-payment` | Submit payment | `{ payments }` |
| `print-invoice` | Print receipt | `{ invoice }` |
| `open-drawer` | Open cash drawer | `{}` |

## Styling and Theming

### Vuetify Theme Configuration
```javascript
const vuetify = createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      }
    }
  }
})
```

### Custom CSS Classes
```css
/* POS specific styles */
.pos-item-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.pos-item-card:hover {
  transform: scale(1.05);
}

.pos-cart-item {
  border-bottom: 1px solid #e0e0e0;
}

.pos-total-row {
  font-weight: bold;
  font-size: 1.2em;
}
```

## Performance Optimization

### Component Lazy Loading
```javascript
const PosOffers = defineAsyncComponent(() => 
  import('./components/PosOffers.vue')
)
```

### Virtual Scrolling
For large item lists:
```vue
<v-virtual-scroll
  :items="items"
  :item-height="80"
  height="600"
>
  <template v-slot:default="{ item }">
    <item-card :item="item" />
  </template>
</v-virtual-scroll>
```

### Memoization
```javascript
const filteredItems = computed(() => {
  return useMemo(() => 
    items.value.filter(item => 
      item.name.includes(search.value)
    ), [items.value, search.value]
  )
})
```

## Best Practices

1. **Always use Composition API for new components**
2. **Implement proper loading states**
3. **Handle errors gracefully with try-catch**
4. **Use Vuetify components for consistency**
5. **Implement proper cleanup in `onUnmounted`**
6. **Use computed properties for derived state**
7. **Debounce search inputs**
8. **Validate props with proper types**