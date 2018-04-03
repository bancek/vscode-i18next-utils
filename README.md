# i18next utils

i18next utils

## Make translatable

```html
<template>
    <div>
        <span>It's a text</span>
    </div>
</template>
```
```html
<template>
    <div>
        <span>{{ $t('It\\\'s a text') }}</span>
    </div>
</template>
```

```javascript
export default {
    computed: {
        title() {
            return 'My title';
        },
    },
};
```
```javascript
export default {
    computed: {
        title() {
            return this.$t('My title');
        },
    },
};
```
