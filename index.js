var express = require('express')
var app = express()
var bodyParser = require('body-parser')

app.use(bodyParser.json());
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})

app.post('/', function (req, res) {
    const repo = req.body["repository"];
    const commit = req.body["head_commit"];
    const gitURL = repo["clone_url"];
    const gitName = repo["name"];
    const sha = commit["id"];
    const statusURL = repo["statuses_url"];
    cloneRepo(gitURL);
    res.send('hello world')
})

app.listen(8080);

const cloneRepo = (gitURL) => {
    const { spawn } = require('child_process');
    const git = spawn('git', ['clone', gitURL]);
    git.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
      
      git.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });
      
      git.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
}