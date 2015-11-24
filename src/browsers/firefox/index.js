var data = require('sdk/self').data,
 pageMod = require('sdk/page-mod'),
   prefs = require('sdk/simple-prefs').prefs,
 domains = ['https://github.com/*'];

pageMod.PageMod({
  include: domains,
  contentScriptFile : [data.url('jquery.min.js'),
                       data.url('rx.min.js'),
                       data.url('rx.jquery.js'),
                       data.url('coveralls.js')],
  contentStyleFile  : [data.url('coveralls.css')],
  contentScriptWhen : 'end',
  onAttach: function(worker) {
    console.log('attached');
    worker.port.emit('preferences', prefs);
  }
});