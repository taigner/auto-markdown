var io = require('socket.io').listen(8000);
var chokidar = require('chokidar');
var marked = require('marked');
var pygments = require('pygments').colorize;
var fs = require('fs');

function highlighting(code, lang, callback) {
	pygments(code, lang, 'html', function(result) {
  		callback(false, result);
  	});
};

function onFileChanged(socket, path) {
	fs.readFile(path, 'utf8', function (error, data) {
		marked(data, { gfm: true, highlight: highlighting }, function (error, content) {
			socket.emit('fileChanged', {content: content});
		});
	})
};

io.sockets.on('connection', function (socket) {
	var watcher = chokidar.watch(process.argv[2]);
	watcher.on('add', function(path) { onFileChanged(socket, path); });
	watcher.on('change', function(path) { onFileChanged(socket, path); });
});