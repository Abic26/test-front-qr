<template>
  <div class="min-h-screen p-6">
    <h2 class="text-2xl font-bold mb-6 text-center">📋 Registros Guardados</h2>

    <div v-if="loading" class="text-center text-gray-600">Cargando datos...</div>

    <table
      v-else
      class="min-w-full overflow-hidden"
    >
      <thead class="">
        <tr>
          <th class="py-2 px-3 text-center border border-gray-500 text-sm font-semibold">ID</th>
          <th class="py-2 px-3 text-center border border-gray-500 text-sm font-semibold">Fecha</th>
          <th class="py-2 px-3 text-center border border-gray-500 text-sm font-semibold">Hora</th>
          <th class="py-2 px-3 text-center border border-gray-500 text-sm font-semibold">Asesor</th>
          <th class="py-2 px-3 text-center border border-gray-500 text-sm font-semibold">String</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in registros"
          :key="item.id"
          class="transition"
        >
          <td class="py-2 px-3 text-sm border border-gray-500 text-left">{{ item.id }}</td>
          <td class="py-2 px-3 text-sm border border-gray-500 text-left">{{ item.fecha }}</td>
          <td class="py-2 px-3 text-sm border border-gray-500 text-left">{{ item.hora }}</td>
          <td class="py-2 px-3 text-sm border border-gray-500 text-left">{{ item.user }}</td>
          <td class="py-2 px-3 text-sm border border-gray-500 text-left break-all">{{ item.string }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="error" class="text-red-600 mt-4 text-center">
      ⚠️ {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const registros = ref([]);
const loading = ref(false);
const error = ref("");

// === Obtener registros del backend ===
const fetchRegistros = async () => {
  loading.value = true;
  error.value = "";

  try {
    const res = await fetch("https://test-back-1mgdeyf27-abic26s-projects.vercel.app/api/strings");
    const data = await res.json();

    if (data.success) {
      registros.value = data.data;
    } else {
      error.value = data.error || "Error al obtener registros.";
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRegistros);
</script>

<style scoped>
table {
  border-collapse: collapse;
}

</style>
