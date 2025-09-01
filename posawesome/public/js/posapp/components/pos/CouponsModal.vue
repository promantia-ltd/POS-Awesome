<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card class="enhanced-modal-card">
      <v-card-title class="enhanced-modal-header">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon class="mr-2" size="24" color="primary">mdi-ticket-percent-outline</v-icon>
            <span class="text-h6 font-weight-bold">{{ __('Manage Coupons') }}</span>
          </div>
          <v-btn icon variant="text" @click="closeModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <!-- Add Coupon Section -->
        <div class="enhanced-add-section mb-4">
          <v-row no-gutters align="center" class="mb-3">
            <v-col cols="8">
              <v-text-field 
                density="compact" 
                variant="outlined" 
                color="primary" 
                label="Enter Coupon Code"
                placeholder="Type or scan coupon code..."
                bg-color="white" 
                hide-details 
                v-model="new_coupon" 
                prepend-inner-icon="mdi-ticket-outline"
                @keydown.enter="add_coupon(new_coupon)">
              </v-text-field>
            </v-col>
            <v-col cols="4" class="pl-2">
              <v-btn 
                block
                color="success" 
                variant="elevated"
                @click="add_coupon(new_coupon)"
                :disabled="!new_coupon"
                class="enhanced-add-btn">
                <v-icon class="mr-1">mdi-plus</v-icon>
                {{ __('Apply Coupon') }}
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Coupons List -->
        <div class="enhanced-list-section">
          <div v-if="!posa_coupons.length" class="enhanced-empty-state">
            <v-icon size="48" color="grey-lighten-1">mdi-ticket-outline</v-icon>
            <div class="enhanced-empty-state-title">No Coupons Applied</div>
            <div class="enhanced-empty-state-description">
              Add coupon codes above to apply discounts and offers to this transaction.
            </div>
          </div>
          
          <v-data-table 
            v-else
            :headers="items_headers" 
            :items="posa_coupons" 
            :single-expand="singleExpand"
            v-model:expanded="expanded" 
            item-key="coupon" 
            class="enhanced-coupons-table"
            :items-per-page="itemsPerPage"
            hide-default-footer>
            <template v-slot:item.applied="{ item }">
              <v-chip 
                :color="item.applied ? 'success' : 'grey'" 
                :variant="item.applied ? 'elevated' : 'tonal'"
                size="small">
                {{ item.applied ? 'Applied' : 'Not Applied' }}
              </v-chip>
            </template>
            <template v-slot:item.coupon="{ item }">
              <div class="d-flex align-center">
                <v-icon class="mr-2" size="20" color="primary">mdi-ticket</v-icon>
                <span class="font-weight-medium">{{ item.coupon }}</span>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
      
      <v-card-actions class="enhanced-modal-actions">
        <v-spacer></v-spacer>
        <v-btn 
          color="grey-darken-1" 
          variant="text" 
          @click="closeModal"
          class="mr-2">
          Cancel
        </v-btn>
        <v-btn 
          color="primary" 
          variant="elevated" 
          @click="applyCoupons">
          Apply & Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  
  data: () => ({
    loading: false,
    pos_profile: '',
    customer: '',
    posa_coupons: [],
    new_coupon: null,
    itemsPerPage: 1000,
    singleExpand: true,
    expanded: [],
    items_headers: [
      { title: 'Coupon', key: 'coupon', align: 'start' },
      { title: 'Type', key: 'coupon_type', align: 'start' },
      { title: 'Offer', key: 'offer', align: 'start' },
      { title: 'Applied', key: 'applied', align: 'center' },
    ],
  }),

  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },

  methods: {
    closeModal() {
      this.dialog = false;
    },
    
    applyCoupons() {
      // Apply coupons logic here
      this.closeModal();
    },
    
    add_coupon(coupon_code) {
      if (!coupon_code) return;
      
      // Add coupon logic here
      this.eventBus.emit('add_coupon', coupon_code);
      this.new_coupon = null;
    }
  },

  created: function () {
    this.eventBus.on("register_pos_profile", (data) => {
      this.pos_profile = data.pos_profile;
    });
    
    this.eventBus.on("set_coupons", (data) => {
      this.posa_coupons = data;
    });
  },
};
</script>

<style scoped>
.enhanced-modal-card {
  border-radius: 16px;
  overflow: hidden;
}

.enhanced-modal-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem;
}

.enhanced-add-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.enhanced-add-btn {
  text-transform: none !important;
  font-weight: 600;
}

.enhanced-list-section {
  min-height: 300px;
}

.enhanced-coupons-table {
  border-radius: 12px;
  overflow: hidden;
}

.enhanced-modal-actions {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
}

.enhanced-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
}

.enhanced-empty-state-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #475569;
  margin: 1rem 0 0.5rem 0;
}

.enhanced-empty-state-description {
  font-size: 0.9rem;
  color: #64748b;
  max-width: 300px;
  line-height: 1.5;
}
</style>