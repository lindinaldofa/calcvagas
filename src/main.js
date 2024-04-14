import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/lara-light-blue/theme.css';
import './assets/style.css';
import App from './App.vue';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

const app = createApp(App);
app.use(PrimeVue);

app.component('Button', Button);
app.component('InputNumber', InputNumber);
app.component('InputText', InputText);
app.component('Dropdown', Dropdown);

app.mount('#app');