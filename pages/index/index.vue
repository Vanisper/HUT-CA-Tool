<template>
    <div class="common-layout">
        <el-container>
            <el-header>
                <el-alert title="请录入你的信息" type="warning" show-icon v-if="!isLogin" />
                <el-alert title="请录入其他信息" type="info" show-icon v-else />
            </el-header>
            <el-main v-if="!isLogin">
                <Login :user-infos="userInfos" @isLoginHandle="isLoginHandle" />
            </el-main>

            <el-main v-else>
                <el-tabs :tab-position="!isOpenMenu?'top':'left'" class="demo-tabs">
                    <el-tab-pane label="基本信息">
                        <el-scrollbar height="100%">
                            <el-table :data="Object.values(userInfos)" style="width: 100%">
                                <el-table-column prop="label" label="信息项" />
                                <el-table-column prop="value" label="信息值" />
                            </el-table>
                            <el-divider></el-divider>
                            <el-table v-if="Object.values(totalResult).every((value,index,arr)=>(value!=null))"
                                      :data="Object.values(totalResult)" style="width: 100%" show-summary sum-text="合计"
                                      :summary-method="getSummaries" @row-click="rowClick">
                                <el-table-column prop="label" label="大类" />
                                <el-table-column prop="resultT" label="权重结果" />
                                <el-table-column prop="result" label="原结果" />
                                <el-table-column prop="weighted" label="加权" />
                                <el-table-column prop="scores" label="总分" />
                            </el-table>
                            <el-dialog v-if="gridData!=null" v-model="dialogTableVisible" title="详细展示">
                                <el-table :data="gridData">
                                    <el-table-column v-if="gridData!=null" v-for="(vv) in Object.keys(gridData[0])"
                                                     :property="vv" :label="vv" />
                                </el-table>
                            </el-dialog>
                            <el-row style="justify-content: center;margin-top: 20px;">
                                <el-button type="danger" @click="clearCache">清除缓存、退出登录</el-button>
                            </el-row>
                        </el-scrollbar>
                    </el-tab-pane>
                    <el-tab-pane v-for="(acRule, index) in (assessmentRules as IACRule[])" :label="acRule.label">
                        <el-scrollbar height="100%">
                            <el-row v-if="index==0">
                                <RulesItemsDescription :acRule="acRule" />
                                <Content1 :acRule="acRule" @submit-content1="getContent1Form" />
                            </el-row>
                            <el-row v-else-if="index==1">
                                <RulesItemsDescription :acRule="acRule" />
                                <Content2 :userGrades="userGrades" @submit-content2="getContent2Form" />
                            </el-row>
                            <el-row v-else-if="index==2">
                                <RulesItemsDescription :acRule="acRule" />
                                <Content3 :acRule="acRule" @submit-content3="getContent3Form" />
                            </el-row>
                        </el-scrollbar>
                    </el-tab-pane>
                    <el-tab-pane label="功能区">
                        <el-scrollbar height="100%">
                            <el-col v-if="isAdmin==1">
                                <el-row>
                                    <el-button @click="clearAdmin">退出管理员</el-button>
                                </el-row>
                            </el-col>
                            <el-col v-else-if="isAdmin==-1">
                                <el-row>
                                    <el-button @click="isAdminHandle">管理员验证</el-button>
                                </el-row>
                            </el-col>
                            <el-col>
                                <el-row class="tools-box">
                                    <el-button @click="exportCP">导出创新实践证明材料</el-button>
                                </el-row>
                                <el-row class="tools-box">
                                    <el-button @click="html2Canvas">生成综测个人评定</el-button>
                                </el-row>
                                <ShowPanel id="capture" :total-result="totalResult" />
                            </el-col>
                        </el-scrollbar>
                    </el-tab-pane>
                </el-tabs>
            </el-main>
        </el-container>
    </div>
</template>

<script lang="ts" setup>
import { IACRule, ICPExport, ICPExportWithUser, ICPResultItem, IstudentGrade, IuserInfos } from '~~/types/types';
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import assessmentRules from "~~/assets/datas/assessmentRules.json";
import adminList from "~~/assets/config/admin.json";
import Content1 from '~~/components/Rules/items/Content1.vue';
import Content2 from '~~/components/Rules/items/Content2.vue';
import Content3 from '~~/components/Rules/items/Content3.vue';
import ShowPanel from '~~/components/ShowPanel/index.vue';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import JSZip from "jszip";
import FileSaver from "file-saver";
import { base64FileHeaderMapper, convertImgToBase64 } from '~~/utils';
import localForage from '~~/utils/localForage';
import { htmlToCanvas } from "~~/utils/generateImg";
import { switchCase } from '@babel/types';

interface User {
    label: string;
    resultT: number;
    result: number;
    weighted: number;
    scores: number;
}

interface SummaryMethodProps<T = User> {
    columns: TableColumnCtx<T>[]
    data: T[]
}

const isOpenMenu = ref(false)
const isLogin = ref(false)
const isAdmin = ref(0)
const clearAdmin = () => {
    localForage.removeItem("isAdmin")
    isAdmin.value = -1;
}
const isAdminHandle = () => {
    ElMessageBox.prompt('你登陆的是管理员账号,现在验证密码(你也可以跳过该选项,只不过缺少部分权限)', 'Tip', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: (v) => v == adminList[adminList.map(v => v.id).indexOf(userInfos.value.id.value)].password,
        // inputPattern:
        //     /[ms848789]/,
        inputErrorMessage: '密码不正确',
    })
        .then(({ value }) => {
            ElMessage({
                type: 'success',
                message: `欢迎你管理员：${adminList[adminList.map(v => v.id).indexOf(userInfos.value.id.value)].name}`,
            })
            isAdmin.value = 1;
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '取消管理员验证',
            })
            isAdmin.value = -1;
        })
}
const isLoginHandle = (value: boolean) => isLogin.value = value
const clearCache = () => {
    isLogin.value = false;
    isAdmin.value = 0;
    dialogTableVisible.value = false;
    localForage.clear();
}

const userInfos = ref<IuserInfos>({
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
})
const userGrades = ref<null | IstudentGrade>(null)

const Content1FormKey = assessmentRules[0].ruleName;
const getContent1Form = async (value: any) => {
    // 获取子组件数据并存档
    await localForage.setItem(Content1FormKey, JSON.stringify(value))
    totalResult.value.qualities = JSON.parse(await localForage.getItem(assessmentRules[0].ruleName))
}

const Content2FormKey = assessmentRules[1].ruleName;
const getContent2Form = async (value: any) => {
    // 获取子组件数据并存档
    await localForage.setItem(Content2FormKey, JSON.stringify(value))
    totalResult.value.wisdom = JSON.parse(await localForage.getItem(assessmentRules[1].ruleName))
}

const Content3FormKey = assessmentRules[2].ruleName;
const getContent3Form = async (value: any) => {
    // 获取子组件数据并存档
    await localForage.setItem(Content3FormKey, JSON.stringify(value))
    totalResult.value.innovationPractice = JSON.parse(await localForage.getItem(assessmentRules[2].ruleName))
}

const totalResult = ref()
onMounted(async () => {
    window.onload = () => {
        if (document.documentElement.clientWidth <= 600) {
            isOpenMenu.value = false
        } else {
            isOpenMenu.value = true
        }
    }
    window.onresize = () => {
        if (document.documentElement.clientWidth <= 600) {
            isOpenMenu.value = false
        } else {
            isOpenMenu.value = true
        }
    }
    totalResult.value = {
        qualities: JSON.parse(await localForage.getItem(assessmentRules[0].ruleName)),
        wisdom: JSON.parse(await localForage.getItem(assessmentRules[1].ruleName)),
        innovationPractice: JSON.parse(await localForage.getItem(assessmentRules[2].ruleName)),
    }
    if (JSON.parse(await localForage.getItem("studentInfos")) == null) {
        ElNotification({
            title: '未检测到登录信息',
            message: '已加载了初始数据,请根据样例填写你的信息<br />当然你也可以直接用这个信息登录试用一下',
            dangerouslyUseHTMLString: true,
            type: 'warning',
        })
    } else {

        isLogin.value = true
        userInfos.value = JSON.parse(await localForage.getItem("studentInfos"));
        ElMessage({
            message: '已自动加载上次用户数据',
            type: 'success',
        })
    }
})

const getSummaries = (param: SummaryMethodProps) => {
    const { columns, data } = param
    const sums: string[] = []
    columns.forEach((column, index) => {
        if (index === 0) {
            sums[index] = '总计'
            return
        }
        const values = data.map((item) => Number(item[column.property]))
        if (!values.every((value) => Number.isNaN(value))) {
            sums[index] = `${(values.reduce((prev, curr) => {
                const value = Number(curr)
                if (!Number.isNaN(value)) {
                    return prev + curr
                } else {
                    return prev
                }
            }, 0)).toFixed(2)}`
        } else {
            sums[index] = 'N/A'
        }
    })
    return sums
}
const dialogTableVisible = ref(false)
const gridData = ref(null)
const rowClick = (row: User, column: any, event: any) => {
    if (gridData.value != null || gridData.value != undefined) {
        gridData.value = null;
    }
    const t = setTimeout(() => {
        switch (row.label) {
            case "智育素质":
                gridData.value = (userGrades.value.gradeList.map((v: string, i: number) => ({ name: v, weighted: userGrades.value.gradeWeighted[i], value: userGrades.value.grades[i] })));
                break;
            case "德育素质":
                gridData.value = Object.values(totalResult.value as Object).filter(v => v.label == row.label)[0].resultGroupT;
                break;
            case "创新与实践能力":
                gridData.value = Object.values(totalResult.value as Object).filter(v => v.label == row.label)[0].resultGroupT;
                break;
        }
        dialogTableVisible.value = true;
        clearTimeout(t);
    }, 0);

}

const exportCP = async () => {
    const jsonData: ICPExportWithUser = {
        ...JSON.parse(JSON.stringify(totalResult.value.innovationPractice)),
        user: userInfos.value.id.value + ''
    }

    if (jsonData.formResult != null) {
        // 采用base64
        const fileList_base64 = [...[...jsonData.formResult.map(v => v.map(v => v.file.map(v => {
            const base64 = v.url.replace(/^data:image\/\w+;base64,/, "")
            return {
                base64: base64,
                name: v.name + base64FileHeaderMapper(base64)
            }
        })))]];
        // 排除无图奖项
        if (!(fileList_base64[0][0].length == 0 && fileList_base64.length == 1)) {
            // 创建JSzip对象      
            const zip = JSZip();
            // file 参数一名字 参数二 文件内容或文件流 参数三文件流格式 一般不用改动 
            // 创建说明文件
            zip.file("infos.json", `${JSON.stringify(jsonData, null, "\t")}\n`);
            // folder方法为创建文件夹 ，这里创建名字为images的文件夹
            const img = zip.folder("images");
            fileList_base64.forEach((value, index, array) => {
                value.forEach((val, idx, arr) => {
                    val.forEach((v, i, a) => {
                        img.file(v.name, v.base64 as string, { base64: true })
                        if (i == a.length - 1 && idx == arr.length - 1 && index == array.length - 1) {
                            zip.generateAsync({ type: "blob" })
                                .then((content) => {
                                    FileSaver.saveAs(content, jsonData.user + '.zip')
                                });
                        }
                    })
                })
            })
        } else {
            ElMessage({
                message: '请填写创新实践部分的内容o',
                type: 'error',
            })
        }
    } else {
        ElMessage({
            message: '请填写创新实践部分的内容',
            type: 'error',
        })
    }
}

const html2Canvas = async () => {
    let el = document.querySelector('#capture') as HTMLElement;
    let markImg = (await htmlToCanvas(el) as HTMLCanvasElement);
    let data = markImg.toDataURL();
    FileSaver.saveAs(data, '综测个人评定结果' + userInfos.value.id.value + userInfos.value.name.value + '.png')
}

const studentGradesKey = "studentGrades"
watch(isLogin, async () => {

    if (isLogin.value) {
        if (adminList.map(v => v.id).indexOf(userInfos.value.id.value) != -1) {
            isAdmin.value = -1;
        }
        if (JSON.parse(await localForage.getItem(studentGradesKey)) != null) {
            try {
                userGrades.value = JSON.parse(await localForage.getItem(studentGradesKey))
                ElMessage({
                    message: '已获取用户成绩单',
                    type: 'info',
                })
            } catch (error) {
                // 说明未注册
                ElMessage({
                    message: '该用户可能未在后台系统中<br /><br />请联系管理员(qq: 273266469)<br /><br />或者自行检查学号',
                    dangerouslyUseHTMLString: true,
                    type: 'error'
                })
                clearCache();
            }
        } else {
            const { data } = await useFetch(() => "/api/v1/UserData");
            data.value.code == 1 && (userGrades.value = data.value.data.filter((value) => value.id == userInfos.value.id.value && value)[0]);
            await localForage.setItem(studentGradesKey, JSON.stringify(userGrades.value));
            try {
                if (await localForage.getItem(studentGradesKey) == null) {
                    throw '用户未在名单中';
                }
            } catch (error) {
                // 说明未注册
                ElMessage({
                    message: '该用户可能未在后台系统中<br /><br />请联系管理员(qq: 273266469)<br /><br />或者自行检查学号',
                    dangerouslyUseHTMLString: true,
                    type: 'error'
                })
                clearCache();
            }
        }
    }
}, {
    immediate: false
})

watch(isAdmin, (value) => {
    if (value == -1) {
        isAdminHandle()
    }
})
</script>


<style scoped>
.tools-box {
    justify-content: center;
    align-items: center;
    margin-top: 25px;
}
</style>