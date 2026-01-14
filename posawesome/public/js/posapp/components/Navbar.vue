<template>
  <nav>
    <v-app-bar density="compact"  class="modern-header" elevation="1">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="modern-nav-icon"></v-app-bar-nav-icon>
      <v-toolbar-title @click="go_desk" class="stylish-brand">
        <div class="brand-container">
          <span class="brand-pos indian-style">POS</span>
          <span class="brand-mati indian-style">MATI</span>
        </div>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <div class="user-profile d-flex align-center px-3 py-1">
        <v-icon size="18" class="mr-2">mdi-account-circle</v-icon>
        <span class="user-name">
          {{ pos_profile.name || 'User' }}
        </span>
      </div>
      <div class="text-center">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn class="menu-button" variant="text" v-bind="props">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-card class="mx-auto" max-width="300">
            <v-list v-model="menu_item" color="primary">

              <v-list-item @click="close_shift_dialog" v-if="!pos_profile.posa_hide_closing_shift && item == 0">
                <template v-slot:prepend>
                  <v-icon icon="mdi-content-save-move-outline"></v-icon>
                </template>

                <v-list-item-title>{{
                  __('Close Shift')
                }}</v-list-item-title>

              </v-list-item>
              <v-list-item @click="print_last_invoice" v-if="
                pos_profile.posa_allow_print_last_invoice &&
                this.last_invoice
              ">
                <template v-slot:prepend>
                  <v-icon icon="mdi-printer"></v-icon>
                </template>

                <v-list-item-title>{{
                  __('Print Last Invoice')
                }}</v-list-item-title>

              </v-list-item>
              <v-divider class="my-0"></v-divider>
              <v-list-item @click="logOut">
                <template v-slot:prepend>
                  <v-icon icon="mdi-logout"></v-icon>
                </template>

                <v-list-item-title>{{ __('Logout') }}</v-list-item-title>

              </v-list-item>
              <v-list-item @click="go_about">
                <template v-slot:prepend>
                  <v-icon icon="mdi-information-outline"></v-icon>
                </template>

                <v-list-item-title>{{ __('About') }}</v-list-item-title>

              </v-list-item>

            </v-list>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" v-model:mini-variant="mini" class="modern-sidebar" width="280" temporary>
      <!-- Company Header Section -->
      <div class="sidebar-header">
        <div class="company-info">
          <v-avatar size="48" class="company-avatar">
            <v-img :src="company_img"></v-img>
          </v-avatar>
          <div class="company-details">
            <div class="company-name">{{ company }}</div>
            <div class="company-type">Point of Sale</div>
          </div>
        </div>
      </div>
      
      <v-divider class="sidebar-divider"></v-divider>
      
      <!-- Navigation Menu -->
      <v-list class="navigation-list">
        <div class="menu-section">
          <v-list-item v-for="item in items" :key="item.text" @click="changePage(item.text)" class="nav-item">
            <template v-slot:prepend>
              <div class="nav-icon-container">
                <v-icon :icon="item.icon" class="nav-icon"></v-icon>
              </div>
            </template>

            <v-list-item-title class="nav-text">
              {{ item.text }}
            </v-list-item-title>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-snackbar v-model="snack" :timeout="5000" :color="snackColor" location="top right">
      {{ snackText }}
    </v-snackbar>
    <v-dialog v-model="freeze" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5">
          {{ freezeTitle }}
        </v-card-title>
        <v-card-text>{{ freezeMsg }}</v-card-text>
      </v-card>
    </v-dialog>
  </nav>
</template>

<script>

export default {
  // components: {MyPopup},
  data() {
    return {
      drawer: false,
      mini: true,
      item: 0,
      items: [{ text: 'POS', icon: 'mdi-network-pos' },{ text: 'Debug', icon: 'mdi-bug' },],
      page: '',
      fav: true,
      menu: false,
      message: false,
      hints: true,
      menu_item: 0,
      snack: false,
      snackColor: '',
      snackText: '',
      company: 'POS Awesome',
      company_img: '/assets/erpnext/images/erpnext-logo.svg',
      pos_profile: '',
      freeze: false,
      freezeTitle: '',
      freezeMsg: '',
      last_invoice: '',
    };
  },
  methods: {
    changePage(key) {
      this.$emit('changePage', key);
      this.drawer = false;
    },
    go_desk() {
      frappe.set_route('/');
      location.reload();
    },
    go_about() {
      const win = window.open(
        'https://github.com/promantia-ltd/POS-Awesome',
        '_blank'
      );
      win.focus();
    },
    close_shift_dialog() {
      this.eventBus.emit('open_closing_dialog');
    },
    show_message(data) {
      this.snack = true;
      this.snackColor = data.color;
      this.snackText = data.title;
    },
    logOut() {
      var me = this;
      me.logged_out = true;
      return frappe.call({
        method: 'logout',
        callback: function (r) {
          if (r.exc) {
            return;
          }
          frappe.set_route('/login');
          location.reload();
        },
      });
    },
    print_last_invoice() {
      if (!this.last_invoice) return;
      const print_format =
        this.pos_profile.print_format_for_online ||
        this.pos_profile.print_format;
      const letter_head = this.pos_profile.letter_head || 0;
      const url =
        frappe.urllib.get_base_url() +
        '/printview?doctype=Sales%20Invoice&name=' +
        this.last_invoice +
        '&trigger_print=1' +
        '&format=' +
        print_format +
        '&no_letterhead=' +
        letter_head;
      const printWindow = window.open(url, 'Print');
      printWindow.addEventListener(
        'load',
        function () {
          printWindow.print();
        },
        true
      );
    },
    onInvoiceCreated(data) {
    console.log('invoice_created received:', data);
    } ,
  },
  beforeUnmount() {
  this.eventBus.off('invoice_created', this.onInvoiceCreated);
  },
  created: function () {
    this.$nextTick(function () {
      this.eventBus.on('show_message', (data) => {
        console.log("GOT Something: <s>")
        this.show_message(data);
      });
      this.eventBus.on('set_company', (data) => {
        this.company = data.name;
        this.company_img = data.company_logo
          ? data.company_logo
          : this.company_img;
      });
      this.eventBus.on('register_pos_profile', (data) => {
        this.pos_profile = data.pos_profile;
        const payments = { text: 'Payments', icon: 'mdi-cash-register' };
        if (
          this.pos_profile.posa_use_pos_awesome_payments &&
          !this.items.find(item => item.text === 'Payments')
        ) {
          this.items.push(payments);
        }
      });
      this.eventBus.on('set_last_invoice', (data) => {
        this.last_invoice = data;
      });
      this.eventBus.on('invoice_created',this.onInvoiceCreated);
      this.eventBus.on('freeze', (data) => {
        this.freeze = true;
        this.freezeTitle = data.title;
        this.freezeMsg = data.msg;
      });
      this.eventBus.on('unfreeze', () => {
        this.freeze = false;
        this.freezTitle = '';
        this.freezeMsg = '';
      });
    });
  },
};
</script>

<style scoped>
/* Modern Header Styles */
.modern-header {
  border-bottom: 1px solid #e2e8f0 !important;
  backdrop-filter: blur(10px);
  padding: 0 1rem;
  height: 72px;
  max-height: 72px;
  ;
}

.modern-nav-icon {
  color: #64748b !important;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modern-nav-icon:hover {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
}

/* Elegant Brand Title Styling */
.stylish-brand {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 0;
  background: none;
  border: none;
  box-shadow: none;
  height: auto !important;
  line-height: normal !important;
}

.stylish-brand:hover {
  transform: none;
}

.brand-container {
  display: flex;
  align-items: baseline;
  gap: 6px;
  position: relative;
  height: auto;
  padding: 4px 0;
}

.brand-container::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--brand-underline);
  border-radius: 2px;
  opacity: 0.8;
}

.brand-pos {
  font-family: var(--brand-font-latin);
  background: var(--brand-gradient-dark);
  font-size: 1.7rem;
  font-weight: 600;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  position: relative;
  line-height: 1;
  vertical-align: baseline;
}

.brand-mati {
  font-family: var(--brand-font-devanagari);
  background: var(--brand-gradient-colorful);
  font-size: 1.7rem;
  font-weight: 600;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  line-height: 1;
  vertical-align: baseline;
}

.user-info {
  font-weight: 500;
  font-size: 0.95rem;
  color:#334155;
}


.user-chip {
  height: 36px;
  font-weight: 500;
  border-radius: 18px;
}

.menu-button {
  color: #64748b !important;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-button:hover {
  background-color: #f1f5f9 !important;
  color: #334155 !important;
}

/* Modern Sidebar Styles */
.modern-sidebar {
  background: var(--sidebar-bg) !important;
  border-right: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

.sidebar-header {
  padding: 24px 20px 20px 20px;
  background: var(--sidebar-header-bg);
}

.company-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.company-avatar {
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.company-details {
  flex: 1;
}

.company-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.company-type {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}

.sidebar-divider {
  border-color: #e2e8f0 !important;
  margin: 0 !important;
}

.navigation-list {
  padding: 16px 0 !important;
}

.menu-section {
  margin-bottom: 8px;
}

.nav-item {
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-height: 48px !important;
  padding: 8px 16px !important;
}

.nav-item:hover {
  background-color: var(--hover-bg) !important;
  transform: translateX(2px);
}

.nav-item.v-list-item--active {
   background: var(--active-gradient) !important;
  color: white !important;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.nav-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: #f1f5f9;
  transition: all 0.2s ease;
}

.nav-item:hover .nav-icon-container {
   background-color: var(--hover-bg-dark);
}

.nav-item.v-list-item--active .nav-icon-container {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.nav-icon {
  color: #64748b !important;
  font-size: 18px !important;
  transition: all 0.2s ease;
}

.nav-item:hover .nav-icon {
  color: #334155 !important;
}

.nav-item.v-list-item--active .nav-icon {
  color: white !important;
}

.nav-text {
  font-weight: 500 !important;
  color: #334155 !important;
  font-size: 0.95rem !important;
  margin-left: 12px;
  transition: all 0.2s ease;
}

.nav-item.v-list-item--active .nav-text {
  color: white !important;
  font-weight: 600 !important;
}

/* Remove old workaround styles - keep functionality but improve aesthetics */
.v-navigation-drawer .v-list-item-title {
  color: inherit !important;
}

.v-navigation-drawer .v-icon {
  color: inherit !important;
}

.user-profile {
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background-color: #ffffff;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #334155;
}

</style>

