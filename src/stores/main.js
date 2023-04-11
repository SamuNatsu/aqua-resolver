/* Main store */
import { defineStore } from 'pinia'
import _ from 'lodash'

export const useMainStore = defineStore('main', {
  state: ()=>({
    // Meta data
    contestName: '',
    startTime: '',
    endTime: '',
    frozenStartTime: '',
    schoolOptions: [],
    teamMap: new Map(),
    problemList: [],
    solutionList: [],
    // Filter data
    teamFilter: ['Official', 'Unofficial', 'Girl'],
    schoolFilter: [],
    // UI
    interfaceMsg: '',
    settingsMsg: '<span class="text-yellow-300">Please fetch meta data first</span>',
    preprocessDisable: true,
    resolveDisable: true,
    // Resolve
    rank: null,
    finalStatus: null,
    focusTeam: null,
    // External action
    fetchMetaData: ()=>{}
  }),
  actions: {
    dump() {
      console.log(this.$state)
    },
    fetchMetaFinished() {
      this.settingsMsg = ''
      this.preprocessDisable = false
    },
    preprocess() {
      this.settingsMsg = '<span>Proprocessing...</span>'
      try {
        const { final, frozen } = this.genStatus()

        this.rank = this.genRank(frozen)
        this.finalStatus = final
        this.settingsMsg = '<span>Done.</span>'
        this.resolveDisable = false
        console.log(frozen)
      } catch (err) {
        console.error(err)
        this.settingsMsg = `<span class="text-red-500">${err.message}</span>`
      }
    },
    async startResolve() {
      const delay = (t)=>new Promise((resolve)=>{
        setInterval(resolve, t)
      })

      for (let i = this.rank.length - 1; i >= 0; i--) {
        this.focusTeam = this.rank[i].teamKey
        await delay(1000)

        for (let j = 0; j < this.problemList.length; j++) {
          if (this.rank[i].status[j].result === 'frozen') {
            this.rank[i].status[j].result = 'pending'
            await delay(1000)

            const nStatus = this.finalStatus.get(this.rank[i].teamKey)[j]
            this.rank[i].status[j] = nStatus
            if (['first_blood', 'accepted'].includes(nStatus.result)) {
              this.rank[i].solved++
              this.rank[i].penalty = 0
              this.rank[i].status
                .filter((v)=>['first_blood', 'accepted'].includes(v.result))
                .forEach((v)=>this.rank[i].penalty += v.penalty)

              await delay(500)
              this.reRank()
              await delay(600)
              i++
              this.focusTeam = null
              break
            }
          }
        }
      }

      this.focusTeam = null
    },
    genStatus() {
      const ret1 = new Map(), ret2 = new Map()
      const fb1 = [], fb2 = []

      this.solutionList
        .filter((v)=>{
          const team = this.teamMap.get(v.teamKey)
          return this.teamFilter.includes(team.kind) && this.schoolFilter.includes(team.school)
        })
        .forEach((v)=>{
          const pidx = this.problemList.indexOf(v.problemId)

          if (!ret1.has(v.teamKey)) {
            let tmp = []
            for (let i = 0; i < this.problemList.length; ++i)
              tmp.push({
                result: 'none',
                tries: 0,
                frozenTries: 0,
                penalty: 0
              })
            ret1.set(v.teamKey, tmp)
          }
          if (!ret2.has(v.teamKey)) {
            let tmp = []
            for (let i = 0; i < this.problemList.length; ++i)
              tmp.push({
                result: 'none',
                tries: 0,
                frozenTries: 0,
                penalty: 0
              })
            ret2.set(v.teamKey, tmp)
          }
          const cur1 = ret1.get(v.teamKey)[pidx], cur2 = ret2.get(v.teamKey)[pidx]

          if (v.result === 'AC') {
            if (!['first_blood', 'accepted'].includes(cur1.result)) {
              if (fb1.includes(v.problemId))
                cur1.result = 'accepted'
              else {
                fb1.push(v.problemId)
                cur1.result = 'first_blood'
              }
              cur1.tries++
              cur1.penalty += new Date(v.inDate).getTime() - new Date(this.startTime).getTime()
            }

            if (new Date(v.inDate).getTime() < new Date(this.frozenStartTime).getTime()) {
              if (!['first_blood', 'accepted'].includes(cur2.result)) {
                if (fb2.includes(v.problemId))
                  cur2.result = 'accepted'
                else {
                  fb2.push(v.problemId)
                  cur2.result = 'first_blood'
                }
                cur2.tries++
                cur2.penalty += new Date(v.inDate).getTime() - new Date(this.startTime).getTime()
              }
            } else if (!['first_blood', 'accepted'].includes(cur2.result)) {
              cur2.result = 'frozen'
              cur2.frozenTries++
            }
          } else {
            if (!['first_blood', 'accepted'].includes(cur1.result)) {
              cur1.result = 'wrong_answer'
              cur1.tries++
              cur1.penalty += 1200000
            }

            if (new Date(v.inDate).getTime() < new Date(this.frozenStartTime).getTime()) {
              if (!['first_blood', 'accepted'].includes(cur2.result)) {
                cur2.result = 'wrong_answer'
                cur2.tries++
                cur2.penalty += 1200000
              }
            } else if (!['first_blood', 'accepted'].includes(cur2.result)) {
              cur2.result = 'frozen'
              cur2.frozenTries++
            }
          }
        })

      return { final: ret1, frozen: ret2 }
    },
    genRank(status) {
      const ret = []
      status.forEach((v, k)=>{
        let solved = 0, penalty = 0
        v.filter((v)=>['first_blood', 'accepted'].includes(v.result)).forEach((v)=>{
          solved++
          penalty += v.penalty
        })
        ret.push({
          teamKey: k,
          name: this.teamMap.get(k).name,
          school: this.teamMap.get(k).school,
          solved,
          penalty,
          status: v.map((v, idx)=>({
            ...v,
            id: idx
          }))
        })
      })

      ret.sort((a, b)=>{
        if (a.solved !== b.solved)
          return b.solved - a.solved
        else if (a.penalty !== b.penalty)
          return a.penalty - b.penalty
        else if (a.name !== b.name)
          return a.name < b.name ? -1 : 1
        else 
          return a.school < b.school ? -1 : 1
      })

      let lstRnkIdx = -1, lstRnk = 1, stp = 1
      ret.forEach((v, idx, ref)=>{
        const team = this.teamMap.get(v.teamKey)
        if (team.kind === 'Unofficial') {
          ref[idx].rank = -1
          return
        }

        if (lstRnkIdx === -1) {
          ref[idx].rank = 1
        } else {
          if (v.solved !== ref[lstRnkIdx].solved || v.penalty !== ref[lstRnkIdx].penalty)
            lstRnk = stp
          ref[idx].rank = lstRnk
        }
        lstRnkIdx = idx
        stp++
      })

      return ret
    },
    reRank() {
      const ret = _.cloneDeep(this.rank)

      ret.sort((a, b)=>{
        if (a.solved !== b.solved)
          return b.solved - a.solved
        else if (a.penalty !== b.penalty)
          return a.penalty - b.penalty
        else if (a.name !== b.name)
          return a.name < b.name ? -1 : 1
        else 
          return a.school < b.school ? -1 : 1
      })

      let lstRnkIdx = -1, lstRnk = 1, stp = 1
      ret.forEach((v, idx, ref)=>{
        const team = this.teamMap.get(v.teamKey)
        if (team.kind === 'Unofficial') {
          ref[idx].rank = -1
          return
        }

        if (lstRnkIdx === -1) {
          ref[idx].rank = 1
        } else {
          if (v.solved !== ref[lstRnkIdx].solved || v.penalty !== ref[lstRnkIdx].penalty)
            lstRnk = stp
          ref[idx].rank = lstRnk
        }
        lstRnkIdx = idx
        stp++
      })

      this.rank = ret
    }
  },
  persist: {
    paths: [
      'contestName', 'startTime', 'endTime', 'frozenStartTime', 'schoolOptions',
      'teamFilter', 'schoolFilter', 
      'settingsMsg', 'preprocessDisable'
    ]
  }
})
