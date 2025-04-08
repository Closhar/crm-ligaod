module.exports = {
    apps: [
        {
            name: 'CRM_SPORTREP',
            port: '3001',
            exec_mode: 'cluster',
            instances: 'max',
            script: './.output/server/index.mjs'
        }
    ]
}
