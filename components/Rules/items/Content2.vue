<template>

    <el-col v-if="userGrades!=null" :span="24" style="flex-direction: row;">
        <el-row style="padding: 0 20px;margin: 20px 0;" :gutter="20">
            <el-col :span="12" class="infos-box">
                <el-tag>学号</el-tag>{{userGrades.id}}
            </el-col>
            <el-col :span="12" class="infos-box">
                <el-tag>姓名</el-tag>{{userGrades.name}}
            </el-col>
            <el-col :span="12" class="infos-box">
                <el-tag>加权成绩</el-tag>{{userGrades.gradeResult}}
            </el-col>
            <el-col :span="12" class="infos-box">
                <el-tag>综测排名</el-tag>{{userGrades.gradeRank}}
            </el-col>
            <el-col :span="12" class="infos-box">
                <el-tag>原挂科数目</el-tag>{{userGrades.lowGradeOldCount}}
            </el-col>
            <el-col :span="12" class="infos-box">
                <el-tag>现挂科数目</el-tag>{{userGrades.lowGradeNewCount}}
            </el-col>
        </el-row>
        <el-table border style="width: calc(100% - 60px);margin: 0 30px;" :data="userGrades.gradeList.map(
        (v:string,i:number)=>({name: v, label:v+'('+userGrades.gradeWeighted[i]+')', value:userGrades.grades[i]}))">
            <el-table-column te prop="label" label="课程(权重)" />
            <el-table-column te prop="value" label="分数" />
        </el-table>

    </el-col>

</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus";
import assessmentRules from "~~/assets/datas/assessmentRules.json";
import localForage from "~~/utils/localForage";
const props = defineProps({
    userGrades: {
        type: Object,
        default: null
    },
})

const emits = defineEmits(["submitContent2"])

const Content2FormKey = assessmentRules[1].ruleName;

watch(props, async (value) => {
    if (value.userGrades != null) {
        if (JSON.parse(await localForage.getItem(Content2FormKey)) != null) {

        } else {
            try {
                // 存储有用数据
                emits("submitContent2", {
                    label: assessmentRules[1].label,
                    formResult: props.userGrades,
                    result: props.userGrades.gradeResult,
                    resultT: props.userGrades.gradeResult * assessmentRules[1].weighted,
                    lowGradeOldCount: props.userGrades.lowGradeOldCount,
                    lowGradeNewCount: props.userGrades.lowGradeNewCount,
                    scores: assessmentRules[1].scores,
                    weighted: assessmentRules[1].weighted
                })
            } catch (error) {
                // 账号不存在
                console.log(error);
            }
        }

    }
})

</script>

<style scoped>
.infos-box {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 160px;
}
</style>