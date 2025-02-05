<script setup lang="ts">
import { useWebviewPublicPath, useHandlers } from '@/hooks'
import { RouterLink, RouterView } from 'vue-router'
import { Button, Space } from '@arco-design/web-vue/es'

import logPath from '@/assets/logo.svg'

import HelloWorld from './components/HelloWorld.vue'
import { ref } from 'vue'

const handlers = useHandlers()

const logoUrl = useWebviewPublicPath(logPath)

const onViewPanelOpen = () => {
  handlers.execCommand('panel-view-container.show')
}
const theme = ref('')
const onclick = async () => {
  // const themes = handlers.getThemes();
  const scripts =await handlers.getBuildScript()
  console.log('🚀 ~ onclick ~ scripts:', scripts)
  console.log('🚀 ~ onclick ~ themes:', theme)
  handlers.showInformationMessage('人生如逆旅，我亦是行人')
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" :src="logoUrl" width="125" height="125" />
    <a-space>
      <a-button type="primary" @click="onViewPanelOpen">open panel view</a-button>
      <a-button @click="handlers.showInformationMessage('hello ext')">Secondary</a-button>
      <a-button type="dashed" @click="onclick">Dashed</a-button>
      <a-button type="outline">Outline</a-button>
      <a-button type="text">Text</a-button>
    </a-space>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/deploy">Deploy</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
