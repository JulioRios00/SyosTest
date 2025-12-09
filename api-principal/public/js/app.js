define([
    'tinybone/base',
    './views/DashboardView',
    './router'
], function(Base, DashboardView, Router) {
    'use strict';

    var App = Base.Application.extend({
        prefix: '',
        
        constructor: function(options) {
            Base.Application.call(this, options);
            this.router = new Router({ app: this, prefix: '' });
            this.listenTo(this.router, 'route', this.onRoute);
        },

        start: function() {                      
            this.router.navigateTo(window.location.href, { replace: true });
        }
    });

    return App;
});
