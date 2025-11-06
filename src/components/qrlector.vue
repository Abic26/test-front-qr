<template>
  <div class="min-h-screen flex flex-col items-center p-4 sm:p-6 relative">
    <!-- Overlay de cargando -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-black/60 flex flex-col justify-center items-center z-50"
    >
      <div class="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
      <p class="text-white mt-3 text-sm sm:text-base">Procesando...</p>
    </div>

    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
      🧠 Decodificador QR JD Eléctricos
    </h1>
    <select
      v-model="selectedUser"
      class="p-2 border-amber-1000 border-2 rounded-lg bg-[#222] text-white text-sm sm:text-base"
    >
      <option
        class="bg-[#333]"
        v-for="user in asesor"
        :key="user.code"
        :value="user.code"
      >
        {{ user.name }}
      </option>
    </select>

    <div
      class="shadow-lg rounded-xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg text-center"
    >
      <input
        type="file"
        accept="imagen/*"
        @change="handleFile"
        class="w-full mb-4 p-2 border border-gray-300 rounded-lg cursor-pointer text-sm sm:text-base"
      />

      <button
        v-if="file"
        @click="processImage"
        class="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
      >
        Analizar y Decodificar
      </button>

      <div class="p-5" v-if="infoImg">{{ res }}</div>

      <div v-if="decodedText" class="mt-6 text-left sm:text-center">
        <h2 class="text-base sm:text-lg font-semibold">Resultado:</h2>
        <p
          class="mt-2 bg-gray-200 p-3 rounded-lg text-gray-800 break-all text-sm sm:text-base"
          v-if="infoImg"
        >
          {{ decodedText }}
        </p>
      </div>

      <p
        v-if="errorMessage"
        class="text-red-600 mt-4 text-sm sm:text-base text-center"
      >
        {{ errorMessage }}
      </p>

      <div
        class="flex flex-col sm:flex-row justify-center gap-2 mt-4 w-full sm:w-auto"
      >
        <button
          @click="saveDecodedText"
          v-if="file"
          class="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Guardar Datos
        </button>

        <button
          v-if="file"
          class="w-full sm:w-auto bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
          @click="uploadImage"
        >
          Guardar Imagen
        </button>
      </div>

      <!-- Elementos ocultos -->
      <canvas ref="canvasRef" class="hidden"></canvas>
      <img ref="imgRef" class="hidden" @load="onImageLoaded" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import jsQR from "jsqr";
import { BrowserQRCodeReader } from "@zxing/browser";
import QrScanner from "qr-scanner";

const infoImg = ref(false);
const res = ref("");
const selectedUser = ref("");
const file = ref(null);
const imgRef = ref(null);
const canvasRef = ref(null);
const decodedText = ref("");
const errorMessage = ref("");
const isLoading = ref(false); // 🟢 NUEVO: estado cargando

const asesor = ref([
  { name: "Seleccione Asesor", code: "" },
  { name: "Dianie", code: "Dianie" },
  { name: "Isabela", code: "Modelo" },
  { name: "Johanna", code: "Johanna" },
  { name: "Japs", code: "Japs" },
  { name: "Juan", code: "Juan" },
  { name: "Nicolas", code: "Nicolas" },
  { name: "William", code: "William" },
]);

// === 1️⃣ Cargar archivo ===
const handleFile = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  file.value = f;
  decodedText.value = "";
  errorMessage.value = "";
  imgRef.value.src = URL.createObjectURL(f);
};

// === 2️⃣ Preprocesamiento ===
const onImageLoaded = () => {
  const img = imgRef.value;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");

  const base = 800;
  const scale = Math.max(base / img.naturalWidth, base / img.naturalHeight, 1);
  canvas.width = img.naturalWidth * scale;
  canvas.height = img.naturalHeight * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrasted = gray > 128 ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = contrasted;
  }
  ctx.putImageData(imageData, 0, 0);
};

// === 3️⃣ Decodificación robusta ===
const processImage = async () => {
  infoImg.value = false;
  if (!file.value) {
    errorMessage.value = "Selecciona una imagen primero.";
    return;
  }

  const formData = new FormData();
  formData.append("image", file.value);
  formData.append("user", selectedUser.value);

  isLoading.value = true; // 🟢 Mostrar cargando
  try {
    const response = await fetch("https://test-back-qr.vercel.app/api/qr/decode-qr", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      decodedText.value = data.data;
      res.value = `✅ QR decodificado: ${data.data}`;
      infoImg.value = true;
    } else {
      errorMessage.value = data.error || "No se pudo leer el código QR.";
    }
  } catch (err) {
    console.error("Error enviando imagen:", err);
    errorMessage.value = "Error de conexión con el servidor.";
  } finally {
    isLoading.value = false; // 🟢 Ocultar cargando
  }
};

// === Guardar texto decodificado ===
const saveDecodedText = async () => {
  if (!decodedText.value) {
    errorMessage.value = "No hay texto decodificado para guardar.";
    return;
  }

  isLoading.value = true; // 🟢
  try {
    const response = await fetch("https://test-back-qr.vercel.app/api/strings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        string: decodedText.value,
        user: selectedUser.value,
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Datos guardados correctamente.");
      res.value = `✅ String guardado:\n${decodedText.value}`;
      infoImg.value = true;
    } else {
      alert("Error al guardar los datos.");
      errorMessage.value = data.error;
    }
  } catch (err) {
    console.error("⚠️ Error al enviar string:", err);
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false; // 🟢
  }
};

// === 4️⃣ Subir imagen al backend ===
const uploadImage = async () => {
  if (!file.value) {
    errorMessage.value = "Primero selecciona una imagen.";
    return;
  }

  isLoading.value = true; // 🟢
  try {
    const formData = new FormData();
    formData.append("image", file.value);
    formData.append("user", selectedUser.value);

    const response = await fetch("https://test-back-qr.vercel.app/api/upload", {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("El backend no devolvió JSON válido.");
    }

    if (data.success) {
      alert("Imagen guardada correctamente.");
      res.value = `✅ Imagen subida:\n${data.link}`;
      infoImg.value = true;
    } else {
      alert("Error al guardar la imagen.");
      res.value = `❌ Error al subir la imagen: ${data.error}`;
      infoImg.value = true;
    }
  } catch (err) {
    console.error("⚠️ Error al subir imagen:", err);
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false; // 🟢
  }
};
</script>
