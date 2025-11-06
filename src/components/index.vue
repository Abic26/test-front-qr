<template>
  <div>
    <button @click="componente_actual = 'qrlector'" class="btn btn-outline-primary me-2" type="button">Lector QR</button>
    <button @click="componente_actual = 'registros'" class="btn btn-outline-success me-2" type="button">Registros</button>
    <component :is="componentes[componente_actual]" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import qrlector from "./qrlector.vue";
import registros from "./registros.vue";

const componente_actual = ref("qrlector");

const componentes = {
  qrlector,
  registros,
};
</script>
