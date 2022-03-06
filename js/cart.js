
// import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.26/vue.esm-browser.min.js';

// 加入vee-validation
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

// 讀取外部的資源檔案-中文字(zh_TW.json)
loadLocaleFromURL('./zh_TW.json');
// Activate the locale 激活語言環境(設定檔案)
configure({
	// 切換成中文版
  generateMessage: localize('zh_TW'),
	// 調整驗證方式(輸入文字時，立即驗證；原先要離開input才驗證)
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});
const apiUrl='https://vue3-course-api.hexschool.io/v2';
const apiPath = 'ldddl';

const app = Vue.createApp({
  data() {
    return {
      cartData:{},
      products:[],
      productId:'',
      isLoadingItem:'', // 局部讀取效果:點擊該品項後，幾秒內按鈕無法再次被點擊
    }
  },
  components: {
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  methods: {
    getProduct(){
      axios.get(`${apiUrl}/api/${apiPath}/products/all`)
        .then((result) => {
          console.log(result);
          this.products = result.data.products;
        }).catch((err) => {
          console.log(err);
        });
    },
    openProductModal(id){ //id，為產品id
      // 利用 refs 取得 product-modal元件，並操作該元件中的方法
      this.productId = id;
      this.$refs.productModal.openModal();
    },
    getCart(){
      axios.get(`${apiUrl}/api/${apiPath}/cart`)
      .then((result) => {
        console.log(result);
        this.cartData = result.data.data;
      }).catch((err) => {
        console.log(err);
      });
    },
    addToCart(id, qty = 1){ // qyt預設值為1
      console.log('addToCart');
      // 加入購物車，依照API文件，必須帶入兩參數
      const data = {
        product_id: id,
        qty, // 同名可縮寫
      };
      this.isLoadingItem = id;
      axios.post(`${apiUrl}/api/${apiPath}/cart`,{ data })
      .then((result) => {
        console.log(result);
        this.getCart();
        this.$refs.productModal.closeModal();
        this.isLoadingItem = '';
      }).catch((err) => {
        console.log(err);
      });
    },
    removeCartItem(id){
      // 刪除品項
      this.isLoadingItem = id;
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
      .then((result) => {
        console.log(result);
        this.getCart();
        this.isLoadingItem = '';
      }).catch((err) => {
        console.log(err);
      });
    },
    updateCartItem(item){
      console.log('updateCartItem');
      // 更新品項，依照API文件，必須帶入兩參數
      const data = {
        product_id: item.id,
        qty: item.qty, 
      };
      this.isLoadingItem = item.id;
      // console.log(`${apiUrl}/api/${apiPath}/cart`,{ data })
      axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`,{ data })
      .then((result) => {
        console.log(result);
        this.getCart();
        this.isLoadingItem = '';
      }).catch((err) => {
        console.log(err);
      });
    },
    clearCart(){
      console.log('clearCart()');
      axios.delete(`${apiUrl}/api/${apiPath}/carts`)
      .then((result) => {
        console.log(result);
        this.getCart();
      }).catch((err) => {
        console.log(err);
      });
    }
  },
  mounted() {
    this.getProduct();
    this.getCart();
  },
});

// 使用refs
// 加入bootstrap Modal實體
app.component('product-modal',{
  props:['id'],
  template: '#userProductModal',
  data(){
    return {
      modal:{},
      product:{},
      qty:1,
    }
  },
  watch:{
    id(){
      // 監控id，當id有任何變動時，產生某行為(getProduct)
      // console.log('watch id()',this.id);
      this.getProduct();
    }
  },
  methods:{
    openModal(){
      this.modal.show();
    },
    closeModal(){
      this.modal.hide();
    },
    getProduct(){
      axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
        .then((result) => {
          console.log(result);
          this.product = result.data.product;
        }).catch((err) => {
          console.log(err);
        });
    },
    addToCart(){
      // console.log(this.qty); //確認有取到qty值
      this.$emit('add-cart',this.product.id,this.qty);
    }    
  },
  mounted(){
    // 利用refs取得DOM元素modal
    this.modal = new bootstrap.Modal(this.$refs.modal);
    console.log('cart');
  }
})

app.mount('#app');