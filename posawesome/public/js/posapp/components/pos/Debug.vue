<template>
    <div class="debug-page">
        <h2>Debug Page</h2>
        <p>This is the debug page for the POS application.</p>
        <p><strong>Shift Status:</strong> {{ shiftStatus || 'N/A' }}</p>
        <p><strong>POS Profile:</strong> {{ posProfileName || 'N/A' }}</p>
    </div>
</template>

<script>
    export default{
        name:'Debug',
        props:{
            shiftStatus:{
                type:String,
                required:false,
            },
            posProfileName:{
                type:String,
                required:false,
            },
        },
    };
</script>

<style scoped>
    .debug-page{
        padding:10px;
    }
</style>