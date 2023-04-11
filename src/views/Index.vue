<script setup>
import { version } from '../../package.json'
import { useRouter } from 'vue-router'
import { useMainStore } from '../stores/main'

// Components
import MultiSelect from 'vue-multiselect'
import Soj from '../components/interface/Soj.vue'

// Router
const router = useRouter()

// Stores
const main = useMainStore()
</script>

<template>
  <!-- Wrapper -->
  <div class="flex flex-col items-center mb-20 text-white">
    <!-- Logo & title -->
    <div class="flex items-center mt-20 relative">
      <img class="h-20 w-20" draggable="false" src="/logo.svg"/>
      <h1 class="font-bold text-4xl">Aqua Resolver</h1>
      <h2 class="absolute bottom-0 right-0 text-lg">v{{ version }}</h2>
    </div>

    <!-- Interface -->
    <div class="mt-8" style="width:33vw">
      <h1 class="font-bold text-3xl text-center">Interface</h1>

      <!-- Your interface component below -->
      <Soj/>
      <!-- Your interface component above -->
    </div>

    <!-- Fetch meta data button -->
    <div class="mt-8">
      <button @click="main.fetchMetaData">Fetch Meta Data</button>
    </div>

    <!-- Interface message -->
    <div v-html="main.interfaceMsg" class="font-bold mt-4 text-center text-lg"/>

    <!-- Settings -->
    <div class="mt-8" style="width:33vw">
      <h1 class="font-bold text-3xl text-center">Settings</h1>

      <!-- Contest name -->
      <h2 class="mt-4">Contest name</h2>
      <input
        v-model="main.contestName"
        placeholder="Input contest name"
        type="text"
      />

      <!-- Start time -->
      <h2 class="mt-4">Start time</h2>
      <input v-model="main.startTime" type="datetime-local"/>

      <!-- End time -->
      <h2 class="mt-4">End time</h2>
      <input v-model="main.endTime" type="datetime-local"/>

      <!-- Frozen start time -->
      <h2 class="mt-4">Frozen start time</h2>
      <input v-model="main.frozenStartTime" type="datetime-local"/>

      <!-- Gold medal count -->
      <h2 class="mt-4">Gold medal count</h2>
      <input v-model="main.goldNum" type="number"/>

      <!-- Silver medal count -->
      <h2 class="mt-4">Silver medal count</h2>
      <input v-model="main.silverNum" type="number"/>

      <!-- Bronze medal count -->
      <h2 class="mt-4">Bronze medal count</h2>
      <input v-model="main.bronzeNum" type="number"/>

      <!-- Team filter -->
      <h2 class="mt-4">Team Filter</h2>
      <MultiSelect
        v-model="main.teamFilter"
        :clear-on-select="false"
        :close-on-select="false"
        :multiple="true"
        :options="['Official', 'Unofficial', 'Girl']"
        :searchable="false"
        :show-labels="true"
        :taggable="true"
        class="w-full"
        open-direction="bottom"
      />

      <!-- School filter -->
      <h2 class="mt-4">School Filter</h2>
      <MultiSelect
        v-model="main.schoolFilter"
        :clear-on-select="false"
        :close-on-select="false"
        :hide-selected="true"
        :multiple="true"
        :options="main.schoolOptions"
        :searchable="false"
        :show-labels="true"
        :taggable="true"
        class="w-full"
        open-direction="bottom"
      />

      <!-- Mode -->
      <h2 class="mt-4">Mode</h2>
      <MultiSelect
        v-model="main.mode"
        :close-on-select="true"
        :options="['Regular', 'Global']"
        :searchable="false"
        :show-labels="true"
        class="w-full"
        open-direction="bottom"
      />

      <!-- Buttons -->
      <div class="mt-4 text-center">
        <button 
          @click="main.preprocess"
          :disabled="main.preprocessDisable"
        >Start Preprocessing</button>
        <button
          @click="router.push('/rank')"
          :disabled="main.resolveDisable"
        >Start Resolving</button>
      </div>

      <!-- Message -->
      <div v-html="main.settingsMsg" class="font-bold mt-4 text-center text-lg"/>
    </div>

    <!-- Settings -->
  </div>
</template>

<style lang="postcss" scoped>
button {
  @apply border-2 border-solid border-white
         font-bold mx-4 p-2 rounded-lg
         disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white
         hover:bg-white hover:text-blue-500
}

input {
  @apply outline-none p-2 rounded-md text-black w-full
}
</style>
