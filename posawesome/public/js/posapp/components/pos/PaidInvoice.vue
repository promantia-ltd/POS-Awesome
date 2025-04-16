<template>
    <v-row justify="center">
      <v-dialog v-model="paidDialog" max-width="900px">
        <!-- <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" theme="dark" v-bind="attrs" v-on="on">Open Dialog</v-btn>
        </template>-->
        <v-card variant="flat" color="white">
          <v-card-title>
            <span class="text-h5 text-primary">{{
              __('Load Sales Invoice Items')
              }}</span>
          </v-card-title>
          <v-card-subtitle>
            <span class="text-primary">{{
              __('All the items in the current invoices')
              }}</span>
          </v-card-subtitle>
          <v-card-text class="pa-0">
            <v-container>
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-data-table :headers="headers" :items="dialog_data" item-value="name" class="elevation-1" show-select
                    v-model="selected" select-strategy="single" return-object>
                    <!-- <template v-slot:item.posting_time="{ item }">
                      {{ item.posting_time.split('.')[0] }}
                    </template> -->
                    <template v-slot:item.amount="{ item }">
                      {{ formatCurrency(item.amount) }}
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" theme="dark" @click="close_dialog">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </template>
  
  <script>
  
  import format from '../../format';
  export default {
    mixins: [format],
    data: () => ({
      paidDialog: false,
      singleSelect: true,
      selected: [],
      dialog_data: {},
      headers: [
        {
          title: __('Name'),
          value: 'item_name',
          align: 'start',
          sortable: true,
        },
        {
          title: __('Item Code'),
          align: 'start',
          sortable: true,
          value: 'item_code',
        },
        {
          title: __('Qty'),
          align: 'start',
          sortable: true,
          value: 'qty',
        },
        {
          title: __('UOM'),
          value: 'uom',
          align: 'start',
          sortable: false,
        },
        {
          title: __('Price'),
          value: 'amount',
          align: 'end',
          sortable: false,
        },
      ],
    }),
    watch: {},
    methods: {
      close_dialog() {
        this.paidDialog = false;
      }
    },
    created: function () {
      this.eventBus.on('open_paid', (data) => {
        this.paidDialog = true;
        this.dialog_data = data;
      });
    }
  }
  </script>
  