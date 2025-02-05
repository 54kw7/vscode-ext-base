<template>
  <div class="deploy">
    <a-form
      ref="formRef"
      :rules="rules"
      :model="form"
      size="large"
      :style="{ width: '600px' }"
      @submit="handleSubmit"
    >
      <a-form-item field="host" label="服务器">
        <a-input v-model="form.host" placeholder="填写服务器ip..." />
        <template #extra>
          <div>项目部署服务器的地址</div>
        </template>
      </a-form-item>
      <a-form-item field="port" label="端口">
        <a-input v-model="form.port" placeholder="填写服务器端口..." />
        <template #extra>
          <div>项目部署服务器的端口</div>
        </template>
      </a-form-item>
      <a-form-item field="username" label="用户名">
        <a-input v-model="form.username" placeholder="填写服务器用户名..." />
        <template #extra>
          <div>项目部署服务器的用户名</div>
        </template>
      </a-form-item>
      <a-form-item field="password" label="密码" validate-trigger="blur">
        <a-input-password v-model="form.password" placeholder="填写服务器密码..." />
        <template #extra>
          <div>项目部署服务器的密码</div>
        </template>
      </a-form-item>
      <a-form-item field="remotePath" label="远程路径">
        <a-input v-model="form.remotePath" placeholder="填写服务器路径..." />
        <template #extra>
          <div>项目部署服务器的路径</div>
        </template>
      </a-form-item>
      <a-form-item field="url" label="URL">
        <a-input v-model="form.url" placeholder="please enter your url..." />
        <template #extra>
          <div>项目访问地址</div>
        </template>
      </a-form-item>
      <a-form-item
        field="options"
        label="Options"
        :rules="[{ type: 'array', minLength: 2, message: 'must select greater than two options' }]"
      >
        <a-checkbox-group v-model="form.embedProjects">
          <a-checkbox value="option one">Section One</a-checkbox>
          <a-checkbox value="option two">Option Two</a-checkbox>
          <a-checkbox value="option three">Option Three</a-checkbox>
          <a-checkbox value="option four">Option Four</a-checkbox>
        </a-checkbox-group>
        <template #extra>
          <div>项目内嵌的关联项目</div>
        </template>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button html-type="submit">Submit</a-button>
          <a-button @click="handleReset">Reset</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    {{ form }}
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  Button,
  Space,
  Form,
  Input,
  InputPassword,
  type FormInstance,
} from '@arco-design/web-vue/es'

const formRef = ref<FormInstance | null>(null)

const form = reactive({
  host: '',
  port: '22',
  password: '',
  username: '',
  remotePath: '',
  url: '',
  embedProjects: [],
})

const rules = {
  name: [
    {
      required: true,
      message: 'name is required',
    },
  ],
  password: [
    {
      required: true,
      message: 'password is required',
    },
  ],
  password2: [
    {
      required: true,
      message: 'password is required',
    },
    {
      validator: (value: string, cb: any) => {
        if (value !== form.password) {
          cb('two passwords do not match')
        } else {
          cb()
        }
      },
    },
  ],
  email: [
    {
      //   type: 'email',
      required: true,
    },
  ],
  ip: [
    {
      //   type: 'ip',
      required: true,
    },
  ],
  url: [
    {
      //   type: 'url',
      required: true,
    },
  ],
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

const handleSubmit = () => {
  console.log('form', form)
}
const handleReset = () => {
  formRef.value?.resetFields() // 使用可选链避免空值错误
}
</script>

<style scoped></style>
