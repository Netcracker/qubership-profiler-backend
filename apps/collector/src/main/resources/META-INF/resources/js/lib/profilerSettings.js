var ESCProfilerSettings = window.ESCProfilerSettings || new function() {
    var moment = window.ESCInjected.moment;
    var jqDeParam = window.ESCInjected.jqDeParam;
    var jqParam = window.ESCInjected.jqParam;

    var settings_cookie_domain = window.location.hostname;
    if (/.*?([^.]+\.[^.]+)/.test(settings_cookie_domain))
        settings_cookie_domain = settings_cookie_domain.match(/.*?([^.]+\.[^.]+)$/)[1];
    else
        settings_cookie_domain = undefined;

    var profiler_settings = window.ESCInjected.cookiesGet('profiler_settings');
    var _this = this;
    this.profiler_settings = profiler_settings;

    function ProfilerSettings__save() {
        window.ESCInjected.cookieSet('profiler_settings', jqParam(_this.profiler_settings), {domain: settings_cookie_domain, expires: 30 * 6});
    }
    this.ProfilerSettings__save = ProfilerSettings__save;

    if (profiler_settings) {
        this.profiler_settings = jqDeParam(this.profiler_settings);
        if (!this.profiler_settings.last_save || Number(this.profiler_settings.last_save) < new Date().getTime() - 1000 * 3600 * 24 * 7) {
            this.profiler_settings.last_save = new Date().getTime();
            this.ProfilerSettings__save();
        }
    } else
        this.profiler_settings = {
            millis_format: '400ms'
            , int_format: '1234K'
            , omit_ms: '12000'
            , threaddump_format: 'pct'
            , thr_stack_duration: '1000'
        };

    if (!this.profiler_settings.gc_show_mode) {
        this.profiler_settings.gc_show_mode = 'smart';
    }

    if ((!this.profiler_settings.timezone || 'undefined' === this.profiler_settings.timezone)) {
        var detectedTz = moment.tz.guess();
        if (detectedTz === 'Asia/Baghdad' || detectedTz === 'Asia/Dubai'
            || detectedTz === 'Asia/Yerevan' || detectedTz === 'Asia/Baku') {
            // Safari and FireFox do not support Intl.DateTimeFormat.timeZone
            detectedTz = 'Europe/Moscow';
        }
        this.profiler_settings.timezone = detectedTz;
        this.ProfilerSettings__save();
    }
}

if(typeof module === 'object' && typeof module.exports === 'object') {
    module.exports['ESCProfilerSettings'] = ESCProfilerSettings;
}
window.ESCProfilerSettings = ESCProfilerSettings;
