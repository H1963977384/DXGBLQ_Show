<template>
  <div class="page">
    <div class="header">宜家会员活动</div>

    <div class="machine">
      <div
        v-for="(c,i) in capsules"
        :key="i"
        class="capsule"
        :class="c.color"
        :style="{
          transform:`translate(${c.x}px, ${c.y}px)`
        }"
      ></div>

      <div class="hammer" :class="{hit:hammerHit}"></div>
    </div>

    <div class="info">
      剩余 <span>{{chance}}</span> 次机会
    </div>

    <button class="draw" @click="draw" :disabled="rolling">
      {{rolling? '抽奖中...' : '立即抽奖'}}
    </button>

    <div v-if="result" class="result">
      🎉 恭喜获得：{{result}}
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'

const chance = ref(3)
const rolling = ref(false)
const hammerHit = ref(false)
const result = ref('')

const prizes = [
  '188积分',
  '50积分',
  '小礼品',
  '谢谢参与'
]

const MACHINE_W = 320
const MACHINE_H = 200
const BALL = 55

const capsules = ref(createCapsules())

function rand(max){
  return Math.random()*max
}

function createCapsules(){
  const colors=['yellow','red','green','blue']

  return Array.from({length:12}).map(()=>({
    color:colors[Math.floor(Math.random()*4)],
    x:rand(MACHINE_W-BALL),
    y:rand(MACHINE_H-BALL)
  }))
}

function shuffle(){
  capsules.value=capsules.value.map(c=>({
    ...c,
    x:rand(MACHINE_W-BALL),
    y:rand(MACHINE_H-BALL)
  }))
}

function draw(){
  if(chance.value<=0) return

  chance.value--
  rolling.value=true
  result.value=''

  let t=0

  const timer=setInterval(()=>{
    shuffle()
    t++

    if(t>15){
      clearInterval(timer)
      hitHammer()
    }
  },80)
}

function hitHammer(){
  hammerHit.value=true

  setTimeout(()=>{

    const prize=prizes[Math.floor(Math.random()*prizes.length)]

    result.value=prize
    hammerHit.value=false
    rolling.value=false

  },500)
}
</script>

<style scoped>
.page{
  background:#a61919;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  color:white;
  font-family:sans-serif;
}

.header{
  font-size:20px;
  margin:20px;
}

.machine{
  width:320px;
  height:200px;
  background:linear-gradient(#f7b34a,#e8921e);
  border-radius:20px;
  position:relative;
  overflow:hidden;
}

.capsule{
  width:55px;
  height:55px;
  border-radius:50%;
  position:absolute;
  transition:transform .25s;
}

.yellow{background:#ffd400}
.red{background:#b93131}
.green{background:#2f7f55}
.blue{background:#276b8a}

.hammer{
  position:absolute;
  width:10px;
  height:60px;
  background:#ff3b30;
  left:150px;
  top:30px;
  transform:rotate(30deg);
  transform-origin:bottom center;
  transition:transform .3s;
}

.hammer.hit{
  transform:rotate(-40deg);
}

.info{
  margin:20px;
}

.info span{
  background:#7c0d0d;
  padding:4px 10px;
  border-radius:6px;
}

.draw{
  background:#ffd400;
  border:none;
  padding:14px 40px;
  border-radius:30px;
  font-size:16px;
  font-weight:bold;
  cursor:pointer;
}

.result{
  margin-top:20px;
  font-size:18px;
  background:white;
  color:#333;
  padding:10px 20px;
  border-radius:10px;
}
</style>
