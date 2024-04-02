<!-- pages/404.vue -->
<template>
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you are looking for isn't available.</p>
      <NuxtLink class="button" to="/">Go Home</NuxtLink>
    </div>
  </template>
  
  <script setup>
  // Any script here
  </script>
  
  <style scoped lang="less">
  div {
    text-align: center;
    margin: 50px auto;
  }

  .button {
    border-radius: 50px;
    padding: 10px 15px;
    color: #fff;
    white-space: nowrap;
    transition: all .3s ease;
    background-color: #dc602e;
    &:hover {
      background-color: #2275b5;
    }
}
  </style>