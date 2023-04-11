<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '../stores/main'

// Components
import TeamPodium from '../components/TeamPodium.vue'
import TeamRow from '../components/TeamRow.vue'

// Router
const router = useRouter()

// Stores
const main = useMainStore()

// Actions
const scrollToButtom = (callback)=>{
  const startY = scrollY
  const diff = document.documentElement.scrollHeight - innerHeight
  const duration = 5000
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
const onKeyUp = (e)=>{
  switch (e.code) {
    case 'Escape':
      router.push('/')
      break
    case 'Enter':
      new Promise((resolve)=>{
        scrollToButtom(resolve)
      }).then(main.startResolve)
      break
  }
}

// Life cycle
onMounted(()=>{
  if (main.rank === null)
    router.push('/')

  scrollTo(0, 0)

  document.body.classList.add('hide-scrollbar')
  document.addEventListener('keyup', onKeyUp)
})
onUnmounted(()=>{
  document.body.classList.remove('hide-scrollbar')
  document.removeEventListener('keyup', onKeyUp)
})
</script>

<template>
  <!-- Podium -->
  <TeamPodium/>

  <TransitionGroup name="list">
    <TeamRow
      v-for="(i, idx) in main.rank"
      :key="i.teamKey"
      :team-key="i.teamKey"
      :rank="i.rank"
      :name="i.name"
      :school="i.school"
      :solved="i.solved"
      :penalty="i.penalty"
      :status="i.status"
      :class="{'bg-blue-900': idx % 2 === 0, 'bg-blue-950': idx % 2 === 1}"
    />
  </TransitionGroup>
</template>

<style lang="postcss" scoped>
.list-move {
  @apply duration-700 transition-all z-50
}
</style>
