<template>
  <label class="toggle-switch">
    <input
        :checked="value"
        :disabled="readonly"
        type="checkbox"
        @change="$emit('input', $event.target.checked)"
    />
    <span class="toggle-slider"></span>
  </label>
</template>

<script>
export default {
  name: 'ToggleField',
  props: {
    value: Boolean,
    readonly: Boolean,
    options: Object
  }
};
</script>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2196F3;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

input:disabled + .toggle-slider {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>