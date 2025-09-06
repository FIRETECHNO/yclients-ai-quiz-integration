<script setup lang="ts"></script>
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8">
        <v-card class="elevation-12 rounded-lg text-center pa-4">
          <v-card-title class="text-h4 text-wrap font-weight-bold my-4">
            Добро пожаловать в я хз как называется!
          </v-card-title>
          <v-icon size="200" color="green" class="my-4">
            mdi-check-circle
          </v-icon>

          <v-card-text class="text-medium-emphasis">
            Ваш персональный AI-ассистент готов помочь вам с записью, ответить
            на вопросы и подобрать лучшие услуги.
          </v-card-text>

          <v-card-actions class="justify-center pa-4">
            <MainButton @click=""> Начать </MainButton>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
