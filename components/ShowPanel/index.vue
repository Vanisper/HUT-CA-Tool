<template>
    <el-row v-if="totalResult!=null">
        <el-col v-if="totalResult.qualities" style="min-width: 700px;margin-top: 30px;">
            <el-col style="text-align: center">
                <b>{{totalResult.qualities.label}}({{totalResult.qualities.weighted}})</b>
            </el-col>
            <hr />
            <el-row>
                <el-col v-for="(header,index) in ['指标','减分项目','项目时间','-分值']"
                        :span="Math.round(24/['指标','减分项目','项目时间','-分值'].length)" style="text-align: center;">
                    {{header}}
                </el-col>
            </el-row>
            <hr />
            <el-row>
                <el-col v-for="(value,index) in totalResult.qualities.formResult" :span="24"
                        style="text-align: center;">
                    <el-row style="align-items: center;">
                        <el-col :span="24/4"
                                style="border-right: 1px solid;display: flex;justify-content: center;align-items: center;flex-direction: column;">
                            <el-row>
                                {{index}}
                                {{totalResult.qualities.resultGroupT[index].type}}
                                {{'('+(assessmentRules[0].items[index] as IcommonRuleItems).scoresMax+')'}}
                            </el-row>
                            <el-col
                                    style="width: 100%;color: #d501018c;font-size: 6px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                                超出该小项的分值限制的按分值限制算
                            </el-col>
                        </el-col>
                        <el-col :span="24/4*3" style="">
                            <el-col v-for="(val,idx) in value">
                                <el-row>
                                    <el-col :span="24/3"
                                            v-for="(v, i) in [`${((assessmentRules[0].items[index] as IcommonRuleItems).content[idx]).rule}`,'2021/09/01~2022/08/31',val.result]"
                                            style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;text-align: center;"
                                            :title="v">
                                        {{v}}
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-col>
                    </el-row>
                    <hr />
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24/4" style="border-right: 1px solid;text-align: center;">
                    <b>总计</b>
                </el-col>
                <el-col :span="24/4*3" style="text-align: center">
                    <b>{{totalResult.qualities.result}}</b>
                </el-col>
            </el-row>
            <hr />
            <el-row>
                <el-col :span="24/4" style="border-right: 1px solid;text-align: center;">
                    <b>加权结果</b>
                </el-col>
                <el-col :span="24/4*3" style="text-align: center;">
                    <b>{{totalResult.qualities.resultT}}</b>
                </el-col>
            </el-row>
            <hr />
        </el-col>

        <el-col v-if="totalResult.wisdom" style="min-width: 700px;margin-top: 30px;">
            <el-col style="text-align: center">
                <b>{{totalResult.wisdom.label}}({{totalResult.wisdom.weighted}})</b>
            </el-col>
            <hr />
            <el-row>
                <el-col :span="24/4"
                        style="border-right: 1px solid;display: flex;justify-content: center;align-items: center;">
                    <b>总计</b>
                </el-col>
                <el-col :span="24/4*3" style="display: flex;justify-content: center;align-items: center;">
                    <b>{{totalResult.wisdom.result.toFixed(2)}}</b>
                </el-col>
            </el-row>
            <hr />
            <el-row>
                <el-col :span="24/4"
                        style="border-right: 1px solid;display: flex;justify-content: center;align-items: center;">
                    <b>加权结果</b>
                </el-col>
                <el-col :span="24/4*3" style="display: flex;justify-content: center;align-items: center;">
                    <b>{{totalResult.wisdom.resultT.toFixed(2)}}</b>
                </el-col>
            </el-row>
            <hr />
        </el-col>
        <el-col v-if="totalResult.innovationPractice" style="min-width: 700px;margin-top: 30px;">
            <el-col style="text-align: center">
                <b>{{totalResult.innovationPractice.label}}({{totalResult.innovationPractice.weighted}})</b>
            </el-col>
            <hr />
            <el-row>
                <el-col v-for="(header,index) in ['序号','加分项目名称','项目时间','+分值']"
                        :span="Math.round(24/['序号','加分项目名称','项目时间','+分值'].length)" style="text-align: center;">
                    {{header}}
                </el-col>
            </el-row>
            <hr />
            <el-row>
                <!-- :span="Math.round(24/['序号','加分项目名称','项目时间','+分值'].length)" -->
                <el-col v-for="(value,index) in totalResult.innovationPractice.formResult" :span="24"
                        style="text-align: center;">
                    <el-row style="justify-content: center;align-items: center;">
                        <el-col :span="24/4"
                                style="border-right: 1px solid;display: flex;justify-content: center;align-items: center;">
                            {{index}}{{value[0].type}}</el-col>
                        <el-col :span="24/4*3" style="">
                            <el-col v-for="(val,idx) in value">
                                <el-row>
                                    <el-col :span="24/3"
                                            style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"
                                            v-for="(v, i) in [`[${(val.level.split('-') as string[]).slice(0,-1).join('-')}]${val.name}`,val.time.map((v:Date)=>dayjs(v).format('YYYY/MM/DD')).join('~'),val.level.split('-')[val.level.split('-').length-1]]">
                                        {{v}}
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-col>
                    </el-row>
                    <hr />
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24/4" style="border-right: 1px solid;text-align: center;">
                    <b>总计</b>
                </el-col>
                <el-col :span="24/4*3" style="text-align: center">
                    <b>{{totalResult.innovationPractice.result}}</b>
                </el-col>
            </el-row>
            <hr />
            <el-row>
                <el-col :span="24/4" style="border-right: 1px solid;text-align: center;">
                    <b>加权结果</b>
                </el-col>
                <el-col :span="24/4*3" style="text-align: center;">
                    <b>{{totalResult.innovationPractice.resultT}}</b>
                </el-col>
            </el-row>
            <hr />
        </el-col>

        <el-col style="min-width: 700px;margin-top: 30px;">
            <el-col style="text-align: center">
                <b>统计</b>
            </el-col>
            <hr />
            <el-row>
                <el-col :span="24/4" style="border-right: 1px solid;text-align: center;">
                    <b>总计</b>
                </el-col>
                <el-col :span="24/4*3" style="text-align: center">
                    <b>{{(totalResult.innovationPractice?.resultT+totalResult.wisdom?.resultT+totalResult.qualities?.resultT).toFixed(2)}}</b>
                </el-col>
            </el-row>
            <hr />
        </el-col>
    </el-row>
</template>


<script lang="ts" setup>
import dayjs from "dayjs";
import assessmentRules from "~~/assets/datas/assessmentRules.json"
import { IcommonRuleItems } from "~~/types/types";

defineProps({
    totalResult: {
        type: Object,
        default: null
    }
})


</script>