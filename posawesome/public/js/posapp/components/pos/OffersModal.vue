<template>
  <v-dialog v-model="dialog" max-width="900" persistent>
    <v-card class="enhanced-modal-card">
      <v-card-title class="enhanced-modal-header">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon class="mr-2" size="24" color="primary">mdi-sale</v-icon>
            <span class="text-h6 font-weight-bold">{{ __('Available Offers') }}</span>
          </div>
          <v-btn icon variant="text" @click="closeModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <!-- Offers List -->
        <div class="enhanced-list-section">
          <div v-if="!pos_offers.length" class="enhanced-empty-state">
            <v-icon size="48" color="grey-lighten-1">mdi-sale</v-icon>
            <div class="enhanced-empty-state-title">No Offers Available</div>
            <div class="enhanced-empty-state-description">
              No promotional offers are currently available for this transaction.
            </div>
          </div>
          
          <v-data-table 
            v-else
            :headers="items_headers" 
            :items="pos_offers" 
            :single-expand="singleExpand"
            v-model:expanded="expanded" 
            show-expand 
            item-key="row_id" 
            class="enhanced-offers-table"
            :items-per-page="itemsPerPage"
            hide-default-footer>
            
            <template v-slot:item.offer_applied="{ item }">
              <v-checkbox 
                v-model="item.offer_applied"
                color="primary"
                hide-details
                :disabled="(item.offer == 'Give Product' &&
                  !item.give_item &&
                  (!offer.replace_cheapest_item || !offer.replace_item)) ||
                  (item.offer == 'Grand Total' &&
                    discount_percentage_offer_name &&
                    discount_percentage_offer_name != item.name)"
                @change="forceUpdateItem">
              </v-checkbox>
            </template>
            
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon class="mr-2" size="20" color="primary">mdi-tag</v-icon>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-grey-darken-1" v-if="item.offer_type">{{ item.offer_type }}</div>
                </div>
              </div>
            </template>
            
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" class="enhanced-expanded-row">
                <v-card variant="tonal" class="ma-2">
                  <v-card-text>
                    <v-row>
                      <v-col v-if="item.description" cols="12" md="8">
                        <div class="text-body-2 mb-2 font-weight-medium text-primary">Description:</div>
                        <div class="text-body-2" v-html="handleNewLine(item.description)"></div>
                      </v-col>
                      <v-col v-if="item.offer == 'Give Product'" cols="12" md="4">
                        <v-autocomplete 
                          v-model="item.give_item" 
                          :items="get_give_items(item)" 
                          item-title="item_code"
                          variant="outlined" 
                          density="compact" 
                          color="primary" 
                          label="Select Gift Item" 
                          :disabled="item.apply_type != 'Item Group' ||
                            item.replace_item ||
                            item.replace_cheapest_item">
                        </v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </td>
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
          @click="applyOffers">
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
    pos_offers: [],
    itemsPerPage: 1000,
    singleExpand: true,
    expanded: [],
    discount_percentage_offer_name: null,
    offer: {},
    items_headers: [
      { title: 'Offer Name', key: 'name', align: 'start' },
      { title: 'Offer Type', key: 'offer_type', align: 'start' },
      { title: 'Conditions', key: 'conditions', align: 'start' },
      { title: 'Apply', key: 'offer_applied', align: 'center' },
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
    
    applyOffers() {
      // Apply offers logic here
      this.eventBus.emit('apply_offers', this.pos_offers);
      this.closeModal();
    },
    
    forceUpdateItem() {
      // Force update logic here
    },
    
    get_give_items(item) {
      // Return available gift items
      return [];
    },
    
    handleNewLine(text) {
      return text ? text.replace(/\n/g, '<br>') : '';
    }
  },

  created: function () {
    this.eventBus.on("register_pos_profile", (data) => {
      this.pos_profile = data.pos_profile;
    });
    
    this.eventBus.on("set_offers", (data) => {
      this.pos_offers = data;
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

.enhanced-list-section {
  min-height: 400px;
}

.enhanced-offers-table {
  border-radius: 12px;
  overflow: hidden;
}

.enhanced-expanded-row {
  background: #f8fafc !important;
  padding: 0 !important;
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