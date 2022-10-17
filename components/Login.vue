<template>
    <el-divider content-position="center">填入个人信息(仅作本地缓存)</el-divider>
    <div class="user-infos-box">
        <el-form label-position="right" label-width="100px" ref="ruleFormRef" :model="userInfos">
            <el-form-item v-for="(values, index) in Object.values(userInfos)" :label="values.label"
                          :prop="`${Object.keys(userInfos)[index]}.value`" :rules="values.rules">
                <el-input v-if="values.rules[0].type=='number'"
                          v-model.number="userInfos[Object.keys(userInfos)[index]].value" />
                <el-input v-else v-model="userInfos[Object.keys(userInfos)[index]].value" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitInfos(ruleFormRef)">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts" setup>
import { ElMessage, ElNotification, FormInstance } from 'element-plus';
import { IuserInfos } from '~~/types/types';
import localForage from '~~/utils/localForage';

const props = defineProps({
    isLogin: {
        type: Boolean,
        default: false
    },
    userInfos: {
        type: Object,
        default: null
    }
});

const userInfosKey = "studentInfos"
const userInfos = ref<IuserInfos>(props.userInfos as (IuserInfos | null) || {
    school: {
        label: "学校",
        value: '湖南工业大学',
        rules: [
            {
                type: "string",
                required: true,
            }
        ]
    }, college: {
        label: "学院",
        value: '包装与材料工程学院',
        rules: [
            {
                type: 'string',
                required: true
            }
        ]
    }, professional: {
        label: "专业",
        value: '印刷工程',
        rules: [
            {
                type: 'string',
                required: true
            }
        ]
    }, class: {
        label: "班级",
        value: 1903,
        rules: [
            {
                type: 'number',
                required: true
            }
        ]
    }, id: {
        label: "学号",
        value: 19404010099,
        rules: [
            {
                type: 'number',
                required: true
            }
        ]
    }, name: {
        label: "姓名",
        value: '潘伟龙',
        rules: [
            {
                type: 'string',
                required: true
            }
        ]
    }


});
const isLogin = ref(props.isLogin)
const emits = defineEmits(["isLoginHandle"])
// 用户最后提交表单时的验证
const ruleFormRef = ref<FormInstance>()
const submitInfos = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            isLogin.value = true
            await localForage.setItem(userInfosKey, JSON.stringify(userInfos.value))
            emits("isLoginHandle", isLogin.value)
            ElMessage({
                message: '注册成功',
                type: 'success',
            })

        } else {
            ElMessage({
                message: '注册失败,请将表单填写完整',
                type: 'error',
            })
        }
    })
}
</script>