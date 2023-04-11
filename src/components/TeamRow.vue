<script setup>
import { computed, ref, watch } from 'vue'
import { useMainStore } from '../stores/main'

// Components
import TeamStatus from './TeamStatus.vue'

// Properties
const props = defineProps({
  rank: Number,
  teamKey: String,
  name: String,
  school:String,
  solved: Number,
  penalty: Number,
  status: Array
});

// Stores
const main = useMainStore()

// Reactive
const el = ref(null)
const dynClass = ref(['border-l-0'])

// Computed
const gridColStyle = computed(()=>{
  return {
    gridTemplateColumns: `repeat(${props.status.length}, 1fr)`
  }
})
const rankText = computed(()=>{
  return props.rank === -1 ? '*' : `#${props.rank}`
})
const penaltyText = computed(()=>{
  return Math.round(props.penalty / 60000)
})

// Actions
const scrollToElement = (element, callback)=>{
  const startY = scrollY
  const diff = element.getBoundingClientRect().top - innerHeight + element.getBoundingClientRect().height
  const duration = 500
  const easeFn = (x)=>x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2

  let start = null
  const step = (tms)=>{
    if (start === null)
      start = tms

    const elapse = tms - start
    const percent = Math.min(elapse / duration, 1)
    const easePct = easeFn(percent, 0, 1, 1)

    scrollTo(0, startY + diff * easePct)
    if (elapse < duration)
      requestAnimationFrame(step)
    else if (typeof callback === 'function')
      callback()
  }

  requestAnimationFrame(step)
}

// Watch
watch(
  ()=>main.focusTeam,
  ()=>{
    if (main.focusTeam === props.teamKey) {
      dynClass.value = ['border-l-4', 'border-green-400']
      scrollToElement(el.value)
    } else {
      dynClass.value = ['border-l-0']
    }
  }
)
</script>

<template>
  <div class="flex items-center py-4 border-solid transition-all" :class="dynClass" ref="el">
    <div class="font-bold text-center text-white w-24">{{ rankText }}</div>

    <div class="flex flex-col flex-grow">
      <div class="flex justify-between text-white">
        <div class="flex w-1/2">
          <div class="font-bold w-1/2">{{ name }}</div>
          <div>{{ school }}</div>
        </div>
        <div class="flex flex-grow justify-end text-center">
          <div class="w-1/4">{{ solved }}</div>
          <div class="w-1/4">{{ penaltyText }}</div>
        </div>
      </div>
      <div class="flex-grow grid" :style="gridColStyle">
        <TeamStatus
          v-for="i in status"
          :key="i.id"
          :result="i.result"
          :tries="i.tries"
          :frozen-tries="i.frozenTries"
          :penalty="i.penalty"
        />
      </div>
    </div>
  </div>
</template>
