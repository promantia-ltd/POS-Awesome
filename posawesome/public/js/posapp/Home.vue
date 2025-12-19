<template>
  <v-app class="container1">
    <v-main>
      <Navbar @changePage="setPage($event)"></Navbar>
      <!--DEV BANNER(UI)-->
      <v-card class="pa-2 mb-2" outlined>
      <strong>DEV BANNER</strong><br />
      Page:{{ page }}<br />
      User:{{ currentUser }}<br />
      Last Action:{{ formattedLastActionTime }}
      </v-card>
      <component v-bind:is="page" class="mx-4 md-4"></component>
    </v-main>
  </v-app>
</template>

<script>
import Navbar from './components/Navbar.vue';
import POS from './components/pos/Pos.vue';
import Payments from './components/payments/Pay.vue';

export default {
  data: function () {
    return {
      page: 'POS',
      lastActionTime:null,
      currentUser:'',
    };
  },
  components: {
    Navbar,
    POS,
    Payments,
  },
  methods: {
    setPage(page) {
      this.page = page;
    },
    remove_frappe_nav() {
      this.$nextTick(function () {
        $('.page-head').remove();
        $('.navbar.navbar-default.navbar-fixed-top').remove();
      });
    },
  },
  mounted() {
    this.remove_frappe_nav();
    if(window.frappe && frappe.session){
      this.currentUser=frappe.session.user;
    }
  },
  updated() { },
  created: function () {
    setTimeout(() => {
      this.remove_frappe_nav();
    }, 1000);
  },
  computed:{
    formattedLastActionTime(){
      if(!this.lastActionTime){
        return '--';
      }
      return this.lastActionTime.toLocaleString();
    }
  },
  watch:{
    page(newPage, oldPage){
      console.log('Page changed from', oldPage, 'to', newPage)
      this.lastActionTime=new Date();
    }
  }
};
</script>

<style scoped>
.container1 {
  margin-top: 0px;
  height: 100vh;
}
</style>
