<template>
  <v-row justify="center">
    <v-dialog v-model="paidDialog" max-width="900px">
      <v-card class="rounded-xl shadow-lg" elevation="8" rounded="xl">
        <v-card-title>
          <span class="text-h5 text-primary">
            {{ __('Load Sales Invoice Items') }}
          </span>
        </v-card-title>

        <v-card-subtitle>
          <span class="text-primary">
            {{ __('All the items in the current invoices') }}
          </span>
        </v-card-subtitle>

        <v-card-text class="pa-0">
          <v-container>
            <v-row no-gutters>
              <v-col cols="12" class="pa-1">
                <v-data-table
                  :headers="headers"
                  :items="paginatedItems"
                  item-value="name"
                  class="elevation-1"
                  show-select
                  v-model="selected"
                  select-strategy="single"
                  return-object
                  hide-default-footer
                >
                  <template v-slot:item.amount="{ item }">
                    {{ formatCurrency(item.amount) }}
                  </template>

                  <template v-slot:bottom>
                    <div class="text-center compact-pagination">
                      <span class="text-caption page-info">
                        {{ paginatedItems.length ? ((page - 1) * itemsPerPage + 1) : 0 }} -
                        {{ Math.min(page * itemsPerPage, dialog_data.length) }}
                        of {{ dialog_data.length }}
                      </span>
                      <v-pagination
                        :total-visible="5"
                        v-model="page"
                        :length="pageCount"
                        density="compact"
                        size="small"
                      />
                    </div>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey-darken-1"  theme="dark" @click="close_dialog">
            Close
          </v-btn>
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
      page: 1,
      itemsPerPage: 5,
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
    computed: {
    pageCount() {
      return Math.ceil(this.dialog_data.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.dialog_data.slice(start, end);
    },
  },
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
  