<template>
  <div class="flex flex-col gap-4">
    <div class="h-96 w-full bg-gray-900 rounded-lg overflow-hidden">
      <VueCropper
        ref="cropper"
        :img="imgSrc"
        :outputSize="option.size"
        :outputType="option.outputType"
        :info="true"
        :full="option.full"
        :canMove="option.canMove"
        :canMoveBox="option.canMoveBox"
        :fixed="option.fixed"
        :fixedNumber="option.fixedNumber"
        :original="option.original"
        :autoCrop="option.autoCrop"
        :autoCropWidth="option.autoCropWidth"
        :autoCropHeight="option.autoCropHeight"
        :centerBox="option.centerBox"
        :high="option.high"
        :maxImgSize="option.maxImgSize"
      />
    </div>
    
    <div class="flex justify-center gap-4">
      <BaseButton 
        variant="outline" 
        @click="changeScale(1)" 
        label="+"
        class="w-10 h-10 p-0 flex items-center justify-center font-bold text-xl"
      />
      <BaseButton 
        variant="outline" 
        @click="changeScale(-1)" 
        label="-" 
        class="w-10 h-10 p-0 flex items-center justify-center font-bold text-xl"
      />
      <BaseButton 
        variant="outline" 
        @click="rotateLeft" 
        label="↺" 
        class="w-10 h-10 p-0 flex items-center justify-center font-bold text-xl"
      />
      <BaseButton 
        variant="outline" 
        @click="rotateRight" 
        label="↻" 
        class="w-10 h-10 p-0 flex items-center justify-center font-bold text-xl"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  imgSrc: string;
}>();

const cropper = ref();

const option = reactive({
  size: 1,
  full: false,
  outputType: 'png',
  canMove: true,
  fixedBox: false,
  original: false,
  canMoveBox: true,
  autoCrop: true,
  // Square crop for avatar
  autoCropWidth: 300,
  autoCropHeight: 300,
  centerBox: true,
  high: true,
  maxImgSize: 2000,
  fixed: true,
  fixedNumber: [1, 1]
});

const changeScale = (num: number) => {
  cropper.value?.changeScale(num);
};

const rotateLeft = () => {
  cropper.value?.rotateLeft();
};

const rotateRight = () => {
  cropper.value?.rotateRight();
};

const getCropBlob = (): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    cropper.value?.getCropBlob((data: Blob) => {
      if (data) {
        resolve(data);
      } else {
        reject(new Error('Failed to get crop blob'));
      }
    });
  });
};

defineExpose({
  getCropBlob
});
</script>
