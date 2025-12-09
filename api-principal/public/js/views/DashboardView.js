// Dashboard View using TinyBone
define([
    'tinybone/base',
    'text!./templates/dashboard.dust'
], function(Base, dashboardTemplate) {
    'use strict';

    var DashboardView = Base.View.extend({
        template: dashboardTemplate,
        name: 'dashboard',

        initialize: function(options) {
            this.app = options.app;
            this.sensors = [];
            this.alerts = [];
            this.setupAutoRefresh();
        },

        events: {
            'click .refresh-btn': 'onRefreshClick'
        },

        postRender: function() {
            this.loadDashboardData();
        },

        setupAutoRefresh: function() {
            var self = this;
            if (typeof window !== 'undefined') {
                setInterval(function() {
                    self.loadDashboardData();
                }, 30000); // Refresh every 30 seconds
            }
        },

        loadDashboardData: function() {
            var self = this;
            
            fetch('/api/dashboard')
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    if (data.success) {
                        self.sensors = data.data.sensors || [];
                        self.alerts = data.data.recentAlerts || [];
                        self.statistics = data.data.statistics || {};
                        self.renderHTML();
                    } else {
                        throw new Error(data.error || 'Failed to load dashboard data');
                    }
                })
                .catch(function(error) {
                    console.error('Error loading dashboard data:', error);
                    document.getElementById('main-content').innerHTML = '<div style="padding: 20px; color: red;">Error loading dashboard: ' + error.message + '</div>';
                });
        },

        renderHTML: function() {
            var stats = this.statistics || this.calculateStatistics();
            var html = '<div style="padding: 20px; font-family: Arial, sans-serif;">';
            html += '<h1 style="color: #2d3748; margin-bottom: 10px;">SYOS Dashboard</h1>';
            html += '<p style="color: #718096; margin-bottom: 30px;">Real-time Sensor Monitoring System</p>';
            
            html += '<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 30px;">';
            html += '<h2 style="color: #2d3748; margin: 0 0 20px 0;">Register New Sensor</h2>';
            html += '<form id="registerSensorForm" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">';
            html += '<div><label style="display: block; margin-bottom: 5px; color: #4a5568; font-weight: 500;">Sensor Name *</label>';
            html += '<input type="text" name="name" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px;" placeholder="e.g., Sensor-07"></div>';
            html += '<div><label style="display: block; margin-bottom: 5px; color: #4a5568; font-weight: 500;">Location *</label>';
            html += '<input type="text" name="location" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px;" placeholder="e.g., Server Room C"></div>';
            html += '<div><label style="display: block; margin-bottom: 5px; color: #4a5568; font-weight: 500;">Min Temperature (°C) *</label>';
            html += '<input type="number" name="minTemperature" required step="0.1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px;" placeholder="18.0"></div>';
            html += '<div><label style="display: block; margin-bottom: 5px; color: #4a5568; font-weight: 500;">Max Temperature (°C) *</label>';
            html += '<input type="number" name="maxTemperature" required step="0.1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px;" placeholder="24.0"></div>';
            html += '<div><label style="display: block; margin-bottom: 5px; color: #4a5568; font-weight: 500;">Min Humidity (%) *</label>';
            html += '<input type="number" name="minHumidity" required step="0.1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px;" placeholder="40.0"></div>';
            html += '<div><label style="display: block; margin-bottom: 5px; color: #4a5568; font-weight: 500;">Max Humidity (%) *</label>';
            html += '<input type="number" name="maxHumidity" required step="0.1" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px;" placeholder="60.0"></div>';
            html += '<div style="grid-column: span 3; display: flex; gap: 10px; justify-content: flex-end;">';
            html += '<button type="submit" style="background: #667eea; color: white; padding: 10px 24px; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer;">Register Sensor</button>';
            html += '<button type="reset" style="background: #e2e8f0; color: #4a5568; padding: 10px 24px; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer;">Clear</button>';
            html += '</div>';
            html += '</form>';
            html += '<div id="registerMessage" style="margin-top: 15px;"></div>';
            html += '</div>';
            
            html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0;">';
            html += '<div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Total Sensors</h3><p style="font-size: 36px; margin: 0; font-weight: bold;">' + stats.totalSensors + '</p></div>';
            html += '<div style="background: #48bb78; color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Active Sensors</h3><p style="font-size: 36px; margin: 0; font-weight: bold;">' + stats.activeSensors + '</p></div>';
            html += '<div style="background: #f6ad55; color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Total Alerts</h3><p style="font-size: 36px; margin: 0; font-weight: bold;">' + stats.totalAlerts + '</p></div>';
            html += '<div style="background: #fc8181; color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Critical Alerts</h3><p style="font-size: 36px; margin: 0; font-weight: bold;">' + (this.alerts.filter(function(a) { return a.severity === 'CRITICAL'; }).length) + '</p></div>';
            html += '</div>';
            
            html += '<h2>Sensors</h2>';
            html += '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
            html += '<thead><tr style="background: #f7fafc;"><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Name</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Location</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Temperature</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Humidity</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Status</th></tr></thead>';
            html += '<tbody>';
            this.sensors.forEach(function(sensor) {
                html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;">' + sensor.name + '</td>';
                html += '<td style="padding: 12px; border: 1px solid #e2e8f0;">' + sensor.location + '</td>';
                html += '<td style="padding: 12px; border: 1px solid #e2e8f0;">' + (sensor.currentTemperature || 'N/A') + '°C</td>';
                html += '<td style="padding: 12px; border: 1px solid #e2e8f0;">' + (sensor.currentHumidity || 'N/A') + '%</td>';
                html += '<td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="color: ' + (sensor.isActive ? 'green' : 'red') + ';">' + (sensor.isActive ? 'Active' : 'Inactive') + '</span></td></tr>';
            });
            html += '</tbody></table>';
            
            html += '<h2>Recent Alerts</h2>';
            html += '<table style="width: 100%; border-collapse: collapse;">';
            html += '<thead><tr style="background: #f7fafc;"><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Sensor</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Type</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Severity</th><th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Message</th></tr></thead>';
            html += '<tbody>';
            this.alerts.forEach(function(alert) {
                var severityColor = alert.severity === 'CRITICAL' ? '#fc8181' : '#f6ad55';
                html += '<tr><td style="padding: 12px; border: 1px solid #e2e8f0;">' + alert.sensorName + '</td>';
                html += '<td style="padding: 12px; border: 1px solid #e2e8f0;">' + alert.type + '</td>';
                html += '<td style="padding: 12px; border: 1px solid #e2e8f0;"><span style="background: ' + severityColor + '; color: white; padding: 4px 8px; border-radius: 4px;">' + alert.severity + '</span></td>';
                html += '<td style="padding: 12px; border: 1px solid #e2e8f0;">' + alert.message + '</td></tr>';
            });
            html += '</tbody></table>';
            html += '</div>';
            
            var container = document.getElementById('main-content');
            if (container) {
                container.innerHTML = html;
                
                var form = document.getElementById('registerSensorForm');
                if (form) {
                    form.addEventListener('submit', this.handleRegisterSensor.bind(this));
                }
            } else {
                console.error('main-content element not found!');
            }
        },

        handleRegisterSensor: function(e) {
            e.preventDefault();
            var self = this;
            var form = e.target;
            var formData = new FormData(form);
            
            var sensorData = {
                name: formData.get('name'),
                location: formData.get('location'),
                minTemperature: parseFloat(formData.get('minTemperature')),
                maxTemperature: parseFloat(formData.get('maxTemperature')),
                minHumidity: parseFloat(formData.get('minHumidity')),
                maxHumidity: parseFloat(formData.get('maxHumidity'))
            };
            
            var messageEl = document.getElementById('registerMessage');
            messageEl.innerHTML = '<p style="color: #4299e1;">Registering sensor...</p>';
            
            fetch('/api/sensors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sensorData)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.success) {
                    messageEl.innerHTML = '<p style="color: #48bb78; padding: 10px; background: #f0fff4; border-radius: 4px;">✓ Sensor registered successfully: ' + data.data.name + '</p>';
                    form.reset();
                    // Reload dashboard data after 2 seconds
                    setTimeout(function() {
                        self.loadDashboardData();
                    }, 2000);
                } else {
                    messageEl.innerHTML = '<p style="color: #f56565; padding: 10px; background: #fff5f5; border-radius: 4px;">✗ Error: ' + (data.error || 'Failed to register sensor') + '</p>';
                }
            })
            .catch(function(error) {
                console.error('Error registering sensor:', error);
                messageEl.innerHTML = '<p style="color: #f56565; padding: 10px; background: #fff5f5; border-radius: 4px;">✗ Error: ' + error.message + '</p>';
            });
        },

        calculateStatistics: function() {
            var totalSensors = this.sensors.length;
            var activeSensors = this.sensors.filter(function(s) { 
                return s.isActive; 
            }).length;
            var totalAlerts = this.alerts.length;
            var criticalAlerts = this.alerts.filter(function(a) { 
                return a.severity === 'CRITICAL'; 
            }).length;

            return {
                totalSensors: totalSensors,
                activeSensors: activeSensors,
                totalAlerts: totalAlerts,
                criticalAlerts: criticalAlerts
            };
        },

        onRefreshClick: function(e) {
            e.preventDefault();
            this.loadDashboardData();
        },

        populateTplCtx: function(ctx, cb) {
            ctx = ctx || {};
            ctx.sensors = this.sensors;
            ctx.alerts = this.alerts;
            ctx.statistics = this.calculateStatistics();
            cb(ctx);
        }
    });

    return DashboardView;
});
