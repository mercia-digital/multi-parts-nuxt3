<template>
    <div class="dropdown">
        <div class="arrow">
            <i class="fa-solid fa-chevron-down"></i>
        </div>
        <div class="clear" v-if="selectedOption" @click="closeAndClear">
            <i class="fa-solid fa-xmark"></i>
        </div>
        <div class="close-big" v-if="showOptions" @click="showOptions = false">
        </div>
        <input type="text" v-model="searchTerm" @focus="showOptions = true" @input="filterOptions" class="input px-4 py-2 rounded-full" :placeholder="placeholder" />
        <div :class="{ active: showOptions }" class="options rounded shadow">
            <div v-for="option in filteredOptions" :key="option.id" class="option" v-html="highlightMatches(option.name)" @click="selectOption(option)"></div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
//import { useCollectionService } from '~/services/collectionService';

const props = defineProps({
    collection: String,
    placeholder: String,
    selectedValue: String
});

const emit = defineEmits(['optionSelected']);

const searchTerm = ref(props.selectedValue || '');
const showOptions = ref(false);
const options = ref([]);
const selectedOption = ref(props.selectedValue || null);
const filteredOptions = ref([]);

// Function to update filteredOptions based on options and searchTerm
const updateFilteredOptions = () => {
    filteredOptions.value = options.value.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
};

// Watch options and searchTerm to update filteredOptions
watch([options, searchTerm], updateFilteredOptions, { immediate: true });

function selectOption(option) {
    selectedOption.value = option;
    searchTerm.value = option.name;
    showOptions.value = false;
    emit('optionSelected', option);
}

function closeAndClear() {
    selectedOption.value = null;
    searchTerm.value = '';

    emit('optionSelected', { name: '' });
}

defineExpose({
  clearFilters() {
    selectedOption.value = null;
    searchTerm.value = '';

    emit('optionSelected', { name: '' });
  }
});

function highlightMatches(text) {
    if (!searchTerm.value) return text; // Return unmodified text if searchTerm is empty
    const matchRegex = new RegExp(searchTerm.value, 'gi');
    return text.replace(matchRegex, (match) => `<strong>${match}</strong>`);
}

watch(showOptions, (newValue) => {
    if (!newValue) return;
    const handler = (e) => {
        if (!e.target.closest('.dropdown')) {
            showOptions.value = false;
            window.removeEventListener('click', handler);
        }
    };
    window.addEventListener('click', handler);
});

onMounted(async () => {
    try {
        let _sort = '';
        switch (props.collection) {
            case "manufacturers":
                _sort = 'order';
                break;
            case "modalities":
                _sort = 'sort';
                break;
            default:
                _sort = 'name'; // Fallback sort if needed
        }
        const queryParams = new URLSearchParams({
            sort: _sort,
            meta: 'filter_count,total_count',
        });

        const queryString = queryParams.toString();
        const url = `https://order.multi-inc.com/items/${props.collection}?${queryString}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();
        
        options.value = json.data || [];
    } catch (error) {
        console.error("Error fetching collection:", error);
    }
});
</script>

<style lang="less" scoped>
.dropdown {
    position: relative;
    .arrow {
        pointer-events: none;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
    }
    .clear {
        cursor: pointer;
        position: absolute;
        right: 40px;
        top: 50%;
        font-size: 24px;
        transform: translateY(-50%);
        color: firebrick;
        z-index: 1;
    }
    .close-big {
        background-color: #fff;
        opacity: .3;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
    }
}

.input {
    width: 100%;
}

.options {
    position: absolute;
    width: 100%;
    background-color: #fff;
    max-height: 320px;
    overflow-y: auto;
    z-index: 10;

    pointer-events: none;

    transition: all .3s ease;
    opacity: 0;
    top: calc(~"100% - 10px");
    &.active {
        opacity: 1;
        top: calc(~"100% + 10px");
        pointer-events: all;
    }
}

.option {
    padding: 8px;
    cursor: pointer;
}

.option:hover,
.option:active {
    background-color: #f0f0f0;
}
</style>