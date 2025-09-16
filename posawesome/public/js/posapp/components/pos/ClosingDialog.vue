<template>
  <v-dialog v-model="closingDialog" max-width="800px" persistent>
    <v-card rounded="xl" elevation="8">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4 enhanced-modal-header">
        <span class="text-h6 font-weight-bold text-primary">
          {{ __('Closing POS Shift') }}
        </span>
        <v-btn icon="mdi-close" variant="text" @click="close_dialog"></v-btn>
      </v-card-title>

      <v-divider></v-divider>
      <v-card-text class="px-6 py-4">
        <v-data-table
          :headers="headers"
          :items="dialog_data.payment_reconciliation"
          item-key="mode_of_payment"
          class="rounded-lg elevation-1"
          :items-per-page="itemsPerPage"
          density="comfortable"
          hide-default-footer
        >
          <template v-slot:item.opening_amount="{ item }">
            <span class="font-mono">
              {{ currencySymbol(pos_profile.currency) }}
              {{ formatCurrency(item.opening_amount) }}
            </span>
          </template>

          <template v-slot:item.expected_amount="{ item }">
            <span class="font-mono">
              {{ currencySymbol(pos_profile.currency) }}
              {{ formatCurrency(item.expected_amount) }}
            </span>
          </template>

          <template v-slot:item.closing_amount="props">
            <v-confirm-edit v-model:return-value="props.item.closing_amount">
              <span class="font-mono">
                {{ currencySymbol(pos_profile.currency) }}
                {{ formatCurrency(props.item.closing_amount) }}
              </span>
              <template v-slot:input>
                <v-text-field
                  v-model="props.item.closing_amount"
                  type="number"
                  density="compact"
                  variant="outlined"
                  :rules="[max25chars]"
                  hide-details
                />
              </template>
            </v-confirm-edit>
          </template>

          <template v-slot:item.difference="{ item }">
            <span
              :class="{
                'text-success': item.expected_amount - item.closing_amount === 0,
                'text-error': item.expected_amount - item.closing_amount !== 0
              }"
              class="font-mono"
            >
              {{ currencySymbol(pos_profile.currency) }}
              {{
                (item.difference = formatCurrency(
                  item.expected_amount - item.closing_amount
                ))
              }}
            </span>
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="px-6 py-4 enhanced-modal-header">
        <v-spacer />
        <v-btn variant="text" color="grey-darken-1" @click="close_dialog">
          {{ __('Close') }}
        </v-btn>
        <v-btn variant="elevated" color="primary" @click="submit_dialog">
          {{ __('Submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>

import format from '../../format';
export default {
  mixins: [format],
  data: () => ({
    closingDialog: false,
    itemsPerPage: 20,
    dialog_data: {},
    pos_profile: '',
    headers: [
      {
        title: __('Mode of Payment'),
        value: 'mode_of_payment',
        align: 'start',
        sortable: true,
      },
      {
        title: __('Opening Amount'),
        align: 'end',
        sortable: true,
        value: 'opening_amount',
      },
      {
        title: __('Closing Amount'),
        value: 'closing_amount',
        align: 'end',
        sortable: true,
      },
    ],
    max25chars: (v) => v.length <= 20 || 'Input too long!', // TODO : should validate as number
    pagination: {},
  }),
  watch: {},

  methods: {
    close_dialog() {
      this.closingDialog = false;
    },
    submit_dialog() {
      this.eventBus.emit('submit_closing_pos', this.dialog_data);
      this.closingDialog = false;
    },
  },

  created: function () {
    this.eventBus.on('open_ClosingDialog', (data) => {
      this.closingDialog = true;
      this.dialog_data = data;
    });
    this.eventBus.on('register_pos_profile', (data) => {
      this.pos_profile = data.pos_profile;
      if (!this.pos_profile.hide_expected_amount) {
        this.headers.push({
          title: __('Expected Amount'),
          value: 'expected_amount',
          align: 'end',
          sortable: false,
        });
        this.headers.push({
          title: __('Difference'),
          value: 'difference',
          align: 'end',
          sortable: false,
        });
      }
    });
  },
};
</script>

<style scoped>
.enhanced-modal-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem;
}
</style>