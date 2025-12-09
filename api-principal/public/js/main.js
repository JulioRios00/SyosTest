requirejs.config({
    baseUrl: '/js',
    urlArgs: 'bust=' + (new Date()).getTime(),
    paths: {
        'tinybone': '/shared/tinybone',
        'text': 'libs/text',
        'lodash': 'libs/lodash.min',
        'safe': 'libs/safe',
        'md5': 'libs/md5',
        'dust.core': 'libs/dust-core.min',
        'jquery': 'libs/jquery.min',
        'jquery-cookie': 'libs/jquery.cookie.min'
    },
    shim: {
        'dust.core': {
            exports: 'dust'
        },
        'jquery-cookie': {
            deps: ['jquery'],
            exports: '$.cookie'
        },
        'safe': {
            exports: 'safe'
        },
        'md5': {
            exports: 'md5'
        }
    },
    waitSeconds: 30
});

// Bootstrap the application
requirejs(['app'], function(App) {
    'use strict';
    
    var app = new App();
    app.start();
    
});
