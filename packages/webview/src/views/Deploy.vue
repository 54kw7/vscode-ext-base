<template>
  <div class="deploy">
    <a-spin :loading="pageLoading">
      <a-form
        ref="formRef"
        :rules="rules"
        :model="form"
        size="large"
        layout="horizontal"
        @submit="handleSubmit"
      >
        <a-form-item field="script" label="构建命令">
          <a-select
            v-model="form.script"
            placeholder="选择构建命令..."
            :options="buildScripts"
            allow-clear
          >
          </a-select>
          <template #extra>
            <div>{{ buildCommand }}</div>
          </template>
        </a-form-item>
        <a-form-item field="buildArgs" label="构建参数">
          <a-input v-model="form.args" placeholder="填写构建参数..." allow-clear />
          <template #extra>
            <div>非必填，构建参数</div>
          </template>
        </a-form-item>
        <a-form-item field="host" label="服务器">
          <a-input v-model="form.host" placeholder="填写服务器ip..." allow-clear />
          <template #extra>
            <div>项目部署服务器的地址</div>
          </template>
        </a-form-item>
        <a-form-item field="port" label="端口">
          <a-input v-model="form.port" placeholder="填写服务器端口，默认22..." allow-clear />
          <template #extra>
            <div>项目部署服务器的端口</div>
          </template>
        </a-form-item>
        <a-form-item field="username" label="用户名">
          <a-input v-model="form.username" placeholder="填写服务器用户名..." allow-clear />
          <template #extra>
            <div>项目部署服务器的用户名</div>
          </template>
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password v-model="form.password" placeholder="填写服务器密码..." />
          <template #extra>
            <div>项目部署服务器的密码</div>
          </template>
        </a-form-item>
        <a-form-item field="remotePath" label="远程路径">
          <a-input v-model="form.remotePath" placeholder="填写远程路径..." allow-clear>
            <template #prepend> /alidata/server/vue/ </template></a-input
          >
          <template #extra>
            <div>项目部署的服务器路径</div>
          </template>
        </a-form-item>
        <a-form-item field="url" label="访问地址">
          <a-input v-model="form.url" placeholder="填写项目访问地址..." allow-clear />
          <template #extra>
            <div>项目访问地址</div>
          </template>
        </a-form-item>
        <a-form-item field="embedProjects" label="关联项目">
          <a-checkbox-group v-model="form.embedProjects" :options="embedProjects">
          </a-checkbox-group>
          <template #extra>
            <div>项目内嵌的关联项目</div>
          </template>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button html-type="submit">打包+部署</a-button>
            <a-button @click="handleReset">重置</a-button>
            <!-- <a-button html-type="submit">部署</a-button> -->
          </a-space>
        </a-form-item>
      </a-form>
      {{ form }}
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, computed, onMounted } from 'vue'
import {
  Button,
  Space,
  Form,
  Input,
  InputPassword,
  Spin,
  type FormInstance,
} from '@arco-design/web-vue/es'
import { useHandlers } from '@/hooks'

const handlers = useHandlers()

const pageLoading = ref(true)

const formRef = ref<FormInstance | null>(null)

const buildScripts = ref<string[]>([])

const buildCommand = computed(() => {
  return form.script ? `npm run ${form.script}` : ''
})

const form = reactive({
  script: 'build:prod',
  args: '',
  host: '',
  port: '6666',
  password: '',
  username: 'web',
  remotePath: 'test',
  url: 'http://www.baidu.com',
  embedProjects: [],
})

const rules = {
  script: [
    {
      required: true,
      message: '构建命令必填',
    },
  ],
  host: [
    {
      required: true,
      message: '服务器地址必填',
    },
    {
      type: 'ip' as const,
      message: 'IP格式不正确',
    },
  ],
  //   port: [
  //     {
  //       required: true,
  //       message: '端口必填',
  //     },
  //   ],
  username: [
    {
      required: true,
      message: '用户名必填',
    },
  ],
  password: [
    {
      required: true,
      message: '密码必填',
    },
    // {
    //   validator: (value: string, cb: any) => {
    //     if (value !== form.password) {
    //       cb('two passwords do not match')
    //     } else {
    //       cb()
    //     }
    //   },
    // },
  ],
  remotePath: [
    {
      required: true,
      message: '远程部署路径必填',
    },
  ],
  url: [
    {
      type: 'url' as const,
      required: true,
    },
  ],
  embedProjects: [{ type: 'array' as const, message: '需要是array' }],
  match: [
    {
      required: true,
      validator: (value: string, cb: (arg0: string) => void) => {
        return new Promise<void>((resolve) => {
          if (!value) {
            cb('Please enter match')
          }
          if (value !== 'match') {
            cb('match must be match!')
          }
          resolve()
        })
      },
    },
  ],
}

const embedProjects = [
  { label: '龙江PDF', value: 'project2' },
  { label: '高校手签', value: 'project3' },
  { label: '龙江职称工单', value: 'project4' },
  { label: '龙江职称微信', value: 'project1' },
  { label: '龙江一件事工单', value: 'project5' },
  { label: '那曲职称', value: 'project6' },
]

const handleSubmit = async ({ values, errors }: { values: any; errors: any }) => {
  if (!errors) {
    pageLoading.value = true
    const formData = toRaw(values)
    console.log('values:', formData)
    try {
      await handlers.execUpload(formData)
    } catch (error) {
      console.error('Failed to load build scripts:', error)
    } finally {
      pageLoading.value = false
    }
  }
}
const handleReset = () => {
  formRef.value?.resetFields()
}

onMounted(async () => {
  pageLoading.value = true
  try {
    buildScripts.value = await handlers.getBuildScript()
    console.log('🚀 ~ buildScripts ~ buildScripts:', buildScripts.value)
  } catch (error) {
    console.error('Failed to load build scripts:', error)
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped></style>
