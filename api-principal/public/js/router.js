// Client-side router using TinyBone
define([
    'tinybone/base',
    './views/DashboardView'
], function(Base, DashboardView) {
    'use strict';

    var Router = Base.Router.extend({
        constructor: function(options) {
            Base.Router.call(this, options);
            this.app = options.app;
            this.setupRoutes();
        },

        setupRoutes: function() {
            var self = this;

            this.get('/dashboard', function(req, res) {
                self.renderDashboard(req, res);
            });

            // Default route
            this.get('/', function(req, res) {
                self.renderDashboard(req, res);
            });
        },

        renderDashboard: function(req, res) {
            var view = new DashboardView({
                app: this.app
            });
            
            view.loadDashboardData();
        },

        start: function() {
            if (typeof window !== 'undefined') {
                this.reload();
            }
        }
    });

    return Router;
});
