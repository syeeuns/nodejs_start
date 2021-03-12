var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');



var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;

  if (pathname === '/') {
    if (!title) {
      fs.readdir('./data', function (err, filelist) {
        title = 'Welcome';
        var description = 'Hello, node.js';
        var list = template.list(filelist);
        var control = `
          <a href="/create">create</a>
          `;
        var html = template.html(title, description, list, control);
        response.writeHead(200);
        response.end(html);
      })
    }
    else {
      fs.readdir('./data', function (err, filelist) {
        var list = template.list(filelist);
        var filterdPath = path.parse(queryData.id).base;
        fs.readFile(`data/${filterdPath}`, 'utf8', function (err, description) {
          var control = `
          <a href="/create">create</a>
          <a href="/update?id=${title}">update</a>
          <form action="/delete_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <input type="submit" value="delete">
          </form>
          `;
          var html = template.html(title, description, list, control);
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  }
  else if (pathname === '/create') {
    if (!title) {
      fs.readdir('./data', function (err, filelist) {
        title = 'WEB - create';
        var list = template.list(filelist);
        var description = `
            <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><textarea name="description" placeholder="description"></textarea></p>
            <p><input type="submit"></p>
            </form>
            `;
        var html = template.html(title, description, list, '');
        response.writeHead(200);
        response.end(html);
      })
    }
  }
  else if (pathname === '/create_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, { Location: `/?id=${encodeURI(title)}` });
        response.end();
      });
    });
  }
  else if (pathname === '/update') {
    fs.readdir('./data', function (err, filelist) {
      var list = template.list(filelist);
      var filterdPath = path.parse(queryData.id).base;
      fs.readFile(`data/${filterdPath}`, 'utf8', function (err, description) {
        var description = `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p><textarea name="description" placeholder="description">${description}</textarea></p>
            <p><input type="submit"></p>
            </form>
        `;
        var control = `
        <a href="/create">create</a>
        <a href="/update?id=${title}">update</a>
        `;
        var html = template.html(title, description, list, control);
        response.writeHead(200);
        response.end(html);
      });
    });
  }
  else if (pathname === '/update_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function (err) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
          response.writeHead(302, { Location: `/?id=${encodeURI(title)}` });
          response.end();
        });
      });
    });
  }
  else if (pathname === '/delete_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id;
      var filterdID = path.parse(id).base;
      fs.unlink(`data/${filterdID}`, function (err) {
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  }
  else {
    response.writeHead(404);
    response.end("not found");
  }
});
app.listen(3000);